"use client";

import React, { useState } from "react";
import { updateSignalStatus, analyzeSignal } from "@/app/actions";

export default function SignalCard({ signal, isRaw = false }: { signal: any, isRaw?: boolean }) {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Determine gradient color based on total score
  const scoreColor = 
    signal.scores.total > 0.8 ? "from-emerald-400 to-emerald-600" :
    signal.scores.total > 0.6 ? "from-indigo-400 to-indigo-600" :
    "from-amber-400 to-amber-600";
    
  return (
    <div className="glass-panel p-6 flex flex-col gap-6 relative overflow-hidden group">
      {/* Decorative gradient blur based on score */}
      <div className={`absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br ${isRaw ? 'from-zinc-500 to-zinc-700' : scoreColor} rounded-full blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity duration-500`} />
      
      {/* Header: Score and Tickers */}
      <div className="flex justify-between items-start">
        <div className="flex gap-2 items-center">
          <div className={`text-2xl font-black bg-clip-text text-transparent bg-gradient-to-br ${isRaw ? 'from-zinc-400 to-zinc-600' : scoreColor}`}>
            {(signal.scores.total * 100).toFixed(0)}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Master Score</span>
            <div className="flex gap-1 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${signal.scores.total > 0.2 ? 'bg-emerald-500' : 'bg-zinc-700'}`}></span>
              <span className={`w-1.5 h-1.5 rounded-full ${signal.scores.total > 0.5 ? 'bg-emerald-500' : 'bg-zinc-700'}`}></span>
              <span className={`w-1.5 h-1.5 rounded-full ${signal.scores.total > 0.7 ? 'bg-emerald-500' : 'bg-zinc-700'}`}></span>
              <span className={`w-1.5 h-1.5 rounded-full ${signal.scores.total > 0.9 ? 'bg-emerald-500' : 'bg-zinc-700'}`}></span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          {signal.tickers?.map((ticker: string) => (
            <span key={ticker} className="badge bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono">
              ${ticker}
            </span>
          ))}
          <span className={`badge ${signal.compliance_status === 'GREEN' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
            {signal.compliance_status} SOURCE
          </span>
        </div>
      </div>

      {/* Content: Title and Summary */}
      <div className="space-y-2 z-10">
        <h3 className="text-xl font-semibold text-white leading-tight group-hover:text-indigo-400 transition-colors">
          {signal.title}
        </h3>
        <p className={`text-zinc-400 text-sm leading-relaxed ${isRaw ? 'line-clamp-2' : ''}`}>
          {isRaw ? "This signal has been identified but not yet analyzed for investment insights." : signal.summary}
        </p>
      </div>

      {/* Algorithmic Prediction Panel - Hidden for Raw */}
      {signal.trade_plan && !isRaw && (
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center z-10 relative overflow-hidden">
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
          
          <div className="flex gap-6">
            <PriceInfo label="Current" value={signal.trade_plan.current_price} />
            <PriceInfo label="Target" value={signal.trade_plan.target_price} color={signal.trade_plan.action === 'SELL' ? 'text-red-400' : 'text-emerald-400'} />
            <PriceInfo label="Stop Loss" value={signal.trade_plan.stop_loss} color="text-zinc-400" />
          </div>
        </div>
      )}

      {/* Scoring Breakdown & Actions */}
      <div className="pt-4 border-t border-zinc-800/50 flex flex-col md:flex-row gap-6 justify-between items-center z-10">
        <div className="grid grid-cols-3 gap-x-6 gap-y-3 w-full md:w-auto flex-1">
          <ScoreBar label="Novelty" value={signal.scores.novelty} />
          <ScoreBar label="Relevance" value={signal.scores.relevance} />
          <ScoreBar label="Timing" value={signal.scores.timing} />
          <ScoreBar label="Evidence" value={signal.scores.evidence} />
          <ScoreBar label="Tradability" value={signal.scores.tradability} />
          <ScoreBar label="Safety" value={signal.scores.safety} />
        </div>

        <ActionButtons 
          signal={signal} 
          showAnalysis={showAnalysis} 
          setShowAnalysis={setShowAnalysis} 
          isRaw={isRaw}
          processing={processing}
          setProcessing={setProcessing}
        />
      </div>

      {/* Analysis & Compliance Dropdown - Only if not Raw */}
      {showAnalysis && !isRaw && (
        <div className="pt-4 border-t border-zinc-800/50 mt-2 flex flex-col gap-6 animate-fade-in-up">
          <div className="flex items-center gap-2">
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
            <CaseBox label="Bull Case" content={signal.llm_bull_case} color="emerald" icon="📈" />
            <CaseBox label="Bear Case" content={signal.llm_bear_case} color="red" icon="📉" />
          </div>

          <div className="bg-zinc-900/80 rounded-xl p-5 border border-zinc-800 shadow-inner">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <h4 className="text-zinc-300 font-bold text-xs uppercase tracking-widest">Compliance Audit Log</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ComplianceCheck name="Source Cred" status={signal.scores.evidence > 0.6 ? "PASS" : "WARN"} />
              <ComplianceCheck name="Market Aligned" status={signal.sentiment !== 'neutral' ? "PASS" : "WARN"} />
              <ComplianceCheck name="Confidence" status={signal.scores.total > 0.7 ? "PASS" : "FAIL"} />
              <ComplianceCheck name="Safety Check" status={signal.scores.safety > 0.5 ? "PASS" : "WARN"} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionButtons({ signal, showAnalysis, setShowAnalysis, isRaw, processing, setProcessing }: any) {
  const [loading, setLoading] = useState(false);

  const handleAction = async (decision: "act" | "dismiss" | "watchlist") => {
    setLoading(true);
    const success = await updateSignalStatus(signal.id, decision);
    if (success) {
      alert(`Signal marked as ${decision.toUpperCase()}`);
      window.location.reload();
    } else {
      alert("Action failed. Check API connectivity.");
    }
    setLoading(false);
  };

  const handleAnalyze = async () => {
    setProcessing(true);
    const success = await analyzeSignal(signal.id);
    if (success) {
      alert("Analysis complete! Signal moved to Intelligence section.");
      window.location.reload();
    } else {
      alert("AI Analysis failed. Check Gemini API key.");
    }
    setProcessing(false);
  };

  if (isRaw) {
    return (
      <div className="flex gap-2 w-full md:w-auto shrink-0">
        <button 
          disabled={processing}
          onClick={handleAnalyze}
          className="flex-1 px-4 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 rounded-lg text-sm font-medium transition-all"
        >
          {processing ? '⚡ Processing...' : '✨ Process with Gemini'}
        </button>
        <button 
          disabled={processing}
          onClick={() => handleAction("dismiss")}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg text-sm font-medium transition-all border border-zinc-700"
        >
          Dismiss
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2 w-full md:w-auto shrink-0">
      <button 
        onClick={() => setShowAnalysis(!showAnalysis)}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${showAnalysis ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400' : 'bg-zinc-800 border-transparent text-zinc-300 hover:border-indigo-500/20'}`}
      >
        ✨ {showAnalysis ? 'Hide' : 'Analysis'}
      </button>
      
      <button 
        disabled={loading}
        onClick={() => handleAction("watchlist")}
        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-medium transition-all border border-zinc-700"
      >
        👁️ Watchlist
      </button>

      <button 
        disabled={loading}
        onClick={() => handleAction("act")}
        className="flex-1 md:flex-none px-6 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-indigo-500/20"
      >
        {loading ? '...' : 'Review'}
      </button>
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const fillClass = value > 0.7 ? "bg-emerald-500" : value > 0.4 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">{label}</span>
        <span className="text-[10px] font-mono text-zinc-400">{value.toFixed(1)}</span>
      </div>
      <div className="score-bar-bg h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full transition-all duration-1000 ${fillClass}`} style={{ width: `${value * 100}%` }} />
      </div>
    </div>
  );
}

