import { Chess, type Move, type Square } from "chess.js";

export type Side = "w" | "b";
export type Diff = "easy" | "normal" | "hard";
export type PieceKind = "p" | "n" | "b" | "r" | "q" | "k";

export function newGame(): Chess {
  return new Chess();
}

export function cloneGame(chess: Chess): Chess {
  return new Chess(chess.fen());
}

export function resultOf(chess: Chess): "w" | "b" | "draw" | null {
  if (chess.isCheckmate()) return chess.turn() === "w" ? "b" : "w";
  if (chess.isStalemate() || chess.isDraw() || chess.isThreefoldRepetition() || chess.isInsufficientMaterial()) {
    return "draw";
  }
  return null;
}

export function legalAt(chess: Chess, from: Square): Move[] {
  return chess.moves({ square: from, verbose: true });
}

export function playMove(
  chess: Chess,
  from: Square,
  to: Square,
  promotion?: PieceKind,
): Move | null {
  try {
    return chess.move({ from, to, promotion: promotion ?? "q" });
  } catch {
    return null;
  }
}

export function squareAt(x: number, y: number, flipped: boolean): Square {
  const file = flipped ? 7 - x : x;
  const rank = flipped ? y + 1 : 8 - y;
  return (("abcdefgh"[file] ?? "a") + String(rank)) as Square;
}

export function coordOf(sq: Square, flipped: boolean): { x: number; y: number } {
  const file = sq.charCodeAt(0) - 97;
  const rank = Number(sq[1]) - 1;
  return flipped ? { x: 7 - file, y: rank } : { x: file, y: 7 - rank };
}

export const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
export const RANKS = ["8", "7", "6", "5", "4", "3", "2", "1"];
