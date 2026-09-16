import assert from "node:assert/strict";
import test from "node:test";
import { setAudioEnabled } from "@/game/audio";
import {
  BOSS_HUES,
  LEVEL_SECS,
  W,
  YOU_HUES,
  beginBoss,
  bossHpFor,
  bossesInLevel,
  clusterCount,
  fireOrb,
  gapFor,
  newFlick,
  stepFlick,
} from "./engine.ts";

setAudioEnabled(false);

const idle = { up: false, down: false, left: false, right: false, fire: false };

test("early levels have one boss, later levels stack them", () => {
  assert.equal(bossesInLevel(1), 1);
  assert.equal(bossesInLevel(4), 1);
  assert.equal(bossesInLevel(5), 2);
  assert.equal(bossesInLevel(8), 3);
  assert.ok(bossHpFor(1, 0) < bossHpFor(3, 0));
  assert.equal(bossHpFor(1, 0), 15);
});

test("player boss beams cycle green purple white", () => {
  const w = newFlick(1);
  beginBoss(w);
  w.banner = 0;
  const hues = [];
  for (let i = 0; i < 6; i++) {
    w.cool = 0;
    fireOrb(w);
    hues.push(w.shots.at(-1)?.hue);
  }
  assert.deepEqual(hues.slice(0, 3), [...YOU_HUES]);
  assert.deepEqual(hues.slice(3, 6), [...YOU_HUES]);
});

test("wave shots stay green", () => {
  const w = newFlick(1);
  w.banner = 0;
  fireOrb(w);
  assert.equal(w.shots[0]?.hue, "green");
  assert.equal(w.shots[0]?.from, "you");
  w.cool = 0;
  fireOrb(w);
  assert.equal(w.shots[1]?.hue, "green");
});

test("end of wave brings a static boss instead of skipping the level", () => {
  const w = newFlick(1);
  w.banner = 0;
  w.clock = LEVEL_SECS;
  stepFlick(w, 0.05, idle);
  assert.equal(w.phase, "boss");
  assert.equal(w.level, 1);
  for (let i = 0; i < 20; i++) stepFlick(w, 0.05, idle);
  assert.equal(w.bosses.length, 1);
  const b = w.bosses[0]!;
  const x0 = b.x - w.cam;
  const cam0 = w.cam;
  stepFlick(w, 0.2, idle);
  assert.ok(Math.abs(w.cam - cam0) < 0.01);
  assert.ok(Math.abs(w.bosses[0]!.x - w.cam - x0) < 2);
  assert.equal(w.bosses[0]!.hp, bossHpFor(1, 0));
});

test("killing the last boss of a level opens the next level", () => {
  const w = newFlick(1);
  beginBoss(w);
  w.banner = 0;
  w.nextBossIn = 0;
  stepFlick(w, 0.3, idle);
  assert.equal(w.bosses.length, 1);
  w.foes = [];
  w.shots = [];
  w.bosses[0]!.hp = 1;
  w.y = w.bosses[0]!.y;
  w.cool = 0;
  fireOrb(w);
  const shot = w.shots.find((s) => s.from === "you")!;
  shot.x = w.bosses[0]!.x - 10;
  shot.y = w.bosses[0]!.y;
  stepFlick(w, 0.05, idle);
  assert.equal(w.bosses.length, 0);
  w.banner = 0;
  w.nextBossIn = 0;
  stepFlick(w, 0.05, idle);
  assert.equal(w.level, 2);
  assert.equal(w.phase, "wave");
});

test("level 5 must beat two bosses in a row", () => {
  const w = newFlick(5);
  beginBoss(w);
  w.banner = 0;
  w.nextBossIn = 0;
  stepFlick(w, 0.3, idle);
  assert.equal(w.bosses.length, 1);
  w.bosses[0]!.hp = 0;
  stepFlick(w, 0.05, idle);
  assert.equal(w.bossQueue, 1);
  w.nextBossIn = 0;
  w.banner = 0;
  stepFlick(w, 0.05, idle);
  assert.equal(w.bosses.length, 1);
  assert.equal(w.level, 5);
  assert.equal(w.phase, "boss");
});

test("boss beams cycle red then yellow", () => {
  const w = newFlick(1);
  beginBoss(w);
  w.banner = 0;
  w.nextBossIn = 0;
  stepFlick(w, 0.3, idle);
  const b = w.bosses[0]!;
  w.shots = [];
  b.fireCool = 0;
  stepFlick(w, 0.05, idle);
  const first = w.shots.filter((s) => s.from === "boss");
  assert.ok(first.length >= 1);
  assert.equal(first[0]!.hue, BOSS_HUES[0]);
  assert.ok(first[0]!.vx < 0);
  w.shots = [];
  b.fireCool = 0;
  stepFlick(w, 0.05, idle);
  const second = w.shots.filter((s) => s.from === "boss");
  assert.ok(second.length >= 1);
  assert.equal(second[0]!.hue, BOSS_HUES[1]);
});

test("level 1 boss does not release minions, later bosses do", () => {
  const easy = newFlick(1);
  beginBoss(easy);
  easy.banner = 0;
  easy.nextBossIn = 0;
  stepFlick(easy, 0.3, idle);
  easy.foes = [];
  easy.bosses[0]!.spawnCool = 0;
  stepFlick(easy, 0.05, idle);
  assert.equal(easy.foes.length, 0);

  const later = newFlick(3);
  beginBoss(later);
  later.banner = 0;
  later.nextBossIn = 0;
  stepFlick(later, 0.3, idle);
  later.foes = [];
  later.bosses[0]!.spawnCool = 0;
  stepFlick(later, 0.05, idle);
  assert.ok(later.foes.some((f) => f.kind === "ship"));
});

test("level 1 is two-thirds as busy, then frequency rises slowly", () => {
  assert.equal(gapFor(1), 240);
  assert.ok(gapFor(2) < gapFor(1));
  assert.ok(gapFor(8) < gapFor(4));
  assert.equal(clusterCount(1), 1);
  assert.equal(clusterCount(5), 1);
  assert.equal(clusterCount(6), 2);
  const l1 = newFlick(1);
  const on1 = l1.foes.filter((f) => f.x > 40 && f.x < W).length;
  assert.ok(on1 >= 1 && on1 <= 3, "L1 opening " + on1);
  const l8 = newFlick(8);
  assert.ok(l8.foes.length > l1.foes.length, "L8 " + l8.foes.length + " vs L1 " + l1.foes.length);
});

test("wave keeps foes waiting ahead of the camera", () => {
  const w = newFlick(1);
  w.banner = 0;
  for (let i = 0; i < 200; i++) stepFlick(w, 0.05, idle);
  assert.equal(w.phase, "wave");
  assert.ok(w.lastX > w.cam + 400, "lastX " + w.lastX + " cam " + w.cam);
  const visible = w.foes.filter((f) => f.x > w.cam && f.x < w.cam + W).length;
  assert.ok(visible >= 1 && visible <= 4, "visible " + visible);
});
