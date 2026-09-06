import { Button } from "@/components/ui/button";
import { CHARACTERS } from "@/game/characters";
import { playClick } from "@/game/audio";
import { useGame } from "@/game/store";
import { cn } from "@/lib/cn";
import type { CharacterId } from "@/game/types";
import { useEffect, useRef, useState } from "react";

type Tool = "pen" | "chalk" | "spray" | "eraser";

const NEON = ["#ff2bd6", "#12d8ff", "#39ff14", "#f5ff3c", "#ff2a2a", "#b14bff"];

const COLORS = [
  "#ffffff",
  "#121014",
  "#4a4038",
  "#8a6a4a",
  "#f4ead8",
  "#d4a54a",
  "#e07a5a",
  "#c45c3a",
  "#8a3a48",
  "#b01020",
  "#6b5b8c",
  "#3a6a48",
  "#2a6aaa",
  "#1d2a4a",
  "#7ad7f0",
  "#f2a7c8",
  "#c4c8d0",
  "#6d655c",
];

const SIZES = [6, 20, 48, 96];

const EMOJIS = [
  "😀", "😂", "😍", "🥰", "😎", "🤩", "😜", "😇",
  "😭", "😡", "😱", "🤔", "😴", "🤗", "🥳", "😏",
  "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "💖",
  "👍", "👏", "🙌", "🔥", "⭐", "✨", "🎉", "💯",
  "🌸", "🌈", "☀️", "🌙", "⚡", "🍀", "🐶", "🐱",
  "🍕", "🍦", "⚽", "🎵", "📱", "👑", "💎", "🚀",
  "🎄", "🎅", "🧛", "🧟‍♀️", "🧜‍♀️", "🧚", "🎃", "👻",
];

type Scene = "blank" | "brick" | "bus" | "subway" | "school" | "board";

const SCENES: { id: Scene; label: string; src?: string }[] = [
  { id: "blank", label: "Blank" },
  { id: "brick", label: "Brick wall", src: "/art/paint/brick.jpg" },
  { id: "bus", label: "School bus", src: "/art/paint/bus.jpg" },
  { id: "subway", label: "Subway", src: "/art/paint/subway.jpg" },
  { id: "school", label: "School wall", src: "/art/paint/school.jpg" },
  { id: "board", label: "Blackboard", src: "/art/paint/board.jpg" },
];

const PAPERS = ["#ffffff", "#f4ead8", "#100e0c", "#ff2bd6", "#12d8ff", "#39ff14"];

const HOLE = { x: 190, y: 141, w: 529, h: 332 };

