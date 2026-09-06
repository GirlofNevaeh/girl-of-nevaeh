import { Button } from "@/components/ui/button";
import { FIGHTERS, PLAYABLE, type FightFighterId } from "@/fight/engine";
import { ART } from "@/game/assets";
import { playChime, playClick, playHeal, setAmbient } from "@/game/audio";
import { useGame } from "@/game/store";
import { cn } from "@/lib/cn";
import { useP2PRoom } from "@/lib/multiplayer/use-p2p-room";
import {
  cpuMove,
  emptyBoard,
  legal,
  outcome,
  place,
  winningLine,
  type Cell,
  type Side,
} from "@/tictac/engine";
import { playPortrait } from "@/game/play-art";
import { DuelPick } from "./DuelPick";
import { WinnerSplash } from "./WinnerSplash";
import { useCallback, useEffect, useMemo, useState } from "react";

const ROSTER = PLAYABLE;

type WorldId = "brooklyn" | "elysium" | "nevaeh";

const WORLDS: Record<WorldId, { name: string; art: string; ambient: "earth" | "stone" | "nevaeh"; blurb: string }> = {
  brooklyn: { name: "Brooklyn", art: ART.kitchen, ambient: "earth", blurb: "Lived-in kitchen light." },
  elysium: { name: "Elysium", art: "/art/codex/elysium.jpg", ambient: "stone", blurb: "Crystal plenty, fading." },
  nevaeh: { name: "Nevaeh", art: ART.valley, ambient: "nevaeh", blurb: "Purple cloud and gold." },
};
function newCode() {
  const a = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 4; i++) s += a[Math.floor(Math.random() * a.length)];
  return s;
}

export function TicTacView() {
  const [you, setYou] = useState<FightFighterId | null>(null);
  const [foe, setFoe] = useState<FightFighterId | null>(null);
  const [world, setWorld] = useState<WorldId>("nevaeh");
  const [mode, setMode] = useState<"pick" | "cpu" | "link" | "hot">("pick");
  const [code] = useState(newCode);
  const [join, setJoin] = useState("");
  const [room, setRoom] = useState<string | null>(null);
  const [hostSeat, setHostSeat] = useState(false);
  const [score, setScore] = useState<Record<string, number>>({});

  const addWin = useCallback((id: FightFighterId) => {
    setScore((s) => ({ ...s, [id]: (s[id] ?? 0) + 1 }));
  }, []);

  if ((mode === "cpu" || mode === "hot") && you && foe) {
    return (
      <CpuMatch
        you={you}
        foe={foe}
        world={world}
        score={score}
        hot={mode === "hot"}
        onWin={addWin}
        onWorld={setWorld}
        onExit={() => setMode("pick")}
      />
    );
  }
  if (mode === "link" && room && you) {
    return (
      <OnlineMatch
        room={room}
        you={you}
        world={world}
        hostSeat={hostSeat}
        score={score}
        onWin={addWin}
        onWorld={setWorld}
        onExit={() => {
          setMode("pick");
          setRoom(null);
        }}
      />
    );
  }

  return (
    <div className="relative flex h-svh min-h-0 flex-col overflow-hidden bg-ink text-parchment">
      <img src={WORLDS[world].art} alt="" className="absolute inset-0 h-full w-full object-cover opacity-15" />
      <div className="absolute inset-0 bg-ink/80" />
      <header className="relative z-10 flex shrink-0 items-center gap-3 px-4 py-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <Button variant="quiet" onClick={() => useGame.getState().backToTitle()}>
          Main Menu
        </Button>
        <div>
          <p className="font-display text-sm tracking-[0.22em] text-gold uppercase">Three in a line</p>
          <h1 className="font-display text-3xl font-semibold">
            <span className="text-[#ff2bd6]">X</span>
            <span className="text-[#12d8ff]">O</span>
          </h1>
          <p className="text-xs text-silver">
            <span className="text-[#ff2bd6]">X neon pink</span>
            {" · "}
            <span className="text-[#12d8ff]">O neon blue</span>
          </p>
        </div>
      </header>
      <main
        className="relative z-10 mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col overflow-y-auto px-4 pb-6"
        style={{ overscrollBehavior: "none", WebkitOverflowScrolling: "touch" }}
      >
        <p className="relative z-10 shrink-0 text-silver">
          Pink X. Blue O. Pick who you are and who they face.
        </p>
        <DuelPick
          embed
          hero={you}
          foe={foe}
          startLabel="Play Computer"
          passLabel="Pass & Play"
          pickLabel="Choose Your Character"
          foeLabel="Choose Opponent"
          onPickHero={setYou}
          onPickFoe={setFoe}
          onClear={() => {
            setYou(null);
            setFoe(null);
          }}
          onStart={() => {
            playClick();
            setMode("cpu");
          }}
          onPass={() => {
            playClick();
            setMode("hot");
          }}
          extra={
            <>
              <p className="mt-5 text-xs tracking-[0.16em] text-gold uppercase">World</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                {(Object.keys(WORLDS) as WorldId[]).map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setWorld(id)}
                    className={cn(
                      "overflow-hidden rounded-[16px] border text-left",
                      world === id ? "border-gold ring-2 ring-gold/40" : "border-gold/25",
                    )}
                  >
                    <img src={WORLDS[id].art} alt="" className="h-12 w-full object-cover" />
                    <div className="px-3 py-2">
                      <p className="font-display text-lg leading-tight">{WORLDS[id].name}</p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          }
        />
      </main>
    </div>
  );
}

