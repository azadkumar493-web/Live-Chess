
import React from 'react';
import { X, Clock, Brain, RefreshCw, Layers } from 'lucide-react';

interface Settings {
  initialTime: number;
  aiPersonality: string;
  orientation: 'w' | 'b';
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onUpdate: (settings: Settings) => void;
}

const AI_PERSONALITIES = ["Balanced", "Aggressive", "Defensive", "Grandmaster", "Experimental"];
const TIME_OPTIONS = [
  { label: '1m (Bullet)', value: 60 },
  { label: '3m (Blitz)', value: 180 },
  { label: '5m (Blitz)', value: 300 },
  { label: '10m (Rapid)', value: 600 },
  { label: '30m (Classical)', value: 1800 },
];

const SettingsModal: React.FC<Props> = ({ isOpen, onClose, settings, onUpdate }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Layers className="text-indigo-500" size={20} />
            Game Settings
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Time Controls */}
          <div className="space-y-3">
            <label className="text-xs font-black text-zinc-500 uppercase flex items-center gap-2">
              <Clock size={14} /> Time Control (Next Game)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TIME_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onUpdate({ ...settings, initialTime: opt.value })}
                  className={`p-3 rounded-xl text-xs font-bold transition-all border ${
                    settings.initialTime === opt.value
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* AI Personality */}
          <div className="space-y-3">
            <label className="text-xs font-black text-zinc-500 uppercase flex items-center gap-2">
              <Brain size={14} /> AI Engine Personality
            </label>
            <div className="flex flex-wrap gap-2">
              {AI_PERSONALITIES.map((p) => (
                <button
                  key={p}
                  onClick={() => onUpdate({ ...settings, aiPersonality: p })}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                    settings.aiPersonality === p
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Board Orientation */}
          <div className="space-y-3">
            <label className="text-xs font-black text-zinc-500 uppercase flex items-center gap-2">
              <RefreshCw size={14} /> Board Orientation
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onUpdate({ ...settings, orientation: 'w' })}
                className={`p-3 rounded-xl text-xs font-bold transition-all border ${
                  settings.orientation === 'w'
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                }`}
              >
                White at Bottom
              </button>
              <button
                onClick={() => onUpdate({ ...settings, orientation: 'b' })}
                className={`p-3 rounded-xl text-xs font-bold transition-all border ${
                  settings.orientation === 'b'
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                }`}
              >
                Black at Bottom
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 bg-zinc-800/50 flex justify-end">
          <button
            onClick={onClose}
            className="bg-zinc-100 text-zinc-900 px-6 py-2 rounded-xl font-bold hover:bg-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
