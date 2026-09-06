import { playKick, playPunch, playSpecial } from "@/game/audio";

export type FightFighterId =
  | "nancy"
  | "ronnie"
  | "veronika"
  | "sarah"
  | "adamus"
  | "mira"
  | "sananda"
  | "murphy"
  | "tux"
  | "milo"
  | "lena"
  | "eliav"
  | "nadav"
  | "olivia"
  | "geraldine"
  | "sophie"
  | "rosie"
  | "harlan"
  | "zorath"
  | "samael";

export type FightInput = {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  punch: boolean;
  kick: boolean;
  special: boolean;
};

export type FightDiff = "easy" | "normal" | "hard";
export type FightPhase = "versus" | "countdown" | "fight" | "ko" | "match";

export const CAREER: FightFighterId[] = [
  "veronika",
  "milo",
  "tux",
  "olivia",
  "rosie",
  "murphy",
  "ronnie",
  "samael",
];

type AttackKind = "punch" | "kick" | "special";

type Box = { x: number; y: number; w: number; h: number };

export type Projectile = {
  x: number;
  y: number;
  vx: number;
  from: 0 | 1;
  life: number;
  kind: "orb" | "bolt";
  who: FightFighterId;
};

export type Spark = { x: number; y: number; vx: number; vy: number; life: number; gold: boolean };

export type Fighter = {
  id: FightFighterId;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  hp: number;
  maxHp: number;
  rounds: number;
  state: "idle" | "walk" | "crouch" | "jump" | "punch" | "kick" | "special" | "hit" | "block" | "ko";
  frame: number;
  attack: AttackKind | null;
  connected: boolean;
  blocking: boolean;
  cool: number;
  meter: number;
};

export type FightState = {
  phase: FightPhase;
  timer: number;
  clock: number;
  round: number;
  fighters: [Fighter, Fighter];
  projectiles: Projectile[];
  sparks: Spark[];
  shake: number;
  banner: string;
  winner: 0 | 1 | null;
  diff: FightDiff;
  rung: number;
};

export const W = 1280;
export const H = 720;
export const GROUND = 560;
export const GRAVITY = 2100;
export const WALK = 430;
export const JUMP = 1320;
export const MAX_HP = 1000;

export const FIGHTERS: Record<
  FightFighterId,
  { name: string; special: string; color: string; accent: string; art: string; body: string; line: string; artFace?: 1 | -1 }
