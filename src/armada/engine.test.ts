import assert from "node:assert/strict";
import test from "node:test";
import { setAudioEnabled } from "@/game/audio";
import { BOSS_HUES, YOU_HUES } from "@/game/beams";
import {
  blank,
  fireYou,
  isBossLevel,
  makeWave,
  stepArmada,
  W,
} from "./engine.ts";

setAudioEnabled(false);

const idle = { left: false, right: false, fire: false };

test("bosses land every five levels only", () => {
  assert.equal(isBossLevel(1), false);
  assert.equal(isBossLevel(4), false);
  assert.equal(isBossLevel(5), true);
  assert.equal(isBossLevel(6), false);
  assert.equal(isBossLevel(10), true);
  assert.equal(isBossLevel(15), true);
});

test("wave spawning on non-boss levels is unchanged", () => {
  assert.equal(makeWave(1).length, 12);
  assert.equal(makeWave(2).length, 18);
  assert.equal(makeWave(3).length, 21);
  assert.equal(makeWave(4).length, 28);
  assert.equal(makeWave(6).length, 28);
  assert.equal(makeWave(1)[0]!.kind, 0);
  assert.equal(makeWave(6).some((e) => e.kind === 0), false);
  const l1 = blank(1, 0, 3);
  assert.equal(l1.phase, "wave");
  assert.equal(l1.enemies.length, 12);
  assert.equal(l1.boss, null);
  const l6 = blank(6, 0, 3);
  assert.equal(l6.phase, "wave");
  assert.equal(l6.enemies.length, 28);
});

test("level 5 is a Sphalerizer-style boss instead of a grid", () => {
  const w = blank(5, 0, 3);
  assert.equal(w.phase, "boss");
  assert.equal(w.enemies.length, 0);
  assert.ok(w.boss);
  assert.equal(w.boss!.who, "zorath");
  assert.ok(w.boss!.hp > 10);
  assert.ok(w.boss!.r > 40);
});

test("player boss beams cycle green purple white", () => {
  const w = blank(5, 0, 3);
  w.banner = 0;
  w.cool = 0;
  const hues: string[] = [];
  for (let i = 0; i < 6; i++) {
    w.cool = 0;
    w.shots = [];
    fireYou(w);
    hues.push(w.shots[0]!.hue);
  }
  assert.deepEqual(hues.slice(0, 3), [...YOU_HUES]);
  assert.deepEqual(hues.slice(3, 6), [...YOU_HUES]);
});

test("wave shots stay green", () => {
  const w = blank(1, 0, 3);
  w.banner = 0;
  fireYou(w);
  assert.equal(w.shots[0]!.hue, "green");
  w.cool = 0;
  fireYou(w);
  assert.equal(w.shots[1]!.hue, "green");
});

test("boss beams cycle red then yellow", () => {
  const w = blank(5, 0, 3);
  w.banner = 0;
  w.boss!.fireCool = 0;
  stepArmada(w, 0.05, idle);
  const first = w.shots.find((s) => s.from === "boss");
  assert.ok(first);
  assert.equal(first!.hue, BOSS_HUES[0]);
  w.boss!.fireCool = 0;
  stepArmada(w, 0.05, idle);
  const second = w.shots.filter((s) => s.from === "boss").at(-1);
  assert.equal(second!.hue, BOSS_HUES[1]);
});

test("killing the boss opens the next wave level", () => {
  const w = blank(5, 100, 3);
  w.banner = 0;
  assert.ok(w.boss);
  w.boss!.hp = 1;
  w.shipX = w.boss.x;
  fireYou(w);
  const shot = w.shots[0]!;
  shot.x = w.boss.x;
  shot.y = w.boss.y;
  shot.vy = 0;
  stepArmada(w, 0.05, idle);
  assert.equal(w.boss, null);
  for (let i = 0; i < 80; i++) stepArmada(w, 0.05, idle);
  assert.equal(w.level, 6);
  assert.equal(w.phase, "wave");
  assert.equal(w.enemies.length, 28);
});

test("later bosses hit harder and can drop minions", () => {
  const l5 = blank(5, 0, 3);
  const l10 = blank(10, 0, 3);
  assert.ok(l10.boss!.hp > l5.boss!.hp);
  l5.banner = 0;
  l5.boss!.spawnCool = 0;
  stepArmada(l5, 0.05, idle);
  assert.equal(l5.enemies.filter((e) => e.minion).length, 0);
  l10.banner = 0;
  l10.boss!.spawnCool = 0;
  stepArmada(l10, 0.05, idle);
  assert.ok(l10.enemies.some((e) => e.minion));
});

test("level 1 ship still strafes left on A", () => {
  const w = blank(1, 0, 3);
  w.banner = 0;
  const x0 = w.shipX;
  stepArmada(w, 0.2, { left: true, right: false, fire: false });
  assert.ok(w.shipX < x0);
  assert.ok(w.shipX > 0 && w.shipX < W);
});
