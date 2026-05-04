import logging
import os
import sys

# Add apps/api to path so we can import modules when running as a script
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, engine
import models

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

def seed_sources():
    db = SessionLocal()
    try:
        # Define the highly relevant sources we discussed
        sources = [
            # SEC Filings
            models.Source(
                name="SEC Filings - NVIDIA (NVDA)",
                url="https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001045810&type=&dateb=&owner=exclude&start=0&count=40&output=atom",
                source_type=models.SourceType.SEC_FILING,
                credibility_score=1.0
            ),
            models.Source(
                name="SEC Filings - TSMC (TSM)",
                url="https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001046179&type=&dateb=&owner=exclude&start=0&count=40&output=atom",
                source_type=models.SourceType.SEC_FILING,
                credibility_score=1.0
            ),
            models.Source(
                name="SEC Filings - ASML",
                url="https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000937966&type=&dateb=&owner=exclude&start=0&count=40&output=atom",
                source_type=models.SourceType.SEC_FILING,
                credibility_score=1.0
            ),
            
            # Government & Policy
            models.Source(
                name="US Bureau of Industry and Security (BIS) Press Releases",
                url="https://www.bis.doc.gov/index.php?format=feed&type=rss",
                source_type=models.SourceType.REGULATORY,
                credibility_score=1.0
            ),
            
            # Industry & Supply Chain
            models.Source(
                name="Tom's Hardware - News",
                url="https://www.tomshardware.com/feeds/all",
                source_type=models.SourceType.NEWS,
                credibility_score=0.7
            )
        ]
        
        # Insert avoiding duplicates
        added_count = 0
        for s in sources:
            existing = db.query(models.Source).filter(models.Source.url == s.url).first()
            if not existing:
                db.add(s)
                added_count += 1
                
        db.commit()
        logger.info(f"Successfully seeded {added_count} new sources into the database.")
        
    finally:
        db.close()

if __name__ == "__main__":
    # Ensure tables exist
    models.Base.metadata.create_all(bind=engine)
    seed_sources()