> = {
  nancy: {
    name: "Nancy",
    special: "Spark",
    color: "#d4a54a",
    accent: "#f4ead8",
    art: "/art/nancy.jpg?v=front",
    body: "/art/fighters/nancy.png?v=body10",
    line: "Girl of Nevaeh",
  },
  ronnie: {
    name: "Ronnie",
    special: "Shield",
    color: "#8a6a2e",
    accent: "#c5c8d0",
    art: "/art/ronnie.jpg?v=cover",
    body: "/art/fighters/ronnie.png?v=stance1",
    line: "Father",
  },
  veronika: {
    name: "Veronika",
    special: "Weave",
    color: "#6b5b8c",
    accent: "#d4a54a",
    art: "/art/veronika-young.jpg?v=1",
    body: "/art/fighters/veronika.png?v=stance1",
    line: "Of Nevaeh",
  },
  sarah: {
    name: "Sarah",
    special: "Light",
    color: "#d4a54a",
    accent: "#f4ead8",
    art: "/art/codex/sarah.jpg",
    body: "/art/fighters/sarah.png?v=stance1",
    line: "Mother",
  },
  adamus: {
    name: "Adamus",
    special: "Time",
    color: "#c4a35a",
    accent: "#f4ead8",
    art: "/art/adamus.jpg?v=front",
    body: "/art/fighters/adamus.png?v=stance1",
    line: "Master Builder",
  },
  mira: {
    name: "Mira",
    special: "Garden",
    color: "#3a6a48",
    accent: "#d4a54a",
    art: "/art/codex/mira.jpg",
    body: "/art/fighters/mira.png?v=stance1",
    line: "Sister of Veronika",
  },
  sananda: {
    name: "Sananda",
    special: "Spark",
    color: "#c4a35a",
    accent: "#f4ead8",
    art: "/art/codex/sananda.jpg",
    body: "/art/fighters/sananda.png?v=stance1",
    line: "The Teacher",
  },
  murphy: {
    name: "Murphy",
    special: "Kin",
    color: "#a15c32",
    accent: "#e8c9a8",
    art: "/art/codex/murphy.jpg",
    body: "/art/fighters/murphy.png?v=photo1",
    line: "Crew of Genesis",
  },
  tux: {
    name: "Tux",
    special: "Hull",
    color: "#2f3a48",
    accent: "#c5c8d0",
    art: "/art/codex/tux.jpg",
    body: "/art/fighters/tux.png?v=photo1",
    line: "Crew of Genesis",
  },
  milo: {
    name: "Milo",
    special: "Wonder",
    color: "#7a5a2a",
    accent: "#f0d9a8",
    art: "/art/codex/milo.jpg",
    body: "/art/fighters/milo.png?v=lab2",
    line: "Crew of Genesis",
  },
  lena: {
    name: "Lena",
    special: "Fold",
    color: "#2a4a6a",
    accent: "#3cf0ff",
    art: "/art/codex/lena.jpg",
    body: "/art/fighters/lena.png?v=stance1",
    line: "Officer",
  },
  eliav: {
    name: "Eliav",
    special: "Cave",
    color: "#6a5a3a",
    accent: "#d4a54a",
    art: "/art/codex/eliav.jpg",
    body: "/art/fighters/eliav.png?v=stance1",
    line: "Desert guardian",
  },
  nadav: {
    name: "Nadav",
    special: "Watch",
    color: "#4a5a3a",
    accent: "#e8c9a8",
    art: "/art/codex/nadav.jpg",
    body: "/art/fighters/nadav.png?v=stance1",
    line: "Desert companion",
  },
  olivia: {
    name: "Olivia",
    special: "Door",
    color: "#8b4b3b",
    accent: "#f4ead8",
    art: "/art/codex/olivia.jpg",
    body: "/art/fighters/olivia.png?v=stance1",
    line: "Open door",
  },
  geraldine: {
    name: "Geraldine",
    special: "Case",
    color: "#1d2a4a",
    accent: "#d4a54a",
    art: "/art/codex/geraldine.jpg?v=fbi",
    body: "/art/fighters/geraldine.png?v=stance1",
    line: "FBI",
  },
  sophie: {
    name: "Sophie",
    special: "Watch",
    color: "#5c4a3a",
    accent: "#d4c4b0",
    art: "/art/codex/sophie.jpg",
    body: "/art/fighters/sophie.png?v=stance1",
    line: "Soft armour",
  },
  rosie: {
    name: "Rosie",
    special: "Memory",
    color: "#3d2a32",
    accent: "#e2c4c8",
    art: "/art/codex/rosie.jpg",
    body: "/art/fighters/rosie.png?v=animal3",
    line: "Loyal watch",
  },
  harlan: {
    name: "Brother Peters",
    special: "Stone",
    color: "#5a4638",
    accent: "#d4a54a",
    art: "/art/codex/grizzly.jpg",
    body: "/art/fighters/harlan.png?v=stance1",
    line: "Chapter House",
  },
  zorath: {
    name: "Zorath",
    special: "Claim",
    color: "#3a2430",
    accent: "#b08980",
    art: "/art/codex/zorath.jpg",
    body: "/art/fighters/zorath.png?v=stance1",
    line: "The rival",
  },
  samael: {
    name: "Samael",
    special: "Fracture",
    color: "#4a3048",
    accent: "#b08980",
    art: "/art/samael.jpg?v=front",
    body: "/art/fighters/samael.png?v=stance1",
    line: "Ancient shadow",
  },
};

export const PLAYABLE: FightFighterId[] = [
  "nancy",
  "ronnie",
  "veronika",
  "sarah",
  "adamus",
  "mira",
  "sananda",
  "murphy",
  "tux",
  "milo",
  "lena",
  "eliav",
  "nadav",
  "olivia",
  "geraldine",
  "sophie",
  "rosie",
  "harlan",
  "zorath",
  "samael",
];

const bodyCache: Record<string, HTMLImageElement> = {};
const atkCache: Record<string, HTMLImageElement> = {};
const faceCache: Record<string, HTMLImageElement> = {};

function loadImg(src: string) {
  const img = new Image();
  img.decoding = "async";
  img.src = src;
  return img;
}

