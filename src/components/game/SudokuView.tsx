import { Button } from "@/components/ui/button";
import { SoundToggle } from "@/components/ui/sound-toggle";
import { playChime, playClick, playRefuse } from "@/game/audio";
import { playPortrait, portraitFit } from "@/game/play-art";
import { CHARACTERS } from "@/game/characters";
import { useGame } from "@/game/store";
import type { CharacterId } from "@/game/types";
import { cn } from "@/lib/cn";
import { conflicts, isComplete, makePuzzle, type Diff } from "@/sudoku/engine";
import { useMemo, useState } from "react";
import { RosterPick } from "./RosterPick";
import { WinnerSplash } from "./WinnerSplash";

const BLUE = "#12d8ff";

export function SudokuView() {
  const [who, setWho] = useState<CharacterId | null>(null);
  const [diff, setDiff] = useState<Diff>("normal");
  if (!who) {
    return (
      <RosterPick
        title="Sudoku"
        blurb="Fill every row, column, and box with 1 to 9. Pick a companion and a mode."
        extra={
          <div className="px-4">
            <p className="mt-2 text-xs tracking-[0.16em] text-gold uppercase">Mode</p>
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
          </div>
        }
        beside={
          <div>
            <p className="text-[10px] tracking-[0.16em] text-[#ff2bd6] uppercase">How to play</p>
            <ul className="mt-1 space-y-1 text-[11px] leading-snug text-parchment">
              <li>Put 1–9 in every empty square.</li>
              <li>Each row uses 1–9 once.</li>
              <li>Each column uses 1–9 once.</li>
              <li>Each pink 3×3 box uses 1–9 once.</li>
              <li>Blue numbers are locked.</li>
              <li>Hint fills one square. Easy gets 2, Normal gets 1.</li>
            </ul>
          </div>
        }
        onPick={(id) => {
          playClick();
          setWho(id);
        }}
      />
    );
  }
  return <Play who={who} diff={diff} onLobby={() => setWho(null)} />;
}

