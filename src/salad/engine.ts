export type Diff = "easy" | "normal" | "hard";

export const TIME = 30;
export const WORDS_PER_LEVEL = 5;

const POOL: Record<number, string[]> = {
  4: [
    "STAR", "MOON", "HOPE", "LOVE", "FIRE", "RAIN", "WIND", "SONG", "BOOK", "TREE",
    "BLUE", "PINK", "GOLD", "CITY", "HOME", "KIND", "PLAY", "JUMP", "CAVE", "GATE",
    "PATH", "LAMP", "SHIP", "BIRD", "FISH", "WOLF", "BEAR", "RING", "SNOW", "LEAF",
    "ROSE", "LION", "PEAR", "CAKE", "MILK", "BELL", "DRUM", "NOTE", "WAVE", "SAND",
    "HILL", "LAKE", "PARK", "HERO", "GLOW", "NEON", "ROCK", "SEED", "DOOR", "WALL",
    "ROAD", "BOAT", "KITE", "COIN", "MASK", "TENT", "FORK", "BOWL", "SOAP", "WOOL",
  ],
  5: [
    "HEART", "LIGHT", "CLOUD", "STORM", "RIVER", "OCEAN", "EARTH", "MUSIC", "DANCE",
    "SMILE", "DREAM", "MAGIC", "PEACE", "FAITH", "CROWN", "SWORD", "STONE", "FLAME",
    "SPARK", "ORBIT", "COMET", "TIGER", "HORSE", "EAGLE", "WHALE", "CORAL", "APPLE",
    "BREAD", "HONEY", "BERRY", "GRAPE", "LEMON", "MAPLE", "IVORY", "PEARL", "PIANO",
    "FLUTE", "STAGE", "STORY", "NOVEL", "SHINE", "LEVEL", "SCORE", "TIMER", "FIELD",
    "GROVE", "BRAVE", "PRIDE", "GRACE", "CHARM", "DRUMS", "PLANT", "WATER", "PAPER",
    "GLASS", "CHAIR", "TABLE", "CLOCK", "BRUSH", "PAINT", "VOICE", "SOUND", "NIGHT",
  ],
  6: [
    "PLANET", "GALAXY", "CASTLE", "KNIGHT", "DRAGON", "TEMPLE", "BRIDGE", "GARDEN",
    "FOREST", "MEADOW", "STREAM", "ISLAND", "DESERT", "SUMMER", "WINTER", "SPRING",
    "AUTUMN", "FRIEND", "FAMILY", "SISTER", "MOTHER", "FATHER", "SCHOOL", "PENCIL",
    "GUITAR", "VIOLIN", "MELODY", "CHORUS", "LYRICS", "CAMERA", "CANVAS", "SKETCH",
    "PUZZLE", "RIDDLE", "SECRET", "SHADOW", "SILVER", "GOLDEN", "PURPLE", "ORANGE",
    "YELLOW", "VIOLET", "MIRROR", "HELMET", "ANCHOR", "SAILOR", "ROCKET", "METEOR",
    "KITTEN", "PUPPY", "RABBIT", "TURTLE", "FALCON", "PLANET", "BUTTON", "WINDOW",
    "CANDLE", "LANTERN", "MARKET", "CIRCLE", "SQUARE", "SPIRAL", "RIBBON", "POCKET",
  ].filter((w) => w.length === 6),
  7: [
    "RAINBOW", "THUNDER", "HARMONY", "COURAGE", "FREEDOM", "JUSTICE", "KINGDOM",
    "FORTUNE", "MYSTERY", "JOURNEY", "HORIZON", "SUNRISE", "LIBRARY", "CHAPTER",
    "PICTURE", "DRAWING", "SINGING", "DANCING", "RUNNING", "WARRIOR", "DIAMOND",
    "EMERALD", "PENGUIN", "GIRAFFE", "PANTHER", "LEOPARD", "OCTOPUS", "SCIENCE",
    "HISTORY", "NUMBERS", "PUZZLES", "RIDDLES", "SECRETS", "BROTHER", "POPPIES",
    "DOLPHIN", "CRYSTAL", "LANTERN", "BLOSSOM", "THISTLE", "THUNDER", "GLIMMER",
    "SPARKLE", "WHISPER", "BLANKET", "CUSHION", "KITCHEN", "GARDENS", "TRAILS",
  ].filter((w) => w.length === 7),
  8: [
    "STARSHIP", "MOONBEAM", "SUNSHINE", "DAYBREAK", "MIDNIGHT", "UNIVERSE", "ASTEROID",
    "TREASURE", "KINGDOMS", "WARRIORS", "CHAMPION", "FRIENDLY", "KINDNESS", "LAUGHTER",
    "BASEBALL", "FOOTBALL", "SWIMMING", "PAINTING", "SKETCHES", "MELODIES", "SYMPHONY",
    "ELEPHANT", "KANGAROO", "MOUNTAIN", "SEASHORE", "SANDWICH", "PANCAKES", "LEMONADE",
    "NOTEBOOK", "BACKPACK", "HOMEWORK", "TWILIGHT", "CRYSTALS", "FIREWORK", "SNOWBALL",
    "RAINCOAT", "FOOTSTEP", "DOORSTEP", "MOONRISE", "STARFISH", "SEASHELL", "LULLABY",
  ].filter((w) => w.length === 8),
  9: [
    "COUNTDOWN", "CONUNDRUM", "ADVENTURE", "CHAMPIONS", "STARLIGHT", "MOONLIGHT",
    "SUNFLOWER", "BUTTERFLY", "WATERFALL", "MOUNTAINS", "SPACESHIP", "TELESCOPE",
    "WONDERFUL", "BEAUTIFUL", "BRILLIANT", "FANTASTIC", "CHOCOLATE", "BLUEBERRY",
    "STORYBOOK", "FAIRYTALE", "DAYDREAMS", "NIGHTFALL", "AFTERNOON", "STARSHIPS",
    "HONEYBEES", "AMAZEMENT", "LIGHTNING", "SNOWFLAKE", "CANDLELIT", "MOONBEAMS",
    "RAINSTORM", "FIREFLIES", "WHIRLPOOL", "CLOCKWORK", "PATCHWORK", "NEEDLEWORK",
  ].filter((w) => w.length === 9),
};

export function wordLen(diff: Diff, level: number): number {
  if (diff === "easy") return Math.min(6, 4 + Math.floor((level - 1) / 2));
  if (diff === "normal") return Math.min(8, 5 + Math.floor((level - 1) / 2));
  return Math.min(9, 7 + Math.floor((level - 1) / 2));
}

export function scramble(word: string): string {
  const a = word.split("");
  for (let n = 0; n < 24; n++) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j]!, a[i]!];
    }
    if (a.join("") !== word) return a.join("");
  }
  return a.reverse().join("") === word ? word[1] + word[0] + word.slice(2) : a.reverse().join("");
}

export function pickWord(diff: Diff, level: number, used: Set<string>): string {
  let len = wordLen(diff, level);
  for (let k = 0; k < 8; k++) {
    const pool = (POOL[len] ?? []).filter((w) => !used.has(w));
    if (pool.length) return pool[(Math.random() * pool.length) | 0]!;
    len = len <= 4 ? Math.min(9, len + 1) : len - 1;
  }
  const fb = POOL[wordLen(diff, level)] ?? POOL[5]!;
  return fb[level % fb.length]!;
}

export function scoreFor(left: number, level: number): number {
  return Math.max(10, Math.ceil(left) * 8) * level;
}

export const HI_KEY = "nevaeh-salad-hi-v1";
