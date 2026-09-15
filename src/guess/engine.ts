export type Diff = "easy" | "normal" | "hard";

export const RANGE: Record<Diff, number> = { easy: 20, normal: 50, hard: 99 };
export const MAX_GUESSES = 10;
export const PLACES = 2;

export type HotPhase = "handA" | "setA" | "handB" | "setB" | "guessB" | "handA2" | "guessA" | "end";

export function hotStart(): HotPhase {
  return "handA";
}

export function hotAdvance(phase: HotPhase): HotPhase {
  switch (phase) {
    case "handA":
      return "setA";
    case "setA":
      return "handB";
    case "handB":
      return "setB";
    case "setB":
      return "guessB";
    case "guessB":
      return "handA2";
    case "handA2":
      return "guessA";
    case "guessA":
      return "end";
    default:
      return "end";
  }
}

export function hotWho(phase: HotPhase): "a" | "b" | null {
  if (phase === "handA" || phase === "setA" || phase === "handA2" || phase === "guessA") return "a";
  if (phase === "handB" || phase === "setB" || phase === "guessB") return "b";
  return null;
}

export function isHandoff(phase: HotPhase) {
  return phase === "handA" || phase === "handB" || phase === "handA2";
}

export function pad(n: number): string {
  return String(Math.max(0, n)).padStart(PLACES, "0").slice(-PLACES);
}

export function numberFromSlots(slots: (number | null)[]): number | null {
  const a = slots[0] ?? null;
  const b = slots[1] ?? null;
  if (a == null || b == null) return null;
  return a * 10 + b;
}

export function randomSecret(diff: Diff): number {
  return 1 + Math.floor(Math.random() * RANGE[diff]);
}

export function validSecret(n: number, diff: Diff): boolean {
  return Number.isInteger(n) && n >= 1 && n <= RANGE[diff];
}

export function scoreFor(guesses: number, solved: boolean, diff: Diff): number {
  if (!solved || guesses < 1 || guesses > MAX_GUESSES) return 0;
  const tier = diff === "hard" ? 3 : diff === "normal" ? 2 : 1;
  return (MAX_GUESSES + 1 - guesses) * 50 * tier;
}

export function lockDigits(secret: number, guess: number, prev: boolean[]): boolean[] {
  const s = pad(secret);
  const g = pad(guess);
  return prev.map((on, i) => on || s[i] === g[i]);
}

export function allLocked(lock: boolean[]): boolean {
  return lock.length === PLACES && lock.every(Boolean);
}

export const HI_KEY = "nevaeh-guess-hi-v1";

export function loadHigh(): Record<Diff, number> {
  try {
    const raw = localStorage.getItem(HI_KEY);
    if (!raw) return { easy: 0, normal: 0, hard: 0 };
    const p = JSON.parse(raw) as Partial<Record<Diff, number>>;
    return { easy: p.easy ?? 0, normal: p.normal ?? 0, hard: p.hard ?? 0 };
  } catch {
    return { easy: 0, normal: 0, hard: 0 };
  }
}

export function saveHigh(diff: Diff, score: number) {
  const cur = loadHigh();
  if (!(score > cur[diff])) return cur;
  const next = { ...cur, [diff]: score };
  localStorage.setItem(HI_KEY, JSON.stringify(next));
  return next;
}
