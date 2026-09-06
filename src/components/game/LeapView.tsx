import { Button } from "@/components/ui/button";
import { FIGHTERS, type FightFighterId } from "@/fight/engine";
import { STAGES, preloadStages, stageImage } from "@/fight/stages";
import { CHARACTERS } from "@/game/characters";
import { playPortrait } from "@/game/play-art";
import {
  playClick,
  playHeal,
  playHit,
  playKick,
  playKo,
  playOrb,
  playPunch,
  playSpecial,
  setAmbient,
  unlockAudio,
} from "@/game/audio";
import { useGame } from "@/game/store";
import type { CharacterId } from "@/game/types";
import { H, LEVEL_SECS, MAX_PLAYERS, W, newLeap, stepLeap, type LeapKeys, type LeapWorld } from "@/leap/engine";
import { drawLevelCall, drawLoseCall } from "@/game/neon-banner";
import { useP2PRoom } from "@/lib/multiplayer/use-p2p-room";
import { useEffect, useRef, useState } from "react";
import { NeonAct, NeonArrow, PadDock } from "./NeonPads";
import { RosterPick } from "./RosterPick";
import { Hearts } from "./Hearts";
import { SoundToggle } from "@/components/ui/sound-toggle";
import { lockCanvasBox, SHELL } from "@/game/pin-frame";

const HI_KEY = "nevaeh-civil-hi";

const DONOR: Partial<Record<CharacterId, FightFighterId>> = {
  sarah: "veronika",
  mira: "veronika",
  sananda: "adamus",
  lena: "olivia",
  eliav: "harlan",
  nadav: "milo",
};

function bodySrc(who: CharacterId) {
  const id = (who in FIGHTERS ? who : (DONOR[who] ?? "nancy")) as FightFighterId;
  return FIGHTERS[id].body;
}

type Ghost = { id: string; name: string; x: number; y: number; face: 1 | -1 };

export function LeapView() {
  const [who, setWho] = useState<CharacterId | null>(null);
  const [code, setCode] = useState("");
  const [room, setRoom] = useState<string | null>(null);
  if (!who) {
    return (
      <RosterPick
        title="Civil War"
        blurb="Streets of the eight Warrior Battle locations. Jab, kick, pick up street weapons. Hearts power you up. Three lives. Sixty seconds a level. Up to four online."
        onPick={setWho}
      />
    );
  }
  if (!room) {
    return (
      <Lobby
        who={who}
        code={code}
        setCode={setCode}
        onSolo={() => setRoom("solo")}
        onJoin={() => {
          const clean = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
          if (clean.length >= 3) setRoom(`civil-${clean}`);
        }}
        onHost={() => {
          const made = Math.random().toString(36).slice(2, 6).toUpperCase();
          setCode(made);
          setRoom(`civil-${made}`);
        }}
      />
    );
  }
  return <CivilPlay who={who} room={room} code={code} onLobby={() => setRoom(null)} />;
}

function Lobby({
  who,
  code,
  setCode,
  onSolo,
  onJoin,
  onHost,
}: {
  who: CharacterId;
  code: string;
  setCode: (v: string) => void;
  onSolo: () => void;
  onJoin: () => void;
  onHost: () => void;
}) {
  const name = CHARACTERS.find((c) => c.id === who)?.name ?? who;
  return (
    <div className="flex min-h-0 flex-col overflow-hidden bg-ink text-parchment" style={SHELL}>
      <header className="flex h-14 shrink-0 items-center gap-3 px-4">
        <Button variant="quiet" onClick={() => useGame.getState().backToTitle()}>
          Main Menu
        </Button>
        <h1 className="font-display text-2xl">Civil War</h1>
      </header>
      <div className="flex flex-col gap-3 px-4">
        <p className="text-sm text-silver">
          {name} hits the street. Solo or share a room code — max {MAX_PLAYERS}.
        </p>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="ROOM"
          maxLength={6}
          className="h-12 rounded-[12px] border border-[#3cf0ff]/40 bg-[#0b0b12] px-3 font-display tracking-[0.3em] text-[#3cf0ff]"
        />
        <div className="grid grid-cols-2 gap-2">
          <Button variant="pink" onClick={onHost}>
            Host Room
          </Button>
          <Button variant="blue" onClick={onJoin}>
            Join Room
          </Button>
        </div>
        <Button variant="ghost" onClick={onSolo}>
          Play Solo
        </Button>
      </div>
    </div>
  );
}

