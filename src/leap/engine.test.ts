import assert from "node:assert/strict";
import test from "node:test";
import {
  beginBoss,
  bossHpFor,
  bossKind,
  bossSpecialsFor,
  newLeap,
  stepLeap,
  type LeapKeys,
} from "./engine.ts";

const idle: LeapKeys = {
  left: false,
  right: false,
  up: false,
  down: false,
  punch: false,
  kick: false,
  special: false,
};

function startBossAt(level: number) {
  const w = newLeap(level);
  w.phase = "intro";
  w.lock = 0;
  w.cam = 0;
  beginBoss(w);
  return w;
}

test("level 1 boss is a light first fight", () => {
  assert.equal(bossKind(1), "karen");
  assert.equal(bossHpFor(1), 38);
  assert.equal(bossSpecialsFor(1), 0);
  const w = startBossAt(1);
  const boss = w.foes.find((f) => f.boss);
  assert.ok(boss);
  assert.equal(boss?.hp, 38);
  assert.equal(w.bossSpecials, 0);
});

test("later bosses grow slowly in health and specials", () => {
  assert.ok(bossHpFor(1) < bossHpFor(3));
  assert.ok(bossHpFor(3) < bossHpFor(8));
  assert.equal(bossSpecialsFor(2), 1);
  assert.equal(bossSpecialsFor(5), 2);
  assert.equal(bossSpecialsFor(8), 3);
  assert.ok(bossHpFor(8) < 120);
});

test("kicking the level 1 boss wins a round before the hero falls", () => {
  const w = startBossAt(1);
  let t = 0;
  while (t < 12 && w.phase === "boss") {
    const boss = w.foes.find((f) => f.boss && f.dead <= 0);
    const keys: LeapKeys = { ...idle };
    if (boss) {
      keys.right = w.x < boss.x - 90;
      keys.left = w.x > boss.x + 90;
    }
    if (Math.floor(t * 60) % 20 === 0) keys.kick = true;
    stepLeap(w, 1 / 60, keys);
    t += 1 / 60;
  }
  assert.equal(w.youRounds, 1);
  assert.equal(w.bossRounds, 0);
  assert.ok(w.hp > 0);
});

test("street waves still spawn on level 1", () => {
  const w = newLeap(1);
  for (let i = 0; i < 240; i++) stepLeap(w, 1 / 60, idle);
  const live = w.foes.filter((f) => f.dead <= 0 && !f.boss);
  assert.ok(live.length >= 1);
  assert.equal(w.phase, "street");
  assert.ok(live.every((f) => !f.boss));
});
