import re
from typing import List

class EntityExtractor:
    """
    Stub for Entity Extraction.
    In V2, this will use an LLM or a specialized NLP pipeline to extract company names and map to tickers.
    For now, it does a naive regex search for typical ticker formats (e.g., $AAPL).
    """
    
    @staticmethod
    def extract_tickers(text: str) -> List[str]:
        if not text:
            return []
            
        # Simple regex to find $TICKER patterns
        matches = re.findall(r'\$([A-Z]{1,5})', text)
        
        # In a real system, we'd also match company names against our Company DB table.
        return list(set(matches))
