export type Side = 1 | 2;
export type Cell = 0 | Side;
export type Outcome = Side | "draw" | null;

export const LINES: [number, number, number][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export function emptyBoard(): Cell[] {
  return [0, 0, 0, 0, 0, 0, 0, 0, 0];
}

export function outcome(board: Cell[]): Outcome {
  for (const [a, b, c] of LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  if (board.every((cell) => cell !== 0)) return "draw";
  return null;
}

export function legal(board: Cell[]): number[] {
  const out: number[] = [];
  for (let i = 0; i < 9; i++) if (board[i] === 0) out.push(i);
  return out;
}

export function place(board: Cell[], i: number, side: Side): Cell[] | null {
  if (i < 0 || i > 8 || board[i] !== 0) return null;
  const next = board.slice() as Cell[];
  next[i] = side;
  return next;
}

function minimax(board: Cell[], toMove: Side, cpu: Side): number {
  const end = outcome(board);
  if (end === cpu) return 10;
  if (end && end !== "draw") return -10;
  if (end === "draw") return 0;
  const moves = legal(board);
  if (toMove === cpu) {
    let best = -99;
    for (const m of moves) {
      const next = place(board, m, toMove)!;
      best = Math.max(best, minimax(next, (3 - toMove) as Side, cpu));
    }
    return best;
  }
  let worst = 99;
  for (const m of moves) {
    const next = place(board, m, toMove)!;
    worst = Math.min(worst, minimax(next, (3 - toMove) as Side, cpu));
  }
  return worst;
}

export function cpuMove(board: Cell[], cpu: Side): number {
  const moves = legal(board);
  if (!moves.length) return -1;
  for (const m of moves) {
    if (outcome(place(board, m, cpu)!) === cpu) return m;
  }
  if (Math.random() < 0.4) {
    return moves[Math.floor(Math.random() * moves.length)] ?? moves[0];
  }
  let bestScore = -99;
  const best: number[] = [];
  for (const m of moves) {
    const next = place(board, m, cpu)!;
    const score = minimax(next, (3 - cpu) as Side, cpu);
    if (score > bestScore) {
      bestScore = score;
      best.length = 0;
      best.push(m);
    } else if (score === bestScore) best.push(m);
  }
  return best[Math.floor(Math.random() * best.length)] ?? moves[0];
}

export function winningLine(board: Cell[]): [number, number, number] | null {
  for (const line of LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return line;
  }
  return null;
}
