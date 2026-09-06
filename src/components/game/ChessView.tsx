import { cpuMove } from "@/chess/ai";
import { legalAt, newGame, playMove, resultOf, squareAt, type Diff, type PieceKind } from "@/chess/logic";
import { RULES } from "@/chess/rules";
import { Button } from "@/components/ui/button";
import { FIGHTERS, PLAYABLE, type FightFighterId } from "@/fight/engine";
import { playPortrait } from "@/game/play-art";
import { WinnerSplash } from "./WinnerSplash";
import { playChime, playClick, playHeal } from "@/game/audio";
import { useGame } from "@/game/store";
import { cn } from "@/lib/cn";
import { useP2PRoom } from "@/lib/multiplayer/use-p2p-room";
import { Chess, type Square } from "chess.js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DuelPick } from "./DuelPick";

const ROSTER = PLAYABLE;
const PINK = "#ff4ae0";
const BLUE = "#3cf0ff";

type Tab = "board" | "rules";
type Kind = PieceKind;


function newCode() {
  const a = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 4; i++) s += a[Math.floor(Math.random() * a.length)];
  return s;
}

export function ChessView() {
  const [tab, setTab] = useState<Tab>("board");
  const [you, setYou] = useState<FightFighterId | null>(null);
  const [foe, setFoe] = useState<FightFighterId | null>(null);
  const [diff, setDiff] = useState<Diff>("normal");
  const [mode, setMode] = useState<"pick" | "cpu" | "link" | "hot">("pick");
  const [code] = useState(newCode);
  const [join, setJoin] = useState("");
  const [room, setRoom] = useState<string | null>(null);
  const [hostSeat, setHostSeat] = useState(false);
  const [score, setScore] = useState<Record<string, number>>({});

  const addWin = useCallback((id: FightFighterId) => {
    setScore((s) => ({ ...s, [id]: (s[id] ?? 0) + 1 }));
  }, []);

  return (
    <div className="relative flex h-svh min-h-0 flex-col overflow-hidden bg-ink text-parchment">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,#6b5b8c55,transparent_45%),radial-gradient(circle_at_90%_80%,#d4a54a22,transparent_40%)]" />
      <header className="relative z-10 shrink-0 px-4 py-3 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="flex items-center gap-3">
        <Button
          variant="quiet"
          onClick={() => {
            if (mode !== "pick") {
              setMode("pick");
              setRoom(null);
              return;
            }
            useGame.getState().backToTitle();
          }}
        >
          {mode === "pick" ? "Main Menu" : "Lobby"}
        </Button>
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm tracking-[0.22em] text-gold uppercase">Pink and blue</p>
          <h1 className="font-display text-3xl font-semibold leading-none">Chess</h1>
        </div>
        </div>
        <div className="mt-2 flex rounded-[12px] border border-gold/30 p-0.5">
          <button
            type="button"
            onClick={() => setTab("board")}
            className={cn(
              "min-h-10 flex-1 rounded-[10px] px-3 text-sm",
              tab === "board" ? "bg-gold text-ink" : "text-silver",
            )}
          >
            Board
          </button>
          <button
            type="button"
            onClick={() => setTab("rules")}
            className={cn(
              "min-h-10 flex-1 rounded-[10px] px-3 text-sm",
              tab === "rules" ? "bg-gold text-ink" : "text-silver",
            )}
          >
            Rules
          </button>
        </div>
      </header>

      {tab === "rules" ? <RulesPane /> : null}

      <div className={cn("flex min-h-0 flex-1 flex-col", tab === "rules" ? "hidden" : "")}>
        {mode === "cpu" && you && foe ? (
          <CpuMatch you={you} foe={foe} diff={diff} score={score} onWin={addWin} onExit={() => setMode("pick")} />
        ) : mode === "hot" && you && foe ? (
          <CpuMatch you={you} foe={foe} diff={diff} score={score} hot onWin={addWin} onExit={() => setMode("pick")} />
        ) : mode === "link" && room && you ? (
          <OnlineMatch
            room={room}
            you={you}
            hostSeat={hostSeat}
            score={score}
            onWin={addWin}
            onExit={() => {
              setMode("pick");
              setRoom(null);
            }}
          />
        ) : (
          <Lobby
            you={you}
            foe={foe}
            diff={diff}
            code={code}
            join={join}
            onYou={setYou}
            onFoe={setFoe}
            onDiff={setDiff}
            onJoin={setJoin}
            onCpu={() => {
              playClick();
              setMode("cpu");
            }}
            onHot={() => {
              playClick();
              setMode("hot");
            }}
            onHost={() => {
              playClick();
              setHostSeat(true);
              setRoom("ch" + code);
              setMode("link");
            }}
            onGuest={() => {
              playClick();
              setHostSeat(false);
              setRoom("ch" + join);
              setMode("link");
            }}
          />
        )}
      </div>
    </div>
  );
}

