export type Diff = "easy" | "normal" | "hard";

export type Category =
  | "random"
  | "Geography"
  | "Entertainment"
  | "History"
  | "Art & Literature"
  | "Science & Nature"
  | "Sports & Leisure"
  | "Bible Quiz"
  | "Maths";

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: "random", label: "Random" },
  { id: "Geography", label: "Geography" },
  { id: "Entertainment", label: "Entertainment" },
  { id: "History", label: "History" },
  { id: "Art & Literature", label: "Art & Literature" },
  { id: "Science & Nature", label: "Science & Nature" },
  { id: "Sports & Leisure", label: "Sports & Leisure" },
  { id: "Bible Quiz", label: "Bible Quiz" },
  { id: "Maths", label: "Maths" },
];

export type Placed = {
  word: string;
  cells: number[];
};

export type Puzzle = {
  size: number;
  grid: string[];
  words: string[];
  placed: Placed[];
  category: Category;
};

const MUSIC_FAVES = [
  "KATSEYE", "MANON", "SOPHIA", "DANIELA", "LARA", "MEGAN", "YOONCHAE", "TOUCH", "GABRIELA", "MIRROR",
  "TAYLOR", "SWIFT", "FOLKLORE", "EVERMORE", "MIDNIGHTS", "LOVER", "WILLOW", "KARMA", "CARDIGAN", "ANTIHERO", "SHAKE",
  "BENSON", "BOONE", "BEAUTIFUL", "THINGS", "GHOST",
  "SABRINA", "CARPENTER", "ESPRESSO", "TASTE", "FEATHER", "PLEASE",
  "OLIVIA", "RODRIGO", "SOUR", "GUTS", "VAMPIRE", "TRAITOR", "DRIVERS", "DEJAVU", "OBSESSED",
  "PINK", "FLOYD", "PRISM", "WALL", "MOON", "WISH",
  "WETWETWET", "SWEET", "ANGEL",
  "DIRE", "STRAITS", "SULTANS", "MONEY", "WALK",
  "ELVIS", "PRESLEY", "GRACELAND", "HOUNDDOG", "SUEDE", "KING",
];

const GEOGRAPHY = [
  "NILE", "TOKYO", "BRAZIL", "AFRICA", "EUROPE", "ASIA", "PACIFIC", "EVEREST", "HIMALAYA",
  "BROOKLYN", "QUMRAN", "LONDON", "PARIS", "ROME", "CAIRO", "KENYA", "CANADA", "MEXICO",
  "CHINA", "JAPAN", "INDIA", "OCEAN", "DESERT", "VALLEY", "CANYON", "EQUATOR", "ISLAND",
  "VOLCANO", "RIVER", "ALPS", "ANDES", "ARCTIC", "SAHARA", "NILE", "DELTA",
];

const ENTERTAINMENT = [
  ...MUSIC_FAVES, ...MUSIC_FAVES, ...MUSIC_FAVES,
  "PIANO", "GUITAR", "MOVIE", "DANCE", "ACTOR", "FILM", "STAGE", "RADIO", "ALBUM",
  "LYRICS", "CHORUS", "MELODY", "TOUR", "SINGER", "DRUMS", "VIOLIN", "CINEMA",
];

const HISTORY = [
  "ROME", "LATIN", "EGYPT", "PHARAOH", "PYRAMID", "LINCOLN", "VIKING", "EMPIRE",
  "CASTLE", "KNIGHT", "TUDOR", "CROWN", "THRONE", "BATTLE", "TREATY", "DYNASTY",
  "MEDIEVAL", "SAMURAI", "AZTEC", "SPARTA", "ATHENS", "CAESAR", "TUDOR", "NORMAN",
];

const ART = [
  "SHAKESPEARE", "SONNET", "HAMLET", "AUSTEN", "DICKENS", "HOMER", "HAIKU",
  "NOVEL", "POEM", "PAINTING", "MUSEUM", "CANVAS", "POETRY", "AUTHOR", "CHAPTER",
  "MYTH", "LANDSCAPE", "MONALISA", "BRUSH", "SKETCH", "SONNET", "BALLAD", "FABLE",
];

const SCIENCE = [
  "WATER", "OXYGEN", "PLANET", "HEART", "BLOOD", "MOON", "EARTH", "ATOM",
  "GRAVITY", "ENERGY", "CARBON", "HELIUM", "CELL", "GENE", "FOSSIL", "MAGNET",
  "LIGHT", "SOUND", "FORCE", "PLANT", "POLLEN", "COMET", "ORBIT", "SOLAR",
];

const SPORTS = [
  "SOCCER", "TENNIS", "MARATHON", "OLYMPIC", "CHESS", "YOGA", "BOWLING",
  "GOAL", "TEAM", "MEDAL", "RACKET", "PITCH", "SWIM", "CYCLE", "RUGBY",
  "CRICKET", "SKATE", "SCORE", "MATCH", "LEAGUE", "ARENA", "COACH", "TROPHY",
];

const BIBLE = [
  "GENESIS", "NOAH", "ARK", "MOSES", "SINAI", "JONAH", "DAVID", "GOLIATH",
  "JESUS", "BETHLEHEM", "PSALMS", "EXODUS", "DANIEL", "PETER", "PAUL", "MARY",
  "JOSEPH", "GOSPEL", "PARABLE", "TEMPLE", "ISRAEL", "JORDAN", "SHEPHERD", "PSALM",
];

