from models import ComplianceStatus, SourceType
from ingestion.connector import ExtractedDocument
import logging

logger = logging.getLogger(__name__)

class ComplianceGate:
    """
    Enforces the green/amber/red source policy.
    Red items are blocked immediately. Amber requires reconstruction. Green is review-eligible.
    """
    
    # In a real system, these would be loaded from a database or config.
    RED_SOURCES = ["reddit.com", "4chan.org", "twitter.com"]
    AMBER_SOURCES = ["seekingalpha.com", "medium.com"]
    
    @classmethod
    def evaluate(cls, document: ExtractedDocument) -> ComplianceStatus:
        url_lower = document.url.lower()
        
        # 1. Check Red List
        for red_domain in cls.RED_SOURCES:
            if red_domain in url_lower:
                logger.warning(f"BLOCKED: Red source detected {document.url}")
                return ComplianceStatus.RED
                
        # 2. Check Amber List
        for amber_domain in cls.AMBER_SOURCES:
            if amber_domain in url_lower:
                logger.info(f"AMBER: Caution source detected {document.url}")
                return ComplianceStatus.AMBER
                
        # 3. Default to Green for official channels (like RSS from SEC/Press releases)
        # Note: Production systems might be strictly default-deny (default Amber/Red).
        return ComplianceStatus.GREEN
