import feedparser
from typing import List
from datetime import datetime
from time import mktime
import logging

from ingestion.connector import BaseConnector, ExtractedDocument
from models import SourceType

logger = logging.getLogger(__name__)

class RSSConnector(BaseConnector):
    def __init__(self, feed_url: str):
        self.feed_url = feed_url

    def fetch(self) -> List[ExtractedDocument]:
        logger.info(f"Fetching RSS feed from {self.feed_url}")
        parsed_feed = feedparser.parse(self.feed_url)
        documents = []
        
        for entry in parsed_feed.entries:
            try:
                # Handle missing dates gracefully
                if hasattr(entry, 'published_parsed') and entry.published_parsed:
                    dt = datetime.fromtimestamp(mktime(entry.published_parsed))
                else:
                    dt = datetime.utcnow()
                    
                doc = ExtractedDocument(
                    title=entry.get('title', 'No Title'),
                    content=entry.get('summary', entry.get('description', '')),
                    url=entry.get('link', ''),
                    published_at=dt,
                    source_type=SourceType.RSS
                )
                documents.append(doc)
            except Exception as e:
                logger.error(f"Error parsing RSS entry from {self.feed_url}: {e}")
                continue
                
        return documents
