import { Volume2, VolumeX } from "lucide-react";
import { setAudioEnabled, unlockAudio } from "@/game/audio";
import { useGame } from "@/game/store";

export function SoundToggle({ className = "" }: { className?: string }) {
  const on = useGame((s) => s.soundOn);
  return (
    <button
      type="button"
      aria-label={on ? "Mute" : "Unmute"}
      className={`pointer-events-auto grid size-10 place-items-center rounded-full border border-gold/30 text-parchment ${className}`}
      onClick={() => {
        unlockAudio();
        const next = !useGame.getState().soundOn;
        useGame.getState().setSound(next);
        setAudioEnabled(next);
      }}
    >
      {on ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
    </button>
  );
}