export function preloadFightArt() {
  if (typeof Image === "undefined") return bodyCache;
  for (const id of PLAYABLE) {
    if (!bodyCache[id]) bodyCache[id] = loadImg(FIGHTERS[id].body);
    if (!atkCache[id]) atkCache[id] = loadImg(`/art/fighters/${id}-atk.png?v=atk10`);
    if (!faceCache[id]) faceCache[id] = loadImg(FIGHTERS[id].art);
  }
  return bodyCache;
}

export function fightAttackSheets() {
  preloadFightArt();
  return atkCache;
}

export function fightFaces() {
  preloadFightArt();
  return faceCache;
}

const ATTACK: Record<AttackKind, { frames: number; active: [number, number]; dmg: number; reach: number; h: number; y: number }> =
  {
    punch: { frames: 18, active: [5, 10], dmg: 70, reach: 78, h: 48, y: 200 },
    kick: { frames: 22, active: [7, 13], dmg: 100, reach: 96, h: 44, y: 300 },
    special: { frames: 28, active: [10, 16], dmg: 130, reach: 72, h: 56, y: 180 },
  };

function makeFighter(id: FightFighterId, x: number, facing: 1 | -1): Fighter {
  return {
    id,
    name: FIGHTERS[id].name,
    x,
    y: GROUND,
    vx: 0,
    vy: 0,
    facing,
    hp: MAX_HP,
    maxHp: MAX_HP,
    rounds: 0,
    state: "idle",
    frame: 0,
    attack: null,
    connected: false,
    blocking: false,
    cool: 0,
    meter: 100,
  };
}

export function createMatch(hero: FightFighterId, foe: FightFighterId, diff: FightDiff = "normal", rung = 0): FightState {
  const cpu = makeFighter(foe, 960, -1);
  cpu.cool = diff === "easy" ? 50 : diff === "hard" ? 18 : 32;
  return {
    phase: "countdown",
    timer: 1.35,
    clock: 99,
    round: 1,
    fighters: [makeFighter(hero, 320, 1), cpu],
    projectiles: [],
    sparks: [],
    shake: 0,
    banner: "FIGHT",
    winner: null,
    diff,
    rung,
  };
}

export function resetRound(s: FightState) {
  const [a, b] = s.fighters;
  a.x = 320;
  b.x = 960;
  a.y = b.y = GROUND;
  a.vx = b.vx = a.vy = b.vy = 0;
  a.facing = 1;
  b.facing = -1;
  a.hp = b.hp = MAX_HP;
  a.state = b.state = "idle";
  a.frame = b.frame = 0;
  a.attack = b.attack = null;
  a.connected = b.connected = false;
  b.cool = 36;
  s.projectiles = [];
  s.sparks = [];
  s.clock = 99;
  s.shake = 0;
  s.winner = null;
}

function hurtbox(f: Fighter): Box {
  const crouch = f.state === "crouch";
  const h = crouch ? 250 : 400;
  return { x: f.x - 48, y: f.y - h, w: 96, h };
}

function hitbox(f: Fighter): Box | null {
  if (!f.attack) return null;
  const spec = ATTACK[f.attack];
  if (f.frame < spec.active[0] || f.frame > spec.active[1]) return null;
  const dir = f.facing;
  return {
    x: dir === 1 ? f.x + 20 : f.x - 20 - spec.reach,
    y: f.y - spec.y - spec.h,
    w: spec.reach,
    h: spec.h,
  };
}

function overlaps(a: Box, b: Box) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function busy(f: Fighter) {
  return f.state === "punch" || f.state === "kick" || f.state === "special" || f.state === "hit" || f.state === "ko";
}

function sparkBurst(s: FightState, x: number, y: number, gold: boolean) {
  for (let i = 0; i < 10; i++) {
    s.sparks.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 420,
      vy: -80 - Math.random() * 240,
      life: 0.25 + Math.random() * 0.25,
      gold,
    });
  }
}

function startAttack(f: Fighter, kind: AttackKind) {
  if (busy(f) || f.state === "ko") return;
  if (f.state === "jump" && kind === "special") return;
  if (kind === "special") {
    if (f.meter < 50) return;
    f.meter = 0;
  }
  f.state = kind;
  f.attack = kind;
  f.frame = 0;
  f.connected = false;
}

