import { Button } from "@/components/ui/button";
import {
  bodyH,
  createMatch,
  CAREER,
  FIGHTERS,
  GROUND,
  H,
  MAX_HP,
  PLAYABLE,
  fightAttackSheets,
  fightFaces,
  preloadFightArt,
  step,
  W,
  type FightFighterId,
  type FightDiff,
  type FightInput,
  type FightState,
  type Fighter,
  type Projectile,
} from "@/fight/engine";
import { STAGES, careerStage, preloadStages, stageArt, stageImage, type StageId } from "@/fight/stages";
import { playPortrait } from "@/game/play-art";
import { WinnerSplash } from "./WinnerSplash";
import { hushMusic, playChime, playFightCall, playHeal, playKo, setAmbient, unlockAudio } from "@/game/audio";
import { useGame } from "@/game/store";
import { cn } from "@/lib/cn";
import { useEffect, useRef, useState, type MutableRefObject } from "react";
import { SoundToggle } from "@/components/ui/sound-toggle";
import { NeonAct, NeonArrow, PadDock } from "./NeonPads";

const HEROES: FightFighterId[] = PLAYABLE;

const EMPTY: FightInput = {
  left: false,
  right: false,
  up: false,
  down: false,
  punch: false,
  kick: false,
  special: false,
};

export function FightView() {
  useEffect(() => {
    unlockAudio();
    setAmbient("duel");
    preloadFightArt();
    preloadStages();
    return () => hushMusic();
  }, []);
  const [hero, setHero] = useState<FightFighterId | null>(null);
  const [foe, setFoe] = useState<FightFighterId | null>(null);
  const [stageId, setStageId] = useState<StageId>("brooklyn");
  const [ready, setReady] = useState(false);
  const [diff, setDiff] = useState<FightDiff>("normal");
  const [career, setCareer] = useState(false);
  const [rung, setRung] = useState(0);
  const [grand, setGrand] = useState(false);
  const [hold, setHold] = useState(false);

  const toLobby = () => {
    setHero(null);
    setFoe(null);
    setReady(false);
    setCareer(false);
    setRung(0);
    setGrand(false);
    setHold(false);
  };

  const advanceCareer = () => {
    const n = rung + 1;
    setHold(false);
    if (n >= CAREER.length) {
      setReady(false);
      setCareer(false);
      setFoe(null);
      setRung(0);
      return;
    }
    setRung(n);
    setFoe(CAREER[n]);
    setStageId(careerStage(n));
    if (n === CAREER.length - 1) {
      setReady(false);
      setGrand(true);
      return;
    }
    setReady(true);
  };

  if (hold && hero) {
    const last = rung + 1 >= CAREER.length - 1;
    return <CareerHold final={last} onDone={advanceCareer} onLobby={toLobby} />;
  }
  if (grand && hero && foe) {
    return (
      <GrandFinal
        hero={hero}
        foe={foe}
        onFight={() => {
          setGrand(false);
          setReady(true);
        }}
        onLobby={toLobby}
      />
    );
  }
  if (!ready || !hero || !foe) {
    return (
      <DuelSelect
        hero={hero}
        foe={foe}
        stageId={stageId}
        diff={diff}
        career={career}
        onDiff={setDiff}
        onCareer={(on) => {
          setCareer(on);
          if (on) {
            setFoe(CAREER[0]);
            setRung(0);
            setStageId(careerStage(0));
          }
        }}
        onStage={setStageId}
        onPickHero={(id) => {
          setHero(id);
          setReady(false);
        }}
        onPickFoe={(id) => {
          if (career) return;
          setFoe(id);
          setReady(false);
        }}
        onClear={() => {
          setHero(null);
          if (!career) setFoe(null);
          setReady(false);
        }}
        onLobby={toLobby}
        onStart={() => {
          if (career && hero) {
            setFoe(CAREER[rung]);
            setStageId(careerStage(rung));
            setReady(true);
            return;
          }
          if (hero && foe) setReady(true);
        }}
      />
    );
  }
  return (
    <Arena
      hero={hero}
      foe={foe}
      stageId={stageId}
      diff={diff}
      rung={career ? rung : 0}
      career={career}
      onNextCareer={() => setHold(true)}
      onChangeHero={() => {
        setHero(null);
        if (!career) setFoe(null);
        setReady(false);
      }}
      onLobby={toLobby}
    />
  );
}

