export const COLS = 19;
export const ROWS = 21;
export const TILE = 24;
export const W = COLS * TILE;
export const H = ROWS * TILE;

export type Dir = "U" | "D" | "L" | "R";
export type Cell = "#" | "." | "o" | " ";

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
  "..................",
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
};

function parseGrid(): Cell[][] {
  return RAW.map((row) => {
    const cells = row.split("") as Cell[];
    while (cells.length < COLS) cells.push(".");
    return cells.slice(0, COLS);
  });
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

function place(c: number, r: number, dir: Dir): Actor {
  return {
    c,
    r,
    x: c * TILE + TILE / 2,
    y: r * TILE + TILE / 2,
    dir,
    next: dir,
    steered: false,
    moving: false,
  };
}

export function newDevil(level: number, score: number, lives: number): DevilWorld {
  const grid = parseGrid();
  const ghosts: Ghost[] = [
    { ...place(9, 7, "L"), kind: 0, steered: true, moving: true },
    { ...place(1, 1, "R"), kind: 1, steered: true, moving: true },
    { ...place(17, 1, "L"), kind: 2, steered: true, moving: true },
    { ...place(1, 19, "R"), kind: 3, steered: true, moving: true },
  ];
  if (level >= 3) ghosts.push({ ...place(17, 19, "L"), kind: 0, steered: true, moving: true });
  return {
    grid,
    you: place(9, 13, "L"),
    ghosts,
    score,
    lives,
    level,
    orbsLeft: countOrbs(grid),
    fright: 0,
    over: false,
    won: false,
    dead: 0,
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
        const fresh = newDevil(w.level, w.score, w.lives);
        w.you = fresh.you;
        w.ghosts = fresh.ghosts;
        w.fright = 0;
      }
    }
    return;
  }

  const youSpeed = 2.4 + (w.level - 1) * 0.16;
  const ghostSpeed = (w.fright > 0 ? 1.7 : 2.05) + (w.level - 1) * 0.14;
  movePlayer(w.grid, w.you, youSpeed * TILE * dt, want);
  eat(w);

  w.fright = Math.max(0, w.fright - dt);
  for (const g of w.ghosts) {
    g.next = chaseDir(w.grid, g, w.you.c, w.you.r, w.fright > 0);
    moveGhost(w.grid, g, ghostSpeed * TILE * dt);
    if (Math.hypot(g.x - w.you.x, g.y - w.you.y) < TILE * 0.68) {
      if (w.fright > 0) {
        w.score += 200;
        const home = place(9, 7, "L");
        g.c = home.c;
        g.r = home.r;
        g.x = home.x;
        g.y = home.y;
        g.dir = "L";
        g.next = "L";
      } else {
        w.lives -= 1;
        w.dead = 1;
      }
    }
  }
  if (w.orbsLeft <= 0) w.won = true;
}

function centerOf(c: number, r: number) {
  return { x: c * TILE + TILE / 2, y: r * TILE + TILE / 2 };
}

function arriveThenStep(grid: Cell[][], a: Actor, step: number, pick: Dir, hold = true) {
  const goal = centerOf(a.c, a.r);
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
  if (tryDir(grid, a, pick)) {
    a.dir = pick;
    a.moving = true;
    a.c = wrapC(a.c + VEC[pick][0]);
    a.r = a.r + VEC[pick][1];
    return;
  }
  if (hold && a.moving && tryDir(grid, a, a.dir)) {
    a.c = wrapC(a.c + VEC[a.dir][0]);
    a.r = a.r + VEC[a.dir][1];
    return;
  }
  a.moving = false;
}

function movePlayer(grid: Cell[][], a: Actor, step: number, want: Dir | null) {
  if (want) {
    a.next = want;
    a.steered = true;
    if (want === OPP[a.dir] && tryDir(grid, a, want)) {
      a.dir = want;
      a.moving = true;
    }
  }
  if (!a.steered) return;
  arriveThenStep(grid, a, step, a.next, a.moving);
}

function moveGhost(grid: Cell[][], a: Actor, step: number) {
  arriveThenStep(grid, a, step, a.next);
}

function eat(w: DevilWorld) {
  const t = w.grid[w.you.r]?.[w.you.c];
  if (t === "." || t === "o") {
    w.grid[w.you.r][w.you.c] = " ";
    w.orbsLeft -= 1;
    w.score += t === "o" ? 50 : 10;
    if (t === "o") w.fright = 6;
  }
}
