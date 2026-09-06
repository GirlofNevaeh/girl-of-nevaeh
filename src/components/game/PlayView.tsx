import { Button } from "@/components/ui/button";
import { ITEMS, portraitSrc, SCENE_ART } from "@/game/assets";
import { CHARACTERS } from "@/game/characters";
import { characterName, resolvePortrait, resolveSpeaker, say } from "@/game/copy";
import { SCENES, SCENE_ORDER, ENDINGS } from "@/game/story";
import { requiredDone, useGame } from "@/game/store";
import type { CharacterId, ItemId } from "@/game/types";
import { cn } from "@/lib/cn";
import { BookOpen, Volume2, VolumeX, X } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

export function PlayView() {
  const character = useGame((s) => s.character) as CharacterId;
  const sceneId = useGame((s) => s.scene);
  const nodeId = useGame((s) => s.node);
  const phase = useGame((s) => s.phase);
  const examined = useGame((s) => s.examined);
  const lookingAt = useGame((s) => s.lookingAt);
  const refuse = useGame((s) => s.refuse);
  const inventory = useGame((s) => s.inventory);
  const journal = useGame((s) => s.journal);
  const soundOn = useGame((s) => s.soundOn);
  const savedFlash = useGame((s) => s.savedFlash);
  const ending = useGame((s) => s.ending);
  const [journalOpen, setJournalOpen] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);
  const [itemId, setItemId] = useState<ItemId | null>(null);

  const scene = SCENES[sceneId];
  const beat = scene.nodes[nodeId];
  const canProceed = requiredDone(sceneId, examined);
  const look = scene.hotspots.find((h) => h.id === lookingAt);
  const progress = Math.max(0, SCENE_ORDER.indexOf(sceneId));

  const speaker = beat ? resolveSpeaker(beat, character) : undefined;
  const portrait = beat ? resolvePortrait(beat, character) : undefined;
  const portraitUrl = portraitSrc(portrait, character);
  const guide = CHARACTERS.find((c) => c.id === character)?.portrait;
  const body = beat ? say(beat.text, character) : "";

  const filterClass = useMemo(() => {
    if (phase !== "ending" || !ending) return "";
    if (ending === "fear") return "grayscale-[45%] contrast-90";
    if (ending === "control") return "saturate-125 contrast-110";
    return "";
  }, [phase, ending]);

  return (
    <div className="relative flex h-svh min-h-0 flex-col overflow-hidden bg-ink md:block">
      <div className={cn("relative min-h-0 flex-1 md:absolute md:inset-0", filterClass)}>
        <img
          src={SCENE_ART[sceneId]}
          alt={scene.location}
          className="scene-pan h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-ink/80 via-transparent to-ink/35" />
        {guide ? (
          <img
            src={guide}
            alt=""
            className="pointer-events-none absolute bottom-[16%] left-[4%] z-10 h-[28%] max-h-44 w-auto rounded-[16px] object-cover object-top opacity-50 sm:bottom-[20%] sm:left-[6%] sm:h-[32%]"
          />
        ) : null}

        {phase === "explore"
          ? scene.hotspots.map((h) => {
              const seen = examined.includes(`${sceneId}:${h.id}`);
              return (
                <button
                  key={h.id}
                  type="button"
                  aria-label={say(h.label, character)}
                  onClick={() => useGame.getState().examine(h.id)}
                  className={cn(
                    "absolute z-10 hidden h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full border md:block",
                    seen
                      ? "border-parchment/30 bg-ink/30"
                      : "hotspot-ring border-gold bg-gold/30",
                  )}
                  style={{ left: `${h.x}%`, top: `${h.y}%` }}
                />
              );
            })
          : null}

        {phase === "stealth" && beat?.stealth
          ? beat.stealth.spots.map((sp) => (
              <button
                key={sp.id}
                type="button"
                onClick={() => useGame.getState().pickStealth(sp.id)}
                className="absolute z-10 hidden min-h-11 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold bg-ink/70 px-3 py-2 text-xs text-parchment md:block"
                style={{ left: `${sp.x}%`, top: `${sp.y}%` }}
              >
                {say(sp.label, character)}
              </button>
            ))
          : null}
      </div>

      <header className="relative z-20 flex items-start justify-between gap-3 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-5 md:absolute md:inset-x-0 md:top-0">
        <div className="rounded-[18px] border border-gold/20 bg-ink/70 px-3 py-2 backdrop-blur-sm">
          <p className="text-[11px] tracking-[0.2em] text-gold uppercase">{scene.location}</p>
          <p className="font-display text-lg leading-tight text-parchment">{scene.title}</p>
          <div className="mt-1 flex gap-1">
            {SCENE_ORDER.map((id, i) => (
              <span
                key={id}
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  i <= progress ? "bg-gold" : "bg-faint",
                )}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-[18px] border border-gold/20 bg-ink/70 p-1 backdrop-blur-sm">
          <IconBtn
            label="Journal"
            onClick={() => {
              setJournalOpen(true);
              setBagOpen(false);
            }}
          >
            <BookOpen className="size-4" />
          </IconBtn>
          <IconBtn
            label="Inventory"
            onClick={() => {
              setBagOpen((v) => !v);
              setJournalOpen(false);
            }}
          >
            <span className="font-display text-sm">{inventory.length}</span>
          </IconBtn>
          <IconBtn
            label={soundOn ? "Mute" : "Unmute"}
            onClick={() => useGame.getState().setSound(!soundOn)}
          >
            {soundOn ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
          </IconBtn>
          <IconBtn label="Title" onClick={() => useGame.getState().backToTitle()}>
            <X className="size-4" />
          </IconBtn>
        </div>
      </header>

      {savedFlash ? (
        <p className="fade-up absolute top-20 left-1/2 z-20 -translate-x-1/2 rounded-full border border-gold/30 bg-ink/80 px-3 py-1 text-xs tracking-wide text-gold">
          Saved
        </p>
      ) : null}

      {bagOpen ? (
        <aside className="absolute top-24 right-3 z-30 w-[min(18rem,calc(100%-1.5rem))] rounded-[18px] border border-gold/25 bg-panel/95 p-3 shadow-[var(--shadow-panel)]">
          <p className="mb-2 text-xs tracking-[0.18em] text-gold uppercase">Carried</p>
          {inventory.length === 0 ? (
            <p className="text-sm text-muted">Empty pockets, for now.</p>
          ) : (
            <ul className="space-y-2">
              {inventory.map((id) => (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => setItemId(id)}
                    className="flex w-full items-center gap-3 rounded-[12px] p-1.5 text-left hover:bg-ink-soft"
                  >
                    <img src={ITEMS[id].art} alt="" className="size-12 rounded-[8px] object-cover" />
                    <span className="text-sm text-parchment">{ITEMS[id].name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>
      ) : null}

      {itemId ? (
        <Modal onClose={() => setItemId(null)}>
          <img src={ITEMS[itemId].art} alt="" className="orb-glow mx-auto h-36 w-36 rounded-full object-cover" />
          <h2 className="mt-4 font-display text-2xl">{ITEMS[itemId].name}</h2>
          <p className="mt-2 text-sm leading-relaxed text-silver">{ITEMS[itemId].blurb}</p>
        </Modal>
      ) : null}

      {journalOpen ? (
        <Modal onClose={() => setJournalOpen(false)} wide>
          <p className="text-xs tracking-[0.2em] text-gold uppercase">Journal</p>
          <h2 className="mt-1 font-display text-3xl">What you have learned</h2>
          {journal.length === 0 ? (
            <p className="mt-4 text-sm text-muted">The page is still waiting.</p>
          ) : (
            <ul className="mt-5 max-h-[50vh] space-y-4 overflow-y-auto pr-1">
              {journal.map((j) => (
                <li key={j.id} className="border-t border-gold/15 pt-3">
                  <h3 className="font-display text-xl text-parchment">{j.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-silver">{j.text}</p>
                </li>
              ))}
            </ul>
          )}
        </Modal>
      ) : null}

      <footer className="relative z-20 border-t border-gold/15 bg-panel/92 px-3 pt-3 pb-[max(0.9rem,env(safe-area-inset-bottom))] backdrop-blur-md md:absolute md:inset-x-0 md:bottom-0 md:border-t-0 md:bg-linear-to-t md:from-ink md:via-ink/92 md:to-transparent md:pt-16 md:backdrop-blur-none">
        <div className="mx-auto flex max-w-3xl gap-3 md:items-end">
          {portraitUrl && phase !== "explore" && phase !== "ending" ? (
            <img
              src={portraitUrl}
              alt={speaker ?? ""}
              className="hidden h-28 w-20 shrink-0 rounded-[18px] object-cover object-top ring-1 ring-gold/30 sm:block"
            />
          ) : null}

          <div className="min-w-0 flex-1 rounded-[18px] border border-gold/20 bg-ink/75 p-3 sm:p-4">
            {phase === "explore" ? (
              <ExplorePanel
                character={character}
                lookLabel={look ? say(look.label, character) : null}
                lookText={look ? say(look.text, character) : null}
                canProceed={canProceed}
                spots={scene.hotspots.map((h) => ({
                  id: h.id,
                  label: say(h.label, character),
                  seen: examined.includes(`${sceneId}:${h.id}`),
                  required: !!h.required,
                }))}
              />
            ) : null}

            {phase === "dialogue" && beat ? (
              <DialoguePanel
                speaker={speaker}
                body={body}
                choices={beat.choices?.map((c) => say(c.text, character)) ?? []}
                canContinue={!beat.choices?.length && !!beat.next}
              />
            ) : null}

            {phase === "puzzle" && beat?.puzzle ? (
              <PuzzlePanel
                prompt={say(beat.puzzle.prompt, character)}
                hint={say(beat.puzzle.hint, character)}
                refuse={refuse}
                options={beat.puzzle.options.map((o) => ({
                  id: o.id,
                  text: say(o.text, character),
                }))}
              />
            ) : null}

            {phase === "stealth" && beat?.stealth ? (
              <StealthPanel
                prompt={say(beat.stealth.prompt, character)}
                spots={beat.stealth.spots.map((sp) => ({
                  id: sp.id,
                  label: say(sp.label, character),
                }))}
              />
            ) : null}

            {phase === "ending" && ending ? (
              <EndingPanel
                title={ENDINGS[ending].title}
                body={say(ENDINGS[ending].lines as import("@/game/types").Line, character)}
              />
            ) : null}
          </div>
        </div>
      </footer>
    </div>
  );
}

function IconBtn({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid size-11 place-items-center rounded-[12px] text-parchment hover:bg-ink-soft"
    >
      {children}
    </button>
  );
}

function Modal({
  children,
  onClose,
  wide,
}: {
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  return (
    <div className="absolute inset-0 z-40 grid place-items-end p-3 sm:place-items-center">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-ink/60"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative mb-[max(0.5rem,env(safe-area-inset-bottom))] w-full rounded-[28px] border border-gold/25 bg-panel p-6 shadow-[var(--shadow-panel)] sm:mb-0",
          wide ? "max-w-lg" : "max-w-sm",
        )}
      >
        {children}
        <Button variant="ghost" className="mt-5 w-full" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}

function ExplorePanel({
  character,
  lookLabel,
  lookText,
  canProceed,
  spots,
}: {
  character: CharacterId;
  lookLabel: string | null;
  lookText: string | null;
  canProceed: boolean;
  spots: { id: string; label: string; seen: boolean; required: boolean }[];
}) {
  return (
    <div>
      <p className="text-xs tracking-[0.18em] text-gold uppercase">{characterName(character)}</p>
      {lookText ? (
        <>
          <h2 className="mt-1 font-display text-xl text-parchment">{lookLabel}</h2>
          <p className="mt-2 text-sm leading-relaxed text-silver">{lookText}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="ghost" onClick={() => useGame.getState().closeLook()}>
              Look away
            </Button>
            {canProceed ? (
              <Button variant="gold" onClick={() => useGame.getState().finishExplore()}>
                Continue
              </Button>
            ) : null}
          </div>
        </>
      ) : (
        <>
          <p className="mt-1 text-sm text-silver">Touch what the room is keeping.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {spots.map((s) => (
              <Button
                key={s.id}
                variant={s.seen ? "quiet" : "ghost"}
                className="min-h-10 px-3 text-xs"
                onClick={() => useGame.getState().examine(s.id)}
              >
                {s.label}
              </Button>
            ))}
          </div>
          {canProceed ? (
            <Button variant="gold" className="mt-3" onClick={() => useGame.getState().finishExplore()}>
              Continue
            </Button>
          ) : (
            <p className="mt-3 text-xs text-muted">The path waits on what must be seen.</p>
          )}
        </>
      )}
    </div>
  );
}

function DialoguePanel({
  speaker,
  body,
  choices,
  canContinue,
}: {
  speaker?: string;
  body: string;
  choices: string[];
  canContinue: boolean;
}) {
  return (
    <div>
      {speaker ? (
        <p className="text-xs tracking-[0.18em] text-gold uppercase">{speaker}</p>
      ) : null}
      <p className="mt-1 text-sm leading-relaxed text-parchment sm:text-[0.95rem]">{body}</p>
      {choices.length ? (
        <div className="mt-3 flex flex-col gap-2">
          {choices.map((c, i) => (
            <Button
              key={`${i}-${c.slice(0, 12)}`}
              variant="ghost"
              className="h-auto min-h-11 justify-start whitespace-normal py-2 text-left"
              onClick={() => useGame.getState().choose(i)}
            >
              {c}
            </Button>
          ))}
        </div>
      ) : null}
      {canContinue ? (
        <Button variant="gold" className="mt-3" onClick={() => useGame.getState().continueDialogue()}>
          Continue
        </Button>
      ) : null}
    </div>
  );
}

function PuzzlePanel({
  prompt,
  hint,
  refuse,
  options,
}: {
  prompt: string;
  hint: string;
  refuse: string | null;
  options: { id: string; text: string }[];
}) {
  return (
    <div>
      <p className="text-xs tracking-[0.18em] text-gold uppercase">The Orb</p>
      <p className="mt-1 font-display text-xl text-parchment">{prompt}</p>
      <p className="mt-1 text-sm text-muted">{hint}</p>
      {refuse ? <p className="mt-2 text-sm text-danger">{refuse}</p> : null}
      <div className="mt-3 flex flex-col gap-2">
        {options.map((o) => (
          <Button
            key={o.id}
            variant="ghost"
            className="h-auto min-h-11 justify-start whitespace-normal py-2 text-left"
            onClick={() => useGame.getState().pickOrb(o.id)}
          >
            {o.text}
          </Button>
        ))}
      </div>
    </div>
  );
}

function StealthPanel({
  prompt,
  spots,
}: {
  prompt: string;
  spots: { id: string; label: string }[];
}) {
  return (
    <div>
      <p className="text-xs tracking-[0.18em] text-gold uppercase">Move quietly</p>
      <p className="mt-1 text-sm leading-relaxed text-parchment">{prompt}</p>
      <div className="mt-3 flex flex-col gap-2">
        {spots.map((s) => (
          <Button
            key={s.id}
            variant="ghost"
            className="h-auto min-h-11 justify-start whitespace-normal py-2 text-left"
            onClick={() => useGame.getState().pickStealth(s.id)}
          >
            {s.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

function EndingPanel({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <p className="text-xs tracking-[0.18em] text-gold uppercase">Ending</p>
      <h2 className="mt-1 font-display text-2xl text-parchment">{title}</h2>
      <p className="mt-2 max-h-[28vh] overflow-y-auto text-sm leading-relaxed text-silver sm:max-h-none">
        {body}
      </p>
      <Button variant="gold" className="mt-4" onClick={() => useGame.getState().finishEnding()}>
        Credits
      </Button>
    </div>
  );
}