function CareerHold({ final, onDone, onLobby }: { final: boolean; onDone: () => void; onLobby: () => void }) {
  const [n, setN] = useState(3);
  const [flash, setFlash] = useState(0);
  useEffect(() => {
    const pulse = window.setInterval(() => setFlash((v) => v + 1), 180);
    const a = window.setTimeout(() => setN(2), 1000);
    const b = window.setTimeout(() => setN(1), 2000);
    const c = window.setTimeout(onDone, 3000);
    return () => {
      window.clearInterval(pulse);
      window.clearTimeout(a);
      window.clearTimeout(b);
      window.clearTimeout(c);
    };
  }, []);
  const pink = flash % 2 === 1;
  return (
    <div
      className="relative flex h-svh flex-col items-center justify-center overflow-hidden bg-ink px-4 text-center"
      style={{ position: "fixed", inset: 0, overscrollBehavior: "none" }}
    >
      <div className="absolute left-4 top-[max(0.8rem,env(safe-area-inset-top))] flex flex-col items-start gap-1">
        <Button variant="quiet" onClick={() => useGame.getState().backToTitle()}>
          Main Menu
        </Button>
        <Button variant="quiet" onClick={onLobby}>
          Lobby
        </Button>
      </div>
      <p
        className="font-display text-4xl font-extrabold tracking-[0.12em] sm:text-6xl"
        style={{
          color: final ? "#ff2bd6" : "#3cf0ff",
          WebkitTextStroke: final ? "4px #12d8ff" : "3px #ff2bd6",
          paintOrder: "stroke fill",
          textShadow: final ? "0 0 22px #ff2bd6" : "0 0 18px #3cf0ff",
        }}
      >
        {final ? "FINAL BATTLE" : "Next Fight"}
      </p>
      <p
        className="mt-6 w-full text-center font-display text-[7.5rem] font-extrabold leading-none sm:text-[9rem]"
        style={{
          color: pink ? "#ff2bd6" : "#12d8ff",
          WebkitTextStroke: pink ? "6px #12d8ff" : "6px #ff2bd6",
          paintOrder: "stroke fill",
          textShadow: pink ? "0 0 28px #ff2bd6" : "0 0 28px #12d8ff",
        }}
      >
        {n}
      </p>
    </div>
  );
}

function GrandFinal({
  hero,
  foe,
  onFight,
  onLobby,
}: {
  hero: FightFighterId;
  foe: FightFighterId;
  onFight: () => void;
  onLobby: () => void;
}) {
  return (
    <div className="relative flex h-svh flex-col items-center justify-center overflow-hidden bg-ink px-4 text-center" style={{ position: "fixed", inset: 0, overscrollBehavior: "none", touchAction: "none" }}>
      <div className="absolute left-4 top-[max(0.8rem,env(safe-area-inset-top))] flex flex-col items-start gap-1">
        <Button variant="quiet" onClick={() => useGame.getState().backToTitle()}>
          Main Menu
        </Button>
        <Button variant="quiet" onClick={onLobby}>
          Lobby
        </Button>
      </div>
      <p
        className="font-display text-5xl font-extrabold tracking-[0.12em] sm:text-7xl"
        style={{ color: "#ff2bd6", WebkitTextStroke: "4px #12d8ff", paintOrder: "stroke fill", textShadow: "0 0 22px #ff2bd6" }}
      >
        FINAL BATTLE
      </p>
      <div className="mt-8 flex w-full max-w-lg items-center justify-center gap-3">
        <div className="min-w-0 flex-1">
          <img src={playPortrait(hero)} alt="" className="mx-auto aspect-3/4 w-full max-w-40 rounded-[16px] object-cover object-top" />
          <p className="mt-2 font-display text-lg">{FIGHTERS[hero].name}</p>
        </div>
        <p className="font-display text-2xl text-[#3cf0ff]">V</p>
        <div className="min-w-0 flex-1">
          <img src={playPortrait(foe)} alt="" className="mx-auto aspect-3/4 w-full max-w-40 rounded-[16px] object-cover object-top" />
          <p className="mt-2 font-display text-lg">{FIGHTERS[foe].name}</p>
        </div>
      </div>
      <Button variant="pink" className="mt-8" onClick={onFight}>
        Fight
      </Button>
    </div>
  );
}