function CharGrid({
  value,
  onPick,
}: {
  value: FightFighterId | null;
  onPick: (id: FightFighterId) => void;
}) {
  return (
    <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-7">
      {ROSTER.map((id) => {
        const f = FIGHTERS[id];
        return (
          <button
            key={id}
            type="button"
            onClick={() => {
              playClick();
              onPick(id);
            }}
            className={cn(
              "overflow-hidden rounded-[12px] border bg-ink-soft/90 text-left",
              value === id ? "border-gold ring-2 ring-gold/40" : "border-gold/20",
            )}
          >
            <img src={f.art} alt="" className="aspect-3/4 w-full object-cover object-top" />
            <p className="px-1 py-1 text-center font-display text-[10px] leading-tight break-words sm:text-xs">{f.name}</p>
          </button>
        );
      })}
    </div>
  );
}

function CpuMatch({
  you,
  foe,
  world,
  score,
  onWin,
  onWorld,
  onExit,
  hot = false,
}: {
  you: FightFighterId;
  foe: FightFighterId;
  world: WorldId;
  score: Record<string, number>;
  onWin: (id: FightFighterId) => void;
  onWorld: (w: WorldId) => void;
  onExit: () => void;
  hot?: boolean;
}) {
  const [board, setBoard] = useState(emptyBoard);
  const [turn, setTurn] = useState<Side>(1);
  const [thinking, setThinking] = useState(false);
  const end = outcome(board);
  const line = winningLine(board);
  const youSide: Side = 1;
  const cpuSide: Side = 2;

  useEffect(() => {
    if (hot || end || turn !== cpuSide) return;
    setThinking(true);
    const t = window.setTimeout(() => {
      const i = cpuMove(board, cpuSide);
      const next = place(board, i, cpuSide);
      if (next) {
        setBoard(next);
        const o = outcome(next);
        if (o === cpuSide) {
          playChime();
          onWin(foe);
        } else if (o === "draw") playClick();
        setTurn(youSide);
      }
      setThinking(false);
    }, 520);
    return () => window.clearTimeout(t);
  }, [board, turn, end, cpuSide, youSide, foe, onWin]);

  const tap = (i: number) => {
    if (end || thinking || turn !== youSide) return;
    const next = place(board, i, youSide);
    if (!next) return;
    playClick();
    setBoard(next);
    const o = outcome(next);
    if (o === youSide) {
      playHeal();
      onWin(you);
    } else if (o === "draw") playChime();
    else setTurn(cpuSide);
  };

  const reset = () => {
    setBoard(emptyBoard());
    setTurn(1);
    setThinking(false);
  };

  return (
    <BoardView
      you={you}
      foe={foe}
      youSide={youSide}
      world={world}
      onWorld={onWorld}
      board={board}
      turn={turn}
      end={end}
      line={line}
      locked={thinking || turn !== youSide}
      score={score}
      status={
        end === youSide
          ? FIGHTERS[you].name + " WINS"
          : end === cpuSide
            ? FIGHTERS[foe].name + " WINS"
            : end === "draw"
              ? "Draw. The board holds."
              : thinking
                ? FIGHTERS[foe].name + " is thinking."
                : "Your mark. Pink X."
      }
      onTap={tap}
      onExit={onExit}
      onAgain={reset}
    />
  );
}

