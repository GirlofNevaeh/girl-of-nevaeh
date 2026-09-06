import type { AmbientId } from "./types";

let enabled = true;
let unlocked = false;
let ambientTimer: number | null = null;
let currentAmbient: AmbientId | null = null;
let wanted: AmbientId | null = null;
let ctx: AudioContext | null = null;
const urls = new Map<string, string>();
const voices = new Map<string, HTMLAudioElement>();
let hold: HTMLAudioElement | null = null;

function encodeWav(pcm: Int16Array) {
  const bytes = pcm.length * 2;
  const buf = new ArrayBuffer(44 + bytes);
  const v = new DataView(buf);
  const s = (o: number, t: string) => {
    for (let i = 0; i < t.length; i++) v.setUint8(o + i, t.charCodeAt(i));
  };
  s(0, "RIFF");
  v.setUint32(4, 36 + bytes, true);
  s(8, "WAVE");
  s(12, "fmt ");
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, 22050, true);
  v.setUint32(28, 44100, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  s(36, "data");
  v.setUint32(40, bytes, true);
  new Uint8Array(buf, 44).set(new Uint8Array(pcm.buffer));
  let bin = "";
  const u8 = new Uint8Array(buf);
  for (let i = 0; i < u8.length; i++) bin += String.fromCharCode(u8[i]!);
  return "data:audio/wav;base64," + btoa(bin);
}

function toneWav(freq: number, dur = 0.12, vol = 0.4) {
  const key = `t:${freq}:${dur}`;
  const hit = urls.get(key);
  if (hit) return hit;
  const sr = 22050;
  const n = Math.max(32, Math.floor(sr * dur));
  const pcm = new Int16Array(n);
  for (let i = 0; i < n; i++) {
    const env = Math.sin((Math.PI * i) / n);
    pcm[i] = Math.sin((2 * Math.PI * freq * i) / sr) * env * vol * 30000;
  }
  const url = encodeWav(pcm);
  urls.set(key, url);
  return url;
}

function sweepWav(from: number, to: number, dur: number, vol: number, key: string) {
  const hit = urls.get(key);
  if (hit) return hit;
  const sr = 22050;
  const n = Math.max(32, Math.floor(sr * dur));
  const pcm = new Int16Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const env = t < 0.08 ? t / 0.08 : Math.pow(1 - t, 1.4);
    const freq = from + (to - from) * t;
    pcm[i] = Math.sin((2 * Math.PI * freq * i) / sr) * env * vol * 30000;
  }
  const url = encodeWav(pcm);
  urls.set(key, url);
  return url;
}

function boomWav(dur: number, vol: number, key: string) {
  const hit = urls.get(key);
  if (hit) return hit;
  const sr = 22050;
  const n = Math.max(32, Math.floor(sr * dur));
  const pcm = new Int16Array(n);
  let last = 0;
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const env = Math.pow(1 - t, 2.2);
    last = last * 0.72 + (Math.random() * 2 - 1) * 0.28;
    const thud = Math.sin((2 * Math.PI * 70 * i) / sr) * (1 - t);
    pcm[i] = (last * 0.7 + thud * 0.5) * env * vol * 30000;
  }
  const url = encodeWav(pcm);
  urls.set(key, url);
  return url;
}

function noiseWav(dur: number, vol: number, key: string) {
  const hit = urls.get(key);
  if (hit) return hit;
  const sr = 22050;
  const n = Math.max(32, Math.floor(sr * dur));
  const pcm = new Int16Array(n);
  let last = 0;
  for (let i = 0; i < n; i++) {
    const env = Math.pow(1 - i / n, 1.6);
    last = last * 0.6 + (Math.random() * 2 - 1) * 0.4;
    pcm[i] = last * env * vol * 30000;
  }
  const url = encodeWav(pcm);
  urls.set(key, url);
  return url;
}

function playUrl(key: string, url: string, vol: number) {
  if (!enabled || !unlocked) return;
  let a = voices.get(key);
  if (!a) {
    a = new Audio(url);
    voices.set(key, a);
  }
  a.volume = Math.min(1, vol);
  try {
    a.currentTime = 0;
  } catch {
    /* ignore */
  }
  void a.play().catch(() => {});
}

function ping(freq: number, vol = 0.55) {
  playUrl("t" + freq, toneWav(freq), vol);
}

function bootCtx() {
  if (ctx) return ctx;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  ctx = new AC();
  return ctx;
}

