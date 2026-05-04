"use client";

import React, { useEffect, useState } from "react";

export default function MarketPulse() {
  const [prices, setPrices] = useState<any[]>([]);

  useEffect(() => {
    // In a real app, this would fetch from yfinance via our API
    // For now, let's just use some realistic mock data that updates
    const initialPrices = [
      { symbol: "NVDA", name: "NVIDIA", price: 875.20, change: 2.4, status: "up" },
      { symbol: "TSM", name: "TSMC", price: 142.50, change: -0.8, status: "down" },
      { symbol: "ASML", name: "ASML", price: 950.00, change: 1.2, status: "up" },
      { symbol: "AMD", name: "AMD", price: 168.45, change: 0.5, status: "up" },
      { symbol: "AVGO", name: "Broadcom", price: 1342.10, change: -1.4, status: "down" },
    ];
    setPrices(initialPrices);
  }, []);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
      {prices.map((p) => (
        <div key={p.symbol} className="glass-panel px-4 py-3 min-w-[180px] flex justify-between items-center group">
          <div>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{p.name}</p>
            <p className="text-sm font-mono font-bold text-white group-hover:text-indigo-400 transition-colors">${p.price.toFixed(2)}</p>
          </div>
          <div className={`text-xs font-mono font-bold px-2 py-1 rounded ${p.status === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            {p.status === 'up' ? '↑' : '↓'} {Math.abs(p.change)}%
          </div>
        </div>
      ))}
    </div>
  );
}
