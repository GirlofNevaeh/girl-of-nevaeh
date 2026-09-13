export const STAGES = [
  { id: "brooklyn", name: "Brooklyn Dusk", art: "/art/stages/brooklyn.jpg" },
  { id: "qumran", name: "Qumran Caves", art: "/art/stages/qumran.jpg" },
  { id: "elysium", name: "Elysium Court", art: "/art/stages/elysium.jpg" },
  { id: "nevaeh", name: "Nevaeh Palace", art: "/art/stages/nevaeh.jpg" },
  { id: "hospital", name: "Night Ward", art: "/art/stages/hospital.jpg" },
  { id: "valley", name: "Orb Valley", art: "/art/stages/valley.jpg" },
  { id: "bridge", name: "Shadow Bridge", art: "/art/stages/bridge.jpg" },
  { id: "firstworld", name: "First World", art: "/art/stages/firstworld.jpg" },
] as const;

export type StageId = (typeof STAGES)[number]["id"];

export function careerStage(rung: number): StageId {
  return STAGES[((rung % STAGES.length) + STAGES.length) % STAGES.length]!.id;
}

const bag: Record<string, HTMLImageElement> = {};

export function stageArt(id: StageId) {
  return STAGES.find((s) => s.id === id)?.art ?? STAGES[0].art;
}

export function preloadStages() {
  for (const s of STAGES) {
    if (bag[s.id]) continue;
    const img = new Image();
    img.decoding = "async";
    img.src = s.art;
    bag[s.id] = img;
  }
  return bag;
}

export function stageImage(id: StageId) {
  preloadStages();
  return bag[id] ?? null;
}
