import assert from "node:assert/strict";
import test from "node:test";
import mqtt from "mqtt";
import { decodeWire, encodeWire, presenceName, topicFor } from "./bus.ts";

test("topic stays short and alphanumeric", () => {
  assert.equal(topicFor("chAB12"), "girlnevaeh/v2/chAB12");
  assert.match(topicFor("ng!!zz"), /^girlnevaeh\/v2\//);
});

test("wire roundtrip keeps fighter id", () => {
  const raw = encodeWire("p-abc", "lena", { t: "hello", char: "lena" });
  const msg = decodeWire(raw);
  assert.ok(msg);
  assert.equal(msg.from, "p-abc");
  assert.equal(presenceName(msg.body, msg.name), "lena");
});

test("decode ignores junk", () => {
  assert.equal(decodeWire("not-json"), null);
  assert.equal(decodeWire("{}"), null);
});

test("two MQTT seats exchange a chess move", async () => {
  const topic = topicFor("chtest" + Math.random().toString(36).slice(2, 6));
  const url = "wss://broker.emqx.io:8084/mqtt";
  const a = mqtt.connect(url, { clientId: "gona" + Math.random().toString(36).slice(2, 6), reconnectPeriod: 0, connectTimeout: 7000 });
  const b = mqtt.connect(url, { clientId: "gonb" + Math.random().toString(36).slice(2, 6), reconnectPeriod: 0, connectTimeout: 7000 });
  const got = new Promise<string>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("no move")), 8000);
    b.on("message", (_topic, payload) => {
      const msg = decodeWire(payload.toString());
      if (msg && (msg.body as { t?: string }).t === "move") {
        clearTimeout(t);
        resolve((msg.body as { from: string }).from);
      }
    });
  });
  await Promise.all([
    new Promise<void>((res, rej) => {
      a.on("connect", () => res());
      a.on("error", rej);
    }),
    new Promise<void>((res, rej) => {
      b.on("connect", () => res());
      b.on("error", rej);
    }),
  ]);
  await new Promise<void>((res, rej) => b.subscribe(topic, { qos: 0 }, (err) => (err ? rej(err) : res())));
  a.publish(topic, encodeWire("p1", "nancy", { t: "move", from: "e2", to: "e4" }));
  const from = await got;
  assert.equal(from, "e2");
  a.end(true);
  b.end(true);
});