function RulesPane() {
  return (
    <main className="relative z-10 mx-auto min-h-0 w-full max-w-3xl flex-1 overflow-y-auto px-4 pb-8">
      <p className="text-silver">Family play. No rush. The pieces glow so each side is clear.</p>
      <div className="mt-4 grid gap-3">
        {RULES.map((r) => (
          <article key={r.title} className="rounded-[18px] border border-gold/25 bg-ink-soft/80 p-4">
            <h2 className="font-display text-2xl text-gold">{r.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-parchment/90">{r.body}</p>
          </article>
        ))}
      </div>
    </main>
  );
}

function Lobby({
  you,
  foe,
  diff,
  code,
  join,
  onYou,
  onFoe,
  onDiff,
  onJoin,
  onCpu,
  onHot,
  onHost,
  onGuest,
}: {
  you: FightFighterId | null;
  foe: FightFighterId | null;
  diff: Diff;
  code: string;
  join: string;
  onYou: (id: FightFighterId | null) => void;
  onFoe: (id: FightFighterId | null) => void;
  onDiff: (d: Diff) => void;
  onJoin: (s: string) => void;
  onCpu: () => void;
  onHot: () => void;
  onHost: () => void;
  onGuest: () => void;
}) {
  return (
    <DuelPick
      hero={you}
      foe={foe}
      startLabel="Play Computer"
      passLabel="Pass & Play"
      onPickHero={onYou}
      onPickFoe={onFoe}
      onClear={() => {
        onYou(null);
        onFoe(null);
      }}
      onStart={onCpu}
      onPass={onHot}
      extra={
        <div className="flex flex-wrap gap-2">
          {(["easy", "normal", "hard"] as Diff[]).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => onDiff(d)}
              className={cn(
                "min-h-11 rounded-[12px] border px-4 capitalize",
                diff === d ? "border-gold bg-gold text-ink" : "border-gold/30 text-parchment",
              )}
            >
              {d}
            </button>
          ))}
        </div>
      }
      footer={
          <div className="rounded-[18px] border border-gold/25 bg-ink-soft/80 p-4">
            <p className="font-display text-lg">A friend</p>
            <p className="mt-1 text-sm text-silver">One board. Two devices. Host is pink. Guest is blue.</p>
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <div>
                <p className="text-[10px] tracking-[0.16em] text-gold uppercase">Your code</p>
                <p className="font-display text-3xl tracking-[0.2em]">{code}</p>
              </div>
              <Button variant="ghost" onClick={onHost}>
                Open board
              </Button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <input
                value={join}
                onChange={(e) => onJoin(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4))}
                placeholder="CODE"
                className="h-11 w-28 rounded-[12px] border border-gold/35 bg-ink px-3 font-display tracking-[0.2em] uppercase"
              />
              <Button variant="primary" disabled={join.length < 4} onClick={onGuest}>
                Join
              </Button>
            </div>
          </div>
      }
    />
  );
}

