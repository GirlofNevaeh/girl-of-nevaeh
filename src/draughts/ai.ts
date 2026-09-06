import { cloneGame, legalMoves, playMove, resultOf, type Diff, type Game, type Move } from "./logic";

function scoreBoard(g: Game): number {
  const end = resultOf(g);
  if (end === "w") return 10000;
  if (end === "b") return -10000;
  if (end === "draw") return 0;
  let s = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = g.board[r][c];
      if (!p) continue;
      const base = p.king ? 28 : 10;
      const adv = p.color === "w" ? 7 - r : r;
      const val = base + (p.king ? 0 : adv);
      s += p.color === "w" ? val : -val;
    }
  }
  return s;
}

function order(moves: Move[]) {
  return [...moves].sort((a, b) => (b.captured ? 1 : 0) - (a.captured ? 1 : 0));
}

function alphabeta(g: Game, depth: number, alpha: number, beta: number): number {
  if (depth === 0 || resultOf(g)) return scoreBoard(g);
  const moves = order(legalMoves(g));
  if (!moves.length) return scoreBoard(g);
  if (g.turn === "w") {
    let best = -99999;
    for (const m of moves) {
      const n = cloneGame(g);
      playMove(n, m.from, m.to);
      const v = alphabeta(n, depth - 1, alpha, beta);
      if (v > best) best = v;
      if (best > alpha) alpha = best;
      if (beta <= alpha) break;
    }
    return best;
  }
  let best = 99999;
  for (const m of moves) {
    const n = cloneGame(g);
    playMove(n, m.from, m.to);
    const v = alphabeta(n, depth - 1, alpha, beta);
    if (v < best) best = v;
    if (best < beta) beta = best;
    if (beta <= alpha) break;
  }
  return best;
}

export function cpuMove(g: Game, diff: Diff): Move | null {
  const moves = legalMoves(g);
  if (!moves.length) return null;
  if (diff === "easy") return moves[Math.floor(Math.random() * moves.length)] ?? null;
  const depth = diff === "hard" ? 4 : 2;
  const maxing = g.turn === "w";
  let best = moves[0];
  let bestV = maxing ? -99999 : 99999;
  for (const m of order(moves)) {
    const n = cloneGame(g);
    playMove(n, m.from, m.to);
    const v = alphabeta(n, depth, -99999, 99999);
    if (maxing ? v > bestV : v < bestV) {
      bestV = v;
      best = m;
    }
  }
  return best;
}
