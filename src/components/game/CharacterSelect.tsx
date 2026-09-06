import { Button } from "@/components/ui/button";
import { CHARACTERS } from "@/game/characters";
import type { CharacterId } from "@/game/types";
import { ArrowLeft } from "lucide-react";

export function CharacterSelect({
  onPick,
  onBack,
}: {
  onPick: (id: CharacterId) => void;
  onBack: () => void;
}) {
  return (
    <div className="flex h-svh min-h-0 flex-col overflow-hidden bg-ink">
      <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col px-4 pt-8 sm:px-8">
        <div className="shrink-0">
        <Button variant="quiet" onClick={onBack} className="mb-6 px-2">
          <ArrowLeft className="size-4" />
          Main Menu
        </Button>
        <p className="font-display text-sm tracking-[0.24em] text-gold uppercase">Choose a path</p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-parchment sm:text-5xl">
          Who walks first?
        </h1>
        <p className="mt-3 max-w-xl text-sm text-muted">
          The Orb still asks for intent.
        </p>
        </div>

        <div className="mt-8 min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[max(2rem,env(safe-area-inset-bottom))]">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {CHARACTERS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onPick(c.id)}
              className="group flex flex-col overflow-hidden rounded-[22px] border border-gold/20 bg-ink-soft text-left transition-colors duration-200 hover:border-gold/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              <div className="relative aspect-3/4 overflow-hidden">
                <img
                  src={c.portrait}
                  alt={c.name}
                  className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-ink-soft to-transparent" />
              </div>
              <div className="flex flex-1 flex-col px-3 pt-3 pb-4">
                <p className="text-[10px] tracking-[0.16em] text-gold uppercase">
                  {c.role} · {c.age}
                </p>
                <h2 className="mt-1 font-display text-sm font-semibold leading-tight break-words text-parchment">{c.name}</h2>
                <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-silver">{c.bio}</p>
              </div>
            </button>
          ))}
        </div>
        </div>
      </div>
    </div>
  );
}
