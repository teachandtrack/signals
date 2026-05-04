import logging
from typing import Dict

logger = logging.getLogger(__name__)

class ScoringFramework:
    """
    Implements the Six-Score Framework:
    novelty, relevance, timing, evidence, tradability, safety.
    """
    
    @staticmethod
    def calculate_scores(text: str, source_credibility: float) -> Dict[str, float]:
        # Stub logic: In V2, these scores will be generated via an LLM or NLP classifier.
        # For now, we generate basic scores based on keywords and source credibility.
        if not text:
            text = ""
            
        text_lower = text.lower()
        
        # 1. Relevance: Mentions of specific semiconductor keywords
        keywords = ["semiconductor", "chip", "foundry", "wafer", "gpu", "ai", "tsmc", "nvidia"]
        relevance = min(1.0, sum(1 for k in keywords if k in text_lower) * 0.2)
        
        # 2. Novelty: Stub (assume 0.5 for now)
        novelty = 0.5
        
        # 3. Timing: Are there forward-looking statements?
        timing_words = ["expect", "quarter", "forecast", "upcoming", "tomorrow", "guidance"]
        timing = 0.8 if any(w in text_lower for w in timing_words) else 0.4
        
        # 4. Evidence: Mentions of numbers, reports, or financials
        evidence = 0.7 if any(char.isdigit() for char in text) else 0.3
        
        # 5. Tradability: Stub
        tradability = 0.6
        
        # 6. Source Safety: Directly from the Source's credibility score
        safety = source_credibility
        
        # Weighted Master Score
        # Relevance and Evidence are heavily weighted for Signal Quality
        weights = {
            "novelty": 0.15,
            "relevance": 0.25,
            "timing": 0.15,
            "evidence": 0.20,
            "tradability": 0.10,
            "safety": 0.15
        }
        
        total = (
            (novelty * weights["novelty"]) +
            (relevance * weights["relevance"]) +
            (timing * weights["timing"]) +
            (evidence * weights["evidence"]) +
            (tradability * weights["tradability"]) +
            (safety * weights["safety"])
        )
        
        return {
            "novelty": novelty,
            "relevance": relevance,
            "timing": timing,
            "evidence": evidence,
            "tradability": tradability,
            "safety": safety,
            "total": round(total, 2)
        }