function launchSpecial(s: FightState, f: Fighter, who: 0 | 1) {
  const orb = f.id === "nancy";
  s.projectiles.push({
    x: f.x + f.facing * 70,
    y: f.y - 230,
    vx: f.facing * (orb ? 560 : 440),
    from: who,
    life: 2,
    kind: orb ? "orb" : "bolt",
    who: f.id,
  });
}

function applyHit(s: FightState, atk: Fighter, def: Fighter, dmg: number, kind?: AttackKind) {
  if (def.state === "ko") return;
  const toward = Math.sign(def.x - atk.x) || atk.facing;
  if (atk.facing !== toward && atk.facing !== -toward) return;
  if ((def.x - atk.x) * atk.facing <= 0) return;
  const blocked = def.blocking && def.facing === -toward;
  const cpu = atk === s.fighters[1];
  const rung = s.rung ?? 0;
  const mul =
    (s.diff === "easy" ? 0.48 : s.diff === "hard" ? 0.92 : 0.68) + rung * 0.05;
  const scaled = cpu ? Math.round(dmg * Math.min(1.15, mul)) : dmg;
  if (blocked) {
    def.state = "block";
    def.frame = 0;
    def.vx = toward * 80;
    sparkBurst(s, def.x, def.y - 180, false);
    return;
  }
  def.hp = Math.max(0, def.hp - scaled);
  const used = kind ?? atk.attack;
  if (used === "kick") playKick();
  else if (used === "special") playSpecial();
  else playPunch();
  atk.meter = Math.min(100, atk.meter + 34);
  def.state = def.hp <= 0 ? "ko" : "hit";
  def.frame = 0;
  def.attack = null;
  def.vx = toward * (def.hp <= 0 ? 30 : 280);
  def.vy = def.hp <= 0 ? 0 : def.y < GROUND ? -120 : -60;
  if (def.hp <= 0) def.y = GROUND;
  s.shake = 10;
  sparkBurst(s, def.x, def.y - 200, atk !== s.fighters[1]);
}

function ai(s: FightState, cpu: Fighter, hero: Fighter, dt: number): FightInput {
  void dt;
  const empty: FightInput = { left: false, right: false, up: false, down: false, punch: false, kick: false, special: false };
  if (s.phase !== "fight" || busy(cpu)) return empty;
  cpu.cool = Math.max(0, cpu.cool - 1);
  const dx = hero.x - cpu.x;
  const dist = Math.abs(dx);
  const towardLeft = dx < 0;
  if (hero.state === "hit" || hero.state === "ko") {
    return { ...empty, left: dx > 0, right: dx < 0 };
  }
  const roll = Math.random();
  const rung = s.rung ?? 0;
  const sharp = (s.diff === "easy" ? 0.55 : s.diff === "hard" ? 1.35 : 1) + rung * 0.12;
  if (hero.attack && dist < 200 && roll < 0.28 * sharp) {
    return { ...empty, left: !towardLeft, right: towardLeft };
  }
  const swing = s.diff === "easy" ? 0.025 : s.diff === "hard" ? 0.1 : 0.055;
  if (cpu.meter >= 50 && dist > 90 && dist < 420 && roll < 0.08 * sharp) {
    return { ...empty, special: true };
  }
  if (cpu.cool === 0 && dist < 118 && roll < swing * sharp) {
    cpu.cool = s.diff === "hard" ? 28 : s.diff === "easy" ? 62 : 42;
    return { ...empty, punch: roll < swing * 0.5, kick: roll >= swing * 0.5 };
  }
  if (cpu.cool === 0 && dist > 150 && dist < 260 && roll < 0.01 * sharp) {
    cpu.cool = 70;
    return { ...empty, punch: true };
  }
  if (cpu.x < 200 && hero.x < cpu.x + 160) {
    return { ...empty, up: true, right: true };
  }
  if (cpu.x > W - 200 && hero.x > cpu.x - 160) {
    return { ...empty, up: true, left: true };
  }
  if (dist < 150 && roll < 0.06) {
    return { ...empty, up: true, left: !towardLeft, right: towardLeft };
  }
  if (dist < 100 && roll < 0.4) {
    return { ...empty, left: !towardLeft, right: towardLeft };
  }
  if (dist > 140) {
    return { ...empty, left: towardLeft, right: !towardLeft };
  }
  if (roll < 0.02) return { ...empty, up: true };
  return empty;
}

