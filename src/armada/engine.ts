import { playBlast, playChime, playLaser } from "@/game/audio";
import { BOSS_HUES, YOU_HUES, type ShotHue } from "@/game/beams";
import { bossHpFor } from "@/flick/engine";
import type { CharacterId } from "@/game/types";

export const W = 480;
export const H = 640;
export const WAVE_SECS = 30;
export const BOSS_ART: CharacterId[] = ["zorath", "samael", "harlan", "tux"];

export type EnemyKind = 0 | 1 | 2 | 3;
export const POINTS: Record<EnemyKind, number> = { 0: 10, 1: 20, 2: 40, 3: 80 };

export type Enemy = { x: number; y: number; kind: EnemyKind; alive: boolean; minion?: boolean };
export type Shot = { x: number; y: number; vy: number; from: "you" | "them" | "boss"; hue: ShotHue };
export type Pop = {
  x: number;
  y: number;
  pts: number;
  life: number;
  sparks: { x: number; y: number; vx: number; vy: number }[];
};
export type Boss = {
  x: number;
  y: number;
  r: number;
  hp: number;
  maxHp: number;
  vx: number;
  fireCool: number;
  spawnCool: number;
  hue: 0 | 1;
  phase: number;
  who: CharacterId;
};

export type ArmadaPhase = "wave" | "boss";

export type World = {
  shipX: number;
  enemies: Enemy[];
  shots: Shot[];
  pops: Pop[];
  dir: 1 | -1;
  score: number;
  lives: number;
  level: number;
  clock: number;
  banner: number;
  invuln: number;
  over: boolean;
  heart: { x: number; y: number; vx: number; vy: number } | null;
  heartGone: boolean;
  phase: ArmadaPhase;
  boss: Boss | null;
  youHue: 0 | 1 | 2;
  cool: number;
  call: "level" | "boss" | "";
};

export type ArmadaKeys = { left: boolean; right: boolean; fire: boolean };

export function isBossLevel(level: number) {
  return level > 0 && level % 5 === 0;
}

export function makeWave(level: number): Enemy[] {
  const rows = level <= 1 ? 2 : level === 2 ? 3 : 3 + Math.min(2, Math.floor((level - 1) / 3));
  const cols = level <= 2 ? 6 : 7;
  const list: Enemy[] = [];
  const gap = 52;
  const startX = (W - (cols - 1) * gap) / 2;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const kind = Math.min(3, r + (level > 4 ? 1 : 0)) as EnemyKind;
      list.push({ x: startX + c * gap, y: 56 + r * 38, kind, alive: true });
    }
  }
  return list;
}

function burst(x: number, y: number, pts: number): Pop {
  const sparks = Array.from({ length: 14 }, () => {
    const a = Math.random() * Math.PI * 2;
    const spd = 80 + Math.random() * 180;
    return { x, y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd };
  });
  return { x, y, pts, life: 1, sparks };
}

function spawnBoss(level: number): Boss {
  const index = Math.max(0, Math.floor(level / 5) - 1);
  const hp = bossHpFor(level, 0);
  return {
    x: W / 2,
    y: 118,
    r: 48 + Math.min(14, index * 4),
    hp,
    maxHp: hp,
    vx: 70 + index * 16,
    fireCool: 0.85,
    spawnCool: 1.8,
    hue: 0,
    phase: 0,
    who: BOSS_ART[index % BOSS_ART.length]!,
  };
}

export function blank(level: number, score: number, lives: number): World {
  const bossLevel = isBossLevel(level);
  return {
    shipX: W / 2,
    enemies: bossLevel ? [] : makeWave(level),
    shots: [],
    pops: [],
    dir: 1,
    score,
    lives,
    level,
    clock: WAVE_SECS,
    banner: 1.8,
    invuln: 0,
    over: false,
    heart: null,
    heartGone: false,
    phase: bossLevel ? "boss" : "wave",
    boss: bossLevel ? spawnBoss(level) : null,
    youHue: 0,
    cool: 0,
    call: bossLevel ? "boss" : "level",
  };
}

