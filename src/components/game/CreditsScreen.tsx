import { Button } from "@/components/ui/button";
import { ART } from "@/game/assets";
import type { Scores } from "@/game/types";

export function CreditsScreen({ scores, onTitle }: { scores: Scores; onTitle: () => void }) {
  const total = scores.healing + scores.fear + scores.control;
  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-ink px-5 py-16">
      <img
        src={ART.epilogue}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-35"
      />
      <div className="absolute inset-0 bg-ink/70" />
      <div className="relative z-10 w-full max-w-lg rounded-[28px] border border-gold/25 bg-panel/90 px-6 py-10 text-center shadow-[var(--shadow-panel)] sm:px-10">
        <p className="font-display text-sm tracking-[0.26em] text-gold uppercase">Credits</p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-parchment">
          The Girl of Nevaeh
        </h1>
        <p className="mt-6 text-sm leading-relaxed text-silver">
          Based on the novel by R A Simpson.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-silver">
          All games created by R A Simpson.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          A family-friendly adaptation about father-to-child love, grief, courage, and healing.
          The win was never domination. The win was reunion.
        </p>
        {total > 0 ? (
          <div className="mt-8 grid grid-cols-3 gap-3 text-xs tracking-wide text-muted uppercase">
            <div>
              <p className="font-display text-2xl text-gold normal-case">{scores.healing}</p>
              Healing
            </div>
            <div>
              <p className="font-display text-2xl text-silver normal-case">{scores.fear}</p>
              Fear
            </div>
            <div>
              <p className="font-display text-2xl text-violet normal-case">{scores.control}</p>
              Control
            </div>
          </div>
        ) : null}
        <p className="mt-8 font-display text-xl text-gold italic">Let it heal.</p>
        <Button variant="gold" className="mt-8" onClick={onTitle}>
          Main Menu
        </Button>
        <p className="mt-8 text-sm leading-relaxed text-parchment">
          To my beautiful daughter Nancy, I made this all for you.
          <br />
          I love you forever.
          <br />
          Merry Christmas 2026!
          <br />
          Your Daddy xxxxx
        </p>
      </div>
    </div>
  );
}
