from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import logging
from sqlalchemy.orm import Session
 
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

from database import get_db, engine
import models
import schemas

# Create all tables on startup (migrations handled by Alembic in production)
models.Base.metadata.create_all(bind=engine)

from fastapi.security import APIKeyHeader
import os
import yfinance as yf

app = FastAPI(
    title="SigInt API",
    description="Semiconductor Signal Intelligence Platform",
    version="0.1.0",
)

API_KEY_NAME = "X-API-Key"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

def get_api_key(api_key: str = Depends(api_key_header)):
    # In production, use a secure secret. For now, check env.
    expected_key = os.environ.get("SIGINT_API_KEY")
    if not expected_key:
        return # Allow if no key set (dev mode)
    if api_key != expected_key:
        raise HTTPException(status_code=403, detail="Invalid API Key")
    return api_key

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://sigint-web.onrender.com", "http://localhost:3000"],  # Updated for Render deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import asyncio
from scoring.builder import SignalBuilder
from database import SessionLocal

from ingestion.engine import IngestionEngine

async def slow_analysis_worker():
    """Background worker that processes one raw signal every 5 minutes."""
    while True:
        try:
            logger.info("Background Worker (Analysis): Checking for signals to analyze...")
            db = SessionLocal()
            try:
                builder = SignalBuilder(db)
                success = builder.analyze_one_skipped()
                if success:
                    logger.info("Background Worker (Analysis): Successfully analyzed one signal.")
                else:
                    logger.info("Background Worker (Analysis): No signals to analyze.")
            finally:
                db.close()
        except Exception as e:
            logger.error(f"Background Worker (Analysis) Error: {e}")
        
        # Wait for 5 minutes before next run (300 seconds)
        await asyncio.sleep(300)

async def ingestion_worker():
    """Background worker that runs ingestion and signal generation every 2 hours."""
    while True:
        try:
            logger.info("Background Worker (Ingestion): Starting run...")
            db = SessionLocal()
            try:
                # 1. Ingest new documents
                engine = IngestionEngine(db)
                engine.run()
                
                # 2. Build signals from new documents
                builder = SignalBuilder(db)
                builder.build_signals_from_unprocessed()
                
                logger.info("Background Worker (Ingestion): Run complete.")
            finally:
                db.close()
        except Exception as e:
            logger.error(f"Background Worker (Ingestion) Error: {e}")
        
        # Run every 2 hours (7200 seconds)
        # Using 2 hours to avoid hitting rate limits on free-tier source APIs
        await asyncio.sleep(7200)

@app.on_event("startup")
async def startup_event():
    # Start the background workers
    asyncio.create_task(slow_analysis_worker())
    asyncio.create_task(ingestion_worker())




# ── Market Pulse ──────────────────────────────────────────────────────────────
@app.get("/market/pulse", response_model=list[schemas.MarketPulseItem], tags=["Market"])
def get_market_pulse(db: Session = Depends(get_db)):
    """Fetch current prices and 24h changes for tracked semiconductor tickers."""
    tickers = db.query(models.Ticker).all()
    if not tickers:
        # Fallback to some defaults if DB is empty
        symbols = ["NVDA", "TSM", "AMD", "INTC", "AVGO", "ARM"]
    else:
        symbols = [t.symbol for t in tickers]
    
    pulse_data = []
    try:
        # Fetch data in bulk
        data = yf.download(symbols, period="1d", interval="1m", progress=False)
        
        for symbol in symbols:
            try:
                ticker_data = yf.Ticker(symbol)
                info = ticker_data.fast_info
                
                price = info.last_price
                # Calculate change from yesterday's close
                prev_close = info.previous_close
                change_pct = ((price - prev_close) / prev_close) * 100 if prev_close else 0
                
                # Find company name
                name = symbol
                if tickers:
                    for t in tickers:
                        if t.symbol == symbol:
                            name = t.company.name
                            break
                
                pulse_data.append({
                    "symbol": symbol,
                    "name": name,
                    "price": round(price, 2),
                    "change": round(change_pct, 2),
                    "status": "up" if change_pct >= 0 else "down"
                })
            except Exception as e:
                logger.error(f"Error fetching data for {symbol}: {e}")
                continue
    except Exception as e:
        logger.error(f"Bulk fetch error: {e}")
        # Return empty list or fallback
    
    return pulse_data


# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/health", response_model=schemas.HealthResponse, tags=["System"])
def health_check():
    return {"status": "ok", "version": "0.1.0"}


# ── Signals ───────────────────────────────────────────────────────────────────
@app.get("/signals/queue", response_model=list[schemas.SignalOut], tags=["Signals"])
def get_signal_queue(
    limit: int = 20,
    db: Session = Depends(get_db),
    _key: str = Depends(get_api_key)
):
    """Return pending signals ordered by total score descending."""
    signals = (
        db.query(models.Signal)
        .filter(models.Signal.status == models.SignalStatus.PENDING)
        .filter(models.Signal.compliance_status == models.ComplianceStatus.GREEN)
        .order_by(models.Signal.score_total.desc())
        .limit(limit)
        .all()
    )
    return [schemas.SignalOut.from_orm_with_scores(s) for s in signals]


