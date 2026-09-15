import { Button } from "@/components/ui/button";
import { ART } from "@/game/assets";
import { Download, Volume2, VolumeX, X } from "lucide-react";
import { useRef, useState, type TouchEvent as TE, type WheelEvent as WE } from "react";

async function saveArt(src: string, name: string) {
  try {
    const res = await fetch(src);
    const blob = await res.blob();
    const file = new File([blob], name, { type: blob.type || "image/jpeg" });
    const nav = navigator as Navigator & {
      share?: (d: ShareData) => Promise<void>;
      canShare?: (d: ShareData) => boolean;
    };
    if (nav.share && nav.canShare?.({ files: [file] })) {
      await nav.share({ files: [file], title: "Girl of NevaeH" });
      return;
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  } catch {
    window.open(src, "_blank", "noopener");
  }
}

export function TitleScreen({
  canContinue: _can,
  soundOn,
  onNew,
  onContinue: _onContinue,
  onCredits,
  onCodex,
  onFight,
  onMarks,
  onChess,
  onDraughts,
  onBlocks,
  onArmada,
  onSmartz,
  onJumble,
  onFlip,
  onLeap,
  onDevil,
  onRow4,
  onDraw,
  onFlick,
  onSudoku,
  onWords,
  onGuess,
  onSalad,
  onSound,
}: {
  canContinue: boolean;
  soundOn: boolean;
  onNew: () => void;
  onContinue: () => void;
  onCredits: () => void;
  onCodex: () => void;
  onFight: () => void;
  onMarks: () => void;
  onChess: () => void;
  onDraughts: () => void;
  onBlocks: () => void;
  onArmada: () => void;
  onSmartz: () => void;
  onJumble: () => void;
  onFlip: () => void;
  onLeap: () => void;
  onDevil: () => void;
  onRow4: () => void;
  onDraw: () => void;
  onFlick: () => void;
  onSudoku: () => void;
  onWords: () => void;
  onGuess: () => void;
  onSalad: () => void;
  onSound: () => void;
}) {
  const [story, setStory] = useState(false);
  const [cover, setCover] = useState(false);
  const [install, setInstall] = useState(false);
  const tile = "h-12 w-full min-w-0 px-2 text-center text-xs leading-tight";
  return (
    <div className="home-shell relative flex w-full flex-col bg-ink">
      <h1 className="sr-only">Girl of NevaeH</h1>

      <div
        className="relative z-20 h-[52svh] w-full shrink-0"
        style={{ touchAction: "manipulation" }}
      >
        <img
          src={ART.cover}
          alt="Girl of NevaeH, front cover by R A Simpson"
          draggable={false}
          className="pointer-events-none mx-auto h-full max-h-full w-auto max-w-full object-contain p-2 sm:p-4"
        />
        <button
          type="button"
          aria-label="Enlarge cover photo"
          className="absolute inset-0 z-20 cursor-pointer bg-transparent"
          style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
          onPointerDown={(e) => {
            (e.currentTarget as HTMLButtonElement).dataset.x = String(e.clientX);
            (e.currentTarget as HTMLButtonElement).dataset.y = String(e.clientY);
          }}
          onPointerUp={(e) => {
            const x = Number((e.currentTarget as HTMLButtonElement).dataset.x || 0);
            const y = Number((e.currentTarget as HTMLButtonElement).dataset.y || 0);
            if (Math.hypot(e.clientX - x, e.clientY - y) < 18) {
              e.preventDefault();
              e.stopPropagation();
              setCover(true);
            }
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setCover(true);
          }}
        />
      </div>

      <div className="home-menu relative z-30 flex w-full flex-col gap-3 px-4 pt-3 pb-[max(1.4rem,env(safe-area-inset-bottom))]">
        <p className="text-center text-sm tracking-wide text-[#3cf0ff]" style={{ fontFamily: "Audiowide, system-ui" }}>
          Girl of NevaeH
        </p>
        <p className="hidden text-center text-sm tracking-[0.12em] text-gold uppercase lg:block">
          A narrative adventure
        </p>
        <p className="hidden text-center font-display text-lg text-gold italic lg:block">Let it heal.</p>
        <div className="grid grid-cols-3 gap-2">
          <Button variant="blue" className={tile} onClick={onNew}>
            Role Play
          </Button>
          <Button variant="pink" className={tile} onClick={onCodex}>
            Characters
          </Button>
          <Button variant="blue" className={tile} onClick={() => setStory(true)}>
            The Story
          </Button>
        </div>
        <p className="text-center text-[10px] tracking-[0.2em] text-gold uppercase">Games</p>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="pink" className={tile} onClick={onFight}>
            Warrior Battle
          </Button>
          <Button variant="blue" className={tile} onClick={onMarks}>
            XO
          </Button>
          <Button variant="pink" className={tile} onClick={onChess}>
            Chess
          </Button>
          <Button variant="blue" className={tile} onClick={onDraughts}>
            Draughts
          </Button>
          <Button variant="pink" className={tile} onClick={onBlocks}>
            Blocks
          </Button>
          <Button variant="blue" className={tile} onClick={onArmada}>
            Armageddon
          </Button>
          <Button variant="pink" className={tile} onClick={onSmartz}>
            Quiz Time
          </Button>
          <Button variant="blue" className={tile} onClick={onJumble}>
            Slider
          </Button>
          <Button variant="pink" className={tile} onClick={onFlip}>
            Flip It
          </Button>
          <Button variant="blue" className={tile} onClick={onLeap}>
            Civil War
          </Button>
          <Button variant="pink" className={tile} onClick={onDevil}>
            Devil Run
          </Button>
          <Button variant="blue" className={tile} onClick={onRow4}>
            Six, Seven
          </Button>
          <Button variant="pink" className={tile} onClick={onDraw}>
            Paint
          </Button>
          <Button variant="blue" className={tile} onClick={onFlick}>
            Sphalerizer
          </Button>
          <Button variant="pink" className={tile} onClick={onSudoku}>
            Sudoku
          </Button>
          <Button variant="blue" className={tile} onClick={onWords}>
            Word Search
          </Button>
          <Button variant="pink" className={tile} onClick={onGuess}>
            Number Guess!
          </Button>
          <Button variant="blue" className={tile} onClick={onSalad}>
            Word Salad
          </Button>
        </div>
        <div className="flex justify-center">
          <Button variant="pink" className={tile + " max-w-40"} onClick={onCredits}>
            Credits
          </Button>
        </div>
        <div className="flex justify-center gap-2">
          <Button
            variant="quiet"
            className={tile + " max-w-40"}
            aria-label={soundOn ? "Mute sound" : "Turn sound on"}
            onClick={onSound}
          >
            {soundOn ? <Volume2 className="size-4 shrink-0" /> : <VolumeX className="size-4 shrink-0" />}
            <span className="truncate">{soundOn ? "Sound on" : "Sound off"}</span>
          </Button>
          <Button variant="quiet" className={tile + " max-w-44"} onClick={() => setInstall(true)}>
            Add to iPhone
          </Button>
        </div>
      </div>
      {install ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/80 p-4 sm:items-center">
          <div className="relative w-full max-w-md rounded-[22px] border border-gold/30 bg-panel px-5 py-6 text-parchment shadow-[var(--shadow-panel)]">
            <button
              type="button"
              aria-label="Close"
              className="absolute top-3 right-3 grid size-10 place-items-center rounded-full ring-1 ring-gold/40"
              onClick={() => setInstall(false)}
            >
              <X className="size-5" />
            </button>
            <p className="font-display text-sm tracking-[0.2em] text-gold uppercase">Play like an app</p>
            <h2 className="mt-1 font-display text-2xl">Add to iPhone</h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-silver">
              <li>Open this site in Safari (not Chrome or in-app browsers).</li>
              <li>Tap the Share button (the square with the arrow).</li>
              <li>Scroll and tap Add to Home Screen.</li>
              <li>Tap Add. Girl of NevaeH appears like an app.</li>
              <li>Open it once while online so games cache for offline play.</li>
            </ol>
            <p className="mt-4 text-xs leading-relaxed text-muted">
              Apple does not let websites install App Store apps. This Home Screen shortcut is the iPhone-friendly way.
              After one visit, the games stay on the phone without signal.
            </p>
          </div>
        </div>
      ) : null}
      {cover ? (
        <CoverZoom src={ART.cover} alt="Girl of NevaeH, front cover by R A Simpson" onClose={() => setCover(false)} />
      ) : null}
      {story ? (
        <div className="fixed inset-0 z-50 overflow-hidden bg-ink">
          <img
            src={ART.story}
            alt="Girl of NevaeH story"
            className="h-full w-full object-contain object-center"
          />
          <button
            type="button"
            aria-label="Save story"
            className="absolute top-[max(0.8rem,env(safe-area-inset-top))] left-[max(0.8rem,env(safe-area-inset-left))] grid size-11 place-items-center rounded-full bg-ink/70 text-parchment ring-2 ring-[#12d8ff]"
            onClick={() => void saveArt(ART.story, "Girl-of-NevaeH-The-Story.jpg")}
          >
            <Download className="size-6" />
          </button>
          <button
            type="button"
            aria-label="Close story"
            className="absolute top-[max(0.8rem,env(safe-area-inset-top))] right-[max(0.8rem,env(safe-area-inset-right))] grid size-11 place-items-center rounded-full bg-ink/70 text-parchment ring-2 ring-[#ff2bd6]"
            onClick={() => setStory(false)}
          >
            <X className="size-6" />
          </button>
        </div>
      ) : null}
    </div>
  );
}