function OnlineMatch({
  room,
  you,
  world,
  hostSeat,
  score,
  onWin,
  onWorld,
  onExit,
}: {
  room: string;
  you: FightFighterId;
  world: WorldId;
  hostSeat: boolean;
  score: Record<string, number>;
  onWin: (id: FightFighterId) => void;
  onWorld: (w: WorldId) => void;
  onExit: () => void;
}) {
  const p2p = useP2PRoom({ room, name: you });
  const friend = p2p.peers[0];
  const foeId = (friend?.name as FightFighterId) || null;
  const foeReady = !!foeId && foeId in FIGHTERS;
  const [board, setBoard] = useState(emptyBoard);
  const [turn, setTurn] = useState<Side>(1);
  const youSide: Side = hostSeat ? 1 : 2;
  const end = outcome(board);
  const line = winningLine(board);

  useEffect(() => {
    p2p.send({ t: "hello", char: you, world });
  }, [p2p, you, world]);

  useEffect(
    () =>
      p2p.onMessage((_from, data) => {
        const msg = data as { t?: string; i?: number; world?: WorldId };
        if (msg.t === "move" && typeof msg.i === "number") {
          setBoard((cur) => {
            const side: Side = hostSeat ? 2 : 1;
            const next = place(cur, msg.i!, side);
            if (!next) return cur;
            const o = outcome(next);
            if (o === side) {
              playChime();
              if (foeId) onWin(foeId);
            } else if (o === "draw") playClick();
            return next;
          });
          setTurn((t) => (t === 1 ? 2 : 1));
        }
        if (msg.t === "reset") {
          setBoard(emptyBoard());
          setTurn(1);
        }
        if (msg.t === "world" && msg.world && msg.world in WORLDS) onWorld(msg.world);
      }),
    [p2p, p2p.onMessage, hostSeat, onWorld, onWin, you, foeId],
  );

  const tap = (i: number) => {
    if (end || turn !== youSide || !foeReady) return;
    const next = place(board, i, youSide);
    if (!next) return;
    playClick();
    setBoard(next);
    p2p.send({ t: "move", i });
    const o = outcome(next);
    if (o === youSide) {
      playHeal();
      onWin(you);
    } else if (o === "draw") playChime();
    setTurn((t) => (t === 1 ? 2 : 1));
  };

  const reset = () => {
    setBoard(emptyBoard());
    setTurn(1);
    p2p.send({ t: "reset" });
  };

  if (!foeReady) {
    return (
      <div className="relative flex h-svh max-h-svh flex-col overflow-hidden bg-ink p-4 text-parchment" style={{ overscrollBehavior: "none" }}>
        <img src={WORLDS[world].art} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
        <div className="absolute inset-0 bg-ink/70" />
        <div className="relative z-10 flex flex-col">
          <Button variant="quiet" className="self-start" onClick={onExit}>
            Back
          </Button>
          <h1 className="mt-6 font-display text-3xl">Board {room.replace("tt", "")}</h1>
          <p className="mt-2 text-silver">Waiting for a friend. You are {FIGHTERS[you].name}.</p>
          <p className="mt-6 font-display text-5xl tracking-[0.2em] text-gold">{room.replace("tt", "")}</p>
          <p className="mt-4 text-sm text-muted">{p2p.joined ? "Listening for a second device." : "Opening the room."}</p>
        </div>
      </div>
    );
  }

  return (
    <BoardView
      you={you}
      foe={foeId}
      youSide={youSide}
      world={world}
      onWorld={(w) => {
        onWorld(w);
        p2p.send({ t: "world", world: w });
      }}
      board={board}
      turn={turn}
      end={end}
      line={line}
      locked={turn !== youSide}
      score={score}
      status={
        end === youSide
          ? FIGHTERS[you].name + " WINS"
          : end && end !== "draw"
            ? FIGHTERS[foeId].name + " WINS"
            : end === "draw"
              ? "Draw. The board holds."
              : turn === youSide
                ? "Your mark."
                : "Waiting on " + FIGHTERS[foeId].name + "."
      }
      onTap={tap}
      onExit={onExit}
      onAgain={reset}
    />
  );
}

