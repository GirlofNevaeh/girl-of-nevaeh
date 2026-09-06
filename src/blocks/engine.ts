export type Kind = "I" | "O" | "T" | "S" | "Z" | "J" | "L";
export type Diff = "easy" | "normal" | "hard";
export type Cell = 0 | 1 | 2; // 0 empty, 1 pink, 2 blue

export const COLS = 10;
export const ROWS = 20;
const HIDDEN = 2;

const SHAPES: Record<Kind, number[][][]> = {
  I: [
    [[0, 0], [0, 1], [0, 2], [0, 3]],
    [[0, 2], [1, 2], [2, 2], [3, 2]],
    [[2, 0], [2, 1], [2, 2], [2, 3]],
    [[0, 1], [1, 1], [2, 1], [3, 1]],
  ],
  O: [
    [[0, 1], [0, 2], [1, 1], [1, 2]],
    [[0, 1], [0, 2], [1, 1], [1, 2]],
    [[0, 1], [0, 2], [1, 1], [1, 2]],
    [[0, 1], [0, 2], [1, 1], [1, 2]],
  ],
  T: [
    [[0, 1], [1, 0], [1, 1], [1, 2]],
    [[0, 1], [1, 1], [1, 2], [2, 1]],
    [[1, 0], [1, 1], [1, 2], [2, 1]],
    [[0, 1], [1, 0], [1, 1], [2, 1]],
  ],
  S: [
    [[0, 1], [0, 2], [1, 0], [1, 1]],
    [[0, 1], [1, 1], [1, 2], [2, 2]],
    [[1, 1], [1, 2], [2, 0], [2, 1]],
    [[0, 0], [1, 0], [1, 1], [2, 1]],
  ],
  Z: [
    [[0, 0], [0, 1], [1, 1], [1, 2]],
    [[0, 2], [1, 1], [1, 2], [2, 1]],
    [[1, 0], [1, 1], [2, 1], [2, 2]],
    [[0, 1], [1, 0], [1, 1], [2, 0]],
  ],
  J: [
    [[0, 0], [1, 0], [1, 1], [1, 2]],
    [[0, 1], [0, 2], [1, 1], [2, 1]],
    [[1, 0], [1, 1], [1, 2], [2, 2]],
    [[0, 1], [1, 1], [2, 0], [2, 1]],
  ],
  L: [
    [[0, 2], [1, 0], [1, 1], [1, 2]],
    [[0, 1], [1, 1], [2, 1], [2, 2]],
    [[1, 0], [1, 1], [1, 2], [2, 0]],
    [[0, 0], [0, 1], [1, 1], [2, 1]],
  ],
};

