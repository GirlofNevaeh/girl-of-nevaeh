import { Button } from "@/components/ui/button";
import { CHARACTERS } from "@/game/characters";
import { playPortrait, portraitFit } from "@/game/play-art";
import { drawLevelCall, drawLoseCall, drawNeonBanner } from "@/game/neon-banner";
import { drawBossShip, drawShip, preloadShips } from "@/game/ships";
import { beamPaint } from "@/game/beams";
import { playClick, setAmbient, unlockAudio } from "@/game/audio";
import { useGame } from "@/game/store";
import type { CharacterId } from "@/game/types";
import {
  BOSS_ART,
  H,
  POINTS,
  W,
  blank,
  fireYou,
  stepArmada,
  type World,
} from "@/armada/engine";
import { useEffect, useRef, useState } from "react";
import { RosterPick } from "./RosterPick";
import { Hearts } from "./Hearts";
import { SoundToggle } from "@/components/ui/sound-toggle";
import { NeonAct, NeonArrow, PadDock } from "./NeonPads";

const HI_KEY = "nevaeh-armageddon-hi";
const PINK = "#ff4ae0";
const BLUE = "#3cf0ff";
const SKIES = [
  "/art/skies/sky1.jpg",
  "/art/skies/sky2.jpg",
  "/art/skies/sky3.jpg",
  "/art/skies/sky4.jpg",
];