function CharGrid({
  value,
  onPick,
}: {
  value: FightFighterId | null;
  onPick: (id: FightFighterId) => void;
}) {
  return (
    <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-7">
      {ROSTER.map((id) => {
        const f = FIGHTERS[id];
        return (
          <button
            key={id}
            type="button"
            onClick={() => {
              playClick();
              onPick(id);
            }}
            className={cn(
              "overflow-hidden rounded-[12px] border bg-ink-soft/90 text-left",
              value === id ? "border-gold ring-2 ring-gold/40" : "border-gold/20",
            )}
          >
            <img src={playPortrait(id)} alt="" className="aspect-3/4 w-full object-cover object-top" />
            <p className="px-1 py-1 text-center font-display text-[10px] leading-tight break-words sm:text-xs">{f.name}</p>
          </button>
        );
      })}
    </div>
  );
}

function CpuMatch({
  you,
  foe,
  diff,
  score,
  onWin,
  onExit,
  hot = false,
}: {
  you: FightFighterId;
  foe: FightFighterId;
  diff: Diff;
  score: Record<string, number>;
  onWin: (id: FightFighterId) => void;
  onExit: () => void;
  hot?: boolean;
}) {
  const game = useRef(newGame());
  const [fen, setFen] = useState(() => game.current.fen());
  const [sel, setSel] = useState<Square | null>(null);
  const [promo, setPromo] = useState<{ from: Square; to: Square } | null>(null);
  const [thinking, setThinking] = useState(false);
  const awarded = useRef(false);

  const end = resultOf(game.current);
  const turn = game.current.turn();

  useEffect(() => {
    if (hot || end || turn !== "b") return;
    setThinking(true);
    const t = window.setTimeout(() => {
      const move = cpuMove(game.current, diff);
      if (move) {
        game.current.move(move);
        playClick();
        setFen(game.current.fen());
        const r = resultOf(game.current);
        if (r === "b" && !awarded.current) {
          awarded.current = true;
          playChime();
          onWin(foe);
        }
      }
      setThinking(false);
    }, diff === "hard" ? 80 : 420);
    return () => window.clearTimeout(t);
  }, [fen, turn, end, diff, foe, onWin, hot]);

  const tap = (sq: Square) => {
    if (end || thinking) return;
    if (!hot && turn !== "w") return;
    const piece = game.current.get(sq);
    if (sel) {
      const opts = legalAt(game.current, sel).filter((m) => m.to === sq);
      if (opts.length) {
        if (opts.some((m) => m.promotion)) {
          setPromo({ from: sel, to: sq });
          return;
        }
        const mv = playMove(game.current, sel, sq);
        if (mv) {
          playClick();
          setSel(null);
          setFen(game.current.fen());
          const r = resultOf(game.current);
          if (r === "w" && !awarded.current) {
            awarded.current = true;
            playHeal();
            onWin(you);
          } else if (r === "b" && !awarded.current) {
            awarded.current = true;
            playChime();
            onWin(foe);
          } else if (r === "draw") playChime();
        }
        return;
      }
    }
    if (piece && (hot || piece.color === "w") && piece.color === turn) setSel(sq);
    else setSel(null);
  };

  const choosePromo = (k: Kind) => {
    if (!promo) return;
    const mv = playMove(game.current, promo.from, promo.to, k);
    setPromo(null);
    setSel(null);
    if (!mv) return;
    playClick();
    setFen(game.current.fen());
    const r = resultOf(game.current);
    if (r === "w" && !awarded.current) {
      awarded.current = true;
      playHeal();
      onWin(you);
    }
  };

  const reset = () => {
    game.current.reset();
    awarded.current = false;
    setSel(null);
    setPromo(null);
    setThinking(false);
    setFen(game.current.fen());
  };

  return (
    <PlayBoard
      you={you}
      foe={foe}
      youSide="w"
      fen={fen}
      chess={game.current}
      sel={sel}
      flipped={false}
      locked={thinking || (!hot && turn !== "w")}
      promo={promo}
      score={score}
      status={
        end === "w"
          ? FIGHTERS[you].name + " WINS"
          : end === "b"
            ? FIGHTERS[foe].name + " WINS"
            : end === "draw"
              ? "Draw. The board holds."
              : thinking
                ? FIGHTERS[foe].name + " is thinking."
                : game.current.inCheck()
                  ? "Check."
                  : "Your move. Pink."
      }
      onTap={tap}
      onPromo={choosePromo}
      onExit={onExit}
      onAgain={reset}
    />
  );
}

