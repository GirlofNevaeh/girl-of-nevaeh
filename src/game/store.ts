import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { playChime, playClick, playHeal, playPage, playRefuse } from "./audio";
import { say, SAVE_KEY, SAVE_VERSION } from "./copy";
import { SCENES } from "./story";
import type {
  CharacterId,
  GameSave,
  Intent,
  ItemId,
  PlayPhase,
  SceneId,
  ScreenId,
  Scores,
} from "./types";

function blank(): GameSave {
  return {
    version: SAVE_VERSION,
    screen: "title",
    character: null,
    scene: "intro",
    node: "open",
    phase: "dialogue",
    examined: [],
    inventory: [],
    journal: [],
    flags: {},
    scores: { healing: 0, fear: 0, control: 0 },
    soundOn: true,
    ending: null,
  };
}

function markScore(scores: Scores, intent?: Intent): Scores {
  if (!intent) return scores;
  return { ...scores, [intent]: scores[intent] + 1 };
}

function uniqueItem(list: ItemId[], item?: ItemId): ItemId[] {
  if (!item || list.includes(item)) return list;
  return [...list, item];
}

type Transient = {
  lookingAt: string | null;
  refuse: string | null;
  savedFlash: boolean;
};

type Actions = {
  hasProgress: () => boolean;
  newGame: () => void;
  chooseCharacter: (id: CharacterId) => void;
  continueGame: () => void;
  openCredits: () => void;
  openCodex: () => void;
  openDuel: () => void;
  openMarks: () => void;
  openChess: () => void;
  openDraughts: () => void;
  openBlocks: () => void;
  openArmada: () => void;
  openSmartz: () => void;
  openJumble: () => void;
  openFlip: () => void;
  openLeap: () => void;
  openDevil: () => void;
  openRow4: () => void;
  openDraw: () => void;
  openFlick: () => void;
  backToTitle: () => void;
  setSound: (on: boolean) => void;
  examine: (hotspotId: string) => void;
  closeLook: () => void;
  finishExplore: () => void;
  continueDialogue: () => void;
  choose: (index: number) => void;
  pickOrb: (optionId: string) => void;
  pickStealth: (spotId: string) => void;
  finishEnding: () => void;
  enterNode: (nodeId: string) => void;
};

function applyJournal(
  state: GameSave,
  entry: { id: string; title: string; text: import("./types").Line } | undefined,
  who: CharacterId,
): GameSave["journal"] {
  if (!entry) return state.journal;
  if (state.journal.some((j) => j.id === entry.id)) return state.journal;
  return [...state.journal, { id: entry.id, title: entry.title, text: say(entry.text, who) }];
}

function phaseForNode(sceneId: SceneId, nodeId: string): PlayPhase {
  const beat = SCENES[sceneId].nodes[nodeId];
  if (!beat) return "dialogue";
  if (beat.puzzle) return "puzzle";
  if (beat.stealth) return "stealth";
  if (beat.ending) return "ending";
  return "dialogue";
}