function CaseBox({ label, content, color, icon }: any) {
  const colorClasses: any = {
    emerald: "border-emerald-500/10 hover:border-emerald-500/20 text-emerald-400",
    red: "border-red-500/10 hover:border-red-500/20 text-red-400"
  };
  return (
    <div className={`bg-zinc-900/50 rounded-lg p-4 border ${colorClasses[color]} transition-colors`}>
      <h5 className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
        <span>{icon}</span> {label}
      </h5>
      <p className="text-zinc-300 text-sm leading-relaxed">{content || `No ${label.toLowerCase()} available.`}</p>
    </div>
  );
}

function ComplianceCheck({ name, status }: any) {
  const statusClasses: any = {
    PASS: "bg-emerald-500/10 text-emerald-400",
    WARN: "bg-amber-500/10 text-amber-400",
    FAIL: "bg-red-500/10 text-red-400"
  };
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] text-zinc-500 font-medium uppercase">{name}</span>
      <div className={`text-[10px] font-bold px-2 py-0.5 rounded w-fit ${statusClasses[status]}`}>{status}</div>
    </div>
  );
}

function PriceInfo({ label, value, color = "text-white" }: any) {
  return (
    <div className="flex flex-col items-end">
      <span className="text-[10px] uppercase text-zinc-500 font-medium">{label}</span>
      <span className={`font-mono text-sm ${color}`}>${value.toFixed(2)}</span>
    </div>
  );
}