function DuelSelect({
  hero,
  foe,
  stageId,
  diff,
  career,
  onDiff,
  onCareer,
  onStage,
  onPickHero,
  onPickFoe,
  onClear,
  onLobby,
  onStart,
}: {
  hero: FightFighterId | null;
  foe: FightFighterId | null;
  stageId: StageId;
  diff: FightDiff;
  career: boolean;
  onDiff: (d: FightDiff) => void;
  onCareer: (on: boolean) => void;
  onStage: (id: StageId) => void;
  onPickHero: (id: FightFighterId) => void;
  onPickFoe: (id: FightFighterId) => void;
  onClear: () => void;
  onLobby: () => void;
  onStart: () => void;
}) {
  const [seat, setSeat] = useState<"hero" | "foe">("hero");
  return (
    <div className="relative flex h-svh min-h-0 flex-col overflow-hidden bg-ink text-parchment" style={{ position: "fixed", inset: 0, overscrollBehavior: "none" }}>
      <img src={stageArt(stageId)} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" />
      <div className="absolute inset-0 bg-ink/55" />
      <header className="relative z-10 flex items-start gap-3 px-4 py-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="flex flex-col items-start gap-1">
          <Button variant="quiet" onClick={() => useGame.getState().backToTitle()}>
            Main Menu
          </Button>
          <Button variant="quiet" onClick={onLobby}>
            Lobby
          </Button>
        </div>
        <SoundToggle />
        <div>
          <p className="font-display text-sm tracking-[0.22em] text-gold uppercase">Duel of intent</p>
          <h1 className="font-display text-3xl font-semibold">Warrior Battle</h1>
        </div>
      </header>
      <main className="relative z-10 mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col overflow-y-auto px-4 py-4" style={{ overscrollBehavior: "none", WebkitOverflowScrolling: "auto" }}>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setSeat("hero")}
            className={cn(
              "flex min-h-[4.75rem] items-center gap-2 rounded-[16px] border bg-ink-soft/90 p-2 text-left",
              seat === "hero" ? "border-gold ring-2 ring-gold/50" : "border-gold/25",
            )}
          >
            {hero ? (
              <img src={playPortrait(hero)} alt="" className="h-14 w-11 shrink-0 rounded-[10px] object-cover object-top" />
            ) : (
              <span className="flex h-14 w-11 shrink-0 items-center justify-center rounded-[10px] border border-dashed border-gold/30 text-[10px] text-muted">
                You
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-semibold uppercase leading-none text-gold">You</p>
              <p className="mt-1 font-display text-[15px] leading-snug break-words">{hero ? FIGHTERS[hero].name : "Tap a face"}</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setSeat("foe")}
            className={cn(
              "flex min-h-[4.75rem] items-center gap-2 rounded-[16px] border bg-ink-soft/90 p-2 text-left",
              seat === "foe" ? "border-gold ring-2 ring-gold/50" : "border-gold/25",
            )}
          >
            {foe ? (
              <img src={playPortrait(foe)} alt="" className="h-14 w-11 shrink-0 rounded-[10px] object-cover object-top" />
            ) : (
              <span className="flex h-14 w-11 shrink-0 items-center justify-center rounded-[10px] border border-dashed border-gold/30 text-[10px] text-muted">
                Foe
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-semibold uppercase leading-none text-gold">Opponent</p>
              <p className="mt-1 font-display text-[15px] leading-snug break-words">{foe ? FIGHTERS[foe].name : "Tap a face"}</p>
            </div>
          </button>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {(["easy", "normal", "hard"] as FightDiff[]).map((d) => (
            <Button key={d} variant={diff === d ? "pink" : "ghost"} className="h-10 px-3 text-xs capitalize" onClick={() => onDiff(d)}>
              {d}
            </Button>
          ))}
          <Button variant={career ? "blue" : "ghost"} className="h-10 px-3 text-xs" onClick={() => onCareer(!career)}>
            Career
          </Button>
        </div>
        {career ? (
          <p className="mt-2 text-center text-xs text-[#3cf0ff]">
            Eight bouts: Veronika, Milo, Tux, Olivia, Rosie, Murphy, Ronnie, Samael
          </p>
        ) : null}
        <div className="mt-3 flex items-center justify-center gap-2">
          <Button variant="ghost" onClick={onClear} disabled={!hero && !foe}>
            Clear
          </Button>
          <Button variant="gold" onClick={onStart} disabled={!hero || (!career && !foe)}>
            Fight
          </Button>
        </div>
        <p className="mt-4 text-sm uppercase tracking-wide text-[#3cf0ff]">Select Location</p>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {STAGES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onStage(s.id)}
              className={cn(
                "overflow-hidden rounded-[12px] border text-left",
                stageId === s.id ? "border-[#3cf0ff] ring-2 ring-[#3cf0ff]/50" : "border-gold/25",
              )}
            >
              <img src={s.art} alt="" className="h-16 w-full object-cover" />
              <p className="px-1.5 py-1 text-[10px] leading-tight text-parchment">{s.name}</p>
            </button>
          ))}
        </div>
        <p className="mt-3 text-silver">{seat === "hero" ? "Choose Your Fighter" : "Choose Your Opponent"}</p>
        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
          {HEROES.map((id) => {
            const def = FIGHTERS[id];
            const selected = hero === id || foe === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  if (seat === "hero") {
                    onPickHero(id);
                    setSeat("foe");
                  } else onPickFoe(id);
                }}
                className={cn(
                  "overflow-hidden rounded-[18px] border bg-ink-soft/90 text-left hover:border-gold",
                  selected ? "border-gold ring-2 ring-gold/60" : "border-gold/25",
                )}
              >
                <img src={playPortrait(id)} alt="" className="aspect-3/4 w-full object-cover object-top" />
                <div className="flex min-h-8 items-center px-1 py-1 sm:px-2">
                  <h2 className="w-full text-center font-display text-[10px] font-semibold leading-tight break-words sm:text-xs">{def.name}</h2>
                </div>
              </button>
            );
          })}
        </div>
      </main>
      <div className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0" aria-hidden>
        {HEROES.map((id) => (
          <span key={id}>
            <img src={FIGHTERS[id].body} alt="" />
            <img src={`/art/fighters/${id}-atk.png?v=atk9`} alt="" />
            <img src={playPortrait(id)} alt="" />
          </span>
        ))}
      </div>
    </div>
  );
}

