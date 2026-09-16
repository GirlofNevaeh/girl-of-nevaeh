export const YOU_HUES = ["green", "purple", "white"] as const;
export const BOSS_HUES = ["red", "yellow"] as const;
export type YouHue = (typeof YOU_HUES)[number];
export type BossHue = (typeof BOSS_HUES)[number];
export type ShotHue = YouHue | BossHue;

export function beamPaint(hue: ShotHue) {
  if (hue === "purple") return { glow: "#c44dff", core: "#f3d6ff" };
  if (hue === "white") return { glow: "#f7fbff", core: "#ffffff" };
  if (hue === "red") return { glow: "#ff2a2a", core: "#ffd0d0" };
  if (hue === "yellow") return { glow: "#ffe000", core: "#fff6b0" };
  return { glow: "#39ff14", core: "#eaffc4" };
}
