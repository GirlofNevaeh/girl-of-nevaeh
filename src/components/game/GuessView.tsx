import { Button } from "@/components/ui/button";
import { SoundToggle } from "@/components/ui/sound-toggle";
import { FIGHTERS, type FightFighterId } from "@/fight/engine";
import { playChime, playClick, playHeal, playRefuse } from "@/game/audio";
import { playPortrait, portraitFit } from "@/game/play-art";
import { useGame } from "@/game/store";
import { cn } from "@/lib/cn";
import { useP2PRoom } from "@/lib/multiplayer/use-p2p-room";
import {
  MAX_GUESSES,
  PLACES,
  RANGE,
  allLocked,
  loadHigh,
  lockDigits,
  pad,
  randomSecret,
  saveHigh,
  scoreFor,
  validSecret,
  type Diff,
} from "@/guess/engine";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { DuelPick } from "./DuelPick";
import { WinnerSplash } from "./WinnerSplash";

function newCode() {
  const a = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 4; i++) s += a[Math.floor(Math.random() * a.length)];
  return s;
}

export function GuessView() {
  const [you, setYou] = useState<FightFighterId | null>(null);
  const [foe, setFoe] = useState<FightFighterId | null>(null);
  const [diff, setDiff] = useState<Diff>("normal");
  const [mode, setMode] = useState<"pick" | "cpu" | "hot" | "link">("pick");
  const [code] = useState(newCode);
  const [join, setJoin] = useState("");
  const [room, setRoom] = useState<string | null>(null);
  const [hostSeat, setHostSeat] = useState(false);
  const [hi, setHi] = useState(loadHigh);

  if (mode === "cpu" && you && foe) {
    return <CpuPlay you={you} foe={foe} diff={diff} hi={hi} onHi={setHi} onLobby={() => setMode("pick")} />;
  }
  if (mode === "hot" && you && foe) {
    return <HotPlay you={you} foe={foe} diff={diff} hi={hi} onHi={setHi} onLobby={() => setMode("pick")} />;
  }
  if (mode === "link" && room && you) {
    return (
      <OnlinePlay
        room={room}
        you={you}
        host={hostSeat}
        diff={diff}
        hi={hi}
        onHi={setHi}
        onLobby={() => {
          setMode("pick");
          setRoom(null);
        }}
      />
    );
  }

  return (
    <div
      className="relative flex min-h-0 flex-col overflow-hidden bg-ink text-parchment"
      style={{ height: "var(--app-h, 100svh)" }}
    >
      <header className="relative z-10 shrink-0 px-4 py-3 pt-[max(0.7rem,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between gap-2">
          <Button variant="quiet" onClick={() => useGame.getState().backToTitle()}>
            Main Menu
          </Button>
          <SoundToggle />
        </div>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight">Number Guess!</h1>
        <p className="mt-1 text-sm text-silver">Guess the number they are thinking of. Locked digits stay.</p>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[max(1.6rem,env(safe-area-inset-bottom))]">
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
            <div>
              <p className="text-xs tracking-[0.16em] text-gold uppercase">Mode</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {(["easy", "normal", "hard"] as Diff[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDiff(d)}
                    className={cn(
                      "min-h-11 rounded-[12px] border px-2 capitalize",
                      diff === d ? "border-[#ff4ae0] bg-[#ff2bd6] text-ink shadow-[0_0_14px_#ff4ae0]" : "border-gold/30 text-silver",
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-silver">
                Easy 1–20 · Normal 1–50 · Hard 1–99. Best {hi[diff]} · 10 guesses
              </p>
              <p className="mt-1 text-xs text-[#12d8ff]">Guesses outside that range are not allowed.</p>
            </div>
          }
          footer={
            <div className="rounded-[18px] border border-[#3cf0ff]/35 bg-ink-soft/80 p-4">
              <p className="font-display text-lg">Play online</p>
              <p className="mt-1 text-sm text-silver">Two devices. Host a room or join with a code.</p>
              <div className="mt-3 flex flex-wrap items-end gap-3">
                <div>
                  <p className="text-[10px] tracking-[0.16em] text-gold uppercase">Your code</p>
                  <p className="font-display text-3xl tracking-[0.2em] text-[#12d8ff]">{code}</p>
                </div>
                <Button
                  variant="blue"
                  disabled={!you}
                  onClick={() => {
                    playClick();
                    setHostSeat(true);
                    setRoom("ng" + code);
                    setMode("link");
                  }}
                >
                  Host
                </Button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <input
                  value={join}
                  onChange={(e) => setJoin(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4))}
                  placeholder="CODE"
                  className="h-11 w-28 rounded-[12px] border border-[#ff4ae0]/40 bg-ink px-3 font-display tracking-[0.2em] uppercase"
                />
                <Button
                  variant="pink"
                  disabled={!you || join.length < 4}
                  onClick={() => {
                    playClick();
                    setHostSeat(false);
                    setRoom("ng" + join);
                    setMode("link");
                  }}
                >
                  Join
                </Button>
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
}

function CpuPlay({
  you,
  foe,
  diff,
  hi,
  onHi,
  onLobby,
}: {
  you: FightFighterId;
  foe: FightFighterId;
  diff: Diff;
  hi: Record<Diff, number>;
  onHi: (h: Record<Diff, number>) => void;
  onLobby: () => void;
}) {
  const [secret, setSecret] = useState(() => randomSecret(diff));
  const round = useGuessRound(diff, secret);
  const done = round.solved || round.guesses >= MAX_GUESSES;
  const pts = scoreFor(round.guesses, round.solved, diff);
  const winner = done ? (round.solved ? you : foe) : null;

  useEffect(() => {
    if (done && round.solved) onHi(saveHigh(diff, pts));
  }, [done, round.solved, pts, diff, onHi]);

  return (
    <Shell you={you} foe={foe} diff={diff} hi={hi[diff]} onLobby={onLobby} turnName={FIGHTERS[you].name}>
      <p className="text-center text-sm text-silver">{FIGHTERS[foe].name} is thinking of a number.</p>
      <GuessBoard round={round} tone="pink" disabled={done} />
      {done ? (
        <WinnerSplash
          id={winner ?? you}
          youScore={round.solved ? pts : 0}
          foeScore={0}
          youName={FIGHTERS[you].name}
          foeName={FIGHTERS[foe].name}
          onAgain={() => {
            const n = randomSecret(diff);
            setSecret(n);
            round.reset(n);
          }}
          onExit={onLobby}
        />
      ) : null}
    </Shell>
  );
}

function HotPlay({
  you,
  foe,
  diff,
  hi,
  onHi,
  onLobby,
}: {
  you: FightFighterId;
  foe: FightFighterId;
  diff: Diff;
  hi: Record<Diff, number>;
  onHi: (h: Record<Diff, number>) => void;
  onLobby: () => void;
}) {
  const [phase, setPhase] = useState<"setA" | "setB" | "guessB" | "guessA" | "end">("setA");
  const [secretA, setSecretA] = useState<number | null>(null);
  const [secretB, setSecretB] = useState<number | null>(null);
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const guessB = useGuessRound(diff);
  const guessA = useGuessRound(diff);

  const setter = phase === "setA" ? you : phase === "setB" ? foe : null;
  const guesser = phase === "guessB" ? foe : phase === "guessA" ? you : null;

  useEffect(() => {
    if (phase === "guessB" && secretA != null && (guessB.solved || guessB.guesses >= MAX_GUESSES)) {
      const pts = scoreFor(guessB.guesses, guessB.solved, diff);
      setScoreB(pts);
      const t = window.setTimeout(() => {
        guessA.reset(secretB ?? 1);
        setPhase("guessA");
      }, 700);
      return () => window.clearTimeout(t);
    }
    if (phase === "guessA" && secretB != null && (guessA.solved || guessA.guesses >= MAX_GUESSES)) {
      const pts = scoreFor(guessA.guesses, guessA.solved, diff);
      setScoreA(pts);
      onHi(saveHigh(diff, Math.max(pts, scoreB)));
      const t = window.setTimeout(() => setPhase("end"), 500);
      return () => window.clearTimeout(t);
    }
  }, [phase, guessB.solved, guessB.guesses, guessA.solved, guessA.guesses, secretA, secretB, diff, onHi, scoreB, guessA]);

  const winId = scoreA === scoreB ? (scoreA > 0 ? you : foe) : scoreA > scoreB ? you : foe;

  return (
    <Shell
      you={you}
      foe={foe}
      diff={diff}
      hi={hi[diff]}
      onLobby={onLobby}
      turnName={setter ? FIGHTERS[setter].name : guesser ? FIGHTERS[guesser].name : ""}
    >
      {phase === "setA" || phase === "setB" ? (
        <SetNumber
          who={setter!}
          diff={diff}
          onSet={(n) => {
            playClick();
            if (phase === "setA") {
              setSecretA(n);
              setPhase("setB");
            } else {
              setSecretB(n);
              guessB.reset(secretA ?? n);
              setPhase("guessB");
            }
          }}
        />
      ) : null}
      {phase === "guessB" && secretA != null ? (
        <>
          <p className="text-center text-sm text-silver">
            {FIGHTERS[foe].name} guesses {FIGHTERS[you].name}'s number.
          </p>
          <GuessBoard round={guessB} tone="blue" />
        </>
      ) : null}
      {phase === "guessA" && secretB != null ? (
        <>
          <p className="text-center text-sm text-silver">
            {FIGHTERS[you].name} guesses {FIGHTERS[foe].name}'s number.
          </p>
          <GuessBoard round={guessA} tone="pink" />
        </>
      ) : null}
      {phase === "end" ? (
        <WinnerSplash
          id={winId}
          youScore={scoreA}
          foeScore={scoreB}
          youName={FIGHTERS[you].name}
          foeName={FIGHTERS[foe].name}
          onAgain={() => {
            setPhase("setA");
            setSecretA(null);
            setSecretB(null);
            setScoreA(0);
            setScoreB(0);
            guessA.reset(1);
            guessB.reset(1);
          }}
          onExit={onLobby}
        />
      ) : null}
    </Shell>
  );
}

function OnlinePlay({
  room,
  you,
  host,
  diff,
  hi,
  onHi,
  onLobby,
}: {
  room: string;
  you: FightFighterId;
  host: boolean;
  diff: Diff;
  hi: Record<Diff, number>;
  onHi: (h: Record<Diff, number>) => void;
  onLobby: () => void;
}) {
  const p2p = useP2PRoom({ room, name: you });
  const friend = p2p.peers[0];
  const foeId = (friend?.name as FightFighterId) || null;
  const foeReady = !!foeId && foeId in FIGHTERS;
  const [mine, setMine] = useState<number | null>(null);
  const [theirs, setTheirs] = useState<number | null>(null);
  const [theirDone, setTheirDone] = useState<{ guesses: number; ok: boolean; pts: number } | null>(null);
  const round = useGuessRound(diff);
  const iAmDone = theirs != null && (round.solved || round.guesses >= MAX_GUESSES);
  const myPts = iAmDone ? scoreFor(round.guesses, round.solved, diff) : 0;

  useEffect(() => {
    p2p.send({ t: "hello", char: you, diff });
  }, [p2p, you, diff]);

  useEffect(
    () =>
      p2p.onMessage((_from, data) => {
        const msg = data as { t?: string; n?: number; guesses?: number; ok?: boolean; pts?: number };
        if (msg.t === "secret" && typeof msg.n === "number") {
          setTheirs(msg.n);
          round.reset(msg.n);
        }
        if (msg.t === "done" && typeof msg.guesses === "number") {
          setTheirDone({ guesses: msg.guesses, ok: !!msg.ok, pts: msg.pts ?? 0 });
        }
      }),
    [p2p, p2p.onMessage, round.reset],
  );

  useEffect(() => {
    if (!iAmDone || !theirs) return;
    p2p.send({ t: "done", guesses: round.guesses, ok: round.solved, pts: myPts });
    if (round.solved) onHi(saveHigh(diff, myPts));
  }, [iAmDone, theirs, round.guesses, round.solved, myPts, p2p, onHi, diff]);

  const bothDone = iAmDone && theirDone;
  const winId = bothDone ? (myPts >= (theirDone.pts ?? 0) ? you : foeId) : null;

  return (
    <Shell you={you} foe={foeId} diff={diff} hi={hi[diff]} onLobby={onLobby} turnName={FIGHTERS[you].name}>
      {!foeReady ? <p className="text-center text-sm text-[#12d8ff]">Waiting for a friend… code in lobby.</p> : null}
      {foeReady && mine == null ? (
        <SetNumber
          who={you}
          diff={diff}
          onSet={(n) => {
            setMine(n);
            p2p.send({ t: "secret", n });
          }}
        />
      ) : null}
      {foeReady && mine != null && theirs == null ? (
        <p className="text-center text-sm text-silver">Waiting for {FIGHTERS[foeId].name} to pick a number.</p>
      ) : null}
      {foeReady && theirs != null && !bothDone ? (
        <>
          <p className="text-center text-sm text-silver">Guess {FIGHTERS[foeId].name}'s number.</p>
          <GuessBoard round={round} tone={host ? "pink" : "blue"} disabled={iAmDone} />
          {iAmDone ? <p className="text-center text-sm text-gold">Waiting for {FIGHTERS[foeId].name}…</p> : null}
        </>
      ) : null}
      {bothDone && winId ? (
        <WinnerSplash
          id={winId}
          youScore={myPts}
          foeScore={theirDone.pts}
          youName={FIGHTERS[you].name}
          foeName={FIGHTERS[foeId].name}
          onAgain={onLobby}
          onExit={onLobby}
        />
      ) : null}
    </Shell>
  );
}

function useGuessRound(diff: Diff, start?: number) {
  const [secret, setSecret] = useState(() => start ?? randomSecret(diff));
  const [lock, setLock] = useState<boolean[]>(() => Array(PLACES).fill(false));
  const [slots, setSlots] = useState<(number | null)[]>(() => Array(PLACES).fill(null));
  const [guesses, setGuesses] = useState(0);
  const [solved, setSolved] = useState(false);
  const [log, setLog] = useState<number[]>([]);
  const [flash, setFlash] = useState<boolean[]>(() => Array(PLACES).fill(false));
  const [warn, setWarn] = useState("");

  const reset = useCallback((n: number) => {
    setSecret(n);
    setLock(Array(PLACES).fill(false));
    setSlots(Array(PLACES).fill(null));
    setGuesses(0);
    setSolved(false);
    setLog([]);
    setFlash(Array(PLACES).fill(false));
    setWarn("");
  }, []);

  const put = (d: number) => {
    if (solved || guesses >= MAX_GUESSES) return;
    setSlots((cur) => {
      const next = cur.slice();
      const empty = next.findIndex((v, idx) => !lock[idx] && v == null);
      const idx = empty >= 0 ? empty : [...next.keys()].reverse().find((i) => !lock[i]) ?? -1;
      if (idx >= 0) next[idx] = d;
      return next;
    });
  };

  const clear = () => {
    if (solved) return;
    setSlots((cur) => cur.map((v, i) => (lock[i] ? v : null)));
  };

  const submit = () => {
    if (solved || guesses >= MAX_GUESSES) return;
    if (slots.some((v) => v == null)) {
      playRefuse();
      return;
    }
    const n = Number(slots.join(""));
    if (!validSecret(n, diff)) {
      playRefuse();
      setWarn(`Only 1–${RANGE[diff]}`);
      return;
    }
    setWarn("");
    const nextLock = lockDigits(secret, n, lock);
    const g = guesses + 1;
    setGuesses(g);
    setLog((l) => [...l, n]);
    setFlash(nextLock.map((on, i) => on && !lock[i]));
    setLock(nextLock);
    setSlots(pad(n).split("").map((ch, i) => (nextLock[i] ? Number(ch) : null)));
    if (allLocked(nextLock)) {
      setSolved(true);
      playHeal();
    } else if (g >= MAX_GUESSES) playRefuse();
    else playChime();
  };

  return { lock, slots, guesses, solved, log, flash, warn, max: RANGE[diff], put, clear, submit, reset, secret };
}

function SetNumber({ who, diff, onSet }: { who: FightFighterId; diff: Diff; onSet: (n: number) => void }) {
  const [slots, setSlots] = useState<(number | null)[]>([null, null]);
  const [hide, setHide] = useState(true);
  const n = slots.every((v) => v != null) ? Number(slots.join("")) : null;
  const ok = n != null && validSecret(n, diff);
  return (
    <div className="mx-auto w-full max-w-sm">
      <p className="text-center text-sm text-silver">
        Hand the device to {FIGHTERS[who].name}. Pick a number from 1 to {RANGE[diff]}. Keep it secret.
      </p>
      <div className="mt-4 flex justify-center gap-3">
        {slots.map((v, i) => (
          <div
            key={i}
            className="grid h-24 w-20 place-items-center rounded-[18px] border-2 border-[#ff2bd6] bg-[#1a1020] font-display text-5xl text-[#ff2bd6] shadow-[0_0_16px_#ff2bd688]"
          >
            {v == null ? "" : hide ? "•" : v}
          </div>
        ))}
      </div>
      <Pad
        onDigit={(d) =>
          setSlots((cur) => {
            const next = cur.slice();
            const i = next.findIndex((v) => v == null);
            if (i >= 0) next[i] = d;
            else next[1] = d;
            return next;
          })
        }
        onClear={() => setSlots([null, null])}
      />
      <div className="mt-3 flex justify-center gap-2">
        <Button variant="ghost" onClick={() => setHide((h) => !h)}>
          {hide ? "Show" : "Hide"}
        </Button>
        <Button
          variant="pink"
          disabled={!ok}
          onClick={() => {
            if (ok && n != null) onSet(n);
          }}
        >
          Lock number
        </Button>
      </div>
    </div>
  );
}

function GuessBoard({
  round,
  tone,
  disabled,
}: {
  round: ReturnType<typeof useGuessRound>;
  tone: "pink" | "blue";
  disabled?: boolean;
}) {
  const pink = tone === "pink";
  const glow = pink ? "#ff2bd6" : "#12d8ff";
  const left = MAX_GUESSES - round.guesses;
  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="flex justify-center gap-2">
        {Array.from({ length: MAX_GUESSES }, (_, i) => (
          <span
            key={i}
            className="size-2.5 rounded-full"
            style={{ background: i < round.guesses ? glow : "rgba(255,255,255,0.15)", boxShadow: i < round.guesses ? `0 0 8px ${glow}` : undefined }}
          />
        ))}
      </div>
      <p className="mt-1 text-center text-xs tracking-[0.16em] text-gold uppercase">
        {left} guess{left === 1 ? "" : "es"} left · 1–{round.max}
      </p>
      {round.warn ? <p className="mt-1 text-center text-sm text-[#ff2bd6]">{round.warn}</p> : null}
      <div className="mt-3 flex justify-center gap-3">
        {round.slots.map((v, i) => {
          const locked = round.lock[i];
          return (
            <div
              key={i}
              className="grid h-24 w-20 place-items-center rounded-[18px] border-2 bg-[#1a1020] font-display text-5xl"
              style={{
                borderColor: locked ? glow : "rgba(255,255,255,0.18)",
                color: locked ? glow : "#f4ead8",
                boxShadow: locked ? `0 0 18px ${glow}` : undefined,
                animation: round.flash[i] ? "four-win-flash 0.6s ease" : undefined,
              }}
            >
              {v ?? ""}
            </div>
          );
        })}
      </div>
      <Pad
        onDigit={(d) => {
          if (!disabled) {
            playClick();
            round.put(d);
          }
        }}
        onClear={() => {
          if (!disabled) round.clear();
        }}
      />
      <div className="mt-3 flex justify-center">
        <Button variant={pink ? "pink" : "blue"} disabled={disabled} onClick={() => round.submit()}>
          Guess
        </Button>
      </div>
      {round.log.length ? (
        <p className="mt-3 text-center text-xs text-silver">Tried {round.log.map(pad).join(" · ")}</p>
      ) : null}
    </div>
  );
}

function Pad({ onDigit, onClear }: { onDigit: (d: number) => void; onClear: () => void }) {
  return (
    <div className="mx-auto mt-4 grid w-full max-w-xs grid-cols-5 gap-1.5">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onDigit(n)}
          className="h-11 rounded-[12px] border border-[#ff4ae0]/40 bg-[#1a1020] font-display text-lg text-[#ff2bd6]"
        >
          {n}
        </button>
      ))}
      <button type="button" onClick={onClear} className="col-span-5 h-10 rounded-[12px] border border-gold/30 text-xs text-silver">
        Clear
      </button>
    </div>
  );
}

