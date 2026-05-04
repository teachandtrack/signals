import re
from typing import List

class EntityExtractor:
    """
    Stub for Entity Extraction.
    In V2, this will use an LLM or a specialized NLP pipeline to extract company names and map to tickers.
    For now, it does a naive regex search for typical ticker formats (e.g., $AAPL).
    """
    
    @staticmethod
    def extract_tickers(text: str, db_session=None) -> List[str]:
        if not text:
            return []
            
        # 1. Naive regex for $TICKER
        matches = re.findall(r'\$([A-Z]{1,5})', text)
        
        # 2. Match company names from DB if session is provided
        if db_session:
            from models import Company
            companies = db_session.query(Company).all()
            for company in companies:
                if company.name.lower() in text.lower():
                    for t in company.tickers:
                        matches.append(t.symbol)
        
        return list(set(matches))
