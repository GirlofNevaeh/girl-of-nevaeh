import { Button } from "@/components/ui/button";
import { SoundToggle } from "@/components/ui/sound-toggle";
import { Hearts } from "./Hearts";
import { playClick, playHeal, playRefuse } from "@/game/audio";
import { playPortrait, portraitFit } from "@/game/play-art";
import { CHARACTERS } from "@/game/characters";
import { useGame } from "@/game/store";
import type { CharacterId } from "@/game/types";
import { cn } from "@/lib/cn";
import { HI_KEY, TIME, WORDS_PER_LEVEL, pickWord, scramble, scoreFor, type Diff } from "@/salad/engine";
import { meaning } from "@/salad/defs";
import { useEffect, useRef, useState } from "react";
import { RosterPick } from "./RosterPick";

type Tile = { id: number; ch: string };

function deal(diff: Diff, level: number, used: Set<string>): { word: string; mix: Tile[] } {
  const word = pickWord(diff, level, used);
  const letters = scramble(word).split("");
  return { word, mix: letters.map((ch, id) => ({ id, ch })) };
}

export function SaladView() {
  const [who, setWho] = useState<CharacterId | null>(null);
  const [diff, setDiff] = useState<Diff>("normal");
  if (!who) {
    return (
      <RosterPick
        title="Word Salad"
        blurb="Unscramble the letters. Tap a letter into the grid. 30 seconds each puzzle."
        extra={
          <div className="px-4">
            <p className="mt-2 text-xs tracking-[0.16em] text-gold uppercase">Mode</p>
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
  const name = CHARACTERS.find((c) => c.id === who)?.name ?? who;
  const used = useRef(new Set<string>());
  const [level, setLevel] = useState(1);
  const [slot, setSlot] = useState(1);
  const [pack, setPack] = useState(() => deal(diff, 1, used.current));
  const [answer, setAnswer] = useState<(Tile | null)[]>(() => Array(pack.word.length).fill(null));
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [hi, setHi] = useState(() => Number(localStorage.getItem(HI_KEY) || 0));
  const [left, setLeft] = useState(TIME);
  const [flash, setFlash] = useState(false);
  const [over, setOver] = useState(false);
  const [hint, setHint] = useState(false);
  const [hintsLeft, setHintsLeft] = useState(() => (diff === "easy" ? Infinity : diff === "normal" ? 5 : 0));
  const hinted = useRef(false);
  const busy = useRef(false);
  const packRef = useRef(pack);
  const levelRef = useRef(level);
  const slotRef = useRef(slot);
  const leftRef = useRef(left);
  packRef.current = pack;
  levelRef.current = level;
  slotRef.current = slot;
  leftRef.current = left;

  const dealOnto = (lvl: number, sl: number) => {
    used.current.add(packRef.current.word);
    const p = deal(diff, lvl, used.current);
    packRef.current = p;
    levelRef.current = lvl;
    slotRef.current = sl;
    busy.current = false;
    setPack(p);
    setLevel(lvl);
    setSlot(sl);
    setAnswer(Array(p.word.length).fill(null));
    setLeft(TIME);
    setFlash(false);
    setHint(false);
    hinted.current = false;
  };

  const afterSolve = () => {
    let sl = slotRef.current;
    let lvl = levelRef.current;
    if (sl >= WORDS_PER_LEVEL) {
      sl = 1;
      lvl += 1;
    } else sl += 1;
    dealOnto(lvl, sl);
  };

  useEffect(() => {
    if (flash || over) return;
    const t0 = performance.now();
    let id = 0;
    const tick = (now: number) => {
      const v = Math.max(0, TIME - (now - t0) / 1000);
      setLeft(v);
      leftRef.current = v;
      if (v <= 0) return;
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [flash, over, pack.word]);

  useEffect(() => {
    if (left > 0 || flash || over || busy.current) return;
    busy.current = true;
    playRefuse();
    setLives((n) => {
      const remain = n - 1;
      if (remain <= 0) {
        setOver(true);
        return 0;
      }
      window.setTimeout(() => dealOnto(levelRef.current, slotRef.current), 700);
      return remain;
    });
  }, [left, flash, over, pack.word]);

  const placed = new Set(answer.filter(Boolean).map((t) => t!.id));
  const guess = answer.map((t) => t?.ch ?? "").join("");

  useEffect(() => {
    if (busy.current || over) return;
    if (guess !== pack.word || guess.length !== pack.word.length) return;
    busy.current = true;
    setFlash(true);
    playHeal();
    const add = scoreFor(leftRef.current, levelRef.current);
    setScore((s) => {
      const total = s + add;
      const best = Math.max(total, Number(localStorage.getItem(HI_KEY) || 0));
      localStorage.setItem(HI_KEY, String(best));
      setHi(best);
      return total;
    });
    window.setTimeout(() => afterSolve(), 850);
  }, [guess, pack.word]);

  const take = (tile: Tile) => {
    if (flash || over || busy.current) return;
    if (placed.has(tile.id)) return;
    const i = answer.findIndex((s) => s == null);
    if (i < 0) return;
    const next = answer.slice();
    next[i] = tile;
    if (next.every(Boolean) && next.map((t) => t!.ch).join("") !== pack.word) {
      playRefuse();
      setAnswer(Array(pack.word.length).fill(null));
      return;
    }
    playClick();
    setAnswer(next);
  };

  const giveBack = (i: number) => {
    if (flash || over || busy.current || !answer[i]) return;
    playClick();
    const next = answer.slice();
    next[i] = null;
    setAnswer(next);
  };

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
        <div className="mt-1 flex items-center justify-between gap-2">
          <Hearts lives={lives} />
          <p className="text-right text-xs tracking-[0.12em] text-gold uppercase">
            {score}
            <span className="block text-[10px] text-silver">Best {hi}</span>
          </p>
        </div>
      </header>

      <div className="mx-auto mt-1 h-2 w-[min(92%,24rem)] overflow-hidden rounded-full bg-[#1a1020] ring-1 ring-[#ff2bd6]/50">
        <div
          className="h-full rounded-full"
          style={{
            width: `${(left / TIME) * 100}%`,
            background: left < 8 ? "#ff2bd6" : "#12d8ff",
            boxShadow: left < 8 ? "0 0 10px #ff2bd6" : "0 0 10px #12d8ff",
          }}
        />
      </div>
      <p className="mt-1 text-center font-display text-2xl text-[#12d8ff]">{Math.ceil(left)}</p>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-[max(0.8rem,env(safe-area-inset-bottom))]">
        <p className="text-center text-xs tracking-[0.16em] text-gold uppercase">Scrambled</p>
        <div className="mx-auto mt-2 flex max-w-md flex-wrap justify-center gap-2">
          {pack.mix.map((tile) => {
            const gone = placed.has(tile.id);
            return (
              <button
                key={tile.id}
                type="button"
                disabled={gone || flash || over}
                onClick={() => take(tile)}
                className={cn(
                  "grid size-12 place-items-center rounded-[12px] border-2 font-display text-2xl sm:size-14",
                  gone
                    ? "border-white/10 bg-[#0b0b12] text-transparent"
                    : "border-[#ff4ae0] bg-[#1a1020] text-[#ff2bd6] shadow-[0_0_12px_#ff2bd666]",
                )}
              >
                {gone ? "" : tile.ch}
              </button>
            );
          })}
        </div>

        <p className="mt-5 text-center text-xs tracking-[0.16em] text-gold uppercase">Your word</p>
        <div className="mx-auto mt-2 flex max-w-md flex-wrap justify-center gap-2">
          {answer.map((tile, i) => (
            <button
              key={i}
              type="button"
              onClick={() => giveBack(i)}
              className={cn(
                "grid size-12 place-items-center rounded-[12px] border-2 font-display text-2xl sm:size-14",
                tile
                  ? cn(
                      "border-[#3cf0ff] bg-[#102028] text-[#12d8ff] shadow-[0_0_12px_#12d8ff66]",
                      flash && "four-win-flash",
                    )
                  : "border-white/15 bg-[#0b0b12] text-silver",
              )}
            >
              {tile?.ch ?? ""}
            </button>
          ))}
        </div>
        <p
          className="mt-4 text-center font-display text-3xl font-semibold text-[#12d8ff]"
          style={{ WebkitTextStroke: "1px #ff2bd6" }}
        >
          Level {level}
        </p>
        <div className="mx-auto mt-3 flex w-56 flex-col items-center gap-2">
          <Button
            variant="ghost"
            className="box-border h-14 w-56 rounded-[14px] px-0 text-base"
            disabled={flash || over}
            onClick={() => {
              playClick();
              setAnswer(Array(pack.word.length).fill(null));
            }}
          >
            Clear
          </Button>
          <div className="box-border flex h-14 w-56 items-center gap-2 overflow-hidden rounded-[14px] bg-ink-soft/90 px-2 ring-2 ring-[#ff2bd6]">
            <img src={playPortrait(who)} alt="" className={`h-10 w-8 shrink-0 rounded-[8px] ${portraitFit(who)}`} />
            <p className="min-w-0 truncate font-display text-base">{name}</p>
          </div>
          {diff !== "hard" ? (
            <Button
              variant="blue"
              className="box-border h-14 w-56 rounded-[14px] px-0 text-base"
              disabled={flash || over || (!hint && hintsLeft <= 0)}
              onClick={() => {
                if (hint) {
                  playClick();
                  setHint(false);
                  return;
                }
                if (hintsLeft <= 0) {
                  playRefuse();
                  return;
                }
                playClick();
                if (!hinted.current) {
                  hinted.current = true;
                  setHintsLeft((n) => (n === Infinity ? n : n - 1));
                }
                setHint(true);
              }}
            >
              {diff === "normal" ? `Hints ${Number.isFinite(hintsLeft) ? hintsLeft : 5}` : "Hint"}
            </Button>
          ) : null}
          {hint ? <p className="w-56 text-center text-sm leading-snug text-silver">{meaning(pack.word)}</p> : null}
        </div>
      </div>

      {over ? (
        <div className="absolute inset-0 z-30 grid place-items-center bg-ink/70 p-4">
          <div className="w-full max-w-sm rounded-[22px] border border-[#ff2bd6] bg-panel p-5 text-center">
            <p className="font-display text-2xl text-[#ff2bd6]" style={{ WebkitTextStroke: "1px #12d8ff" }}>
              Better Luck Next Time
            </p>
            <p className="mt-2 text-silver">Score {score}</p>
            <div className="mt-4 flex justify-center gap-2">
              <Button
                variant="pink"
                onClick={() => {
                  used.current = new Set();
                  busy.current = false;
                  setScore(0);
                  setLives(3);
                  setOver(false);
                  setHintsLeft(diff === "easy" ? Infinity : diff === "normal" ? 5 : 0);
                  dealOnto(1, 1);
                }}
              >
                Again
              </Button>
              <Button variant="ghost" onClick={onLobby}>
                Lobby
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
