export const W = 640;
export const H = 360;
export const LEVEL_SECS = 60;
export const MAX_PLAYERS = 4;

export type Weapon = "pipe" | "bat" | "bottle";
export type Attack = "punch" | "kick" | "special";
export type FoeKind = "guy" | "girl";
export type PickupKind = "heart" | Weapon;

export type Foe = {
  x: number;
  y: number;
  vx: number;
  hp: number;
  kind: FoeKind;
  face: 1 | -1;
  hit: number;
  dead: number;
};

export type Pickup = { x: number; y: number; kind: PickupKind; taken: boolean };

export type LeapWorld = {
  cam: number;
  t: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  face: 1 | -1;
  onGround: boolean;
  lives: number;
  power: number;
  score: number;
  level: number;
  weapon: Weapon | null;
  attack: Attack | null;
  attackT: number;
  invuln: number;
  banner: number;
  over: boolean;
  wonLevel: boolean;
  foes: Foe[];
  loot: Pickup[];
  spawn: number;
};

export type LeapKeys = {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  punch: boolean;
  kick: boolean;
  special: boolean;
};

export type LeapFx = "punch" | "kick" | "special" | "hit" | "life" | "die" | "clear" | "grab";

const GROUND = H - 54;
const JUMP = -420;
const GRAV = 1400;

export function newLeap(level = 1): LeapWorld {
  return {
    cam: 0,
    t: LEVEL_SECS,
    x: 90,
    y: GROUND,
    vx: 0,
    vy: 0,
    face: 1,
    onGround: true,
    lives: 3,
    power: 0,
    score: 0,
    level,
    weapon: null,
    attack: null,
    attackT: 0,
    invuln: 0,
    banner: 1.4,
    over: false,
    wonLevel: false,
    foes: [],
    loot: seedLoot(level),
    spawn: 1.2,
  };
}

function seedLoot(level: number): Pickup[] {
  const out: Pickup[] = [];
  const n = 6 + level;
  for (let i = 0; i < n; i++) {
    const x = 220 + i * 210 + (i % 3) * 40;
    const roll = Math.random();
    const kind: PickupKind = roll < 0.38 ? "heart" : roll < 0.6 ? "pipe" : roll < 0.8 ? "bat" : "bottle";
    out.push({ x, y: GROUND - 6, kind, taken: false });
  }
  return out;
}

function spawnFoe(w: LeapWorld) {
  const ahead = w.cam + W + 40 + Math.random() * 80;
  const behind = w.cam - 50;
  const fromRight = Math.random() > 0.28;
  w.foes.push({
    x: fromRight ? ahead : behind,
    y: GROUND,
    vx: 0,
    hp: 2 + Math.min(3, Math.floor(w.level / 2)),
    kind: Math.random() < 0.5 ? "guy" : "girl",
    face: fromRight ? -1 : 1,
    hit: 0,
    dead: 0,
  });
}

export function stepLeap(w: LeapWorld, dt: number, keys: LeapKeys): LeapFx[] {
  const fx: LeapFx[] = [];
  if (w.over) return fx;
  w.banner = Math.max(0, w.banner - dt);
  w.invuln = Math.max(0, w.invuln - dt);
  w.power = Math.max(0, w.power - dt * 0.12);
  if (w.attackT > 0) {
    w.attackT -= dt;
    if (w.attackT <= 0) w.attack = null;
  }

  const scroll = 78 + w.level * 6;
  w.cam += scroll * dt;
  w.t -= dt;
  if (w.t <= 0) {
    w.t = 0;
    w.wonLevel = true;
    w.score += 250 + w.level * 40;
    fx.push("clear");
    w.level += 1;
    const keep = { lives: w.lives, score: w.score, level: w.level, power: w.power };
    Object.assign(w, newLeap(keep.level));
    w.lives = keep.lives;
    w.score = keep.score;
    w.power = keep.power;
    return fx;
  }

  const speed = 210;
  if (keys.left) {
    w.vx = -speed;
    w.face = -1;
  } else if (keys.right) {
    w.vx = speed;
    w.face = 1;
  } else w.vx *= 0.55;

  if (keys.up && w.onGround) {
    w.vy = JUMP;
    w.onGround = false;
  }
  w.vy += GRAV * dt;
  w.x += w.vx * dt;
  w.y += w.vy * dt;
  if (w.y >= GROUND) {
    w.y = GROUND;
    w.vy = 0;
    w.onGround = true;
  }
  const left = w.cam + 36;
  const right = w.cam + W - 36;
  if (w.x < left) {
    if (w.x < w.cam - 8) {
      w.lives -= 1;
      w.invuln = 1.1;
      w.x = left + 20;
      fx.push("die");
      if (w.lives <= 0) w.over = true;
    } else w.x = left;
  }
  if (w.x > right) w.x = right;

  if (!w.attack && keys.punch) {
    w.attack = "punch";
    w.attackT = 0.22;
    fx.push("punch");
  } else if (!w.attack && keys.kick) {
    w.attack = "kick";
    w.attackT = 0.28;
    fx.push("kick");
  } else if (!w.attack && keys.special) {
    w.attack = "special";
    w.attackT = 0.34;
    fx.push("special");
  }

  const want = 2 + Math.min(5, Math.floor(w.level * 0.9 + (LEVEL_SECS - w.t) / 14));
  w.spawn -= dt;
  if (w.spawn <= 0 && w.foes.filter((f) => f.dead <= 0).length < want) {
    spawnFoe(w);
    w.spawn = Math.max(0.55, 1.35 - w.level * 0.08);
  }

  const reach =
    w.attack === "special" ? 78 : w.attack === "kick" ? 56 : w.attack === "punch" ? 42 : 0;
  const dmgBase = w.attack === "special" ? 3 : w.attack === "kick" ? 2 : 1;
  const dmg = dmgBase + (w.weapon ? 1 : 0) + (w.power > 0 ? 1 : 0);

  for (const f of w.foes) {
    if (f.dead > 0) {
      f.dead += dt;
      continue;
    }
    f.hit = Math.max(0, f.hit - dt);
    const dx = w.x - f.x;
    f.face = dx >= 0 ? 1 : -1;
    const chase = 70 + w.level * 8;
    f.vx += Math.sign(dx) * chase * dt;
    f.vx *= 0.86;
    f.x += f.vx * dt;
    if (w.attack && reach && Math.abs(f.x - w.x) < reach && Math.abs(f.y - w.y) < 40 && Math.sign(f.x - w.x) === w.face) {
      f.hp -= dmg;
      f.hit = 0.18;
      f.vx = w.face * 180;
      fx.push("hit");
      if (f.hp <= 0) {
        f.dead = 0.05;
        w.score += f.kind === "girl" ? 120 : 100;
      }
    } else if (w.invuln <= 0 && Math.abs(f.x - w.x) < 22 && Math.abs(f.y - w.y) < 28) {
      w.lives -= 1;
      w.invuln = 1.05;
      w.vx = -w.face * 160;
      fx.push("die");
      if (w.lives <= 0) w.over = true;
    }
  }
  w.foes = w.foes.filter((f) => f.dead < 0.7);

  for (const p of w.loot) {
    if (p.taken) continue;
    if (Math.abs(p.x - w.x) < 22 && Math.abs(p.y - w.y) < 28) {
      p.taken = true;
      if (p.kind === "heart") {
        w.power = Math.min(6, w.power + 3);
        w.score += 80;
        if (w.lives < 3) w.lives += 1;
        fx.push("life");
      } else {
        w.weapon = p.kind;
        w.score += 40;
        fx.push("grab");
      }
    }
  }
  return fx;
}
