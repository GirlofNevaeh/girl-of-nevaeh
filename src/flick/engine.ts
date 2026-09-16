import { playBlast, playLaser } from "@/game/audio";
import { BOSS_HUES, YOU_HUES, type ShotHue } from "@/game/beams";
import type { CharacterId } from "@/game/types";

export { BOSS_HUES, YOU_HUES, type BossHue, type ShotHue, type YouHue } from "@/game/beams";

export const W = 720;
export const H = 420;
export const HOLD_X = 62;
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

export type Shot = {
  x: number;
  y: number;
  vx: number;
  hue: ShotHue;
  from: "you" | "boss";
};

export type Boss = {
  x: number;
  y: number;
  r: number;
  hp: number;
  maxHp: number;
  vy: number;
  fireCool: number;
  spawnCool: number;
  hue: 0 | 1;
  phase: number;
  who: CharacterId;
  index: number;
};

export type Pop = {
  x: number;
  y: number;
  pts: number;
  life: number;
  sparks: { x: number; y: number; vx: number; vy: number }[];
};

export type FlickPhase = "wave" | "boss";

export type FlickWorld = {
  x: number;
  y: number;
  cam: number;
  speed: number;
  shots: Shot[];
  foes: Foe[];
  bosses: Boss[];
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
  phase: FlickPhase;
  bossQueue: number;
  nextBossIn: number;
  youHue: 0 | 1 | 2;
  call: "level" | "boss" | "next" | "";
};

const BOSS_ART: CharacterId[] = ["zorath", "samael", "harlan", "tux"];

function burst(x: number, y: number, pts: number): Pop {
  const sparks = Array.from({ length: 28 }, () => {
    const a = Math.random() * Math.PI * 2;
    const s = 120 + Math.random() * 280;
    return { x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s };
  });
  return { x, y, pts, life: 1, sparks };
}

const KINDS: FoeKind[] = ["bat", "devil", "zombie", "ship", "ghost", "frank", "vamp", "wolf"];

export function bossesInLevel(level: number) {
  if (level <= 4) return 1;
  if (level <= 7) return 2;
  return 3;
}

export function bossHpFor(level: number, index: number) {
  return 10 + level * 5 + index * 8;
}

function spawnFoe(x: number, kind: FoeKind, level: number, lane?: number): Foe {
  const small = kind === "bat" || kind === "ghost";
  const slot = lane ?? Math.floor(Math.random() * 5);
  const y = 50 + slot * ((H - 100) / 4);
  return {
    kind,
    x,
    y: Math.max(40, Math.min(H - 40, y)),
    r: small ? 20 : 26,
    vx: 10 + level * 4,
    amp: kind === "ghost" || kind === "bat" ? 20 : 8,
    phase: Math.random() * Math.PI * 2,
    hp: small ? 1 : level >= 3 ? 2 : 1,
    pts: small ? 25 : 55,
  };
}

export function gapFor(level: number) {
  return Math.max(100, 240 - (level - 1) * 12);
}

export function clusterCount(level: number) {
  if (level <= 5) return 1;
  if (level <= 9) return 2;
  return 3;
}

function pickLanes(n: number) {
  const all = [0, 1, 2, 3, 4];
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = all[i]!;
    all[i] = all[j]!;
    all[j] = a;
  }
  return all.slice(0, Math.min(n, 4));
}

function fillAhead(w: FlickWorld, until: number) {
  if (w.phase !== "wave") return;
  const cap = Math.min(until, w.goal - 160);
  const gap = gapFor(w.level);
  const n = clusterCount(w.level);
  while (w.lastX + gap < cap) {
    w.lastX += gap;
    const lanes = pickLanes(n);
    for (let i = 0; i < lanes.length; i++) {
      const kind = KINDS[Math.floor(Math.random() * KINDS.length)]!;
      const f = spawnFoe(w.lastX + (i % 2) * 18, kind, w.level, lanes[i]);
      w.foes.push(f);
    }
  }
}

function spawnBoss(w: FlickWorld, index: number): Boss {
  const hp = bossHpFor(w.level, index);
  return {
    x: w.cam + W - 112,
    y: H / 2,
    r: 70 + Math.min(26, w.level * 3),
    hp,
    maxHp: hp,
    vy: (index % 2 === 0 ? 1 : -1) * (48 + w.level * 8),
    fireCool: 0.7,
    spawnCool: 1.4,
    hue: 0,
    phase: 0,
    who: BOSS_ART[(w.level + index) % BOSS_ART.length]!,
    index,
  };
}

