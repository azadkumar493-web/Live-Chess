
export enum GameMode {
  PvP_Local = 'PVP_LOCAL',
  PvP_Online = 'PVP_ONLINE',
  PvAI = 'PV_AI'
}

export type PlayerColor = 'w' | 'b';

export interface Player {
  name: string;
  rating: number;
  avatar?: string;
}

export interface Move {
  from: string;
  to: string;
  promotion?: string;
  san?: string;
}

export interface GameState {
  fen: string;
  turn: PlayerColor;
  history: string[];
  isGameOver: boolean;
  winner: PlayerColor | 'draw' | null;
  mode: GameMode;
  lastMove: { from: string; to: string } | null;
  inCheck: boolean;
  timers: {
    w: number;
    b: number;
  };
}

export interface AnalysisMessage {
  role: 'system' | 'ai' | 'player' | 'viewer';
  text: string;
  timestamp: number;
  author?: string;
  eval?: string;
}
