
import React, { useRef, useEffect } from 'react';
import { Terminal, User, Brain, MessageCircle } from 'lucide-react';
import { AnalysisMessage } from '../types';

interface Props {
  messages: AnalysisMessage[];
}

const AnalysisPanel: React.FC<Props> = ({ messages }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-zinc-800 bg-zinc-800/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle size={18} className="text-indigo-400" />
          <h2 className="text-sm font-bold tracking-tight uppercase">Live Feed</h2>
        </div>
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.role === 'system' ? 'opacity-50 italic' : ''}`}
          >
            <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
              msg.role === 'ai' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20' :
              msg.role === 'player' ? 'bg-zinc-700/50 text-zinc-300' : 
              msg.role === 'viewer' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-500'
            }`}>
              {msg.role === 'ai' ? <Brain size={14} /> : 
               msg.role === 'player' ? <User size={14} /> : 
               msg.role === 'viewer' ? <MessageCircle size={14} /> : <Terminal size={14} />}
            </div>
            <div className="flex-1 space-y-1">
              <div className="text-[10px] font-bold text-zinc-500 flex justify-between uppercase">
                <span>{msg.author || (msg.role === 'ai' ? 'GEMINI GM' : msg.role)}</span>
                <span className="font-normal opacity-50">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
              </div>
              <p className={`text-sm leading-relaxed p-3 rounded-xl rounded-tl-none border shadow-sm ${
                msg.role === 'ai' ? 'bg-indigo-600/10 text-indigo-100 border-indigo-500/20' :
                msg.role === 'viewer' ? 'bg-emerald-500/5 text-emerald-100 border-emerald-500/10 italic' :
                'bg-zinc-800/30 text-zinc-300 border-zinc-700/30'
              }`}>
                {msg.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalysisPanel;
