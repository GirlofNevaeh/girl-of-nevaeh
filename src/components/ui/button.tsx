import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost" | "quiet" | "gold" | "pink" | "blue";

const styles: Record<Variant, string> = {
  primary:
    "bg-parchment text-ink hover:bg-parchment/90 border border-parchment",
  ghost:
    "bg-ink-soft/70 text-parchment border border-gold/35 hover:border-gold/70 hover:bg-ink-soft",
  quiet: "bg-transparent text-muted hover:text-parchment border border-transparent",
  gold: "bg-gold text-ink hover:bg-gold/90 border border-gold",
  pink: "bg-[#ff2bd6] text-ink border-[#ff4ae0] shadow-[0_0_16px_#ff4ae0] hover:bg-[#ff4ae0]",
  blue: "bg-[#12d8ff] text-ink border-[#3cf0ff] shadow-[0_0_16px_#3cf0ff] hover:bg-[#3cf0ff]",
};

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-[12px] px-5 py-2.5",
        "font-[family-name:var(--font-game)] text-sm font-medium tracking-wide transition-colors duration-150",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
        "disabled:opacity-40",
        "active:scale-[0.98]",
        styles[variant],
        className,
      )}
      {...props}
    />
  );
}
