import { Chess, type Move } from "chess.js";
import type { Diff } from "./logic";

const VAL: Record<string, number> = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };

const PAWN = [
  0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 50, 50, 50, 50, 10, 10, 20, 30, 30, 20, 10, 10, 5, 5, 10, 25, 25, 10, 5, 5, 0, 0,
  0, 20, 20, 0, 0, 0, 5, -5, -10, 0, 0, -10, -5, 5, 5, 10, 10, -20, -20, 10, 10, 5, 0, 0, 0, 0, 0, 0, 0, 0,
];
const KNIGHT = [
  -50, -40, -30, -30, -30, -30, -40, -50, -40, -20, 0, 0, 0, 0, -20, -40, -30, 0, 10, 15, 15, 10, 0, -30, -30, 5, 15, 20,
  20, 15, 5, -30, -30, 0, 15, 20, 20, 15, 0, -30, -30, 5, 10, 15, 15, 10, 5, -30, -40, -20, 0, 5, 5, 0, -20, -40, -50, -40,
  -30, -30, -30, -30, -40, -50,
];
const KING = [
  -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30,
  -30, -40, -40, -50, -50, -40, -40, -30, -20, -30, -30, -40, -40, -30, -30, -20, -10, -20, -20, -20, -20, -20, -20, -10, 20,
  20, 0, 0, 0, 0, 20, 20, 20, 30, 10, 0, 0, 10, 30, 20,
];

function sqIndex(square: string, color: "w" | "b"): number {
  const file = square.charCodeAt(0) - 97;
  const rank = Number(square[1]) - 1;
  const i = rank * 8 + file;
  return color === "w" ? i : 63 - i;
}

function evaluate(chess: Chess): number {
  if (chess.isCheckmate()) return chess.turn() === "w" ? -20000 : 20000;
  if (chess.isDraw() || chess.isStalemate()) return 0;
  let score = 0;
  for (const row of chess.board()) {
    for (const p of row) {
      if (!p) continue;
      let v = VAL[p.type] ?? 0;
      if (p.type === "p") v += PAWN[sqIndex(p.square, p.color)] ?? 0;
      else if (p.type === "n" || p.type === "b") v += KNIGHT[sqIndex(p.square, p.color)] ?? 0;
      else if (p.type === "k") v += KING[sqIndex(p.square, p.color)] ?? 0;
      score += p.color === "w" ? v : -v;
    }
  }
  return score;
}

function order(moves: Move[]): Move[] {
  return moves.slice().sort((a, b) => {
    const ac = a.captured ? (VAL[a.captured] ?? 0) - (VAL[a.piece] ?? 0) / 10 : 0;
    const bc = b.captured ? (VAL[b.captured] ?? 0) - (VAL[b.piece] ?? 0) / 10 : 0;
    return bc - ac;
  });
}

function alphabeta(chess: Chess, depth: number, alpha: number, beta: number, maxing: boolean): number {
  if (depth === 0 || chess.isGameOver()) return evaluate(chess);
  const moves = order(chess.moves({ verbose: true }));
  if (!moves.length) return evaluate(chess);
  if (maxing) {
    let best = -99999;
    for (const m of moves) {
      chess.move(m);
      const v = alphabeta(chess, depth - 1, alpha, beta, false);
      chess.undo();
      if (v > best) best = v;
      if (v > alpha) alpha = v;
      if (beta <= alpha) break;
    }
    return best;
  }
  let best = 99999;
  for (const m of moves) {
    chess.move(m);
    const v = alphabeta(chess, depth - 1, alpha, beta, true);
    chess.undo();
    if (v < best) best = v;
    if (v < beta) beta = v;
    if (beta <= alpha) break;
  }
  return best;
}

function pick(moves: Move[]): Move {
  return moves[Math.floor(Math.random() * moves.length)]!;
}

export function cpuMove(chess: Chess, diff: Diff): Move | null {
  const moves = chess.moves({ verbose: true });
  if (!moves.length) return null;
  if (diff === "easy") {
    const caps = moves.filter((m) => m.captured);
    if (caps.length && Math.random() < 0.35) return pick(caps);
    return pick(moves);
  }
  const depth = diff === "hard" ? 3 : 2;
  const maxing = chess.turn() === "w";
  let bestMove = moves[0]!;
  let best = maxing ? -99999 : 99999;
  for (const m of order(moves)) {
    chess.move(m);
    const v = alphabeta(chess, depth - 1, -99999, 99999, !maxing);
    chess.undo();
    if (maxing ? v > best : v < best) {
      best = v;
      bestMove = m;
    }
  }
  return bestMove;
}
