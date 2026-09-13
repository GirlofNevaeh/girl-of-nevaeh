import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";
import { cn } from "@/lib/cn";
import type { PointerEvent, ReactNode } from "react";

const ICONS = {
  up: ArrowUp,
  down: ArrowDown,
  left: ArrowLeft,
  right: ArrowRight,
};

const lock =
  "select-none touch-none [-webkit-touch-callout:none] [-webkit-user-select:none] [user-select:none]";

function bindPad(onDown: () => void, onUp?: () => void) {
  let armed = false;
  let pid: number | null = null;
  const end = () => {
    if (!armed) return;
    armed = false;
    pid = null;
    window.removeEventListener("pointerup", onWin);
    window.removeEventListener("pointercancel", onWin);
    onUp?.();
  };
  const onWin = (e: Event) => {
    const pe = e as globalThis.PointerEvent;
    if (pid != null && pe.pointerId !== pid) return;
    end();
  };
  const start = (e: PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (armed) end();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    pid = e.pointerId;
    armed = true;
    window.addEventListener("pointerup", onWin);
    window.addEventListener("pointercancel", onWin);
    onDown();
  };
  return {
    draggable: false as const,
    onContextMenu: (e: { preventDefault: () => void }) => e.preventDefault(),
    onPointerDown: start,
    onPointerUp: end,
    onPointerCancel: end,
    onLostPointerCapture: end,
  };
}

export function PadDock({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "pad-dock rounded-[22px] border border-[#3cf0ff]/40 bg-[#0b0b12]/90 p-3",
        lock,
        className,
      )}
      onContextMenu={(e) => e.preventDefault()}
    >
      {children}
    </div>
  );
}

export function NeonArrow({
  dir,
  tone,
  onDown,
  onUp,
}: {
  dir: "up" | "down" | "left" | "right";
  tone: "pink" | "blue";
  onDown: () => void;
  onUp?: () => void;
}) {
  const Icon = ICONS[dir];
  const pink = dir === "left" || dir === "right";
  return (
    <button
      type="button"
      aria-label={dir}
      className={cn(
        "grid size-14 place-items-center rounded-full",
        lock,
        pink ? "bg-[#ff2bd6] text-ink shadow-[0_0_16px_#ff2bd6]" : "bg-[#12d8ff] text-ink shadow-[0_0_16px_#12d8ff]",
      )}
      {...bindPad(onDown, onUp)}
    >
      <Icon className="pointer-events-none size-7" strokeWidth={2.6} />
    </button>
  );
}

export function NeonAct({
  kind = "blue",
  label,
  mark,
  onDown,
  onUp,
}: {
  kind?: "blue" | "pink";
  label: string;
  mark?: string;
  onDown: () => void;
  onUp?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "grid size-14 shrink-0 place-items-center rounded-full font-display text-lg text-ink",
        lock,
        kind === "blue"
          ? "bg-[#12d8ff] shadow-[0_0_14px_#12d8ff] ring-2 ring-[#ff2bd6]"
          : "bg-[#ff2bd6] shadow-[0_0_14px_#ff2bd6] ring-2 ring-[#12d8ff]",
      )}
      {...bindPad(onDown, onUp)}
    >
      {mark ? <span className="pointer-events-none leading-none">{mark}</span> : null}
    </button>
  );
}
