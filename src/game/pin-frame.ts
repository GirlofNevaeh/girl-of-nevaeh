import type { CSSProperties } from "react";

/** Freeze the app height so iOS URL-bar show/hide cannot resize playfields. */
export function pinAppFrame() {
  if (typeof document === "undefined") return;
  applyFrame();
  if (document.documentElement.dataset.pinListen === "1") return;
  document.documentElement.dataset.pinListen = "1";
  window.addEventListener("orientationchange", () => {
    canvasLocks = {};
    window.setTimeout(applyFrame, 80);
  });
}

function applyFrame() {
  const root = document.documentElement;
  const h = frameH();
  const w = frameW();
  root.style.setProperty("--app-h", `${h}px`);
  root.style.setProperty("--app-w", `${w}px`);
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
  const land = frameW() > frameH();
  const slot = `${key}:${land ? "l" : "p"}`;
  if (canvasLocks[slot]) return canvasLocks[slot]!;
  const pad = land ? 88 : chrome;
  const maxW = Math.min(frameW() - (land ? 24 : 16), srcW);
  const maxH = Math.min(frameH() - pad, srcH);
  const scale = Math.min(maxW / srcW, maxH / srcH, 1);
  canvasLocks[slot] = { w: Math.round(srcW * scale), h: Math.round(srcH * scale) };
  return canvasLocks[slot]!;
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