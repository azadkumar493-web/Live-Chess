
import React from 'react';
import { ShieldAlert, Target, Lightbulb, Zap, Loader2 } from 'lucide-react';

interface Insight {
  strategy: string;
  threatLevel: string;
  threatDescription: string;
  recommendation: string;
}

interface Props {
  insight: Insight | null;
  isAnalyzing: boolean;
}

const OpponentInsight: React.FC<Props> = ({ insight, isAnalyzing }) => {
  if (!insight && !isAnalyzing) return (
    <div className="glass-panel rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center text-center space-y-2 opacity-50">
      <Zap size={24} className="text-zinc-700" />
      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Waiting for Opponent Move...</p>
    </div>
  );

  const getThreatColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 space-y-4 border border-indigo-500/10 shadow-xl relative overflow-hidden">
      {isAnalyzing && (
        <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center space-y-3 animate-in fade-in duration-300">
          <Loader2 className="animate-spin text-indigo-500" size={32} />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Scanning Tactics...</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert size={16} className="text-indigo-400" />
          <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Tactical Insight</h3>
        </div>
        {insight && (
          <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${getThreatColor(insight.threatLevel)}`}>
            {insight.threatLevel} Threat
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[9px] font-black text-zinc-600 uppercase tracking-tighter">
            <Target size={12} /> Opponent Goal
          </div>
          <p className="text-xs text-zinc-200 font-medium leading-relaxed">
            {insight?.strategy || "Analyzing strategic posture..."}
          </p>
        </div>

        <div className="space-y-1 bg-white/5 p-3 rounded-xl border border-white/5">
          <div className="flex items-center gap-2 text-[9px] font-black text-zinc-600 uppercase tracking-tighter">
            <ShieldAlert size={12} className="text-red-500" /> Detected Threat
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed italic">
            "{insight?.threatDescription}"
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[9px] font-black text-indigo-400 uppercase tracking-tighter">
            <Lightbulb size={12} /> GM Recommendation
          </div>
          <p className="text-xs text-indigo-100 font-semibold leading-relaxed">
            {insight?.recommendation}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OpponentInsight;
