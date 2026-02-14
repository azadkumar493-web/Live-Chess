
import React, { useRef, useEffect } from 'react';
import { History, ChevronRight } from 'lucide-react';

interface Props {
  history: string[];
}

const MoveHistory: React.FC<Props> = ({ history }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const pairs = [];
  for (let i = 0; i < history.length; i += 2) {
    pairs.push({
      num: Math.floor(i / 2) + 1,
      white: history[i],
      black: history[i + 1] || null
    });
  }

  return (
    <div className="h-48 flex flex-col bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden shrink-0">
      <div className="p-3 border-b border-zinc-800 bg-zinc-800/20 flex items-center gap-2">
        <History size={16} className="text-zinc-500" />
        <h2 className="text-xs font-bold tracking-tight uppercase text-zinc-400">Move History</h2>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-2">
        <div className="grid grid-cols-1 gap-1">
          {pairs.length === 0 ? (
            <div className="text-zinc-600 text-[10px] text-center mt-8 uppercase tracking-widest font-medium">No moves recorded</div>
          ) : (
            pairs.map((p, idx) => (
              <div key={idx} className="flex items-center hover:bg-zinc-800/40 rounded px-2 py-1 transition-colors group">
                <span className="w-6 text-[10px] font-mono text-zinc-600">{p.num}.</span>
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <span className="text-sm font-medium text-zinc-200 group-hover:text-indigo-300 transition-colors">{p.white}</span>
                  {p.black && <span className="text-sm font-medium text-zinc-400">{p.black}</span>}
                </div>
                <ChevronRight size={12} className="text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="p-2 border-t border-zinc-800 bg-zinc-900/80 text-[10px] text-zinc-500 font-medium flex justify-between">
        <span>TOTAL MOVES: {history.length}</span>
        <span className="text-indigo-400/50">PGN FORMAT</span>
      </div>
    </div>
  );
};

export default MoveHistory;
