import { Button } from "@/components/ui/button";
import { FIGHTERS, type FightFighterId } from "@/fight/engine";
import { playPortrait, playWink } from "@/game/play-art";
import { cn } from "@/lib/cn";
import { useEffect, useState } from "react";

const ANIMALS = new Set(["milo", "tux", "murphy", "rosie"]);

export function WinnerSplash({
  id,
  youScore,
  foeScore,
  youName,
  foeName,
  onAgain,
  onExit,
  champion,
  careerNext,
  hideAgain,
}: {
  id: FightFighterId | string;
  youScore: number;
  foeScore: number;
  youName: string;
  foeName: string;
  onAgain: () => void;
  onExit: () => void;
  champion?: boolean;
  careerNext?: boolean;
  hideAgain?: boolean;
}) {
  const [wink, setWink] = useState(false);
  const [ready, setReady] = useState(false);
  const open = playPortrait(id);
  const shut = playWink(id);
  const animal = ANIMALS.has(String(id));
  const f = FIGHTERS[id as FightFighterId];
  const title = f?.name ?? id;
  const fit = animal ? "object-contain bg-[#0b0b12]" : "object-cover object-top";

  useEffect(() => {
    setWink(false);
    setReady(false);
    let left = 2;
    const done = () => {
      left -= 1;
      if (left <= 0) setReady(true);
    };
    const a = new Image();
    const b = new Image();
    a.onload = done;
    a.onerror = done;
    b.onload = done;
    b.onerror = done;
    a.src = open;
    b.src = shut;
  }, [id, open, shut]);

  useEffect(() => {
    if (!ready) return;
    const start = window.setTimeout(() => setWink(true), 380);
    return () => window.clearTimeout(start);
  }, [ready, id]);

  useEffect(() => {
    if (!careerNext || !wink) return;
    const t = window.setTimeout(onAgain, 1000);
    return () => window.clearTimeout(t);
  }, [careerNext, wink, onAgain]);

  return (
    <div className="absolute inset-0 z-[70] overflow-hidden bg-ink">
      <img
        src={open}
        alt=""
        className={cn("absolute inset-0 h-full w-full", fit)}
      />
      <img
        src={shut}
        alt=""
        className={cn(
          "absolute inset-0 h-full w-full transition-opacity duration-150",
          fit,
          wink ? "opacity-100" : "opacity-0",
        )}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
      {champion ? (
        <p className="neon-champ pointer-events-none absolute inset-x-0 top-1/3 z-10 text-center font-display text-6xl font-semibold tracking-[0.12em] sm:text-8xl">
          CHAMPION
        </p>
      ) : null}
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center px-4 pb-[max(1.4rem,env(safe-area-inset-bottom))] pt-16 text-center">
        {careerNext ? null : champion ? (
          <p className="font-display text-4xl font-semibold tracking-wide text-parchment drop-shadow sm:text-6xl">
            {title} WINS
          </p>
        ) : (
          <p className="font-display text-5xl font-semibold tracking-wide text-parchment drop-shadow sm:text-7xl">
            {title} WINS
          </p>
        )}
        {careerNext ? null : (
          <p className="mt-3 font-display text-xl text-gold">
            {youName} {youScore} · {foeName} {foeScore}
          </p>
        )}
        {careerNext ? null : (
          <div className="mt-6 flex gap-2">
            {hideAgain ? null : (
              <Button variant="gold" onClick={onAgain}>
                Again
              </Button>
            )}
            <Button variant="ghost" onClick={onExit}>
              Lobby
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
