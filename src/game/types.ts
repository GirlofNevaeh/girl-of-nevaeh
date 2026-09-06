export type CharacterId =
  | "nancy"
  | "ronnie"
  | "veronika"
  | "sarah"
  | "adamus"
  | "mira"
  | "sananda"
  | "zorath"
  | "samael"
  | "tux"
  | "murphy"
  | "milo"
  | "lena"
  | "eliav"
  | "nadav"
  | "harlan"
  | "geraldine"
  | "olivia"
  | "rosie"
  | "sophie";
export type PortraitId = CharacterId;
export type PortraitRef = PortraitId | "player";
export type Intent = "healing" | "fear" | "control";
export type ItemId = "orb" | "guidebook" | "glasses" | "photo";
export type AmbientId = "title" | "earth" | "cave" | "hospital" | "stone" | "bridge" | "nevaeh" | "leap" | "armada" | "flick" | "duel" | "blocks" | "devil";
export type ScreenId =
  | "title"
  | "select"
  | "play"
  | "credits"
  | "codex"
  | "duel"
  | "marks"
  | "chess"
  | "draughts"
  | "blocks"
  | "armada"
  | "smartz"
  | "jumble"
  | "flip"
  | "leap"
  | "devil"
  | "row4"
  | "draw"
  | "flick";
export type PlayPhase = "explore" | "dialogue" | "puzzle" | "stealth" | "ending";
export type SceneId =
  | "intro"
  | "kitchen"
  | "cave"
  | "hospital"
  | "chapter"
  | "bridge"
  | "valley"
  | "epilogue";

export type Line = string | Partial<Record<CharacterId | "all", string>>;

export interface JournalEntry {
  id: string;
  title: string;
  text: string;
}

export interface Hotspot {
  id: string;
  label: Line;
  x: number;
  y: number;
  required?: boolean;
  grantItem?: ItemId;
  journal?: { id: string; title: string; text: Line };
  text: Line;
}

export interface Choice {
  text: Line;
  intent?: Intent;
  next: string;
  grantItem?: ItemId;
  setFlag?: string;
  journal?: { id: string; title: string; text: Line };
}

export interface OrbOption {
  id: string;
  text: Line;
  selfless: boolean;
  intent: Intent;
}

export interface OrbPuzzle {
  prompt: Line;
  hint: Line;
  options: OrbOption[];
  refuse: Line;
}

export interface StealthSpot {
  id: string;
  label: Line;
  safe: boolean;
  intent?: Intent;
  x: number;
  y: number;
}

export interface StealthBeat {
  prompt: Line;
  spots: StealthSpot[];
  caughtNext: string;
}

export interface DialogueBeat {
  id: string;
  speaker?: Line;
  portrait?: PortraitRef | Partial<Record<CharacterId, PortraitRef>>;
  text: Line;
  choices?: Choice[];
  next?: string;
  puzzle?: OrbPuzzle;
  stealth?: StealthBeat;
  goScene?: SceneId;
  ending?: Intent;
}

export interface SceneDef {
  id: SceneId;
  title: string;
  location: string;
  background: string;
  ambient: AmbientId;
  skipExplore?: boolean;
  hotspots: Hotspot[];
  startNode: string;
  nodes: Record<string, DialogueBeat>;
}

export interface CharacterDef {
  id: CharacterId;
  name: string;
  role: string;
  age: string;
  bio: string;
  playstyle: string;
  portrait: string;
}

export interface Scores {
  healing: number;
  fear: number;
  control: number;
}

export interface GameSave {
  version: number;
  screen: ScreenId;
  character: CharacterId | null;
  scene: SceneId;
  node: string;
  phase: PlayPhase;
  examined: string[];
  inventory: ItemId[];
  journal: JournalEntry[];
  flags: Record<string, boolean>;
  scores: Scores;
  soundOn: boolean;
  ending: Intent | null;
}
