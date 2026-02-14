
import React, { useState, useEffect } from 'react';
import { Send, Crown, Check } from 'lucide-react';

const ShareActions: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleShare = async () => {
    const shareData = {
      title: 'Grandmaster Live Chess',
      text: 'Challenge me to a game of elite chess with real-time Gemini AI analysis!',
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      // Fallback: show info that it's already installed or how to do it manually
      alert("To install: Click the 'Install' icon in your browser's address bar or 'Add to Home Screen' in your mobile browser menu.");
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="grid grid-cols-2 gap-4">
        {/* Share Button */}
        <button 
          onClick={handleShare}
          className="group relative overflow-hidden flex flex-col items-center justify-center gap-3 p-6 glass-panel border border-white/5 hover:border-indigo-500/30 rounded-3xl transition-all active:scale-95"
        >
          <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="p-3 bg-indigo-600/10 rounded-2xl text-indigo-400 group-hover:scale-110 transition-transform">
            {copied ? <Check size={24} /> : <Send size={24} />}
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 group-hover:text-white transition-colors">
            {copied ? 'Link Copied' : 'Invite Rival'}
          </span>
        </button>

        {/* Download Button */}
        <button 
          onClick={handleInstall}
          className="group relative overflow-hidden flex flex-col items-center justify-center gap-3 p-6 glass-panel border border-white/5 hover:border-emerald-500/30 rounded-3xl transition-all active:scale-95"
        >
          <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="p-3 bg-emerald-600/10 rounded-2xl text-emerald-400 group-hover:scale-110 transition-transform">
            <Crown size={24} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 group-hover:text-white transition-colors">
            Install App
          </span>
        </button>
      </div>

      {/* Quick Access Info */}
      <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
            <Crown size={14} className="text-zinc-500" />
          </div>
          <div>
            <div className="text-[10px] font-black text-white uppercase tracking-wider">Offline Ready</div>
            <div className="text-[9px] text-zinc-500 font-bold uppercase">PWA Protocol v4.0</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {[1,2,3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-emerald-500/50" />)}
        </div>
      </div>
    </div>
  );
};

export default ShareActions;
