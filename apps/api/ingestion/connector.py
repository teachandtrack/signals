from abc import ABC, abstractmethod
from typing import List
from datetime import datetime
from pydantic import BaseModel
from models import SourceType

class ExtractedDocument(BaseModel):
    title: str
    content: str
    url: str
    published_at: datetime
    source_type: SourceType

class BaseConnector(ABC):
    """
    Base interface for all source connectors.
    Connectors must be idempotent: fetching the same data twice should not create duplicates.
    """
    
    @abstractmethod
    def fetch(self) -> List[ExtractedDocument]:
        """Fetch latest documents from the source."""
        pass
