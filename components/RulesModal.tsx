
import React from 'react';
import { X, BookOpen, ChevronRight, Info } from 'lucide-react';
import { GameMode } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedMode: GameMode;
}

const RulesModal: React.FC<Props> = ({ isOpen, onClose, selectedMode }) => {
  if (!isOpen) return null;

  const modeExplanations: Record<GameMode, { title: string; text: string }> = {
    [GameMode.PvAI]: {
      title: "Vs Gemini AI",
      text: "Challenge our elite AI powered by Google Gemini. The engine analyzes the board in real-time to find the optimal move while providing grandmaster-level commentary on your play style."
    },
    [GameMode.PvP_Online]: {
      title: "Global Matchmaking",
      text: "Battle against other players worldwide. Our matchmaking system pairs you with opponents of similar ELO ratings. Features live spectator chat and real-time move validation."
    },
    [GameMode.PvP_Local]: {
      title: "Local Battle",
      text: "Perfect for playing with a friend on the same device. The board remains shared, and players take turns moving for White and Black. Great for analysis and casual matches."
    }
  };

  const rules = [
    { title: "The Objective", content: "Checkmate your opponent's king by placing it under a direct attack from which it cannot escape." },
    { title: "Special Moves", content: "Castling (King and Rook swap), En Passant (special pawn capture), and Pawn Promotion (reaching the 8th rank)." },
    { title: "Time Control", content: "Each player has a limited time. If your clock hits zero, you lose the match regardless of the board position." }
  ];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-6 border-b border-zinc-800 bg-zinc-800/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <BookOpen size={20} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Handbook & Rules</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Selected Mode Info */}
          <section className="space-y-3 bg-indigo-600/10 p-5 rounded-2xl border border-indigo-500/20">
            <div className="flex items-center gap-2 text-indigo-400">
              <Info size={16} />
              <h3 className="text-xs font-black uppercase tracking-widest">Active Mode: {modeExplanations[selectedMode].title}</h3>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">
              {modeExplanations[selectedMode].text}
            </p>
          </section>

          {/* Core Rules */}
          <section className="space-y-4">
            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Chess Fundamentals</h3>
            <div className="space-y-3">
              {rules.map((rule, i) => (
                <div key={i} className="flex gap-4 p-4 bg-zinc-800/30 rounded-xl border border-zinc-700/30">
                  <div className="mt-1">
                    <ChevronRight size={14} className="text-indigo-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-200 mb-1">{rule.title}</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">{rule.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* AI Features */}
          <section className="space-y-4">
            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Live Commentary</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Our platform uses Gemini Flash 2.5 to provide real-time analysis of every move. Look at the 'Live Feed' to see the AI's thoughts on your positional advantage or tactical errors.
            </p>
          </section>
        </div>

        <div className="p-6 border-t border-zinc-800 flex justify-center bg-zinc-900">
          <button
            onClick={onClose}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20"
          >
            Got it, let's play!
          </button>
        </div>
      </div>
    </div>
  );
};

export default RulesModal;
