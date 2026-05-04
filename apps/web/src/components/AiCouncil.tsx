import React, { useState } from 'react';

const AGENTS = [
  {
    id: 'buffett',
    name: 'Warren Buffett',
    role: 'Value & Moat Focus',
    color: 'from-blue-500 to-cyan-500',
    avatar: '👔'
  },
  {
    id: 'dalio',
    name: 'Ray Dalio',
    role: 'Macro & Risk Parity',
    color: 'from-emerald-500 to-teal-500',
    avatar: '🌊'
  },
  {
    id: 'wood',
    name: 'Cathie Wood',
    role: 'Disruptive Innovation',
    color: 'from-fuchsia-500 to-pink-500',
    avatar: '🚀'
  },
  {
    id: 'ackman',
    name: 'Bill Ackman',
    role: 'Activist & Catalyst',
    color: 'from-amber-500 to-orange-500',
    avatar: '🎯'
  }
];

export default function AiCouncil({ signalContext }: { signalContext: any }) {
  const [activeAgent, setActiveAgent] = useState(AGENTS[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysis, setAnalysis] = useState<Record<string, string>>({});

  const generateAnalysis = () => {
    setIsGenerating(true);
    // Simulate LLM generation delay
    setTimeout(() => {
      setAnalysis({
        buffett: "The semiconductor industry is highly capital intensive, which usually violates my rule of thumb for businesses with durable economic moats. However, TSMC's manufacturing monopoly is a rare exception. If this signal implies a widening of that moat, it's a wonderful business at a fair price.",
        dalio: "From a macro perspective, semiconductor supply chains are the new oil. This signal indicates a shift in geopolitical risk paradigms. You must balance this position with uncorrelated assets, perhaps long commodities or specific fiat hedges, to maintain a risk-neutral stance.",
        wood: "This is exactly the kind of exponential growth catalyst we look for! The convergence of AI demand and advanced packaging bottlenecks means companies at the forefront of this specific technology will capture disproportionate market share over the next 5 years. Massive conviction here.",
        ackman: "There is a clear catalyst here. The market is fundamentally mispricing the near-term cash flow generation resulting from this event. If management executes on this expansion effectively, the upside asymmetry is massive. I would size this aggressively."
      });
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="mt-6 pt-6 border-t border-zinc-800/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col">
          <h4 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            AI Investment Council
          </h4>
          <span className="text-xs text-amber-500/80 mt-1">⚠️ Note: Requesting analysis consumes LLM API credits.</span>
        </div>
        
        {Object.keys(analysis).length === 0 ? (
          <button 
            onClick={generateAnalysis}
            disabled={isGenerating}
            className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-lg text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? "Consulting Agents..." : "Request Analysis (Uses Credits)"}
          </button>
        ) : null}
      </div>

      {(isGenerating || Object.keys(analysis).length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {AGENTS.map(agent => (
            <button
              key={agent.id}
              onClick={() => setActiveAgent(agent.id)}
              className={`flex flex-col items-center p-3 rounded-xl border transition-all ${
                activeAgent === agent.id 
                  ? `bg-zinc-800/80 border-zinc-600 shadow-lg` 
                  : `bg-zinc-900/50 border-zinc-800/50 hover:bg-zinc-800/50 opacity-60 hover:opacity-100`
              }`}
            >
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${agent.color} flex items-center justify-center text-lg mb-2 shadow-inner`}>
                {agent.avatar}
              </div>
              <span className="text-sm font-medium text-white">{agent.name}</span>
              <span className="text-[10px] text-zinc-400 text-center mt-1 uppercase tracking-wider">{agent.role}</span>
            </button>
          ))}
        </div>
      )}

      {Object.keys(analysis).length > 0 && (
        <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-5 relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${AGENTS.find(a => a.id === activeAgent)?.color}`} />
          <p className="text-zinc-300 leading-relaxed italic text-sm md:text-base pl-2">
            "{analysis[activeAgent]}"
          </p>
        </div>
      )}
    </div>
  );
}