function controlFighter(f: Fighter, input: FightInput, other: Fighter, dt: number) {
  if (f.state === "ko") {
    f.vx *= 0.9;
    return;
  }
  const away = f.x < other.x ? -1 : 1;
  f.blocking = (input.left && away === -1) || (input.right && away === 1);
  if (f.state === "hit") {
    f.frame += 1;
    if (f.frame > 22) {
      f.state = "idle";
      f.frame = 0;
    }
    return;
  }
  if (f.state === "block") {
    f.frame += 1;
    if (f.frame > 10 || !f.blocking) {
      f.state = "idle";
      f.frame = 0;
    }
  }
  if (f.state === "punch" || f.state === "kick" || f.state === "special") {
    f.frame += 1;
    const spec = ATTACK[f.attack ?? "punch"];
    if (f.frame >= spec.frames) {
      f.state = f.y < GROUND ? "jump" : "idle";
      f.attack = null;
      f.frame = 0;
    }
    return;
  }
  if (input.punch) startAttack(f, "punch");
  else if (input.kick) startAttack(f, "kick");
  else if (input.special && f.meter >= 50) startAttack(f, "special");
  if (busy(f)) return;

  const onGround = f.y >= GROUND;
  if (onGround && input.up) {
    f.vy = -JUMP;
    f.state = "jump";
    f.y = GROUND - 1;
  }
  if (onGround && input.down && !input.up) {
    f.state = "crouch";
    f.vx = 0;
    return;
  }
  let move = 0;
  if (input.left) move -= 1;
  if (input.right) move += 1;
  if (f.y >= GROUND && f.state !== "jump") {
    f.vx = move * WALK;
    f.state = move !== 0 ? "walk" : "idle";
    if (move !== 0) f.facing = move as 1 | -1;
  } else {
    if (onGround && f.state === "jump") f.vx = move * WALK;
    f.vx += move * 1400 * dt;
    f.vx = Math.max(-520, Math.min(520, f.vx));
    f.state = "jump";
    if (move !== 0) f.facing = move as 1 | -1;
  }
}

function integrate(f: Fighter, dt: number) {
  if (f.state === "ko") {
    f.vy = 0;
    f.y = GROUND;
    f.vx *= 0.8;
    f.x += f.vx * dt;
    f.x = Math.max(160, Math.min(W - 160, f.x));
    return;
  }
  f.vy += GRAVITY * dt;
  f.x += f.vx * dt;
  f.y += f.vy * dt;
  if (f.y >= GROUND) {
    f.y = GROUND;
    f.vy = 0;
    if (f.state === "jump") f.state = "idle";
  }
  f.x = Math.max(90, Math.min(W - 90, f.x));
}

