import { Button } from "@/components/ui/button";
import { FIGHTERS, PLAYABLE, type FightFighterId } from "@/fight/engine";
import { playPortrait } from "@/game/play-art";
import { playClick } from "@/game/audio";
import { cn } from "@/lib/cn";
import { useState, type ReactNode } from "react";

export function DuelPick({
  hero,
  foe,
  startLabel = "Play",
  passLabel,
  pickLabel,
  foeLabel,
  extra,
  footer,
  embed,
  needFoe = true,
  onPickHero,
  onPickFoe,
  onClear,
  onStart,
  onPass,
}: {
  hero: FightFighterId | null;
  foe: FightFighterId | null;
  startLabel?: string;
  passLabel?: string;
  pickLabel?: string;
  foeLabel?: string;
  extra?: ReactNode;
  footer?: ReactNode;
  embed?: boolean;
  needFoe?: boolean;
  onPickHero: (id: FightFighterId) => void;
  onPickFoe: (id: FightFighterId) => void;
  onClear: () => void;
  onStart: () => void;
  onPass?: () => void;
}) {
  const [seat, setSeat] = useState<"hero" | "foe">("hero");
  const showFoe = needFoe || !!onPass;
  const pickingFoe = showFoe && seat === "foe";
  return (
    <div className={cn("mx-auto w-full max-w-5xl py-2", embed ? "" : "min-h-0 flex-1 overflow-y-auto overscroll-contain")}>
      <div className={cn("grid gap-2", showFoe ? "grid-cols-2" : "grid-cols-1")}>
        <SeatCard
          active={!pickingFoe}
          label="You"
          empty="You"
          id={hero}
          onClick={() => setSeat("hero")}
        />
        {showFoe ? (
          <SeatCard
            active={pickingFoe}
            label="Opponent"
            empty="Foe"
            id={foe}
            onClick={() => setSeat("foe")}
          />
        ) : null}
      </div>
      <div className="mt-3 flex flex-nowrap items-center justify-center gap-2">
        <Button variant="ghost" className="shrink-0 px-3 text-xs" onClick={onClear} disabled={!hero && !foe}>
          Clear
        </Button>
        <Button variant="gold" className="shrink-0 px-3 text-xs" onClick={onStart} disabled={!hero || (needFoe && !foe)}>
          {startLabel}
        </Button>
        {onPass ? (
          <Button variant="blue" className="shrink-0 px-3 text-xs" onClick={onPass} disabled={!hero || !foe}>
            {passLabel ?? "Pass & Play"}
          </Button>
        ) : null}
      </div>
      <p className="mt-3 text-silver">{pickingFoe ? foeLabel ?? "Choose Your Opponent" : pickLabel ?? "Choose Your Character"}</p>
      {extra ? <div className="mt-2">{extra}</div> : null}
      <div className="mt-3 grid grid-cols-3 gap-2 pb-4 sm:grid-cols-4 md:grid-cols-5">
        {PLAYABLE.map((id) => {
          const def = FIGHTERS[id];
          const selected = hero === id || (showFoe && foe === id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                playClick();
                if (pickingFoe) onPickFoe(id);
                else {
                  onPickHero(id);
                  if (showFoe) setSeat("foe");
                }
              }}
              className={cn(
                "overflow-hidden rounded-[18px] border bg-ink-soft/90 text-left hover:border-gold",
                selected ? "border-gold ring-2 ring-gold/60" : "border-gold/25",
              )}
            >
              <img src={playPortrait(id)} alt="" className="aspect-3/4 w-full object-cover object-top" />
              <div className="flex min-h-8 items-center px-1 py-1 sm:px-2">
                <h2 className="w-full text-center font-display text-[10px] font-semibold leading-tight break-words sm:text-xs">{def.name}</h2>
              </div>
            </button>
          );
        })}
        </div>
        {footer ? <div className="mt-4 pb-6">{footer}</div> : null}
    </div>
  );
}

function SeatCard({
  active,
  label,
  empty,
  id,
  onClick,
}: {
  active: boolean;
  label: string;
  empty: string;
  id: FightFighterId | null;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-[4.75rem] items-center gap-2 rounded-[16px] border bg-ink-soft/90 p-2 text-left",
        active ? "border-gold ring-2 ring-gold/50" : "border-gold/25",
      )}
    >
      {id ? (
        <img src={playPortrait(id)} alt="" className="h-14 w-11 shrink-0 rounded-[10px] object-cover object-top" />
      ) : (
        <span className="flex h-14 w-11 shrink-0 items-center justify-center rounded-[10px] border border-dashed border-gold/30 text-[10px] text-muted">
          {empty}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-semibold uppercase leading-none text-gold">{label}</p>
        <p className="mt-1 font-display text-[15px] leading-snug break-words">
          {id ? FIGHTERS[id].name : "Tap a face"}
        </p>
      </div>
    </button>
  );
}