export function beginBoss(w: FlickWorld) {
  if (w.phase === "boss") return;
  w.phase = "boss";
  w.bossQueue = bossesInLevel(w.level);
  w.nextBossIn = 0.2;
  w.banner = 1.55;
  w.call = "boss";
  w.heart = null;
}

function launchBoss(w: FlickWorld) {
  if (w.bossQueue <= 0) return;
  const index = bossesInLevel(w.level) - w.bossQueue;
  w.bosses.push(spawnBoss(w, index));
  w.bossQueue -= 1;
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
    bosses: [],
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
    lastX: 320,
    over: false,
    heart: null,
    heartGone: false,
    phase: "wave",
    bossQueue: 0,
    nextBossIn: 0,
    youHue: 0,
    call: "level",
  };
  fillAhead(w, W + 100);
  return w;
}

export function fireOrb(w: FlickWorld) {
  if (w.over || w.cool > 0 || w.banner > 0.4) return false;
  const hue: ShotHue = w.phase === "boss" ? YOU_HUES[w.youHue]! : "green";
  if (w.phase === "boss") w.youHue = ((w.youHue + 1) % 3) as 0 | 1 | 2;
  w.shots.push({ x: w.cam + w.x + 36, y: w.y, vx: 560, hue, from: "you" });
  w.cool = 0.18;
  playLaser();
  return true;
}

function hurtPlayer(w: FlickWorld, x: number, y: number) {
  if (w.invuln > 0 || w.over) return;
  w.lives -= 1;
  w.invuln = 1.1;
  w.pops.push(burst(x, y, 0));
  playBlast();
  if (w.lives <= 0) w.over = true;
}

function fireBoss(w: FlickWorld, b: Boss) {
  const hue = BOSS_HUES[b.hue]!;
  b.hue = b.hue === 0 ? 1 : 0;
  const spread = w.level >= 4 ? 2 : 1;
  const extra = w.level >= 8 ? 1 : 0;
  const n = spread + extra;
  const speed = -(280 + w.level * 16);
  for (let i = 0; i < n; i++) {
    const off = n === 1 ? 0 : (i - (n - 1) / 2) * 22;
    w.shots.push({ x: b.x - b.r * 0.55, y: b.y + off, vx: speed, hue, from: "boss" });
  }
  playLaser();
}

