from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr
from models import ComplianceStatus, SignalStatus, SourceType
from scoring.predictor import TradePredictor


# ── Base ──────────────────────────────────────────────────────────────────────
class TimestampSchema(BaseModel):
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ── Users ─────────────────────────────────────────────────────────────────────
class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserOut(TimestampSchema):
    id: int
    email: EmailStr
    is_active: bool


# ── Sources ───────────────────────────────────────────────────────────────────
class SourceCreate(BaseModel):
    name: str
    url: str
    source_type: SourceType
    credibility_score: float = 0.5


class SourceOut(TimestampSchema):
    id: int
    name: str
    url: str
    source_type: SourceType
    credibility_score: float
    is_active: bool

class TradePlan(BaseModel):
    ticker: str
    action: str
    current_price: float
    target_price: float
    stop_loss: float
    confidence: str
    horizon: str


# ── Signals ───────────────────────────────────────────────────────────────────
class SignalScores(BaseModel):
    novelty: float
    relevance: float
    timing: float
    evidence: float
    tradability: float
    safety: float
    total: float


class SignalOut(TimestampSchema):
    id: int
    title: str
    summary: Optional[str]
    llm_bull_case: Optional[str]
    llm_bear_case: Optional[str]
    sentiment: Optional[str]
    status: SignalStatus
    compliance_status: ComplianceStatus
    scores: SignalScores
    tickers: Optional[List[str]] = []
    trade_plan: Optional[TradePlan] = None
    expires_at: Optional[datetime]

    @classmethod
    def from_orm_with_scores(cls, signal):
        # Extract tickers from signal.tickers
        # signal.tickers is a list of SignalTicker objects
        # SignalTicker has company relationship, Company has tickers relationship
        ticker_symbols = []
        for st in signal.tickers:
            for t in st.company.tickers:
                if t.symbol not in ticker_symbols:
                    ticker_symbols.append(t.symbol)

        trade_plan = None
        if ticker_symbols:
            plan_data = TradePredictor.generate_trade_plan(
                tickers=ticker_symbols,
                total_score=signal.score_total,
                evidence_score=signal.score_evidence,
                sentiment=signal.sentiment.upper() if signal.sentiment else "NEUTRAL"
            )
            if plan_data:
                trade_plan = TradePlan(**plan_data)

        data = {
            "id": signal.id,
            "title": signal.title,
            "summary": signal.summary,
            "llm_bull_case": signal.llm_bull_case,
            "llm_bear_case": signal.llm_bear_case,
            "sentiment": signal.sentiment,
            "status": signal.status,
            "compliance_status": signal.compliance_status,
            "expires_at": signal.expires_at,
            "created_at": signal.created_at,
            "updated_at": signal.updated_at,
            "tickers": ticker_symbols,
            "trade_plan": trade_plan,
            "scores": SignalScores(
                novelty=signal.score_novelty,
                relevance=signal.score_relevance,
                timing=signal.score_timing,
                evidence=signal.score_evidence,
                tradability=signal.score_tradability,
                safety=signal.score_safety,
                total=signal.score_total,
            ),
        }
        return cls(**data)


# ── Reviews ───────────────────────────────────────────────────────────────────
class ReviewCreate(BaseModel):
    decision: str  # act / dismiss / watchlist
    notes: Optional[str] = None


class ReviewOut(TimestampSchema):
    id: int
    signal_id: int
    reviewer_id: int
    decision: str
    notes: Optional[str]


# ── Paper Trades ──────────────────────────────────────────────────────────────
class PaperTradeCreate(BaseModel):
    review_id: int
    ticker_symbol: str
    direction: str  # long / short
    entry_price: float
    position_size_pct: float


class PaperTradeOut(TimestampSchema):
    id: int
    ticker_symbol: str
    direction: str
    entry_price: float
    exit_price: Optional[float]
    position_size_pct: float
    outcome_pct: Optional[float]
    is_open: bool


# ── Market Pulse ──────────────────────────────────────────────────────────────
class MarketPulseItem(BaseModel):
    symbol: str
    name: str
    price: float
    change: float
    status: str

# ── Health ────────────────────────────────────────────────────────────────────
class HealthResponse(BaseModel):
    status: str
    version: str = "0.1.0"
