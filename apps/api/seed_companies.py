import os
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models

def seed():
    db = SessionLocal()
    
    companies = [
        {"name": "NVIDIA", "tickers": ["NVDA"], "sector": "Semiconductors"},
        {"name": "TSMC", "tickers": ["TSM"], "sector": "Foundries"},
        {"name": "ASML", "tickers": ["ASML"], "sector": "Lithography"},
        {"name": "Intel", "tickers": ["INTC"], "sector": "Semiconductors"},
        {"name": "AMD", "tickers": ["AMD"], "sector": "Semiconductors"},
        {"name": "Broadcom", "tickers": ["AVGO"], "sector": "Semiconductors"},
        {"name": "Qualcomm", "tickers": ["QCOM"], "sector": "Semiconductors"},
        {"name": "Arm", "tickers": ["ARM"], "sector": "Semiconductors"},
    ]
    
    for c_data in companies:
        existing = db.query(models.Company).filter(models.Company.name == c_data["name"]).first()
        if not existing:
            company = models.Company(
                name=c_data["name"],
                sector=c_data["sector"]
            )
            db.add(company)
            db.flush()
            
            for symbol in c_data["tickers"]:
                ticker = models.Ticker(
                    symbol=symbol,
                    company_id=company.id
                )
                db.add(ticker)
    
    db.commit()
    print("Seeded companies and tickers.")

if __name__ == "__main__":
    seed()