export function stepFlick(
  w: FlickWorld,
  dt: number,
  input: { up: boolean; down: boolean; left?: boolean; right?: boolean; fire: boolean },
) {
  if (w.over) return;
  w.banner = Math.max(0, w.banner - dt);
  if (w.banner <= 0 && w.call === "level") w.call = "";
  w.cool = Math.max(0, w.cool - dt);
  w.invuln = Math.max(0, w.invuln - dt);
  if (input.up) w.y -= 320 * dt;
  if (input.down) w.y += 320 * dt;
  if (input.left) w.x -= 280 * dt;
  if (input.right) w.x += 280 * dt;
  w.y = Math.max(48, Math.min(H - 48, w.y));
  w.x = Math.max(56, Math.min(W * 0.38, w.x));
  if (input.fire && w.cool <= 0) fireOrb(w);

  if (w.phase === "wave") {
    w.cam += w.speed * dt;
    w.dist += w.speed * dt;
    w.clock += dt;
    w.score += Math.floor(w.speed * dt * 0.08);
    fillAhead(w, w.cam + W + 240);
    if (w.clock >= LEVEL_SECS || w.cam + w.x >= w.goal) beginBoss(w);
  }

  if (w.phase === "boss") {
    w.nextBossIn = Math.max(0, w.nextBossIn - dt);
    if (w.bosses.length === 0 && w.bossQueue > 0 && w.nextBossIn <= 0) {
      launchBoss(w);
      if (w.call === "next") w.banner = Math.max(w.banner, 0.7);
    }
    if (w.bosses.length === 0 && w.bossQueue <= 0 && w.nextBossIn <= 0 && w.banner <= 0) {
      const next = newFlick(w.level + 1, w.score + 250, w.lives);
      Object.assign(w, next);
      return;
    }
  }

  for (const s of w.shots) s.x += s.vx * dt;
  w.shots = w.shots.filter((s) => s.x > w.cam - 60 && s.x < w.cam + W + 50);

  if (w.phase === "wave" && !w.heart && !w.heartGone && w.banner <= 0 && w.clock > 4) {
    w.heart = { x: w.cam + W + 30, y: 80 + Math.random() * (H - 160), vy: 220 };
    w.heartGone = true;
  }
  if (w.heart) {
    w.heart.x -= (w.speed + 80) * dt;
    w.heart.y += w.heart.vy * dt;
    if (w.heart.y < 36 || w.heart.y > H - 36) w.heart.vy *= -1;
    let grabbed = false;
    for (const s of w.shots) {
      if (s.from !== "you") continue;
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
    f.x -= (w.phase === "boss" ? f.vx + w.speed * 0.35 : f.vx) * dt;
    f.y += Math.sin(f.phase) * f.amp * dt;
    f.y = Math.max(24, Math.min(H - 24, f.y));
  }

  const px = w.cam + w.x;
  const kept: Foe[] = [];
  for (const f of w.foes) {
    if (f.x < w.cam - 60 || f.x > w.goal + 40) continue;
    let dead = false;
    for (const s of w.shots) {
      if (s.from !== "you") continue;
      if (Math.abs(s.y - f.y) < f.r + 10 && s.x > f.x - f.r && s.x < f.x + f.r + 36) {
        f.hp -= 1;
        s.x = w.cam - 80;
        if (f.hp <= 0) {
          dead = true;
          w.score += f.pts;
          w.pops.push(burst(f.x, f.y, f.pts));
          playBlast();
        }
      }
    }
    if (!dead && w.invuln <= 0 && Math.hypot(px - f.x, w.y - f.y) < f.r + SHIP_R - 6) {
      hurtPlayer(w, px, w.y);
      dead = true;
    }
    if (!dead) kept.push(f);
  }
  w.foes = kept;

  const liveBosses: Boss[] = [];
  for (const b of w.bosses) {
    b.phase += dt;
    b.x = w.cam + W - 112;
    b.y += b.vy * dt;
    if (b.y < 72 || b.y > H - 72) b.vy *= -1;
    b.y = Math.max(72, Math.min(H - 72, b.y));
    b.fireCool -= dt;
    b.spawnCool -= dt;
    if (b.fireCool <= 0 && w.banner <= 0.25) {
      fireBoss(w, b);
      b.fireCool = Math.max(0.48, 1.6 - w.level * 0.1);
    }
    if (w.level >= 3 && b.spawnCool <= 0 && w.banner <= 0.2) {
      const minions = w.foes.filter((f) => f.kind === "ship").length;
      const cap = w.level >= 6 ? 4 : w.level >= 5 ? 3 : 2;
      if (minions < cap) {
        const m = spawnFoe(b.x - b.r - 8, "ship", w.level);
        m.y = b.y;
        m.vx = 70 + w.level * 10;
        w.foes.push(m);
      }
      b.spawnCool = Math.max(1.4, 3.6 - w.level * 0.22);
    }

    for (const s of w.shots) {
      if (s.from !== "you") continue;
      if (Math.abs(s.y - b.y) < b.r * 0.72 && s.x > b.x - b.r && s.x < b.x + b.r * 0.55) {
        b.hp -= 1;
        s.x = w.cam - 80;
        if (b.hp <= 0) {
          w.score += 200 + w.level * 40;
          w.pops.push(burst(b.x, b.y, 200));
          playBlast();
          if (w.bossQueue > 0) {
            w.nextBossIn = 0.85;
            w.banner = 0.85;
            w.call = "next";
          } else {
            w.nextBossIn = 0.7;
          }
          break;
        }
      }
    }
    if (b.hp <= 0) continue;
    if (w.invuln <= 0 && Math.hypot(px - b.x, w.y - b.y) < b.r + SHIP_R - 18) {
      hurtPlayer(w, px, w.y);
    }
    liveBosses.push(b);
  }
  w.bosses = liveBosses;

  for (const s of w.shots) {
    if (s.from !== "boss" || w.invuln > 0) continue;
    if (Math.abs(s.y - w.y) < 16 && s.x > px - 28 && s.x < px + 36) {
      s.x = w.cam - 80;
      hurtPlayer(w, px, w.y);
    }
  }

  for (const p of w.pops) {
    p.life -= dt * 1.5;
    for (const sp of p.sparks) {
      sp.x += sp.vx * dt;
      sp.y += sp.vy * dt;
      sp.vy += 180 * dt;
    }
  }
  w.pops = w.pops.filter((p) => p.life > 0);
}
