"use client";

import { useEffect, useState } from "react";
import SignalCard from "@/components/SignalCard";

// Using a fallback mock data since API might not be running yet
const MOCK_SIGNALS = [
  {
    id: 1,
    title: "TSMC plans 2nm fab expansion in Taiwan amid rising AI demand",
    summary: "Taiwan Semiconductor Manufacturing Co. has finalized plans to expand its 2nm foundry capacity earlier than expected, driven by significant advanced packaging demand from Nvidia and Apple. Construction to begin Q3.",
    compliance_status: "green",
    status: "pending",
    scores: {
      novelty: 0.8,
      relevance: 1.0,
      timing: 0.9,
      evidence: 0.7,
      tradability: 0.8,
      safety: 0.9,
      total: 0.87
    },
    trade_plan: {
      ticker: "TSM",
      action: "BUY",
      current_price: 142.50,
      target_price: 165.30,
      stop_loss: 131.10,
      confidence: "HIGH",
      horizon: "2-6 Weeks"
    },
    created_at: new Date().toISOString(),
    tickers: ["TSM", "NVDA", "AAPL"]
  },
  {
    id: 2,
    title: "ASML faces potential new export restrictions to China",
    summary: "New discussions in Washington indicate pressure on the Dutch government to further restrict ASML's ability to service existing DUV lithography equipment in Chinese fabs, potentially impacting service revenue.",
    compliance_status: "green",
    status: "pending",
    scores: {
      novelty: 0.6,
      relevance: 0.9,
      timing: 0.4,
      evidence: 0.5,
      tradability: 0.6,
      safety: 0.8,
      total: 0.65
    },
    trade_plan: {
      ticker: "ASML",
      action: "HOLD",
      current_price: 950.00,
      target_price: 950.00,
      stop_loss: 902.50,
      confidence: "MEDIUM",
      horizon: "Monitor"
    },
    created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    tickers: ["ASML"]
  },
  {
    id: 3,
    title: "Intel delays Ohio fab construction timeline by 18 months",
    summary: "Intel has reportedly delayed the timeline for its massive Ohio fabrication facility due to slower-than-expected market recovery and CHIPS act funding delays. Equipment move-in pushed to 2026.",
    compliance_status: "green",
    status: "pending",
    scores: {
      novelty: 0.9,
      relevance: 0.9,
      timing: 0.8,
      evidence: 0.8,
      tradability: 0.7,
      safety: 0.8,
      total: 0.82
    },
    trade_plan: {
      ticker: "INTC",
      action: "SELL",
      current_price: 34.20,
      target_price: 29.50,
      stop_loss: 36.50,
      confidence: "HIGH",
      horizon: "1-3 Weeks"
    },
    created_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    tickers: ["INTC"]
  }
];

import MarketPulse from "@/components/MarketPulse";

import Link from "next/link";
import { getSignals } from "./actions";

export default function QueuePage() {
  const [signals, setSignals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchSignals = async () => {
    setIsRefreshing(true);
    try {
      const data = await getSignals();
      console.log("Fetched signals count:", data?.length);
      setSignals(data || []);
    } catch (err) {
      console.error("Failed to fetch real signals:", err);
      setSignals([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSignals();
  }, []);

  if (loading && signals.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center space-y-4 pt-20">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="text-zinc-400 font-medium animate-pulse">Scanning signal queue...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-12">
      
      {/* Market Pulse Section */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest px-1">Market Pulse</h3>
        <MarketPulse />
      </section>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white mb-1">Awaiting Review</h2>
          <p className="text-zinc-400 text-sm">You have {signals.length} high-confidence signals to process.</p>
        </div>
        
        <div className="flex gap-2">
          <Link 
            href="/watchlist"
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg text-sm font-medium transition-colors border border-zinc-700"
          >
            👁️ Watchlist
          </Link>
          <button 
            onClick={() => alert("Filter functionality coming soon.")}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-medium transition-colors border border-zinc-700"
          >
            Filter
          </button>
          <button 
            onClick={fetchSignals}
            disabled={isRefreshing}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 disabled:opacity-50"
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh Feed'}
          </button>
        </div>
      </div>

      {/* Analyzed Signals Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 px-1">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
          <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Analyzed Intelligence</h3>
        </div>
        {signals.filter(s => !s.summary?.includes("Analysis skipped")).length === 0 ? (
          <div className="text-center py-10 bg-zinc-900/30 rounded-xl border border-dashed border-zinc-800">
            <p className="text-zinc-500 text-sm">No fully analyzed signals yet.</p>
          </div>
        ) : (
          signals.filter(s => !s.summary?.includes("Analysis skipped")).map((signal, idx) => (
            <div 
              key={signal.id} 
              className="opacity-0 animate-[fade-in-up_0.5s_ease-out_forwards]"
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              <SignalCard signal={signal} />
            </div>
          ))
        )}
      </div>

      {/* Raw Data Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 px-1 pt-6">
          <div className="w-2 h-2 rounded-full bg-zinc-600"></div>
          <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Raw Intelligence Feed</h3>
        </div>
        <p className="text-xs text-zinc-500 px-1 -mt-4">Signals awaiting deep-dive analysis. These are processed slowly to maintain API health.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {signals.filter(s => s.summary?.includes("Analysis skipped")).length === 0 ? (
            <div className="col-span-full text-center py-10 bg-zinc-900/30 rounded-xl border border-dashed border-zinc-800">
              <p className="text-zinc-500 text-sm">No raw data in queue.</p>
            </div>
          ) : (
            signals.filter(s => s.summary?.includes("Analysis skipped")).map((signal, idx) => (
              <div 
                key={signal.id} 
                className="opacity-0 animate-[fade-in-up_0.5s_ease-out_forwards]"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <SignalCard signal={signal} isRaw={true} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
