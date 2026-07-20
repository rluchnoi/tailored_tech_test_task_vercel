import { cn } from "@/lib/utils";

/**
 * Acme brand mark: a bold red badge with a dark outline and a rounded "A",
 * echoing the classic Acme Corp. wordmark (vivid red + black outline). The red
 * is a fixed brand colour, so the mark stays on-brand in every app theme rather
 * than tracking the active palette. `size="sm"` is used in the mobile
 * breadcrumb where it doubles as the "back to root" control.
 */
export function AcmeLogo({
  size = "md",
  className,
}: {
  size?: "sm" | "md";
  className?: string;
}) {
  const box = size === "sm" ? "size-9 rounded-lg" : "size-10 rounded-xl";
  const letter = size === "sm" ? "text-[1.15rem]" : "text-[1.35rem]";

  return (
    <span
      aria-hidden
      className={cn(
        "relative flex shrink-0 items-center justify-center",
        "shadow-sm ring-2 ring-[#1a1516]/85",
        box,
        className,
      )}
      style={{
        backgroundImage:
          "linear-gradient(150deg, #ff5a5f 0%, #e4141a 52%, #c00f16 100%)",
      }}
    >
      {/* Soft top highlight for a little dimensionality. */}
      <span className="pointer-events-none absolute inset-x-1 top-1 h-1/3 rounded-full bg-white/25 blur-[2px]" />
      <span
        className={cn(
          "font-display relative font-bold leading-none text-white drop-shadow-[0_1px_0_rgba(0,0,0,0.35)]",
          letter,
        )}
      >
        A
      </span>
    </span>
  );
}
