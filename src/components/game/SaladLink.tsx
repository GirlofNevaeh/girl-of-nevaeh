import { Button } from "@/components/ui/button";
import { SoundToggle } from "@/components/ui/sound-toggle";
import { playClick, playHeal, playRefuse } from "@/game/audio";
import { CHARACTERS } from "@/game/characters";
import type { CharacterId } from "@/game/types";
import { cn } from "@/lib/cn";
import { useLinkRoom } from "@/lib/multiplayer/use-link-room";
import { pickWord, scramble, type Diff } from "@/salad/engine";
import { useEffect, useRef, useState } from "react";
import { WinnerSplash } from "./WinnerSplash";

type Tile = { id: number; ch: string };

function deal(diff: Diff, level: number, used: Set<string>): { word: string; mix: Tile[] } {
  const word = pickWord(diff, level, used);
  const letters = scramble(word).split("");
  return { word, mix: letters.map((ch, id) => ({ id, ch })) };
}

export function SaladLink({
  room,
  who,
  host,
  diff,
  onLobby,
}: {
  room: string;
  who: CharacterId;
  host: boolean;
  diff: Diff;
  onLobby: () => void;
}) {
  const p2p = useLinkRoom({ room, name: who, host });
  const foe = (p2p.peers[0]?.name as CharacterId) || null;
  const foeReady = !!foe && CHARACTERS.some((c) => c.id === foe);
  const used = useRef(new Set<string>());
  const [pack, setPack] = useState(() => deal(diff, 1, used.current));
  const [answer, setAnswer] = useState<(Tile | null)[]>(() => Array(pack.word.length).fill(null));
  const [mine, setMine] = useState(0);
  const [theirs, setTheirs] = useState(0);
  const [round, setRound] = useState(1);
  const [flash, setFlash] = useState(false);
  const [over, setOver] = useState(false);
  const busy = useRef(false);
  const roundRef = useRef(1);
  const packRef = useRef(pack);
  roundRef.current = round;
  packRef.current = pack;
  const youName = CHARACTERS.find((c) => c.id === who)?.name ?? who;
  const foeName = CHARACTERS.find((c) => c.id === foe)?.name ?? "Friend";

  const pushDeal = (p: { word: string; mix: Tile[] }, r: number) => {
    busy.current = false;
    setPack(p);
    setAnswer(Array(p.word.length).fill(null));
    setFlash(false);
    setRound(r);
    p2p.send({ t: "deal", word: p.word, mix: p.mix, round: r });
  };

  useEffect(() => {
    p2p.send({ t: "hello", char: who });
  }, [p2p.send, who, foeReady]);

  useEffect(() => {
    if (!host || !foeReady) return;
    p2p.send({ t: "deal", word: pack.word, mix: pack.mix, round });
  }, [host, foeReady, p2p.send]);

  useEffect(
    () =>
      p2p.onMessage((_from, data) => {
        const msg = data as { t?: string; word?: string; mix?: Tile[]; round?: number };
        if (msg.t === "deal" && msg.word && Array.isArray(msg.mix)) {
          busy.current = false;
          setPack({ word: msg.word, mix: msg.mix });
          setAnswer(Array(msg.word.length).fill(null));
          setFlash(false);
          if (typeof msg.round === "number") setRound(msg.round);
        }
        if (msg.t === "got") {
          setTheirs((n) => n + 1);
          busy.current = true;
          setFlash(true);
          if (host) {
            window.setTimeout(() => {
              const nextR = roundRef.current + 1;
              if (nextR > 7) {
                setOver(true);
                p2p.send({ t: "over" });
              } else {
                used.current.add(packRef.current.word);
                pushDeal(deal(diff, nextR, used.current), nextR);
              }
            }, 800);
          }
        }
        if (msg.t === "over") setOver(true);
      }),
    [p2p.onMessage, host, diff, p2p.send],
  );

  const placed = new Set(answer.filter(Boolean).map((t) => t!.id));
  const guess = answer.map((t) => t?.ch ?? "").join("");

  useEffect(() => {
    if (!foeReady || busy.current || over || flash) return;
    if (guess !== pack.word || guess.length !== pack.word.length) return;
    busy.current = true;
    setFlash(true);
    playHeal();
    setMine((n) => n + 1);
    p2p.send({ t: "got" });
    window.setTimeout(() => {
      if (!host) return;
      const nextR = roundRef.current + 1;
      if (nextR > 7) {
        setOver(true);
        p2p.send({ t: "over" });
      } else {
        used.current.add(packRef.current.word);
        pushDeal(deal(diff, nextR, used.current), nextR);
      }
    }, 800);
  }, [guess, pack.word, foeReady, over, flash, host, diff, p2p.send]);

  const take = (tile: Tile) => {
    if (flash || over || busy.current || !foeReady) return;
    if (placed.has(tile.id)) return;
    const i = answer.findIndex((s) => s == null);
    if (i < 0) return;
    const next = answer.slice();
    next[i] = tile;
    if (next.every(Boolean) && next.map((t) => t!.ch).join("") !== pack.word) {
      playRefuse();
      setAnswer(Array(pack.word.length).fill(null));
      return;
    }
    playClick();
    setAnswer(next);
  };

  if (!foeReady) {
    return (
      <div className="flex h-svh flex-col overflow-hidden bg-ink p-4 text-parchment">
        <Button variant="quiet" className="self-start" onClick={onLobby}>
          Lobby
        </Button>
        <h1 className="mt-6 font-display text-3xl">Word Salad</h1>
        <p className="mt-2 text-silver">Waiting for a friend. You are {youName}.</p>
        <p className="mt-6 font-display text-5xl tracking-[0.2em] text-[#12d8ff]">{room.replace(/^ws/i, "")}</p>
        <p className="mt-4 text-sm text-muted">{p2p.status}</p>
      </div>
    );
  }

  const winId = mine >= theirs ? who : foe;

  return (
    <div className="relative flex min-h-0 flex-col overflow-hidden bg-ink text-parchment" style={{ height: "var(--app-h, 100svh)" }}>
      <header className="flex items-center justify-between px-3 pt-[max(0.55rem,env(safe-area-inset-top))]">
        <Button variant="quiet" onClick={onLobby}>
          Lobby
        </Button>
        <p className="font-display text-lg">Round {round}/7</p>
        <SoundToggle />
      </header>
      <p className="text-center text-sm text-silver">
        {youName} {mine} – {theirs} {foeName}
      </p>
      <div className="mx-auto mt-3 flex flex-wrap justify-center gap-2 px-3">
        {answer.map((t, i) => (
          <button
            key={i}
            type="button"
            className={cn("grid h-12 w-10 place-items-center rounded-[10px] border font-display text-xl", flash && "four-win-flash")}
            style={{ borderColor: "#12d8ff", color: "#12d8ff" }}
          >
            {t?.ch ?? ""}
          </button>
        ))}
      </div>
      <div className="mx-auto mt-4 flex flex-wrap justify-center gap-2 px-3">
        {pack.mix.map((tile) => (
          <button
            key={tile.id}
            type="button"
            disabled={placed.has(tile.id) || flash || over}
            onClick={() => take(tile)}
            className="grid h-12 w-10 place-items-center rounded-[10px] border border-[#ff2bd6] font-display text-xl text-[#ff2bd6] disabled:opacity-30"
          >
            {tile.ch}
          </button>
        ))}
      </div>
      {over && winId ? (
        <WinnerSplash
          id={winId}
          youScore={mine}
          foeScore={theirs}
          youName={youName}
          foeName={foeName}
          onAgain={onLobby}
          onExit={onLobby}
        />
      ) : null}
    </div>
  );
}