function Arena({
  hero,
  foe,
  stageId,
  diff,
  rung,
  career,
  onNextCareer,
  onChangeHero,
  onLobby,
}: {
  hero: FightFighterId;
  foe: FightFighterId;
  stageId: StageId;
  diff: FightDiff;
  rung: number;
  career: boolean;
  onNextCareer: () => void;
  onChangeHero: () => void;
  onLobby: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keys = useRef(new Set<string>());
  const edges = useRef({ punch: false, kick: false, special: false });
  const state = useRef<FightState>(createMatch(hero, foe, diff, rung));
  const portraits = useRef<Record<string, HTMLImageElement>>({});
  const attacks = useRef<Record<string, HTMLImageElement>>({});
  const faces = useRef<Record<string, HTMLImageElement>>({});
  const stage = useRef<HTMLImageElement | null>(null);
  const prevHp = useRef([MAX_HP, MAX_HP]);
  const [phase, setPhase] = useState<FightState["phase"]>("countdown");
  const [banner, setBanner] = useState("FIGHT");

  useEffect(() => {
    hushMusic();
    unlockAudio();
    playFightCall();
    state.current = createMatch(hero, foe, diff, rung);
    prevHp.current = [MAX_HP, MAX_HP];
    portraits.current = preloadFightArt();
    attacks.current = fightAttackSheets();
    faces.current = fightFaces();
    stage.current = stageImage(stageId);
  }, [hero, foe, stageId, diff, rung]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keys.current.add(e.code);
      if (e.code === "KeyJ" || e.code === "KeyZ") edges.current.punch = true;
      if (e.code === "KeyK" || e.code === "KeyX") edges.current.kick = true;
      if (e.code === "KeyL" || e.code === "KeyC" || e.code === "Space") {
        e.preventDefault();
        edges.current.special = true;
      }
    };
    const up = (e: KeyboardEvent) => keys.current.delete(e.code);
    const clear = () => keys.current.clear();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    const freeze = (e: TouchEvent) => e.preventDefault();
    document.addEventListener("touchmove", freeze, { passive: false });
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
      document.removeEventListener("touchmove", freeze);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    const tick = 1 / 60;
    let shownPhase = state.current.phase;
    let shownBanner = state.current.banner;

    const probe = {
      getYaw: () => state.current.fighters[0].x,
      getSpeed: () => Math.abs(state.current.fighters[0].vx),
      setKeys: (codes: string[]) => {
        keys.current = new Set(codes);
      },
    };
    window.__controlsTest = probe;

    const loop = (now: number) => {
      const raw = Math.min(0.1, (now - last) / 1000);
      last = now;
      acc += raw;
      const held = keys.current;
      while (acc >= tick) {
        const input: FightInput = {
          left: held.has("KeyA") || held.has("ArrowLeft") || held.has("PadL"),
          right: held.has("KeyD") || held.has("ArrowRight") || held.has("PadR"),
          up: held.has("KeyW") || held.has("ArrowUp") || held.has("PadU"),
          down: held.has("KeyS") || held.has("ArrowDown") || held.has("PadC"),
          punch: edges.current.punch || held.has("PadP"),
          kick: edges.current.kick || held.has("PadK"),
          special: edges.current.special || held.has("PadS"),
        };
        edges.current = { punch: false, kick: false, special: false };
        const before = state.current.phase;
        step(state.current, input, tick);
        const [a, b] = state.current.fighters;
        prevHp.current = [a.hp, b.hp];
        if (before !== "ko" && state.current.phase === "ko") playKo();
        if (before !== "match" && state.current.phase === "match") {
          if (state.current.winner === 0) playHeal();
          else playChime();
        }
        acc -= tick;
      }
      draw(ctx, state.current, portraits.current, attacks.current, faces.current, stage.current);
      if (state.current.phase !== shownPhase) {
        shownPhase = state.current.phase;
        setPhase(shownPhase);
      }
      if (state.current.banner !== shownBanner) {
        shownBanner = state.current.banner;
        setBanner(shownBanner);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      if (window.__controlsTest === probe) delete window.__controlsTest;
    };
  }, [hero, foe]);

  const match = phase === "match";

  return (
    <div
      className="relative flex h-svh max-h-svh min-h-0 flex-col overflow-hidden bg-ink text-parchment"
      style={{ position: "fixed", inset: 0, overscrollBehavior: "none", touchAction: "none" }}
    >
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="absolute inset-0 m-auto h-full w-full max-h-full max-w-full touch-none object-contain object-center"
          style={{ touchAction: "none" }}
        />
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3 pt-[max(0.6rem,env(safe-area-inset-top))]">
        <div className="pointer-events-auto flex flex-col items-start gap-1">
          <Button variant="quiet" className="px-3" onClick={() => useGame.getState().backToTitle()}>
            Main Menu
          </Button>
          <Button variant="quiet" className="px-3" onClick={onLobby}>
            Lobby
          </Button>
        </div>
        <SoundToggle />
        <Button variant="quiet" className="pointer-events-auto px-3" onClick={onChangeHero}>
          Change
        </Button>
      </div>
      {match && state.current.winner !== null ? (
        <WinnerSplash
          id={state.current.winner === 0 ? hero : foe}
          youScore={state.current.fighters[0].rounds}
          foeScore={state.current.fighters[1].rounds}
          youName={FIGHTERS[hero].name}
          foeName={FIGHTERS[foe].name}
          champion={career && state.current.winner === 0 && rung >= CAREER.length - 1}
          careerNext={career && state.current.winner === 0 && rung < CAREER.length - 1}
          hideAgain={career}
          onAgain={() => {
            if (career && state.current.winner === 0 && rung < CAREER.length - 1) {
              onNextCareer();
              return;
            }
            state.current = createMatch(hero, foe, diff, rung);
            prevHp.current = [MAX_HP, MAX_HP];
            setPhase("countdown");
            setBanner("FIGHT");
          }}
          onExit={onLobby}
        />
      ) : null}
      <TouchPad keys={keys} edges={edges} />
    </div>
  );
}

