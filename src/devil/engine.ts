export const COLS = 19;
export const ROWS = 21;
export const TILE_MAX = 24;
export const W = COLS * TILE_MAX;
export const H = ROWS * TILE_MAX;

export type Dir = "U" | "D" | "L" | "R";
export type Cell = "#" | "." | "o" | " ";
export type DevilDiff = "easy" | "normal" | "hard";

const RAW = [
  "###################",
  "#........#........#",
  "#.##.###.#.###.##.#",
  "#o#.............#o#",
  "#.##.#.#####.#.##.#",
  "#....#...#...#....#",
  "####.###.#.###.####",
  "#.................#",
  "#.##.###.#.###.##.#",
  "#.#.............#.#",
  "...................",
  "#.#.............#.#",
  "#.##.###.#.###.##.#",
  "#.................#",
  "####.###.#.###.####",
  "#....#...#...#....#",
  "#.##.#.#####.#.##.#",
  "#o#.............#o#",
  "#.##.###.#.###.##.#",
  "#........#........#",
  "###################",
];

const DIRS: Dir[] = ["U", "D", "L", "R"];
const VEC: Record<Dir, [number, number]> = { U: [0, -1], D: [0, 1], L: [-1, 0], R: [1, 0] };
const OPP: Record<Dir, Dir> = { U: "D", D: "U", L: "R", R: "L" };

export type Actor = {
  c: number;
  r: number;
  x: number;
  y: number;
  dir: Dir;
  next: Dir;
  steered: boolean;
  moving: boolean;
};

export type Ghost = Actor & { kind: number };

export type DevilWorld = {
  grid: Cell[][];
  you: Actor;
  ghosts: Ghost[];
  score: number;
  lives: number;
  level: number;
  orbsLeft: number;
  fright: number;
  over: boolean;
  won: boolean;
  dead: number;
  tile: number;
  diff: DevilDiff;
  banner: number;
  ready: number;
  stun: number;
};

export function tileFor(diff: DevilDiff, level: number) {
  if (diff === "hard") return TILE_MAX;
  const start = diff === "easy" ? 16 : 18;
  return Math.min(TILE_MAX, start + Math.max(0, level - 1) * 2);
}

export function boardSize(tile: number) {
  return { w: COLS * tile, h: ROWS * tile };
}

function levelsToFull(diff: DevilDiff) {
  if (diff === "hard") return 1;
  const start = diff === "easy" ? 16 : 18;
  return 1 + Math.ceil((TILE_MAX - start) / 2);
}

function parseGrid(diff: DevilDiff): Cell[][] {
  const grid = RAW.map((row) => {
    const cells = row.split("") as Cell[];
    while (cells.length < COLS) cells.push(".");
    return cells.slice(0, COLS);
  });
  const extra =
    diff === "easy"
      ? [
          [9, 5],
          [9, 15],
          [3, 10],
          [15, 10],
          [5, 7],
          [13, 7],
          [5, 13],
          [13, 13],
        ]
      : diff === "normal"
        ? [
            [9, 5],
            [9, 15],
            [3, 10],
            [15, 10],
          ]
        : [];
  for (const [c, r] of extra) {
    if (grid[r]?.[c] && grid[r][c] !== "#") grid[r][c] = "o";
  }
  return grid;
}

function wrapC(c: number) {
  if (c < 0) return COLS - 1;
  if (c >= COLS) return 0;
  return c;
}

function open(grid: Cell[][], c: number, r: number) {
  if (r < 0 || r >= ROWS) return false;
  return grid[r][wrapC(c)] !== "#";
}

export function countOrbs(grid: Cell[][]) {
  let n = 0;
  for (const row of grid) for (const t of row) if (t === "." || t === "o") n += 1;
  return n;
}

function place(c: number, r: number, dir: Dir, tile: number): Actor {
  return {
    c,
    r,
    x: c * tile + tile / 2,
    y: r * tile + tile / 2,
    dir,
    next: dir,
    steered: false,
    moving: false,
  };
}