function OnlineMatch({
  room,
  you,
  hostSeat,
  score,
  onWin,
  onExit,
}: {
  room: string;
  you: FightFighterId;
  hostSeat: boolean;
  score: Record<string, number>;
  onWin: (id: FightFighterId) => void;
  onExit: () => void;
}) {
  const p2p = useP2PRoom({ room, name: you });
  const friend = p2p.peers[0];
  const foeId = (friend?.name as FightFighterId) || null;
  const foeReady = !!foeId && foeId in FIGHTERS;
  const game = useRef(newGame());
  const [fen, setFen] = useState(() => game.current.fen());
  const [sel, setSel] = useState<Square | null>(null);
  const [promo, setPromo] = useState<{ from: Square; to: Square } | null>(null);
  const awarded = useRef(false);
  const youSide = hostSeat ? "w" : "b";
  const end = resultOf(game.current);
  const turn = game.current.turn();

  useEffect(() => {
    p2p.send({ t: "hello", char: you });
  }, [p2p, you]);

  useEffect(
    () =>
      p2p.onMessage((_from, data) => {
        const msg = data as { t?: string; from?: Square; to?: Square; promotion?: Kind; fen?: string };
        if (msg.t === "move" && msg.from && msg.to) {
          const mv = playMove(game.current, msg.from, msg.to, msg.promotion);
          if (!mv) return;
          playClick();
          setSel(null);
          setFen(game.current.fen());
          const r = resultOf(game.current);
          if (r && r !== "draw" && foeId && r !== youSide && !awarded.current) {
            awarded.current = true;
            playChime();
            onWin(foeId);
          }
        }
        if (msg.t === "reset") {
          game.current.reset();
          awarded.current = false;
          setSel(null);
          setPromo(null);
          setFen(game.current.fen());
        }
      }),
    [p2p, p2p.onMessage, foeId, onWin, youSide],
  );

  const tap = (sq: Square) => {
    if (end || turn !== youSide || !foeReady) return;
    const piece = game.current.get(sq);
    if (sel) {
      const opts = legalAt(game.current, sel).filter((m) => m.to === sq);
      if (opts.length) {
        if (opts.some((m) => m.promotion)) {
          setPromo({ from: sel, to: sq });
          return;
        }
        const mv = playMove(game.current, sel, sq);
        if (mv) {
          playClick();
          p2p.send({ t: "move", from: sel, to: sq });
          setSel(null);
          setFen(game.current.fen());
          const r = resultOf(game.current);
          if (r === youSide && !awarded.current) {
            awarded.current = true;
            playHeal();
            onWin(you);
          } else if (r === "draw") playChime();
        }
        return;
      }
    }
    if (piece && piece.color === youSide) setSel(sq);
    else setSel(null);
  };

  const choosePromo = (k: Kind) => {
    if (!promo) return;
    const mv = playMove(game.current, promo.from, promo.to, k);
    if (mv) {
      p2p.send({ t: "move", from: promo.from, to: promo.to, promotion: k });
      playClick();
      setFen(game.current.fen());
      const r = resultOf(game.current);
      if (r === youSide && !awarded.current) {
        awarded.current = true;
        playHeal();
        onWin(you);
      }
    }
    setPromo(null);
    setSel(null);
  };

  const reset = () => {
    game.current.reset();
    awarded.current = false;
    setSel(null);
    setPromo(null);
    setFen(game.current.fen());
    p2p.send({ t: "reset" });
  };

  if (!foeReady) {
    return (
      <div className="relative z-10 flex flex-1 flex-col px-4">
        <h2 className="mt-4 font-display text-3xl">Board {room.replace("ch", "")}</h2>
        <p className="mt-2 text-silver">Waiting for a friend. You are {FIGHTERS[you].name}.</p>
        <p className="mt-6 font-display text-5xl tracking-[0.2em] text-gold">{room.replace("ch", "")}</p>
        <p className="mt-4 text-sm text-muted">{p2p.joined ? "Listening for a second device." : "Opening the room."}</p>
      </div>
    );
  }

  return (
    <PlayBoard
      you={you}
      foe={foeId}
      youSide={youSide}
      fen={fen}
      chess={game.current}
      sel={sel}
      flipped={youSide === "b"}
      locked={turn !== youSide}
      promo={promo}
      score={score}
      status={
        end === youSide
          ? FIGHTERS[you].name + " WINS"
          : end && end !== "draw"
            ? FIGHTERS[foeId].name + " WINS"
            : end === "draw"
              ? "Draw. The board holds."
              : turn === youSide
                ? game.current.inCheck()
                  ? "Check. Your move."
                  : "Your move."
                : "Waiting on " + FIGHTERS[foeId].name + "."
      }
      onTap={tap}
      onPromo={choosePromo}
      onExit={onExit}
      onAgain={reset}
    />
  );
}

