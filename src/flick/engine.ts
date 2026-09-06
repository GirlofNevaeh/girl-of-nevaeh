import { playBlast, playLaser } from "@/game/audio";

export const W = 720;
export const H = 420;
export const HOLD_X = 118;
export const SHIP_R = 56;
export const LEVEL_SECS = 30;

export type FoeKind = "bat" | "devil" | "zombie" | "ship" | "ghost" | "frank" | "vamp" | "wolf";

export type Foe = {
  kind: FoeKind;
  x: number;
  y: number;
  r: number;
  vx: number;
  amp: number;
  phase: number;
  hp: number;
  pts: number;
};

export type Shot = { x: number; y: number; vx: number };

export type Pop = {
  x: number;
  y: number;
  pts: number;
  life: number;
  sparks: { x: number; y: number; vx: number; vy: number }[];
};

export type FlickWorld = {
  x: number;
  y: number;
  cam: number;
  speed: number;
  shots: Shot[];
  foes: Foe[];
  pops: Pop[];
  score: number;
  lives: number;
  level: number;
  clock: number;
  goal: number;
  banner: number;
  dist: number;
  cool: number;
  invuln: number;
  lastX: number;
  over: boolean;
  heart: { x: number; y: number; vy: number } | null;
  heartGone: boolean;
};

function burst(x: number, y: number, pts: number): Pop {
  const sparks = Array.from({ length: 28 }, () => {
    const a = Math.random() * Math.PI * 2;
    const s = 120 + Math.random() * 280;
    return { x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s };
  });
  return { x, y, pts, life: 1, sparks };
}

const KINDS: FoeKind[] = ["bat", "devil", "zombie", "ship", "ghost", "frank", "vamp", "wolf"];

function spawnFoe(x: number, kind: FoeKind, level: number): Foe {
  const small = kind === "bat" || kind === "ghost";
  const lane = 50 + Math.floor(Math.random() * 5) * ((H - 100) / 4);
  return {
    kind,
    x,
    y: Math.max(40, Math.min(H - 40, lane)),
    r: small ? 20 : 26,
    vx: 4 + level * 2,
    amp: kind === "ghost" || kind === "bat" ? 20 : 8,
    phase: Math.random() * Math.PI * 2,
    hp: small ? 1 : level >= 3 ? 2 : 1,
    pts: small ? 25 : 55,
  };
}

function gapFor(level: number) {
  if (level <= 1) return 200;
  if (level === 2) return 170;
  if (level === 3) return 145;
  return Math.max(110, 160 - level * 6);
}

function fillAhead(w: FlickWorld, until: number) {
  const cap = Math.min(until, w.goal - 160);
  const gap = gapFor(w.level);
  while (w.lastX + gap < cap) {
    w.lastX += gap;
    const kind = KINDS[Math.floor(Math.random() * KINDS.length)];
    w.foes.push(spawnFoe(w.lastX, kind, w.level));
  }
}

export function newFlick(level = 1, score = 0, lives = 3): FlickWorld {
  const speed = 150 + (level - 1) * 14;
  const w: FlickWorld = {
    x: HOLD_X,
    y: H / 2,
    cam: 0,
    speed,
    shots: [],
    foes: [],
    pops: [],
    score,
    lives,
    level,
    clock: 0,
    goal: speed * LEVEL_SECS,
    banner: 1.8,
    dist: 0,
    cool: 0,
    invuln: 0,
    lastX: 420,
    over: false,
    heart: null,
    heartGone: false,
  };
  fillAhead(w, W + 80);
  return w;
}

export function fireOrb(w: FlickWorld) {
  if (w.over || w.cool > 0 || w.banner > 0.4) return false;
  w.shots.push({ x: w.cam + w.x + 36, y: w.y, vx: 520 });
  w.cool = 0.18;
  playLaser();
  return true;
}

export function stepFlick(
  w: FlickWorld,
  dt: number,
  input: { up: boolean; down: boolean; left?: boolean; right?: boolean; fire: boolean },
) {
  if (w.over) return;
  w.banner = Math.max(0, w.banner - dt);
  w.cool = Math.max(0, w.cool - dt);
  w.invuln = Math.max(0, w.invuln - dt);
  if (input.up) w.y -= 320 * dt;
  if (input.down) w.y += 320 * dt;
  if (input.left) w.x -= 280 * dt;
  if (input.right) w.x += 280 * dt;
  w.y = Math.max(64, Math.min(H - 64, w.y));
  w.x = Math.max(72, Math.min(W * 0.38, w.x));
  if (input.fire) fireOrb(w);

  w.cam += w.speed * dt;
  w.dist += w.speed * dt;
  w.clock += dt;
  w.score += Math.floor(w.speed * dt * 0.08);
  fillAhead(w, w.cam + W + 240);

  for (const s of w.shots) s.x += s.vx * dt;
  w.shots = w.shots.filter((s) => s.x < w.cam + W + 40);

  if (!w.heart && !w.heartGone && w.banner <= 0 && w.clock > 4) {
    w.heart = { x: w.cam + W + 30, y: 80 + Math.random() * (H - 160), vy: 220 };
    w.heartGone = true;
  }
  if (w.heart) {
    w.heart.x -= (w.speed + 80) * dt;
    w.heart.y += w.heart.vy * dt;
    if (w.heart.y < 36 || w.heart.y > H - 36) w.heart.vy *= -1;
    let grabbed = false;
    for (const s of w.shots) {
      if (Math.abs(s.y - w.heart.y) < 18 && s.x > w.heart.x - 16 && s.x < w.heart.x + 40) {
        s.x = w.cam + W + 80;
        if (w.lives < 3) w.lives += 1;
        grabbed = true;
      }
    }
    if (grabbed || w.heart.x < w.cam - 40) w.heart = null;
  }

  for (const f of w.foes) {
    f.phase += dt * (f.kind === "bat" ? 4.2 : 2.1);
    f.x -= f.vx * dt;
    f.y += Math.sin(f.phase) * f.amp * dt;
    f.y = Math.max(24, Math.min(H - 24, f.y));
  }

  const px = w.cam + w.x;
  const kept: Foe[] = [];
  for (const f of w.foes) {
    if (f.x < w.cam - 60 || f.x > w.goal + 40) continue;
    let dead = false;
    for (const s of w.shots) {
      if (Math.abs(s.y - f.y) < f.r + 10 && s.x > f.x - f.r && s.x < f.x + f.r + 36) {
        f.hp -= 1;
        s.x = w.cam + W + 80;
        if (f.hp <= 0) {
          dead = true;
          w.score += f.pts;
          w.pops.push(burst(f.x, f.y, f.pts));
          playBlast();
        }
      }
    }
    if (!dead && w.invuln <= 0 && Math.hypot(px - f.x, w.y - f.y) < f.r + SHIP_R - 6) {
      w.lives -= 1;
      w.invuln = 1.1;
      w.pops.push(burst(px, w.y, 0));
      if (w.lives <= 0) w.over = true;
      dead = true;
    }
    if (!dead) kept.push(f);
  }
  w.foes = kept;

  for (const p of w.pops) {
    p.life -= dt * 1.5;
    for (const sp of p.sparks) {
      sp.x += sp.vx * dt;
      sp.y += sp.vy * dt;
      sp.vy += 180 * dt;
    }
  }
  w.pops = w.pops.filter((p) => p.life > 0);

  if (!w.over && (w.clock >= LEVEL_SECS || w.cam + w.x >= w.goal)) {
    const next = newFlick(w.level + 1, w.score + 100, w.lives);
    Object.assign(w, next);
  }
}