const GHOST_SPOTS: [number, number, Dir][] = [
  [1, 7, "R"],
  [1, 1, "R"],
  [17, 1, "L"],
  [1, 19, "R"],
  [17, 19, "L"],
  [17, 7, "L"],
  [3, 10, "R"],
  [15, 10, "L"],
];

function ghostCount(diff: DevilDiff, level: number) {
  const base = diff === "easy" ? 2 : diff === "normal" ? 3 : 4;
  const cap = diff === "easy" ? 5 : diff === "normal" ? 6 : 8;
  return Math.min(cap, base + Math.max(0, level - 1));
}

export function newDevil(level: number, score: number, lives: number, diff: DevilDiff = "normal"): DevilWorld {
  const tile = tileFor(diff, level);
  const grid = parseGrid(diff);
  const n = ghostCount(diff, level);
  const ghosts: Ghost[] = GHOST_SPOTS.slice(0, n).map(([c, r, dir], i) => ({
    ...place(c, r, dir, tile),
    kind: i % 4,
    steered: true,
    moving: true,
  }));
  return {
    grid,
    you: place(9, 10, "L", tile),
    ghosts,
    score,
    lives,
    level,
    orbsLeft: countOrbs(grid),
    fright: 0,
    over: false,
    won: false,
    dead: 0,
    tile,
    diff,
    banner: 1,
    ready: 1,
    stun: 0,
  };
}

function tryDir(grid: Cell[][], a: Actor, dir: Dir) {
  return open(grid, a.c + VEC[dir][0], a.r + VEC[dir][1]);
}

function chaseDir(grid: Cell[][], g: Ghost, tc: number, tr: number, flee: boolean): Dir {
  const opts = DIRS.filter((d) => tryDir(grid, g, d));
  if (!opts.length) return g.dir;
  let best = opts[0]!;
  let bestV = flee ? -1e9 : 1e9;
  for (const d of opts) {
    const c = wrapC(g.c + VEC[d][0]);
    const r = g.r + VEC[d][1];
    const dist = Math.abs(c - tc) + Math.abs(r - tr);
    const v = flee ? dist : dist + (d === OPP[g.dir] ? 0.35 : 0);
    if (flee ? v > bestV : v < bestV) {
      bestV = v;
      best = d;
    }
  }
  return best;
}

export function stepDevil(w: DevilWorld, dt: number, want: Dir | null) {
  if (w.over) return;
  if (w.dead > 0) {
    w.dead -= dt;
    if (w.dead <= 0) {
      if (w.lives <= 0) w.over = true;
      else {
        w.you = place(9, 10, "L", w.tile);
        w.you.steered = false;
        w.you.moving = false;
        w.ghosts = w.ghosts.map((g, i) => {
          const spot = GHOST_SPOTS[i % GHOST_SPOTS.length]!;
          return {
            ...place(spot[0], spot[1], spot[2], w.tile),
            kind: g.kind,
            steered: true,
            moving: true,
          };
        });
        w.fright = 0;
        w.banner = 1;
        w.ready = 1;
        w.stun = 0;
      }
    }
    return;
  }

  if (w.banner > 0) w.banner = Math.max(0, w.banner - dt);
  if (w.ready > 0) w.ready = Math.max(0, w.ready - dt);
  if (w.stun > 0) w.stun = Math.max(0, w.stun - dt);

  const extra = w.tile >= TILE_MAX ? Math.max(0, w.level - levelsToFull(w.diff)) : 0;
  const ghostSpeed = (w.fright > 0 ? 1.45 : w.diff === "hard" ? 2.05 : 1.7) + extra * 0.18;
  const youSpeed = ghostSpeed + 0.7;
  const tile = w.tile;
  movePlayer(w.grid, w.you, youSpeed * tile * dt, want, tile);
  eat(w);

  w.fright = Math.max(0, w.fright - dt);
  if (w.ready > 0) {
    if (w.orbsLeft <= 0) w.won = true;
    return;
  }

  for (let i = w.ghosts.length - 1; i >= 0; i--) {
    const g = w.ghosts[i]!;
    if (w.stun <= 0) {
      g.next = chaseDir(w.grid, g, w.you.c, w.you.r, w.fright > 0);
      moveGhost(w.grid, g, ghostSpeed * tile * dt, tile);
    }
    if (Math.hypot(g.x - w.you.x, g.y - w.you.y) < Math.max(tile * 0.7, 14)) {
      if (w.fright > 0 || w.stun > 0) {
        w.score += 200;
        w.ghosts.splice(i, 1);
      } else {
        w.lives -= 1;
        w.dead = 1;
        break;
      }
    }
  }
  if (w.orbsLeft <= 0) w.won = true;
}

