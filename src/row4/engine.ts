export type Side = 1 | 2;
export type Cell = 0 | Side;
export type Outcome = Side | "draw" | null;

export const COLS = 7;
export const ROWS = 6;

export function emptyBoard(): Cell[] {
  return Array.from({ length: COLS * ROWS }, () => 0);
}

export function at(board: Cell[], c: number, r: number) {
  return board[r * COLS + c] ?? 0;
}

export function drop(board: Cell[], col: number, side: Side): Cell[] | null {
  if (col < 0 || col >= COLS) return null;
  for (let r = ROWS - 1; r >= 0; r--) {
    const i = r * COLS + col;
    if (board[i] === 0) {
      const next = board.slice() as Cell[];
      next[i] = side;
      return next;
    }
  }
  return null;
}

export function legal(board: Cell[]): number[] {
  const out: number[] = [];
  for (let c = 0; c < COLS; c++) if (board[c] === 0) out.push(c);
  return out;
}

function run(board: Cell[], c: number, r: number, dc: number, dr: number, side: Side) {
  let n = 0;
  let x = c;
  let y = r;
  while (x >= 0 && x < COLS && y >= 0 && y < ROWS && at(board, x, y) === side) {
    n += 1;
    x += dc;
    y += dr;
  }
  return n;
}

export function lineFrom(board: Cell[], c: number, r: number, side: Side): [number, number][] | null {
  const dirs = [
    [1, 0],
    [0, 1],
    [1, 1],
    [1, -1],
  ] as const;
  for (const [dc, dr] of dirs) {
    const back = run(board, c - dc, r - dr, -dc, -dr, side);
    const fwd = run(board, c, r, dc, dr, side);
    if (back + fwd >= 4) {
      const cells: [number, number][] = [];
      let x = c - dc * back;
      let y = r - dr * back;
      for (let i = 0; i < back + fwd; i++) {
        cells.push([x, y]);
        x += dc;
        y += dr;
      }
      return cells;
    }
  }
  return null;
}

export function winningLine(board: Cell[]): [number, number][] | null {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const s = at(board, c, r);
      if (s) {
        const line = lineFrom(board, c, r, s);
        if (line) return line;
      }
    }
  }
  return null;
}

export function outcome(board: Cell[]): Outcome {
  if (winningLine(board)) {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const s = at(board, c, r);
        if (s && lineFrom(board, c, r, s)) return s;
      }
    }
  }
  if (legal(board).length === 0) return "draw";
  return null;
}

function scoreWindow(vals: Cell[], side: Side) {
  const you = vals.filter((v) => v === side).length;
  const foe = vals.filter((v) => v === ((3 - side) as Side)).length;
  const empty = vals.filter((v) => v === 0).length;
  if (you === 4) return 1000;
  if (foe === 4) return -1000;
  if (you === 3 && empty === 1) return 12;
  if (foe === 3 && empty === 1) return -14;
  if (you === 2 && empty === 2) return 3;
  return 0;
}

function evaluate(board: Cell[], side: Side) {
  let s = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) s += scoreWindow([at(board, c, r), at(board, c + 1, r), at(board, c + 2, r), at(board, c + 3, r)], side);
  }
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS - 3; r++) s += scoreWindow([at(board, c, r), at(board, c, r + 1), at(board, c, r + 2), at(board, c, r + 3)], side);
  }
  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS - 3; c++) s += scoreWindow([at(board, c, r), at(board, c + 1, r + 1), at(board, c + 2, r + 2), at(board, c + 3, r + 3)], side);
  }
  for (let r = 3; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) s += scoreWindow([at(board, c, r), at(board, c + 1, r - 1), at(board, c + 2, r - 2), at(board, c + 3, r - 3)], side);
  }
  return s + (at(board, 3, 5) === side ? 2 : 0);
}

export function cpuMove(board: Cell[], cpu: Side): number {
  const moves = legal(board);
  if (!moves.length) return -1;
  for (const m of moves) {
    const next = drop(board, m, cpu);
    if (next && outcome(next) === cpu) return m;
  }
  const foe = (3 - cpu) as Side;
  for (const m of moves) {
    const next = drop(board, m, foe);
    if (next && outcome(next) === foe) return m;
  }
  const order = [3, 4, 2, 5, 1, 6, 0].filter((c) => moves.includes(c));
  let best = order[0] ?? moves[0];
  let bestS = -1e9;
  for (const m of order) {
    const next = drop(board, m, cpu);
    if (!next) continue;
    const s = evaluate(next, cpu) + Math.random() * 0.4;
    if (s > bestS) {
      bestS = s;
      best = m;
    }
  }
  return best;
}