function TouchPad({
  keys,
  edges,
}: {
  keys: MutableRefObject<Set<string>>;
  edges: MutableRefObject<{ punch: boolean; kick: boolean; special: boolean }>;
}) {
  const hold = (code: string, on: boolean) => {
    if (on) keys.current.add(code);
    else keys.current.delete(code);
  };
  const tap = (which: "punch" | "kick" | "special") => {
    edges.current[which] = true;
  };
  return (
    <PadDock className="pointer-events-none absolute inset-x-0 bottom-0 z-30 mx-2 mb-[max(0.4rem,env(safe-area-inset-bottom))] flex items-end justify-between gap-4">
      <div className="pointer-events-auto grid shrink-0 grid-cols-3 place-items-center gap-1.5">
        <span className="size-14" />
        <NeonArrow dir="up" tone="blue" onDown={() => hold("PadU", true)} onUp={() => hold("PadU", false)} />
        <span className="size-14" />
        <NeonArrow dir="left" tone="pink" onDown={() => hold("PadL", true)} onUp={() => hold("PadL", false)} />
        <NeonArrow dir="down" tone="blue" onDown={() => hold("PadC", true)} onUp={() => hold("PadC", false)} />
        <NeonArrow dir="right" tone="pink" onDown={() => hold("PadR", true)} onUp={() => hold("PadR", false)} />
      </div>
      <div className="pointer-events-auto flex shrink-0 flex-col items-center gap-1.5">
        <NeonAct
          label="Special"
          kind="blue"
          mark="S"
          onDown={() => {
            tap("special");
            hold("PadS", true);
          }}
          onUp={() => hold("PadS", false)}
        />
        <div className="flex items-center gap-2">
          <NeonAct label="Jab" kind="blue" onDown={() => tap("punch")} />
          <NeonAct label="Kick" kind="pink" onDown={() => tap("kick")} />
        </div>
      </div>
    </PadDock>
  );
}

