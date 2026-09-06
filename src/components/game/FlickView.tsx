import { Button } from "@/components/ui/button";
import { CHARACTERS } from "@/game/characters";
import { playPortrait } from "@/game/play-art";
import { ART } from "@/game/assets";
import { hushMusic, playChime, playClick, setAmbient, unlockAudio } from "@/game/audio";
import { useGame } from "@/game/store";
import type { CharacterId } from "@/game/types";
import { drawShip, preloadShips } from "@/game/ships";
import { drawLevelCall, drawLoseCall } from "@/game/neon-banner";
import { H, W, fireOrb, newFlick, stepFlick, type FlickWorld, type FoeKind } from "@/flick/engine";
import { useEffect, useRef, useState } from "react";
import { RosterPick } from "./RosterPick";
import { Hearts } from "./Hearts";
import { SoundToggle } from "@/components/ui/sound-toggle";
import { lockCanvasBox, SHELL } from "@/game/pin-frame";
import { NeonAct, NeonArrow, PadDock } from "./NeonPads";

const HI_KEY = "nevaeh-flick-hi";

export function FlickView() {
  const [who, setWho] = useState<CharacterId | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const world = useRef<FlickWorld>(newFlick());
  const faceRef = useRef<HTMLImageElement | null>(null);
  const bgRef = useRef<HTMLImageElement[]>([]);
  const keys = useRef({ up: false, down: false, left: false, right: false, fire: false });
  const [hud, setHud] = useState({ score: 0, lives: 3, level: 1, over: false });
  const [hi, setHi] = useState(() => Number(localStorage.getItem(HI_KEY) || 0));
  const [stage] = useState(() => lockCanvasBox(W, H, 228, "sphal"));

  const faces = useRef<Record<string, HTMLImageElement>>({});

  useEffect(() => {
    preloadShips(["nancy", ...CHARACTERS.map((c) => c.id)]);
    if (!who) {
      unlockAudio();
      setAmbient("flick");
      return;
    }
    hushMusic();
  }, [who]);

  useEffect(() => {
    bgRef.current = [
      "/art/skies/sky1.jpg",
      "/art/skies/sky2.jpg",
      "/art/skies/sky3.jpg",
      "/art/skies/sky4.jpg",
      ART.valley,
      ART.cave,
      ART.bridge,
      ART.chapter,
    ].map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });
    const bag: Record<string, HTMLImageElement> = {};
    for (const c of CHARACTERS) {
      const img = new Image();
      img.src = playPortrait(c.id) || c.portrait;
      bag[c.id] = img;
    }
    faces.current = bag;
    preloadShips(CHARACTERS.map((c) => c.id));
  }, []);

  useEffect(() => {
    if (!who) return;
    const src = playPortrait(who) || CHARACTERS.find((c) => c.id === who)?.portrait || "";
    let img = faces.current[who];
    if (!img) {
      img = new Image();
      faces.current[who] = img;
    }
    if (src && img.src.indexOf(src.replace(/^\//, "")) === -1 && !img.src.endsWith(src)) img.src = src;
    faceRef.current = img;
  }, [who]);

  useEffect(() => {
    if (!who) return;
    world.current = newFlick();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let last = performance.now();
    let lastLives = 3;
    let rang = false;
    const step = (now: number) => {
      const dt = Math.min(0.04, (now - last) / 1000);
      last = now;
      const w = world.current;
      stepFlick(w, dt, keys.current);
      if (w.lives < lastLives) playClick();
      lastLives = w.lives;
      if (w.over && !rang) {
        rang = true;
        playChime();
        const best = Math.max(w.score, Number(localStorage.getItem(HI_KEY) || 0));
        localStorage.setItem(HI_KEY, String(best));
        setHi(best);
      }
      drawShooter(ctx, w, who, faceRef.current, bgRef.current);
      setHud({ score: w.score, lives: w.lives, level: w.level, over: w.over });
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    const down = (e: KeyboardEvent) => {
      if (e.code === "ArrowUp" || e.code === "KeyW") keys.current.up = true;
      if (e.code === "ArrowDown" || e.code === "KeyS") keys.current.down = true;
      if (e.code === "ArrowLeft" || e.code === "KeyA") keys.current.left = true;
      if (e.code === "ArrowRight" || e.code === "KeyD") keys.current.right = true;
      if (e.code === "Space" || e.code === "KeyJ") {
        e.preventDefault();
        keys.current.fire = true;
        fireOrb(wOr());
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === "ArrowUp" || e.code === "KeyW") keys.current.up = false;
      if (e.code === "ArrowDown" || e.code === "KeyS") keys.current.down = false;
      if (e.code === "ArrowLeft" || e.code === "KeyA") keys.current.left = false;
      if (e.code === "ArrowRight" || e.code === "KeyD") keys.current.right = false;
      if (e.code === "Space" || e.code === "KeyJ") keys.current.fire = false;
    };
    const wOr = () => world.current;
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [who]);

  if (!who) {
    return (
      <RosterPick
        title="Sphalerizer"
        blurb="The sky runs toward you. Steer up and down, fire Orbs, and clear bats and devils. Three hearts. Best score keeps."
        pickLabel="Choose Your Pilot"
        onPick={setWho}
      />
    );
  }

  const name = CHARACTERS.find((c) => c.id === who)?.name ?? who;

  return (
    <div className="flex flex-col overflow-hidden bg-ink text-parchment" style={{ ...SHELL, touchAction: "none" }}>
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 px-4">
        <div className="flex min-w-0 items-center gap-2">
          <img
            src={playPortrait(who)}
            alt=""
            className="h-10 w-8 shrink-0 rounded-[8px] object-cover object-top ring-2 ring-[#ff2bd6]"
          />
          <div className="min-w-0">
            <p className="truncate font-display text-base leading-tight">{name}</p>
            <Button variant="quiet" className="h-auto px-0 py-0 text-xs" onClick={() => useGame.getState().backToTitle()}>
              Main Menu
            </Button>
          </div>
        </div>
        <SoundToggle />
        <div className="min-w-0 text-right">
          <Hearts lives={hud.lives} />
          <p className="truncate text-sm text-silver">
            {hud.score} · L{hud.level} · best {hi}
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
      <div className="flex h-36 shrink-0 items-center justify-center px-3">
        {hud.over ? (
          <div className="flex gap-2">
            <Button
              variant="pink"
              onClick={() => {
                playClick();
                world.current = newFlick();
                setHud({ score: 0, lives: 3, level: 1, over: false });
              }}
            >
              Sphalerizer again
            </Button>
            <Button variant="ghost" onClick={() => setWho(null)}>
              New flyer
            </Button>
          </div>
        ) : (
          <PadDock className="pointer-events-auto flex items-center justify-center gap-3 p-2">
            <div className="grid shrink-0 grid-cols-3 place-items-center gap-1">
              <span className="size-12" />
              <NeonArrow dir="up" tone="blue" onDown={() => { keys.current.up = true; }} onUp={() => { keys.current.up = false; }} />
              <span className="size-12" />
              <NeonArrow dir="left" tone="pink" onDown={() => { keys.current.left = true; }} onUp={() => { keys.current.left = false; }} />
              <NeonArrow dir="down" tone="blue" onDown={() => { keys.current.down = true; }} onUp={() => { keys.current.down = false; }} />
              <NeonArrow dir="right" tone="pink" onDown={() => { keys.current.right = true; }} onUp={() => { keys.current.right = false; }} />
            </div>
            <NeonAct
              label="Fire"
              onDown={() => {
                keys.current.fire = true;
                fireOrb(world.current);
              }}
              onUp={() => {
                keys.current.fire = false;
              }}
            />
          </PadDock>
        )}
      </div>
    </div>
  );
}

function drawShooter(
  ctx: CanvasRenderingContext2D,
  w: FlickWorld,
  who: CharacterId,
  face: HTMLImageElement | null,
  backs: HTMLImageElement[],
) {
  const ready = backs.filter((b) => b.complete && b.naturalWidth);
  if (ready.length) {
    const img = ready[(w.level - 1) % ready.length]!;
    ctx.drawImage(img, 0, 0, W, H);
  } else {
    const sky = ctx.createLinearGradient(0, 0, W, H);
    sky.addColorStop(0, "#2a0a3a");
    sky.addColorStop(0.5, "#12204a");
    sky.addColorStop(1, "#081018");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);
  }
  ctx.fillStyle = "rgba(8,6,16,0.28)";
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.globalAlpha = 0.85;
  for (let i = 0; i < 40; i++) {
    const sx = ((i * 97 - w.cam * (0.4 + (i % 3) * 0.2)) % W + W) % W;
    const sy = (i * 53) % H;
    ctx.fillStyle = i % 2 ? "#ff4ae0" : "#3cf0ff";
    ctx.fillRect(sx, sy, 2 + (i % 3), 2 + (i % 3));
  }
  ctx.restore();

  const neon = ctx.createLinearGradient(0, H - 18, 0, H);
  neon.addColorStop(0, "#ff4ae000");
  neon.addColorStop(1, "#3cf0ff66");
  ctx.fillStyle = neon;
  ctx.fillRect(0, H - 22, W, 22);

  for (const f of w.foes) {
    const x = f.x - w.cam;
    if (x < -40 || x > W + 40) continue;
    drawFoe(ctx, f.kind, x, f.y, f.r, f.phase);
  }

  if (w.heart) {
    const hx = w.heart.x - w.cam;
    if (hx > -20 && hx < W + 20) {
      ctx.save();
      ctx.translate(hx, w.heart.y);
      ctx.fillStyle = "#ff2bd6";
      ctx.shadowColor = "#ff4ae0";
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(0, 6);
      ctx.bezierCurveTo(-10, -2, -10, -10, -4, -10);
      ctx.bezierCurveTo(0, -10, 0, -6, 0, -6);
      ctx.bezierCurveTo(0, -6, 0, -10, 4, -10);
      ctx.bezierCurveTo(10, -10, 10, -2, 0, 6);
      ctx.fill();
      ctx.restore();
    }
  }

  for (const s of w.shots) {
    const x = s.x - w.cam;
    ctx.save();
    ctx.shadowColor = "#39ff14";
    ctx.shadowBlur = 16;
    ctx.fillStyle = "#b9ff7a";
    ctx.fillRect(x, s.y - 3, 34, 6);
    ctx.fillStyle = "#39ff14";
    ctx.fillRect(x, s.y - 1.5, 34, 3);
    ctx.restore();
  }

  for (const p of w.pops) {
    const a = Math.max(0, p.life);
    const x = p.x - w.cam;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.beginPath();
    ctx.arc(x, p.y, 22 + (1 - a) * 52, 0, Math.PI * 2);
    ctx.strokeStyle = p.pts ? "#39ff14" : "#ff4ae0";
    ctx.lineWidth = 5;
    ctx.shadowColor = "#ffb000";
    ctx.shadowBlur = 28;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, p.y, 10 + (1 - a) * 22, 0, Math.PI * 2);
    ctx.fillStyle = "#fff4c0";
    ctx.fill();
    ctx.shadowBlur = 0;
    for (let i = 0; i < p.sparks.length; i++) {
      const sp = p.sparks[i]!;
      ctx.fillStyle = i % 3 === 0 ? "#39ff14" : i % 3 === 1 ? "#ffb000" : "#ff2bd6";
      ctx.fillRect(sp.x - w.cam, sp.y, 4, 4);
    }
    if (p.pts) {
      ctx.fillStyle = "#f4ead8";
      ctx.font = "bold 22px serif";
      ctx.textAlign = "center";
      ctx.fillText("+" + p.pts, x, p.y - 20 - (1 - a) * 22);
    }
    ctx.restore();
  }

  const px = w.x;
  const flash = w.invuln > 0 && Math.floor(w.invuln * 12) % 2 === 0;
  if (!flash) drawShip(ctx, who, px, w.y, null, "right", false);

  const gate = w.goal - w.cam;
  if (gate > -20 && gate < W + 20) {
    ctx.fillStyle = "#3cf0ff55";
    ctx.fillRect(gate, 20, 8, H - 40);
    ctx.fillStyle = "#ff2bd6";
    ctx.fillRect(gate + 8, 20, 18, 18);
  }

  if (w.over) {
    ctx.fillStyle = "rgba(10,6,16,0.55)";
    ctx.fillRect(0, 0, W, H);
    drawLoseCall(ctx, W, H);
  } else if (w.banner > 0) {
    drawLevelCall(ctx, w.level, W, H);
  }
}

function drawFoe(ctx: CanvasRenderingContext2D, kind: FoeKind, x: number, y: number, r: number, phase: number) {
  ctx.save();
  ctx.translate(x, y);
  const flap = Math.sin(phase * 2);
  if (kind === "bat") {
    ctx.shadowColor = "#d0c4ff";
    ctx.shadowBlur = 16;
    ctx.fillStyle = "#2a1468";
    ctx.beginPath();
    ctx.ellipse(-r * 1.05, flap * 8, r * 1.2, r * 0.5, -0.4, 0, Math.PI * 2);
    ctx.ellipse(r * 1.05, flap * 8, r * 1.2, r * 0.5, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#efe6ff";
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.62, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ff2bd6";
    ctx.beginPath();
    ctx.arc(-5, -2, 3, 0, Math.PI * 2);
    ctx.arc(5, -2, 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === "devil") {
    ctx.shadowColor = "#ff4ae0";
    ctx.shadowBlur = 18;
    ctx.fillStyle = "#c41a3a";
    ctx.beginPath();
    ctx.moveTo(-r * 0.2, -r);
    ctx.lineTo(r * 0.15, -r * 0.3);
    ctx.lineTo(r * 0.55, -r * 1.05);
    ctx.lineTo(r, r * 0.2);
    ctx.lineTo(-r, r * 0.15);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#39ff14";
    ctx.beginPath();
    ctx.arc(-6, -2, 4, 0, Math.PI * 2);
    ctx.arc(7, -2, 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === "zombie") {
    ctx.fillStyle = "#7aa86a";
    ctx.beginPath();
    ctx.arc(0, 2, r * 0.78, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = Math.sin(phase) > 0 ? "#ff2a2a" : "#12d8ff";
    ctx.beginPath();
    ctx.moveTo(-r * 0.7, -r * 0.2);
    ctx.quadraticCurveTo(0, -r * 1.35, r * 0.7, -r * 0.15);
    ctx.lineTo(r * 0.45, r * 0.1);
    ctx.lineTo(-r * 0.45, r * 0.1);
    ctx.fill();
    ctx.fillStyle = "#f4ead8";
    ctx.fillRect(-6, 6, 12, 5);
    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.arc(-5, -1, 2.4, 0, Math.PI * 2);
    ctx.arc(5, -1, 2.4, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === "ship") {
    ctx.shadowColor = "#3cf0ff";
    ctx.shadowBlur = 14;
    ctx.fillStyle = "#8a93a8";
    ctx.beginPath();
    ctx.moveTo(-r, 0);
    ctx.lineTo(r * 0.7, -r * 0.55);
    ctx.lineTo(r * 0.35, 0);
    ctx.lineTo(r * 0.7, r * 0.55);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ff2bd6";
    ctx.fillRect(-r * 0.3, -4, r * 0.5, 8);
    ctx.fillStyle = "#12d8ff";
    ctx.beginPath();
    ctx.arc(r * 0.85, 0, 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === "ghost") {
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = "#e8eef8";
    ctx.beginPath();
    ctx.arc(0, -r * 0.15, r * 0.75, Math.PI, 0);
    ctx.lineTo(r * 0.75, r * 0.7 + flap * 3);
    ctx.quadraticCurveTo(r * 0.35, r * 0.35, 0, r * 0.7);
    ctx.quadraticCurveTo(-r * 0.35, r * 0.35, -r * 0.75, r * 0.7 + flap * 3);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#12d8ff";
    ctx.beginPath();
    ctx.arc(-6, -4, 3.2, 0, Math.PI * 2);
    ctx.arc(6, -4, 3.2, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === "frank") {
    ctx.fillStyle = "#4d7a52";
    ctx.fillRect(-r * 0.7, -r * 0.55, r * 1.4, r * 1.25);
    ctx.fillStyle = "#2a2a2a";
    ctx.fillRect(-r * 0.75, -r * 0.7, r * 1.5, r * 0.22);
    ctx.fillStyle = "#c0c4c8";
    ctx.fillRect(-r * 0.95, -4, 8, 10);
    ctx.fillRect(r * 0.55, -4, 8, 10);
    ctx.fillStyle = "#39ff14";
    ctx.fillRect(-8, -8, 6, 6);
    ctx.fillRect(2, -8, 6, 6);
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-6, 8);
    ctx.lineTo(6, 8);
    ctx.stroke();
  } else if (kind === "vamp") {
    ctx.fillStyle = "#1a0c14";
    ctx.beginPath();
    ctx.moveTo(-r, r * 0.4);
    ctx.lineTo(0, -r);
    ctx.lineTo(r, r * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#e8c8b0";
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#4a1020";
    ctx.fillRect(-r * 0.5, -r * 0.15, r, r * 0.18);
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(-4, 6);
    ctx.lineTo(-1, 12);
    ctx.lineTo(1, 6);
    ctx.moveTo(1, 6);
    ctx.lineTo(4, 12);
    ctx.lineTo(6, 6);
    ctx.fill();
    ctx.fillStyle = "#ff2bd6";
    ctx.beginPath();
    ctx.arc(-5, -2, 2.4, 0, Math.PI * 2);
    ctx.arc(5, -2, 2.4, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = "#6a4a32";
    ctx.beginPath();
    ctx.arc(0, 2, r * 0.78, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#3a2818";
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.15, r * 0.85, r * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.arc(-6, -2, 3, 0, Math.PI * 2);
    ctx.arc(6, -2, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(-4, 8);
    ctx.lineTo(-1, 14);
    ctx.lineTo(2, 8);
    ctx.fill();
  }
  ctx.restore();
}

