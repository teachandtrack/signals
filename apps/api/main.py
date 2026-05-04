from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import get_db, engine
import models
import schemas

# Create all tables on startup (migrations handled by Alembic in production)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SigInt API",
    description="Semiconductor Signal Intelligence Platform",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Tighten in production to Vercel domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/health", response_model=schemas.HealthResponse, tags=["System"])
def health_check():
    return {"status": "ok", "version": "0.1.0"}


# ── Signals ───────────────────────────────────────────────────────────────────
@app.get("/signals/queue", response_model=list[schemas.SignalOut], tags=["Signals"])
def get_signal_queue(
    limit: int = 20,
    db: Session = Depends(get_db),
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


@app.get("/signals/{signal_id}", response_model=schemas.SignalOut, tags=["Signals"])
def get_signal(signal_id: int, db: Session = Depends(get_db)):
    signal = db.query(models.Signal).filter(models.Signal.id == signal_id).first()
    if not signal:
        raise HTTPException(status_code=404, detail="Signal not found")
    return schemas.SignalOut.from_orm_with_scores(signal)


@app.post("/signals/{signal_id}/review", response_model=schemas.ReviewOut, tags=["Signals"])
def review_signal(
    signal_id: int,
    review: schemas.ReviewCreate,
    db: Session = Depends(get_db),
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
def list_sources(db: Session = Depends(get_db)):
    return db.query(models.Source).filter(models.Source.is_active == True).all()


@app.post("/sources", response_model=schemas.SourceOut, tags=["Sources"])
def create_source(source: schemas.SourceCreate, db: Session = Depends(get_db)):
    db_source = models.Source(**source.model_dump())
    db.add(db_source)
    db.commit()
    db.refresh(db_source)
    return db_source


# ── Paper Trades ──────────────────────────────────────────────────────────────
@app.post("/paper-trades", response_model=schemas.PaperTradeOut, tags=["Portfolio"])
def create_paper_trade(trade: schemas.PaperTradeCreate, db: Session = Depends(get_db)):
    db_trade = models.PaperTrade(**trade.model_dump())
    db.add(db_trade)
    db.commit()
    db.refresh(db_trade)
    return db_trade


@app.get("/paper-trades", response_model=list[schemas.PaperTradeOut], tags=["Portfolio"])
def list_paper_trades(is_open: bool = True, db: Session = Depends(get_db)):
    return db.query(models.PaperTrade).filter(models.PaperTrade.is_open == is_open).all()
