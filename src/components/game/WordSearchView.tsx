import { Button } from "@/components/ui/button";
import { SoundToggle } from "@/components/ui/sound-toggle";
import { playChime, playClick } from "@/game/audio";
import { playPortrait, portraitFit } from "@/game/play-art";
import { CHARACTERS } from "@/game/characters";
import { useGame } from "@/game/store";
import type { CharacterId } from "@/game/types";
import { cn } from "@/lib/cn";
import { CATEGORIES, lineBetween, makeSearch, matchWord, type Category, type Diff, type Puzzle } from "@/wordsearch/engine";
import { useMemo, useRef, useState, type PointerEvent } from "react";
import { RosterPick } from "./RosterPick";

const BLUE = "#12d8ff";

export function WordSearchView() {
  const [who, setWho] = useState<CharacterId | null>(null);
  const [diff, setDiff] = useState<Diff>("normal");
  const [cat, setCat] = useState<Category>("random");
  if (!who) {
    return (
      <RosterPick
        title="Word Search"
        blurb="Find every hidden word. Drag a line through the letters."
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
            <p className="mt-4 text-xs tracking-[0.16em] text-gold uppercase">Category</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCat("random")}
                className={cn(
                  "col-span-2 min-h-16 rounded-[12px] border font-display text-xl",
                  cat === "random"
                    ? "mega-quiz-flash border-[#3cf0ff] bg-[#12d8ff] text-ink"
                    : "border-gold/30 text-silver",
                )}
              >
                Random
              </button>
              {CATEGORIES.filter((c) => c.id !== "random").map((c, i) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCat(c.id)}
                  className={cn(
                    "min-h-11 rounded-[12px] border px-2 font-display text-xs leading-tight",
                    cat === c.id
                      ? i % 2 === 0
                        ? "border-[#ff4ae0] bg-[#ff2bd6] text-ink shadow-[0_0_14px_#ff4ae0]"
                        : "border-[#3cf0ff] bg-[#12d8ff] text-ink shadow-[0_0_14px_#3cf0ff]"
                      : "border-gold/30 text-silver",
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        }
        onPick={(id) => {
          playClick();
          setWho(id);
        }}
      />
    );
  }
  return <Play who={who} diff={diff} cat={cat} onLobby={() => setWho(null)} />;
}

function Play({ who, diff, cat, onLobby }: { who: CharacterId; diff: Diff; cat: Category; onLobby: () => void }) {
  const [puzzle, setPuzzle] = useState<Puzzle>(() => makeSearch(diff, cat));
  const [found, setFound] = useState<string[]>([]);
  const [flash, setFlash] = useState<number[]>([]);
  const [drag, setDrag] = useState<number[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);
  const start = useRef<number | null>(null);
  const name = CHARACTERS.find((c) => c.id === who)?.name ?? who;
  const foundCells = useMemo(() => {
    const set = new Set<number>();
    for (const p of puzzle.placed) if (found.includes(p.word)) for (const i of p.cells) set.add(i);
    return set;
  }, [puzzle, found]);

  const deal = () => {
    playClick();
    setPuzzle(makeSearch(diff, cat));
    setFound([]);
    setFlash([]);
    setDrag([]);
  };

  const cellAt = (clientX: number, clientY: number) => {
    const el = gridRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) return null;
    const c = Math.min(puzzle.size - 1, Math.max(0, Math.floor((x / rect.width) * puzzle.size)));
    const r = Math.min(puzzle.size - 1, Math.max(0, Math.floor((y / rect.height) * puzzle.size)));
    return r * puzzle.size + c;
  };

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    const i = cellAt(e.clientX, e.clientY);
    if (i == null) return;
    start.current = i;
    setDrag([i]);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (start.current == null) return;
    const i = cellAt(e.clientX, e.clientY);
    if (i == null) return;
    const line = lineBetween(puzzle.size, start.current, i);
    if (line) setDrag(line);
  };
  const onUp = () => {
    if (drag.length) {
      const hit = matchWord(puzzle, drag);
      if (hit && !found.includes(hit.word)) {
        playChime();
        const next = [...found, hit.word];
        setFound(next);
        setFlash(hit.cells);
        window.setTimeout(() => setFlash([]), 1100);
        if (next.length === puzzle.words.length) {
          window.setTimeout(() => {
            setPuzzle(makeSearch(diff, cat));
            setFound([]);
            setFlash([]);
            setDrag([]);
          }, 1100);
        }
      }
    }
    start.current = null;
    setDrag([]);
  };

  return (
    <div className="relative flex h-svh min-h-0 flex-col overflow-hidden bg-ink text-parchment" style={{ overscrollBehavior: "none" }}>
      <header className="shrink-0 px-3 pb-1 pt-[max(1rem,env(safe-area-inset-top))]">
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
        <h1 className="mt-1 text-center font-display text-2xl font-semibold leading-none">Word Search</h1>
        <p className="text-center text-xs tracking-[0.16em] text-gold uppercase">
          {diff} · {CATEGORIES.find((c) => c.id === cat)?.label ?? cat} · {found.length}/{puzzle.words.length}
        </p>
      </header>
      <div className="flex min-h-0 flex-1 flex-col px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div
          ref={gridRef}
          className="mx-auto aspect-square w-full max-w-md touch-none select-none overflow-hidden rounded-[14px] border border-[#3cf0ff]/40 bg-[#0b0b12]"
          style={{ display: "grid", gridTemplateColumns: `repeat(${puzzle.size}, 1fr)` }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        >
          {puzzle.grid.map((ch, i) => {
            const lit = drag.includes(i);
            const done = foundCells.has(i);
            const spark = flash.includes(i);
            return (
              <div
                key={i}
                className={cn(
                  "grid aspect-square place-items-center border border-white/10 font-display text-[11px] sm:text-sm",
                  lit ? "bg-[#12d8ff]/25 text-[#12d8ff]" : done ? "text-[#ff2bd6]" : "text-parchment",
                  spark ? "word-found-flash" : done ? "ring-1 ring-inset ring-[#ff2bd6]" : "",
                )}
              >
                {ch}
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1">
          {puzzle.words.map((w) => (
            <span
              key={w}
              className={cn(
                "font-display text-xs tracking-wide",
                found.includes(w) ? "text-[#ff2bd6] line-through" : "text-silver",
              )}
            >
              {w}
            </span>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-center gap-3">
          <div className="flex w-12 flex-col items-center overflow-hidden rounded-[8px] ring-2 ring-[#ff2bd6]">
            <img src={playPortrait(who)} alt="" className={`h-10 w-12 ${portraitFit(who)}`} />
            <p className="w-full truncate bg-[#120814] px-0.5 text-center text-[8px] leading-3" style={{ color: BLUE }}>
              {name}
            </p>
          </div>
          <Button variant="ghost" onClick={deal}>
            New puzzle
          </Button>
        </div>
      </div>
    </div>
  );
}
