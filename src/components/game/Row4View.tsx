import { Button } from "@/components/ui/button";
import { FIGHTERS, type FightFighterId } from "@/fight/engine";
import { CHARACTERS } from "@/game/characters";
import { playBlueCoin, playClick, playFourWin, playPinkCoin } from "@/game/audio";
import { SoundToggle } from "@/components/ui/sound-toggle";
import { useGame } from "@/game/store";
import type { CharacterId } from "@/game/types";
import { cn } from "@/lib/cn";
import { COLS, ROWS, at, cpuMove, drop, emptyBoard, outcome, winningLine, type Cell, type Side } from "@/row4/engine";
import { playPortrait } from "@/game/play-art";
import { DuelPick } from "./DuelPick";
import { WinnerSplash } from "./WinnerSplash";
import { useEffect, useRef, useState } from "react";

type Mode = "cpu" | "hot";

export function Row4View() {
  const [you, setYou] = useState<CharacterId | null>(null);
  const [foe, setFoe] = useState<CharacterId | null>(null);
  const [mode, setMode] = useState<Mode | null>(null);
  const [board, setBoard] = useState<Cell[]>(emptyBoard);
  const [turn, setTurn] = useState<Side>(1);
  const [locked, setLocked] = useState(false);
  const [score, setScore] = useState<Record<string, number>>({});
  const [showWin, setShowWin] = useState(false);
  const awarded = useRef(false);
  const end = outcome(board);
  const win = winningLine(board);
  const youName = CHARACTERS.find((c) => c.id === you)?.name ?? "Pink";
  const foeName = CHARACTERS.find((c) => c.id === foe)?.name ?? "Blue";
  const youFace = you ? `/art/outlines/${you}.png?v=line2` : "";
  const foeFace = foe ? `/art/outlines/${foe}.png?v=line2` : "";

  useEffect(() => {
    if (!end || awarded.current || !you || !foe) return;
    awarded.current = true;
    if (end === 1) {
      playFourWin();
      setScore((s) => ({ ...s, [you]: (s[you] ?? 0) + 1 }));
    } else if (end === 2) {
      playFourWin();
      setScore((s) => ({ ...s, [foe]: (s[foe] ?? 0) + 1 }));
    }
  }, [end, you, foe]);

  useEffect(() => {
    if (end !== 1 && end !== 2) {
      setShowWin(false);
      return;
    }
    const t = window.setTimeout(() => setShowWin(true), 1000);
    return () => window.clearTimeout(t);
  }, [end]);

  useEffect(() => {
    if (mode !== "cpu" || turn !== 2 || end) return;
    setLocked(true);
    const t = window.setTimeout(() => {
      const col = cpuMove(board, 2);
      const next = drop(board, col, 2);
      if (next) {
        playBlueCoin();
        setBoard(next);
        if (!outcome(next)) setTurn(1);
      }
      setLocked(false);
    }, 380);
    return () => window.clearTimeout(t);
  }, [board, turn, end, mode]);

  const dropCol = (col: number) => {
    if (end || locked) return;
    if (mode === "cpu" && turn !== 1) return;
    const next = drop(board, col, turn);
    if (!next) return;
    if (turn === 1) playPinkCoin();
    else playBlueCoin();
    setBoard(next);
    if (!outcome(next)) setTurn(turn === 1 ? 2 : 1);
  };

  const reset = () => {
    playClick();
    awarded.current = false;
    setShowWin(false);
    setBoard(emptyBoard());
    setTurn(1);
    setLocked(false);
  };

  if (!mode || !you || !foe) {
    return (
      <div className="flex h-svh max-h-svh min-h-0 flex-col overflow-hidden bg-ink text-parchment" style={{ overscrollBehavior: "none" }}>
        <header className="px-4 py-4 pt-[max(1rem,env(safe-area-inset-top))]">
          <div className="flex items-center justify-between">
            <Button variant="quiet" onClick={() => useGame.getState().backToTitle()}>
              Main Menu
            </Button>
            <SoundToggle />
          </div>
          <p className="mt-4 font-display text-sm tracking-[0.22em] text-gold uppercase">4-in-a-row</p>
          <h1 className="font-display text-4xl font-semibold">Six, Seven</h1>
          <p className="mt-2 max-w-lg text-sm text-silver">
            Pick who you are and who sits across the board. First to four in a line wins. Score holds until you leave.
          </p>
        </header>
        <DuelPick
          hero={(you as FightFighterId | null) ?? null}
          foe={(foe as FightFighterId | null) ?? null}
          startLabel="Play Computer"
          passLabel="Pass & Play"
          onPickHero={(id) => setYou(id)}
          onPickFoe={(id) => setFoe(id)}
          onClear={() => {
            setYou(null);
            setFoe(null);
          }}
          onStart={() => {
            playClick();
            setMode("cpu");
            reset();
          }}
          onPass={() => {
            playClick();
            setMode("hot");
            reset();
          }}
        />
      </div>
    );
  }

  const status =
    end === 1
      ? `${youName}'s Turn`
      : end === 2
        ? `${foeName}'s Turn`
        : end === "draw"
          ? "The board is full."
          : turn === 1
            ? `${youName}'s Turn`
            : `${foeName}'s Turn`;

  return (
    <div className="relative flex h-svh max-h-svh min-h-0 flex-col overflow-hidden bg-ink text-parchment" style={{ overscrollBehavior: "none" }}>
      <header className="flex items-center justify-between gap-3 px-4 py-3 pt-[max(1rem,env(safe-area-inset-top))]">
        <Button
          variant="quiet"
          onClick={() => {
            setMode(null);
            reset();
          }}
        >
          Lobby
        </Button>
        <h1 className="font-display text-2xl">Six, Seven</h1>
        <SoundToggle />
      </header>
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 pb-6">
        <div className="grid grid-cols-2 gap-2">
          <Seat id={you} color="pink" score={score[you] ?? 0} active={turn === 1 && !end} />
          <Seat id={foe} color="blue" score={score[foe] ?? 0} active={turn === 2 && !end} />
        </div>
        <p className="mt-2 whitespace-nowrap text-center text-sm leading-none text-silver">{status}</p>
        <div className="mt-3 rounded-[20px] border border-[#3cf0ff]/35 bg-[#12182a] p-3">
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: COLS }, (_, c) => (
              <button
                key={"top" + c}
                type="button"
                className="min-h-9 rounded-[10px] bg-[#12d8ff]/20 text-xs text-[#3cf0ff]"
                disabled={!!end || locked}
                onClick={() => dropCol(c)}
              >
                ▼
              </button>
            ))}
            {Array.from({ length: ROWS }, (_, r) =>
              Array.from({ length: COLS }, (_, c) => {
                const cell = at(board, c, r);
                const lit = !!win?.some(([x, y]) => x === c && y === r);
                const face = cell === 1 ? youFace : cell === 2 ? foeFace : "";
                return (
                  <button
                    key={`${c}-${r}`}
                    type="button"
                    onClick={() => dropCol(c)}
                    disabled={!!end || locked}
                    className={cn(
                      "relative aspect-square overflow-hidden rounded-full border",
                      cell === 1 ? "border-[#ff4ae0] bg-[#ff2bd6]" : cell === 2 ? "border-[#3cf0ff] bg-[#12d8ff]" : "border-white/10 bg-[#0b0b12]",
                      lit ? "four-win-flash ring-2 ring-white" : "",
                    )}
                  >
                    {face ? (
                      <span className="pointer-events-none absolute inset-[16%] overflow-hidden rounded-full">
                        <img
                          src={face}
                          alt=""
                          draggable={false}
                          className={cn(
                            "h-full w-full object-contain object-center",
                            cell === 1
                              ? "contrast-[14] saturate-0 mix-blend-color-burn"
                              : "mix-blend-multiply",
                          )}
                        />
                        {cell === 1 ? (
                          <img
                            src={face}
                            alt=""
                            draggable={false}
                            className="absolute inset-0 h-full w-full object-contain object-center contrast-[10] saturate-0 mix-blend-multiply"
                          />
                        ) : null}
                      </span>
                    ) : null}
                  </button>
                );
              }),
            )}
          </div>
        </div>
        <div className="mt-4 flex justify-center gap-2">
          <Button variant="gold" onClick={reset}>
            Again
          </Button>
          <Button variant="ghost" onClick={() => setMode(null)}>
            Lobby
          </Button>
        </div>
      </main>
      {showWin && (end === 1 || end === 2) ? (
        <WinnerSplash
          id={end === 1 ? you : foe}
          youScore={score[you] ?? 0}
          foeScore={score[foe] ?? 0}
          youName={youName}
          foeName={foeName}
          onAgain={reset}
          onExit={() => {
            setMode(null);
            reset();
          }}
        />
      ) : null}
    </div>
  );
}