export function ArmageddonView() {
  const [who, setWho] = useState<CharacterId | null>(null);
  const [hi, setHi] = useState(() => Number(localStorage.getItem(HI_KEY) || 0));
  const [hud, setHud] = useState({ score: 0, lives: 3, level: 1, over: false, bossHp: 0, bossMax: 0 });
  const hudRef = useRef(hud);
  const world = useRef<World>(blank(1, 0, 3));
  const keys = useRef({ left: false, right: false, fire: false });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const faceRef = useRef<HTMLImageElement | null>(null);
  const whoRef = useRef<CharacterId | null>(null);
  const skies = useRef<HTMLImageElement[]>([]);

  useEffect(() => {
    preloadShips(["nancy", ...CHARACTERS.map((c) => c.id), ...BOSS_ART]);
  }, []);

  useEffect(() => {
    if (!who) {
      unlockAudio();
      setAmbient("armada");
      return;
    }
    unlockAudio();
    setAmbient("armada");
    skies.current = SKIES.map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });
    preloadShips([who, "nancy", ...BOSS_ART]);
  }, [who]);

  useEffect(() => {
    if (!who) return;
    whoRef.current = who;
    const img = new Image();
    const face = playPortrait(who);
    img.src = face;
    faceRef.current = img;
    world.current = blank(1, 0, 3);
    setHud({ score: 0, lives: 3, level: 1, over: false, bossHp: 0, bossMax: 0 });
  }, [who]);

  useEffect(() => {
    if (!who) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const w = world.current;
      if (!w.over) {
        stepArmada(w, dt, keys.current);
        if (w.over) {
          const best = Math.max(w.score, Number(localStorage.getItem(HI_KEY) || 0));
          localStorage.setItem(HI_KEY, String(best));
          setHi(best);
        }
      }
      drawArmada(ctx, w, skies.current, whoRef.current, faceRef.current);
      const next = {
        score: w.score,
        lives: w.lives,
        level: w.level,
        over: w.over,
        bossHp: w.boss?.hp ?? 0,
        bossMax: w.boss?.maxHp ?? 0,
      };
      const prev = hudRef.current;
      if (
        prev.score !== next.score ||
        prev.lives !== next.lives ||
        prev.level !== next.level ||
        prev.over !== next.over ||
        prev.bossHp !== next.bossHp ||
        prev.bossMax !== next.bossMax
      ) {
        hudRef.current = next;
        setHud(next);
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    const down = (e: KeyboardEvent) => {
      if (e.code === "ArrowLeft" || e.code === "KeyA") keys.current.left = true;
      if (e.code === "ArrowRight" || e.code === "KeyD") keys.current.right = true;
      if (e.code === "Space") {
        e.preventDefault();
        keys.current.fire = true;
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === "ArrowLeft" || e.code === "KeyA") keys.current.left = false;
      if (e.code === "ArrowRight" || e.code === "KeyD") keys.current.right = false;
      if (e.code === "Space") keys.current.fire = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.__armadaTest = {
      skipToLevel: (level: number) => {
        world.current = blank(level, world.current.score, Math.max(3, world.current.lives));
        world.current.banner = 0;
        world.current.invuln = 6;
        world.current.over = false;
      },
      getPhase: () => world.current.phase,
      getBoss: () => world.current.boss,
      fire: () => {
        world.current.banner = 0;
        world.current.cool = 0;
        fireYou(world.current);
      },
      hues: () => world.current.shots.filter((s) => s.from === "you").map((s) => s.hue),
    };
    window.__controlsTest = {
      getYaw: () => world.current.shipX,
      getSpeed: () => 1,
      setKeys: (codes: string[]) => {
        keys.current.left = codes.includes("KeyA") || codes.includes("ArrowLeft");
        keys.current.right = codes.includes("KeyD") || codes.includes("ArrowRight");
        keys.current.fire = codes.includes("Space");
      },
    };
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      delete window.__armadaTest;
      delete window.__controlsTest;
    };
  }, [who]);

  if (!who) {
    return (
      <RosterPick
        title="Armageddon"
        blurb="Every character can fly. Neon pink and blue targets score 10, 20, 40, or 80. Every fifth sky a Sphalerizer boss ship waits — green, purple, white beams versus red and yellow. Three hearts. Best score keeps."
        pickLabel="Choose Your Pilot"
        onPick={setWho}
      />
    );
  }

  const name = CHARACTERS.find((c) => c.id === who)?.name ?? who;

  return (
    <div
      className="flex flex-col overflow-hidden bg-ink text-parchment"
      style={{ height: "var(--app-h, 100%)", touchAction: "none", overscrollBehavior: "none" }}
      onTouchMove={(e) => e.preventDefault()}
    >
      <header className="shrink-0 px-2 pb-1 pt-[max(2.6rem,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1">
            <Button variant="quiet" className="shrink-0 whitespace-nowrap px-1 text-xs" onClick={() => useGame.getState().backToTitle()}>
              Main Menu
            </Button>
            <Button variant="quiet" className="shrink-0 whitespace-nowrap px-1 text-xs" onClick={() => setWho(null)}>
              Lobby
            </Button>
          </div>
          <SoundToggle />
        </div>
        <div className="mt-0.5 flex items-center justify-center gap-2">
          <Hearts lives={hud.lives} />
          <p className="whitespace-nowrap text-xs text-silver">
            L{hud.level} · {hud.score} · best {hi}
            {hud.bossMax ? ` · HP ${hud.bossHp}` : ""}
          </p>
        </div>
      </header>
      <div className="flex min-h-0 flex-1 items-center justify-center px-2">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="max-h-full max-w-full touch-none"
          style={{ width: "auto", height: "100%", aspectRatio: `${W} / ${H}` }}
        />
      </div>
      <div className="mt-0.5 flex shrink-0 justify-center">
        <div className="flex w-12 flex-col items-center overflow-hidden rounded-[8px] ring-2 ring-[#ff2bd6]">
          <img src={playPortrait(who)} alt="" className={`h-9 w-12 ${portraitFit(who)}`} />
          <p className="w-full truncate bg-[#120814] px-0.5 text-center text-[8px] leading-3 text-[#12d8ff]">{name}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center justify-center px-2 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-1">
        {hud.over ? (
          <div className="flex justify-center gap-2">
            <Button
              variant="pink"
              onClick={() => {
                playClick();
                world.current = blank(1, 0, 3);
                setHud({ score: 0, lives: 3, level: 1, over: false, bossHp: 0, bossMax: 0 });
              }}
            >
              Fly again
            </Button>
            <Button variant="ghost" onClick={() => setWho(null)}>
              New pilot
            </Button>
          </div>
        ) : (
          <PadDock className="relative z-10 mx-2 flex items-center justify-center gap-3 p-2">
            <NeonArrow
              dir="left"
              tone="pink"
              onDown={() => {
                keys.current.left = true;
              }}
              onUp={() => {
                keys.current.left = false;
              }}
            />
            <NeonAct
              label="Fire"
              onDown={() => {
                keys.current.fire = true;
              }}
              onUp={() => {
                keys.current.fire = false;
              }}
            />
            <NeonArrow
              dir="right"
              tone="blue"
              onDown={() => {
                keys.current.right = true;
              }}
              onUp={() => {
                keys.current.right = false;
              }}
            />
          </PadDock>
        )}
      </div>
    </div>
  );
}