export function fireYou(w: World) {
  if (w.over || w.cool > 0 || w.banner > 0.2) return false;
  const yourShots = w.shots.filter((s) => s.from === "you").length;
  if (yourShots >= 4) return false;
  const hue: ShotHue = w.phase === "boss" ? YOU_HUES[w.youHue]! : "green";
  if (w.phase === "boss") w.youHue = ((w.youHue + 1) % 3) as 0 | 1 | 2;
  w.shots.push({ x: w.shipX, y: H - 88, vy: -720, from: "you", hue });
  w.cool = 0.07;
  playLaser();
  return true;
}

function fireBoss(w: World, b: Boss) {
  const hue = BOSS_HUES[b.hue]!;
  b.hue = b.hue === 0 ? 1 : 0;
  const n = w.level >= 15 ? 3 : w.level >= 10 ? 2 : 1;
  const speed = 150 + w.level * 4;
  for (let i = 0; i < n; i++) {
    const off = n === 1 ? 0 : (i - (n - 1) / 2) * 22;
    w.shots.push({ x: b.x + off, y: b.y + b.r * 0.45, vy: speed, from: "boss", hue });
  }
  playLaser();
}

function loseLife(w: World, x: number, y: number) {
  if (w.invuln > 0 || w.over) return;
  w.lives -= 1;
  w.invuln = 1.6;
  w.shots = w.shots.filter((s) => s.from === "you");
  w.pops.push(burst(x, y, 0));
  playBlast();
  if (w.lives <= 0) w.over = true;
}