function Pad({
  children,
  onDown,
  onUp,
  gold,
}: {
  children: React.ReactNode;
  onDown: () => void;
  onUp?: () => void;
  gold?: boolean;
}) {
  return (
    <button
      type="button"
      className={cn(
        "min-h-12 min-w-12 rounded-full border px-3 text-xs uppercase",
        gold ? "border-gold bg-gold/30 text-gold" : "border-gold/30 bg-ink/70 text-parchment",
      )}
      onPointerDown={(e) => {
        e.preventDefault();
        onDown();
      }}
      onPointerUp={onUp}
      onPointerLeave={onUp}
    >
      {children}
    </button>
  );
}

function ball(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, inner: string, mid: string) {
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 2, x, y, r);
  g.addColorStop(0, "#fff");
  g.addColorStop(0.35, inner);
  g.addColorStop(1, mid);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function drawSpecialShot(ctx: CanvasRenderingContext2D, p: Projectile) {
  const { x, y, who } = p;
  ctx.save();
  if (who === "nancy") ball(ctx, x, y, 20, "#ff4ae0", "#12d8ff");
  else if (who === "veronika") ball(ctx, x, y, 22, "#ffffff", "#3cf0ff");
  else if (who === "ronnie") ball(ctx, x, y, 22, "#ffb070", "#c4281c");
  else if (who === "murphy") {
    ctx.fillStyle = "#6a6a72";
    ctx.beginPath();
    ctx.ellipse(x, y, 16, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 12, y - 2, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#2a2a30";
    ctx.beginPath();
    ctx.arc(x + 14, y - 3, 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#4a4a52";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 14, y);
    ctx.quadraticCurveTo(x - 22, y + 8, x - 10, y + 6);
    ctx.stroke();
  } else if (who === "rosie") {
    ctx.fillStyle = "#e8b04a";
    ctx.beginPath();
    ctx.arc(x, y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - 10, y);
    ctx.quadraticCurveTo(x, y - 6, x + 10, y);
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
    ctx.fillStyle = "#ffb070";
    ctx.beginPath();
    ctx.moveTo(x + 12, y);
    ctx.lineTo(x + 18, y + 2);
    ctx.lineTo(x + 12, y + 4);
    ctx.fill();
    ctx.strokeStyle = "#1a1a1e";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 4, y - 6);
    ctx.lineTo(x - 10, y - 12);
    ctx.moveTo(x + 2, y - 6);
    ctx.lineTo(x + 6, y - 12);
    ctx.stroke();
  } else if (who === "milo") {
    ctx.strokeStyle = "#f4ead8";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x - 14, y);
    ctx.lineTo(x + 14, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x - 16, y - 5, 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x - 16, y + 5, 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + 16, y - 5, 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + 16, y + 5, 5, 0, Math.PI * 2);
    ctx.stroke();
  } else if (who === "sarah") ball(ctx, x, y, 18, "#ffe9a8", "#d4a54a");
  else if (who === "adamus") ball(ctx, x, y, 20, "#c5c8d0", "#6b5b8c");
  else if (who === "mira") ball(ctx, x, y, 18, "#b8ffd4", "#3a6a48");
  else if (who === "sananda") ball(ctx, x, y, 20, "#fff4b0", "#d4a54a");
  else if (who === "lena") ball(ctx, x, y, 18, "#ffd0e8", "#ff2bd6");
  else if (who === "eliav") ball(ctx, x, y, 18, "#d0e8ff", "#2a6aaa");
  else if (who === "nadav") ball(ctx, x, y, 18, "#e8d0ff", "#6b5b8c");
  else if (who === "olivia") ball(ctx, x, y, 18, "#fff", "#c5c8d0");
  else if (who === "geraldine") ball(ctx, x, y, 18, "#ffd8a8", "#8a6a2e");
  else if (who === "sophie") ball(ctx, x, y, 16, "#ffc0e8", "#ff4ae0");
  else if (who === "harlan") ball(ctx, x, y, 20, "#d8c898", "#4a4038");
  else if (who === "zorath") ball(ctx, x, y, 22, "#3a1048", "#ff2bd6");
  else if (who === "samael") ball(ctx, x, y, 22, "#1a0a12", "#c4281c");
  else ball(ctx, x, y, 18, "#12d8ff", "#ff2bd6");
  ctx.restore();
}

