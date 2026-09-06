import { Button } from "@/components/ui/button";
import { ENTRIES, TIMELINE, BY_ID, searchEntries, MAJOR_TABS } from "@/codex/data";
import { useCodex } from "@/codex/store";
import type { CodexEntry, CodexTab } from "@/codex/types";
import { useGame } from "@/game/store";
import { cn } from "@/lib/cn";
import {
  ArrowLeft,
  Clock3,
  Gem,
  Globe2,
  Heart,
  Map as MapIcon,
  Search,
  Sparkles,
  Star,
  Users,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useEffect, useMemo } from "react";

const TABS: { id: CodexTab; label: string; icon: typeof Globe2 }[] = [
  { id: "characters", label: "Meet the Characters", icon: Users },
  { id: "worlds", label: "Worlds", icon: Globe2 },
  { id: "artefacts", label: "Relics", icon: Gem },
  { id: "timeline", label: "Time", icon: Clock3 },
  { id: "themes", label: "Themes", icon: Heart },
  { id: "search", label: "Search", icon: Search },
];

export function CodexApp() {
  const tab = useCodex((s) => s.tab);
  const selected = useCodex((s) => s.selected);
  const mapOpen = useCodex((s) => s.mapOpen);
  const orbOpen = useCodex((s) => s.orbOpen);
  const soundOn = useGame((s) => s.soundOn);

  useEffect(() => {
    let alive = true;
    void Promise.resolve(useCodex.persist.rehydrate()).then(() => {
      if (!alive) return;
      useCodex.setState({ tab: "characters", selected: null, mapOpen: false, orbOpen: false });
    });
    return () => {
      alive = false;
    };
  }, []);

  const entry = selected ? BY_ID[selected] : undefined;

  return (
    <div className="relative flex h-svh min-h-0 flex-col overflow-hidden bg-ink text-parchment">
      <header className="relative z-20 flex shrink-0 items-center gap-2 border-b border-gold/15 bg-ink/90 px-3 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <Button variant="quiet" className="px-2" onClick={() => useGame.getState().backToTitle()}>
          <ArrowLeft className="size-4" />
          Main Menu
        </Button>
        <div className="min-w-0 flex-1">
          <p className="font-display text-[11px] tracking-[0.22em] text-gold uppercase">The Girl of Nevaeh</p>
          <h1 className="font-display text-xl font-semibold leading-none">Characters</h1>
        </div>
        <Button variant="ghost" className="px-3" onClick={() => useCodex.getState().openOrb()}>
          <Sparkles className="size-4 text-gold" />
          <span className="hidden sm:inline">Orb</span>
        </Button>
        <Button
          variant="quiet"
          aria-label={soundOn ? "Mute sound" : "Turn sound on"}
          className="px-2"
          onClick={() => useGame.getState().setSound(!soundOn)}
        >
          {soundOn ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
        </Button>
      </header>

      {!mapOpen ? <CharacterTabBar /> : null}

      <main className="min-h-0 flex-1 overflow-y-auto">
        {mapOpen ? <MapView /> : entry ? <EntryDetail entry={entry} /> : <TabBody tab={tab} />}
      </main>

      {!mapOpen ? (
        <nav className="relative z-20 grid shrink-0 grid-cols-6 border-t border-gold/15 bg-ink-soft pb-[max(0.4rem,env(safe-area-inset-bottom))]">
          {TABS.map((t) => {
            const Icon = t.icon;
            const on = tab === t.id && !entry;
            return (
              <button
                key={t.id}
                type="button"
                aria-label={t.label}
                onClick={() => useCodex.getState().setTab(t.id)}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-0.5 px-0.5 text-[9px] tracking-wide uppercase sm:text-[10px]",
                  on ? "text-gold" : "text-muted",
                )}
              >
                <Icon className="size-4" />
                {t.id === "characters" ? (
                  <span className="text-center leading-tight">
                    Meet the
                    <br />
                    Characters
                  </span>
                ) : (
                  t.label
                )}
              </button>
            );
          })}
        </nav>
      ) : null}

      {orbOpen ? <OrbSheet /> : null}
    </div>
  );
}