export function stepArmada(w: World, dt: number, keys: ArmadaKeys) {
  if (w.over) return;
  w.banner = Math.max(0, w.banner - dt);
  if (w.banner <= 0 && w.call === "level") w.call = "";
  if (w.phase === "wave") w.clock = Math.max(0, w.clock - dt);
  w.invuln = Math.max(0, w.invuln - dt);
  w.cool = Math.max(0, w.cool - dt);
  if (keys.left) w.shipX -= 240 * dt;
  if (keys.right) w.shipX += 240 * dt;
  w.shipX = Math.max(28, Math.min(W - 28, w.shipX));
  if (keys.fire) fireYou(w);

  if (w.phase === "wave") {
    let hitEdge = false;
    const speed = 18 + w.level * 4;
    for (const e of w.enemies) {
      if (!e.alive) continue;
      e.x += w.dir * speed * dt;
      if (e.x < 22 || e.x > W - 22) hitEdge = true;
    }
    if (hitEdge) {
      w.dir = w.dir === 1 ? -1 : 1;
      for (const e of w.enemies) {
        if (!e.alive) continue;
        e.y += 10;
        e.x += w.dir * 8;
      }
    }
    const theirShots = w.shots.filter((s) => s.from === "them").length;
    const shotCap = w.level <= 2 ? 1 : w.level <= 4 ? 2 : 3;
    if (theirShots < shotCap && Math.random() < 0.003 + w.level * 0.0008 && w.banner <= 0) {
      const live = w.enemies.filter((e) => e.alive);
      const fronts = live.filter((e) => !live.some((o) => o !== e && Math.abs(o.x - e.x) < 20 && o.y > e.y));
      const pool = fronts.length ? fronts : live;
      const shooter = pool[Math.floor(Math.random() * pool.length)];
      if (shooter) w.shots.push({ x: shooter.x, y: shooter.y + 12, vy: 140 + w.level * 10, from: "them", hue: "red" });
    }
  }

  if (w.phase === "boss" && w.boss) {
    const b = w.boss;
    b.phase += dt;
    b.x += b.vx * dt;
    if (b.x < 70 || b.x > W - 70) b.vx *= -1;
    b.x = Math.max(70, Math.min(W - 70, b.x));
    b.y = 118;
    b.fireCool -= dt;
    b.spawnCool -= dt;
    if (b.fireCool <= 0 && w.banner <= 0.25) {
      fireBoss(w, b);
      b.fireCool = Math.max(0.55, 1.55 - w.level * 0.04);
    }
    if (w.level >= 10 && b.spawnCool <= 0 && w.banner <= 0.2) {
      const minions = w.enemies.filter((e) => e.alive && e.minion).length;
      const cap = w.level >= 20 ? 4 : 2;
      if (minions < cap) {
        w.enemies.push({ x: b.x, y: b.y + b.r * 0.55, kind: 3, alive: true, minion: true });
      }
      b.spawnCool = Math.max(1.6, 3.2 - w.level * 0.06);
    }
  }

  for (const e of w.enemies) {
    if (!e.alive || !e.minion) continue;
    e.y += (46 + w.level * 2) * dt;
    if (e.y > H - 40) e.alive = false;
  }

  for (const s of w.shots) s.y += s.vy * dt;
  for (const p of w.pops) {
    p.life -= dt * 1.4;
    for (const sp of p.sparks) {
      sp.x += sp.vx * dt;
      sp.y += sp.vy * dt;
      sp.vy += 220 * dt;
    }
  }
  w.pops = w.pops.filter((p) => p.life > 0);
  w.shots = w.shots.filter((s) => s.y > -12 && s.y < H + 12);

  if (!w.heart && !w.heartGone && w.banner <= 0 && w.phase === "wave") {
    w.heart = { x: 40, y: 80, vx: 260, vy: 140 };
  }
  if (w.heart) {
    w.heart.x += w.heart.vx * dt;
    w.heart.y += w.heart.vy * dt;
    if (w.heart.x < 20 || w.heart.x > W - 20) w.heart.vx *= -1;
    if (w.heart.y < 40 || w.heart.y > H - 120) w.heart.vy *= -1;
    for (const s of w.shots) {
      if (s.from !== "you") continue;
      if (Math.abs(s.x - w.heart.x) < 16 && Math.abs(s.y - w.heart.y) < 16) {
        s.y = -99;
        if (w.lives < 3) w.lives += 1;
        w.heartGone = true;
        w.heart = null;
        break;
      }
    }
  }

  for (const s of w.shots) {
    if (s.from === "you") {
      for (const e of w.enemies) {
        if (!e.alive) continue;
        if (Math.abs(s.x - e.x) < 14 && Math.abs(s.y - e.y) < 12) {
          e.alive = false;
          s.y = -99;
          w.score += POINTS[e.kind];
          playBlast();
          w.pops.push(burst(e.x, e.y, POINTS[e.kind]));
        }
      }
      if (w.boss && w.boss.hp > 0) {
        const b = w.boss;
        if (Math.abs(s.x - b.x) < b.r * 0.72 && Math.abs(s.y - b.y) < b.r * 0.7) {
          b.hp -= 1;
          s.y = -99;
          if (b.hp <= 0) {
            w.score += 200 + w.level * 40;
            w.pops.push(burst(b.x, b.y, 200));
            playBlast();
            w.boss = null;
            w.enemies = [];
          }
        }
      }
    } else if (w.invuln <= 0 && Math.abs(s.x - w.shipX) < 14 && Math.abs(s.y - (H - 70)) < 16) {
      s.y = H + 99;
      loseLife(w, w.shipX, H - 70);
    }
  }

  for (const e of w.enemies) {
    if (!e.alive || w.invuln > 0) continue;
    if (Math.abs(e.x - w.shipX) < 22 && Math.abs(e.y - (H - 70)) < 24) {
      e.alive = false;
      loseLife(w, w.shipX, H - 70);
    }
  }
  if (w.boss && w.invuln <= 0 && Math.hypot(w.boss.x - w.shipX, w.boss.y - (H - 70)) < w.boss.r) {
    loseLife(w, w.shipX, H - 70);
  }

  if (!w.over && w.phase === "boss" && !w.boss && w.pops.length === 0) {
    Object.assign(w, blank(w.level + 1, w.score, w.lives));
    return;
  }
  if (!w.over && w.phase === "wave" && w.enemies.every((e) => !e.alive) && w.pops.length === 0) {
    playChime();
    Object.assign(w, blank(w.level + 1, w.score + 80, w.lives));
    return;
  }
  if (!w.over && w.phase === "wave" && w.clock <= 0 && w.enemies.some((e) => e.alive)) {
    w.over = true;
  }
}
