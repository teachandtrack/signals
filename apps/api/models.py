from datetime import datetime
from enum import Enum as PyEnum
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, Text,
    DateTime, ForeignKey, Enum
)
from sqlalchemy.orm import relationship
from database import Base


# ── Timestamps mixin ──────────────────────────────────────────────────────────
class TimestampMixin:
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


# ── Enums ─────────────────────────────────────────────────────────────────────
class ComplianceStatus(str, PyEnum):
    GREEN = "green"
    AMBER = "amber"
    RED = "red"


class SignalStatus(str, PyEnum):
    PENDING = "pending"
    REVIEWED = "reviewed"
    ACTIONED = "actioned"
    DISMISSED = "dismissed"
    EXPIRED = "expired"


class SourceType(str, PyEnum):
    RSS = "rss"
    SEC_FILING = "sec_filing"
    PRESS_RELEASE = "press_release"
    REGULATORY = "regulatory"
    NEWS = "news"


# ── Users ─────────────────────────────────────────────────────────────────────
class User(Base, TimestampMixin):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    reviews = relationship("Review", back_populates="reviewer")


# ── Sources ───────────────────────────────────────────────────────────────────
class Source(Base, TimestampMixin):
    __tablename__ = "sources"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    url = Column(String(1024), nullable=False)
    source_type = Column(Enum(SourceType, name="source_type", values_callable=lambda obj: [e.value for e in obj]), nullable=False)
    credibility_score = Column(Float, default=0.5)  # 0.0 - 1.0
    is_active = Column(Boolean, default=True)
    raw_documents = relationship("RawDocument", back_populates="source")


class RawDocument(Base, TimestampMixin):
    __tablename__ = "raw_documents"
    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("sources.id"), nullable=False)
    content_hash = Column(String(64), unique=True, nullable=False, index=True)  # SHA-256 for deduplication
    title = Column(String(1024))
    content = Column(Text)
    url = Column(String(1024))
    published_at = Column(DateTime)
    compliance_status = Column(Enum(ComplianceStatus, name="compliance_status", values_callable=lambda obj: [e.value for e in obj]), default=ComplianceStatus.GREEN)
    source = relationship("Source", back_populates="raw_documents")
    signals = relationship("SignalSource", back_populates="document")


# ── Companies & Tickers ───────────────────────────────────────────────────────
class Company(Base, TimestampMixin):
    __tablename__ = "companies"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    sector = Column(String(100))
    sub_sector = Column(String(100))
    tickers = relationship("Ticker", back_populates="company")
    signals = relationship("SignalTicker", back_populates="company")


class Ticker(Base, TimestampMixin):
    __tablename__ = "tickers"
    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(20), unique=True, nullable=False, index=True)
    exchange = Column(String(20))
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    company = relationship("Company", back_populates="tickers")


# ── Signals ───────────────────────────────────────────────────────────────────
class Signal(Base, TimestampMixin):
    __tablename__ = "signals"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(1024), nullable=False)
    summary = Column(Text)
    llm_bull_case = Column(Text)
    llm_bear_case = Column(Text)
    sentiment = Column(String(20))  # bullish / bearish / neutral
    status = Column(Enum(SignalStatus, name="signal_status", values_callable=lambda obj: [e.value for e in obj]), default=SignalStatus.PENDING)
    compliance_status = Column(Enum(ComplianceStatus, name="compliance_status", values_callable=lambda obj: [e.value for e in obj]), default=ComplianceStatus.GREEN)

    # Six-Score Framework
    score_novelty = Column(Float, default=0.0)
    score_relevance = Column(Float, default=0.0)
    score_timing = Column(Float, default=0.0)
    score_evidence = Column(Float, default=0.0)
    score_tradability = Column(Float, default=0.0)
    score_safety = Column(Float, default=0.0)
    score_total = Column(Float, default=0.0)

    expires_at = Column(DateTime)

    sources = relationship("SignalSource", back_populates="signal")
    tickers = relationship("SignalTicker", back_populates="signal")
    reviews = relationship("Review", back_populates="signal")


class SignalSource(Base):
    __tablename__ = "signal_sources"
    id = Column(Integer, primary_key=True, index=True)
    signal_id = Column(Integer, ForeignKey("signals.id"), nullable=False)
    document_id = Column(Integer, ForeignKey("raw_documents.id"), nullable=False)
    signal = relationship("Signal", back_populates="sources")
    document = relationship("RawDocument", back_populates="signals")


class SignalTicker(Base):
    __tablename__ = "signal_tickers"
    id = Column(Integer, primary_key=True, index=True)
    signal_id = Column(Integer, ForeignKey("signals.id"), nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    direction = Column(String(20))  # long / short / neutral
    signal = relationship("Signal", back_populates="tickers")
    company = relationship("Company", back_populates="signals")


# ── Reviews & Paper Trades ────────────────────────────────────────────────────
class Review(Base, TimestampMixin):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True, index=True)
    signal_id = Column(Integer, ForeignKey("signals.id"), nullable=False)
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    decision = Column(String(50))  # act / dismiss / watchlist
    notes = Column(Text)
    signal = relationship("Signal", back_populates="reviews")
    reviewer = relationship("User", back_populates="reviews")


class PaperTrade(Base, TimestampMixin):
    __tablename__ = "paper_trades"
    id = Column(Integer, primary_key=True, index=True)
    review_id = Column(Integer, ForeignKey("reviews.id"), nullable=False)
    ticker_symbol = Column(String(20), nullable=False)
    direction = Column(String(10), nullable=False)  # long / short
    entry_price = Column(Float)
    exit_price = Column(Float)
    position_size_pct = Column(Float)  # % of hypothetical portfolio
    outcome_pct = Column(Float)        # % gain/loss when closed
    is_open = Column(Boolean, default=True)
    closed_at = Column(DateTime)


# ── Audit Log ─────────────────────────────────────────────────────────────────
class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    table_name = Column(String(100), nullable=False)
    record_id = Column(Integer, nullable=False)
    action = Column(String(20), nullable=False)  # INSERT / UPDATE / DELETE
    changed_by = Column(Integer, ForeignKey("users.id"))
    changed_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    details = Column(Text)