const EMPTY: LeapKeys = {
  left: false,
  right: false,
  up: false,
  down: false,
  punch: false,
  kick: false,
  special: false,
};

function CivilPlay({
  who,
  room,
  code,
  onLobby,
}: {
  who: CharacterId;
  room: string;
  code: string;
  onLobby: () => void;
}) {
  const online = room !== "solo";
  const name = CHARACTERS.find((c) => c.id === who)?.name ?? who;
  const p2p = useP2PRoom({ room: online ? room : `solo-${Math.random().toString(36).slice(2, 6)}`, name });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bodyRef = useRef<HTMLImageElement | null>(null);
  const world = useRef<LeapWorld>(newLeap());
  const keys = useRef<LeapKeys>({ ...EMPTY });
  const edges = useRef({ punch: false, kick: false, special: false });
  const ghosts = useRef<Ghost[]>([]);
  const [hud, setHud] = useState({ lives: 3, score: 0, level: 1, t: LEVEL_SECS, over: false, weapon: "" });
  const [ready, setReady] = useState(false);
  const [hi, setHi] = useState(() => Number(localStorage.getItem(HI_KEY) || 0));
  const stage = useState(() => lockCanvasBox(W, H, 248, "civil"))[0];

  useEffect(() => {
    preloadStages();
  }, []);

  useEffect(() => {
    setReady(false);
    const img = new Image();
    const done = () => {
      bodyRef.current = img;
      setReady(true);
    };
    img.onload = done;
    img.onerror = () => {
      const face = new Image();
      face.onload = () => {
        bodyRef.current = face;
        setReady(true);
      };
      face.src = playPortrait(who);
    };
    img.src = bodySrc(who);
    if (img.complete && img.naturalWidth) done();
  }, [who]);

  const p2pRef = useRef(p2p);
  p2pRef.current = p2p;

  useEffect(() => {
    return p2pRef.current.onMessage((_from, data) => {
      const msg = data as { t?: string; id?: string; name?: string; x?: number; y?: number; face?: 1 | -1 };
      if (msg.t !== "pos" || !msg.id) return;
      const list = ghosts.current.filter((g) => g.id !== msg.id);
      list.push({ id: msg.id, name: msg.name ?? "Ally", x: msg.x ?? 0, y: msg.y ?? 0, face: msg.face ?? 1 });
      ghosts.current = list.slice(-3);
    });
  }, []);

  useEffect(() => {
    if (!ready) return;
    world.current = newLeap();
    unlockAudio();
    setAmbient("leap");
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let last = performance.now();
    let pulse = 0;
    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const w = world.current;
      const k: LeapKeys = {
        ...keys.current,
        punch: keys.current.punch || edges.current.punch,
        kick: keys.current.kick || edges.current.kick,
        special: keys.current.special || edges.current.special,
      };
      edges.current = { punch: false, kick: false, special: false };
      const events = stepLeap(w, dt, k);
      for (const ev of events) {
        if (ev === "punch") playPunch();
        if (ev === "kick") playKick();
        if (ev === "special") playSpecial();
        if (ev === "hit") playHit();
        if (ev === "life") playHeal();
        if (ev === "die") playKo();
        if (ev === "clear" || ev === "grab") playOrb();
      }
      if (w.over) {
        const best = Math.max(w.score, Number(localStorage.getItem(HI_KEY) || 0));
        localStorage.setItem(HI_KEY, String(best));
        setHi(best);
      }
      pulse += dt;
      if (online && pulse > 0.08) {
        pulse = 0;
        const net = p2pRef.current;
        net.broadcast({ t: "pos", id: net.selfId, name, x: w.x, y: w.y, face: w.face });
      }
      drawCivil(ctx, w, bodyRef.current, ghosts.current);
      setHud({
        lives: w.lives,
        score: w.score,
        level: w.level,
        t: Math.ceil(w.t),
        over: w.over,
        weapon: w.weapon ?? "",
      });
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    const down = (e: KeyboardEvent) => {
      if (e.code === "ArrowLeft" || e.code === "KeyA") keys.current.left = true;
      if (e.code === "ArrowRight" || e.code === "KeyD") keys.current.right = true;
      if (e.code === "ArrowUp" || e.code === "KeyW") keys.current.up = true;
      if (e.code === "ArrowDown" || e.code === "KeyS") keys.current.down = true;
      if (e.code === "KeyJ" || e.code === "KeyZ") edges.current.punch = true;
      if (e.code === "KeyK" || e.code === "KeyX") edges.current.kick = true;
      if (e.code === "KeyL" || e.code === "KeyC" || e.code === "Space") {
        e.preventDefault();
        edges.current.special = true;
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === "ArrowLeft" || e.code === "KeyA") keys.current.left = false;
      if (e.code === "ArrowRight" || e.code === "KeyD") keys.current.right = false;
      if (e.code === "ArrowUp" || e.code === "KeyW") keys.current.up = false;
      if (e.code === "ArrowDown" || e.code === "KeyS") keys.current.down = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [ready, online, name]);

  const hold = (key: keyof LeapKeys, on: boolean) => {
    keys.current[key] = on;
  };

  return (
    <div className="flex flex-col overflow-hidden bg-ink text-parchment" style={{ ...SHELL, touchAction: "none" }}>
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 px-4">
        <div className="min-w-0">
          <p className="truncate font-display text-base leading-tight">{name}</p>
          <Button variant="quiet" className="h-auto px-0 py-0 text-xs" onClick={() => useGame.getState().backToTitle()}>
            Main Menu
          </Button>
        </div>
        <SoundToggle />
        <div className="min-w-0 text-right">
          <Hearts lives={hud.lives} />
          <p className="truncate text-sm text-silver">
            {hud.score} · L{hud.level} · {hud.t}s · best {hi}
          </p>
        </div>
      </header>
      <div className="flex shrink-0 justify-center" style={{ height: stage.h }}>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="touch-none rounded-[16px] border border-[#3cf0ff]/40"
          style={{ width: stage.w, height: stage.h }}
        />
      </div>
      {online ? (
        <p className="h-5 shrink-0 text-center font-display text-[10px] tracking-[0.3em] text-[#3cf0ff]">
          {code || room.replace("civil-", "")} · {Math.min(MAX_PLAYERS, 1 + p2p.peers.length)}/{MAX_PLAYERS}
        </p>
      ) : null}
      <div className="flex h-36 shrink-0 items-end justify-center px-2 pb-2">
        {hud.over ? (
          <div className="flex gap-2">
            <Button
              variant="pink"
              onClick={() => {
                playClick();
                world.current = newLeap();
                setHud({ lives: 3, score: 0, level: 1, t: LEVEL_SECS, over: false, weapon: "" });
              }}
            >
              Fight again
            </Button>
            <Button variant="ghost" onClick={onLobby}>
              Lobby
            </Button>
          </div>
        ) : (
          <PadDock className="flex w-full max-w-[420px] items-end justify-between gap-3 p-2">
            <div className="grid shrink-0 grid-cols-3 place-items-center gap-1">
              <span className="size-12" />
              <NeonArrow dir="up" tone="blue" onDown={() => hold("up", true)} onUp={() => hold("up", false)} />
              <span className="size-12" />
              <NeonArrow dir="left" tone="pink" onDown={() => hold("left", true)} onUp={() => hold("left", false)} />
              <NeonArrow dir="down" tone="blue" onDown={() => hold("down", true)} onUp={() => hold("down", false)} />
              <NeonArrow dir="right" tone="pink" onDown={() => hold("right", true)} onUp={() => hold("right", false)} />
            </div>
            <div className="flex shrink-0 flex-col items-center gap-1.5">
              <NeonAct
                label="Special"
                kind="blue"
                mark="S"
                onDown={() => {
                  edges.current.special = true;
                }}
              />
              <div className="flex items-center gap-2">
                <NeonAct label="Jab" kind="blue" onDown={() => { edges.current.punch = true; }} />
                <NeonAct label="Kick" kind="pink" onDown={() => { edges.current.kick = true; }} />
              </div>
            </div>
          </PadDock>
        )}
      </div>
    </div>
  );
}

function drawCivil(ctx: CanvasRenderingContext2D, w: LeapWorld, body: HTMLImageElement | null, ghosts: Ghost[]) {
  const stage = STAGES[(Math.max(1, w.level) - 1) % STAGES.length]!;
  const art = stageImage(stage.id);
  if (art && art.complete && art.naturalWidth) {
    const shift = (w.cam * 0.35) % W;
    ctx.drawImage(art, -shift, 0, W, H);
    ctx.drawImage(art, W - shift, 0, W, H);
  } else {
    ctx.fillStyle = "#120814";
    ctx.fillRect(0, 0, W, H);
  }
  ctx.fillStyle = "rgba(8,6,12,0.28)";
  ctx.fillRect(0, 0, W, H);

  const streetY = H - 48;
  ctx.fillStyle = "#1a1614";
  ctx.fillRect(0, streetY, W, H - streetY);
  ctx.fillStyle = "#ff2bd6";
  for (let x = -((w.cam * 1.2) % 48); x < W; x += 48) ctx.fillRect(x, streetY + 18, 22, 3);
  ctx.fillStyle = "#12d8ff";
  ctx.fillRect(0, streetY, W, 3);

  const sx = (wx: number) => wx - w.cam;

  for (const p of w.loot) {
    if (p.taken) continue;
    const x = sx(p.x);
    if (x < -20 || x > W + 20) continue;
    if (p.kind === "heart") {
      ctx.font = "20px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("❤️", x, p.y);
    } else {
      ctx.fillStyle = p.kind === "pipe" ? "#8a9aa8" : p.kind === "bat" ? "#8b5a2b" : "#39ff14";
      ctx.fillRect(x - 10, p.y - 4, 22, 6);
      ctx.fillStyle = "#f5f5f0";
      ctx.font = "9px Audiowide, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(p.kind, x, p.y - 8);
    }
  }

  for (const f of w.foes) {
    const x = sx(f.x);
    if (x < -40 || x > W + 40) continue;
    ctx.save();
    ctx.globalAlpha = f.dead > 0 ? Math.max(0, 1 - f.dead * 1.6) : 1;
    ctx.translate(x, f.y);
    ctx.scale(f.face, 1);
    ctx.fillStyle = f.hit > 0 ? "#fff" : f.kind === "girl" ? "#ff2bd6" : "#3a1020";
    ctx.fillRect(-12, -30, 24, 34);
    ctx.fillStyle = f.kind === "girl" ? "#12d8ff" : "#c4281c";
    ctx.fillRect(-10, -44, 20, 16);
    ctx.fillStyle = "#f5f5f0";
    ctx.font = "8px Audiowide, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(f.kind === "girl" ? "BAD GIRL" : "BAD GUY", 0, 12);
    ctx.restore();
  }

  for (const g of ghosts) {
    const x = sx(g.x);
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = "#12d8ff";
    ctx.fillRect(x - 10, g.y - 28, 20, 30);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#3cf0ff";
    ctx.font = "10px Audiowide, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(g.name, x, g.y - 34);
  }

  const flash = w.invuln > 0 && Math.floor(w.invuln * 12) % 2 === 0;
  if (!flash) {
    ctx.save();
    ctx.translate(sx(w.x), w.y);
    ctx.scale(w.face, 1);
    if (w.attack === "kick") ctx.rotate(-0.18);
    if (body && body.complete && body.naturalWidth) ctx.drawImage(body, -18, -36, 36, 52);
    else {
      ctx.fillStyle = "#ff2bd6";
      ctx.fillRect(-12, -28, 24, 40);
    }
    if (w.weapon) {
      ctx.fillStyle = w.weapon === "bottle" ? "#39ff14" : w.weapon === "bat" ? "#8b5a2b" : "#9aa8b8";
      ctx.fillRect(14, w.attack ? -18 : -8, 22, 5);
    }
    ctx.restore();
  }

  ctx.fillStyle = "#f5f5f0";
  ctx.font = "11px Audiowide, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(stage.name, 10, 18);
  if (w.weapon) ctx.fillText(w.weapon.toUpperCase(), 10, 34);
  if (w.power > 0) {
    ctx.fillStyle = "#ff2bd6";
    ctx.fillText("POWER", 120, 18);
  }

  if (w.over) {
    ctx.fillStyle = "rgba(10,6,16,0.5)";
    ctx.fillRect(0, 0, W, H);
    drawLoseCall(ctx, W, H);
  } else if (w.banner > 0) {
    drawLevelCall(ctx, w.level, W, H);
  }
}
