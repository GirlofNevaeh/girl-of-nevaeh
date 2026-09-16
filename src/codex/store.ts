import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { playChime, playClick, playHeal, playPage, playRefuse } from "@/game/audio";
import { readIntent } from "./orb";
import type { CodexTab, OrbReading } from "./types";
import { MAJOR_IDS } from "./data";

type CodexState = {
  tab: CodexTab;
  selected: string | null;
  favourites: string[];
  visited: string[];
  query: string;
  starredOnly: boolean;
  mapOpen: boolean;
  orbOpen: boolean;
  orbText: string;
  orbReading: OrbReading | null;
  characterTab: string;
  setTab: (tab: CodexTab) => void;
  setCharacterTab: (id: string) => void;
  openEntry: (id: string) => void;
  closeEntry: () => void;
  toggleFavourite: (id: string) => void;
  setQuery: (q: string) => void;
  setStarredOnly: (on: boolean) => void;
  openMap: () => void;
  closeMap: () => void;
  openOrb: () => void;
  closeOrb: () => void;
  setOrbText: (t: string) => void;
  offerIntent: (raw?: string) => void;
};

export const useCodex = create<CodexState>()(
  persist(
    (set, get) => ({
      tab: "characters",
      characterTab: "nancy",
      selected: null,
      favourites: [],
      visited: [],
      query: "",
      starredOnly: false,
      mapOpen: false,
      orbOpen: false,
      orbText: "",
      orbReading: null,

      setTab: (tab) => {
        playClick();
        set({ tab, selected: null, mapOpen: false, orbOpen: false });
      },
      setCharacterTab: (id) => {
        playClick();
        const visited = get().visited.includes(id) ? get().visited : [...get().visited, id];
        set({
          tab: "characters",
          characterTab: id,
          visited,
          selected: null,
          mapOpen: false,
        });
      },
      openEntry: (id) => {
        playPage();
        const visited = get().visited.includes(id) ? get().visited : [...get().visited, id];
        if (MAJOR_IDS.has(id)) {
          set({
            tab: "characters",
            characterTab: id,
            selected: null,
            visited,
            mapOpen: false,
          });
          return;
        }
        set({ selected: id, visited, mapOpen: false });
      },
      closeEntry: () => {
        playClick();
        set({ selected: null });
      },
      toggleFavourite: (id) => {
        playClick();
        const cur = get().favourites;
        set({
          favourites: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id],
        });
      },
      setQuery: (q) => set({ query: q }),
      setStarredOnly: (on) => set({ starredOnly: on }),
      openMap: () => {
        playPage();
        set({ mapOpen: true, selected: null });
      },
      closeMap: () => set({ mapOpen: false }),
      openOrb: () => {
        playClick();
        set({ orbOpen: true });
      },
      closeOrb: () => set({ orbOpen: false }),
      setOrbText: (t) => set({ orbText: t }),
      offerIntent: (raw) => {
        const text = (raw ?? get().orbText).trim();
        const reading = readIntent(text);
        if (reading.kind === "selfless") playHeal();
        else if (reading.kind === "selfish") playRefuse();
        else playChime();
        set({ orbText: text, orbReading: reading });
      },
    }),
    {
      name: "nevaeh-codex-v2",
      skipHydration: true,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        tab: s.tab,
        characterTab: s.characterTab,
        favourites: s.favourites,
        visited: s.visited,
      }),
    },
  ),
);
