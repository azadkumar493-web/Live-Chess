
import React, { useState, useEffect } from 'react';
import { Chess, Square } from 'https://esm.sh/chess.js';

interface ChessBoardProps {
  fen: string;
  onMove: (move: { from: string; to: string; promotion?: string }) => Promise<boolean>;
  lastMove: { from: string; to: string } | null;
  game: Chess;
  orientation?: 'w' | 'b';
}

const ChessBoardComponent: React.FC<ChessBoardProps> = ({ fen, onMove, lastMove, game, orientation = 'w' }) => {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<string[]>([]);

  // Piece SVG mapping for high-quality visuals
  const PIECE_IMAGES: Record<string, string> = {
    'wp': 'https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg',
    'wr': 'https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg',
    'wn': 'https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg',
    'wb': 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg',
    'wq': 'https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg',
    'wk': 'https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg',
    'bp': 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg',
    'br': 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg',
    'bn': 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg',
    'bb': 'https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg',
    'bq': 'https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg',
    'bk': 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg',
  };

  const getBoard = () => {
    const squares = [];
    const board = game.board();

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const board_i = orientation === 'w' ? i : 7 - i;
        const board_j = orientation === 'w' ? j : 7 - j;

        const square = String.fromCharCode(97 + board_j) + (8 - board_i) as Square;
        const piece = board[board_i][board_j];
        const isLight = (i + j) % 2 === 0;
        const isSelected = selectedSquare === square;
        const isValid = validMoves.includes(square);
        const isLastMove = lastMove && (lastMove.from === square || lastMove.to === square);
        const inCheck = piece && piece.type === 'k' && game.inCheck() && piece.color === game.turn();

        squares.push(
          <div 
            key={square}
            onClick={() => handleSquareClick(square)}
            className={`
              relative flex items-center justify-center cursor-pointer select-none overflow-hidden
              ${isLight ? 'square-light' : 'square-dark'}
              ${isSelected ? 'ring-4 ring-indigo-500 ring-inset z-30' : ''}
              ${isLastMove ? 'square-last-move' : ''}
              ${inCheck ? 'square-check' : ''}
              w-[45px] h-[45px] sm:w-[65px] sm:h-[65px] md:w-[80px] md:h-[80px] lg:w-[85px] lg:h-[85px]
              transition-all duration-200
            `}
          >
            {/* Valid move indicators */}
            {isValid && (
              <div className={`absolute z-10 w-4 h-4 rounded-full ${piece ? 'bg-red-500/40 ring-2 ring-red-500' : 'bg-indigo-500/30 ring-2 ring-indigo-500/50'} shadow-lg`} />
            )}

            {/* Piece Image */}
            {piece && (
              <img 
                src={PIECE_IMAGES[piece.color + piece.type]} 
                alt={`${piece.color} ${piece.type}`}
                className={`w-[85%] h-[85%] z-20 pointer-events-none drop-shadow-xl piece-transition transform ${isSelected ? 'scale-110 -translate-y-1' : 'scale-100'}`}
              />
            )}

            {/* Coordinates - High resolution style */}
            {j === 0 && (
              <span className={`absolute top-1 left-1 text-[9px] font-black uppercase tracking-tighter ${isLight ? 'text-slate-400' : 'text-slate-300'} opacity-70`}>
                {8 - board_i}
              </span>
            )}
            {i === 7 && (
              <span className={`absolute bottom-1 right-1 text-[9px] font-black uppercase tracking-tighter ${isLight ? 'text-slate-400' : 'text-slate-300'} opacity-70`}>
                {String.fromCharCode(97 + board_j)}
              </span>
            )}
          </div>
        );
      }
    }
    return squares;
  };

  const handleSquareClick = async (square: Square) => {
    if (selectedSquare === square) {
      setSelectedSquare(null);
      setValidMoves([]);
      return;
    }

    if (selectedSquare) {
      const move = await onMove({ from: selectedSquare, to: square, promotion: 'q' });
      if (move) {
        setSelectedSquare(null);
        setValidMoves([]);
      } else {
        const piece = game.get(square);
        if (piece && piece.color === game.turn()) {
          setSelectedSquare(square);
          setValidMoves(game.moves({ square, verbose: true }).map(m => m.to));
        } else {
          setSelectedSquare(null);
          setValidMoves([]);
        }
      }
    } else {
      const piece = game.get(square);
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square);
        setValidMoves(game.moves({ square, verbose: true }).map(m => m.to));
      }
    }
  };

  return (
    <div className="chess-board-grid border-[12px] border-zinc-800 rounded-xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)]">
      {getBoard()}
    </div>
  );
};

export default ChessBoardComponent;
