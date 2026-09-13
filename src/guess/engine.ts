export type Diff = "easy" | "normal" | "hard";

export const RANGE: Record<Diff, number> = { easy: 20, normal: 50, hard: 99 };
export const MAX_GUESSES = 10;
export const PLACES = 2;

export function pad(n: number): string {
  return String(Math.max(0, n)).padStart(PLACES, "0").slice(-PLACES);
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
  if (score > cur[diff]) {
    cur[diff] = score;
    localStorage.setItem(HI_KEY, JSON.stringify(cur));
  }
  return cur;
}