function draw(
  ctx: CanvasRenderingContext2D,
  s: FightState,
  portraits: Record<string, HTMLImageElement>,
  attacks: Record<string, HTMLImageElement>,
  faces: Record<string, HTMLImageElement>,
  stage: HTMLImageElement | null,
) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, W, H);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  const sh = 0;
  ctx.translate(0, 0);

  if (stage && stage.complete && stage.naturalWidth) {
    ctx.drawImage(stage, 0, 0, W, H);
    ctx.fillStyle = "rgba(16,14,12,0.12)";
    ctx.fillRect(0, 0, W, H);
  } else {
    ctx.fillStyle = "#100e0c";
    ctx.fillRect(0, 0, W, H);
  }

  const floor = ctx.createLinearGradient(0, GROUND - 40, 0, H);
  floor.addColorStop(0, "rgba(16,14,12,0)");
  floor.addColorStop(0.2, "rgba(16,14,12,0.55)");
  floor.addColorStop(1, "#100e0c");
  ctx.fillStyle = floor;
  ctx.fillRect(0, GROUND - 40, W, H - GROUND + 40);

  for (const f of s.fighters) drawFighter(ctx, f, portraits[f.id], attacks[f.id], faces[f.id]);

  for (const p of s.projectiles) drawSpecialShot(ctx, p);

  for (const sp of s.sparks) {
    ctx.globalAlpha = Math.max(0, sp.life * 3);
    ctx.fillStyle = sp.gold ? "#d4a54a" : "#c5c8d0";
    ctx.fillRect(sp.x, sp.y, 4, 4);
    ctx.globalAlpha = 1;
  }

  drawHud(ctx, s);

  if (s.banner && s.phase !== "match") {
    const fightCall = s.phase === "countdown" || s.banner.startsWith("FIGHT");
    ctx.fillStyle = fightCall ? "rgba(11,11,18,0.55)" : "rgba(16,14,12,0.45)";
    ctx.fillRect(0, fightCall ? 240 : 300, W, fightCall ? 200 : 120);
    ctx.textAlign = "center";
    if (fightCall) {
      ctx.font = "800 140px 'Cormorant Garamond', serif";
      ctx.fillStyle = "#ff2bd6";
      ctx.shadowColor = "#12d8ff";
      ctx.shadowBlur = 28;
      ctx.fillText("FIGHT!", W / 2, 380);
      ctx.shadowBlur = 0;
    } else {
      ctx.fillStyle = "#d4a54a";
      ctx.font = "700 64px 'Cormorant Garamond', serif";
      ctx.fillText(s.banner, W / 2, 380);
    }
  }
}

function attackCell(f: Fighter) {
  if (f.attack === "punch" || f.attack === "special") return f.frame < 7 ? 0 : 1;
  if (f.attack === "kick") return f.frame < 9 ? 2 : 3;
  return null;
}

function readyImg(img?: HTMLImageElement) {
  return !!(img && img.complete && img.naturalWidth);
}

const sheetBoxes = new Map<string, [number, number, number, number][]>();

