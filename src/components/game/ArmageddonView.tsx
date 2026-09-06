import { Button } from "@/components/ui/button";
import { CHARACTERS } from "@/game/characters";
import { playPortrait } from "@/game/play-art";
import { drawLevelCall, drawLoseCall } from "@/game/neon-banner";
import { drawShip, preloadShips } from "@/game/ships";
import { hushMusic, playBlast, playChime, playClick, playLaser, setAmbient, unlockAudio } from "@/game/audio";
import { useGame } from "@/game/store";
import type { CharacterId } from "@/game/types";
import { useEffect, useRef, useState } from "react";
import { RosterPick } from "./RosterPick";
import { Hearts } from "./Hearts";
import { SoundToggle } from "@/components/ui/sound-toggle";
import { lockCanvasBox } from "@/game/pin-frame";
import { NeonAct, NeonArrow, PadDock } from "./NeonPads";

const HI_KEY = "nevaeh-armageddon-hi";
const W = 480;
const H = 640;
const PINK = "#ff4ae0";
const BLUE = "#3cf0ff";

type EnemyKind = 0 | 1 | 2 | 3;
const POINTS: Record<EnemyKind, number> = { 0: 10, 1: 20, 2: 40, 3: 80 };
const SKIES = [
  "/art/skies/sky1.jpg",
  "/art/skies/sky2.jpg",
  "/art/skies/sky3.jpg",
  "/art/skies/sky4.jpg",
];

type Enemy = { x: number; y: number; kind: EnemyKind; alive: boolean };
type Shot = { x: number; y: number; vy: number; from: "you" | "them" };
type Pop = {
  x: number;
  y: number;
  pts: number;
  life: number;
  sparks: { x: number; y: number; vx: number; vy: number }[];
};

type World = {
  shipX: number;
  enemies: Enemy[];
  shots: Shot[];
  pops: Pop[];
  dir: 1 | -1;
  score: number;
  lives: number;
  level: number;
  clock: number;
  banner: number;
  invuln: number;
  over: boolean;
  heart: { x: number; y: number; vx: number; vy: number } | null;
  heartGone: boolean;
};

function makeWave(level: number): Enemy[] {
  const rows = level <= 1 ? 2 : level === 2 ? 3 : 3 + Math.min(2, Math.floor((level - 1) / 3));
  const cols = level <= 2 ? 6 : 7;
  const list: Enemy[] = [];
  const gap = 52;
  const startX = (W - (cols - 1) * gap) / 2;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const kind = Math.min(3, r + (level > 4 ? 1 : 0)) as EnemyKind;
      list.push({ x: startX + c * gap, y: 56 + r * 38, kind, alive: true });
    }
  }
  return list;
}

function blank(level: number, score: number, lives: number): World {
  return {
    shipX: W / 2,
    enemies: makeWave(level),
    shots: [],
    pops: [],
    dir: 1,
    score,
    lives,
    level,
    clock: 30,
    banner: 1.8,
    invuln: 0,
    over: false,
    heart: null,
    heartGone: false,
  };
}

