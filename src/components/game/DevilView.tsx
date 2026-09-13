import { Button } from "@/components/ui/button";
import { CHARACTERS } from "@/game/characters";
import { playPortrait } from "@/game/play-art";
import { hushMusic, playChime, playClick, playOrb, playPowerOrb, playRefuse, setAmbient, unlockAudio } from "@/game/audio";
import { SoundToggle } from "@/components/ui/sound-toggle";
import { useGame } from "@/game/store";
import type { CharacterId } from "@/game/types";
import { H, W, boardSize, newDevil, stepDevil, type DevilDiff, type DevilWorld, type Dir } from "@/devil/engine";
import { useEffect, useRef, useState } from "react";
import { RosterPick } from "./RosterPick";
import { Hearts } from "./Hearts";
import { NeonArrow, PadDock } from "./NeonPads";
import { lockCanvasBox, SHELL } from "@/game/pin-frame";
import { drawLoseCall, drawNeonBanner } from "@/game/neon-banner";
import { cn } from "@/lib/cn";

const HI_KEY = "nevaeh-devil-hi";
const DEVIL_COL = ["#ff2bd6", "#12d8ff", "#e07a5a", "#d4a54a", "#6b5b8c"];

export function DevilView() {
  const [who, setWho] = useState<CharacterId | null>(null);
  const [diff, setDiff] = useState<DevilDiff>("normal");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const faceRef = useRef<HTMLImageElement | null>(null);
  const world = useRef<DevilWorld>(newDevil(1, 0, 3, "normal"));
  const want = useRef<Dir | null>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const [hud, setHud] = useState({ score: 0, lives: 3, level: 1, over: false, ready: true });
  const [hi, setHi] = useState(() => Number(localStorage.getItem(HI_KEY) || 0));
  const [stage] = useState(() => lockCanvasBox(W, H, 318, "devil"));

  useEffect(() => {
    unlockAudio();
    setAmbient("devil");
  }, [who]);

  const steer = (dir: Dir) => {
    want.current = dir;
    const you = world.current.you;
    you.next = dir;
    you.steered = true;
  };

  useEffect(() => {
    if (!who) return;
    const src = playPortrait(who);
    if (!src) return;
    const img = new Image();
    img.src = src;
    faceRef.current = img;
  }, [who]);

  useEffect(() => {
    if (!who) return;
    world.current = newDevil(1, 0, 3, diff);
    want.current = null;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let last = performance.now();
    let hudTick = 0;
    let lastScore = 0;
    let lastLives = 3;
    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const w = world.current;
      if (!w.over) stepDevil(w, dt, want.current);
      if (w.score > lastScore) {
        if (w.score - lastScore >= 50) playPowerOrb();
        else playOrb();
      }
      if (w.lives < lastLives) playRefuse();
      lastScore = w.score;
      lastLives = w.lives;
      if (w.won) {
        playChime();
        world.current = newDevil(w.level + 1, w.score + 400, w.lives, w.diff);
      }
      if (w.over) {
        const best = Math.max(w.score, Number(localStorage.getItem(HI_KEY) || 0));
        localStorage.setItem(HI_KEY, String(best));
        setHi(best);
      }
      drawDevil(ctx, w, faceRef.current);
      hudTick += dt;
      if (hudTick > 0.12 || w.over) {
        hudTick = 0;
        setHud({ score: w.score, lives: w.lives, level: w.level, over: w.over, ready: w.ready > 0 || w.banner > 0 });
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    const down = (e: KeyboardEvent) => {
      if (e.code === "ArrowLeft" || e.code === "KeyA") {
        e.preventDefault();
        steer("L");
      }
      if (e.code === "ArrowRight" || e.code === "KeyD") {
        e.preventDefault();
        steer("R");
      }
      if (e.code === "ArrowUp" || e.code === "KeyW") {
        e.preventDefault();
        steer("U");
      }
      if (e.code === "ArrowDown" || e.code === "KeyS") {
        e.preventDefault();
        steer("D");
      }
    };
    window.addEventListener("keydown", down, { passive: false });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", down);
    };
  }, [who, diff]);

  if (!who) {
    return (
      <RosterPick
        title="Devil Run"
        blurb="Steer with the pad, the keys, or a swipe on the maze. Devils hunt on their own."
        extra={
          <div className="relative z-10 flex flex-wrap gap-2 px-4 pt-3">
            {(["easy", "normal", "hard"] as DevilDiff[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDiff(d)}
                className={cn(
                  "min-h-11 rounded-[12px] border px-4 capitalize",
                  diff === d ? "border-[#ff4ae0] bg-[#ff2bd6] text-ink shadow-[0_0_14px_#ff4ae0]" : "border-gold/30 text-silver",
                )}
              >
                {d}
              </button>
            ))}
          </div>
        }
        onPick={setWho}
      />
    );
  }

  const name = CHARACTERS.find((c) => c.id === who)?.name ?? who;

  const aimFromTap = (clientX: number, clientY: number, canvas: HTMLCanvasElement) => {
    const r = canvas.getBoundingClientRect();
    const px = ((clientX - r.left) / Math.max(1, r.width)) * W;
    const py = ((clientY - r.top) / Math.max(1, r.height)) * H;
    const { scale, ox, oy } = boardFit(world.current.tile);
    const you = world.current.you;
    const mx = (px - ox) / scale;
    const my = (py - oy) / scale;
    const dx = mx - you.x;
    const dy = my - you.y;
    if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
    steer(Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? "L" : "R") : dy < 0 ? "U" : "D");
  };

  return (
    <div
      className="flex flex-col overflow-hidden bg-ink text-parchment"
      style={{ ...SHELL, touchAction: "none" }}
    >
      <header className="shrink-0 px-3 pb-2 pt-[max(3.4rem,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button variant="quiet" className="shrink-0 whitespace-nowrap" onClick={() => useGame.getState().backToTitle()}>
              Main Menu
            </Button>
            <Button variant="quiet" className="shrink-0 whitespace-nowrap" onClick={() => setWho(null)}>
              Lobby
            </Button>
          </div>
          <SoundToggle />
        </div>
        <h1 className="mt-1 text-center font-display text-2xl font-semibold leading-none">Devil Run</h1>
        <div className="mt-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <Hearts lives={hud.lives} />
          <p className="whitespace-nowrap text-sm text-silver">
            L{hud.level} · {hud.score} · best {hi}
          </p>
        </div>
      </header>
      <div className="flex min-h-0 flex-1 items-center justify-center px-2">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="touch-none rounded-[16px] border border-[#ff4ae0]/40"
          style={{ width: stage.w, height: stage.h, maxWidth: "100%", maxHeight: "100%" }}
          onPointerDown={(e) => {
            swipe.current = { x: e.clientX, y: e.clientY };
            aimFromTap(e.clientX, e.clientY, e.currentTarget);
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (!swipe.current) return;
            const dx = e.clientX - swipe.current.x;
            const dy = e.clientY - swipe.current.y;
            if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
            steer(Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? "L" : "R") : dy < 0 ? "U" : "D");
            swipe.current = { x: e.clientX, y: e.clientY };
          }}
          onPointerUp={() => {
            swipe.current = null;
          }}
        />
      </div>
      <div className="flex h-11 shrink-0 items-center justify-center px-3">
        <p
          className="font-display text-xl font-extrabold leading-none text-[#3cf0ff]"
          style={{
            WebkitTextStroke: "2px #ff2bd6",
            paintOrder: "stroke fill",
            textShadow: "0 0 10px #ff2bd6",
          }}
        >
          {name}
        </p>
      </div>
      <div className="flex shrink-0 items-center justify-center px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {hud.over ? (
          <div className="flex gap-2">
            <Button
              variant="pink"
              onClick={() => {
                playClick();
                world.current = newDevil(1, 0, 3, diff);
                want.current = null;
                setHud({ score: 0, lives: 3, level: 1, over: false, ready: true });
              }}
            >
              Run again
            </Button>
            <Button variant="ghost" onClick={() => setWho(null)}>
              New runner
            </Button>
          </div>
        ) : (
          <PadDock className="grid w-[13.5rem] grid-cols-3 place-items-center gap-1.5 p-2">
            <span />
            <NeonArrow dir="up" tone="blue" onDown={() => steer("U")} />
            <span />
            <NeonArrow dir="left" tone="pink" onDown={() => steer("L")} />
            <NeonArrow dir="down" tone="blue" onDown={() => steer("D")} />
            <NeonArrow dir="right" tone="pink" onDown={() => steer("R")} />
          </PadDock>
        )}
      </div>
    </div>
  );
}

