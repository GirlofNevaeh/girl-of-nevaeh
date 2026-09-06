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
  return {
    draggable: false as const,
    onContextMenu: (e: { preventDefault: () => void }) => e.preventDefault(),
    onTouchStart: (e: { preventDefault: () => void }) => e.preventDefault(),
    onTouchMove: (e: { preventDefault: () => void }) => e.preventDefault(),
    onPointerDown: (e: PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      onDown();
    },
    onPointerUp: onUp,
    onPointerCancel: onUp,
    onPointerLeave: onUp,
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