export function unlockAudio() {
  unlocked = true;
  if (!hold) {
    hold = new Audio(toneWav(40, 0.2, 0.0004));
    hold.loop = true;
    hold.volume = 0.001;
    void hold.play().catch(() => {});
  }
  const c = bootCtx();
  if (c.state === "suspended") void c.resume();
  if (wanted && wanted !== "title") startBed(wanted);
}

export function resumeIfNeeded() {
  if (hold && enabled) void hold.play().catch(() => {});
  if (ctx && ctx.state === "suspended") void ctx.resume();
}

export function setAudioEnabled(on: boolean) {
  enabled = on;
  if (hold) hold.muted = !on;
  if (!on) stopAll();
  else if (unlocked && wanted && wanted !== "title") startBed(wanted);
}

function stopAll() {
  stopBed();
  voices.forEach((a) => {
    try {
      a.pause();
      a.currentTime = 0;
    } catch {
      /* ignore */
    }
  });
  try {
    window.speechSynthesis?.cancel();
  } catch {
    /* ignore */
  }
}

function stopBed() {
  if (ambientTimer != null) {
    window.clearInterval(ambientTimer);
    ambientTimer = null;
  }
  currentAmbient = null;
}

function startBed(id: AmbientId) {
  if (!enabled || !unlocked || id === "title") {
    stopBed();
    return;
  }
  if (id !== "duel" && id !== "armada" && id !== "flick" && id !== "leap") {
    stopBed();
    return;
  }
  if (currentAmbient === id && ambientTimer != null) return;
  stopBed();
  currentAmbient = id;
  const songs: Record<string, number[]> = {
    duel: [392, 494, 392, 330, 294],
    armada: [330, 392, 440, 330, 262],
    flick: [294, 349, 466, 349, 247],
    leap: [196, 247, 294, 330, 392, 330, 294, 247],
  };
  const notes = songs[id];
  let i = 0;
  const tick = () => {
    if (!enabled || currentAmbient !== id) return;
    ping(notes[i % notes.length]!, 0.18);
    i += 1;
  };
  tick();
  ambientTimer = window.setInterval(tick, 520);
}

export function setAmbient(id: AmbientId) {
  wanted = id;
  if (id === "title") {
    stopAll();
    return;
  }
  if (unlocked) startBed(id);
}

export function hushMusic() {
  wanted = "title";
  stopBed();
}

function fightWav(kind: "punch" | "kick" | "special" | "ko") {
  const key = "fight:" + kind;
  const hit = urls.get(key);
  if (hit) return hit;
  const sr = 22050;
  const dur = kind === "ko" ? 0.32 : kind === "kick" ? 0.18 : kind === "special" ? 0.22 : 0.12;
  const n = Math.max(64, Math.floor(sr * dur));
  const pcm = new Int16Array(n);
  let n1 = 0;
  let n2 = 0;
  for (let i = 0; i < n; i++) {
    const t = i / n;
    n1 = n1 * 0.55 + (Math.random() * 2 - 1) * 0.45;
    n2 = n2 * 0.85 + (Math.random() * 2 - 1) * 0.15;
    let sample = 0;
    if (kind === "punch") {
      const slap = n1 * Math.pow(1 - t, 8) * (t < 0.12 ? 1 : 0.15);
      const body = Math.sin((2 * Math.PI * 95 * i) / sr) * Math.pow(1 - t, 4);
      const click = Math.sin((2 * Math.PI * 1800 * i) / sr) * Math.pow(1 - t, 18) * 0.25;
      sample = slap * 0.7 + body * 0.55 + click;
    } else if (kind === "kick") {
      const boot = n2 * Math.pow(1 - t, 3);
      const body = Math.sin((2 * Math.PI * 62 * i) / sr) * Math.pow(1 - t, 2.4);
      const snap = n1 * Math.pow(1 - t, 10) * 0.45;
      sample = boot * 0.45 + body * 0.7 + snap;
    } else if (kind === "special") {
      const freq = 420 + t * 980;
      const beam = Math.sin((2 * Math.PI * freq * i) / sr) * Math.pow(1 - t, 1.4);
      const crack = n1 * Math.pow(1 - t, 6) * 0.35;
      sample = beam * 0.7 + crack;
    } else {
      const boom = Math.sin((2 * Math.PI * 48 * i) / sr) * Math.pow(1 - t, 1.8);
      const crash = n2 * Math.pow(1 - t, 2.2);
      const slap = n1 * Math.pow(1 - t, 9) * 0.4;
      sample = boom * 0.7 + crash * 0.55 + slap;
    }
    pcm[i] = Math.max(-32767, Math.min(32767, sample * 28000));
  }
  const url = encodeWav(pcm);
  urls.set(key, url);
  return url;
}