function fightId(id: CharacterId): FightFighterId {
  return (id in FIGHTERS ? id : "nancy") as FightFighterId;
}
function CharGrid({ value, onPick }: { value: CharacterId | null; onPick: (id: CharacterId) => void }) {
  return (
    <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-7">
      {CHARACTERS.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => {
            playClick();
            onPick(c.id);
          }}
          className={cn(
            "overflow-hidden rounded-[12px] border bg-ink-soft/90 text-left",
            value === c.id ? "border-gold ring-2 ring-gold/40" : "border-gold/20",
          )}
        >
          <img src={c.portrait} alt="" className="aspect-square w-full object-cover object-top" />
          <p className="px-1 py-1 text-center font-display text-[10px] leading-tight break-words sm:text-xs">{c.name}</p>
        </button>
      ))}
    </div>
  );
}

function Seat({
  id,
  color,
  score,
  active,
}: {
  id: CharacterId;
  color: "pink" | "blue";
  score: number;
  active: boolean;
}) {
  const c = CHARACTERS.find((ch) => ch.id === id);
  if (!c) return null;
  return (
    <div
      className={cn(
        "flex min-h-[4.6rem] min-w-0 items-center gap-2 rounded-[14px] border bg-ink/70 px-2 py-1.5",
        active ? (color === "pink" ? "border-[#ff4ae0]" : "border-[#3cf0ff]") : "border-gold/20",
      )}
    >
      <img src={c.portrait} alt="" className="size-12 shrink-0 rounded-[8px] object-cover object-top" />
      <div className="min-w-0 flex-1">
        <p className="font-display text-[12px] leading-tight break-words">{c.name}</p>
        <p className="text-[10px] tracking-[0.14em] uppercase" style={{ color: color === "pink" ? "#ff4ae0" : "#3cf0ff" }}>
          {color} · {score}
        </p>
      </div>
    </div>
  );
}
