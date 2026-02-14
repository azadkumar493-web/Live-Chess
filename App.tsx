
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Chess } from 'https://esm.sh/chess.js';
import { 
  Trophy, RotateCcw, Users, Cpu, AlertCircle, 
  BrainCircuit, Settings, Info, Globe, Shield, Zap, Search,
  Mail, Facebook, Instagram, LogIn, Loader2, BookOpen,
  Wifi, Radio, User, Share2
} from 'lucide-react';
import { GameMode, GameState, PlayerColor, AnalysisMessage, Player } from './types';
import { analyzeBoard, getBestMove, generateSpectatorChat, analyzeOpponentStrategy } from './services/geminiService';
import ChessBoardComponent from './components/ChessBoard';
import AnalysisPanel from './components/AnalysisPanel';
import MoveHistory from './components/MoveHistory';
import SettingsModal from './components/SettingsModal';
import RulesModal from './components/RulesModal';
import PromoBanner from './components/PromoBanner';
import OpponentInsight from './components/OpponentInsight';
import ShareActions from './components/ShareActions';

const DEFAULT_TIME = 600; // 10 minutes

const App: React.FC = () => {
  const [game, setGame] = useState(new Chess());
  const [isLobby, setIsLobby] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  
  const [userProfile, setUserProfile] = useState<Player>({ name: 'Guest_Grandmaster', rating: 1200 });
  const [opponent, setOpponent] = useState<Player | null>(null);

  const [opponentInsight, setOpponentInsight] = useState<any>(null);
  const [isAnalyzingOpponent, setIsAnalyzingOpponent] = useState(false);

  const [appSettings, setAppSettings] = useState({
    initialTime: DEFAULT_TIME,
    aiPersonality: 'Balanced',
    orientation: 'w' as 'w' | 'b'
  });

  const [gameState, setGameState] = useState<GameState>({
    fen: 'start',
    turn: 'w',
    history: [],
    isGameOver: false,
    winner: null,
    mode: GameMode.PvAI,
    lastMove: null,
    inCheck: false,
    timers: { w: DEFAULT_TIME, b: DEFAULT_TIME }
  });
  
  const [analysis, setAnalysis] = useState<AnalysisMessage[]>([
    { role: 'system', text: 'Connecting to Grandmaster Live clusters...', timestamp: Date.now() }
  ]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  
  const gameRef = useRef(game);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  useEffect(() => {
    if (!isLobby && !gameState.isGameOver) {
      timerRef.current = window.setInterval(() => {
        setGameState(prev => ({
          ...prev,
          timers: {
            ...prev.timers,
            [prev.turn]: Math.max(0, prev.timers[prev.turn] - 1)
          }
        }));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isLobby, gameState.turn, gameState.isGameOver]);

  useEffect(() => {
    if (gameState.timers.w === 0) endByTime('b');
    if (gameState.timers.b === 0) endByTime('w');
  }, [gameState.timers]);

  const endByTime = (winner: PlayerColor) => {
    setGameState(prev => ({ ...prev, isGameOver: true, winner }));
    addAnalysis(`Time expired! ${winner === 'w' ? 'White' : 'Black'} wins on time.`, 'system');
  };

  const updateGameState = useCallback(() => {
    const current = gameRef.current;
    setGameState(prev => ({
      ...prev,
      fen: current.fen(),
      turn: current.turn(),
      history: current.history(),
      isGameOver: current.isGameOver(),
      winner: current.isCheckmate() ? (current.turn() === 'w' ? 'b' : 'w') : current.isDraw() ? 'draw' : null,
      inCheck: current.inCheck()
    }));
    setMoveHistory(current.history());
  }, []);

  const addAnalysis = (text: string, role: AnalysisMessage['role'] = 'ai', author?: string) => {
    setAnalysis(prev => [...prev, { role, text, author, timestamp: Date.now() }].slice(-15));
  };

  const handleMove = useCallback(async (moveObj: { from: string, to: string, promotion?: string }) => {
    try {
      const result = gameRef.current.move(moveObj);
      if (result) {
        setGameState(prev => ({ ...prev, lastMove: { from: moveObj.from, to: moveObj.to } }));
        updateGameState();
        
        const commentary = await analyzeBoard(gameRef.current.fen(), gameRef.current.history());
        addAnalysis(commentary);

        if (Math.random() > 0.6) {
          const chat = await generateSpectatorChat(gameRef.current.fen(), result.san);
          const authors = ["ChessFan99", "MagnusSmurf", "QueenSlayer", "E4Master"];
          addAnalysis(chat, 'viewer', authors[Math.floor(Math.random() * authors.length)]);
        }

        if ((gameState.mode === GameMode.PvAI || gameState.mode === GameMode.PvP_Online) && !gameRef.current.isGameOver()) {
          setIsAiThinking(true);
          const personality = gameState.mode === GameMode.PvP_Online ? "Human-like" : appSettings.aiPersonality;
          const aiMoveResult = await getBestMove(gameRef.current.fen(), personality);
          
          if (aiMoveResult && aiMoveResult.move) {
            const from = aiMoveResult.move.slice(0, 2);
            const to = aiMoveResult.move.slice(2, 4);
            const promotion = aiMoveResult.move.length > 4 ? aiMoveResult.move[4] : 'q';
            
            setTimeout(async () => {
              const aiMove = gameRef.current.move({ from, to, promotion });
              if (aiMove) {
                setGameState(prev => ({ ...prev, lastMove: { from, to } }));
                updateGameState();
                addAnalysis(aiMoveResult.explanation, gameState.mode === GameMode.PvP_Online ? 'player' : 'ai', opponent?.name);
                
                setIsAnalyzingOpponent(true);
                const insight = await analyzeOpponentStrategy(gameRef.current.fen(), aiMove.san);
                setOpponentInsight(insight);
                setIsAnalyzingOpponent(false);
              }
              setIsAiThinking(false);
            }, Math.random() * 2000 + 500);
          }
        } else if (gameState.mode === GameMode.PvP_Local) {
          setIsAnalyzingOpponent(true);
          const insight = await analyzeOpponentStrategy(gameRef.current.fen(), result.san);
          setOpponentInsight(insight);
          setIsAnalyzingOpponent(false);
        }
        return true;
      }
    } catch (e) { console.error("Invalid move", e); }
    return false;
  }, [gameState.mode, opponent, updateGameState, appSettings.aiPersonality]);

  const handleSocialLogin = (provider: string) => {
    setIsAuthenticating(provider);
    setTimeout(() => {
      setIsAuthenticating(null);
      const mockNames: Record<string, string> = {
        Google: 'GM_Google_User',
        Facebook: 'FB_Chess_Master',
        Instagram: 'Insta_Grandmaster'
      };
      setUserProfile({
        name: mockNames[provider] || 'Social_Player',
        rating: 1450,
        avatar: provider.toLowerCase()
      });
      addAnalysis(`Successfully authenticated via ${provider}. Welcome back!`, 'system');
    }, 1500);
  };

  const startMatch = (mode: GameMode) => {
    if (mode === GameMode.PvP_Online) {
      setIsSearching(true);
      setTimeout(() => {
        setIsSearching(false);
        setOpponent({ name: 'Anonymous_GM', rating: 2450 });
        initGame(mode);
      }, 2500);
    } else {
      setOpponent(mode === GameMode.PvAI ? { name: 'Gemini Engine', rating: 3500 } : { name: 'Local Player', rating: 1200 });
      initGame(mode);
    }
  };

  const initGame = (mode: GameMode) => {
    const newGame = new Chess();
    setGame(newGame);
    gameRef.current = newGame;
    setGameState({
      fen: 'start',
      turn: 'w',
      history: [],
      isGameOver: false,
      winner: null,
      mode,
      lastMove: null,
      inCheck: false,
      timers: { w: appSettings.initialTime, b: appSettings.initialTime }
    });
    setMoveHistory([]);
    setAnalysis([{ role: 'system', text: `Match started: ${mode}.`, timestamp: Date.now() }]);
    setOpponentInsight(null);
    setIsLobby(false);
  };

  const handleShareMatch = async () => {
    const shareData = {
      title: 'Watch my Chess Match',
      text: `I'm playing a match on Grandmaster Live! FEN: ${gameState.fen}`,
      url: window.location.href,
    };
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Match link copied to clipboard!');
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (isLobby) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 overflow-y-auto">
        <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} selectedMode={gameState.mode} />

        <div className="max-w-md w-full space-y-10 text-center my-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="relative inline-flex mb-4">
             <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 glow-effect" />
             <div className="relative p-6 bg-indigo-600 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(79,70,229,0.5)] transform hover:scale-105 transition-transform duration-500">
               <Trophy size={64} className="text-white" />
             </div>
          </div>
          
          <div>
            <h1 className="text-6xl font-[900] tracking-tighter text-white mb-3">GM LIVE</h1>
            <p className="text-zinc-500 font-medium tracking-wide uppercase text-xs">Full HD Live Interaction • AI Analysis • Global Arena</p>
          </div>

          <div className="glass-panel p-10 rounded-[3rem] space-y-8 shadow-2xl border border-white/5">
            <div className="space-y-5">
              <label className="text-[10px] font-[900] text-zinc-500 uppercase tracking-[0.3em]">Identity Hub</label>
              <div className="grid grid-cols-3 gap-4">
                <button onClick={() => handleSocialLogin('Google')} disabled={!!isAuthenticating} className="flex items-center justify-center p-5 bg-white/95 hover:bg-white text-black rounded-3xl transition-all shadow-xl active:scale-90 disabled:opacity-50">
                  {isAuthenticating === 'Google' ? <Loader2 className="animate-spin" size={24}/> : <Mail size={24} />}
                </button>
                <button onClick={() => handleSocialLogin('Facebook')} disabled={!!isAuthenticating} className="flex items-center justify-center p-5 bg-[#1877F2] hover:brightness-110 text-white rounded-3xl transition-all shadow-xl active:scale-90 disabled:opacity-50">
                  {isAuthenticating === 'Facebook' ? <Loader2 className="animate-spin" size={24}/> : <Facebook size={24} />}
                </button>
                <button onClick={() => handleSocialLogin('Instagram')} disabled={!!isAuthenticating} className="flex items-center justify-center p-5 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white rounded-3xl transition-all shadow-xl active:scale-90 disabled:opacity-50">
                  {isAuthenticating === 'Instagram' ? <Loader2 className="animate-spin" size={24}/> : <Instagram size={24} />}
                </button>
              </div>
            </div>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5"></span></div>
              <div className="relative flex justify-center"><span className="bg-[#0f0f14] px-4 text-zinc-600 font-bold text-[10px] uppercase tracking-widest">or entry manual</span></div>
            </div>

            <div className="space-y-6">
              <div className="relative group">
                <input type="text" value={userProfile.name} onChange={(e) => setUserProfile({...userProfile, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 pl-14 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-semibold placeholder-zinc-700" placeholder="Enter Call Sign..." />
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" size={20} />
              </div>

              <div className="grid grid-cols-1 gap-4 pt-2">
                <button disabled={isSearching || !!isAuthenticating} onClick={() => startMatch(GameMode.PvP_Online)} className="group relative overflow-hidden flex items-center justify-center gap-4 w-full p-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-3xl font-[900] text-lg transition-all shadow-[0_20px_40px_-10px_rgba(79,70,229,0.4)] disabled:opacity-50 active:scale-[0.98]">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  {isSearching ? <Loader2 className="animate-spin" /> : <Globe size={24} />}
                  <span className="tracking-tight">{isSearching ? 'SCANNING RADIUS...' : 'ENTER GLOBAL ARENA'}</span>
                </button>

                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => startMatch(GameMode.PvAI)} className="flex flex-col items-center justify-center gap-3 p-5 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-[2rem] border border-white/5 transition-all hover:border-indigo-500/30">
                    <Cpu size={28} className="text-indigo-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Neural Link</span>
                  </button>
                  <button onClick={() => startMatch(GameMode.PvP_Local)} className="flex flex-col items-center justify-center gap-3 p-5 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-[2rem] border border-white/5 transition-all hover:border-zinc-500/30">
                    <Users size={28} className="text-zinc-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Local Intel</span>
                  </button>
                </div>
                
                <div className="py-4">
                  <ShareActions />
                </div>

                <button onClick={() => setIsRulesOpen(true)} className="flex items-center justify-center gap-2 text-[10px] font-black text-zinc-500 uppercase hover:text-indigo-400 transition-colors tracking-widest pt-2">
                  <BookOpen size={14} /> MANUALS & LOGS
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-10 text-zinc-700 pt-4">
             <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"><Shield size={16} className="text-indigo-900"/> Secured</div>
             <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"><Radio size={16} className="text-red-900 animate-pulse"/> 4K Stream</div>
             <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"><Zap size={16} className="text-yellow-900"/> Ranked</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row p-6 gap-8 max-w-[1700px] mx-auto overflow-hidden h-screen animate-in fade-in duration-1000">
      
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} settings={appSettings} onUpdate={setAppSettings} />
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} selectedMode={gameState.mode} />

      {/* LEFT PANEL: Professional Display */}
      <aside className="w-full lg:w-80 flex flex-col gap-6 overflow-y-auto shrink-0">
        <button onClick={() => setIsLobby(true)} className="flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5 group self-start">
          <RotateCcw size={18} className="group-hover:rotate-[-90deg] transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest">Abort & Exit</span>
        </button>

        <div className="glass-panel rounded-3xl p-6 space-y-8 shadow-2xl border border-white/5">
           {/* Opponent Profile */}
           <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-xl font-black text-zinc-600 shadow-inner">
                    {opponent?.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-base font-black text-white truncate max-w-[120px] tracking-tight">{opponent?.name}</div>
                    <div className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-1">
                      <Wifi size={10} className="text-indigo-500" /> Rank {opponent?.rating}
                    </div>
                  </div>
                </div>
              </div>
              <div className={`px-6 py-4 rounded-2xl text-4xl font-[900] font-mono tracking-tighter shadow-inner transition-all duration-500 text-center ${gameState.turn === 'b' ? 'bg-indigo-600 text-white animate-pulse shadow-[0_0_30px_rgba(79,70,229,0.3)]' : 'bg-zinc-800/50 text-zinc-600'}`}>
                {formatTime(gameState.timers.b)}
              </div>
           </div>

           {/* Opponent Insights Section */}
           <OpponentInsight insight={opponentInsight} isAnalyzing={isAnalyzingOpponent} />

           <div className="h-px bg-white/5 mx-[-1.5rem]" />

           {/* User Profile */}
           <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border-2 border-indigo-500/40 flex items-center justify-center text-xl font-black text-indigo-500 shadow-lg">
                    {userProfile.avatar ? <Zap size={24}/> : userProfile.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-base font-black text-white truncate max-w-[120px] tracking-tight">{userProfile.name}</div>
                    <div className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-1">
                      <Shield size={10} className="text-indigo-400" /> Rank {userProfile.rating}
                    </div>
                  </div>
                </div>
              </div>
              <div className={`px-6 py-4 rounded-2xl text-4xl font-[900] font-mono tracking-tighter shadow-inner transition-all duration-500 text-center ${gameState.turn === 'w' ? 'bg-indigo-600 text-white animate-pulse shadow-[0_0_30px_rgba(79,70,229,0.3)]' : 'bg-zinc-800/50 text-zinc-600'}`}>
                {formatTime(gameState.timers.w)}
              </div>
           </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 flex flex-col gap-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1">System Controls</label>
          <button onClick={handleShareMatch} className="flex items-center gap-3 w-full p-4 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 transition-all border border-indigo-500/20">
            <Share2 size={18} />
            <span className="font-bold text-xs uppercase tracking-widest">Share Match</span>
          </button>
          <button onClick={() => initGame(gameState.mode)} className="flex items-center gap-3 w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 transition-all border border-transparent hover:border-white/10">
            <RotateCcw size={18} />
            <span className="font-bold text-xs uppercase tracking-widest">Resign & Reload</span>
          </button>
          <button onClick={() => setIsSettingsOpen(true)} className="flex items-center gap-3 w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 transition-all border border-transparent hover:border-white/10">
            <Settings size={18} />
            <span className="font-bold text-xs uppercase tracking-widest">Neural Config</span>
          </button>
        </div>
      </aside>

      {/* CENTER: Full HD Arena */}
      <main className="flex-1 flex flex-col items-center justify-center relative bg-black/40 border border-white/5 rounded-[3rem] overflow-hidden p-8 shadow-2xl">
        
        <div className="absolute top-8 left-8 flex items-center gap-6">
           <div className="flex items-center gap-3 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-[900] text-red-500 uppercase tracking-[0.2em]">Live 4K Broadcast</span>
           </div>
           <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              <Users size={14}/> 2,482 Watching
           </div>
        </div>

        <div className="transform scale-[1.05] transition-transform duration-1000">
          <ChessBoardComponent 
            fen={gameState.fen} 
            onMove={handleMove}
            lastMove={gameState.lastMove}
            game={game}
            orientation={appSettings.orientation}
          />
        </div>
        
        {gameState.isGameOver && (
          <div className="absolute inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-12 animate-in fade-in duration-700">
            <div className="p-8 bg-indigo-600 rounded-[3rem] mb-8 shadow-[0_30px_90px_-15px_rgba(79,70,229,0.7)]">
              <Trophy size={80} className="text-white animate-bounce" />
            </div>
            <h2 className="text-7xl font-[1000] text-white mb-3 tracking-tighter">CHECKMATE</h2>
            <p className="text-indigo-300 text-2xl mb-12 font-bold tracking-tight uppercase">
              {gameState.winner === 'draw' ? "Stalemate Protocol" : `${gameState.winner === 'w' ? 'White' : 'Black'} Dominance`}
            </p>
            <button onClick={() => setIsLobby(true)} className="bg-white text-black px-12 py-5 rounded-[2rem] font-black text-xl transition-all transform hover:scale-105 active:scale-95 shadow-2xl">
              RETURN TO COMMAND CENTER
            </button>
          </div>
        )}
      </main>

      {/* RIGHT PANEL: Analytics Hub */}
      <section className="w-full lg:w-[24rem] flex flex-col gap-6 overflow-hidden shrink-0">
        <PromoBanner />
        <AnalysisPanel messages={analysis} />
        <MoveHistory history={moveHistory} />
      </section>

    </div>
  );
};

export default App;