function hit(freq: number, vol = 0.7) {
  if (!enabled) return;
  if (!unlocked) unlockAudio();
  ping(freq, vol);
}

export function playClick() {
  hit(880, 0.5);
}
function beep(from: number, to: number, dur: number, vol: number) {
  if (!enabled) return;
  unlockAudio();
  const c = bootCtx();
  void c.resume();
  const now = c.currentTime;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "triangle";
  o.frequency.setValueAtTime(from, now);
  o.frequency.exponentialRampToValueAtTime(Math.max(40, to), now + dur);
  g.gain.setValueAtTime(vol, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + dur);
  o.connect(g);
  g.connect(c.destination);
  o.start(now);
  o.stop(now + dur + 0.02);
}

export function playQuizPick() {
  beep(720, 640, 0.07, 0.18);
}
export function playQuizYes() {
  beep(523, 880, 0.28, 0.22);
}
export function playQuizNo() {
  beep(260, 90, 0.26, 0.22);
}
export function playPage() {}
export function playChime() {
  hit(988, 0.65);
}
export function playRefuse() {
  hit(196, 0.55);
}
export function playOrb() {
  hit(980, 0.6);
}
export function playHeal() {
  hit(523, 0.55);
}
export function playHit() {
  playPunch();
}
export function playPunch() {
  if (!enabled) return;
  if (!unlocked) unlockAudio();
  playUrl("punch", fightWav("punch"), 1);
}
export function playKick() {
  if (!enabled) return;
  if (!unlocked) unlockAudio();
  playUrl("kick", fightWav("kick"), 1);
}
export function playSpecial() {
  if (!enabled) return;
  if (!unlocked) unlockAudio();
  playUrl("special", fightWav("special"), 0.95);
}
export function playJump() {
  beep(320, 720, 0.16, 0.2);
}
export function playDie() {
  playKo();
}
export function playKo() {
  if (!enabled) return;
  if (!unlocked) unlockAudio();
  playUrl("ko", fightWav("ko"), 1);
}
export function playTurn() {
  hit(620, 0.5);
}
export function playDrop() {
  hit(220, 0.5);
}
export function playLaser() {
  if (!enabled) return;
  if (!unlocked) unlockAudio();
  playUrl("blaster", blasterWav(), 0.9);
}
export function playBlast() {
  if (!enabled) return;
  if (!unlocked) unlockAudio();
  playUrl("blast", boomWav(0.16, 0.9, "blast-sm"), 0.95);
}

function blasterWav() {
  const key = "blaster";
  const hit = urls.get(key);
  if (hit) return hit;
  const sr = 22050;
  const n = Math.floor(sr * 0.14);
  const pcm = new Int16Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const env = t < 0.06 ? t / 0.06 : Math.pow(1 - t, 1.8);
    const freq = 980 * Math.exp(-t * 7.5) + 140;
    phase += (2 * Math.PI * freq) / sr;
    const raw = Math.sin(phase);
    const square = raw > 0 ? 1 : -1;
    const click = (Math.random() * 2 - 1) * Math.pow(1 - t, 12) * 0.35;
    pcm[i] = Math.max(-32767, Math.min(32767, (square * 0.45 + raw * 0.25 + click) * env * 28000));
  }
  const url = encodeWav(pcm);
  urls.set(key, url);
  return url;
}
export function playFightCall() {
  if (!enabled) return;
  unlockAudio();
  hushMusic();
  try {
    const talk = window.speechSynthesis;
    if (!talk) return;
    talk.cancel();
    const pickVoice = () => {
      const list = talk.getVoices();
      const rank = (v: SpeechSynthesisVoice) => {
        const n = `${v.name} ${v.lang}`.toLowerCase();
        if (/daniel|fred|ralph|arthur|rishi|aaron|reed|albert/.test(n)) return 3;
        if (/male/.test(n) && /en/.test(n)) return 2;
        if (/en[-_]us/.test(n)) return 1;
        return 0;
      };
      return [...list].sort((a, b) => rank(b) - rank(a))[0] || null;
    };
    const speak = () => {
      const u = new SpeechSynthesisUtterance("Fight!");
      const voice = pickVoice();
      if (voice) u.voice = voice;
      u.lang = voice?.lang || "en-US";
      u.rate = 0.78;
      u.pitch = 0.32;
      u.volume = 1;
      talk.speak(u);
    };
    if (talk.getVoices().length) speak();
    else talk.addEventListener("voiceschanged", speak, { once: true });
  } catch {
    /* ignore */
  }
}
