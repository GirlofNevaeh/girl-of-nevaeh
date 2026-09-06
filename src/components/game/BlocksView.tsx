import { Button } from "@/components/ui/button";
import { FIGHTERS, PLAYABLE, type FightFighterId } from "@/fight/engine";
import { playPortrait } from "@/game/play-art";
import { NeonAct, NeonArrow, PadDock } from "./NeonPads";
import { playChime, playClick, playDrop, playHeal, playTurn, setAmbient, unlockAudio } from "@/game/audio";
import { SoundToggle } from "@/components/ui/sound-toggle";
import { useGame } from "@/game/store";
import { cn } from "@/lib/cn";
import {
  COLS,
  COLOR,
  createGame,
  ghostY,
  hardDrop,
  hold,
  loadHigh,
  move,
  pieceCells,
  rotate,
  ROWS,
  saveHigh,
  softDrop,
  tick,
  type Diff,
  type Game,
} from "@/blocks/engine";
import { useEffect, useRef, useState } from "react";

const PINK = "#ff4ae0";
const BLUE = "#3cf0ff";
const CELL = 28;
const W = COLS * CELL;
const H = ROWS * CELL;

export function BlocksView() {
  const [who, setWho] = useState<FightFighterId | null>(null);
  const [diff, setDiff] = useState<Diff>("normal");
  const [hi, setHi] = useState(loadHigh);
  if (!who) {
    return (
      <div className="relative flex h-svh min-h-0 flex-col overflow-hidden bg-ink text-parchment">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,#ff4ae022,transparent_45%),radial-gradient(circle_at_90%_80%,#3cf0ff22,transparent_40%)]" />
        <header className="relative z-10 flex items-center gap-3 px-4 py-4 pt-[max(1rem,env(safe-area-inset-top))]">
          <Button variant="quiet" onClick={() => useGame.getState().backToTitle()}>
            Main Menu
          </Button>
          <SoundToggle />
          <div>
            <p className="font-display text-sm tracking-[0.22em] text-gold uppercase">One player</p>
            <h1 className="font-display text-3xl font-semibold">Blocks</h1>
          </div>
        </header>
        <main className="relative z-10 mx-auto w-full max-w-5xl flex-1 overflow-y-auto px-4 pb-8">
          <p className="text-silver">Pick a companion. Neon pink and blue stones fall. Best score on this device is kept.</p>
          <p className="mt-5 text-xs tracking-[0.16em] text-gold uppercase">Mode</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(["easy", "normal", "hard"] as Diff[]).map((d) => (
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
          <p className="mt-5 text-xs tracking-[0.16em] text-gold uppercase">Character</p>
          <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
            {PLAYABLE.map((id) => {
              const f = FIGHTERS[id];
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    playClick();
                    setWho(id);
                  }}
                  className="overflow-hidden rounded-[16px] border border-gold/25 bg-ink-soft/90 text-left hover:border-gold"
                >
                  <img src={playPortrait(id)} alt="" className="aspect-3/4 w-full object-cover object-top" />
                  <p className="px-1 py-2 text-center font-display text-[11px] leading-tight break-words">{f.name}</p>
                </button>
              );
            })}
          </div>
        </main>
      </div>
    );
  }
  return <Play who={who} diff={diff} hi={hi} onHi={setHi} onLobby={() => setWho(null)} />;
}

