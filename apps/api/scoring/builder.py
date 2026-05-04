import logging
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from models import RawDocument, Signal, SignalSource, SignalStatus, ComplianceStatus, SignalTicker
import models
from scoring.extractor import EntityExtractor
from scoring.framework import ScoringFramework
from scoring.llm import GeminiSynthesizer

logger = logging.getLogger(__name__)

class SignalBuilder:
    def __init__(self, db: Session):
        self.db = db

    def build_signals_from_unprocessed(self):
        """
        Find RawDocuments that haven't been attached to a Signal yet,
        and generate Signals for them.
        """
        # Find raw docs not in signal_sources
        # This is a naive approach for MVP. In production, we'd use a processing queue or status flag.
        processed_doc_ids = [ss.document_id for ss in self.db.query(SignalSource.document_id).all()]
        
        unprocessed = (
            self.db.query(RawDocument)
            .filter(RawDocument.id.notin_(processed_doc_ids))
            # We don't generate signals for strictly RED flagged documents
            .filter(RawDocument.compliance_status != ComplianceStatus.RED)
            .all()
        )
        
        logger.info(f"Found {len(unprocessed)} unprocessed raw documents for signal generation.")
        
        for doc in unprocessed:
            try:
                self.process_document(doc)
            except Exception as e:
                logger.error(f"Failed to generate signal for document {doc.id}: {e}")

    def process_document(self, doc: RawDocument):
        # 1. Extract Entities
        tickers = EntityExtractor.extract_tickers(doc.content)
        
        # 2. Calculate Scores
        source_credibility = doc.source.credibility_score if doc.source else 0.5
        scores = ScoringFramework.calculate_scores(doc.content, source_credibility)
        
        # 3. LLM Synthesis using Gemini
        synthesis = GeminiSynthesizer.synthesize_signal(doc.content or "")
        
        # 4. Create Signal
        # A real system would cluster this (e.g., check if a similar signal exists today)
        signal = Signal(
            title=doc.title or "Untitled Signal",
            summary=synthesis["summary"],
            llm_bull_case=synthesis["bull_case"],
            llm_bear_case=synthesis["bear_case"],
            sentiment=synthesis["sentiment"],
            status=SignalStatus.PENDING,
            compliance_status=doc.compliance_status,
            score_novelty=scores["novelty"],
            score_relevance=scores["relevance"],
            score_timing=scores["timing"],
            score_evidence=scores["evidence"],
            score_tradability=scores["tradability"],
            score_safety=scores["safety"],
            score_total=scores["total"],
            expires_at=datetime.utcnow() + timedelta(days=7) # Default 1 week expiry
        )
        
        self.db.add(signal)
        self.db.flush() # Get signal.id
        
        # 4. Link Document to Signal
        signal_source = SignalSource(
            signal_id=signal.id,
            document_id=doc.id
        )
        self.db.add(signal_source)
        
        # 5. Link Tickers to Signal
        for symbol in tickers:
            ticker = self.db.query(models.Ticker).filter(models.Ticker.symbol == symbol).first()
            if ticker:
                signal_ticker = SignalTicker(
                    signal_id=signal.id,
                    company_id=ticker.company_id,
                    direction="long" if synthesis["sentiment"] == "bullish" else ("short" if synthesis["sentiment"] == "bearish" else "neutral")
                )
                self.db.add(signal_ticker)
        
        logger.info(f"Generated new Signal ID {signal.id} (Score: {scores['total']})")
        
        self.db.commit()
