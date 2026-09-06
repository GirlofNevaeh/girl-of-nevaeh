export function Hearts({ lives, max = 3 }: { lives: number; max?: number }) {
  const n = Math.max(0, Math.min(max, lives));
  return (
    <span className="inline-flex gap-0.5 text-lg leading-none tracking-wide" aria-label={`${n} lives`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < n ? "" : "opacity-25"}>
          ❤️
        </span>
      ))}
    </span>
  );
}