function Play({
  who,
  diff,
  hi,
  onHi,
  onLobby,
}: {
  who: FightFighterId;
  diff: Diff;
  hi: Record<Diff, number>;
  onHi: (h: Record<Diff, number>) => void;
  onLobby: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const game = useRef<Game>(createGame(diff));
  const keys = useRef(new Set<string>());
  const das = useRef({ left: 0, right: 0, startedL: false, startedR: false });
  const [, bump] = useState(0);
  const f = FIGHTERS[who];

  useEffect(() => {
    unlockAudio();
    setAmbient("blocks");
    game.current = createGame(diff);
    bump((n) => n + 1);
  }, [diff, who]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp", "Space"].includes(e.code)) e.preventDefault();
      if (e.repeat) return;
      keys.current.add(e.code);
      const g = game.current;
      if (e.code === "ArrowUp" || e.code === "KeyW" || e.code === "KeyX") {
        rotate(g, 1);
        playTurn();
      }
      if (e.code === "KeyZ" || e.code === "ControlLeft") {
        rotate(g, -1);
        playTurn();
      }
      if (e.code === "Space") {
        hardDrop(g);
        playDrop();
      }
      if (e.code === "KeyC" || e.code === "ShiftLeft") hold(g);
    };
    const up = (e: KeyboardEvent) => keys.current.delete(e.code);
    const clear = () => keys.current.clear();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let last = performance.now();
    let accMove = 0;
    const probe = {
      getYaw: () => game.current.piece?.x ?? 0,
      getSpeed: () => (game.current.over ? 0 : 1),
      setKeys: (codes: string[]) => {
        keys.current = new Set(codes);
      },
    };
    window.__controlsTest = probe;

    let lastScore = -1;
    let lastOver = false;
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const g = game.current;
      const held = keys.current;
      if (!g.over) {
        const left = held.has("ArrowLeft") || held.has("KeyA");
        const right = held.has("ArrowRight") || held.has("KeyD");
        if (left && !das.current.startedL) {
          move(g, -1);
          das.current.startedL = true;
          das.current.left = 0;
        }
        if (!left) das.current.startedL = false;
        if (right && !das.current.startedR) {
          move(g, 1);
          das.current.startedR = true;
          das.current.right = 0;
        }
        if (!right) das.current.startedR = false;
        if (left) {
          das.current.left += dt;
          if (das.current.left > 0.16) {
            accMove += dt;
            if (accMove > 0.04) {
              move(g, -1);
              accMove = 0;
            }
          }
        } else if (right) {
          das.current.right += dt;
          if (das.current.right > 0.16) {
            accMove += dt;
            if (accMove > 0.04) {
              move(g, 1);
              accMove = 0;
            }
          }
        }
        const was = g.lines;
        tick(g, dt, held.has("ArrowDown") || held.has("KeyS"));
        if (g.lines > was) playHeal();
        if (g.over) {
          playChime();
          onHi(saveHigh(diff, g.score));
        }
      }
      if (g.score !== lastScore || g.over !== lastOver) {
        lastScore = g.score;
        lastOver = g.over;
        bump((n) => n + 1);
      }
      draw(ctx, g);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      if (window.__controlsTest === probe) delete window.__controlsTest;
    };
  }, [diff, onHi]);

  const g = game.current;
  return (
    <div className="relative flex h-svh min-h-0 flex-col overflow-hidden bg-ink text-parchment">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,#ff4ae028,transparent_40%),radial-gradient(circle_at_100%_100%,#3cf0ff22,transparent_45%)]" />
      <header className="relative z-10 flex items-center gap-3 px-3 py-3 pt-[max(0.6rem,env(safe-area-inset-top))]">
        <Button variant="quiet" onClick={onLobby}>
          Lobby
        </Button>
        <SoundToggle />
        <img src={playPortrait(who)} alt="" className="h-12 w-10 rounded-[8px] object-cover object-top" />
        <div className="min-w-0 flex-1">
          <p className="font-display text-xl leading-tight">{f.name}</p>
          <p className="text-xs capitalize text-silver">{diff} · best {hi[diff]}</p>
        </div>
        <div className="text-right">
          <p className="font-display text-2xl leading-none text-[#ff4ae0]">{g.score}</p>
          <p className="text-[10px] tracking-[0.14em] text-gold uppercase">Score</p>
        </div>
      </header>
      <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-lg flex-1 items-start justify-center gap-3 px-2">
        <aside className="hidden w-16 flex-col gap-2 sm:flex">
          <p className="text-[10px] tracking-[0.14em] text-gold uppercase">Hold</p>
          <Mini kind={g.hold} />
        </aside>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="h-auto max-h-full w-auto max-w-full touch-none rounded-[12px] border border-white/10"
          style={{ touchAction: "none" }}
        />
        <aside className="flex w-16 flex-col gap-2">
          <p className="text-[10px] tracking-[0.14em] text-gold uppercase">Next</p>
          {g.next.slice(0, 3).map((k, i) => (
            <Mini key={i} kind={k} />
          ))}
          <p className="mt-2 text-xs text-silver">Lv {g.level}</p>
          <p className="text-xs text-silver">{g.lines} lines</p>
        </aside>
      </div>
      <PadDock className="relative z-10 mx-3 mb-[max(0.6rem,env(safe-area-inset-bottom))] flex justify-between gap-2 lg:hidden">
        <div className="flex items-center gap-2">
          <NeonArrow dir="left" tone="pink" onDown={() => move(game.current, -1)} />
          <NeonArrow dir="right" tone="pink" onDown={() => move(game.current, 1)} />
        </div>
        <div className="flex items-center gap-2">
          <Pad onTap={() => { rotate(game.current, 1); playTurn(); }}>Turn</Pad>
          <NeonAct label="Drop" onDown={() => { hardDrop(game.current); playDrop(); }} />
        </div>
      </PadDock>
      {g.over ? (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-ink/70 p-4">
          <p className="font-display text-5xl">Stack full</p>
          <p className="mt-2 font-display text-2xl text-[#3cf0ff]">{g.score}</p>
          <p className="mt-1 text-silver">Best {Math.max(hi[diff], g.score)}</p>
          <div className="mt-5 flex gap-2">
            <Button
              variant="pink"
              onClick={() => {
                game.current = createGame(diff);
                bump((n) => n + 1);
              }}
            >
              Again
            </Button>
            <Button variant="ghost" onClick={onLobby}>
              Lobby
            </Button>
          </div>
        </div>
      ) : null}
      <p className="relative z-10 hidden px-4 pb-3 text-center text-xs text-muted lg:block">
        A/D or arrows move. S soft drop. W or up turn. Space hard drop. C hold.
      </p>
    </div>
  );
}