function cellBoxes(sheet: HTMLImageElement) {
  const hit = sheetBoxes.get(sheet.src);
  if (hit) return hit;
  const cw = sheet.naturalWidth / 2;
  const ch = sheet.naturalHeight / 2;
  const c = document.createElement("canvas");
  c.width = sheet.naturalWidth;
  c.height = sheet.naturalHeight;
  const g = c.getContext("2d", { willReadFrequently: true });
  if (!g) return null;
  g.drawImage(sheet, 0, 0);
  const boxes: [number, number, number, number][] = [];
  for (let i = 0; i < 4; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const sx = col * cw;
    const sy = row * ch;
    const data = g.getImageData(sx, sy, cw, ch).data;
    let minX = cw;
    let minY = ch;
    let maxX = 0;
    let maxY = 0;
    for (let y = 0; y < ch; y++) {
      for (let x = 0; x < cw; x++) {
        if (data[(y * cw + x) * 4 + 3] > 32) {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX <= minX || maxY <= minY) boxes.push([sx, sy, cw, ch]);
    else boxes.push([sx + minX, sy + minY, maxX - minX + 1, maxY - minY + 1]);
  }
  sheetBoxes.set(sheet.src, boxes);
  return boxes;
}

function drawFighter(
  ctx: CanvasRenderingContext2D,
  f: Fighter,
  img?: HTMLImageElement,
  sheet?: HTMLImageElement,
  face?: HTMLImageElement,
) {
  const h = bodyH(f);
  const t = performance.now();
  const bob = f.state === "walk" ? Math.sin(t / 90) * 3 : 0;
  const cell = attackCell(f);
  const lean =
    f.attack === "punch" || f.attack === "special" ? 28 : f.attack === "kick" ? 22 : f.state === "hit" ? -8 : 0;
  ctx.save();
  if (f.state === "ko") {
    ctx.translate(f.x, GROUND - 28);
    ctx.rotate((Math.PI / 2) * f.facing);
    ctx.scale(f.facing, 1);
  } else {
    ctx.translate(f.x, f.y + bob);
    ctx.scale(f.facing, 1);
  }

  ctx.fillStyle = "rgba(16,14,12,0.28)";
  ctx.beginPath();
  ctx.ellipse(0, 8, 48, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  const targetH = f.state === "ko" ? Math.min(h, 280) : h;
  const maxW = f.state === "ko" ? 180 : 230;
  const sheetReady = readyImg(sheet);
  const isSheet = !!(
    sheetReady &&
    sheet &&
    sheet.naturalWidth > 80 &&
    sheet.naturalHeight > 80 &&
    sheet.naturalWidth / sheet.naturalHeight > 0.75 &&
    sheet.naturalWidth / sheet.naturalHeight < 1.35
  );
  const useSheet = cell !== null && isSheet;
  const src = useSheet ? sheet : readyImg(img) ? img : undefined;
  if (src) {
    if (useSheet && sheet) {
      const cw = sheet.naturalWidth / 2;
      const ch = sheet.naturalHeight / 2;
      const idx = cell ?? 0;
      const sx = (idx % 2) * cw;
      const sy = Math.floor(idx / 2) * ch;
      const dh = targetH;
      const dw = Math.min(maxW, cw * (targetH / ch));
      const ox = f.state === "ko" ? 0 : lean;
      const oy = f.state === "ko" ? -dh / 2 : -dh + 6;
      ctx.drawImage(sheet, sx, sy, cw, ch, -dw / 2 + ox, oy, dw, dh);
    } else {
      const dh = targetH;
      const dw = Math.min(maxW, src.naturalWidth * (targetH / src.naturalHeight));
      const ox = f.state === "ko" ? 0 : lean;
      const oy = f.state === "ko" ? -dh / 2 : -dh + 6;
      ctx.drawImage(src, -dw / 2 + ox, oy, dw, dh);
    }
  }

  ctx.restore();
}

function drawHud(ctx: CanvasRenderingContext2D, s: FightState) {
  const [a, b] = s.fighters;
  bar(ctx, 48, 20, 540, 34, a.hp / a.maxHp, "#ff4ae0", false);
  bar(ctx, 692, 20, 540, 34, b.hp / b.maxHp, "#3cf0ff", true);
  ctx.fillStyle = "#f4ead8";
  fitLabel(ctx, a.name.toUpperCase(), 48, 82, "left", 520);
  fitLabel(ctx, b.name.toUpperCase(), 1232, 82, "right", 520);
  ctx.textAlign = "center";
  ctx.fillStyle = "#d4a54a";
  ctx.font = "700 36px 'Cormorant Garamond', serif";
  ctx.fillText(String(Math.max(0, Math.ceil(s.clock))), W / 2, 52);
  pips(ctx, 48, 100, a.rounds, true);
  pips(ctx, 1232, 100, b.rounds, false);
}

function fitLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  align: CanvasTextAlign,
  maxW: number,
) {
  ctx.textAlign = align;
  let size = 34;
  while (size > 16) {
    ctx.font = `700 ${size}px 'Cormorant Garamond', serif`;
    if (ctx.measureText(text).width <= maxW) break;
    size -= 2;
  }
  ctx.fillText(text, x, y);
}

function bar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  t: number,
  color: string,
  flip: boolean,
) {
  ctx.fillStyle = "#1a1612";
  ctx.fillRect(x - 3, y - 3, w + 6, h + 6);
  ctx.fillStyle = color + "55";
  ctx.fillRect(x - 6, y - 4, w + 12, h + 8);
  ctx.fillStyle = "#22181c";
  ctx.fillRect(x, y, w, h);
  const fw = Math.max(0, w * t);
  ctx.fillStyle = color;
  if (flip) ctx.fillRect(x + w - fw, y, fw, h);
  else ctx.fillRect(x, y, fw, h);
}

function pips(ctx: CanvasRenderingContext2D, x: number, y: number, n: number, left: boolean) {
  for (let i = 0; i < 2; i++) {
    ctx.beginPath();
    ctx.arc(x + (left ? i : -i) * 18, y, 7, 0, Math.PI * 2);
    ctx.fillStyle = i < n ? "#d4a54a" : "#3a2a22";
    ctx.fill();
  }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

declare global {
  interface Window {
    __controlsTest?: {
      getYaw: () => number;
      getSpeed: () => number;
      setKeys: (codes: string[]) => void;
      setSteer?: (v: number) => void;
    };
  }
}