export function ArmageddonView() {
  const [who, setWho] = useState<CharacterId | null>(null);
  const [hi, setHi] = useState(() => Number(localStorage.getItem(HI_KEY) || 0));
  const [hud, setHud] = useState({ score: 0, lives: 3, level: 1, over: false });
  const [stage] = useState(() => lockCanvasBox(W, H, 188, "armada"));
  const hudRef = useRef(hud);
  const world = useRef<World>(blank(1, 0, 3));
  const keys = useRef({ left: false, right: false, fire: false });
  const cool = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const faceRef = useRef<HTMLImageElement | null>(null);
  const whoRef = useRef<CharacterId | null>(null);
  const skies = useRef<HTMLImageElement[]>([]);

  useEffect(() => {
    preloadShips(["nancy", ...CHARACTERS.map((c) => c.id)]);
  }, []);

  useEffect(() => {
    if (!who) {
      unlockAudio();
      setAmbient("armada");
      return;
    }
    hushMusic();
    skies.current = SKIES.map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });
    preloadShips([who, "nancy"]);
  }, [who]);

  useEffect(() => {
    if (!who) return;
    whoRef.current = who;
    const img = new Image();
    const face = playPortrait(who);
    img.src = face;
    faceRef.current = img;
    world.current = blank(1, 0, 3);
    setHud({ score: 0, lives: 3, level: 1, over: false });
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
        w.banner = Math.max(0, w.banner - dt);
        w.clock = Math.max(0, w.clock - dt);
        w.invuln = Math.max(0, w.invuln - dt);
        if (keys.current.left) w.shipX -= 240 * dt;
        if (keys.current.right) w.shipX += 240 * dt;
        w.shipX = Math.max(28, Math.min(W - 28, w.shipX));
        cool.current -= dt;
        const yourShots = w.shots.filter((s) => s.from === "you").length;
        if (keys.current.fire && cool.current <= 0 && w.banner <= 0.2 && yourShots < 4) {
          w.shots.push({ x: w.shipX, y: H - 88, vy: -720, from: "you" });
          cool.current = 0.07;
          playLaser();
        }
        let hitEdge = false;
        const speed = 18 + w.level * 4;
        for (const e of w.enemies) {
          if (!e.alive) continue;
          e.x += w.dir * speed * dt;
          if (e.x < 22 || e.x > W - 22) hitEdge = true;
        }
        if (hitEdge) {
          w.dir = w.dir === 1 ? -1 : 1;
          for (const e of w.enemies) {
            if (!e.alive) continue;
            e.y += 10;
            e.x += w.dir * 8;
          }
        }
        const theirShots = w.shots.filter((s) => s.from === "them").length;
        const shotCap = w.level <= 2 ? 1 : w.level <= 4 ? 2 : 3;
        if (theirShots < shotCap && Math.random() < 0.003 + w.level * 0.0008 && w.banner <= 0) {
          const live = w.enemies.filter((e) => e.alive);
          const fronts = live.filter((e) => !live.some((o) => o !== e && Math.abs(o.x - e.x) < 20 && o.y > e.y));
          const pool = fronts.length ? fronts : live;
          const shooter = pool[Math.floor(Math.random() * pool.length)];
          if (shooter) w.shots.push({ x: shooter.x, y: shooter.y + 12, vy: 140 + w.level * 10, from: "them" });
        }
        for (const s of w.shots) s.y += s.vy * dt;
        for (const p of w.pops) {
          p.life -= dt * 1.4;
          for (const sp of p.sparks) {
            sp.x += sp.vx * dt;
            sp.y += sp.vy * dt;
            sp.vy += 220 * dt;
          }
        }
        w.pops = w.pops.filter((p) => p.life > 0);
        w.shots = w.shots.filter((s) => s.y > -12 && s.y < H + 12);
        if (!w.heart && !w.heartGone && w.banner <= 0) {
          w.heart = { x: 40, y: 80, vx: 260, vy: 140 };
        }
        if (w.heart) {
          w.heart.x += w.heart.vx * dt;
          w.heart.y += w.heart.vy * dt;
          if (w.heart.x < 20 || w.heart.x > W - 20) w.heart.vx *= -1;
          if (w.heart.y < 40 || w.heart.y > H - 120) w.heart.vy *= -1;
          for (const s of w.shots) {
            if (s.from !== "you") continue;
            if (Math.abs(s.x - w.heart.x) < 16 && Math.abs(s.y - w.heart.y) < 16) {
              s.y = -99;
              if (w.lives < 3) w.lives += 1;
              w.heartGone = true;
              w.heart = null;
              break;
            }
          }
        }
        for (const s of w.shots) {
          if (s.from === "you") {
            for (const e of w.enemies) {
              if (!e.alive) continue;
              if (Math.abs(s.x - e.x) < 14 && Math.abs(s.y - e.y) < 12) {
                e.alive = false;
                s.y = -99;
                w.score += POINTS[e.kind];
                playBlast();
                const sparks = Array.from({ length: 14 }, () => {
                  const a = Math.random() * Math.PI * 2;
                  const spd = 80 + Math.random() * 180;
                  return { x: e.x, y: e.y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd };
                });
                w.pops.push({ x: e.x, y: e.y, pts: POINTS[e.kind], life: 1, sparks });
              }
            }
          } else if (w.invuln <= 0 && Math.abs(s.x - w.shipX) < 14 && Math.abs(s.y - (H - 70)) < 16) {
            s.y = H + 99;
            w.lives -= 1;
            w.invuln = 1.6;
            w.shots = w.shots.filter((shot) => shot.from === "you");
            if (w.lives <= 0) {
              w.over = true;
              const best = Math.max(w.score, Number(localStorage.getItem(HI_KEY) || 0));
              localStorage.setItem(HI_KEY, String(best));
              setHi(best);
            }
          }
        }
        for (const e of w.enemies) {
          if (!e.alive || w.invuln > 0) continue;
          if (Math.abs(e.x - w.shipX) < 22 && Math.abs(e.y - (H - 70)) < 24) {
            e.alive = false;
            w.lives -= 1;
            w.invuln = 1.6;
            if (w.lives <= 0) w.over = true;
          }
        }
        if (!w.over && w.enemies.every((e) => !e.alive) && w.pops.length === 0) {
          playChime();
          world.current = blank(w.level + 1, w.score + 80, w.lives);
        }
        if (!w.over && w.clock <= 0 && w.enemies.some((e) => e.alive)) {
          w.over = true;
          const best = Math.max(w.score, Number(localStorage.getItem(HI_KEY) || 0));
          localStorage.setItem(HI_KEY, String(best));
          setHi(best);
        }
      }
      const sky = skies.current[(world.current.level - 1) % SKIES.length];
      if (sky && sky.complete && sky.naturalWidth) {
        ctx.drawImage(sky, 0, 0, W, H);
        ctx.fillStyle = "rgba(8,8,18,0.18)";
        ctx.fillRect(0, 0, W, H);
      } else {
        ctx.fillStyle = "#081018";
        ctx.fillRect(0, 0, W, H);
      }
      for (const e of world.current.enemies) {
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
      if (world.current.heart) drawLifeHeart(ctx, world.current.heart.x, world.current.heart.y);
      for (const s of world.current.shots) {
        if (s.from === "you") {
          ctx.save();
          ctx.shadowColor = "#39ff14";
          ctx.shadowBlur = 16;
          ctx.fillStyle = "#39ff14";
          ctx.fillRect(s.x - 2, s.y - 18, 4, 26);
          ctx.fillStyle = "#eaffc8";
          ctx.fillRect(s.x - 1, s.y - 18, 2, 26);
          ctx.restore();
        } else {
          ctx.fillStyle = PINK;
          ctx.fillRect(s.x - 2, s.y - 8, 4, 12);
        }
      }
      for (const p of world.current.pops) {
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
        ctx.fillStyle = "#f4ead8";
        ctx.font = "bold 22px serif";
        ctx.textAlign = "center";
        ctx.fillText("+" + p.pts, p.x, p.y - 16 - (1 - a) * 24);
        ctx.restore();
      }
      const pilot = whoRef.current;
      const flash = world.current.invuln > 0 && Math.floor(world.current.invuln * 12) % 2 === 0;
      if (pilot && !flash) drawShip(ctx, pilot, world.current.shipX, H - 70, faceRef.current);
      if (pilot) {
        const label = CHARACTERS.find((c) => c.id === pilot)?.name ?? pilot;
        ctx.save();
        ctx.textAlign = "center";
        ctx.font = "700 16px Audiowide, sans-serif";
        ctx.lineWidth = 4;
        ctx.strokeStyle = "#ff2bd6";
        ctx.fillStyle = "#3cf0ff";
        ctx.strokeText(label, W / 2, H - 18);
        ctx.fillText(label, W / 2, H - 18);
        ctx.restore();
      }
      const secs = Math.ceil(world.current.clock);
      ctx.save();
      ctx.textAlign = "center";
      ctx.font = '800 28px Audiowide, sans-serif';
      ctx.lineJoin = "round";
      ctx.lineWidth = 6;
      ctx.strokeStyle = "#ff2bd6";
      ctx.fillStyle = secs <= 5 ? "#ff2bd6" : "#3cf0ff";
      ctx.strokeText(String(secs), W / 2, 34);
      ctx.fillText(String(secs), W / 2, 34);
      ctx.restore();
      if (world.current.over) {
        ctx.fillStyle = "rgba(10,6,16,0.5)";
        ctx.fillRect(0, 0, W, H);
        drawLoseCall(ctx, W, H);
      } else if (world.current.banner > 0) {
        drawLevelCall(ctx, world.current.level, W, H);
      }
      const next = {
        score: world.current.score,
        lives: world.current.lives,
        level: world.current.level,
        over: world.current.over,
      };
      const prev = hudRef.current;
      if (prev.score !== next.score || prev.lives !== next.lives || prev.level !== next.level || prev.over !== next.over) {
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
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [who]);

  if (!who) {
    return (
      <RosterPick
        title="Armageddon"
        blurb="Every character can fly. Each ship is a different hull. Neon pink and blue targets score 10, 20, 40, or 80. Levels get faster and change sky."
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
          className="touch-none"
          style={{ width: stage.w, height: stage.h }}
        />
      </div>
      <div className="flex h-24 shrink-0 items-center justify-center">
        {hud.over ? (
          <div className="flex justify-center gap-2">
            <Button
              variant="pink"
              onClick={() => {
                playClick();
                world.current = blank(1, 0, 3);
                setHud({ score: 0, lives: 3, level: 1, over: false });
              }}
            >
              Fly again
            </Button>
            <Button variant="ghost" onClick={() => setWho(null)}>
              New pilot
            </Button>
          </div>
        ) : (
          <PadDock className="relative z-10 mx-3 flex items-center justify-center gap-4">
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