function Play({ who, diff, onLobby }: { who: CharacterId; diff: Diff; onLobby: () => void }) {
  const hintMax = diff === "easy" ? 2 : diff === "normal" ? 1 : 0;
  const [pack, setPack] = useState(() => makePuzzle(diff));
  const [board, setBoard] = useState(() => pack.given.slice());
  const [sel, setSel] = useState<number | null>(null);
  const [won, setWon] = useState(false);
  const [hints, setHints] = useState(hintMax);
  const [glow, setGlow] = useState<number | null>(null);
  const given = pack.given;
  const bad = useMemo(() => conflicts(board), [board]);
  const name = CHARACTERS.find((c) => c.id === who)?.name ?? who;

  const deal = () => {
    playClick();
    const next = makePuzzle(diff);
    setPack(next);
    setBoard(next.given.slice());
    setSel(null);
    setWon(false);
    setHints(hintMax);
    setGlow(null);
  };

  const put = (n: number) => {
    if (sel == null || given[sel]) return;
    const next = board.slice();
    next[sel] = n;
    setBoard(next);
    if (isComplete(next)) {
      playChime();
      setWon(true);
    } else if (n && conflicts(next)[sel]) playRefuse();
    else playClick();
  };

  const clear = () => {
    if (sel == null || given[sel]) return;
    playClick();
    const next = board.slice();
    next[sel] = 0;
    setBoard(next);
  };

  const hint = () => {
    if (hints <= 0 || won) return;
    const empties = board.map((v, i) => (!v && !given[i] ? i : -1)).filter((i) => i >= 0);
    if (!empties.length) return;
    const i = sel != null && empties.includes(sel) ? sel : empties[(Math.random() * empties.length) | 0]!;
    const next = board.slice();
    next[i] = pack.solved[i]!;
    setBoard(next);
    setSel(i);
    setGlow(i);
    setHints((h) => h - 1);
    playChime();
    window.setTimeout(() => setGlow(null), 900);
    if (isComplete(next)) setWon(true);
  };

  return (
    <div
      className="relative flex min-h-0 flex-col overflow-hidden bg-ink text-parchment"
      style={{ height: "var(--app-h, 100%)", overscrollBehavior: "none" }}
    >
      <header className="shrink-0 px-3 pb-1 pt-[max(0.55rem,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button variant="quiet" className="shrink-0 whitespace-nowrap" onClick={() => useGame.getState().backToTitle()}>
              Main Menu
            </Button>
            <Button variant="quiet" className="shrink-0 whitespace-nowrap" onClick={onLobby}>
              Lobby
            </Button>
          </div>
          <SoundToggle />
        </div>
        <div className="mt-0.5 flex items-baseline justify-center gap-2">
          <h1 className="font-display text-xl font-semibold leading-none">Sudoku</h1>
          <p className="text-[10px] tracking-[0.16em] text-gold uppercase">{diff}</p>
        </div>
      </header>
      <div className="flex min-h-0 flex-1 flex-col px-3 pb-[max(0.4rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto flex min-h-0 w-full max-w-md flex-1 items-center justify-center" style={{ containerType: "size" }}>
          <div
            className="relative grid grid-cols-9 overflow-hidden rounded-[12px] bg-[#0b0b12]"
            style={{
              width: "min(100cqw, 100cqh)",
              aspectRatio: "1",
              border: "4px solid #ff2bd6",
              boxShadow: "0 0 18px #ff2bd6",
            }}
          >
            {board.map((v, i) => {
              const r = (i / 9) | 0;
              const c = i % 9;
              const locked = given[i] !== 0;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSel(i)}
                  className={cn(
                    "grid min-h-0 min-w-0 place-items-center font-display text-[clamp(0.7rem,3.4cqw,1.05rem)] leading-none",
                    sel === i ? "bg-[#ff2bd6]/25" : "",
                    glow === i ? "bg-[#ff2bd6]/40 text-[#ff2bd6]" : "",
                    bad[i] ? "text-[#ff4ae0]" : locked ? "text-[#12d8ff]" : "text-parchment",
                  )}
                  style={{
                    borderTop: r % 3 === 0 ? "none" : "1px solid rgba(255,255,255,0.14)",
                    borderLeft: c % 3 === 0 ? "none" : "1px solid rgba(255,255,255,0.14)",
                  }}
                >
                  {v || ""}
                </button>
              );
            })}
            <div className="pointer-events-none absolute inset-0 z-10">
              <div className="absolute top-0 bottom-0 w-[5px] bg-[#ff2bd6] shadow-[0_0_10px_#ff2bd6]" style={{ left: "33.333%", marginLeft: "-2.5px" }} />
              <div className="absolute top-0 bottom-0 w-[5px] bg-[#ff2bd6] shadow-[0_0_10px_#ff2bd6]" style={{ left: "66.666%", marginLeft: "-2.5px" }} />
              <div className="absolute left-0 right-0 h-[5px] bg-[#ff2bd6] shadow-[0_0_10px_#ff2bd6]" style={{ top: "33.333%", marginTop: "-2.5px" }} />
              <div className="absolute left-0 right-0 h-[5px] bg-[#ff2bd6] shadow-[0_0_10px_#ff2bd6]" style={{ top: "66.666%", marginTop: "-2.5px" }} />
            </div>
          </div>
        </div>
        <div className="mx-auto mt-2 grid w-full max-w-md shrink-0 grid-cols-5 gap-1.5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => put(n)}
              className="h-10 rounded-[12px] border border-[#ff4ae0]/40 bg-[#1a1020] font-display text-lg text-[#ff2bd6]"
            >
              {n}
            </button>
          ))}
          <button type="button" onClick={clear} className="h-10 rounded-[12px] border border-gold/30 text-xs text-silver">
            Clear
          </button>
        </div>
        <div className="mt-2 flex shrink-0 items-center justify-center gap-2">
          <div className="flex w-12 flex-col items-center overflow-hidden rounded-[8px] ring-2 ring-[#ff2bd6]">
            <img src={playPortrait(who)} alt="" className={`h-10 w-12 ${portraitFit(who)}`} />
            <p className="w-full truncate bg-[#120814] px-0.5 text-center text-[8px] leading-3" style={{ color: BLUE }}>
              {name}
            </p>
          </div>
          {hintMax > 0 ? (
            <Button variant="pink" className="px-3 text-xs" onClick={hint} disabled={hints <= 0 || won}>
              Hint {hints}
            </Button>
          ) : null}
          <Button variant="ghost" onClick={deal}>
            New puzzle
          </Button>
        </div>
      </div>
      {won ? (
        <WinnerSplash
          id={who}
          youScore={1}
          foeScore={0}
          youName={name}
          foeName="Sudoku"
          onAgain={deal}
          onExit={onLobby}
        />
      ) : null}
    </div>
  );
}
