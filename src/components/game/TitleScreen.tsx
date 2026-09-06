import { Button } from "@/components/ui/button";
import { ART } from "@/game/assets";
import { Volume2, VolumeX, X } from "lucide-react";
import { useState } from "react";

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
  onSound: () => void;
}) {
  const [story, setStory] = useState(false);
  const tile = "h-12 w-full min-w-0 px-2 text-center text-xs leading-tight";
  return (
    <div className="relative flex h-svh min-h-0 flex-col overflow-hidden bg-ink lg:flex-row">
      <h1 className="sr-only">The Girl of Nevaeh</h1>

      <img
        src={ART.cover}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-55 blur-2xl"
      />

      <div className="relative flex min-h-0 min-w-0 flex-1 items-center justify-center p-2 sm:p-4">
        <img
          src={ART.cover}
          alt="The Girl of Nevaeh, front cover by R A Simpson"
          className="pointer-events-none max-h-full max-w-full object-contain"
        />
      </div>

      <div className="relative z-30 flex max-h-[58%] shrink-0 flex-col justify-start gap-3 overflow-y-auto overscroll-contain px-4 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))] pointer-events-auto lg:max-h-none lg:w-[24rem] lg:px-6 lg:py-8">
        <p className="text-center text-sm uppercase tracking-wide text-[#3cf0ff]" style={{ fontFamily: "Audiowide, system-ui" }}>
          The Girl of Nevaeh
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
            Game of 4
          </Button>
          <Button variant="pink" className={tile} onClick={onDraw}>
            Paint
          </Button>
          <Button variant="blue" className={tile} onClick={onFlick}>
            Sphalerizer
          </Button>
        </div>
        <div className="flex justify-center">
          <Button variant="pink" className={tile + " max-w-40"} onClick={onCredits}>
            Credits
          </Button>
        </div>
        <div className="flex justify-center">
          <Button
            variant="quiet"
            className={tile + " max-w-40"}
            aria-label={soundOn ? "Mute sound" : "Turn sound on"}
            onClick={onSound}
          >
            {soundOn ? <Volume2 className="size-4 shrink-0" /> : <VolumeX className="size-4 shrink-0" />}
            <span className="truncate">{soundOn ? "Sound on" : "Sound off"}</span>
          </Button>
        </div>
      </div>
      {story ? (
        <div className="fixed inset-0 z-50 overflow-hidden bg-ink">
          <img
            src={ART.story}
            alt="The Girl of Nevaeh story"
            className="h-full w-full object-contain object-center"
          />
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