function boardFit(tile: number) {
  const { w: bw, h: bh } = boardSize(tile);
  const scale = Math.min(W / bw, H / bh);
  return { scale, ox: (W - bw * scale) / 2, oy: (H - bh * scale) / 2 };
}

function drawDevil(ctx: CanvasRenderingContext2D, w: DevilWorld, face: HTMLImageElement | null) {
  const tile = w.tile;
  ctx.fillStyle = "#0b0b12";
  ctx.fillRect(0, 0, W, H);
  const { scale, ox, oy } = boardFit(tile);
  ctx.save();
  ctx.translate(ox, oy);
  ctx.scale(scale, scale);
  for (let r = 0; r < w.grid.length; r++) {
    for (let c = 0; c < w.grid[r].length; c++) {
      const t = w.grid[r][c];
      const x = c * tile;
      const y = r * tile;
      if (t === "#") {
        ctx.fillStyle = "#2a1840";
        ctx.fillRect(x + 1, y + 1, tile - 2, tile - 2);
        ctx.strokeStyle = "#ff4ae088";
        ctx.strokeRect(x + 2, y + 2, tile - 4, tile - 4);
      } else if (t === ".") {
        ctx.fillStyle = "#d4a54a";
        ctx.beginPath();
        ctx.arc(x + tile / 2, y + tile / 2, Math.max(tile * 0.16, 3.2), 0, Math.PI * 2);
        ctx.fill();
      } else if (t === "o") {
        ctx.fillStyle = "#f4ead8";
        ctx.shadowColor = "#d4a54a";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(x + tile / 2, y + tile / 2, Math.max(tile * 0.3, 7), 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
  }

  const gr = Math.max(tile * 0.58, 15);
  for (const g of w.ghosts) {
    ctx.fillStyle = w.fright > 0 ? "#3cf0ff" : DEVIL_COL[g.kind % DEVIL_COL.length]!;
    ctx.beginPath();
    ctx.arc(g.x, g.y - 2, gr, Math.PI, 0);
    ctx.lineTo(g.x + gr, g.y + gr * 0.9);
    ctx.lineTo(g.x + gr * 0.5, g.y + gr * 0.5);
    ctx.lineTo(g.x, g.y + gr * 0.9);
    ctx.lineTo(g.x - gr * 0.5, g.y + gr * 0.5);
    ctx.lineTo(g.x - gr, g.y + gr * 0.9);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#f4ead8";
    ctx.beginPath();
    ctx.arc(g.x - gr * 0.35, g.y - 2, gr * 0.22, 0, Math.PI * 2);
    ctx.arc(g.x + gr * 0.35, g.y - 2, gr * 0.22, 0, Math.PI * 2);
    ctx.fill();
  }

  const pr = Math.max(tile * 0.62, 16);
  ctx.save();
  ctx.beginPath();
  ctx.arc(w.you.x, w.you.y, pr, 0, Math.PI * 2);
  ctx.clip();
  if (face && face.complete) ctx.drawImage(face, w.you.x - pr, w.you.y - pr * 1.08, pr * 2, pr * 2.2);
  else {
    ctx.fillStyle = "#ff2bd6";
    ctx.fillRect(w.you.x - pr, w.you.y - pr, pr * 2, pr * 2);
  }
  ctx.restore();
  ctx.strokeStyle = "#ff2bd6";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(w.you.x, w.you.y, pr, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  if ((w.banner > 0 || w.ready > 0) && !w.over) {
    ctx.fillStyle = "rgba(0,0,0,0.72)";
    ctx.fillRect(W / 2 - 130, H / 2 - 36, 260, 72);
    const flash = 0.4 + 0.6 * Math.abs(Math.sin(performance.now() / 160));
    ctx.save();
    ctx.globalAlpha = flash;
    drawNeonBanner(ctx, `Level ${w.level}`, W / 2, H / 2, "#3cf0ff", "#ff2bd6", 40);
    ctx.restore();
  }
  if (w.over) {
    ctx.fillStyle = "rgba(11,11,18,0.55)";
    ctx.fillRect(0, 0, W, H);
    drawLoseCall(ctx, W, H);
  }
}