function CharacterTabBar() {
  const tab = useCodex((s) => s.tab);
  const selected = useCodex((s) => s.selected);
  const characterTab = useCodex((s) => s.characterTab);
  const onCharacters = tab === "characters" && !selected;

  return (
    <nav aria-label="Meet the Characters" className="relative z-20 shrink-0 border-b border-gold/15 bg-ink-soft">
      <div className="flex gap-1 overflow-x-auto px-2 py-2">
        {MAJOR_TABS.map((t) => {
          const person = BY_ID[t.id];
          const on = onCharacters && characterTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => useCodex.getState().setCharacterTab(t.id)}
              className={cn(
                "flex w-16 shrink-0 flex-col items-center gap-1 rounded-[14px] px-1 py-1",
                on ? "bg-gold/15" : "",
              )}
            >
              <img
                src={person.art}
                alt=""
                className={cn(
                  "h-11 w-11 rounded-full object-cover object-top",
                  on ? "ring-2 ring-gold ring-offset-2 ring-offset-ink" : "ring-1 ring-gold/25",
                )}
              />
              <span className={cn("text-[10px] tracking-wide", on ? "text-gold" : "text-muted")}>{t.tab}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function TabBody({ tab }: { tab: CodexTab }) {
  if (tab === "characters") return <CharactersTab />;
  if (tab === "worlds") return <WorldsTab />;
  if (tab === "artefacts") return <GridTab kind="artefact" />;
  if (tab === "timeline") return <TimelineView />;
  if (tab === "themes") return <GridTab kind="theme" />;
  return <SearchTab />;
}

function WorldsTab() {
  const worlds = ENTRIES.filter((e) => e.kind === "world");
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-display text-sm tracking-[0.22em] text-gold uppercase">Sister worlds</p>
          <h2 className="mt-1 font-display text-3xl font-semibold">The map remembers</h2>
        </div>
        <Button variant="gold" className="shrink-0" onClick={() => useCodex.getState().openMap()}>
          <MapIcon className="size-4" />
          Read the map
        </Button>
      </div>
      <div className="mt-6 grid gap-4">
        {worlds.map((e) => (
          <WideCard key={e.id} entry={e} />
        ))}
      </div>
      <CreditsLine />
    </div>
  );
}

function CharactersTab() {
  const characterTab = useCodex((s) => s.characterTab);
  const person = BY_ID[characterTab] ?? BY_ID.nancy;
  const fav = useCodex((s) => s.favourites.includes(person.id));

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-5 pb-16">
      <p className="font-display text-sm tracking-[0.22em] text-gold uppercase">Meet the Characters</p>
      <div className="mt-4 overflow-hidden rounded-[28px] border border-gold/20 sm:flex">
        <img
          src={person.art}
          alt={person.name}
          className="aspect-3/4 max-h-96 w-full object-cover object-top sm:w-64 sm:max-h-none"
        />
        <div className="flex-1 bg-ink-soft px-5 py-5">
          <p className="text-xs tracking-[0.18em] text-gold uppercase">{person.epithet}</p>
          <h2 className="mt-2 font-display text-4xl font-semibold">{person.name}</h2>
          {person.loveLine ? (
            <p className="mt-4 font-display text-xl text-gold italic">{person.loveLine}</p>
          ) : null}
          <Button
            variant="ghost"
            className="mt-5 px-3"
            onClick={() => useCodex.getState().toggleFavourite(person.id)}
          >
            <Star className={cn("size-4", fav && "fill-gold text-gold")} />
            {fav ? "Saved" : "Save"}
          </Button>
        </div>
      </div>

      <p className="mt-6 text-base leading-relaxed text-silver">{person.summary}</p>
      <p className="mt-4 text-base leading-relaxed text-parchment/90">{person.body}</p>
      {person.relations ? (
        <p className="mt-4 text-sm leading-relaxed text-muted">
          <span className="text-gold">Relations. </span>
          {person.relations}
        </p>
      ) : null}

      {person.extraArt ? (
        <img
          src={person.extraArt}
          alt=""
          className="mt-6 max-h-72 w-full rounded-[20px] object-cover object-top"
        />
      ) : null}

      {person.links.length ? (
        <div className="mt-8">
          <p className="font-display text-sm tracking-[0.2em] text-gold uppercase">Related</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {person.links.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => BY_ID[l.id] && useCodex.getState().openEntry(l.id)}
                className="min-h-11 rounded-full border border-gold/30 px-4 text-sm text-parchment hover:border-gold"
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <SupportingCast />
      <CreditsLine />
    </article>
  );
}

function SupportingCast() {
  const extras = ENTRIES.filter(
    (e) => e.kind === "character" && e.group && e.group !== "family" && e.group !== "nevaeh" && e.group !== "shadow",
  );
  return (
    <section className="mt-12">
      <p className="font-display text-sm tracking-[0.2em] text-gold uppercase">Also in the story</p>
      <h3 className="mt-1 font-display text-2xl font-semibold">Crew and Earth</h3>
      <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
        {extras.map((e) => (
          <PersonCard key={e.id} entry={e} />
        ))}
      </div>
    </section>
  );
}

function GridTab({ kind }: { kind: "artefact" | "theme" }) {
  const items = ENTRIES.filter((e) => e.kind === kind);
  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <p className="font-display text-sm tracking-[0.22em] text-gold uppercase">
        {kind === "artefact" ? "Living tools" : "What the book is about"}
      </p>
      <h2 className="mt-1 font-display text-3xl font-semibold">{kind === "artefact" ? "Artefacts" : "Themes"}</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {items.map((e) => (
          <WideCard key={e.id} entry={e} compact />
        ))}
      </div>
      <CreditsLine />
    </div>
  );
}

function SearchTab() {
  const query = useCodex((s) => s.query);
  const starredOnly = useCodex((s) => s.starredOnly);
  const favourites = useCodex((s) => s.favourites);
  const results = useMemo(
    () => searchEntries(query, starredOnly ? favourites : null),
    [query, starredOnly, favourites],
  );
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <p className="font-display text-sm tracking-[0.22em] text-gold uppercase">Find a thread</p>
      <h2 className="mt-1 font-display text-3xl font-semibold">Search</h2>
      <label className="mt-5 block">
        <span className="sr-only">Search the Codex</span>
        <input
          value={query}
          onChange={(e) => useCodex.getState().setQuery(e.target.value)}
          placeholder="Nancy, Orb, Qumran, grief"
          className="min-h-12 w-full rounded-[12px] border border-gold/25 bg-ink-soft px-4 text-parchment outline-none placeholder:text-faint focus:border-gold"
        />
      </label>
      <button
        type="button"
        onClick={() => useCodex.getState().setStarredOnly(!starredOnly)}
        className={cn(
          "mt-3 inline-flex min-h-11 items-center gap-2 rounded-[12px] border px-3 text-sm",
          starredOnly ? "border-gold bg-gold/15 text-gold" : "border-gold/25 text-muted",
        )}
      >
        <Star className="size-4" />
        Favourites only
      </button>
      <div className="mt-6 grid gap-3">
        {results.length === 0 ? (
          <p className="text-sm text-muted">Nothing by that name. Try a person, a world, or a relic.</p>
        ) : (
          results.map((e) => <WideCard key={e.id} entry={e} compact />)
        )}
      </div>
    </div>
  );
}

function TimelineView() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <p className="font-display text-sm tracking-[0.22em] text-gold uppercase">A long patience</p>
      <h2 className="mt-1 font-display text-3xl font-semibold">Timeline</h2>
      <ol className="relative mt-8 ml-3 border-l border-gold/30 pb-4">
        {TIMELINE.map((b) => (
          <li key={b.id} className="relative mb-8 pl-8 last:mb-0">
            <span className="absolute top-0 -left-[9px] h-4 w-4 rounded-full border border-gold bg-ink" />
            <p className="font-display text-xs tracking-[0.2em] text-gold uppercase">Beat {b.n}</p>
            <h3 className="mt-1 font-display text-2xl font-semibold">{b.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-silver">{b.text}</p>
            {b.linkId && BY_ID[b.linkId] ? (
              <button
                type="button"
                className="mt-3 text-sm text-gold underline-offset-4 hover:underline"
                onClick={() => useCodex.getState().openEntry(b.linkId!)}
              >
                Open {BY_ID[b.linkId].name}
              </button>
            ) : null}
          </li>
        ))}
      </ol>
      <CreditsLine />
    </div>
  );
}

function MapView() {
  return (
    <div className="relative h-full min-h-0">
      <img src="/art/codex/map.jpg" alt="Earth and Nevaeh joined by a gold thread" className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-ink/40" />
      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
        <div>
          <p className="font-display text-sm tracking-[0.22em] text-gold uppercase">Read the map</p>
          <h2 className="font-display text-3xl font-semibold">A gold thread</h2>
        </div>
        <Button variant="quiet" onClick={() => useCodex.getState().closeMap()}>
          <X className="size-4" />
          Close
        </Button>
      </div>
      <div className="absolute inset-x-4 bottom-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
        {[
          { id: "earth", label: "Earth", className: "sm:mr-auto" },
          { id: "bridge", label: "The Bridge" },
          { id: "nevaeh", label: "Nevaeh", className: "sm:ml-auto" },
        ].map((h) => (
          <button
            key={h.id}
            type="button"
            onClick={() => useCodex.getState().openEntry(h.id)}
            className={cn(
              "min-h-12 rounded-full border border-gold/40 bg-ink/80 px-5 font-display text-gold backdrop-blur-sm",
              h.className,
            )}
          >
            {h.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function EntryDetail({ entry }: { entry: CodexEntry }) {
  const fav = useCodex((s) => s.favourites.includes(entry.id));
  return (
    <article className="mx-auto max-w-3xl px-4 py-6 pb-16">
      <Button variant="quiet" className="mb-4 px-2" onClick={() => useCodex.getState().closeEntry()}>
        <ArrowLeft className="size-4" />
        Back
      </Button>
      <div className="overflow-hidden rounded-[28px] border border-gold/20">
        <img
          src={entry.art}
          alt=""
          className={cn(
            "w-full object-cover",
            entry.kind === "character" ? "aspect-3/4 max-h-[28rem] object-top" : "aspect-video max-h-80",
          )}
        />
      </div>
      <p className="mt-5 text-xs tracking-[0.2em] text-gold uppercase">{entry.epithet}</p>
      <div className="mt-2 flex items-start justify-between gap-3">
        <h2 className="font-display text-4xl font-semibold">{entry.name}</h2>
        <Button variant="ghost" className="shrink-0 px-3" onClick={() => useCodex.getState().toggleFavourite(entry.id)}>
          <Star className={cn("size-4", fav && "fill-gold text-gold")} />
        </Button>
      </div>
      {entry.loveLine ? <p className="mt-4 font-display text-xl text-gold italic">{entry.loveLine}</p> : null}
      <p className="mt-4 text-base leading-relaxed text-silver">{entry.summary}</p>
      <p className="mt-4 text-base leading-relaxed text-parchment/90">{entry.body}</p>
      {entry.relations ? (
        <p className="mt-4 text-sm leading-relaxed text-muted">
          <span className="text-gold">Relations. </span>
          {entry.relations}
        </p>
      ) : null}
      {entry.extraArt ? (
        <img src={entry.extraArt} alt="" className="mt-6 max-h-72 w-full rounded-[20px] object-cover object-top" />
      ) : null}
      {entry.links.length ? (
        <div className="mt-8">
          <p className="font-display text-sm tracking-[0.2em] text-gold uppercase">Related</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {entry.links.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => BY_ID[l.id] && useCodex.getState().openEntry(l.id)}
                className="min-h-11 rounded-full border border-gold/30 px-4 text-sm text-parchment hover:border-gold"
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}

function PersonCard({ entry }: { entry: CodexEntry }) {
  const visited = useCodex((s) => s.visited.includes(entry.id));
  return (
    <button
      type="button"
      onClick={() => useCodex.getState().openEntry(entry.id)}
      className="overflow-hidden rounded-[20px] border border-gold/15 bg-ink-soft text-left"
    >
      <img src={entry.art} alt="" className="aspect-3/4 w-full object-cover object-top" />
      <div className="px-3 py-3">
        <h3 className={cn("font-display text-base font-semibold leading-tight", visited && "text-gold")}>{entry.name}</h3>
        <p className="mt-1 text-xs text-muted">{entry.epithet}</p>
      </div>
    </button>
  );
}

function WideCard({ entry, compact }: { entry: CodexEntry; compact?: boolean }) {
  const visited = useCodex((s) => s.visited.includes(entry.id));
  return (
    <button
      type="button"
      onClick={() => useCodex.getState().openEntry(entry.id)}
      className="flex overflow-hidden rounded-[22px] border border-gold/15 bg-ink-soft text-left"
    >
      <img src={entry.art} alt="" className={cn("object-cover", compact ? "h-24 w-24" : "h-32 w-40 sm:h-40 sm:w-56")} />
      <div className="min-w-0 flex-1 px-4 py-3">
        <p className="text-[10px] tracking-[0.18em] text-gold uppercase">{entry.epithet}</p>
        <h3 className={cn("font-display text-xl font-semibold", visited && "text-gold")}>{entry.name}</h3>
        <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-silver">{entry.summary}</p>
      </div>
    </button>
  );
}

function CreditsLine() {
  return (
    <p className="mt-10 pb-6 text-center text-xs tracking-wide text-faint">
      Based on The Girl of Nevaeh by R A Simpson
    </p>
  );
}

function OrbSheet() {
  const text = useCodex((s) => s.orbText);
  const reading = useCodex((s) => s.orbReading);
  const lit = reading?.kind === "selfless";
  const dark = reading?.kind === "selfish";

  return (
    <div className="absolute inset-0 z-40 flex items-end justify-center bg-ink/70 p-3 sm:items-center">
      <div className="max-h-[min(90svh,40rem)] w-full max-w-lg overflow-y-auto rounded-[28px] border border-gold/30 bg-ink px-5 py-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-display text-sm tracking-[0.22em] text-gold uppercase">The Orb</p>
            <h2 className="font-display text-2xl font-semibold">Offer an intention</h2>
          </div>
          <Button variant="quiet" className="px-2" onClick={() => useCodex.getState().closeOrb()}>
            <X className="size-4" />
          </Button>
        </div>
        <img
          src="/art/orb.jpg?v=front"
          alt=""
          className={cn(
            "mx-auto mt-4 h-16 w-16 rounded-full object-cover",
            lit && "ring-4 ring-gold",
            dark && "grayscale",
          )}
        />
        {reading ? (
          <p className={cn("mt-4 text-center text-sm leading-relaxed", lit ? "text-gold" : "text-silver")}>
            {reading.reply}
          </p>
        ) : (
          <p className="mt-4 text-center text-sm text-muted">Selfless intent lights the chamber. A closed hand leaves it dark.</p>
        )}
        <textarea
          value={text}
          onChange={(e) => useCodex.getState().setOrbText(e.target.value)}
          rows={3}
          placeholder="Let it heal..."
          className="mt-4 w-full rounded-[16px] border border-gold/25 bg-ink-soft px-4 py-3 text-parchment outline-none placeholder:text-faint focus:border-gold"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {["Let it heal her grief.", "Keep the bridge open for them.", "Give me power over both worlds."].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => useCodex.getState().offerIntent(s)}
              className="min-h-10 rounded-full border border-gold/25 px-3 text-left text-xs text-silver"
            >
              {s}
            </button>
          ))}
        </div>
        <Button variant="gold" className="mt-4 w-full" onClick={() => useCodex.getState().offerIntent()}>
          Offer
        </Button>
      </div>
    </div>
  );
}
