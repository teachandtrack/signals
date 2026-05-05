import os
import sys
import logging
from sqlalchemy.orm import Session

# Add apps/api to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal, engine
import models
from models import Source, SourceType, Company, Ticker

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def seed():
    db = SessionLocal()
    try:
        # 1. Create Tables
        models.Base.metadata.create_all(bind=engine)
        
        # 2. Add Sources
        if db.query(Source).count() == 0:
            logger.info("Seeding Sources...")
            sources = [
                Source(name="SemiWiki RSS", url="https://semiwiki.com/feed/", source_type=SourceType.NEWS, credibility_score=0.8),
                Source(name="Semiconductor Engineering", url="https://semiengineering.com/feed/", source_type=SourceType.NEWS, credibility_score=0.85),
                Source(name="EDN Semiconductor Feed", url="https://www.edn.com/category/semiconductors/feed/", source_type=SourceType.NEWS, credibility_score=0.75),
            ]
            db.add_all(sources)
            db.commit()
            logger.info(f"Added {len(sources)} sources.")
        else:
            logger.info("Sources already exist, skipping.")

        # 3. Add Semiconductor Companies & Tickers
        if db.query(Company).count() == 0:
            logger.info("Seeding Companies and Tickers...")
            data = [
                {"name": "NVIDIA", "symbol": "NVDA", "sector": "Semiconductors", "description": "AI and Graphics processing units leader."},
                {"name": "Advanced Micro Devices", "symbol": "AMD", "sector": "Semiconductors", "description": "Processors and graphics cards manufacturer."},
                {"name": "Intel", "symbol": "INTC", "sector": "Semiconductors", "description": "Integrated device manufacturer of processors."},
                {"name": "Taiwan Semiconductor Manufacturing Co", "symbol": "TSM", "sector": "Foundry", "description": "World's largest dedicated independent semiconductor foundry."},
                {"name": "Broadcom", "symbol": "AVGO", "sector": "Semiconductors", "description": "Diverse semiconductor and infrastructure software products."},
                {"name": "Arm Holdings", "symbol": "ARM", "sector": "Semiconductors", "description": "British semiconductor and software design company."},
            ]
            
            for item in data:
                company = Company(name=item["name"], sector=item["sector"], description=item["description"])
                db.add(company)
                db.flush() # Get company id
                
                ticker = Ticker(symbol=item["symbol"], company_id=company.id)
                db.add(ticker)
                
            db.commit()
            logger.info(f"Added {len(data)} companies and tickers.")
        else:
            logger.info("Companies already exist, skipping.")

    finally:
        db.close()

if __name__ == "__main__":
    seed()