function PlayBoard({
  you,
  foe,
  youSide,
  fen,
  chess,
  sel,
  flipped,
  locked,
  promo,
  score,
  status,
  onTap,
  onPromo,
  onExit,
  onAgain,
}: {
  you: FightFighterId;
  foe: FightFighterId;
  youSide: "w" | "b";
  fen: string;
  chess: Chess;
  sel: Square | null;
  flipped: boolean;
  locked: boolean;
  promo: { from: Square; to: Square } | null;
  score: Record<string, number>;
  status: string;
  onTap: (sq: Square) => void;
  onPromo: (k: Kind) => void;
  onExit: () => void;
  onAgain: () => void;
}) {
  const end = resultOf(chess);
  const winnerId = end === "w" ? (youSide === "w" ? you : foe) : end === "b" ? (youSide === "b" ? you : foe) : null;
  const legal = useMemo(() => (sel ? legalAt(chess, sel).map((m) => m.to) : []), [sel, fen, chess]);
  const last = chess.history({ verbose: true }).at(-1);

  return (
    <div className="relative z-10 flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between gap-2 px-3">
        <Seat who={you} color={youSide === "w" ? "pink" : "blue"} active={chess.turn() === youSide && !end} score={score[you] ?? 0} />
        <p className="max-w-[40%] text-center text-xs text-silver">{status}</p>
        <Seat who={foe} color={youSide === "w" ? "blue" : "pink"} active={chess.turn() !== youSide && !end} score={score[foe] ?? 0} />
      </div>
      <div className="mx-auto mt-2 w-full max-w-[min(100%,72svh)] px-2">
        <BoardGrid chess={chess} sel={sel} legal={legal} last={last} flipped={flipped} locked={locked || !!end} onTap={onTap} />
      </div>
      {promo ? (
        <div className="mt-3 flex justify-center gap-2">
          {(["q", "r", "b", "n"] as Kind[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => onPromo(k)}
              className="grid size-14 place-items-center rounded-[12px] border border-gold bg-ink-soft"
            >
              <PieceGlyph kind={k} color={youSide} />
            </button>
          ))}
        </div>
      ) : null}
      {end && end !== "draw" && winnerId ? (
        <WinnerSplash
          id={winnerId}
          youScore={score[you] ?? 0}
          foeScore={score[foe] ?? 0}
          youName={FIGHTERS[you].name}
          foeName={FIGHTERS[foe].name}
          onAgain={onAgain}
          onExit={onExit}
        />
      ) : end ? (
        <div className="mt-4 flex justify-center gap-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Button variant="gold" onClick={onAgain}>
            Again
          </Button>
          <Button variant="ghost" onClick={onExit}>
            Lobby
          </Button>
        </div>
      ) : (
        <p className="mt-3 px-4 text-center text-xs text-muted">Tap a piece, then a glowing square.</p>
      )}
    </div>
  );
}

