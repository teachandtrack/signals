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

from database import SessionLocal, engine
import models
from ingestion.engine import IngestionEngine
from scoring.builder import SignalBuilder

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# Ensure tables exist
models.Base.metadata.create_all(bind=engine)


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


def run_slow_analysis():
    """Find one signal that needs analysis and process it."""
    logger.info("Running slow analysis job...")
    db = SessionLocal()
    try:
        builder = SignalBuilder(db)
        success = builder.analyze_one_skipped()
        if success:
            logger.info("Slow analysis successful")
        else:
            logger.info("No signals found for slow analysis")
    finally:
        db.close()


if __name__ == "__main__":
    run_ingestion()
    run_signal_generation()
    run_slow_analysis()
    run_expiry_check()


