import { Button } from "@/components/ui/button";
import { FIGHTERS, type FightFighterId } from "@/fight/engine";
import { playPortrait } from "@/game/play-art";
import { WinnerSplash } from "./WinnerSplash";
import { hushMusic, playClick, playQuizNo, playQuizPick, playQuizYes, unlockAudio } from "@/game/audio";
import { useGame } from "@/game/store";
import { CATS, QUESTIONS, type Cat, type Q } from "@/smartz/questions";
import { quoteOfDay } from "@/smartz/quotes";
import { cn } from "@/lib/cn";
import { useEffect, useMemo, useState } from "react";
import { Hearts } from "./Hearts";
import { DuelPick } from "./DuelPick";
import { SoundToggle } from "@/components/ui/sound-toggle";

const HI_KEY = "nevaeh-quiz-hi";

function shuffle<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function poolFor(cat: Cat | "mix") {
  return cat === "mix" ? QUESTIONS : QUESTIONS.filter((q) => q.cat === cat);
}

type Mode = "solo" | "hot";

export function SmartzView() {
  useEffect(() => {
    unlockAudio();
    hushMusic();
    const arm = () => unlockAudio();
    window.addEventListener("pointerdown", arm, { once: true });
    return () => window.removeEventListener("pointerdown", arm);
  }, []);
  const [you, setYou] = useState<FightFighterId | null>(null);
  const [foe, setFoe] = useState<FightFighterId | null>(null);
  const [mode, setMode] = useState<Mode | null>(null);
  const [cat, setCat] = useState<Cat | "mix" | null>(null);
  const [deck, setDeck] = useState<Q[]>([]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [turn, setTurn] = useState<0 | 1>(0);
  const [score, setScore] = useState<[number, number]>([0, 0]);
  const [lives, setLives] = useState<[number, number]>([3, 3]);
  const [hi, setHi] = useState(() => Number(localStorage.getItem(HI_KEY) || 0));
  const [winner, setWinner] = useState<0 | 1 | "lose" | null>(null);

  const saveHi = (n: number) => {
    const best = Math.max(n, Number(localStorage.getItem(HI_KEY) || 0));
    localStorage.setItem(HI_KEY, String(best));
    setHi(best);
  };

  const q = winner === null && cat && deck.length ? deck[i % deck.length] : undefined;
  const opts = useMemo(() => (q ? shuffle([...q.opts]) : []), [q?.q, i]);

  const begin = (next: Cat | "mix") => {
    playQuizPick();
    setCat(next);
    setDeck(shuffle(poolFor(next)));
    setI(0);
    setScore([0, 0]);
    setLives([3, 3]);
    setTurn(0);
    setPicked(null);
    setWinner(null);
  };

  const resetLobby = () => {
    setCat(null);
    setMode(null);
    setWinner(null);
    setPicked(null);
  };

  if (!mode || !you || (mode === "hot" && !foe)) {
    return (
      <div className="flex h-svh min-h-0 flex-col overflow-hidden bg-ink text-parchment">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <header className="relative z-20 bg-ink px-4 py-3 pt-[max(1rem,env(safe-area-inset-top))]">
          <div className="flex items-center justify-between gap-2">
            <Button variant="quiet" onClick={() => useGame.getState().backToTitle()}>
              Main Menu
            </Button>
            <SoundToggle />
          </div>
          <p className="mt-4 font-display text-sm tracking-[0.22em] text-gold uppercase">General knowledge</p>
          <h1 className="font-display text-4xl font-semibold">Quiz Time</h1>
          <p className="mt-2 font-display text-xl text-[#3cf0ff]">All-time high score {hi}</p>
          <QuoteCard />
        </header>
        <div className="relative z-20 bg-ink px-4 pb-2">
          <CatGrid onPick={begin} lockYou={() => { if (!you) setYou("nancy"); setMode((m) => m ?? "solo"); }} />
        </div>
        <DuelPick
          hero={you}
          foe={foe}
          startLabel="Play Computer"
          passLabel="Pass & Play"
          needFoe={false}
          embed
          onPickHero={setYou}
          onPickFoe={setFoe}
          onClear={() => {
            setYou(null);
            setFoe(null);
          }}
          onStart={() => {
            if (!you) return;
            playClick();
            setMode("solo");
          }}
          onPass={() => {
            playClick();
            setMode("hot");
          }}
        />
        </div>
      </div>
    );
  }

  if (!cat) {
    return (
      <div className="flex h-svh min-h-0 flex-col overflow-hidden bg-ink text-parchment">
        <header className="px-4 py-4 pt-[max(1rem,env(safe-area-inset-top))]">
          <Button variant="quiet" onClick={resetLobby}>
            Change
          </Button>
          <h1 className="mt-3 font-display text-3xl font-semibold">Quiz Time</h1>
          <p className="mt-1 font-display text-lg text-[#3cf0ff]">All-time high score {hi}</p>
          <QuoteCard />
        </header>
        <div className="px-4 pb-8">
          <CatGrid onPick={begin} />
        </div>
      </div>
    );
  }

  const current = turn === 0 ? you : foe!;
  const face = current ? playPortrait(current) : "";

  const goNext = () => {
    playClick();
    setPicked(null);
    if (mode === "hot") setTurn((t) => (t === 0 ? 1 : 0));
    setI((n) => {
      const next = n + 1;
      if (next >= deck.length) setDeck(shuffle(poolFor(cat)));
      return next >= deck.length ? 0 : next;
    });
  };

  return (
    <div className="relative flex h-svh min-h-0 flex-col overflow-hidden bg-ink text-parchment">
      <header className="flex items-start justify-between px-4 py-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <Button variant="quiet" onClick={() => setCat(null)}>
          Categories
        </Button>
        <div className="flex flex-col items-end gap-2">
          <SoundToggle />
          <Hearts lives={lives[turn]} />
          <p className="mt-1 text-sm text-silver">
            {FIGHTERS[turn === 0 ? you : foe!].name} · {score[turn]} · best {hi}
          </p>
        </div>
      </header>
      <main className="mx-auto min-h-0 w-full max-w-xl flex-1 overflow-y-auto px-4" style={{ overscrollBehavior: "none" }}>
        {q ? (
          <div className="pb-4">
            <p className="text-xs tracking-[0.16em] text-gold uppercase">{q.cat}</p>
            <h2 className="mt-2 font-display text-xl leading-snug sm:text-2xl">{q.q}</h2>
            <div className="mt-4 grid gap-2">
              {opts.map((opt) => {
                const right = picked && opt === q.a;
                const wrong = picked === opt && opt !== q.a;
                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={!!picked}
                    onClick={() => {
                      playQuizPick();
                      setPicked(opt);
                      if (opt === q.a) {
                        playQuizYes();
                        setScore((s) => {
                          const next: [number, number] = [...s];
                          next[turn] += 1;
                          saveHi(next[0] + next[1]);
                          return next;
                        });
                      } else {
                        playQuizNo();
                        setLives((n) => {
                          const next: [number, number] = [...n];
                          next[turn] -= 1;
                          if (next[turn] <= 0) {
                            if (mode === "hot" && next[turn === 0 ? 1 : 0] > 0) setWinner(turn === 0 ? 1 : 0);
                            else {
                              setWinner("lose");
                              saveHi(score[0] + score[1]);
                            }
                          }
                          return next;
                        });
                      }
                    }}
                    className={cn(
                      "min-h-12 rounded-[14px] border px-4 text-left",
                      right
                        ? "border-[#3cf0ff] bg-[#12d8ff]/20"
                        : wrong
                          ? "border-[#ff4ae0] bg-[#ff2bd6]/20"
                          : "border-gold/25 bg-ink-soft",
                    )}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ) : winner === "lose" ? (
          <LoseCard
            score={score[0]}
            hi={hi}
            onAgain={() => begin(cat)}
            onExit={resetLobby}
          />
        ) : null}
      </main>
      {current && winner === null ? (
        <div className="shrink-0 bg-ink pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-2">
          <div className="relative mx-auto w-full max-w-xl px-4">
            <div className="flex justify-center">
              <img
                src={face}
                alt=""
                className="h-20 w-[3.75rem] rounded-[14px] object-cover object-top ring-2 ring-[#ff2bd6]"
              />
            </div>
            {picked ? (
              <div className="absolute inset-y-0 left-6 flex items-center sm:left-8">
                <Button variant="blue" className="h-11 px-5" onClick={goNext}>
                  Next
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
      {winner === 0 || winner === 1 ? (
        <WinnerSplash
          id={winner === 0 ? you : foe!}
          youScore={score[0]}
          foeScore={score[1]}
          youName={FIGHTERS[you].name}
          foeName={foe ? FIGHTERS[foe].name : "Solo"}
          onAgain={() => begin(cat)}
          onExit={resetLobby}
        />
      ) : null}
    </div>
  );
}

function LoseCard({
  score,
  hi,
  onAgain,
  onExit,
}: {
  score: number;
  hi: number;
  onAgain: () => void;
  onExit: () => void;
}) {
  return (
    <div className="rounded-[24px] border border-[#ff2bd6]/40 bg-ink-soft p-6 text-center">
      <p className="font-display text-3xl text-[#ff2bd6]" style={{ WebkitTextStroke: "2px #12d8ff" }}>
        Better Luck Next Time
      </p>
      <p className="mt-3 text-silver">
        Score {score} · best {hi}
      </p>
      <div className="mt-5 flex justify-center gap-2">
        <Button variant="pink" onClick={onAgain}>
          Play again
        </Button>
        <Button variant="ghost" onClick={onExit}>
          Lobby
        </Button>
      </div>
    </div>
  );
}

function CatGrid({
  onPick,
  lockYou,
}: {
  onPick: (c: Cat | "mix") => void;
  lockYou?: () => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Button
        variant="pink"
        className="mega-quiz-flash col-span-2 h-24 w-full text-2xl"
        onClick={() => {
          lockYou?.();
          onPick("mix");
        }}
      >
        Mega Quiz
      </Button>
      {CATS.map((c, n) => (
        <Button
          key={c}
          variant={n % 2 === 0 ? "blue" : "pink"}
          className="h-12 w-full min-w-0 px-2 text-center text-xs leading-tight"
          onClick={() => {
            lockYou?.();
            onPick(c);
          }}
        >
          {c}
        </Button>
      ))}
    </div>
  );
}

function QuoteCard() {
  const q = quoteOfDay();
  return (
    <div className="mt-3 rounded-[12px] border border-[#3cf0ff]/40 bg-ink/60 px-3 py-2">
      <p className="text-[10px] tracking-[0.18em] text-[#ff2bd6] uppercase">Quote of the Day</p>
      <p className="mt-1 font-display text-sm leading-snug text-parchment">“{q.text}”</p>
      <p className="mt-1 text-xs text-[#3cf0ff]">— {q.by}</p>
    </div>
  );
}