function BoardGrid({
  chess,
  sel,
  legal,
  last,
  flipped,
  locked,
  onTap,
}: {
  chess: Chess;
  sel: Square | null;
  legal: string[];
  last: { from: Square; to: Square } | undefined;
  flipped: boolean;
  locked: boolean;
  onTap: (sq: Square) => void;
}) {
  const cells = [];
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const sq = squareAt(x, y, flipped);
      const piece = chess.get(sq);
      const dark = (x + y) % 2 === 1;
      const isSel = sel === sq;
      const isLegal = legal.includes(sq);
      const isLast = last && (last.from === sq || last.to === sq);
      cells.push(
        <button
          key={sq}
          type="button"
          disabled={locked}
          onClick={() => onTap(sq)}
          className={cn(
            "relative aspect-square w-full",
            dark ? "bg-[#24182e]" : "bg-[#3a3228]",
            isSel ? "ring-2 ring-inset ring-gold" : "",
            isLast ? "outline outline-1 outline-gold/50 -outline-offset-1" : "",
          )}
        >
          {piece ? (
            <span className="grid h-full w-full place-items-center">
              <PieceGlyph kind={piece.type} color={piece.color} />
            </span>
          ) : null}
          {isLegal ? (
            <span
              className={cn(
                "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full",
                piece ? "h-[86%] w-[86%] border-2 border-gold/80" : "h-3 w-3 bg-gold/80",
              )}
            />
          ) : null}
        </button>,
      );
    }
  }
  const files = flipped ? ["h", "g", "f", "e", "d", "c", "b", "a"] : ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = flipped ? ["1", "2", "3", "4", "5", "6", "7", "8"] : ["8", "7", "6", "5", "4", "3", "2", "1"];
  return (
    <div className="overflow-hidden rounded-[16px] border border-gold/30 shadow-[0_0_40px_#d4a54a22]">
      <div className="grid grid-cols-8">{cells}</div>
      <div className="grid grid-cols-8 bg-ink/80 text-center text-[10px] tracking-[0.12em] text-gold uppercase">
        {files.map((f) => (
          <span key={f} className="py-1">
            {f}
          </span>
        ))}
      </div>
      <div className="sr-only">{ranks.join(" ")}</div>
    </div>
  );
}

function PieceGlyph({ kind, color }: { kind: Kind; color: "w" | "b" }) {
  const glyph: Record<Kind, string> = { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" };
  const fill = color === "w" ? PINK : BLUE;
  return (
    <span
      className="select-none text-[clamp(1.6rem,7vw,2.7rem)] leading-none"
      style={{ color: fill, textShadow: `0 0 10px ${fill}, 0 0 22px ${fill}` }}
    >
      {glyph[kind]}
    </span>
  );
}

function Seat({
  who,
  color,
  active,
  score,
}: {
  who: FightFighterId;
  color: "pink" | "blue";
  active: boolean;
  score: number;
}) {
  const f = FIGHTERS[who];
  const ring = color === "pink" ? "border-[#ff4ae0]" : "border-[#3cf0ff]";
  return (
    <div className={cn("flex min-w-0 items-center gap-2 rounded-[14px] border bg-ink/70 px-2 py-1", active ? ring : "border-gold/20")}>
      <img src={playPortrait(who)} alt="" className="h-12 w-10 rounded-[8px] object-cover object-top" />
      <div className="min-w-0">
        <p className="truncate font-display text-base leading-tight">{f.name}</p>
        <p className="text-[10px] tracking-[0.14em] uppercase" style={{ color: color === "pink" ? PINK : BLUE }}>
          {color} · {score}
        </p>
      </div>
    </div>
  );
}
