import assert from "node:assert/strict";
import test from "node:test";
import {
  hotAdvance,
  hotStart,
  hotWho,
  isHandoff,
  lockDigits,
  numberFromSlots,
  pad,
  RANGE,
  validSecret,
} from "./engine.ts";

test("pad is two digits", () => {
  assert.equal(pad(7), "07");
  assert.equal(pad(99), "99");
});

test("hard accepts 1-99 only", () => {
  assert.equal(validSecret(1, "hard"), true);
  assert.equal(validSecret(99, "hard"), true);
  assert.equal(validSecret(100, "hard"), false);
  assert.equal(validSecret(0, "easy"), false);
  assert.equal(validSecret(21, "easy"), false);
});

test("lockDigits keeps correct places", () => {
  const lock = lockDigits(42, 12, [false, false]);
  assert.deepEqual(lock, [false, true]);
  assert.equal(RANGE.hard, 99);
  assert.deepEqual(lockDigits(5, 5, [false, false]), [true, true]);
});

test("numberFromSlots always needs two digits", () => {
  assert.equal(numberFromSlots([7, null]), null);
  assert.equal(numberFromSlots([0, 5]), 5);
  assert.equal(numberFromSlots([4, 2]), 42);
  assert.equal(numberFromSlots([0, 0]), 0);
  assert.equal(numberFromSlots([null, 9]), null);
  assert.equal(numberFromSlots([null, null]), null);
});

test("pass and play walks handoff then pick then guess", () => {
  let p = hotStart();
  assert.equal(p, "handA");
  assert.equal(isHandoff(p), true);
  p = hotAdvance(p);
  assert.equal(p, "setA");
  assert.equal(hotWho(p), "a");
  p = hotAdvance(p);
  assert.equal(p, "handB");
  p = hotAdvance(p);
  assert.equal(p, "setB");
  assert.equal(hotWho(p), "b");
  p = hotAdvance(p);
  assert.equal(p, "guessB");
  p = hotAdvance(p);
  assert.equal(p, "handA2");
  p = hotAdvance(p);
  assert.equal(p, "guessA");
  p = hotAdvance(p);
  assert.equal(p, "end");
});
