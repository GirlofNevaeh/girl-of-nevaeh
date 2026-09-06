import { CodexApp } from "@/components/codex/CodexApp";
import { useCodex } from "@/codex/store";
import { preloadAllArt } from "@/game/assets";
import { preloadFightArt } from "@/fight/engine";
import { CHARACTERS } from "@/game/characters";
import { preloadShips } from "@/game/ships";
import { pinAppFrame, SHELL } from "@/game/pin-frame";
import { resumeIfNeeded, setAmbient, setAudioEnabled, unlockAudio } from "@/game/audio";
import { useGame } from "@/game/store";
import { useEffect, useState } from "react";
import { ArmageddonView } from "./ArmageddonView";
import { BlocksView } from "./BlocksView";
import { CharacterSelect } from "./CharacterSelect";
import { ChessView } from "./ChessView";
import { CreditsScreen } from "./CreditsScreen";
import { DevilView } from "./DevilView";
import { DraughtsView } from "./DraughtsView";
import { DrawView } from "./DrawView";
import { FightView } from "./FightView";
import { FlickView } from "./FlickView";
import { FlipView } from "./FlipView";
import { JumbleView } from "./JumbleView";
import { LeapView } from "./LeapView";
import { PlayView } from "./PlayView";
import { Row4View } from "./Row4View";
import { SmartzView } from "./SmartzView";
import { TicTacView } from "./TicTacView";
import { TitleScreen } from "./TitleScreen";

const MENU: string[] = ["title", "select", "credits", "codex", "duel", "marks", "chess", "draughts", "blocks", "armada", "smartz", "jumble", "flip", "leap", "devil", "row4", "draw", "flick"];

if (typeof window !== "undefined") {
  preloadAllArt();
  preloadFightArt();
  preloadShips(["nancy", ...CHARACTERS.map((c) => c.id)]);
}

export function GameApp() {
  const [ready, setReady] = useState(false);
  const [confirmNew, setConfirmNew] = useState(false);
  const screen = useGame((s) => s.screen);
  const soundOn = useGame((s) => s.soundOn);
  const character = useGame((s) => s.character);
  const scores = useGame((s) => s.scores);

  useEffect(() => {
    let alive = true;
    const finish = () => {
      if (alive) setReady(true);
    };
    try {
      const unsub = useGame.persist.onFinishHydration(finish);
      void Promise.resolve(useGame.persist.rehydrate()).then(finish);
      if (useGame.persist.hasHydrated()) finish();
      const t = window.setTimeout(finish, 80);
      return () => {
        alive = false;
        unsub();
        window.clearTimeout(t);
      };
    } catch {
      finish();
    }
  }, []);

  useEffect(() => {
    preloadAllArt();
    preloadFightArt();
  }, []);

  useEffect(() => {
    const unlock = () => {
      unlockAudio();
      setAudioEnabled(useGame.getState().soundOn);
    };
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("touchstart", unlock, { passive: true });
    window.addEventListener("keydown", unlock);
    const onVis = () => {
      if (document.visibilityState === "visible") resumeIfNeeded();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("keydown", unlock);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  useEffect(() => {
    setAudioEnabled(soundOn);
  }, [soundOn]);

  useEffect(() => {
    pinAppFrame();
    const hold = () => pinAppFrame();
    window.addEventListener("pointerdown", hold, { once: true });
    return () => window.removeEventListener("pointerdown", hold);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (screen === "duel") setAmbient("duel");
    else if (screen === "armada") setAmbient("armada");
    else if (screen === "flick") setAmbient("flick");
    else setAmbient("title");
  }, [ready, screen]);

  const canContinue = ready && !!character;

  return (
    <div
      className="flex min-h-0 flex-col overflow-hidden bg-ink text-parchment select-none"
      style={{ ...SHELL, touchAction: "manipulation" }}
      onContextMenu={(e) => e.preventDefault()}
      onPointerDownCapture={() => {
        unlockAudio();
      }}
    >
      {screen === "title" ? (
        <TitleScreen
          canContinue={canContinue}
          soundOn={soundOn}
          onNew={() => {
            if (canContinue) setConfirmNew(true);
            else useGame.getState().newGame();
          }}
          onContinue={() => useGame.getState().continueGame()}
          onCredits={() => useGame.getState().openCredits()}
          onCodex={() => {
            useCodex.getState().setTab("characters");
            useGame.getState().openCodex();
          }}
          onFight={() => useGame.getState().openDuel()}
          onMarks={() => useGame.getState().openMarks()}
          onChess={() => useGame.getState().openChess()}
          onDraughts={() => useGame.getState().openDraughts()}
          onBlocks={() => useGame.getState().openBlocks()}
          onArmada={() => useGame.getState().openArmada()}
          onSmartz={() => useGame.getState().openSmartz()}
          onJumble={() => useGame.getState().openJumble()}
          onFlip={() => useGame.getState().openFlip()}
          onLeap={() => useGame.getState().openLeap()}
          onDevil={() => useGame.getState().openDevil()}
          onRow4={() => useGame.getState().openRow4()}
          onDraw={() => useGame.getState().openDraw()}
          onFlick={() => useGame.getState().openFlick()}
          onSound={() => useGame.getState().setSound(!soundOn)}
        />
      ) : null}

      {screen === "select" ? (
        <CharacterSelect
          onPick={(id) => useGame.getState().chooseCharacter(id)}
          onBack={() => useGame.getState().backToTitle()}
        />
      ) : null}

      {screen === "play" ? <PlayView /> : null}
      {screen === "duel" ? <FightView /> : null}
      {screen === "marks" ? <TicTacView /> : null}
      {screen === "chess" ? <ChessView /> : null}
      {screen === "draughts" ? <DraughtsView /> : null}
      {screen === "blocks" ? <BlocksView /> : null}
      {screen === "armada" ? <ArmageddonView /> : null}
      {screen === "smartz" ? <SmartzView /> : null}
      {screen === "jumble" ? <JumbleView /> : null}
      {screen === "flip" ? <FlipView /> : null}
      {screen === "leap" ? <LeapView /> : null}
      {screen === "devil" ? <DevilView /> : null}
      {screen === "row4" ? <Row4View /> : null}
      {screen === "draw" ? <DrawView /> : null}
      {screen === "flick" ? <FlickView /> : null}

      {screen === "credits" ? (
        <CreditsScreen scores={scores} onTitle={() => useGame.getState().backToTitle()} />
      ) : null}

      {screen === "codex" ? <CodexApp /> : null}

      {confirmNew ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/70 p-4">
          <div className="w-full max-w-sm rounded-[28px] border border-gold/25 bg-panel p-6">
            <h2 className="font-display text-2xl">Begin again?</h2>
            <p className="mt-2 text-sm text-silver">
              A new story will set aside the path you have already walked on this device.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                className="min-h-11 flex-1 rounded-[12px] bg-[#12d8ff] px-4 font-medium text-ink shadow-[0_0_16px_#3cf0ff]"
                onClick={() => {
                  setConfirmNew(false);
                  useGame.getState().newGame();
                }}
              >
                Role Play
              </button>
              <button
                type="button"
                className="min-h-11 flex-1 rounded-[12px] border border-gold/35 px-4 text-parchment"
                onClick={() => setConfirmNew(false)}
              >
                Keep save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
