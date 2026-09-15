import type { OrbKind, OrbReading } from "./types";

const SELFLESS = [
  "heal",
  "help",
  "protect",
  "love",
  "forgive",
  "save",
  "peace",
  "reunite",
  "mercy",
  "kind",
  "mother",
  "father",
  "child",
  "daughter",
  "together",
  "family",
  "home",
  "let it heal",
  "for her",
  "for him",
  "for them",
  "for my",
  "comfort",
  "mend",
  "return",
  "safe",
];

const SELFISH = [
  "control",
  "power",
  "revenge",
  "destroy",
  "rule",
  "wealth",
  "famous",
  "kill",
  "dominate",
  "punish",
  "make them",
  "mine",
  "for me",
  "own them",
  "force",
  "obey",
];

const LIT: string[] = [
  "The Orb warms in the palm. Healing is freer than you think.",
  "Gold gathers. It will not do the work for you. It will walk with you.",
  "Let it heal. The worlds remember that sentence.",
  "A quiet light. Pure intent has a path even when the map does not.",
  "The Spark answers. Not because you asked loudly. Because you asked for someone else.",
];

const DARK: string[] = [
  "The Orb is still. Control is a closed hand.",
  "No light. Desire without love has no path.",
  "It will not open for possession. Try a smaller, kinder ask.",
];

const UNCLEAR: string[] = [
  "The Orb listens, then waits. Speak who this is for.",
  "Name the one you would keep safe. Then ask again.",
];

function countHits(text: string, words: string[]): number {
  return words.reduce((n, w) => n + (text.includes(w) ? 1 : 0), 0);
}

export function readIntent(raw: string): OrbReading {
  const text = raw.trim().toLowerCase().replace(/\s+/g, " ");
  if (text.length < 4) {
    return { kind: "unclear", reply: "The Orb needs more than a breath. Offer a full intention." };
  }
  const selfless = countHits(text, SELFLESS);
  const selfish = countHits(text, SELFISH);
  let kind: OrbKind = "unclear";
  if (selfish > selfless) kind = "selfish";
  else if (selfless > 0) kind = "selfless";
  const pool = kind === "selfless" ? LIT : kind === "selfish" ? DARK : UNCLEAR;
  const reply = pool[text.length % pool.length];
  return { kind, reply };
}