function centerOf(c: number, r: number, tile: number) {
  return { x: c * tile + tile / 2, y: r * tile + tile / 2 };
}

function arriveThenStep(grid: Cell[][], a: Actor, step: number, pick: Dir, tile: number, hold = true) {
  const goal = centerOf(a.c, a.r, tile);
  const dx = goal.x - a.x;
  const dy = goal.y - a.y;
  const dist = Math.hypot(dx, dy);
  if (dist > 0.6) {
    const m = Math.min(step, dist);
    a.x += (dx / dist) * m;
    a.y += (dy / dist) * m;
    return;
  }
  a.x = goal.x;
  a.y = goal.y;
  const take = (d: Dir) => {
    const nc = a.c + VEC[d][0];
    const nr = a.r + VEC[d][1];
    if (!open(grid, nc, nr)) return false;
    a.dir = d;
    a.moving = true;
    if (nc < 0 || nc >= COLS) {
      a.c = wrapC(nc);
      a.r = nr;
      const g = centerOf(a.c, a.r, tile);
      a.x = g.x;
      a.y = g.y;
      return true;
    }
    a.c = nc;
    a.r = nr;
    return true;
  };
  if (take(pick)) return;
  if (hold && a.moving && pick !== a.dir && take(a.dir)) return;
  a.moving = false;
}

function movePlayer(grid: Cell[][], a: Actor, step: number, want: Dir | null, tile: number) {
  if (want) {
    a.next = want;
    a.steered = true;
  }
  if (!a.steered && !want) return;

  const facing = a.dir;
  if (want && want === OPP[facing]) {
    a.dir = want;
    a.next = want;
    a.moving = true;
    const nc = a.c + VEC[want][0];
    const nr = a.r + VEC[want][1];
    if (open(grid, nc, nr)) {
      a.c = wrapC(nc);
      a.r = nr;
      if (nc < 0 || nc >= COLS) {
        const g = centerOf(a.c, a.r, tile);
        a.x = g.x;
        a.y = g.y;
        return;
      }
    }
  }

  const goal = centerOf(a.c, a.r, tile);
  if (Math.hypot(a.x - goal.x, a.y - goal.y) > tile * 1.6) {
    a.x = goal.x;
    a.y = goal.y;
  }

  arriveThenStep(grid, a, step, a.next || a.dir, tile, true);
}

function moveGhost(grid: Cell[][], a: Actor, step: number, tile: number) {
  arriveThenStep(grid, a, step, a.next, tile);
}

function eat(w: DevilWorld) {
  const tile = w.tile;
  const reach = Math.max(tile * 0.62, 12);
  const here = [
    [w.you.c, w.you.r],
    [wrapC(Math.floor(w.you.x / tile)), Math.floor(w.you.y / tile)],
  ];
  for (const [c0, r0] of here) {
    takeOrb(w, c0, r0);
  }
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const t = w.grid[r][c];
      if (t !== "." && t !== "o") continue;
      const cx = c * tile + tile / 2;
      const cy = r * tile + tile / 2;
      if (Math.hypot(cx - w.you.x, cy - w.you.y) <= reach) takeOrb(w, c, r);
    }
  }
}

function takeOrb(w: DevilWorld, c: number, r: number) {
  const cc = wrapC(c);
  if (r < 0 || r >= ROWS) return;
  const t = w.grid[r]?.[cc];
  if (t !== "." && t !== "o") return;
  w.grid[r][cc] = " ";
  w.orbsLeft = Math.max(0, w.orbsLeft - 1);
  w.score += t === "o" ? 50 : 10;
  if (t === "o") {
    w.fright = 6;
    w.stun = 3;
  }
}
