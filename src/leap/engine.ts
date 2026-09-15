export const W = 1280;
export const H = 720;
export const LEVEL_SECS = 60;
export const SPRITE = 420;

export type Weapon = "pipe" | "bat" | "bottle";
export type Attack = "punch" | "kick" | "special";
export type FoeKind =
  | "punk"
  | "jacket"
  | "blade"
  | "dancer"
  | "cap"
  | "bruiser"
  | "zorath"
  | "samael"
  | "karen"
  | "evilrosie"
  | "badtux"
  | "mightymurphy"
  | "milomenace";
export type PickupKind = "heart";
export type Phase = "street" | "hold" | "intro" | "boss" | "round" | "clear";

export type Foe = {
  x: number;
  y: number;
  vx: number;
  hp: number;
  max: number;
  kind: FoeKind;
  face: 1 | -1;
  hit: number;
  dead: number;
  boss: boolean;
  attackT: number;
  struck: boolean;
  scale: number;
  born: number;
};

export type Pickup = { x: number; y: number; kind: PickupKind; taken: boolean; flash: number };

export type Shot = { x: number; y: number; vx: number; life: number; from: "you" | "them"; who: string };

export type LeapWorld = {
  cam: number;
  lock: number | null;
  phase: Phase;
  t: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  face: 1 | -1;
  onGround: boolean;
  lives: number;
  hp: number;
  maxHp: number;
  power: number;
  score: number;
  level: number;
  weapon: Weapon | null;
  attack: Attack | null;
  attackT: number;
  invuln: number;
  banner: number;
  over: boolean;
  foes: Foe[];
  loot: Pickup[];
  gates: number[];
  gateI: number;
  endX: number;
  grace: number;
  spawnT: number;
  shots: Shot[];
  heartIn: number;
  spawnI: number;
  hero: string;
  youRounds: number;
  bossRounds: number;
  roundHold: number;
  specials: number;
  bossSpecials: number;
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

export type LeapFx =
  | "punch"
  | "kick"
  | "special"
  | "hit"
  | "landPunch"
  | "landKick"
  | "landSpecial"
  | "life"
  | "die"
  | "clear"
  | "grab"
  | "boss";

const GROUND = 560;
const JUMP = -680;
const GRAV = 1680;
const KINDS: FoeKind[] = ["punk", "jacket", "blade", "dancer", "cap", "bruiser"];
const GAP = 300;

function foe(kind: FoeKind, x: number, hp: number, boss = false): Foe {
  return {
    x,
    y: GROUND,
    vx: -80,
    hp,
    max: hp,
    kind,
    face: -1,
    hit: 0,
    dead: 0,
    boss,
    attackT: 0,
    struck: false,
    scale: boss ? 1.38 : 1,
    born: 0,
  };
}

export function newLeap(level = 1, keep?: { lives: number; score: number; power: number; hp?: number }): LeapWorld {
  const endX = 1680 + level * 40;
  const gates = [420, 860, 1280];
  return {
    cam: 0,
    lock: null,
    phase: "street",
    t: LEVEL_SECS,
    x: 110,
    y: GROUND,
    vx: 0,
    vy: 0,
    face: 1,
    onGround: true,
    lives: keep?.lives ?? 3,
    hp: keep?.hp ?? 100,
    maxHp: 100,
    power: keep?.power ?? 0,
    score: keep?.score ?? 0,
    level,
    weapon: null,
    attack: null,
    attackT: 0,
    invuln: 0,
    banner: 1.4,
    over: false,
    foes: [],
    loot: seedLoot(level, endX),
    gates,
    gateI: 0,
    endX,
    grace: 0.9,
    spawnT: spawnGap(level),
    shots: [],
    heartIn: 18 + Math.random() * 50,
    spawnI: 0,
    hero: "",
    youRounds: 0,
    bossRounds: 0,
    roundHold: 0,
    specials: 5,
    bossSpecials: 5,
  };
}

function seedLoot(_level: number, _endX: number): Pickup[] {
  return [];
}

function seedWave(atX: number, level: number, n: number): Foe[] {
  const out: Foe[] = [];
  const count = Math.max(1, n);
  for (let i = 0; i < count; i++) {
    const kind = KINDS[(level + i) % KINDS.length]!;
    const hp = 6 + level * 3 + (kind === "bruiser" ? 4 : 0);
    out.push(foe(kind, atX + i * GAP, hp));
  }
  return out;
}

function nextStreet(w: LeapWorld): FoeKind {
  const live = w.foes.filter((f) => f.dead <= 0).map((f) => f.kind);
  for (let n = 0; n < KINDS.length; n++) {
    const kind = KINDS[(w.spawnI + n) % KINDS.length]!;
    if (!live.includes(kind)) {
      w.spawnI += n + 1;
      return kind;
    }
  }
  w.spawnI += 1;
  return KINDS[w.spawnI % KINDS.length]!;
}

function spawnGap(level: number) {
  return Math.max(0.95, 2.65 - (level - 1) * 0.22);
}

function maxLive(level: number) {
  return Math.min(4, 2 + Math.floor((level - 1) / 2));
}

function spawnOne(w: LeapWorld, x: number, fromLeft = false) {
  const f = foe(nextStreet(w), x, 6 + w.level * 3);
  f.born = 1;
  if (fromLeft) {
    f.face = 1;
    f.vx = 90;
  }
  w.foes.push(f);
}

function clearOfFoes(w: LeapWorld, x: number, min = 280) {
  return !w.foes.some((f) => f.dead <= 0 && Math.abs(f.x - x) < min);
}

const BOSSES: FoeKind[] = ["karen", "evilrosie", "badtux", "mightymurphy", "milomenace", "bruiser", "zorath", "samael"];

export function bossKind(level: number): FoeKind {
  return BOSSES[Math.min(BOSSES.length, Math.max(1, level)) - 1]!;
}

function spawnBoss(w: LeapWorld) {
  const kind = bossKind(w.level);
  const hp = 150 + w.level * 40 + (kind === "samael" ? 50 : kind === "zorath" ? 36 : kind === "karen" ? 24 : 12);
  const boss = foe(kind, w.cam + W - 200, hp, true);
  boss.scale = 1.08;
  boss.face = -1;
  w.foes.push(boss);
}

export function stepLeap(w: LeapWorld, dt: number, keys: LeapKeys): LeapFx[] {
  const fx: LeapFx[] = [];
  if (w.over || w.phase === "clear" || w.phase === "intro") return fx;
  if (w.phase === "round") {
    w.roundHold = Math.max(0, w.roundHold - dt);
    if (w.roundHold <= 0) finishRound(w, fx);
    return fx;
  }
  w.banner = Math.max(0, w.banner - dt);
  w.invuln = Math.max(0, w.invuln - dt);
  w.power = Math.max(0, w.power - dt * 0.12);
  if (w.phase !== "boss" && w.invuln <= 0 && w.hp > 0 && w.hp < w.maxHp) {
    w.hp = Math.min(w.maxHp, w.hp + 3.2 * dt);
  }
  if (w.grace > 0) {
    w.grace = Math.max(0, w.grace - dt);
    if (w.grace === 0 && w.foes.filter((f) => f.dead <= 0).length === 0 && w.phase === "street") {
      spawnOne(w, w.cam + W + 180);
      w.spawnT = spawnGap(w.level);
    }
  }
  if (w.phase === "street") {
    w.spawnT -= dt;
    if (w.spawnT <= 0 && w.foes.filter((f) => f.dead <= 0).length < maxLive(w.level)) {
      const late = w.t < LEVEL_SECS * 0.4;
      const fromLeft = late && w.foes.filter((f) => f.x < w.x && f.dead <= 0).length === 0;
      const x = fromLeft ? w.cam - 140 : w.cam + W + 120;
      if (clearOfFoes(w, x, 260)) {
        spawnOne(w, x, fromLeft);
        w.spawnT = spawnGap(w.level);
      } else w.spawnT = spawnGap(w.level) * 0.45;
    }
    if (w.heartIn > 0) {
      w.heartIn -= dt;
      if (w.heartIn <= 0 && !w.loot.some((p) => !p.taken)) {
        w.loot.push({ x: w.x + 220, y: 300, kind: "heart", taken: false, flash: 0 });
      }
    }
  }
  if (w.attackT > 0) {
    w.attackT -= dt;
    if (w.attackT <= 0) w.attack = null;
  }

  if (w.phase === "street" || w.phase === "hold") {
    w.t = Math.max(0, w.t - dt);
  }

  const speed = 250;
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

  if (w.phase === "boss") {
    w.x = Math.max(w.cam + 50, Math.min(w.cam + W - 50, w.x));
  } else {
    w.x = Math.max(w.cam + 80, w.x);
    const drift = 78 * dt;
    w.cam += drift;
    w.x += drift;
    const follow = w.x - 340;
    if (follow > w.cam) w.cam += Math.min(follow - w.cam, 640 * dt);
    w.x = Math.max(w.cam + 80, Math.min(w.cam + W - 80, w.x));
    const nextGate = w.gates[w.gateI];
    if (nextGate !== undefined && w.x >= nextGate) {
      w.foes.push(...seedWave(w.cam + W + 180, w.level, 1));
      w.gateI += 1;
    }
    if (w.t <= 0) {
      startBoss(w, fx);
    }
  }

  if (w.phase === "boss") w.cam = w.lock ?? w.cam;

  if (!w.attack && (keys.punch || keys.kick || keys.special)) {
    if (keys.left && !keys.right) w.face = -1;
    else if (keys.right && !keys.left) w.face = 1;
    if (keys.punch) {
      w.attack = "punch";
      w.attackT = 0.24;
      fx.push("punch");
    } else if (keys.kick) {
      w.attack = "kick";
      w.attackT = 0.3;
      fx.push("kick");
    } else if (keys.special && w.specials > 0) {
      w.attack = "special";
      w.attackT = 0.36;
      w.specials -= 1;
      fx.push("special");
      w.shots.push({
        x: w.x + w.face * 70,
        y: GROUND - 220,
        vx: w.face * 520,
        life: 1.6,
        from: "you",
        who: w.hero || "nancy",
      });
    }
  }

  const reach = w.attack === "special" ? 170 : w.attack === "kick" ? 150 : w.attack === "punch" ? 130 : 0;
  const dmg = (w.attack === "special" ? 4 : w.attack === "kick" ? 3 : 2) + (w.power > 0 ? 1 : 0);

  for (const f of w.foes) {
    if (f.dead > 0) {
      f.dead += dt;
      continue;
    }
    f.born += dt;
    f.hit = Math.max(0, f.hit - dt);
    if (f.attackT > 0) {
      f.attackT -= dt;
      if (f.attackT <= 0) f.struck = false;
    }
    const dx = w.x - f.x;
    if (Math.abs(dx) > 48 && f.born > 0.35) f.face = dx >= 0 ? 1 : -1;
    const gap = Math.abs(dx);
    const walk = f.boss ? 160 + w.level * 10 : 140 + w.level * 12;
    if (gap > (f.boss ? 88 : 70)) f.vx = Math.sign(dx || -1) * walk;
    else if (gap < 50) f.vx = Math.sign(dx || -1) * walk * 0.2;
    else f.vx *= 0.65;
    f.x += f.vx * dt;
    if (w.phase === "boss" || w.phase === "hold") {
      f.x = Math.max(w.cam + 40, Math.min(w.cam + W - 40, f.x));
    }
    if (gap < (f.boss ? 220 : 160) && f.attackT <= 0) {
      f.attackT = f.boss ? 0.62 : 0.55;
      f.struck = false;
      if (f.boss && w.bossSpecials > 0) {
        w.bossSpecials -= 1;
        w.shots.push({
          x: f.x + f.face * 60,
          y: GROUND - 200,
          vx: f.face * (360 + w.level * 20),
          life: 1.4,
          from: "them",
          who: f.kind,
        });
        fx.push("special");
      }
    }
    const ahead = (f.x - w.x) * w.face > 12;
    if (w.attack && ahead && f.hit <= 0 && reach && Math.abs(f.x - w.x) < reach + (f.boss ? 20 : 0) && Math.abs(f.y - w.y) < 110) {
      f.hp -= f.boss ? Math.max(1, Math.floor(dmg * 0.7)) : dmg;
      f.hit = 0.16;
      f.vx = w.face * (f.boss ? 70 : 160);
      fx.push("hit");
      if (w.attack === "kick") fx.push("landKick");
      else if (w.attack === "special") fx.push("landSpecial");
      else fx.push("landPunch");
      if (f.hp <= 0) {
        if (f.boss && w.phase === "boss") {
          f.hp = 0;
          f.dead = 0.02;
          startRoundWin(w, "you", fx);
        } else {
          f.dead = 0.02;
          w.score += f.boss ? 600 + w.level * 100 : 100;
        }
      }
    } else if (
      !f.struck &&
      f.attackT > 0.08 &&
      f.attackT < 0.48 &&
      w.invuln <= 0 &&
      gap < (f.boss ? 170 : 130) &&
      Math.abs(f.y - w.y) < 140
    ) {
      f.struck = true;
      const hurt = f.boss ? 16 + w.level * 3 : 4 + w.level;
      hurtHero(w, hurt, fx);
    }
  }
  w.foes = w.foes.filter((f) => f.dead < 0.9);

  w.shots = w.shots.filter((s) => {
    s.life -= dt;
    s.x += s.vx * dt;
    if (s.life <= 0) return false;
    if (s.from === "you") {
      const hit = w.foes.find((f) => f.dead <= 0 && Math.abs(f.x - s.x) < 78 && Math.abs(f.y - GROUND) < 180);
      if (hit) {
        hit.hp = hit.boss ? Math.max(0, hit.hp - Math.max(8, Math.ceil(hit.max * 0.08))) : 0;
        hit.hit = 0.16;
        hit.vx = Math.sign(s.vx) * 180;
        fx.push("hit");
        fx.push("landSpecial");
        if (hit.hp <= 0) {
          if (hit.boss && w.phase === "boss") {
            hit.hp = 0;
            hit.dead = 0.02;
            startRoundWin(w, "you", fx);
          } else {
            hit.dead = 0.02;
            w.score += hit.boss ? 600 + w.level * 100 : 100;
          }
        }
        return false;
      }
      return true;
    }
    if (w.invuln <= 0 && Math.abs(s.x - w.x) < 48 && Math.abs(GROUND - 190 - w.y) < 140) {
      hurtHero(w, 14 + w.level * 2, fx);
      return false;
    }
    return true;
  });

  if (w.phase === "hold" && w.foes.length === 0) {
    w.phase = "street";
    w.lock = null;
  }
  if (w.phase === "boss" && !w.foes.some((f) => f.boss && f.dead <= 0 && f.hp > 0) && w.roundHold <= 0 && w.youRounds < 2) {
    // handled by startRoundWin
  }

  for (const p of w.loot) {
    if (p.taken) {
      p.flash += dt;
      const mid = w.cam + W / 2;
      p.x += (mid - p.x) * Math.min(1, 7 * dt);
      p.y -= 420 * dt;
      continue;
    }
    p.y += Math.sin(w.t * 3) * 8 * dt;
    if (Math.abs(p.x - w.x) < 120 && Math.abs(w.y - 80 - p.y) < 220) {
      p.taken = true;
      p.flash = 0.02;
      if (w.lives < 3) w.lives += 1;
      w.score += 80;
      fx.push("life");
    }
  }
  w.loot = w.loot.filter((p) => !p.taken || p.y > -80);
  return fx;
}

function hurtHero(w: LeapWorld, amount: number, fx: LeapFx[]) {
  w.hp = Math.max(0, w.hp - amount);
  w.invuln = 1.15;
  w.vx = -w.face * 140;
  fx.push("die");
  if (w.hp > 0) return;
  if (w.phase === "boss") {
    startRoundWin(w, "boss", fx);
    return;
  }
  w.lives -= 1;
  w.hp = w.lives > 0 ? w.maxHp : 0;
  if (w.lives <= 0) w.over = true;
}

function startRoundWin(w: LeapWorld, who: "you" | "boss", fx: LeapFx[]) {
  if (w.phase !== "boss") return;
  if (who === "you") {
    w.youRounds += 1;
    w.score += 200;
  } else w.bossRounds += 1;
  w.phase = "round";
  w.roundHold = 2.3;
  w.invuln = 2.3;
  w.shots = [];
  fx.push("die");
}

function finishRound(w: LeapWorld, fx: LeapFx[]) {
  if (w.youRounds >= 2) {
    w.phase = "clear";
    w.score += 400;
    fx.push("clear");
    return;
  }
  if (w.bossRounds >= 2) {
    w.lives -= 1;
    if (w.lives <= 0) {
      w.over = true;
      w.phase = "boss";
      return;
    }
    w.youRounds = 0;
    w.bossRounds = 0;
  }
  resetBossRing(w);
  w.phase = "boss";
}

function resetBossRing(w: LeapWorld) {
  w.hp = w.maxHp;
  w.x = w.cam + 180;
  w.vx = 0;
  w.face = 1;
  w.attack = null;
  w.attackT = 0;
  w.invuln = 0.6;
  w.shots = [];
  w.specials = 5;
  w.bossSpecials = 5;
  w.foes = [];
  spawnBoss(w);
}

function startBoss(w: LeapWorld, fx: LeapFx[]) {
  if (w.phase === "boss" || w.phase === "intro") return;
  w.phase = "intro";
  w.lock = Math.max(0, w.x - 200);
  w.cam = w.lock;
  w.foes = [];
  w.shots = [];
  w.banner = 0;
  w.youRounds = 0;
  w.bossRounds = 0;
  w.roundHold = 0;
  fx.push("boss");
}

export function beginBoss(w: LeapWorld) {
  if (w.phase !== "intro") return;
  w.phase = "boss";
  w.youRounds = 0;
  w.bossRounds = 0;
  w.hp = w.maxHp;
  w.x = w.cam + 180;
  w.face = 1;
  spawnBoss(w);
  w.specials = 5;
  w.bossSpecials = 5;
  w.banner = 0;
}

export function advanceLevel(w: LeapWorld) {
  const next = newLeap(w.level + 1, { lives: w.lives, score: w.score, power: w.power, hp: w.hp });
  next.hero = w.hero;
  next.specials = 5;
  Object.assign(w, next);
}
