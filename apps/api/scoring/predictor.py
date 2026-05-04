import yfinance as yf
import logging
from typing import Dict, Optional, List

logger = logging.getLogger(__name__)

class TradePredictor:
    """
    Predicts market direction and generates actionable trade plans (Buy/Sell, Price Targets)
    based on the Six-Score framework and live market data.
    """
    
    @staticmethod
    def generate_trade_plan(tickers: List[str], total_score: float, evidence_score: float, sentiment: str = "BULLISH") -> Optional[Dict]:
        if not tickers:
            return None
            
        primary_ticker = tickers[0]
        
        try:
            # Use fast_info for near-instant price retrieval
            stock = yf.Ticker(primary_ticker)
            # Try fast_info first as it's much faster than history()
            current_price = stock.fast_info.get('last_price') or stock.fast_info.get('lastPrice')
            
            if not current_price:
                # Fallback to history only if fast_info fails
                history = stock.history(period="1d")
                if not history.empty:
                    current_price = float(history['Close'].iloc[-1])
                else:
                    current_price = 100.0
                
        except Exception as e:
            logger.warning(f"Market data fetch failed for {primary_ticker}: {e}")
            current_price = 100.0 # Fallback mock price to ensure API keeps moving
            
        # Prediction Logic based on Signal Scores & Sentiment
        # If total_score is high and sentiment is BULLISH -> BUY
        # If total_score is high and sentiment is BEARISH -> SELL
        
        confidence = "HIGH" if evidence_score > 0.7 else ("MEDIUM" if evidence_score > 0.4 else "LOW")
        
        if total_score > 0.65 and sentiment == "BULLISH":
            action = "BUY"
            # Target price: +15% bump based on high score
            target_multiplier = 1.15 + (total_score - 0.65) * 0.2 
            stop_loss_multiplier = 0.92 # 8% stop loss
            horizon = "2-6 Weeks"
        elif total_score > 0.65 and sentiment == "BEARISH":
            action = "SELL"
            # Target price: expected to drop 12%
            target_multiplier = 0.88
            stop_loss_multiplier = 1.05 # 5% stop loss for short
            horizon = "1-3 Weeks"
        elif total_score > 0.45:
            action = "HOLD"
            target_multiplier = 1.0
            stop_loss_multiplier = 0.95
            horizon = "Monitor"
        else:
            action = "IGNORE"
            target_multiplier = 1.0
            stop_loss_multiplier = 1.0
            horizon = "N/A"
            
        target_price = current_price * target_multiplier
        stop_loss = current_price * stop_loss_multiplier
        
        return {
            "ticker": primary_ticker,
            "action": action,
            "current_price": round(current_price, 2),
            "target_price": round(target_price, 2),
            "stop_loss": round(stop_loss, 2),
            "confidence": confidence,
            "horizon": horizon
        }