function Mini({ kind }: { kind: string | null }) {
  if (!kind) return <div className="h-14 rounded-[8px] border border-white/10 bg-ink/50" />;
  const pink = COLOR[kind as keyof typeof COLOR] === 1;
  return (
    <div
      className="grid h-14 place-items-center rounded-[8px] border text-xs font-display"
      style={{
        borderColor: pink ? PINK : BLUE,
        color: pink ? PINK : BLUE,
        boxShadow: `0 0 10px ${pink ? PINK : BLUE}55`,
      }}
    >
      {kind}
    </div>
  );
}

function Pad({ children, onTap }: { children: React.ReactNode; onTap: () => void }) {
  return (
    <button
      type="button"
      className="min-h-12 min-w-14 rounded-full border border-white/20 bg-ink/70 px-3 text-xs uppercase"
      onPointerDown={(e) => {
        e.preventDefault();
        onTap();
      }}
    >
      {children}
    </button>
  );
}

function draw(ctx: CanvasRenderingContext2D, g: Game) {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#100e0c";
  ctx.fillRect(0, 0, W, H);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const v = g.grid[r + 2][c];
      cell(ctx, c, r, v, 1);
    }
  }
  if (g.piece) {
    const gy = ghostY(g);
    for (const [rr, cc] of pieceCells({ ...g.piece, y: gy })) {
      if (rr >= 2) cell(ctx, cc, rr - 2, COLOR[g.piece.kind], 0.22);
    }
    for (const [rr, cc] of pieceCells(g.piece)) {
      if (rr >= 2) cell(ctx, cc, rr - 2, COLOR[g.piece.kind], 1);
    }
  }
}

function cell(ctx: CanvasRenderingContext2D, c: number, r: number, v: number, a: number) {
  if (!v) {
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.strokeRect(c * CELL + 0.5, r * CELL + 0.5, CELL - 1, CELL - 1);
    return;
  }
  const col = v === 1 ? PINK : BLUE;
  ctx.globalAlpha = a;
  ctx.fillStyle = col;
  ctx.shadowColor = col;
  ctx.shadowBlur = 12 * a;
  ctx.fillRect(c * CELL + 2, r * CELL + 2, CELL - 4, CELL - 4);
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
}
