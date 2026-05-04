import os
import logging
from google import genai
import json

logger = logging.getLogger(__name__)

# Configure Gemini
api_key = os.environ.get("GEMINI_API_KEY")
if api_key:
    client = genai.Client(api_key=api_key)
else:
    client = None
    logger.warning("GEMINI_API_KEY is not set. LLM synthesis will be disabled.")

class GeminiSynthesizer:
    @staticmethod
    def synthesize_signal(content: str) -> dict:
        """
        Takes raw document content and uses Gemini Flash to generate
        a summary, bull case, bear case, and sentiment.
        """
        if not client:
            return {
                "summary": content[:500] + "...",
                "bull_case": "LLM synthesis disabled. Set GEMINI_API_KEY.",
                "bear_case": "LLM synthesis disabled. Set GEMINI_API_KEY.",
                "sentiment": "neutral"
            }
            
        prompt = f"""
        You are a highly analytical quantitative finance AI. Analyze the following document related to the semiconductor industry.
        Provide your analysis strictly in the following JSON format. Do not return any other text besides the JSON.
        {{
            "summary": "A concise 2-sentence summary of the key information.",
            "bull_case": "The strongest argument for why this is positive for the involved companies (max 3 sentences).",
            "bear_case": "The strongest argument for why this is negative or risky for the involved companies (max 3 sentences).",
            "sentiment": "bullish" | "bearish" | "neutral"
        }}
        
        Document Content:
        {content[:15000]}
        """
        
        try:
            response = client.models.generate_content(
                model='gemini-2.0-flash',
                contents=prompt
            )
            text = response.text
            
            # Clean up markdown JSON block if present
            text = text.strip()
            if text.startswith("```json"):
                text = text[7:]
            if text.endswith("```"):
                text = text[:-3]
                
            result = json.loads(text.strip())
            return {
                "summary": result.get("summary", ""),
                "bull_case": result.get("bull_case", ""),
                "bear_case": result.get("bear_case", ""),
                "sentiment": result.get("sentiment", "neutral").lower()
            }
        except Exception as e:
            logger.error(f"Failed to synthesize signal with Gemini: {e}")
            return {
                "summary": content[:500] + "...",
                "bull_case": f"Analysis failed due to an error: {e}",
                "bear_case": f"Analysis failed due to an error: {e}",
                "sentiment": "neutral"
            }
