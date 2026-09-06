import { Button } from "@/components/ui/button";
import { ART, ITEMS } from "@/game/assets";
import { CHARACTERS } from "@/game/characters";
import { playPortrait } from "@/game/play-art";
import { playChime, playClick, playRefuse } from "@/game/audio";
import { useGame } from "@/game/store";
import { cn } from "@/lib/cn";
import { useEffect, useState } from "react";

const HI_KEY = "nevaeh-flip-hi";

type Card = { id: string; pair: string; art: string; label: string };

const POOL: { id: string; art: string; label: string }[] = [
  ...CHARACTERS.map((c) => ({ id: c.id, art: playPortrait(c.id), label: c.name.split(" ")[0] })),
  { id: "orb", art: ITEMS.orb.art, label: "Orb" },
  { id: "photo", art: ITEMS.photo.art, label: "Photo" },
  { id: "guide", art: ITEMS.guidebook.art, label: "Guide" },
  { id: "glasses", art: ITEMS.glasses.art, label: "Glasses" },
  { id: "bridge", art: ART.bridge, label: "Bridge" },
  { id: "cave", art: ART.cave, label: "Cave" },
  { id: "valley", art: ART.valley, label: "Valley" },
];

const LEVELS = [
  { pairs: 6, cols: 4 },
  { pairs: 8, cols: 4 },
  { pairs: 10, cols: 5 },
  { pairs: 12, cols: 6 },
  { pairs: 15, cols: 6 },
];

function shuffle<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function deal(level: number): Card[] {
  const n = LEVELS[Math.min(level, LEVELS.length - 1)].pairs;
  const picks = shuffle(POOL).slice(0, n);
  const cards: Card[] = [];
  for (const p of picks) {
    cards.push({ id: `${p.id}-a`, pair: p.id, art: p.art, label: p.label });
    cards.push({ id: `${p.id}-b`, pair: p.id, art: p.art, label: p.label });
  }
  return shuffle(cards);
}

export function FlipView() {
  const [level, setLevel] = useState(0);
  const [cards, setCards] = useState(() => deal(0));
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [busy, setBusy] = useState(false);
  const [cleared, setCleared] = useState(false);
  const [banner, setBanner] = useState(true);
  const [hi, setHi] = useState(() => Number(localStorage.getItem(HI_KEY) || 0));
  const spec = LEVELS[Math.min(level, LEVELS.length - 1)];
  const cols = spec.cols;
  const rows = Math.ceil(cards.length / cols);
  const done = matched.length === spec.pairs;

  const nextLevel = () => {
    const n = Math.min(level + 1, LEVELS.length - 1);
    setLevel(n);
    setCards(deal(n));
    setOpen([]);
    setMatched([]);
    setMoves(0);
    setBusy(false);
    setCleared(false);
    setBanner(true);
  };

  useEffect(() => {
    if (!banner) return;
    const t = window.setTimeout(() => setBanner(false), 1800);
    return () => window.clearTimeout(t);
  }, [banner, level]);

  useEffect(() => {
    if (!done || cleared) return;
    playChime();
    const bonus = Math.max(40, 200 - moves * 6) * (level + 1);
    const total = score + bonus;
    setScore(total);
    const best = Math.max(total, Number(localStorage.getItem(HI_KEY) || 0));
    localStorage.setItem(HI_KEY, String(best));
    setHi(best);
    setCleared(true);
  }, [done, cleared, moves, level, score]);

  const flip = (i: number) => {
    if (done) return;
    if (busy) return;
    if (open.includes(i)) return;
    const card = cards[i];
    if (!card || matched.includes(card.pair)) return;
    playClick();
    setBanner(false);
    const next = [...open, i].slice(-2);
    setOpen(next);
    if (next.length < 2) return;
    setMoves((m) => m + 1);
    const [a, b] = next;
    if (cards[a].pair === cards[b].pair) {
      setMatched((m) => [...m, cards[a].pair]);
      setOpen([]);
    } else {
      setBusy(true);
      playRefuse();
      window.setTimeout(() => {
        setOpen([]);
        setBusy(false);
      }, 700);
    }
  };

  const restart = () => {
    playClick();
    setLevel(0);
    setCards(deal(0));
    setOpen([]);
    setMatched([]);
    setMoves(0);
    setScore(0);
    setBusy(false);
    setCleared(false);
    setBanner(true);
  };

  return (
    <div className="relative flex h-svh min-h-0 flex-col overflow-hidden bg-ink text-parchment">
      <header className="flex shrink-0 items-center justify-between gap-3 px-4 py-2 pt-[max(0.6rem,env(safe-area-inset-top))]">
        <Button variant="quiet" onClick={() => useGame.getState().backToTitle()}>
          Main Menu
        </Button>
        <div className="min-w-0 flex-1 text-center leading-tight">
          <p
            className="font-display text-lg font-extrabold text-[#3cf0ff] sm:text-xl"
            style={{
              WebkitTextStroke: "2px #ff2bd6",
              paintOrder: "stroke fill",
              textShadow: "0 0 12px #ff2bd6",
            }}
          >
            Level
          </p>
          <p
            className="font-display text-2xl font-extrabold text-[#3cf0ff]"
            style={{
              WebkitTextStroke: "2px #ff2bd6",
              paintOrder: "stroke fill",
              textShadow: "0 0 12px #ff2bd6",
            }}
          >
            {level + 1}
          </p>
        </div>
        <p className="text-right text-xs text-silver">
          L{level + 1} · {moves} · {score} · best {hi}
        </p>
      </header>
      <main className="flex min-h-0 flex-1 flex-col items-center justify-center px-3 pt-2 pb-[max(4.5rem,env(safe-area-inset-bottom))]">
        <div
          className="relative z-20 grid max-h-full max-w-full select-none"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
            width: `min(100%, calc((100svh - 12rem) * ${cols} / ${rows}))`,
            height: `min(calc(100svh - 12rem), calc(100vw * ${rows} / ${cols}))`,
            gap: "8px",
          }}
        >
          {cards.map((card, i) => {
            const up = open.includes(i) || matched.includes(card.pair);
            return (
              <button
                key={`${card.id}-${i}`}
                type="button"
                onClick={() => flip(i)}
                className={cn(
                  "relative z-20 min-h-10 min-w-10 touch-manipulation select-none overflow-hidden rounded-[10px] border [-webkit-touch-callout:none]",
                  up ? "border-[#3cf0ff]" : "border-gold/25 bg-ink-soft",
                )}
              >
                {up ? (
                  <img src={card.art} alt="" draggable={false} className="pointer-events-none h-full w-full object-cover object-[center_18%]" />
                ) : (
                  <img
                    src={ART.cover}
                    alt=""
                    draggable={false}
                    className="pointer-events-none h-full w-full object-cover object-[center_20%] opacity-90"
                  />
                )}
              </button>
            );
          })}
        </div>
        {done ? (
          <div className="mt-2 flex shrink-0 flex-wrap justify-center gap-2">
            {level < LEVELS.length - 1 ? (
              <Button variant="pink" onClick={nextLevel}>
                Level {level + 2}
              </Button>
            ) : (
              <p className="font-display text-lg text-[#3cf0ff]">Top board clear. Score {score}.</p>
            )}
            <Button variant="blue" onClick={restart}>
              Play again
            </Button>
          </div>
        ) : null}
      </main>
    </div>
  );
}
