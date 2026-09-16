export type Color = "w" | "b";
export type Diff = "easy" | "normal" | "hard";
export type Pos = { r: number; c: number };
export type Piece = { color: Color; king: boolean };
export type Move = { from: Pos; to: Pos; captured?: Pos };

export type Game = {
  board: (Piece | null)[][];
  turn: Color;
  last: Move | null;
  chain: Pos | null;
};

export function darkSq(r: number, c: number) {
  return (r + c) % 2 === 1;
}

export function samePos(a: Pos, b: Pos) {
  return a.r === b.r && a.c === b.c;
}

export function keyOf(p: Pos) {
  return `${p.r},${p.c}`;
}

export function posOf(key: string): Pos {
  const [r, c] = key.split(",").map(Number);
  return { r, c };
}

function inBoard(r: number, c: number) {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

export function cloneGame(g: Game): Game {
  return {
    board: g.board.map((row) => row.map((p) => (p ? { ...p } : null))),
    turn: g.turn,
    last: g.last ? { ...g.last, from: { ...g.last.from }, to: { ...g.last.to }, captured: g.last.captured ? { ...g.last.captured } : undefined } : null,
    chain: g.chain ? { ...g.chain } : null,
  };
}

export function newGame(): Game {
  const board: (Piece | null)[][] = Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => null));
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (!darkSq(r, c)) continue;
      if (r <= 2) board[r][c] = { color: "b", king: false };
      if (r >= 5) board[r][c] = { color: "w", king: false };
    }
  }
  return { board, turn: "w", last: null, chain: null };
}

function dirs(piece: Piece): [number, number][] {
  if (piece.king) return [
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
  ];
  return piece.color === "w"
    ? [
        [-1, -1],
        [-1, 1],
      ]
    : [
        [1, -1],
        [1, 1],
      ];
}

export function pieceAt(g: Game, p: Pos) {
  return g.board[p.r]?.[p.c] ?? null;
}

function capturesFrom(board: (Piece | null)[][], r: number, c: number): Move[] {
  const p = board[r][c];
  if (!p) return [];
  const out: Move[] = [];
  for (const [dr, dc] of dirs(p)) {
    const mr = r + dr;
    const mc = c + dc;
    const lr = r + 2 * dr;
    const lc = c + 2 * dc;
    if (!inBoard(lr, lc)) continue;
    const mid = board[mr]?.[mc];
    if (mid && mid.color !== p.color && !board[lr][lc]) {
      out.push({ from: { r, c }, to: { r: lr, c: lc }, captured: { r: mr, c: mc } });
    }
  }
  return out;
}

function stepsFrom(board: (Piece | null)[][], r: number, c: number): Move[] {
  const p = board[r][c];
  if (!p) return [];
  const out: Move[] = [];
  for (const [dr, dc] of dirs(p)) {
    const nr = r + dr;
    const nc = c + dc;
    if (inBoard(nr, nc) && !board[nr][nc]) {
      out.push({ from: { r, c }, to: { r: nr, c: nc } });
    }
  }
  return out;
}

export function allCaptures(g: Game, color: Color): Move[] {
  if (g.chain) return capturesFrom(g.board, g.chain.r, g.chain.c);
  const out: Move[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = g.board[r][c];
      if (p && p.color === color) out.push(...capturesFrom(g.board, r, c));
    }
  }
  return out;
}

export function legalMoves(g: Game): Move[] {
  const caps = allCaptures(g, g.turn);
  if (caps.length) return caps;
  const out: Move[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = g.board[r][c];
      if (p && p.color === g.turn) out.push(...stepsFrom(g.board, r, c));
    }
  }
  return out;
}

export function legalAt(g: Game, from: Pos): Move[] {
  return legalMoves(g).filter((m) => samePos(m.from, from));
}

export function playMove(g: Game, from: Pos, to: Pos): Move | null {
  const mv = legalAt(g, from).find((m) => samePos(m.to, to));
  if (!mv) return null;
  const piece = g.board[from.r][from.c];
  if (!piece) return null;
  g.board[from.r][from.c] = null;
  if (mv.captured) g.board[mv.captured.r][mv.captured.c] = null;
  let king = piece.king;
  const crowned = !king && ((piece.color === "w" && to.r === 0) || (piece.color === "b" && to.r === 7));
  if (crowned) king = true;
  g.board[to.r][to.c] = { color: piece.color, king };
  g.last = mv;
  if (mv.captured && !crowned) {
    const more = capturesFrom(g.board, to.r, to.c);
    if (more.length) {
      g.chain = { ...to };
      return mv;
    }
  }
  g.chain = null;
  g.turn = g.turn === "w" ? "b" : "w";
  return mv;
}

export function countSide(g: Game, color: Color) {
  let n = 0;
  for (const row of g.board) {
    for (const p of row) {
      if (p?.color === color) n += 1;
    }
  }
  return n;
}

export function resultOf(g: Game): "w" | "b" | "draw" | null {
  const w = countSide(g, "w");
  const b = countSide(g, "b");
  if (w === 0 && b === 0) return "draw";
  if (w === 0) return "b";
  if (b === 0) return "w";
  if (legalMoves(g).length === 0) return g.turn === "w" ? "b" : "w";
  return null;
}

export function resetGame(g: Game) {
  const fresh = newGame();
  g.board = fresh.board;
  g.turn = fresh.turn;
  g.last = null;
  g.chain = null;
}
