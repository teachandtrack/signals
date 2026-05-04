from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr
from models import ComplianceStatus, SignalStatus, SourceType


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
    expires_at: Optional[datetime]

    @classmethod
    def from_orm_with_scores(cls, signal):
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


# ── Health ────────────────────────────────────────────────────────────────────
class HealthResponse(BaseModel):
    status: str
    version: str = "0.1.0"
