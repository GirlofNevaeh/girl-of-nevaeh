import { FIGHTERS, type FightFighterId } from "@/fight/engine";
import { CHARACTERS } from "@/game/characters";

/** Animal forms used in every game except Role Play and Characters. */
export const ANIMAL_ART: Record<string, string> = {
  milo: "/art/wink/milo-open.png?v=wink6",
  tux: "/art/wink/tux-open.png?v=wink6",
  murphy: "/art/wink/murphy-open.png?v=wink6",
  rosie: "/art/wink/rosie-open.png?v=wink6",
};

export function playPortrait(id: string): string {
  if (ANIMAL_ART[id]) return ANIMAL_ART[id];
  const fighter = (FIGHTERS as Record<string, { art: string }>)[id];
  if (fighter?.art) return fighter.art;
  return CHARACTERS.find((c) => c.id === id)?.portrait ?? "";
}

export function playWink(id: string): string {
  if (id === "milo" || id === "tux" || id === "murphy" || id === "rosie") {
    return `/art/wink/${id}.png?v=wink6`;
  }
  return `/art/wink/${id}.jpg?v=wink4`;
}

export function fightBody(id: string): string {
  const fighter = FIGHTERS[id as FightFighterId];
  return fighter?.body ?? "";
}
