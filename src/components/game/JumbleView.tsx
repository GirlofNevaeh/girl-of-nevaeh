import { Button } from "@/components/ui/button";
import { CHARACTERS } from "@/game/characters";
import { playPortrait } from "@/game/play-art";
import { playChime, playClick } from "@/game/audio";
import { useGame } from "@/game/store";
import type { CharacterId } from "@/game/types";
import { useMemo, useRef, useState } from "react";
import { RosterPick } from "./RosterPick";

const N = 4;

function solved(): number[] {
  return Array.from({ length: 16 }, (_, i) => i);
}

function neighbors(empty: number): number[] {
  const r = Math.floor(empty / N);
  const c = empty % N;
  const out: number[] = [];
  if (c > 0) out.push(empty - 1);
  if (c < 3) out.push(empty + 1);
  if (r > 0) out.push(empty - N);
  if (r < 3) out.push(empty + N);
  return out;
}

function scramble(): number[] {
  const tiles = solved();
  let empty = 15;
  for (let i = 0; i < 80; i++) {
    const opts = neighbors(empty);
    const pick = opts[Math.floor(Math.random() * opts.length)]!;
    [tiles[empty], tiles[pick]] = [tiles[pick]!, tiles[empty]];
    empty = pick;
  }
  if (tiles.every((t, i) => t === i)) return scramble();
  return tiles;
}

export function JumbleView() {
  const [who, setWho] = useState<CharacterId | null>(null);
  const [tiles, setTiles] = useState(scramble);
  const [shift, setShift] = useState({ i: -1, x: 0, y: 0 });
  const boardRef = useRef<HTMLDivElement>(null);
  const tilesRef = useRef(tiles);
  const drag = useRef<{ from: number; axis: "x" | "y"; dir: 1 | -1; max: number } | null>(null);
  tilesRef.current = tiles;
  const won = useMemo(() => tiles.every((t, i) => t === i), [tiles]);
  const empty = tiles.indexOf(15);
  const movable = neighbors(empty);

  const slide = (from: number) => {
    const list = tilesRef.current;
    const hole = list.indexOf(15);
    if (!neighbors(hole).includes(from)) return;
    playClick();
    const next = [...list];
    [next[hole], next[from]] = [next[from]!, next[hole]!];
    tilesRef.current = next;
    setTiles(next);
    if (next.every((t, idx) => t === idx)) playChime();
  };

  const startDrag = (from: number, e: React.PointerEvent) => {
    const list = tilesRef.current;
    const hole = list.indexOf(15);
    if (!neighbors(hole).includes(from)) return;
    const board = boardRef.current;
    if (!board) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const sameRow = Math.floor(from / N) === Math.floor(hole / N);
    drag.current = {
      from,
      axis: sameRow ? "x" : "y",
      dir: (sameRow ? hole - from : Math.floor(hole / N) - Math.floor(from / N)) > 0 ? 1 : -1,
      max: board.clientWidth / N,
    };
    setShift({ i: from, x: 0, y: 0 });
  };

  const moveDrag = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const raw = d.axis === "x" ? e.movementX : e.movementY;
    setShift((prev) => {
      if (prev.i !== d.from) return prev;
      const next = d.axis === "x" ? prev.x + raw : prev.y + raw;
      const along = Math.max(0, Math.min(d.max, next * d.dir));
      return {
        i: d.from,
        x: d.axis === "x" ? along * d.dir : 0,
        y: d.axis === "y" ? along * d.dir : 0,
      };
    });
  };

  const endDrag = () => {
    const d = drag.current;
    drag.current = null;
    setShift({ i: -1, x: 0, y: 0 });
    if (d) slide(d.from);
  };

  if (!who) {
    return (
      <RosterPick
        title="Slider"
        blurb="Pick any face. Tap or slide a tile into the empty square next to it."
        onPick={(id) => {
          setWho(id);
          setTiles(scramble());
        }}
      />
    );
  }

  const face = CHARACTERS.find((c) => c.id === who)!;
  const art = playPortrait(who);

  return (
    <div className="flex h-svh max-h-svh min-h-0 flex-col overflow-hidden bg-ink text-parchment" style={{ overscrollBehavior: "none" }}>
      <header className="flex items-center justify-between px-4 py-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <Button variant="quiet" onClick={() => useGame.getState().backToTitle()}>
          Main Menu
        </Button>
        <p className="text-sm text-silver">{face.name}</p>
        <Button
          variant="ghost"
          onClick={() => {
            playClick();
            drag.current = null;
            setShift({ i: -1, x: 0, y: 0 });
            setTiles(scramble());
          }}
        >
          Shuffle
        </Button>
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4">
        <div
          ref={boardRef}
          className="relative aspect-square w-full overflow-hidden rounded-[16px] bg-ink-soft p-1"
          style={{ touchAction: "none" }}
        >
          {tiles.map((tile, i) => {
            const col = i % N;
            const row = Math.floor(i / N);
            const slot = {
              left: `calc(${col * 25}% + 2px)`,
              top: `calc(${row * 25}% + 2px)`,
              width: "calc(25% - 4px)",
              height: "calc(25% - 4px)",
            };
            if (tile === 15) {
              return <div key="empty" className="absolute rounded-[10px] bg-ink" style={slot} />;
            }
            const pieceR = Math.floor(tile / N);
            const pieceC = tile % N;
            const canSlide = movable.includes(i);
            const pulling = shift.i === i;
            return (
              <button
                key={tile}
                type="button"
                className="absolute overflow-hidden rounded-[10px] border"
                style={{
                  ...slot,
                  backgroundImage: `url(${art})`,
                  backgroundSize: "400% 400%",
                  backgroundPosition: `${(pieceC / 3) * 100}% ${(pieceR / 3) * 100}%`,
                  borderColor: pulling ? "#3cf0ff" : "rgba(212,165,74,0.2)",
                  boxShadow: pulling ? "0 0 10px #3cf0ff66" : undefined,
                  transform: pulling ? `translate(${shift.x}px, ${shift.y}px)` : undefined,
                  transition: pulling ? "none" : "left 180ms ease, top 180ms ease",
                  zIndex: pulling ? 3 : 1,
                }}
                aria-label={`Tile ${tile + 1}`}
                onPointerDown={(e) => startDrag(i, e)}
                onPointerMove={moveDrag}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
              />
            );
          })}
        </div>
        {won ? (
          <p className="mt-4 text-center font-display text-2xl text-[#3cf0ff]">{face.name} is whole.</p>
        ) : (
          <p className="mt-4 text-center text-sm text-muted">
            Tap a neighbour of the empty square, or slide it in.
          </p>
        )}
        <Button variant="blue" className="mt-3" onClick={() => setWho(null)}>
          Another face
        </Button>
      </main>
    </div>
  );
}
