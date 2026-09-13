import { Button } from "@/components/ui/button";
import { FIGHTERS, fightAttackSheets, type FightFighterId } from "@/fight/engine";
import { STAGES, preloadStages, stageImage } from "@/fight/stages";
import { CHARACTERS } from "@/game/characters";
import { fightBody, playPortrait } from "@/game/play-art";
import {
  hushMusic,
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
import {
  H,
  LEVEL_SECS,
  SPRITE,
  W,
  advanceLevel,
  beginBoss,
  bossKind,
  newLeap,
  stepLeap,
  type Foe,
  type FoeKind,
  type LeapKeys,
  type LeapWorld,
} from "@/leap/engine";
import { drawLoseCall } from "@/game/neon-banner";
import { useEffect, useRef, useState } from "react";
import badTuxArt from "@/assets/civil/badtux.png";
import bladeArt from "@/assets/civil/blade.png";
import bruiserArt from "@/assets/civil/bruiser.png";
import capArt from "@/assets/civil/cap.png";
import dancerArt from "@/assets/civil/dancer.png";
import evilRosieArt from "@/assets/civil/evilrosie.png";
import jacketArt from "@/assets/civil/jacket.png";
import karenArt from "@/assets/civil/karen.png";
import mightyMurphyArt from "@/assets/civil/mightymurphy.png";
import miloMenaceArt from "@/assets/civil/milomenace.png";
import punkArt from "@/assets/civil/punk.png";
import { NeonAct, NeonArrow, PadDock } from "./NeonPads";
import { RosterPick } from "./RosterPick";
import { SoundToggle } from "@/components/ui/sound-toggle";

const HI_KEY = "nevaeh-civil-hi";

const CIVIL_ART: Record<string, string> = {
  punk: punkArt,
  jacket: jacketArt,
  blade: bladeArt,
  dancer: dancerArt,
  cap: capArt,
  bruiser: bruiserArt,
  karen: karenArt,
  evilrosie: evilRosieArt,
  badtux: badTuxArt,
  mightymurphy: mightyMurphyArt,
  milomenace: miloMenaceArt,
};

function loadImg(src: string) {
  const img = new Image();
  img.decoding = "sync";
  img.src = src;
  return img;
}

if (typeof window !== "undefined") {
  for (const src of Object.values(CIVIL_ART)) loadImg(src);
}

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

export function LeapView() {
  const [who, setWho] = useState<CharacterId | null>(null);
  useEffect(() => {
    unlockAudio();
    if (!who) setAmbient("civil");
    else hushMusic();
    return () => {
      if (!who) hushMusic();
    };
  }, [who]);
  if (!who) {
    return (
      <RosterPick
        title="Civil War"
        blurb="Walk the street. Jump for hearts. The boss fight is best of three."
        onPick={setWho}
      />
    );
  }
  return <CivilPlay who={who} onPick={() => setWho(null)} />;
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

function CivilPlay({ who, onPick }: { who: CharacterId; onPick: () => void }) {
  const name = CHARACTERS.find((c) => c.id === who)?.name ?? who;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bodyRef = useRef<HTMLImageElement | null>(null);
  const atkRef = useRef<HTMLImageElement | null>(null);
  const bosses = useRef<Record<string, HTMLImageElement>>({});
  const thugs = useRef<Record<string, HTMLImageElement>>({});
  const world = useRef<LeapWorld>(newLeap());
  const keys = useRef<LeapKeys>({ ...EMPTY });
  const queued = useRef<("punch" | "kick" | "special" | "jump")[]>([]);
  const [hud, setHud] = useState({
    lives: 3,
    score: 0,
    level: 1,
    t: LEVEL_SECS,
    over: false,
    weapon: "",
    phase: "street",
    hold: false,
  });
  const [ready, setReady] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [hi, setHi] = useState(() => Number(localStorage.getItem(HI_KEY) || 0));
  const counting = useRef(false);

  useEffect(() => {
    preloadStages();
    const bag: Record<string, HTMLImageElement> = {};
    const pending: HTMLImageElement[] = [];
    for (const [id, src] of Object.entries(CIVIL_ART)) {
      const img = loadImg(src);
      bag[id] = img;
      pending.push(img);
    }
    thugs.current = bag;
    for (const id of ["samael", "zorath"] as const) {
      const img = loadImg(fightBody(id) || playPortrait(id));
      bosses.current[id] = img;
      pending.push(img);
    }
    setReady(false);
    const body = new Image();
    pending.push(body);
    const fid = (who in FIGHTERS ? who : (DONOR[who] ?? "nancy")) as FightFighterId;
    const sheets = fightAttackSheets();
    atkRef.current = sheets[fid] ?? null;
    const mark = () => {
      if (pending.every((p) => p.complete)) {
        bodyRef.current = body.naturalWidth ? body : bodyRef.current;
        setReady(true);
      }
    };
    for (const p of pending) {
      if (p.complete) continue;
      p.onload = mark;
      p.onerror = mark;
    }
    body.onload = () => {
      bodyRef.current = body;
      mark();
    };
    body.onerror = () => {
      const face = new Image();
      face.onload = () => {
        bodyRef.current = face;
        mark();
      };
      face.src = playPortrait(who);
    };
    body.src = bodySrc(who);
    if (body.complete && body.naturalWidth) {
      bodyRef.current = body;
      mark();
    }
  }, [who]);

  useEffect(() => {
    if (!ready) return;
    world.current = newLeap();
    world.current.hero = who;
    unlockAudio();
    setAmbient("civil");
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(1 / 30, (now - last) / 1000);
      last = now;
      const w = world.current;
      if (w.phase === "clear" && !counting.current) {
        counting.current = true;
        runCountdown(w.level + 1 >= 8, () => {
          advanceLevel(w);
          counting.current = false;
          setCount(null);
        });
      }
      if (!counting.current && w.phase !== "clear") {
        const k: LeapKeys = { ...keys.current, punch: false, kick: false, special: false, up: keys.current.up };
        const next = queued.current.shift();
        if (next === "jump") k.up = true;
        else if (next) k[next] = true;
        if (w.phase === "intro" && !counting.current) {
          counting.current = true;
          setCount(3);
          window.setTimeout(() => setCount(2), 1000);
          window.setTimeout(() => setCount(1), 2000);
          window.setTimeout(() => {
            beginBoss(w);
            counting.current = false;
            setCount(null);
          }, 3000);
        }
        const events = stepLeap(w, dt, k);
        for (const ev of events) {
          if (ev === "punch") playPunch();
          if (ev === "kick") playKick();
          if (ev === "special") playSpecial();
          if (ev === "landPunch") playPunch();
          if (ev === "landKick") playKick();
          if (ev === "landSpecial") playSpecial();
          if (ev === "hit") playHit();
          if (ev === "life") playHeal();
          if (ev === "die") playKo();
          if (ev === "clear" || ev === "grab" || ev === "boss") playOrb();
        }
      }
      if (w.over) {
        const best = Math.max(w.score, Number(localStorage.getItem(HI_KEY) || 0));
        localStorage.setItem(HI_KEY, String(best));
        setHi(best);
      }
      drawCivil(ctx, w, bodyRef.current, atkRef.current, bosses.current, thugs.current, name);
      const nextHud = {
        lives: w.lives,
        score: w.score,
        level: w.level,
        t: Math.ceil(w.t),
        over: w.over,
        weapon: w.weapon ?? "",
        phase: w.phase,
        hold: counting.current,
      };
      setHud((prev) =>
        prev.lives === nextHud.lives &&
        prev.score === nextHud.score &&
        prev.level === nextHud.level &&
        prev.t === nextHud.t &&
        prev.over === nextHud.over &&
        prev.weapon === nextHud.weapon &&
        prev.phase === nextHud.phase &&
        prev.hold === nextHud.hold
          ? prev
          : nextHud,
      );
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    const down = (e: KeyboardEvent) => {
      if (e.code === "ArrowLeft" || e.code === "KeyA") keys.current.left = true;
      if (e.code === "ArrowRight" || e.code === "KeyD") keys.current.right = true;
      if (e.code === "ArrowUp" || e.code === "KeyW") {
        keys.current.up = true;
        queued.current.push("jump");
      }
      if (e.code === "ArrowDown" || e.code === "KeyS") keys.current.down = true;
      if (e.code === "KeyJ" || e.code === "KeyZ") queued.current.push("punch");
      if (e.code === "KeyK" || e.code === "KeyX") queued.current.push("kick");
      if (e.code === "KeyL" || e.code === "KeyC" || e.code === "Space") {
        e.preventDefault();
        queued.current.push("special");
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

    function runCountdown(final: boolean, done: () => void) {
      setCount(3);
      window.setTimeout(() => setCount(2), 1000);
      window.setTimeout(() => setCount(1), 2000);
      window.setTimeout(done, 3000);
      void final;
    }
  }, [ready]);

  const hold = (key: keyof LeapKeys, on: boolean) => {
    keys.current[key] = on;
  };
  const tap = (which: "punch" | "kick" | "special") => {
    queued.current.push(which);
  };

  return (
    <div
      className="relative flex h-svh max-h-svh min-h-0 flex-col overflow-hidden bg-ink text-parchment"
      style={{ position: "fixed", inset: 0, overscrollBehavior: "none", touchAction: "none" }}
    >
      <div className="game-chrome pointer-events-auto relative z-20 flex shrink-0 items-center justify-between gap-2 px-3 py-1 pt-[max(0.35rem,env(safe-area-inset-top))]">
        <div className="flex items-center gap-1">
          <Button variant="quiet" className="px-3" onClick={() => useGame.getState().backToTitle()}>
            Main Menu
          </Button>
          <Button variant="quiet" className="px-3" onClick={onPick}>
            Lobby
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <SoundToggle />
          <Button variant="quiet" className="px-3" onClick={onPick}>
            Change
          </Button>
        </div>
      </div>
      {hud.over ? null : (
        <p
          className="shrink-0 pb-0.5 text-center font-display text-2xl font-extrabold tracking-wide"
          style={{ color: "#ff2bd6", WebkitTextStroke: "3px #12d8ff", paintOrder: "stroke fill" }}
        >
          Level {hud.level}
        </p>
      )}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="absolute inset-0 m-auto h-full w-full max-h-full max-w-full touch-none object-contain object-center"
          style={{ touchAction: "none" }}
        />
        {count !== null ? <CountFlash n={count} title={hud.phase === "intro" ? "FIGHT THE BOSS!" : hud.level >= 7 ? "FINAL BATTLE" : "NEXT LEVEL"} /> : null}
        {hud.over ? (
          <div className="pointer-events-auto absolute inset-x-0 bottom-4 z-20 flex justify-center gap-2">
            <Button
              variant="pink"
              onClick={() => {
                playClick();
                world.current = newLeap();
                world.current.hero = who;
                counting.current = false;
                setCount(null);
                setHud({ lives: 3, score: 0, level: 1, t: LEVEL_SECS, over: false, weapon: "", phase: "street", hold: false });
              }}
            >
              Fight again
            </Button>
            <Button variant="ghost" onClick={onPick}>
              New fighter
            </Button>
          </div>
        ) : null}
      </div>
      {!hud.over ? (
        <PadDock className="pointer-events-auto relative z-30 mx-2 mb-[max(0.35rem,env(safe-area-inset-bottom))] mt-1 flex shrink-0 items-end justify-between gap-4">
          <div className="pointer-events-auto grid shrink-0 grid-cols-3 place-items-center gap-1.5">
            <span className="size-14" />
            <NeonArrow dir="up" tone="blue" onDown={() => { hold("up", true); queued.current.push("jump"); }} onUp={() => hold("up", false)} />
            <span className="size-14" />
            <NeonArrow dir="left" tone="pink" onDown={() => hold("left", true)} onUp={() => hold("left", false)} />
            <NeonArrow dir="down" tone="blue" onDown={() => hold("down", true)} onUp={() => hold("down", false)} />
            <NeonArrow dir="right" tone="pink" onDown={() => hold("right", true)} onUp={() => hold("right", false)} />
          </div>
          <div className="pointer-events-auto flex shrink-0 flex-col items-center gap-1.5">
            <NeonAct label="Special" kind="blue" mark="S" onDown={() => tap("special")} />
            <div className="flex items-center gap-2">
              <NeonAct label="Jab" kind="blue" onDown={() => tap("punch")} />
              <NeonAct label="Kick" kind="pink" onDown={() => tap("kick")} />
            </div>
          </div>
        </PadDock>
      ) : null}
    </div>
  );
}

function CountFlash({ n, title }: { n: number; title: string }) {
  const pink = n % 2 === 0;
  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center">
      <div className="text-center">
        <p
          className="font-display text-2xl tracking-[0.16em]"
          style={{
            color: title.includes("BOSS") ? "#ff2bd6" : "#3cf0ff",
            WebkitTextStroke: title.includes("BOSS") ? "3px #12d8ff" : "3px #ff2bd6",
            paintOrder: "stroke fill",
          }}
        >
          {title}
        </p>
        <p
          className="font-display text-8xl leading-none"
          style={{
            color: pink ? "#ff2bd6" : "#12d8ff",
            WebkitTextStroke: "6px " + (pink ? "#12d8ff" : "#ff2bd6"),
            paintOrder: "stroke fill",
          }}
        >
          {n}
        </p>
      </div>
    </div>
  );
}

function drawCivil(
  ctx: CanvasRenderingContext2D,
  w: LeapWorld,
  body: HTMLImageElement | null,
  sheet: HTMLImageElement | null,
  bosses: Record<string, HTMLImageElement>,
  thugs: Record<string, HTMLImageElement>,
  name: string,
) {
  const home = (Math.max(1, w.level) - 1) % STAGES.length;
  const art = stageImage(STAGES[home]!.id);
  ctx.fillStyle = "#100e0c";
  ctx.fillRect(0, 0, W, H);
  if (art && art.complete && art.naturalWidth) {
    const nw = art.naturalWidth;
    const nh = art.naturalHeight;
    const cover = Math.max(W / nw, H / nh) * 1.04;
    const dw = nw * cover;
    const dh = nh * cover;
    const oy = (H - dh) / 2;
    const span = dw * 2;
    let ox = -((w.cam * 0.32) % span);
    if (ox > 0) ox -= span;
    const blit = (x: number, flip: boolean) => {
      ctx.save();
      if (flip) {
        ctx.translate(x + dw, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(art, 0, oy, dw, dh);
      } else {
        ctx.drawImage(art, x, oy, dw, dh);
      }
      ctx.restore();
    };
    blit(ox, false);
    blit(ox + dw, true);
    blit(ox + span, false);
    blit(ox + span + dw, true);
  }

  const streetY = 560;
  const sx = (wx: number) => wx - w.cam;

  for (const p of w.loot) {
    const x = sx(p.x);
    if (x < -60 || x > W + 60) continue;
    const rising = p.taken;
    const pulse = rising ? 1 : 0.55 + Math.sin(w.t * 8) * 0.45;
    ctx.save();
    ctx.globalAlpha = rising ? Math.max(0, 1 - p.flash) : 1;
    ctx.font = rising ? "88px sans-serif" : "72px sans-serif";
    ctx.textAlign = "center";
    ctx.shadowColor = pulse > 0.85 || rising ? "#fff" : "transparent";
    ctx.shadowBlur = pulse > 0.85 || rising ? 24 : 0;
    ctx.fillText("❤️", x, p.y);
    ctx.restore();
  }

  for (const s of w.shots) {
    const x = sx(s.x);
    if (x < -40 || x > W + 40) continue;
    if (s.from === "you") {
      drawHeroSpecial(ctx, x, s.y, s.who);
      continue;
    }
    const g = ctx.createRadialGradient(x, s.y, 4, x, s.y, 28);
    g.addColorStop(0, "#fff4c8");
    g.addColorStop(0.35, "#ff7a18");
    g.addColorStop(1, "rgba(180,20,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, s.y, 30, 16, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const f of w.foes) {
    const x = sx(f.x);
    if (x < -120 || x > W + 120) continue;
    const artBoss = f.kind === "samael" || f.kind === "zorath" ? bosses[f.kind] : null;
    const thug = thugs[f.kind];
    const sprite = artBoss && artBoss.naturalWidth ? artBoss : thug && thug.naturalWidth ? thug : null;
    if (!sprite) continue;
    ctx.save();
    const falling = f.dead > 0 && !f.boss;
    const koFlash = f.dead > 0 && f.boss;
    ctx.globalAlpha = falling ? Math.max(0, 1 - f.dead * 1.15) : koFlash && Math.floor(w.roundHold * 8) % 2 === 0 ? 0.2 : 1;
    ctx.translate(x, streetY + (falling ? f.dead * 90 : 0));
    ctx.scale(f.face < 0 ? 1 : -1, 1);
    if (falling) ctx.rotate(1.25 * Math.min(1, f.dead * 2.2));
    else if (f.attackT > 0.22 && f.attackT < 0.5) ctx.translate(16, -4);
    ctx.fillStyle = "rgba(8,6,10,0.4)";
    ctx.beginPath();
    ctx.ellipse(0, 4, 48 * f.scale, 11 * f.scale, 0, 0, Math.PI * 2);
    ctx.fill();
    if (!falling && (f.kind === "evilrosie" || f.kind === "badtux" || f.kind === "mightymurphy" || f.kind === "milomenace")) {
      const pulse = 0.55 + Math.sin(w.t * 5 + f.x * 0.01) * 0.12;
      const rad = SPRITE * 0.42 * f.scale;
      const aura = ctx.createRadialGradient(0, -SPRITE * 0.45 * f.scale, 10, 0, -SPRITE * 0.38 * f.scale, rad);
      aura.addColorStop(0, `rgba(255,40,30,${0.28 * pulse})`);
      aura.addColorStop(0.35, `rgba(140,0,40,${0.22 * pulse})`);
      aura.addColorStop(1, "rgba(40,0,20,0)");
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.ellipse(0, -SPRITE * 0.38 * f.scale, rad * 0.72, rad, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    drawSprite(ctx, sprite, f.boss ? 450 : 400, f.boss ? 1.22 : 1);
    ctx.restore();
  }

  const hurt = w.invuln > 0 || w.phase === "round";
  ctx.save();
  ctx.globalAlpha = hurt && Math.floor((w.phase === "round" ? w.roundHold : w.invuln) * 10) % 2 === 0 ? 0.25 : 1;
  ctx.translate(sx(w.x), w.y);
    ctx.fillStyle = "rgba(8,6,10,0.4)";
    ctx.beginPath();
    ctx.ellipse(0, 4, 56, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.scale(w.face, 1);
    const dh = 400;
    const walk = Math.abs(w.vx) > 30 && !w.attack;
    const bob = walk ? Math.sin(w.t * 10) * 3 : 0;
    ctx.translate(0, bob);
    const useSheet = w.attack && sheet && sheet.naturalWidth > 80;
    if (useSheet && sheet) {
      const cw = sheet.naturalWidth / 2;
      const ch = sheet.naturalHeight / 2;
      const idx = w.attack === "kick" ? 3 : w.attack === "special" ? 1 : 0;
      const sx0 = (idx % 2) * cw;
      const sy0 = Math.floor(idx / 2) * ch;
      const dw = Math.min(SPRITE * 0.78, cw * (dh / ch));
      ctx.drawImage(sheet, sx0, sy0, cw, ch, -dw / 2 + 16, -dh + 6, dw, dh);
    } else if (body && body.naturalWidth) {
      const dw = Math.min(SPRITE * 0.72, body.naturalWidth * (dh / body.naturalHeight));
      ctx.drawImage(body, -dw / 2 + (w.attack ? 16 : 0), -dh + 6, dw, dh);
    }
    ctx.restore();

  energyBar(ctx, 36, 18, 420, 28, w.hp / w.maxHp, "#ff4ae0");
  drawSpecialBalls(ctx, 36 + 420, 56, w.specials, 5);
  ctx.fillStyle = "#f4ead8";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.font = "700 28px 'Cormorant Garamond', serif";
  ctx.fillText(name.toUpperCase(), 36, 92);
  if (w.phase === "boss" || w.phase === "round" || w.phase === "intro") {
    drawLifeHearts(ctx, 36, 102, w.youRounds, 2, "left");
  }
  const boss = w.foes.find((f) => f.boss);
  if (boss || w.phase === "boss" || w.phase === "round" || w.phase === "intro") {
    const pct = boss ? Math.max(0, boss.hp / boss.max) : 0;
    energyBar(ctx, W - 456, 18, 420, 28, pct, "#12d8ff");
    drawSpecialBalls(ctx, W - 36, 56, w.bossSpecials, 5);
    ctx.fillStyle = "#f4ead8";
    ctx.textAlign = "right";
    ctx.font = "700 28px 'Cormorant Garamond', serif";
    const kind = boss?.kind ?? bossKind(w.level);
    const label =
      kind === "karen"
        ? "THE KAREN"
        : kind === "evilrosie"
          ? "EVIL ROSIE"
          : kind === "badtux"
            ? "BAD TUX"
            : kind === "mightymurphy"
              ? "MIGHTY MURPHY"
              : kind === "milomenace"
                ? "MILO THE MENACE"
                : kind === "samael"
                  ? "SAMAEL"
                  : kind === "zorath"
                    ? "ZORATH"
                    : kind.toUpperCase();
    ctx.fillText(label, W - 36, 92);
    drawLifeHearts(ctx, W - 36, 102, w.bossRounds, 2, "right");
  }

  if (w.over) {
    ctx.fillStyle = "rgba(10,6,16,0.5)";
    ctx.fillRect(0, 0, W, H);
    drawLoseCall(ctx, W, H);
  }
}

function drawSpecialBalls(
  ctx: CanvasRenderingContext2D,
  barEnd: number,
  y: number,
  n: number,
  max: number,
) {
  const r = 9;
  const gap = 22;
  for (let i = 0; i < max; i++) {
    const cx = barEnd - r - i * gap;
    const on = i < n;
    const g = ctx.createRadialGradient(cx - 3, y - 3, 2, cx, y, 11);
    g.addColorStop(0, on ? "#e8ffff" : "rgba(18,216,255,0.12)");
    g.addColorStop(0.45, on ? "#12d8ff" : "rgba(18,216,255,0.08)");
    g.addColorStop(1, on ? "#086a88" : "rgba(18,216,255,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = on ? "#7af0ff" : "rgba(18,216,255,0.35)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function drawLifeHearts(ctx: CanvasRenderingContext2D, x: number, y: number, n: number, max: number, align: "left" | "right") {
  ctx.save();
  ctx.font = "26px sans-serif";
  ctx.textBaseline = "top";
  ctx.textAlign = align;
  const gap = 28;
  for (let i = 0; i < max; i++) {
    ctx.globalAlpha = i < n ? 1 : 0.22;
    ctx.fillText("❤️", align === "left" ? x + i * gap : x - i * gap, y);
  }
  ctx.restore();
}

function drawHeroSpecial(ctx: CanvasRenderingContext2D, x: number, y: number, who: string) {
  ctx.save();
  if (who === "nancy") glowBall(ctx, x, y, 20, "#ff4ae0", "#12d8ff");
  else if (who === "veronika") glowBall(ctx, x, y, 22, "#ffffff", "#3cf0ff");
  else if (who === "ronnie") glowBall(ctx, x, y, 22, "#ffb070", "#c4281c");
  else if (who === "murphy") {
    ctx.fillStyle = "#6a6a72";
    ctx.beginPath();
    ctx.ellipse(x, y, 16, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 12, y - 2, 7, 0, Math.PI * 2);
    ctx.fill();
  } else if (who === "rosie") {
    ctx.fillStyle = "#e8b04a";
    ctx.beginPath();
    ctx.arc(x, y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();
  } else if (who === "tux") {
    ctx.fillStyle = "#e8e8ee";
    ctx.beginPath();
    ctx.ellipse(x, y, 12, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1a1a1e";
    ctx.beginPath();
    ctx.arc(x + 8, y - 2, 5, 0, Math.PI * 2);
    ctx.fill();
  } else if (who === "milo") {
    ctx.strokeStyle = "#f4ead8";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x - 14, y);
    ctx.lineTo(x + 14, y);
    ctx.stroke();
  } else if (who === "sarah") glowBall(ctx, x, y, 18, "#ffe9a8", "#d4a54a");
  else if (who === "adamus") glowBall(ctx, x, y, 20, "#c5c8d0", "#6b5b8c");
  else if (who === "mira") glowBall(ctx, x, y, 18, "#b8ffd4", "#3a6a48");
  else if (who === "sananda") glowBall(ctx, x, y, 20, "#fff4b0", "#d4a54a");
  else if (who === "lena") glowBall(ctx, x, y, 18, "#ffd0e8", "#ff2bd6");
  else if (who === "eliav") glowBall(ctx, x, y, 18, "#d0e8ff", "#2a6aaa");
  else if (who === "nadav") glowBall(ctx, x, y, 18, "#e8d0ff", "#6b5b8c");
  else if (who === "olivia") glowBall(ctx, x, y, 18, "#fff", "#c5c8d0");
  else if (who === "geraldine") glowBall(ctx, x, y, 18, "#ffd8a8", "#8a6a2e");
  else if (who === "sophie") glowBall(ctx, x, y, 16, "#ffc0e8", "#ff4ae0");
  else if (who === "harlan") glowBall(ctx, x, y, 20, "#d8c898", "#4a4038");
  else if (who === "zorath") glowBall(ctx, x, y, 22, "#3a1048", "#ff2bd6");
  else if (who === "samael") glowBall(ctx, x, y, 22, "#1a0a12", "#c4281c");
  else glowBall(ctx, x, y, 18, "#12d8ff", "#ff2bd6");
  ctx.restore();
}

function glowBall(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, a: string, b: string) {
  const g = ctx.createRadialGradient(x, y, 2, x, y, r);
  g.addColorStop(0, a);
  g.addColorStop(1, b);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function energyBar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, t: number, color: string) {
  ctx.fillStyle = "#1a1612";
  ctx.fillRect(x - 3, y - 3, w + 6, h + 6);
  ctx.fillStyle = color + "55";
  ctx.fillRect(x - 6, y - 4, w + 12, h + 8);
  ctx.fillStyle = "#22181c";
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = color;
  ctx.fillRect(x, y, Math.max(0, w * t), h);
}

function drawSprite(ctx: CanvasRenderingContext2D, img: HTMLImageElement, h: number, wide = 1) {
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  const dw = Math.min(h * 0.62 * wide, img.naturalWidth * (h / img.naturalHeight) * wide);
  ctx.drawImage(img, -dw / 2, -h + 6, dw, h);
}

function drawThug(ctx: CanvasRenderingContext2D, f: Foe) {
  const pal = palette(f.kind);
  const hit = f.hit > 0;
  const s = SPRITE;
  ctx.fillStyle = hit ? "#ffffff" : pal.pants;
  ctx.fillRect(-s * 0.22, -s * 0.38, s * 0.44, s * 0.3);
  ctx.fillStyle = hit ? "#ffffff" : pal.shirt;
  ctx.fillRect(-s * 0.26, -s * 0.72, s * 0.52, s * 0.38);
  ctx.fillStyle = pal.skin;
  ctx.fillRect(-s * 0.18, -s * 0.96, s * 0.36, s * 0.28);
  ctx.fillStyle = pal.hair;
  ctx.fillRect(-s * 0.2, -s + 2, s * 0.4, s * 0.14);
  if (f.kind === "cap") {
    ctx.fillStyle = pal.accent;
    ctx.fillRect(-s * 0.22, -s - 4, s * 0.44, 12);
    ctx.fillRect(s * 0.08, -s - 4, s * 0.18, 7);
  }
  if (f.kind === "jacket") {
    ctx.fillStyle = pal.accent;
    ctx.fillRect(-s * 0.3, -s * 0.72, s * 0.1, s * 0.38);
    ctx.fillRect(s * 0.2, -s * 0.72, s * 0.1, s * 0.38);
  }
  if (f.kind === "blade") {
    ctx.fillStyle = "#d8e4ef";
    ctx.fillRect(s * 0.22, -s * 0.58, s * 0.28, 6);
  }
  if (f.kind === "dancer") {
    ctx.fillStyle = pal.accent;
    ctx.fillRect(-s * 0.1, -s * 0.5, 10, 10);
    ctx.fillRect(s * 0.02, -s * 0.5, 10, 10);
  }
  ctx.fillStyle = pal.boot;
  ctx.fillRect(-s * 0.22, -s * 0.1, s * 0.18, s * 0.1);
  ctx.fillRect(s * 0.04, -s * 0.1, s * 0.18, s * 0.1);
}

function palette(kind: FoeKind) {
  if (kind === "punk") return { shirt: "#ff2bd6", pants: "#1a1020", hair: "#12d8ff", skin: "#e8b896", accent: "#39ff14", boot: "#111" };
  if (kind === "jacket") return { shirt: "#1a2a44", pants: "#121018", hair: "#3a2418", skin: "#c48a62", accent: "#12d8ff", boot: "#222" };
  if (kind === "blade") return { shirt: "#2a1018", pants: "#1a1210", hair: "#111", skin: "#d4a07a", accent: "#c4281c", boot: "#111" };
  if (kind === "dancer") return { shirt: "#12d8ff", pants: "#ff2bd6", hair: "#f5e6a8", skin: "#f0c4a0", accent: "#fff", boot: "#ff2bd6" };
  if (kind === "cap") return { shirt: "#2a4a28", pants: "#1a2018", hair: "#3a2418", skin: "#c49a72", accent: "#39ff14", boot: "#1a1a12" };
  if (kind === "bruiser") return { shirt: "#4a1230", pants: "#221018", hair: "#111", skin: "#b88860", accent: "#ff2bd6", boot: "#111" };
  if (kind === "zorath") return { shirt: "#3a2430", pants: "#1a1014", hair: "#111", skin: "#b08980", accent: "#c4281c", boot: "#111" };
  return { shirt: "#2a1018", pants: "#14080c", hair: "#111", skin: "#b08980", accent: "#c4281c", boot: "#111" };
}