function drawArmada(
  ctx: CanvasRenderingContext2D,
  w: World,
  skies: HTMLImageElement[],
  pilot: CharacterId | null,
  face: HTMLImageElement | null,
) {
  const sky = skies[(w.level - 1) % SKIES.length];
  if (sky && sky.complete && sky.naturalWidth) {
    ctx.drawImage(sky, 0, 0, W, H);
    ctx.fillStyle = "rgba(8,8,18,0.18)";
    ctx.fillRect(0, 0, W, H);
  } else {
    ctx.fillStyle = "#081018";
    ctx.fillRect(0, 0, W, H);
  }
  for (const e of w.enemies) {
    if (!e.alive) continue;
    ctx.fillStyle = e.kind % 2 === 0 ? PINK : BLUE;
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 12;
    if (e.kind === 0) ctx.fillRect(e.x - 12, e.y - 8, 24, 16);
    else if (e.kind === 1) {
      ctx.beginPath();
      ctx.moveTo(e.x, e.y - 10);
      ctx.lineTo(e.x + 14, e.y + 10);
      ctx.lineTo(e.x - 14, e.y + 10);
      ctx.fill();
    } else if (e.kind === 2) {
      ctx.beginPath();
      ctx.arc(e.x, e.y, 11, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(e.x - 14, e.y - 6, 28, 12);
      ctx.fillRect(e.x - 6, e.y - 14, 12, 28);
    }
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#0b0b12";
    ctx.font = "9px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(String(POINTS[e.kind]), e.x, e.y + 3);
  }
  if (w.boss) {
    const b = w.boss;
    const pulse = 0.55 + Math.sin(b.phase * 4) * 0.2;
    ctx.save();
    ctx.globalAlpha = pulse;
    ctx.strokeStyle = "#ff2a2a";
    ctx.shadowColor = "#ffe000";
    ctx.shadowBlur = 22;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r + 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    drawBossShip(ctx, b.who, b.x, b.y, b.r * 2.55, "down");
    const barW = 110;
    const ratio = Math.max(0, b.hp / b.maxHp);
    ctx.fillStyle = "rgba(10,6,16,0.75)";
    ctx.fillRect(b.x - barW / 2, b.y - b.r - 22, barW, 8);
    ctx.fillStyle = ratio > 0.4 ? "#ff2a2a" : "#ffe000";
    ctx.fillRect(b.x - barW / 2, b.y - b.r - 22, barW * ratio, 8);
    ctx.strokeStyle = "#ffe000";
    ctx.strokeRect(b.x - barW / 2, b.y - b.r - 22, barW, 8);
    ctx.fillStyle = "#ffe000";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("BOSS", b.x, b.y - b.r - 26);
  }
  if (w.heart) drawLifeHeart(ctx, w.heart.x, w.heart.y);
  for (const s of w.shots) {
    if (s.from === "them") {
      ctx.fillStyle = PINK;
      ctx.fillRect(s.x - 2, s.y - 8, 4, 12);
      continue;
    }
    const pal = beamPaint(s.hue);
    const len = s.from === "boss" ? 28 : 26;
    const dir = s.from === "boss" ? 1 : -1;
    ctx.save();
    ctx.shadowColor = pal.glow;
    ctx.shadowBlur = 16;
    ctx.fillStyle = pal.glow;
    ctx.fillRect(s.x - 2.5, dir > 0 ? s.y : s.y - len, 5, len);
    ctx.fillStyle = pal.core;
    ctx.fillRect(s.x - 1, dir > 0 ? s.y : s.y - len, 2, len);
    ctx.restore();
  }
  for (const p of w.pops) {
    const a = Math.max(0, p.life);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 16 + (1 - a) * 26, 0, Math.PI * 2);
    ctx.strokeStyle = "#f4ead8";
    ctx.lineWidth = 3;
    ctx.shadowColor = PINK;
    ctx.shadowBlur = 16;
    ctx.stroke();
    ctx.shadowBlur = 0;
    for (let i = 0; i < p.sparks.length; i++) {
      const sp = p.sparks[i]!;
      ctx.fillStyle = i % 2 ? BLUE : PINK;
      ctx.fillRect(sp.x, sp.y, 3, 3);
    }
    if (p.pts > 0) {
      ctx.fillStyle = "#f4ead8";
      ctx.font = "bold 22px serif";
      ctx.textAlign = "center";
      ctx.fillText("+" + p.pts, p.x, p.y - 16 - (1 - a) * 24);
    }
    ctx.restore();
  }
  const flash = w.invuln > 0 && Math.floor(w.invuln * 12) % 2 === 0;
  if (pilot && !flash) drawShip(ctx, pilot, w.shipX, H - 58, face);
  if (w.phase === "wave") {
    const secs = Math.ceil(w.clock);
    ctx.save();
    ctx.textAlign = "center";
    ctx.font = "800 28px Audiowide, sans-serif";
    ctx.lineJoin = "round";
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#ff2bd6";
    ctx.fillStyle = secs <= 5 ? "#ff2bd6" : "#3cf0ff";
    ctx.strokeText(String(secs), W / 2, 34);
    ctx.fillText(String(secs), W / 2, 34);
    ctx.restore();
  }
  if (w.over) {
    ctx.fillStyle = "rgba(10,6,16,0.5)";
    ctx.fillRect(0, 0, W, H);
    drawLoseCall(ctx, W, H);
  } else if (w.banner > 0 && w.call === "boss") {
    drawNeonBanner(ctx, "BOSS", W / 2, H / 2, "#ff2a2a", "#ffe000", 64);
  } else if (w.banner > 0) {
    drawLevelCall(ctx, w.level, W, H);
  }
}

export function drawLifeHeart(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1.15, 1.15);
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

declare global {
  interface Window {
    __armadaTest?: {
      skipToLevel: (level: number) => void;
      getPhase: () => string;
      getBoss: () => { hp: number; maxHp: number; who: string } | null;
      fire: () => void;
      hues: () => string[];
    };
  }
}