export const useGame = create<GameSave & Transient & Actions>()(
  persist(
    (set, get) => ({
      ...blank(),
      lookingAt: null,
      refuse: null,
      savedFlash: false,

      hasProgress: () => {
        const s = get();
        return s.character !== null && (s.scene !== "intro" || s.screen === "play" || s.screen === "credits");
      },

      newGame: () => {
        const soundOn = get().soundOn;
        set({
          ...blank(),
          soundOn,
          lookingAt: null,
          refuse: null,
          screen: "select",
        });
      },

      chooseCharacter: (id) => {
        const scene = SCENES.intro;
        set({
          character: id,
          screen: "play",
          scene: "intro",
          node: scene.startNode,
          phase: "dialogue",
          examined: [],
          inventory: [],
          journal: [],
          flags: {},
          scores: { healing: 0, fear: 0, control: 0 },
          ending: null,
          lookingAt: null,
          refuse: null,
        });
      },

      continueGame: () => {
        const s = get();
        if (!s.character) {
          set({ screen: "select" });
          return;
        }
        if (s.ending && s.scene === "epilogue") {
          set({ screen: "play", phase: "ending" });
          return;
        }
        set({ screen: s.screen === "title" || s.screen === "select" ? "play" : s.screen });
      },

      openCredits: () => set({ screen: "credits" }),
      openCodex: () => set({ screen: "codex" }),
      openDuel: () => {
        playClick();
        set({ screen: "duel" });
      },
      openMarks: () => {
        playClick();
        set({ screen: "marks" });
      },
      openChess: () => {
        playClick();
        set({ screen: "chess" });
      },
      openDraughts: () => {
        playClick();
        set({ screen: "draughts" });
      },
      openBlocks: () => {
        playClick();
        set({ screen: "blocks" });
      },
      openArmada: () => {
        playClick();
        set({ screen: "armada" });
      },
      openSmartz: () => {
        playClick();
        set({ screen: "smartz" });
      },
      openJumble: () => {
        playClick();
        set({ screen: "jumble" });
      },
      openFlip: () => {
        playClick();
        set({ screen: "flip" });
      },
      openLeap: () => {
        playClick();
        set({ screen: "leap" });
      },
      openDevil: () => {
        playClick();
        set({ screen: "devil" });
      },
      openRow4: () => {
        playClick();
        set({ screen: "row4" });
      },
      openDraw: () => {
        playClick();
        set({ screen: "draw" });
      },
      openFlick: () => {
        playClick();
        set({ screen: "flick" });
      },
      backToTitle: () => set({ screen: "title", lookingAt: null, refuse: null }),

      setSound: (on) => set({ soundOn: on }),

      examine: (hotspotId) => {
        const s = get();
        if (!s.character) return;
        const scene = SCENES[s.scene];
        const hs = scene.hotspots.find((h) => h.id === hotspotId);
        if (!hs) return;
        const key = `${s.scene}:${hotspotId}`;
        const examined = s.examined.includes(key) ? s.examined : [...s.examined, key];
        playClick();
        set({
          examined,
          inventory: uniqueItem(s.inventory, hs.grantItem),
          journal: applyJournal(s, hs.journal, s.character),
          lookingAt: hotspotId,
        });
      },

      closeLook: () => set({ lookingAt: null }),

      finishExplore: () => {
        const s = get();
        const scene = SCENES[s.scene];
        playClick();
        set({
          lookingAt: null,
          node: scene.startNode,
          phase: phaseForNode(s.scene, scene.startNode),
        });
      },

      continueDialogue: () => {
        const s = get();
        const beat = SCENES[s.scene].nodes[s.node];
        if (!beat?.next) return;
        playClick();
        get().enterNode(beat.next);
      },

      choose: (index) => {
        const s = get();
        if (!s.character) return;
        const beat = SCENES[s.scene].nodes[s.node];
        const choice = beat?.choices?.[index];
        if (!choice) return;
        const nextFlags = choice.setFlag ? { ...s.flags, [choice.setFlag]: true } : s.flags;
        playClick();
        set({
          scores: markScore(s.scores, choice.intent),
          inventory: uniqueItem(s.inventory, choice.grantItem),
          journal: applyJournal(s, choice.journal, s.character),
          flags: nextFlags,
          refuse: null,
        });
        get().enterNode(choice.next);
      },

      pickOrb: (optionId) => {
        const s = get();
        if (!s.character) return;
        const beat = SCENES[s.scene].nodes[s.node];
        const opt = beat?.puzzle?.options.find((o) => o.id === optionId);
        if (!opt || !beat.puzzle) return;
        if (!opt.selfless) {
          playRefuse();
          set({
            scores: markScore(s.scores, opt.intent),
            refuse: say(beat.puzzle.refuse, s.character),
          });
          return;
        }
        playHeal();
        set({
          scores: markScore(s.scores, opt.intent),
          refuse: null,
        });
        if (beat.next) get().enterNode(beat.next);
      },

      pickStealth: (spotId) => {
        const s = get();
        if (!s.character) return;
        const beat = SCENES[s.scene].nodes[s.node];
        const spot = beat?.stealth?.spots.find((sp) => sp.id === spotId);
        if (!spot || !beat.stealth) return;
        if (spot.safe) {
          playClick();
          set({ scores: markScore(s.scores, "healing"), refuse: null });
          if (beat.next) get().enterNode(beat.next);
        } else {
          playRefuse();
          set({ scores: markScore(s.scores, spot.intent ?? "fear"), refuse: null });
          get().enterNode(beat.stealth.caughtNext);
        }
      },

      finishEnding: () => set({ screen: "credits", phase: "dialogue" }),

      enterNode: (nodeId) => {
        if (nodeId === "credits") {
          set({ screen: "credits" });
          return;
        }
        const s = get();
        const beat = SCENES[s.scene].nodes[nodeId];
        if (!beat) return;
        if (beat.goScene) {
          const next = SCENES[beat.goScene];
          const skip = next.skipExplore || next.hotspots.length === 0;
          playPage();
          playChime();
          set({
            scene: beat.goScene,
            node: next.startNode,
            phase: skip ? phaseForNode(beat.goScene, next.startNode) : "explore",
            lookingAt: null,
            refuse: null,
            savedFlash: true,
          });
          window.setTimeout(() => set({ savedFlash: false }), 1200);
          return;
        }
        if (beat.ending) {
          set({
            ending: beat.ending,
            scene: "epilogue",
            node: "close",
            phase: "ending",
            scores: markScore(s.scores, beat.ending),
            lookingAt: null,
            refuse: null,
          });
          return;
        }
        set({
          node: nodeId,
          phase: phaseForNode(s.scene, nodeId),
          lookingAt: null,
        });
      },
    }),
    {
      name: SAVE_KEY,
      version: SAVE_VERSION,
      skipHydration: true,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        version: state.version,
        character: state.character,
        scene: state.scene,
        node: state.node,
        phase: state.phase,
        examined: state.examined,
        inventory: state.inventory,
        journal: state.journal,
        flags: state.flags,
        scores: state.scores,
        soundOn: state.soundOn,
        ending: state.ending,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<GameSave>;
        return {
          ...current,
          ...p,
          version: SAVE_VERSION,
          screen: "title" as const,
          scores: { healing: 0, fear: 0, control: 0, ...p.scores },
          examined: p.examined ?? [],
          inventory: p.inventory ?? [],
          journal: p.journal ?? [],
          flags: p.flags ?? {},
          lookingAt: null,
          refuse: null,
          savedFlash: false,
        };
      },
    },
  ),
);

export function requiredDone(scene: SceneId, examined: string[]): boolean {
  const spots = SCENES[scene].hotspots.filter((h) => h.required);
  if (spots.length === 0) {
    return SCENES[scene].hotspots.every((h) => examined.includes(`${scene}:${h.id}`));
  }
  return spots.every((h) => examined.includes(`${scene}:${h.id}`));
}

export type { ScreenId };