export function step(s: FightState, heroIn: FightInput, dt: number) {
  s.shake = Math.max(0, s.shake - dt * 40);
  s.sparks = s.sparks
    .map((p) => ({ ...p, x: p.x + p.vx * dt, y: p.y + p.vy * dt, vy: p.vy + 600 * dt, life: p.life - dt }))
    .filter((p) => p.life > 0);

  if (s.phase === "versus") {
    s.phase = "countdown";
    s.timer = 0.55;
    s.banner = "FIGHT!";
    return;
  }
  if (s.phase === "countdown") {
    s.timer -= dt;
    s.banner = "FIGHT!";
    if (s.timer <= 0) {
      s.phase = "fight";
      s.banner = "";
    }
    return;
  }
  if (s.phase === "ko" || s.phase === "match") {
    s.timer -= dt;
    const [a, b] = s.fighters;
    integrate(a, dt);
    integrate(b, dt);
    if (s.phase === "ko" && s.timer <= 0) {
      if (a.rounds >= 2 || b.rounds >= 2) {
        s.phase = "match";
        s.timer = 99;
        s.banner = a.rounds >= 2 ? `${a.name.toUpperCase()} WINS` : `${b.name.toUpperCase()} WINS`;
        s.winner = a.rounds >= 2 ? 0 : 1;
      } else {
        s.round += 1;
        resetRound(s);
        s.phase = "countdown";
        s.timer = 0.55;
        s.banner = "FIGHT!";
      }
    }
    return;
  }

  const [hero, cpu] = s.fighters;
  const cpuIn = ai(s, cpu, hero, dt);
  controlFighter(hero, heroIn, cpu, dt);
  controlFighter(cpu, cpuIn, hero, dt);
  if (s.phase === "fight") {
    hero.meter = Math.min(100, hero.meter + 8 * dt);
    cpu.meter = Math.min(100, cpu.meter + 6 * dt);
  }
  const canTurn = (f: Fighter) => f.y >= GROUND && f.state !== "jump" && !busy(f);
  if (hero.x < cpu.x) {
    if (canTurn(hero)) hero.facing = 1;
    if (canTurn(cpu)) cpu.facing = -1;
  } else {
    if (canTurn(hero)) hero.facing = -1;
    if (canTurn(cpu)) cpu.facing = 1;
  }

  integrate(hero, dt);
  integrate(cpu, dt);

  for (let i = 0; i < 2; i++) {
    const f = s.fighters[i];
    if (f.attack === "special" && f.frame === ATTACK.special.active[0] && !f.connected) {
      launchSpecial(s, f, i as 0 | 1);
      f.connected = true;
    }
  }

  const airborne = hero.y < GROUND - 80 || cpu.y < GROUND - 80;
  if (!airborne && Math.abs(hero.x - cpu.x) < 120) {
    const mid = (hero.x + cpu.x) / 2;
    if (hero.x <= cpu.x) {
      hero.x = mid - 60;
      cpu.x = mid + 60;
    } else {
      cpu.x = mid - 60;
      hero.x = mid + 60;
    }
    if (hero.x < 90) {
      cpu.x += 90 - hero.x;
      hero.x = 90;
    }
    if (cpu.x < 90) {
      hero.x += 90 - cpu.x;
      cpu.x = 90;
    }
    if (hero.x > W - 90) {
      cpu.x -= hero.x - (W - 90);
      hero.x = W - 90;
    }
    if (cpu.x > W - 90) {
      hero.x -= cpu.x - (W - 90);
      cpu.x = W - 90;
    }
  }

  for (const p of s.projectiles) {
    p.x += p.vx * dt;
    p.life -= dt;
  }
  const nextProj: Projectile[] = [];
  for (const p of s.projectiles) {
    if (p.life <= 0 || p.x < -40 || p.x > W + 40) continue;
    const target = s.fighters[p.from === 0 ? 1 : 0];
    const box = { x: p.x - 22, y: p.y - 16, w: 44, h: 32 };
    if (overlaps(box, hurtbox(target))) {
      applyHit(s, s.fighters[p.from], target, p.kind === "orb" ? 160 : 120, "special");
      sparkBurst(s, p.x, p.y, p.from === 0);
      continue;
    }
    nextProj.push(p);
  }
  s.projectiles = nextProj;

  for (let i = 0; i < 2; i++) {
    const atk = s.fighters[i];
    const def = s.fighters[1 - i];
    const hb = hitbox(atk);
    if (!hb || atk.connected) continue;
    const facingThem = (def.x - atk.x) * atk.facing > 0;
    if (!facingThem) continue;
    if (overlaps(hb, hurtbox(def))) {
      atk.connected = true;
      atk.meter = Math.min(100, atk.meter + 28);
      applyHit(s, atk, def, ATTACK[atk.attack ?? "punch"].dmg);
    }
  }

  s.clock -= dt;
  if (s.clock <= 0) {
    s.clock = 0;
    const [a, b] = s.fighters;
    if (a.hp === b.hp) {
      a.hp = 0;
      b.hp = 0;
    } else if (a.hp > b.hp) b.hp = 0;
    else a.hp = 0;
  }

  const [a, b] = s.fighters;
  if (a.hp <= 0 || b.hp <= 0) {
    if (a.hp <= 0 && b.hp <= 0) {
      a.state = "ko";
      b.state = "ko";
      s.banner = "DOUBLE KO";
    } else if (a.hp <= 0) {
      a.state = "ko";
      b.rounds += 1;
      b.state = "idle";
      s.banner = "KO";
      s.winner = 1;
    } else {
      b.state = "ko";
      a.rounds += 1;
      a.state = "idle";
      s.banner = "KO";
      s.winner = 0;
    }
    s.phase = "ko";
    s.timer = 2.2;
  }
}

export function bodyH(f: Fighter) {
  return f.state === "crouch" ? 270 : 420;
}