const JLSTZ: Record<string, [number, number][]> = {
  "0R": [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  R0: [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  R2: [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  "2R": [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  "2L": [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  L2: [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  L0: [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  "0L": [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
};

const IKICK: Record<string, [number, number][]> = {
  "0R": [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  R0: [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  R2: [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
  "2R": [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  "2L": [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  L2: [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  L0: [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  "0L": [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
};

const ROT = ["0", "R", "2", "L"] as const;

export const COLOR: Record<Kind, Cell> = {
  I: 1,
  O: 2,
  T: 1,
  S: 2,
  Z: 1,
  J: 2,
  L: 1,
};

export type Piece = { kind: Kind; r: number; x: number; y: number };

export type Game = {
  grid: Cell[][];
  piece: Piece | null;
  hold: Kind | null;
  held: boolean;
  next: Kind[];
  bag: Kind[];
  score: number;
  lines: number;
  level: number;
  over: boolean;
  fall: number;
  lock: number;
  resets: number;
  diff: Diff;
};

const GRAV: Record<Diff, number> = { easy: 1.05, normal: 0.72, hard: 0.38 };
const LOCK: Record<Diff, number> = { easy: 0.72, normal: 0.5, hard: 0.32 };

function emptyGrid(): Cell[][] {
  return Array.from({ length: ROWS + HIDDEN }, () => Array<Cell>(COLS).fill(0));
}

function shuffleBag(): Kind[] {
  const b: Kind[] = ["I", "O", "T", "S", "Z", "J", "L"];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

function cells(p: Piece): [number, number][] {
  return SHAPES[p.kind][p.r].map(([ry, rx]) => [p.y + ry, p.x + rx]);
}

function free(g: Cell[][], p: Piece): boolean {
  for (const [r, c] of cells(p)) {
    if (c < 0 || c >= COLS || r >= ROWS + HIDDEN) return false;
    if (r >= 0 && g[r][c]) return false;
  }
  return true;
}

function spawnKind(g: Game, kind: Kind): Piece | null {
  const p: Piece = { kind, r: 0, x: 3, y: 0 };
  if (!free(g.grid, p)) return null;
  return p;
}

function takeNext(g: Game): Kind {
  while (g.next.length < 5) {
    if (!g.bag.length) g.bag = shuffleBag();
    g.next.push(g.bag.pop()!);
  }
  return g.next.shift()!;
}

export function createGame(diff: Diff): Game {
  const g: Game = {
    grid: emptyGrid(),
    piece: null,
    hold: null,
    held: false,
    next: [],
    bag: shuffleBag(),
    score: 0,
    lines: 0,
    level: 1,
    over: false,
    fall: 0,
    lock: 0,
    resets: 0,
    diff,
  };
  while (g.next.length < 5) {
    if (!g.bag.length) g.bag = shuffleBag();
    g.next.push(g.bag.pop()!);
  }
  g.piece = spawnKind(g, takeNext(g));
  if (!g.piece) g.over = true;
  return g;
}

function interval(g: Game) {
  const base = GRAV[g.diff] / (1 + (g.level - 1) * 0.12);
  return Math.max(g.diff === "hard" ? 0.08 : 0.12, base);
}

function lockPiece(g: Game) {
  if (!g.piece) return;
  const col = COLOR[g.piece.kind];
  for (const [r, c] of cells(g.piece)) {
    if (r >= 0 && r < g.grid.length) g.grid[r][c] = col;
  }
  g.piece = null;
  let cleared = 0;
  for (let r = g.grid.length - 1; r >= 0; r--) {
    if (g.grid[r].every((v) => v !== 0)) {
      g.grid.splice(r, 1);
      g.grid.unshift(Array<Cell>(COLS).fill(0));
      cleared += 1;
      r += 1;
    }
  }
  const table = [0, 100, 300, 500, 800];
  g.score += (table[cleared] ?? 800) * g.level;
  g.lines += cleared;
  g.level = 1 + Math.floor(g.lines / 10);
  g.held = false;
  g.resets = 0;
  g.lock = 0;
  const kind = takeNext(g);
  const next = spawnKind(g, kind);
  if (!next) {
    g.over = true;
    g.piece = { kind, r: 0, x: 3, y: 0 };
    return;
  }
  g.piece = next;
}

function bumpLock(g: Game) {
  if (!g.piece) return;
  const down = { ...g.piece, y: g.piece.y + 1 };
  if (!free(g.grid, down) && g.resets < 15) {
    g.lock = 0;
    g.resets += 1;
  }
}

export function move(g: Game, dx: number) {
  if (g.over || !g.piece) return;
  const n = { ...g.piece, x: g.piece.x + dx };
  if (free(g.grid, n)) {
    g.piece = n;
    bumpLock(g);
  }
}

export function rotate(g: Game, dir: 1 | -1) {
  if (g.over || !g.piece) return;
  const from = ROT[g.piece.r];
  const toR = (g.piece.r + dir + 4) % 4;
  const to = ROT[toR];
  const key = `${from}${to}`;
  const kicks = g.piece.kind === "O" ? [[0, 0] as [number, number]] : g.piece.kind === "I" ? IKICK[key] : JLSTZ[key];
  for (const [kx, ky] of kicks ?? [[0, 0]]) {
    const n: Piece = { ...g.piece, r: toR, x: g.piece.x + kx, y: g.piece.y - ky };
    if (free(g.grid, n)) {
      g.piece = n;
      bumpLock(g);
      return;
    }
  }
}

export function softDrop(g: Game) {
  if (g.over || !g.piece) return;
  const n = { ...g.piece, y: g.piece.y + 1 };
  if (free(g.grid, n)) {
    g.piece = n;
    g.score += 1;
    g.fall = 0;
  }
}

export function hardDrop(g: Game) {
  if (g.over || !g.piece) return;
  let dist = 0;
  while (free(g.grid, { ...g.piece, y: g.piece.y + 1 })) {
    g.piece.y += 1;
    dist += 1;
  }
  g.score += dist * 2;
  lockPiece(g);
}

export function hold(g: Game) {
  if (g.over || !g.piece || g.held) return;
  const cur = g.piece.kind;
  if (g.hold) {
    g.piece = spawnKind(g, g.hold);
    g.hold = cur;
  } else {
    g.hold = cur;
    g.piece = spawnKind(g, takeNext(g));
  }
  g.held = true;
  g.lock = 0;
  g.resets = 0;
  if (!g.piece) g.over = true;
}

export function ghostY(g: Game): number {
  if (!g.piece) return 0;
  let y = g.piece.y;
  while (free(g.grid, { ...g.piece, y: y + 1 })) y += 1;
  return y;
}

export function pieceCells(p: Piece) {
  return cells(p);
}

export function tick(g: Game, dt: number, soft: boolean) {
  if (g.over || !g.piece) return;
  const down = { ...g.piece, y: g.piece.y + 1 };
  const grounded = !free(g.grid, down);
  if (grounded) {
    g.lock += dt;
    if (g.lock >= LOCK[g.diff]) lockPiece(g);
    return;
  }
  g.fall += dt * (soft ? 14 : 1);
  const step = interval(g);
  while (g.fall >= step && g.piece && !g.over) {
    g.fall -= step;
    const n: Piece = { ...g.piece, y: g.piece.y + 1 };
    if (free(g.grid, n)) g.piece = n;
    else break;
  }
}

export const HI_KEY = "nevaeh-blocks-hi-v1";

export function loadHigh(): Record<Diff, number> {
  try {
    const raw = localStorage.getItem(HI_KEY);
    if (!raw) return { easy: 0, normal: 0, hard: 0 };
    const p = JSON.parse(raw) as Partial<Record<Diff, number>>;
    return { easy: p.easy ?? 0, normal: p.normal ?? 0, hard: p.hard ?? 0 };
  } catch {
    return { easy: 0, normal: 0, hard: 0 };
  }
}

export function saveHigh(diff: Diff, score: number) {
  const cur = loadHigh();
  if (score > cur[diff]) {
    cur[diff] = score;
    localStorage.setItem(HI_KEY, JSON.stringify(cur));
  }
  return cur;
}
