import { Button } from "@/components/ui/button";

export function OnlinePanel({
  code,
  join,
  onJoin,
  disabled,
  onHost,
  onGuest,
  note = "Two phones. Host a room, then join with the four-letter code.",
}: {
  code: string;
  join: string;
  onJoin: (s: string) => void;
  disabled?: boolean;
  onHost: () => void;
  onGuest: () => void;
  note?: string;
}) {
  return (
    <div className="rounded-[18px] border border-[#3cf0ff]/35 bg-ink-soft/80 p-4">
      <p className="font-display text-lg">Play online</p>
      <p className="mt-1 text-sm text-silver">{note}</p>
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <div>
          <p className="text-[10px] tracking-[0.16em] text-gold uppercase">Your code</p>
          <p className="font-display text-3xl tracking-[0.2em] text-[#12d8ff]">{code}</p>
        </div>
        <Button variant="blue" disabled={disabled} onClick={onHost}>
          Host
        </Button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <input
          value={join}
          onChange={(e) => onJoin(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4))}
          placeholder="CODE"
          className="h-11 w-28 rounded-[12px] border border-[#ff4ae0]/40 bg-ink px-3 font-display tracking-[0.2em] uppercase"
        />
        <Button variant="pink" disabled={disabled || join.length < 4} onClick={onGuest}>
          Join
        </Button>
      </div>
    </div>
  );
}