function Shell({
  you,
  foe,
  diff,
  hi,
  onLobby,
  turnName,
  children,
}: {
  you: FightFighterId;
  foe: FightFighterId | null;
  diff: Diff;
  hi: number;
  onLobby: () => void;
  turnName: string;
  children: ReactNode;
}) {
  return (
    <div
      className="relative flex min-h-0 flex-col overflow-hidden bg-ink text-parchment"
      style={{ height: "var(--app-h, 100svh)", overscrollBehavior: "none" }}
    >
      <header className="shrink-0 px-3 pb-1 pt-[max(0.55rem,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2">
            <Button variant="quiet" onClick={() => useGame.getState().backToTitle()}>
              Main Menu
            </Button>
            <Button variant="quiet" onClick={onLobby}>
              Lobby
            </Button>
          </div>
          <SoundToggle />
        </div>
        <div className="mt-1 flex items-baseline justify-center gap-2">
          <h1 className="font-display text-xl font-semibold">Number Guess!</h1>
          <p className="text-[10px] tracking-[0.16em] text-gold uppercase">{diff} · 1–{RANGE[diff]}</p>
        </div>
      </header>
      <div className="mx-auto grid w-full max-w-md grid-cols-2 gap-2 px-3">
        <Seat id={you} label="You" tone="pink" />
        <Seat id={foe} label="Foe" tone="blue" />
      </div>
      <p className="mt-1 text-center font-display text-lg text-[#12d8ff]" style={{ WebkitTextStroke: "1px #ff2bd6" }}>
        {turnName ? `${turnName}'s Turn` : ""}
      </p>
      <p className="text-center text-[10px] tracking-[0.14em] text-gold uppercase">Best {hi}</p>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-[max(0.8rem,env(safe-area-inset-bottom))]">
        {children}
      </div>
    </div>
  );
}

function Seat({ id, label, tone }: { id: FightFighterId | null; label: string; tone: "pink" | "blue" }) {
  const ring = tone === "pink" ? "ring-[#ff2bd6]" : "ring-[#12d8ff]";
  return (
    <div className={cn("flex items-center gap-2 overflow-hidden rounded-[14px] bg-ink-soft/90 p-2 ring-2", ring)}>
      {id ? (
        <img src={playPortrait(id)} alt="" className={`h-12 w-10 rounded-[8px] ${portraitFit(id)}`} />
      ) : (
        <div className="h-12 w-10 rounded-[8px] bg-ink" />
      )}
      <div className="min-w-0">
        <p className="text-[10px] tracking-[0.14em] text-gold uppercase">{label}</p>
        <p className="truncate font-display text-sm">{id ? FIGHTERS[id].name : "—"}</p>
      </div>
    </div>
  );
}
