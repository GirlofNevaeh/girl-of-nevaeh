import { Button } from "@/components/ui/button";
import type { FightFighterId } from "@/fight/engine";
import { useGame } from "@/game/store";
import type { CharacterId } from "@/game/types";
import { useState } from "react";
import { DuelPick } from "./DuelPick";

export function RosterPick({
  title,
  blurb,
  pickLabel = "Choose Your Character",
  onPick,
}: {
  title: string;
  blurb: string;
  pickLabel?: string;
  onPick: (id: CharacterId) => void;
}) {
  const [hero, setHero] = useState<FightFighterId | null>(null);
  return (
    <div className="relative flex h-svh min-h-0 flex-col overflow-hidden bg-ink text-parchment">
      <header className="relative z-10 flex items-center gap-3 px-4 py-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <Button variant="quiet" onClick={() => useGame.getState().backToTitle()}>
          Main Menu
        </Button>
        <div>
          <h1 className="font-display text-3xl font-semibold">{title}</h1>
        </div>
      </header>
      <p className="relative z-10 px-4 text-silver">{blurb}</p>
      <DuelPick
        hero={hero}
        foe={null}
        needFoe={false}
        startLabel="Play"
        pickLabel={pickLabel}
        onPickHero={setHero}
        onPickFoe={() => undefined}
        onClear={() => setHero(null)}
        onStart={() => {
          if (hero) onPick(hero);
        }}
      />
    </div>
  );
}
