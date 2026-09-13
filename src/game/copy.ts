import { CHARACTERS } from "./characters";
import type {
  CharacterId,
  DialogueBeat,
  Line,
  PortraitRef,
} from "./types";

export function say(line: Line, who: CharacterId): string {
  if (typeof line === "string") return line;
  return line[who] ?? line.all ?? line.nancy ?? Object.values(line).find(Boolean) ?? "";
}

export function characterName(who: CharacterId): string {
  return CHARACTERS.find((c) => c.id === who)?.name ?? who;
}

export function resolveSpeaker(beat: DialogueBeat, who: CharacterId): string | undefined {
  if (!beat.speaker) return undefined;
  const s = say(beat.speaker, who);
  if (s === "Memory" && beat.portrait === "player") return characterName(who);
  return s || undefined;
}

export function resolvePortrait(
  beat: DialogueBeat,
  who: CharacterId,
): PortraitRef | undefined {
  const p = beat.portrait;
  if (!p) return undefined;
  if (typeof p === "string") return p;
  return p[who] ?? "player";
}

export const SAVE_KEY = "girl-of-nevaeh-save";
export const SAVE_VERSION = 1;
