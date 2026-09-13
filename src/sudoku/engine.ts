export type Diff = "easy" | "normal" | "hard";

export const SIZE = 9;
export const CELLS = SIZE * SIZE;

const CLUES: Record<Diff, number> = { easy: 42, normal: 32, hard: 26 };

function shuffle<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function rc(i: number) {
  return { r: (i / SIZE) | 0, c: i % SIZE };
}

function boxOf(r: number, c: number) {
  return ((r / 3) | 0) * 3 + ((c / 3) | 0);
}

function canPlace(g: number[], i: number, n: number) {
  const { r, c } = rc(i);
  for (let k = 0; k < SIZE; k++) {
    if (g[r * SIZE + k] === n) return false;
    if (g[k * SIZE + c] === n) return false;
  }
  const br = ((r / 3) | 0) * 3;
  const bc = ((c / 3) | 0) * 3;
  for (let rr = 0; rr < 3; rr++) {
    for (let cc = 0; cc < 3; cc++) {
      if (g[(br + rr) * SIZE + (bc + cc)] === n) return false;
    }
  }
  return true;
}

function fillGrid(): number[] {
  const g = Array(CELLS).fill(0);
  const dfs = (i: number): boolean => {
    if (i === CELLS) return true;
    for (const n of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
      if (!canPlace(g, i, n)) continue;
      g[i] = n;
      if (dfs(i + 1)) return true;
      g[i] = 0;
    }
    return false;
  };
  dfs(0);
  return g;
}

function countSolutions(start: number[], limit = 2): number {
  const board = start.slice();
  const rows = Array(9).fill(0);
  const cols = Array(9).fill(0);
  const boxes = Array(9).fill(0);
  const empty: number[] = [];
  for (let i = 0; i < CELLS; i++) {
    const v = board[i];
    const { r, c } = rc(i);
    const b = boxOf(r, c);
    if (v) {
      const bit = 1 << v;
      rows[r] |= bit;
      cols[c] |= bit;
      boxes[b] |= bit;
    } else empty.push(i);
  }
  let found = 0;
  const dfs = (k: number) => {
    if (found >= limit) return;
    if (k === empty.length) {
      found += 1;
      return;
    }
    let best = k;
    let bestCount = 10;
    for (let j = k; j < empty.length; j++) {
      const i = empty[j];
      const { r, c } = rc(i);
      const used = rows[r] | cols[c] | boxes[boxOf(r, c)];
      let n = 0;
      for (let d = 1; d <= 9; d++) if (!(used & (1 << d))) n += 1;
      if (n < bestCount) {
        bestCount = n;
        best = j;
        if (n === 0) break;
      }
    }
    if (bestCount === 0) return;
    [empty[k], empty[best]] = [empty[best], empty[k]];
    const i = empty[k];
    const { r, c } = rc(i);
    const b = boxOf(r, c);
    const used = rows[r] | cols[c] | boxes[b];
    for (const d of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
      if (used & (1 << d)) continue;
      const bit = 1 << d;
      rows[r] |= bit;
      cols[c] |= bit;
      boxes[b] |= bit;
      board[i] = d;
      dfs(k + 1);
      board[i] = 0;
      rows[r] ^= bit;
      cols[c] ^= bit;
      boxes[b] ^= bit;
      if (found >= limit) return;
    }
  };
  dfs(0);
  return found;
}

export function makePuzzle(diff: Diff): { given: number[]; solved: number[] } {
  const solved = fillGrid();
  const given = solved.slice();
  const target = CLUES[diff];
  const order = shuffle([...Array(CELLS).keys()]);
  let left = CELLS;
  for (const i of order) {
    if (left <= target) break;
    const hold = given[i];
    given[i] = 0;
    if (countSolutions(given, 2) !== 1) given[i] = hold;
    else left -= 1;
  }
  return { given, solved };
}

export function conflicts(board: number[]): boolean[] {
  const bad = Array(CELLS).fill(false);
  const mark = (idxs: number[]) => {
    const seen = new Map<number, number[]>();
    for (const i of idxs) {
      const v = board[i];
      if (!v) continue;
      const list = seen.get(v) ?? [];
      list.push(i);
      seen.set(v, list);
    }
    for (const list of seen.values()) {
      if (list.length > 1) for (const i of list) bad[i] = true;
    }
  };
  for (let r = 0; r < 9; r++) mark(Array.from({ length: 9 }, (_, c) => r * 9 + c));
  for (let c = 0; c < 9; c++) mark(Array.from({ length: 9 }, (_, r) => r * 9 + c));
  for (let br = 0; br < 9; br += 3) {
    for (let bc = 0; bc < 9; bc += 3) {
      const idxs: number[] = [];
      for (let rr = 0; rr < 3; rr++) for (let cc = 0; cc < 3; cc++) idxs.push((br + rr) * 9 + (bc + cc));
      mark(idxs);
    }
  }
  return bad;
}

export function isComplete(board: number[]) {
  if (board.some((v) => !v)) return false;
  return !conflicts(board).some(Boolean);
}
