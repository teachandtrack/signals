"use client";

import React from "react";

export default function PortfolioPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white mb-1">Paper Portfolio & Risk</h2>
          <p className="text-zinc-400 text-sm">Monitor your signal-driven investments and exposure.</p>
        </div>
        
        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-indigo-500/20">
          + Add Position
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Risk Assessment Panel (Stolen from n8n bot) */}
        <div className="md:col-span-1 space-y-6">
          <div className="glass-panel p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Risk Assessment</h3>
            
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-zinc-800/50">
              <div className="w-16 h-16 rounded-full border-4 border-amber-500 flex items-center justify-center text-amber-500 font-bold text-xl">
                6.5
              </div>
              <div>
                <p className="text-sm text-zinc-400 uppercase tracking-wider font-bold">Risk Level</p>
                <p className="text-xl font-semibold text-white">MODERATE</p>
              </div>
            </div>

            <div className="space-y-4">
              <RiskMetric label="Diversification Score" value="4/10" color="text-red-400" />
              <RiskMetric label="Volatility (30d)" value="18.2%" color="text-amber-400" />
              <RiskMetric label="Beta vs SPY" value="1.45" color="text-red-400" />
              <RiskMetric label="Sharpe Ratio" value="1.2" color="text-emerald-400" />
            </div>

            <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-sm text-amber-400 font-medium mb-1">Concentration Warning</p>
              <p className="text-xs text-amber-500/80">You have 65% of your portfolio concentrated in just 2 semiconductor assets (TSM, NVDA). Consider diversifying.</p>
            </div>
          </div>
        </div>

        {/* Holdings Panel */}
        <div className="md:col-span-2">
          <div className="glass-panel p-6 h-full">
            <h3 className="text-lg font-semibold text-white mb-6">Current Holdings</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400">
                    <th className="pb-3 font-medium">Asset</th>
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 font-medium text-right">Shares</th>
                    <th className="pb-3 font-medium text-right">Current Price</th>
                    <th className="pb-3 font-medium text-right">Total Value</th>
                    <th className="pb-3 font-medium text-right">Return</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  <HoldingRow symbol="TSM" type="Stock" shares={150} price={142.50} value={21375.00} ret={12.4} />
                  <HoldingRow symbol="NVDA" type="Stock" shares={45} price={875.20} value={39384.00} ret={45.2} />
                  <HoldingRow symbol="ASML" type="Stock" shares={12} price={950.00} value={11400.00} ret={-2.1} />
                  <HoldingRow symbol="BTC" type="Crypto" shares={0.5} price={64200.00} value={32100.00} ret={8.5} />
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RiskMetric({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-zinc-400">{label}</span>
      <span className={`font-mono text-sm font-medium ${color}`}>{value}</span>
    </div>
  );
}

function HoldingRow({ symbol, type, shares, price, value, ret }: any) {
  const isPositive = ret > 0;
  return (
    <tr className="hover:bg-zinc-800/30 transition-colors">
      <td className="py-4 font-mono font-medium text-indigo-400">${symbol}</td>
      <td className="py-4 text-zinc-500 text-xs uppercase tracking-wider">{type}</td>
      <td className="py-4 text-right font-mono text-zinc-300">{shares}</td>
      <td className="py-4 text-right font-mono text-zinc-300">${price.toFixed(2)}</td>
      <td className="py-4 text-right font-mono text-white">${value.toFixed(2)}</td>
      <td className={`py-4 text-right font-mono ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
        {isPositive ? '+' : ''}{ret}%
      </td>
    </tr>
  );
}
