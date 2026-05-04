import React, { useState } from "react";


// Add a simple fade-in-up animation to globals via tailwind inline config or just use the class
export default function SignalCard({ signal }: { signal: any }) {
  const [showAnalysis, setShowAnalysis] = useState(false);

  // Determine gradient color based on total score
  const scoreColor = 
    signal.scores.total > 0.8 ? "from-emerald-400 to-emerald-600" :
    signal.scores.total > 0.6 ? "from-indigo-400 to-indigo-600" :
    "from-amber-400 to-amber-600";
    
  return (
    <div className="glass-panel p-6 flex flex-col gap-6 relative overflow-hidden group">
      {/* Decorative gradient blur based on score */}
      <div className={`absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br ${scoreColor} rounded-full blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity duration-500`} />
      
      {/* Header: Score and Tickers */}
      <div className="flex justify-between items-start">
        <div className="flex gap-2 items-center">
          <div className={`text-2xl font-black bg-clip-text text-transparent bg-gradient-to-br ${scoreColor}`}>
            {(signal.scores.total * 100).toFixed(0)}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Master Score</span>
            <div className="flex gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-700"></span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          {signal.tickers?.map((ticker: string) => (
            <span key={ticker} className="badge bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono">
              ${ticker}
            </span>
          ))}
          <span className="badge bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {signal.compliance_status} source
          </span>
        </div>
      </div>

      {/* Content: Title and Summary */}
      <div className="space-y-2 z-10">
        <h3 className="text-xl font-semibold text-white leading-tight group-hover:text-indigo-400 transition-colors">
          {signal.title}
        </h3>
        <p className="text-zinc-400 text-sm leading-relaxed">
          {signal.summary}
        </p>
      </div>

      {/* Algorithmic Prediction Panel */}
      {signal.trade_plan && (
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center z-10 relative overflow-hidden">
          {/* Action Badge */}
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-lg font-bold text-lg tracking-wider ${
              signal.trade_plan.action === 'BUY' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
              signal.trade_plan.action === 'SELL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
              'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}>
              {signal.trade_plan.action}
            </div>
            <div>
              <p className="text-sm font-medium text-white">${signal.trade_plan.ticker}</p>
              <p className="text-xs text-zinc-500 uppercase tracking-wider">{signal.trade_plan.confidence} CONFIDENCE</p>
            </div>
          </div>
          
          {/* Prices */}
          <div className="flex gap-6">
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase text-zinc-500 font-medium">Current Price</span>
              <span className="font-mono text-white text-sm">${signal.trade_plan.current_price.toFixed(2)}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase text-zinc-500 font-medium">Target Price</span>
              <span className={`font-mono text-sm font-bold ${signal.trade_plan.action === 'SELL' ? 'text-red-400' : 'text-emerald-400'}`}>
                ${signal.trade_plan.target_price.toFixed(2)}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase text-zinc-500 font-medium">Stop Loss</span>
              <span className="font-mono text-zinc-300 text-sm">${signal.trade_plan.stop_loss.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Scoring Breakdown & Actions */}
      <div className="pt-4 border-t border-zinc-800/50 flex flex-col md:flex-row gap-6 justify-between items-center z-10">
        
        {/* Six-Score Micro Bars */}
        <div className="grid grid-cols-3 gap-x-6 gap-y-3 w-full md:w-auto flex-1">
          <ScoreBar label="Novelty" value={signal.scores.novelty} />
          <ScoreBar label="Relevance" value={signal.scores.relevance} />
          <ScoreBar label="Timing" value={signal.scores.timing} />
          <ScoreBar label="Evidence" value={signal.scores.evidence} />
          <ScoreBar label="Tradability" value={signal.scores.tradability} />
          <ScoreBar label="Safety" value={signal.scores.safety} />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 w-full md:w-auto shrink-0">
          <button 
            onClick={() => setShowAnalysis(!showAnalysis)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${showAnalysis ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400' : 'bg-zinc-800 border-transparent text-zinc-300 hover:border-indigo-500/20'}`}
          >
            ✨ Gemini Analysis
          </button>
          <button 
            onClick={() => alert(`Review process initiated for ${signal.title}`)}
            className="flex-1 md:flex-none px-6 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40"
          >
            Review
          </button>
        </div>
      </div>

      {/* Gemini Analysis Dropdown */}
      {showAnalysis && (
        <div className="pt-4 border-t border-zinc-800/50 mt-2 flex flex-col gap-4 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">✨</span>
            <h4 className="text-white font-medium text-sm">Gemini AI Synthesis</h4>
            <span className={`ml-auto text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
              signal.sentiment === 'bullish' ? 'bg-emerald-500/20 text-emerald-400' :
              signal.sentiment === 'bearish' ? 'bg-red-500/20 text-red-400' :
              'bg-amber-500/20 text-amber-400'
            }`}>
              {signal.sentiment || 'NEUTRAL'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-900/50 rounded-lg p-4 border border-emerald-500/10 hover:border-emerald-500/20 transition-colors">
              <h5 className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                <span className="text-emerald-500">📈</span> Bull Case
              </h5>
              <p className="text-zinc-300 text-sm leading-relaxed">
                {signal.llm_bull_case || "No bull case generated."}
              </p>
            </div>
            
            <div className="bg-zinc-900/50 rounded-lg p-4 border border-red-500/10 hover:border-red-500/20 transition-colors">
              <h5 className="text-red-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                <span className="text-red-500">📉</span> Bear Case
              </h5>
              <p className="text-zinc-300 text-sm leading-relaxed">
                {signal.llm_bear_case || "No bear case generated."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  // Color based on value
  const fillClass = value > 0.7 ? "bg-emerald-500" : value > 0.4 ? "bg-amber-500" : "bg-red-500";
  
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">{label}</span>
        <span className="text-[10px] font-mono text-zinc-400">{value.toFixed(1)}</span>
      </div>
      <div className="score-bar-bg">
        <div 
          className={`score-bar-fill ${fillClass}`} 
          style={{ width: `${value * 100}%` }}
        />
      </div>
    </div>
  );
}

