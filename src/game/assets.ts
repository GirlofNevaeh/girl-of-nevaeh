import type { CharacterId, ItemId, PortraitId, SceneId } from "./types";
import { CHARACTERS } from "./characters";
import { ANIMAL_ART, playPortrait, playWink } from "./play-art";
import { STAGES } from "@/fight/stages";
import { FIGHTERS, PLAYABLE } from "@/fight/engine";

export const ART = {
  cover: "/art/cover.jpg?v=front",
  story: "/art/story.jpg",
  title: "/art/title.jpg",
  kitchen: "/art/kitchen.jpg",
  cave: "/art/cave.jpg",
  hospital: "/art/hospital.jpg",
  chapter: "/art/chapter.jpg",
  bridge: "/art/bridge.jpg",
  valley: "/art/valley.jpg",
  epilogue: "/art/epilogue.jpg",
} as const;

export const PORTRAITS: Record<PortraitId, string> = Object.fromEntries(
  CHARACTERS.map((c) => [c.id, c.portrait]),
) as Record<PortraitId, string>;

export const ITEMS: Record<
  ItemId,
  { name: string; art: string; blurb: string }
> = {
  photo: {
    name: "Family photograph",
    art: "/art/photo.jpg?v=family3",
    blurb: "Sarah, Ronnie, and Nancy in the kitchen light. Love kept still.",
  },
  guidebook: {
    name: "Desert guidebook",
    art: "/art/guidebook.jpg",
    blurb: "Sarah's notes on Qumran. The desert remembers what cities forget.",
  },
  orb: {
    name: "The Orb",
    art: "/art/orb.jpg?v=front",
    blurb: "Portable heart of the Grail of Desire. It answers only pure intent.",
  },
  glasses: {
    name: "Obsidian glasses",
    art: "/art/glasses.jpg",
    blurb: "Volcanic glass that shows the true face of the Shadow.",
  },
};

export const SCENE_ART: Record<SceneId, string> = {
  intro: ART.title,
  kitchen: ART.kitchen,
  cave: ART.cave,
  hospital: ART.hospital,
  chapter: ART.chapter,
  bridge: ART.bridge,
  valley: ART.valley,
  epilogue: ART.epilogue,
};

export function portraitSrc(
  id: PortraitId | "player" | undefined,
  who: CharacterId | null,
): string | null {
  if (!id) return null;
  if (id === "player") return who ? PORTRAITS[who] : null;
  return PORTRAITS[id] ?? CHARACTERS.find((c) => c.id === id)?.portrait ?? null;
}

export const PRELOAD = [
  ...Object.values(ART),
  ...Object.values(PORTRAITS),
  ...Object.values(ITEMS).map((i) => i.art),
  ...Object.values(ANIMAL_ART),
  ...CHARACTERS.map((c) => playPortrait(c.id)),
  ...CHARACTERS.map((c) => playWink(c.id)),
  ...CHARACTERS.map((c) => `/art/outlines/${c.id}.png?v=line2`),
  ...PLAYABLE.map((id) => FIGHTERS[id].art),
  ...PLAYABLE.map((id) => FIGHTERS[id].body),
  ...STAGES.map((s) => s.art),
];

const warmed = new Set<string>();

export function warmArt(src: string) {
  if (!src || warmed.has(src) || typeof Image === "undefined") return;
  warmed.add(src);
  const img = new Image();
  img.decoding = "async";
  img.src = src;
  void img.decode().catch(() => {});
}

export function preloadAllArt() {
  for (const src of PRELOAD) warmArt(src);
}
