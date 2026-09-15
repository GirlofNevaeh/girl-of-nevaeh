/**
 * Cross-device rooms without WebRTC.
 * BroadcastChannel covers two tabs on one phone; MQTT covers two phones.
 */
import type { MqttClient } from "mqtt";
import type { PeerInfo } from "./p2p";

const BROKERS = ["wss://broker.emqx.io:8084/mqtt", "wss://broker.hivemq.com:8884/mqtt"];

export type WireMsg = { from: string; name: string; body: unknown };

export function topicFor(room: string) {
  return `girlnevaeh/v2/${room.replace(/[^a-zA-Z0-9]/g, "").slice(0, 28)}`;
}

export function encodeWire(from: string, name: string, body: unknown): string {
  return JSON.stringify({ from, name, body });
}

export function decodeWire(raw: unknown): WireMsg | null {
  try {
    let text = "";
    if (typeof raw === "string") text = raw;
    else if (raw instanceof Uint8Array) text = new TextDecoder().decode(raw);
    else if (raw && typeof raw === "object" && "data" in (raw as { data?: unknown })) {
      return decodeWire((raw as { data: unknown }).data);
    } else text = JSON.stringify(raw);
    const m = JSON.parse(text) as Partial<WireMsg>;
    if (!m || typeof m.from !== "string") return null;
    return { from: m.from, name: String(m.name || ""), body: m.body };
  } catch {
    return null;
  }
}

export function presenceName(body: unknown, fallback: string) {
  const b = body as { t?: string; char?: string; name?: string } | null;
  if (b && (b.t === "hello" || b.char || b.name)) return String(b.char || b.name || fallback);
  return "";
}

type BusHandlers = {
  onStatus: (s: string) => void;
  onPeer: (peer: PeerInfo | null) => void;
  onBody: (from: string, body: unknown) => void;
};

export class RoomBus {
  readonly selfId: string;
  readonly room: string;
  readonly name: string;
  private handlers: BusHandlers;
  private topic: string;
  private mqtt: MqttClient | null = null;
  private bc: BroadcastChannel | null = null;
  private queue: string[] = [];
  private dead = false;
  private helloTimer = 0;
  private peer: PeerInfo | null = null;

  constructor(room: string, selfId: string, name: string, handlers: BusHandlers) {
    this.room = room;
    this.selfId = selfId;
    this.name = name;
    this.handlers = handlers;
    this.topic = topicFor(room);
  }

  start() {
    if (typeof window === "undefined") return;
    try {
      this.bc = new BroadcastChannel(`gon-${this.topic}`);
      this.bc.onmessage = (ev) => this.ingest(ev.data, "local");
    } catch {
      this.bc = null;
    }
    this.hello();
    this.helloTimer = window.setInterval(() => this.hello(), this.peer ? 8000 : 2000);
    void this.dial();
    document.addEventListener("visibilitychange", this.onVis);
  }

  send(body: unknown) {
    const wire = encodeWire(this.selfId, this.name, body);
    try {
      this.bc?.postMessage(wire);
    } catch {
      /* ignore */
    }
    if (this.mqtt?.connected) {
      try {
        this.mqtt.publish(this.topic, wire, { qos: 0, retain: false });
      } catch {
        this.queue.push(wire);
      }
    } else {
      this.queue.push(wire);
      if (this.queue.length > 40) this.queue.splice(0, this.queue.length - 40);
    }
  }

  destroy() {
    this.dead = true;
    document.removeEventListener("visibilitychange", this.onVis);
    if (this.helloTimer) window.clearInterval(this.helloTimer);
    try {
      this.send({ t: "bye" });
    } catch {
      /* ignore */
    }
    try {
      this.bc?.close();
    } catch {
      /* ignore */
    }
    this.bc = null;
    try {
      this.mqtt?.end(true);
    } catch {
      /* ignore */
    }
    this.mqtt = null;
  }

  private onVis = () => {
    if (document.visibilityState === "visible") this.hello();
  };

  private hello() {
    this.send({ t: "hello", char: this.name, name: this.name });
  }

  private ingest(raw: unknown, via: "net" | "local") {
    if (this.dead) return;
    const msg = decodeWire(raw);
    if (!msg || msg.from === this.selfId) return;
    const who = presenceName(msg.body, msg.name) || msg.name;
    if (who) {
      this.peer = {
        id: msg.from,
        name: who,
        connectionState: "connected",
        candidateType: via === "local" ? "host" : "relay",
        rttMs: null,
      };
      this.handlers.onPeer(this.peer);
      this.handlers.onStatus("Connected.");
    }
    const t = (msg.body as { t?: string } | null)?.t;
    if (t === "bye") {
      this.peer = null;
      this.handlers.onPeer(null);
      this.handlers.onStatus("Friend left. Waiting…");
      return;
    }
    if (t === "hello") return;
    this.handlers.onBody(msg.from, msg.body);
  }

  private flush() {
    const pending = this.queue.splice(0);
    for (const wire of pending) {
      try {
        this.mqtt?.publish(this.topic, wire, { qos: 0, retain: false });
      } catch {
        this.queue.push(wire);
      }
    }
  }

  private async dial() {
    this.handlers.onStatus("Opening the room.");
    for (const url of BROKERS) {
      if (this.dead) return;
      const ok = await this.tryBroker(url);
      if (ok) return;
    }
    if (!this.dead) this.handlers.onStatus("Room is local-only. Check the network, or try again.");
  }

  private tryBroker(url: string) {
    return new Promise<boolean>((resolve) => {
      let settled = false;
      const finish = (ok: boolean) => {
        if (settled) return;
        settled = true;
        resolve(ok);
      };
      void import("mqtt")
        .then((mod) => {
          if (this.dead) {
            finish(false);
            return;
          }
          const mqtt = mod.default;
          const client = mqtt.connect(url, {
            clientId: `g${this.selfId}`.replace(/[^a-zA-Z0-9]/g, "").slice(0, 22),
            clean: true,
            connectTimeout: 7000,
            reconnectPeriod: 3000,
            keepalive: 30,
            protocolVersion: 4,
          });
          const timer = window.setTimeout(() => {
            try {
              client.end(true);
            } catch {
              /* ignore */
            }
            finish(false);
          }, 8000);
          client.on("connect", () => {
            window.clearTimeout(timer);
            if (this.dead) {
              try {
                client.end(true);
              } catch {
                /* ignore */
              }
              finish(false);
              return;
            }
            this.mqtt = client;
            client.subscribe(this.topic, { qos: 0 }, () => {
              this.flush();
              this.hello();
              this.handlers.onStatus(this.peer ? "Connected." : "Share this code. Waiting for a friend.");
              finish(true);
            });
          });
          client.on("message", (_topic, payload) => this.ingest(payload.toString(), "net"));
          client.on("close", () => {
            if (this.dead || this.mqtt !== client) return;
            this.handlers.onStatus("Link dropped. Reopening…");
          });
          client.on("error", () => {
            if (!settled) {
              window.clearTimeout(timer);
              try {
                client.end(true);
              } catch {
                /* ignore */
              }
              finish(false);
            }
          });
        })
        .catch(() => finish(false));
    });
  }
}