@app.get("/signals/watchlist", response_model=list[schemas.SignalOut], tags=["Signals"])
def get_watchlist(
    db: Session = Depends(get_db),
    _key: str = Depends(get_api_key)
):
    """Return signals that have been moved to the watchlist."""
    signals = (
        db.query(models.Signal)
        .filter(models.Signal.status == models.SignalStatus.REVIEWED)
        .join(models.Review)
        .filter(models.Review.decision == "watchlist")
        .order_by(models.Signal.updated_at.desc())
        .all()
    )
    return [schemas.SignalOut.from_orm_with_scores(s) for s in signals]


@app.get("/signals/{signal_id}/compliance", response_model=dict, tags=["Signals"])
def get_compliance_audit(signal_id: int, db: Session = Depends(get_db), _key: str = Depends(get_api_key)):
    """Return a detailed compliance audit for a signal."""
    signal = db.query(models.Signal).filter(models.Signal.id == signal_id).first()
    if not signal:
        raise HTTPException(status_code=404, detail="Signal not found")
        
    return {
        "status": signal.compliance_status,
        "score": signal.score_safety,
        "checks": [
            {"name": "Source Verification", "status": "PASS" if signal.source.credibility_score > 0.6 else "WARN"},
            {"name": "Sentiment Alignment", "status": "PASS" if signal.sentiment in ["bullish", "bearish"] else "WARN"},
            {"name": "Confidence Threshold", "status": "PASS" if signal.score_total > 0.7 else "FAIL"},
            {"name": "Evidence Strength", "status": "PASS" if signal.score_evidence > 0.5 else "WARN"}
        ],
        "timestamp": signal.updated_at
    }


@app.get("/signals/{signal_id}", response_model=schemas.SignalOut, tags=["Signals"])
def get_signal(signal_id: int, db: Session = Depends(get_db), _key: str = Depends(get_api_key)):
    signal = db.query(models.Signal).filter(models.Signal.id == signal_id).first()
    if not signal:
        raise HTTPException(status_code=404, detail="Signal not found")
    return schemas.SignalOut.from_orm_with_scores(signal)



@app.post("/signals/{signal_id}/analyze", tags=["Signals"])
def analyze_signal_endpoint(
    signal_id: int,
    db: Session = Depends(get_db),
    _key: str = Depends(get_api_key)
):
    from scoring.builder import SignalBuilder
    builder = SignalBuilder(db)
    success = builder.analyze_signal(signal_id)
    if not success:
        raise HTTPException(status_code=404, detail="Signal or source not found")
    return {"status": "success"}


@app.post("/signals/{signal_id}/review", response_model=schemas.ReviewOut, tags=["Signals"])
def review_signal(
    signal_id: int,
    review: schemas.ReviewCreate,
    db: Session = Depends(get_db),
    _key: str = Depends(get_api_key)
):
    signal = db.query(models.Signal).filter(models.Signal.id == signal_id).first()
    if not signal:
        raise HTTPException(status_code=404, detail="Signal not found")

    db_review = models.Review(
        signal_id=signal_id,
        reviewer_id=1,  # Hardcoded for MVP; replace with auth
        decision=review.decision,
        notes=review.notes,
    )
    signal.status = models.SignalStatus.REVIEWED
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review


# ── Sources ───────────────────────────────────────────────────────────────────
@app.get("/sources", response_model=list[schemas.SourceOut], tags=["Sources"])
def list_sources(db: Session = Depends(get_db), _key: str = Depends(get_api_key)):
    return db.query(models.Source).filter(models.Source.is_active == True).all()


@app.post("/sources", response_model=schemas.SourceOut, tags=["Sources"])
def create_source(source: schemas.SourceCreate, db: Session = Depends(get_db), _key: str = Depends(get_api_key)):
    db_source = models.Source(**source.model_dump())
    db.add(db_source)
    db.commit()
    db.refresh(db_source)
    return db_source


# ── Paper Trades ──────────────────────────────────────────────────────────────
@app.post("/paper-trades", response_model=schemas.PaperTradeOut, tags=["Portfolio"])
def create_paper_trade(trade: schemas.PaperTradeCreate, db: Session = Depends(get_db), _key: str = Depends(get_api_key)):
    db_trade = models.PaperTrade(**trade.model_dump())
    db.add(db_trade)
    db.commit()
    db.refresh(db_trade)
    return db_trade


@app.get("/paper-trades", response_model=list[schemas.PaperTradeOut], tags=["Portfolio"])
def list_paper_trades(is_open: bool = True, db: Session = Depends(get_db), _key: str = Depends(get_api_key)):
    return db.query(models.PaperTrade).filter(models.PaperTrade.is_open == is_open).all()
