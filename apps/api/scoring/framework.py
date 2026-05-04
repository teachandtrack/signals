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
        keywords = ["semiconductor", "chip", "foundry", "wafer", "gpu", "ai", "tsmc", "nvidia", "intel", "amd", "asml", "fab", "lithography"]
        relevance = min(1.0, sum(1 for k in keywords if k in text_lower) * 0.25)
        
        # 2. Novelty: Based on article length and density of information (stub)
        novelty = 0.8 if len(text) > 1000 else 0.5
        
        # 3. Timing: Are there forward-looking statements?
        timing_words = ["expect", "quarter", "forecast", "upcoming", "tomorrow", "guidance", "plans", "roadmap"]
        timing = 0.9 if any(w in text_lower for w in timing_words) else 0.5
        
        # 4. Evidence: Mentions of numbers, reports, or financials
        evidence = 0.8 if sum(char.isdigit() for char in text) > 5 else 0.4
        
        # 5. Tradability: Higher if multiple tickers found (updated in builder)
        tradability = 0.7
        
        # 6. Source Safety: Directly from the Source's credibility score
        safety = source_credibility or 0.5
        
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
