import hashlib
import logging
from typing import List
from sqlalchemy.orm import Session

from database import SessionLocal
from models import Source, RawDocument, SourceType
from ingestion.rss_connector import RSSConnector
from compliance.gate import ComplianceGate

logger = logging.getLogger(__name__)

class IngestionEngine:
    def __init__(self, db: Session):
        self.db = db

    def generate_hash(self, content: str, url: str) -> str:
        """Generate a SHA-256 fingerprint for deduplication."""
        unique_string = f"{url}-{content}"
        return hashlib.sha256(unique_string.encode('utf-8')).hexdigest()

    def run(self):
        """Main ingestion loop. Iterates over active sources and ingests new documents."""
        sources = self.db.query(Source).filter(Source.is_active == True).all()
        logger.info(f"Starting ingestion for {len(sources)} active sources.")
        
        for source in sources:
            try:
                self.process_source(source)
            except Exception as e:
                logger.error(f"Failed to process source {source.name} ({source.url}): {e}")

    def process_source(self, source: Source):
        if source.source_type == SourceType.RSS:
            connector = RSSConnector(feed_url=source.url)
        else:
            logger.warning(f"Connector for {source.source_type} not implemented yet.")
            return

        documents = connector.fetch()
        logger.info(f"Fetched {len(documents)} documents from {source.name}")
        
        saved_count = 0
        for doc in documents:
            content_hash = self.generate_hash(doc.content, doc.url)
            
            # Deduplication Check
            existing = self.db.query(RawDocument).filter(RawDocument.content_hash == content_hash).first()
            if existing:
                continue
                
            # Compliance Gate
            compliance_status = ComplianceGate.evaluate(doc)
            
            # Save RawDocument
            raw_doc = RawDocument(
                source_id=source.id,
                content_hash=content_hash,
                title=doc.title,
                content=doc.content,
                url=doc.url,
                published_at=doc.published_at,
                compliance_status=compliance_status
            )
            self.db.add(raw_doc)
            saved_count += 1
            
        self.db.commit()
        logger.info(f"Saved {saved_count} new documents for {source.name}")
