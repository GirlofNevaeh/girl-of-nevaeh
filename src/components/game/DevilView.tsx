import { Button } from "@/components/ui/button";
import { CHARACTERS } from "@/game/characters";
import { playPortrait } from "@/game/play-art";
import { hushMusic, playChime, playClick, playOrb, playRefuse, setAmbient, unlockAudio } from "@/game/audio";
import { SoundToggle } from "@/components/ui/sound-toggle";
import { useGame } from "@/game/store";
import type { CharacterId } from "@/game/types";
import { H, TILE, W, newDevil, stepDevil, type DevilWorld, type Dir } from "@/devil/engine";
import { useEffect, useRef, useState } from "react";
import { RosterPick } from "./RosterPick";
import { Hearts } from "./Hearts";
import { NeonArrow, PadDock } from "./NeonPads";
import { lockCanvasBox, SHELL } from "@/game/pin-frame";

const HI_KEY = "nevaeh-devil-hi";
const DEVIL_COL = ["#ff2bd6", "#12d8ff", "#e07a5a", "#d4a54a", "#6b5b8c"];

export function DevilView() {
  const [who, setWho] = useState<CharacterId | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const faceRef = useRef<HTMLImageElement | null>(null);
  const world = useRef<DevilWorld>(newDevil(1, 0, 3));
  const want = useRef<Dir | null>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const [hud, setHud] = useState({ score: 0, lives: 3, level: 1, over: false });
  const [hi, setHi] = useState(() => Number(localStorage.getItem(HI_KEY) || 0));
  const [stage] = useState(() => lockCanvasBox(W, H, 236, "devil"));

  useEffect(() => {
    if (!who) {
      hushMusic();
      return;
    }
    unlockAudio();
    setAmbient("devil");
  }, [who]);

  const steer = (dir: Dir) => {
    want.current = dir;
    world.current.you.next = dir;
    world.current.you.steered = true;
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
    world.current = newDevil(1, 0, 3);
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
      if (w.score > lastScore) playOrb();
      if (w.lives < lastLives) playRefuse();
      lastScore = w.score;
      lastLives = w.lives;
      if (w.won) {
        playChime();
        world.current = newDevil(w.level + 1, w.score + 400, w.lives);
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
        setHud({ score: w.score, lives: w.lives, level: w.level, over: w.over });
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
  }, [who]);

  if (!who) {
    return (
      <RosterPick
        title="Devil Run"
        blurb="Steer with the pad, the keys, or a swipe on the maze. Devils hunt on their own."
        onPick={setWho}
      />
    );
  }

  const name = CHARACTERS.find((c) => c.id === who)?.name ?? who;

  const swipeDir = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    if (Math.abs(dx) < 12 && Math.abs(dy) < 12) return;
    steer(Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? "L" : "R") : dy < 0 ? "U" : "D");
  };

  return (
    <div
      className="flex flex-col overflow-hidden bg-ink text-parchment"
      style={{ ...SHELL, touchAction: "none" }}
    >
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 px-4">
        <Button variant="quiet" onClick={() => useGame.getState().backToTitle()}>
          Main Menu
        </Button>
        <SoundToggle />
        <div className="min-w-0 text-right">
          <Hearts lives={hud.lives} />
          <p className="truncate text-sm text-silver">
            {name} · L{hud.level} · {hud.score} · best {hi}
          </p>
        </div>
      </header>
      <div className="flex shrink-0 justify-center" style={{ height: stage.h }}>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="touch-none rounded-[16px] border border-[#ff4ae0]/40"
          style={{ width: stage.w, height: stage.h }}
          onPointerDown={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            swipe.current = { x: e.clientX - r.left, y: e.clientY - r.top };
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerUp={(e) => {
            if (!swipe.current) return;
            const r = e.currentTarget.getBoundingClientRect();
            swipeDir(swipe.current, { x: e.clientX - r.left, y: e.clientY - r.top });
            swipe.current = null;
          }}
        />
      </div>
      <div className="flex h-40 shrink-0 items-center justify-center px-3">
        {hud.over ? (
          <div className="flex gap-2">
            <Button
              variant="pink"
              onClick={() => {
                playClick();
                world.current = newDevil(1, 0, 3);
                want.current = null;
                setHud({ score: 0, lives: 3, level: 1, over: false });
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

function drawDevil(ctx: CanvasRenderingContext2D, w: DevilWorld, face: HTMLImageElement | null) {
  ctx.fillStyle = "#0b0b12";
  ctx.fillRect(0, 0, W, H);
  for (let r = 0; r < w.grid.length; r++) {
    for (let c = 0; c < w.grid[r].length; c++) {
      const t = w.grid[r][c];
      const x = c * TILE;
      const y = r * TILE;
      if (t === "#") {
        ctx.fillStyle = "#2a1840";
        ctx.fillRect(x + 1, y + 1, TILE - 2, TILE - 2);
        ctx.strokeStyle = "#ff4ae088";
        ctx.strokeRect(x + 2, y + 2, TILE - 4, TILE - 4);
      } else if (t === ".") {
        ctx.fillStyle = "#d4a54a";
        ctx.beginPath();
        ctx.arc(x + TILE / 2, y + TILE / 2, 2.4, 0, Math.PI * 2);
        ctx.fill();
      } else if (t === "o") {
        ctx.fillStyle = "#f4ead8";
        ctx.shadowColor = "#d4a54a";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(x + TILE / 2, y + TILE / 2, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
  }

  for (const g of w.ghosts) {
    ctx.fillStyle = w.fright > 0 ? "#3cf0ff" : DEVIL_COL[g.kind % DEVIL_COL.length]!;
    ctx.beginPath();
    ctx.arc(g.x, g.y - 2, 10, Math.PI, 0);
    ctx.lineTo(g.x + 10, g.y + 9);
    ctx.lineTo(g.x + 5, g.y + 5);
    ctx.lineTo(g.x, g.y + 9);
    ctx.lineTo(g.x - 5, g.y + 5);
    ctx.lineTo(g.x - 10, g.y + 9);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#f4ead8";
    ctx.beginPath();
    ctx.arc(g.x - 3.5, g.y - 2, 2.2, 0, Math.PI * 2);
    ctx.arc(g.x + 3.5, g.y - 2, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.save();
  ctx.beginPath();
  ctx.arc(w.you.x, w.you.y, 11, 0, Math.PI * 2);
  ctx.clip();
  if (face && face.complete) ctx.drawImage(face, w.you.x - 12, w.you.y - 14, 24, 28);
  else {
    ctx.fillStyle = "#ff2bd6";
    ctx.fillRect(w.you.x - 11, w.you.y - 11, 22, 22);
  }
  ctx.restore();
  ctx.strokeStyle = "#ff2bd6";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(w.you.x, w.you.y, 11, 0, Math.PI * 2);
  ctx.stroke();

  if (w.over) {
    ctx.fillStyle = "rgba(11,11,18,0.55)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#f4ead8";
    ctx.font = "26px serif";
    ctx.textAlign = "center";
    ctx.fillText("The hunt ended", W / 2, H / 2);
  }
}
