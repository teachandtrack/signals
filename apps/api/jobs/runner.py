"""
SigInt Job Runner
Runs scheduled ingestion and signal-generation tasks.
This script is designed to be executed as a GitHub Actions cron job.
"""
import os
import sys
import logging
from datetime import datetime

# Add apps/api to path so we can import modules when running as a script
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal
from ingestion.engine import IngestionEngine
from scoring.builder import SignalBuilder

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


def run_ingestion():
    """Fetch from all active green sources and store raw documents."""
    logger.info("Starting ingestion run at %s", datetime.utcnow().isoformat())
    
    db = SessionLocal()
    try:
        engine = IngestionEngine(db)
        engine.run()
    finally:
        db.close()
        
    logger.info("Ingestion complete")


def run_signal_generation():
    """Convert unprocessed raw documents into scored signals."""
    logger.info("Starting signal generation at %s", datetime.utcnow().isoformat())
    
    db = SessionLocal()
    try:
        builder = SignalBuilder(db)
        builder.build_signals_from_unprocessed()
    finally:
        db.close()
        
    logger.info("Signal generation complete")


def run_expiry_check():
    """Mark signals as EXPIRED if they have passed their expires_at timestamp."""
    logger.info("Running expiry check...")
    # TODO: query DB for PENDING signals past expires_at, mark as EXPIRED
    logger.info("Expiry check complete (stub)")


if __name__ == "__main__":
    run_ingestion()
    run_signal_generation()
    run_expiry_check()