const MATHS = [
  "ALGEBRA", "ANGLE", "PRIME", "FRACTION", "DECIMAL", "CIRCLE", "SQUARE",
  "TRIANGLE", "RADIUS", "VOLUME", "GRAPH", "NUMBER", "EQUATION", "AVERAGE",
  "PERCENT", "RATIO", "VERTEX", "AREA", "FACTOR", "PRODUCT", "DIVIDE", "PLUS",
];

function unique(list: string[]) {
  return [...new Set(list.map((w) => w.replace(/[^A-Z]/gi, "").toUpperCase()).filter((w) => w.length >= 3 && w.length <= 12))];
}

const POOLS: Record<Exclude<Category, "random">, string[]> = {
  Geography: unique(GEOGRAPHY),
  Entertainment: unique(ENTERTAINMENT),
  History: unique(HISTORY),
  "Art & Literature": unique(ART),
  "Science & Nature": unique(SCIENCE),
  "Sports & Leisure": unique(SPORTS),
  "Bible Quiz": unique(BIBLE),
  Maths: unique(MATHS),
};

function poolFor(cat: Category): string[] {
  if (cat === "random") {
    return unique([...MUSIC_FAVES, ...MUSIC_FAVES, ...Object.values(POOLS).flat()]);
  }
  if (cat === "Entertainment") {
    return unique([...MUSIC_FAVES, ...MUSIC_FAVES, ...MUSIC_FAVES, ...ENTERTAINMENT]);
  }
  return POOLS[cat];
}

const SPEC: Record<Diff, { size: number; count: number; dirs: [number, number][] }> = {
  easy: {
    size: 8,
    count: 6,
    dirs: [
      [0, 1],
      [1, 0],
      [1, 1],
    ],
  },
  normal: {
    size: 10,
    count: 8,
    dirs: [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
      [0, -1],
    ],
  },
  hard: {
    size: 12,
    count: 12,
    dirs: [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ],
  },
};

function shuffle<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function weightedPool(cat: Category): string[] {
  const base = poolFor(cat);
  if (cat !== "Entertainment" && cat !== "random") return shuffle(base);
  const favs = unique(MUSIC_FAVES);
  const extra = shuffle(favs).slice(0, Math.max(8, Math.floor(base.length * 0.35)));
  return shuffle([...base, ...extra, ...extra]);
}

function idx(size: number, r: number, c: number) {
  return r * size + c;
}

function tryPlace(grid: (string | "")[], size: number, word: string, dirs: [number, number][]): number[] | null {
  const tries = shuffle(
    Array.from({ length: size * size * dirs.length }, (_, n) => {
      const cell = n % (size * size);
      const d = dirs[(n / (size * size)) | 0]!;
      return { r: (cell / size) | 0, c: cell % size, d };
    }),
  );
  for (const t of tries) {
    const cells: number[] = [];
    let ok = true;
    for (let k = 0; k < word.length; k++) {
      const r = t.r + t.d[0] * k;
      const c = t.c + t.d[1] * k;
      if (r < 0 || c < 0 || r >= size || c >= size) {
        ok = false;
        break;
      }
      const i = idx(size, r, c);
      const ch = grid[i];
      if (ch && ch !== word[k]) {
        ok = false;
        break;
      }
      cells.push(i);
    }
    if (!ok) continue;
    for (let k = 0; k < word.length; k++) grid[cells[k]!] = word[k]!;
    return cells;
  }
  return null;
}

export function makeSearch(diff: Diff, category: Category = "random"): Puzzle {
  const spec = SPEC[diff];
  const size = spec.size;
  const grid: (string | "")[] = Array(size * size).fill("");
  const pool = weightedPool(category).filter((w) => w.length <= size);
  const placed: Placed[] = [];
  const words: string[] = [];
  for (const word of pool) {
    if (words.length >= spec.count) break;
    if (words.includes(word)) continue;
    const cells = tryPlace(grid, size, word, spec.dirs);
    if (!cells) continue;
    placed.push({ word, cells });
    words.push(word);
  }
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 0; i < grid.length; i++) {
    if (!grid[i]) grid[i] = letters[(Math.random() * 26) | 0]!;
  }
  return { size, grid: grid as string[], words, placed, category };
}

export function lineBetween(size: number, a: number, b: number): number[] | null {
  const ar = (a / size) | 0;
  const ac = a % size;
  const br = (b / size) | 0;
  const bc = b % size;
  const dr = Math.sign(br - ar);
  const dc = Math.sign(bc - ac);
  const stepsR = Math.abs(br - ar);
  const stepsC = Math.abs(bc - ac);
  if (a === b) return [a];
  if (dr !== 0 && dc !== 0 && stepsR !== stepsC) return null;
  if (dr === 0 && dc === 0) return null;
  const n = Math.max(stepsR, stepsC);
  const cells: number[] = [];
  for (let k = 0; k <= n; k++) cells.push(idx(size, ar + dr * k, ac + dc * k));
  return cells;
}

export function matchWord(puzzle: Puzzle, cells: number[]): Placed | null {
  const key = cells.join(",");
  const rev = [...cells].reverse().join(",");
  return puzzle.placed.find((p) => p.cells.join(",") === key || p.cells.join(",") === rev) ?? null;
}
