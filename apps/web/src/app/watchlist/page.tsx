import React from "react";
import Link from "next/link";
import SignalCard from "@/components/SignalCard";
import MarketPulse from "@/components/MarketPulse";
import { getWatchlist } from "@/app/actions";

export default async function WatchlistPage() {
  const watchlist = await getWatchlist();

  return (
    <main className="min-h-screen bg-[#050505] text-zinc-300 selection:bg-indigo-500/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* Navigation / Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-zinc-500 hover:text-white transition-colors">Signals</Link>
              <span className="text-zinc-700">/</span>
              <h1 className="text-4xl font-black tracking-tighter text-white">
                WATCHLIST<span className="text-indigo-500">.</span>
              </h1>
            </div>
            <p className="text-zinc-500 font-medium">Monitoring high-priority semiconductor intelligence.</p>
          </div>
          
          <div className="flex gap-3">
            <div className="glass-panel px-4 py-2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Live Monitoring</span>
            </div>
          </div>
        </header>

        {/* Market Ticker */}
        <section className="space-y-4">
          <div className="flex justify-between items-end px-1">
            <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Sector Pulse</h2>
          </div>
          <MarketPulse />
        </section>

        {/* Watchlist Grid */}
        <section className="space-y-6">
          <div className="flex justify-between items-end px-1">
            <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Active Watchlist ({watchlist.length})</h2>
          </div>

          {watchlist.length === 0 ? (
            <div className="glass-panel p-20 flex flex-col items-center justify-center text-center space-y-4 border-dashed">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center text-2xl border border-zinc-800">
                👁️
              </div>
              <div className="space-y-1">
                <h3 className="text-white font-bold">Watchlist is Empty</h3>
                <p className="text-zinc-500 text-sm max-w-xs">Items you mark for monitoring will appear here for long-term tracking.</p>
              </div>
              <Link href="/" className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium transition-all">
                Back to Signals
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {watchlist.map((signal: any) => (
                <SignalCard key={signal.id} signal={signal} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Footer Branding */}
      <footer className="py-12 border-t border-zinc-900 text-center">
        <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-[0.5em]">SigInt Production Environment v1.2.0</p>
      </footer>
    </main>
  );
}
