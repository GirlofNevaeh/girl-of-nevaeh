import type { CSSProperties } from "react";

/** Freeze the app height so iOS URL-bar show/hide cannot resize playfields. */
export function pinAppFrame() {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (root.dataset.pinned === "1") return;
  const h = frameH();
  root.style.setProperty("--app-h", `${h}px`);
  root.dataset.pinned = "1";
}

function frameH() {
  const vis = window.visualViewport?.height ?? window.innerHeight;
  return Math.round(Math.min(window.innerHeight, vis));
}

function frameW() {
  const vis = window.visualViewport?.width ?? window.innerWidth;
  return Math.round(Math.min(window.innerWidth, vis));
}

let canvasLocks: Record<string, { w: number; h: number }> = {};

/** Pixel box for a playfield canvas. Measured once per key, never updated. */
export function lockCanvasBox(srcW: number, srcH: number, chrome = 180, key = "default") {
  if (canvasLocks[key]) return canvasLocks[key]!;
  const maxW = Math.min(frameW() - 16, srcW);
  const maxH = Math.min(frameH() - chrome, srcH);
  const scale = Math.min(maxW / srcW, maxH / srcH, 1);
  canvasLocks[key] = { w: Math.round(srcW * scale), h: Math.round(srcH * scale) };
  return canvasLocks[key]!;
}

export const SHELL: CSSProperties = {
  position: "fixed",
  inset: 0,
  width: "100%",
  height: "var(--app-h, 100%)",
  maxHeight: "var(--app-h, 100%)",
  overflow: "hidden",
  overscrollBehavior: "none",
};