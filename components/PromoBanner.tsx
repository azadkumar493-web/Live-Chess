
import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

const PromoBanner: React.FC = () => {
  return (
    <div className="relative group overflow-hidden glass-panel rounded-2xl p-5 border border-indigo-500/20 shadow-lg shadow-indigo-500/5">
      {/* Animated background glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-indigo-500/20 blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000 animate-pulse" />
      
      <div className="relative space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 px-2 py-1 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
            <Sparkles size={12} className="text-indigo-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Premium Access</span>
          </div>
          <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Sponsored</div>
        </div>

        <div>
          <h3 className="text-sm font-black text-white tracking-tight leading-tight">
            UPGRADE TO GRANDMASTER PRO
          </h3>
          <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
            Unlock unlimited Gemini-3 Pro analysis, custom 4K board skins, and ad-free global matchmaking.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-bold uppercase tracking-tighter">
            <ShieldCheck size={14} className="text-emerald-500" /> Verified Anti-Cheat Elite
          </div>
          <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-bold uppercase tracking-tighter">
            <Zap size={14} className="text-yellow-500" /> Priority Server Connection
          </div>
        </div>

        <button className="group/btn relative w-full flex items-center justify-center gap-2 py-3 bg-white text-black rounded-xl font-black text-xs uppercase tracking-widest transition-all hover:bg-indigo-50 shadow-xl active:scale-95">
          Join the Elite
          <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default PromoBanner;