function BoardView({
  you,
  foe,
  youSide,
  world,
  onWorld,
  board,
  turn,
  end,
  line,
  locked,
  score,
  status,
  onTap,
  onExit,
  onAgain,
}: {
  you: FightFighterId;
  foe: FightFighterId;
  youSide: Side;
  world: WorldId;
  onWorld: (w: WorldId) => void;
  board: Cell[];
  turn: Side;
  end: ReturnType<typeof outcome>;
  line: [number, number, number] | null;
  locked: boolean;
  score: Record<string, number>;
  status: string;
  onTap: (i: number) => void;
  onExit: () => void;
  onAgain: () => void;
}) {
  const open = useMemo(() => new Set(legal(board)), [board]);
  const winnerId = end === 1 ? (youSide === 1 ? you : foe) : end === 2 ? (youSide === 2 ? you : foe) : null;

  useEffect(() => {
    setAmbient(WORLDS[world].ambient);
  }, [world]);

  return (
    <div className="relative flex h-svh min-h-0 flex-col overflow-hidden bg-ink text-parchment">
      <img src={WORLDS[world].art} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" />
      <div className="absolute inset-0 bg-ink/55" />
      <header className="relative z-10 flex items-center justify-between gap-3 px-4 py-3 pt-[max(0.6rem,env(safe-area-inset-top))]">
        <Button variant="quiet" onClick={onExit}>
          Lobby
        </Button>
        <p className="font-display text-sm tracking-[0.2em] text-gold uppercase">{WORLDS[world].name}</p>
        <span className="w-16" />
      </header>
      <div className="relative z-10 mx-auto flex w-full max-w-xl items-center justify-between gap-3 px-4">
        <Seat who={you} side={youSide} active={!end && turn === youSide} score={score[you] ?? 0} label="You" />
        <p className="font-display text-gold">vs</p>
        <Seat
          who={foe}
          side={youSide === 1 ? 2 : 1}
          active={!end && turn !== youSide}
          score={score[foe] ?? 0}
          label="Across"
        />
      </div>
      <div className="relative z-10 mt-2 flex justify-center gap-2 px-4">
        {(Object.keys(WORLDS) as WorldId[]).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onWorld(id)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs uppercase tracking-[0.14em]",
              world === id ? "border-gold text-gold" : "border-gold/25 text-silver",
            )}
          >
            {WORLDS[id].name}
          </button>
        ))}
      </div>
      <p className="relative z-10 mt-2 px-4 text-center text-silver">{status}</p>
      <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-3 py-2">
        <div
          className="grid shrink-0 grid-cols-3 grid-rows-3 gap-2"
          style={{
            width: "min(92vw, calc(100svh - 15rem - env(safe-area-inset-top) - env(safe-area-inset-bottom)), 28rem)",
            height: "min(92vw, calc(100svh - 15rem - env(safe-area-inset-top) - env(safe-area-inset-bottom)), 28rem)",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gridTemplateRows: "repeat(3, minmax(0, 1fr))",
          }}
        >
        {board.map((cell, i) => {
          const win = line?.includes(i);
          return (
            <button
              key={i}
              type="button"
              disabled={locked || !!end || !open.has(i)}
              onClick={() => onTap(i)}
              className={cn(
                "relative box-border min-h-0 min-w-0 overflow-hidden rounded-[14px] border p-0",
                cell === 1
                  ? "border-[#3cf0ff] bg-[#12d8ff]"
                  : cell === 2
                    ? "border-[#ff4ae0] bg-[#ff2bd6]"
                    : "border-white/20 bg-ink/55 backdrop-blur-sm",
                win ? "ring-2 ring-gold" : "",
                !cell && !locked && !end ? "hover:border-gold" : "",
              )}
              style={
                cell === 1
                  ? { boxShadow: "0 0 18px #3cf0ff, inset 0 0 24px #3cf0ff", WebkitAppearance: "none", appearance: "none" }
                  : cell === 2
                    ? { boxShadow: "0 0 18px #ff4ae0, inset 0 0 24px #ff2bd6", WebkitAppearance: "none", appearance: "none" }
                    : { WebkitAppearance: "none", appearance: "none" }
              }
            >
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                {cell === 1 ? <MarkX /> : cell === 2 ? <MarkO /> : null}
              </span>
            </button>
          );
        })}
        </div>
      </div>
      {end && end !== "draw" && winnerId ? (
        <WinnerSplash
          id={winnerId}
          youScore={score[you] ?? 0}
          foeScore={score[foe] ?? 0}
          youName={FIGHTERS[you].name}
          foeName={FIGHTERS[foe].name}
          onAgain={onAgain}
          onExit={onExit}
        />
      ) : end ? (
        <div className="relative z-10 mt-5 flex justify-center gap-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Button variant="gold" onClick={onAgain}>
            Again
          </Button>
          <Button variant="ghost" onClick={onExit}>
            Lobby
          </Button>
        </div>
      ) : (
        <p className="relative z-10 mt-3 px-4 text-center text-xs text-muted">
          {youSide === 1 ? FIGHTERS[you].name : FIGHTERS[foe].name} places the first X.
        </p>
      )}
    </div>
  );
}
function Seat({
  who,
  side,
  active,
  score,
  label,
}: {
  who: FightFighterId;
  side: Side;
  active: boolean;
  score: number;
  label: string;
}) {
  const f = FIGHTERS[who];
  return (
    <div className={cn("flex items-center gap-2 rounded-[14px] border bg-ink/60 px-2 py-1", active ? "border-gold" : "border-gold/20")}>
      <img src={f.art} alt="" className="h-12 w-10 shrink-0 rounded-[8px] object-cover object-top" />
      <div className="min-w-0 flex-1 overflow-hidden">
        <p className="text-[10px] tracking-[0.16em] text-gold uppercase">{label}</p>
        <p className="font-display text-[15px] leading-tight break-words">{f.name}</p>
        <p className="text-xs" style={{ color: side === 1 ? "#ff4ae0" : "#3cf0ff" }}>
          {side === 1 ? "X" : "O"} · {score}
        </p>
      </div>
    </div>
  );
}