export function DrawView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const outlineRef = useRef<HTMLCanvasElement>(null);
  const prev = useRef<{ x: number; y: number } | null>(null);
  const drawing = useRef(false);
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState("#ff2bd6");
  const [size, setSize] = useState(20);
  const [emoji, setEmoji] = useState<string | null>(null);
  const [paper, setPaper] = useState("#ffffff");
  const [page, setPage] = useState<CharacterId | "blank">("blank");
  const [scene, setScene] = useState<Scene>("blank");
  const snaps = useRef<ImageData[]>([]);

  const prep = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    return { canvas, ctx };
  };

  useEffect(() => {
    const g = prep();
    if (!g) return;
    g.ctx.clearRect(0, 0, g.canvas.width, g.canvas.height);
    snaps.current = [];
  }, []);

  const stampPage = (id: CharacterId | "blank") => {
    const g = prep();
    if (!g) return;
    g.ctx.clearRect(0, 0, g.canvas.width, g.canvas.height);
    const ink = outlineRef.current?.getContext("2d");
    if (ink && outlineRef.current) {
      ink.clearRect(0, 0, outlineRef.current.width, outlineRef.current.height);
    }
    if (id === "blank") return;
    const img = new Image();
    img.onload = () => {
      if (!ink || !outlineRef.current) return;
      const maxW = outlineRef.current.width * 0.92;
      const maxH = outlineRef.current.height * 0.92;
      const s = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight);
      const dw = img.naturalWidth * s;
      const dh = img.naturalHeight * s;
      ink.clearRect(0, 0, outlineRef.current.width, outlineRef.current.height);
      ink.drawImage(
        img,
        (outlineRef.current.width - dw) / 2,
        (outlineRef.current.height - dh) / 2,
        dw,
        dh,
      );
    };
    img.src = `/art/outlines/${id}.png?v=line2`;
  };

  const saveSnap = () => {
    const g = prep();
    if (!g) return;
    snaps.current.push(g.ctx.getImageData(0, 0, g.canvas.width, g.canvas.height));
    if (snaps.current.length > 24) snaps.current.shift();
  };

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const r = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * canvas.width,
      y: ((e.clientY - r.top) / r.height) * canvas.height,
    };
  };

  const stamp = (ctx: CanvasRenderingContext2D, x: number, y: number, from?: { x: number; y: number }) => {
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    if (tool === "spray") {
      ctx.fillStyle = color;
      const radius = size / 2;
      const n = 40 + Math.floor(size * 1.2);
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const d = Math.random() * radius;
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.restore();
      return;
    }
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "#000";
      ctx.globalAlpha = 1;
      ctx.lineWidth = size * 1.6;
      ctx.beginPath();
      if (from) ctx.moveTo(from.x, from.y);
      else ctx.moveTo(x, y);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, ctx.lineWidth / 2, 0, Math.PI * 2);
      ctx.fillStyle = "#000";
      ctx.fill();
    } else if (tool === "chalk") {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineCap = "butt";
      ctx.lineJoin = "round";
      const dx = from ? x - from.x : 0;
      const dy = from ? y - from.y : 0;
      const len = Math.max(1, Math.hypot(dx, dy));
      const nx = len ? -dy / len : 0;
      const ny = len ? dx / len : 1;
      for (let i = 0; i < 7; i++) {
        const off = (i - 3) * (size * 0.16);
        ctx.globalAlpha = 0.1 + Math.random() * 0.22;
        ctx.lineWidth = size * (0.35 + Math.random() * 0.55);
        ctx.beginPath();
        if (from) ctx.moveTo(from.x + nx * off, from.y + ny * off);
        else ctx.moveTo(x + nx * off, y + ny * off);
        ctx.lineTo(x + nx * off + (Math.random() - 0.5) * 1.4, y + ny * off + (Math.random() - 0.5) * 1.4);
        ctx.stroke();
      }
      ctx.globalAlpha = 0.22;
      const dust = 8 + Math.floor(size * 0.45);
      for (let i = 0; i < dust; i++) {
        ctx.beginPath();
        ctx.arc(
          x + (Math.random() - 0.5) * size * 1.4,
          y + (Math.random() - 0.5) * size * 0.7,
          Math.random() * 1.3,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
      ctx.globalAlpha = 1;
      ctx.lineWidth = size;
      ctx.beginPath();
      if (from) ctx.moveTo(from.x, from.y);
      else ctx.moveTo(x, y);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, ctx.lineWidth / 2, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    ctx.restore();
  };

  const dropEmoji = (ctx: CanvasRenderingContext2D, x: number, y: number, mark: string) => {
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    if (mark === "X" || mark === "O") {
      const col = mark === "X" ? "#ff2bd6" : "#12d8ff";
      const px = Math.max(40, size * 2);
      ctx.font = `700 ${px}px Audiowide, system-ui`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = col;
      ctx.shadowBlur = 16;
      ctx.fillStyle = col;
      ctx.fillText(mark, x, y);
    } else {
      const px = Math.max(56, size * 2.2);
      const off = document.createElement("canvas");
      off.width = 320;
      off.height = 320;
      const o = off.getContext("2d");
      if (o) {
        o.clearRect(0, 0, 320, 320);
        o.font = `96px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
        o.textAlign = "center";
        o.textBaseline = "middle";
        o.fillText(mark, 160, 168);
        ctx.drawImage(off, x - px / 2, y - px / 2, px, px);
      }
    }
    ctx.restore();
  };

  return (
    <div
      className="flex h-svh min-h-0 flex-col overflow-hidden bg-ink text-parchment"
      style={{ overscrollBehavior: "none" }}
    >
      <div
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden"
        style={{ overscrollBehaviorY: "none", WebkitOverflowScrolling: "auto" }}
      >
      <header className="flex shrink-0 items-center gap-3 px-3 py-2 pt-[max(0.6rem,env(safe-area-inset-top))]">
        <Button variant="quiet" onClick={() => useGame.getState().backToTitle()}>
          Main Menu
        </Button>
        <h1 className="min-w-0 flex-1 font-display text-2xl">Paint</h1>
        <button
          type="button"
          className="h-10 w-[4.6rem] shrink-0 rounded-[12px] border border-[#ff4ae0] bg-[#ff2bd6] text-xs text-ink"
          onClick={async () => {
            const canvas = canvasRef.current;
            const ink = outlineRef.current;
            if (!canvas) return;
            playClick();
            const out = document.createElement("canvas");
            out.width = canvas.width;
            out.height = canvas.height;
            const octx = out.getContext("2d");
            if (!octx) return;
            octx.fillStyle = scene === "blank" ? paper : "#100e0c";
            octx.fillRect(0, 0, out.width, out.height);
            const spec = SCENES.find((s) => s.id === scene);
            if (spec?.src) {
              const bg = new Image();
              bg.crossOrigin = "anonymous";
              await new Promise<void>((ok) => {
                bg.onload = () => ok();
                bg.onerror = () => ok();
                bg.src = spec.src!;
              });
              if (bg.naturalWidth) octx.drawImage(bg, 0, 0, out.width, out.height);
            }
            octx.drawImage(canvas, 0, 0);
            if (ink) octx.drawImage(ink, 0, 0);
            out.toBlob(async (blob) => {
              if (!blob) return;
              const file = new File([blob], "paint.png", { type: "image/png" });
              const nav = navigator as Navigator & {
                share?: (d: ShareData) => Promise<void>;
                canShare?: (d: ShareData) => boolean;
              };
              if (nav.share && nav.canShare?.({ files: [file] })) {
                try {
                  await nav.share({ files: [file], title: "Paint" });
                  return;
                } catch {
                  /* fall through */
                }
              }
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download = "paint.png";
              a.click();
            }, "image/png");
          }}
        >
          Save
        </button>
      </header>
      <div className="shrink-0 px-3" style={{ overscrollBehavior: "none" }}>
      <div className="grid grid-cols-4 gap-2">
        {(["pen", "chalk", "spray"] as Tool[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setEmoji(null);
              setTool(t);
            }}
            className={cn(
              "h-10 w-full rounded-[12px] border text-xs capitalize",
              tool === t ? "border-[#ff4ae0] bg-[#ff2bd6] text-ink" : "border-gold/25 text-silver",
            )}
          >
            {t}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            setEmoji(null);
            setTool("eraser");
          }}
          className={cn(
            "h-10 w-full rounded-[12px] border text-xs",
            tool === "eraser" ? "border-[#ff4ae0] bg-[#ff2bd6] text-ink" : "border-gold/25 text-silver",
          )}
        >
          Eraser
        </button>
      </div>
      <div className="mt-2 grid grid-cols-4 place-items-center gap-1 pb-1">
        {SIZES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSize(s)}
            className={cn(
              "grid size-10 place-items-center rounded-full border",
              size === s ? "border-[#3cf0ff]" : "border-white/20",
            )}
          >
            <span
              className="rounded-full bg-parchment"
              style={{ width: 4 + Math.min(s, 96) * 0.16, height: 4 + Math.min(s, 96) * 0.16 }}
            />
          </button>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-6 gap-2">
        {NEON.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => {
              setColor(c);
              setEmoji(null);
              if (tool === "eraser") setTool("pen");
            }}
            className={cn("size-9 w-full rounded-full border-2", color === c && !emoji ? "border-white" : "border-white/20")}
            style={{ background: c, boxShadow: `0 0 10px ${c}` }}
            aria-label={c}
          />
        ))}
      </div>
      <div className="mt-2 grid grid-cols-6 gap-2">
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => {
              setColor(c);
              setEmoji(null);
              if (tool === "eraser") setTool("pen");
            }}
            className={cn("mx-auto size-9 rounded-full border-2", color === c && !emoji ? "border-[#3cf0ff]" : "border-white/20")}
            style={{ background: c }}
            aria-label={c}
          />
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        {(["X", "O"] as const).map((mark) => (
          <button
            key={mark}
            type="button"
            onClick={() => {
              playClick();
              setEmoji(mark);
            }}
            className={cn(
              "h-10 flex-1 rounded-[12px] border font-display text-xl",
              emoji === mark ? "border-white" : "border-gold/25",
            )}
            style={{ color: mark === "X" ? "#ff2bd6" : "#12d8ff", textShadow: `0 0 10px ${mark === "X" ? "#ff2bd6" : "#12d8ff"}` }}
          >
            {mark}
          </button>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-8 gap-1">
        {EMOJIS.map((mark) => (
          <button
            key={mark}
            type="button"
            onClick={() => {
              playClick();
              setEmoji(mark);
            }}
            className={cn(
              "grid h-10 w-full place-items-center rounded-[8px] border text-lg leading-none",
              emoji === mark ? "border-[#ff4ae0] bg-ink-soft" : "border-gold/20",
            )}
          >
            {mark}
          </button>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {SCENES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              playClick();
              setScene(s.id);
              if (s.id !== "blank") {
                setPage("blank");
                stampPage("blank");
              }
            }}
            className={cn(
              "h-9 w-full rounded-[10px] border px-2 text-xs",
              scene === s.id ? "border-[#ff4ae0] text-[#ff4ae0]" : "border-gold/25",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
      {scene === "blank" ? (
        <div className="mt-2 flex items-center gap-2 overflow-x-auto">
          <span className="shrink-0 text-[10px] tracking-wide text-gold uppercase">Paper</span>
          {PAPERS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={"paper " + c}
              onClick={() => setPaper(c)}
              className={cn("size-8 shrink-0 rounded-full border-2", paper === c ? "border-[#3cf0ff]" : "border-white/20")}
              style={{ background: c }}
            />
          ))}
        </div>
      ) : null}
      <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
        {CHARACTERS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => {
              playClick();
              setScene("blank");
              setPaper("#ffffff");
              setPage(c.id);
              stampPage(c.id);
            }}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-[12px] border px-2 py-1",
              page === c.id ? "border-[#ff4ae0]" : "border-gold/25",
            )}
          >
            <img src={`/art/outlines/${c.id}.png?v=line2`} alt="" className="h-10 w-10 rounded-[8px] bg-parchment object-contain" />
            <span className="max-w-20 truncate text-xs">{c.name.split(" ")[0]}</span>
          </button>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => {
            playClick();
            setPage("blank");
            stampPage("blank");
          }}
          className={cn(
            "h-10 rounded-[12px] border text-xs",
            page === "blank" ? "border-[#3cf0ff] text-[#3cf0ff]" : "border-gold/25",
          )}
        >
          Blank
        </button>
        <button
          type="button"
          className="h-10 rounded-[12px] border border-gold/25 text-xs text-silver"
          onClick={() => {
            playClick();
            const g = prep();
            const snap = snaps.current.pop();
            if (!g || !snap) return;
            g.ctx.putImageData(snap, 0, 0);
          }}
        >
          Undo
        </button>
        <button
          type="button"
          className="h-10 rounded-[12px] border border-gold/25 text-xs text-silver"
          onClick={() => {
            playClick();
            const g = prep();
            if (!g) return;
            try {
              snaps.current.push(g.ctx.getImageData(0, 0, g.canvas.width, g.canvas.height));
            } catch {
              /* ignore */
            }
            g.ctx.clearRect(0, 0, g.canvas.width, g.canvas.height);
            const ink = outlineRef.current?.getContext("2d");
            if (ink && outlineRef.current) ink.clearRect(0, 0, outlineRef.current.width, outlineRef.current.height);
            if (page !== "blank") stampPage(page);
          }}
        >
          Clear
        </button>
      </div>
      </div>
      <div className="relative h-[50vh] w-full shrink-0 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div className="relative h-full w-full">
          {scene === "blank" ? (
            <div className="absolute inset-0" style={{ background: paper }} />
          ) : (
            <img
              src={SCENES.find((s) => s.id === scene)?.src}
              alt=""
              className="pointer-events-none absolute inset-0 h-full w-full object-cover"
            />
          )}
          <canvas
            ref={canvasRef}
            width={900}
            height={620}
            className="absolute inset-0 h-full w-full touch-none"
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              saveSnap();
              const p = pos(e);
              const g = prep();
              if (!g) return;
              if (emoji) {
                dropEmoji(g.ctx, p.x, p.y, emoji);
                drawing.current = false;
                prev.current = null;
                return;
              }
              drawing.current = true;
              prev.current = p;
              stamp(g.ctx, p.x, p.y);
            }}
            onPointerMove={(e) => {
              if (!drawing.current || emoji) return;
              const p = pos(e);
              const g = prep();
              if (g) stamp(g.ctx, p.x, p.y, prev.current ?? undefined);
              prev.current = p;
            }}
            onPointerUp={() => {
              drawing.current = false;
              prev.current = null;
            }}
          />
          <canvas
            ref={outlineRef}
            width={900}
            height={620}
            className="pointer-events-none absolute inset-0 h-full w-full"
          />
        </div>
      </div>
      </div>
    </div>
  );
}