function CoverZoom({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  const [scale, setScale] = useState(1);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const pinch = useRef<number | null>(null);
  const startScale = useRef(1);
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const lastTap = useRef(0);

  const onTouchStart = (e: TE<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      const a = e.touches[0]!;
      const b = e.touches[1]!;
      pinch.current = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      startScale.current = scale;
      drag.current = null;
      return;
    }
    if (e.touches.length === 1) {
      const now = Date.now();
      if (now - lastTap.current < 280) {
        lastTap.current = 0;
        if (scale > 1) {
          setScale(1);
          setX(0);
          setY(0);
        } else setScale(2.4);
        return;
      }
      lastTap.current = now;
      drag.current = { x, y, px: e.touches[0]!.clientX, py: e.touches[0]!.clientY };
    }
  };

  const onTouchMove = (e: TE<HTMLDivElement>) => {
    if (e.touches.length === 2 && pinch.current) {
      const a = e.touches[0]!;
      const b = e.touches[1]!;
      const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      setScale(Math.min(5, Math.max(1, startScale.current * (d / pinch.current))));
      return;
    }
    if (e.touches.length === 1 && drag.current && scale > 1) {
      const t = e.touches[0]!;
      setX(drag.current.x + (t.clientX - drag.current.px));
      setY(drag.current.y + (t.clientY - drag.current.py));
    }
  };

  const onWheel = (e: WE<HTMLDivElement>) => {
    e.preventDefault();
    setScale((s) => Math.min(5, Math.max(1, s + (e.deltaY < 0 ? 0.2 : -0.2))));
  };

  return (
    <div
      className="fixed inset-0 z-[80] overflow-hidden bg-ink"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onWheel={onWheel}
      style={{ touchAction: "none" }}
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        className="pointer-events-none h-full w-full object-contain object-center"
        style={{ transform: `translate(${x}px, ${y}px) scale(${scale})`, transformOrigin: "center center" }}
      />
      <button
        type="button"
        aria-label="Save cover"
        className="absolute top-[max(0.8rem,env(safe-area-inset-top))] left-[max(0.8rem,env(safe-area-inset-left))] z-10 grid size-11 place-items-center rounded-full bg-ink/70 text-parchment ring-2 ring-[#12d8ff]"
        onPointerDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onClick={() => void saveArt(src, "Girl-of-NevaeH-Cover.jpg")}
      >
        <Download className="size-6" />
      </button>
      <button
        type="button"
        aria-label="Close cover"
        className="absolute top-[max(0.8rem,env(safe-area-inset-top))] right-[max(0.8rem,env(safe-area-inset-right))] z-10 grid size-11 place-items-center rounded-full bg-ink/70 text-parchment ring-2 ring-[#ff2bd6]"
        onPointerDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onClick={onClose}
      >
        <X className="size-6" />
      </button>
    </div>
  );
}