function MarkX() {
  return (
    <svg viewBox="0 0 100 100" className="h-[70%] w-[70%] max-h-full max-w-full shrink-0" aria-hidden>
      <line
        x1="18"
        y1="18"
        x2="82"
        y2="82"
        stroke="#ff4ae0"
        strokeWidth="14"
        strokeLinecap="round"
        style={{ filter: "drop-shadow(0 0 6px #ff4ae0) drop-shadow(0 0 16px #ff2bd6)" }}
      />
      <line
        x1="82"
        y1="18"
        x2="18"
        y2="82"
        stroke="#ff4ae0"
        strokeWidth="14"
        strokeLinecap="round"
        style={{ filter: "drop-shadow(0 0 6px #ff4ae0) drop-shadow(0 0 16px #ff2bd6)" }}
      />
    </svg>
  );
}

function MarkO() {
  return (
    <svg viewBox="0 0 100 100" className="h-[70%] w-[70%] max-h-full max-w-full shrink-0" aria-hidden>
      <circle
        cx="50"
        cy="50"
        r="30"
        fill="none"
        stroke="#3cf0ff"
        strokeWidth="12"
        style={{ filter: "drop-shadow(0 0 6px #3cf0ff) drop-shadow(0 0 16px #12d8ff)" }}
      />
    </svg>
  );
}
