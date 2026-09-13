import { Button } from "@/components/ui/button";
import { SoundToggle } from "@/components/ui/sound-toggle";
import type { FightFighterId } from "@/fight/engine";
import { useGame } from "@/game/store";
import type { CharacterId } from "@/game/types";
import { useState, type ReactNode } from "react";
import { DuelPick } from "./DuelPick";

export function RosterPick({
  title,
  blurb,
  pickLabel = "Choose Your Character",
  extra,
  beside,
  onPick,
}: {
  title: string;
  blurb: string;
  pickLabel?: string;
  extra?: ReactNode;
  beside?: ReactNode;
  onPick: (id: CharacterId) => void;
}) {
  const [hero, setHero] = useState<FightFighterId | null>(null);
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
        <h1 className="mt-2 min-w-0 break-words font-display text-3xl font-semibold leading-tight">{title}</h1>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[max(1.6rem,env(safe-area-inset-bottom))]">
        <p className="relative z-10 px-4 text-silver">{blurb}</p>
        {extra}
        <div className="px-4">
        <DuelPick
          hero={hero}
          foe={null}
          needFoe={false}
          embed
          startLabel="Play"
          pickLabel={pickLabel}
          beside={beside}
          onPickHero={setHero}
          onPickFoe={() => undefined}
          onClear={() => setHero(null)}
          onStart={() => {
            if (hero) onPick(hero);
          }}
        />
        </div>
      </div>
    </div>
  );
}
