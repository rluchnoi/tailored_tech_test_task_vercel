"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Check, Palette } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { ThemeName } from "@/app/providers";

/** Swatch gradients that preview each theme — chosen to read as the theme's
 * dominant colour (dark charcoal, clean white, Acme red) so the dots on the
 * menu and trigger match what you actually get. */
const THEME_OPTIONS: { id: ThemeName; label: string; swatch: string }[] = [
  { id: "dark", label: "Dark", swatch: "linear-gradient(135deg,#2b3040,#13151d)" },
  { id: "white", label: "White", swatch: "linear-gradient(135deg,#ffffff,#d6dae1)" },
  { id: "red", label: "Red", swatch: "linear-gradient(135deg,#f5484d,#d4141a)" },
];

/**
 * Toolbar control for switching the app-wide colour theme. Rendered as an icon
 * button that previews the active theme's swatch; the menu lists all themes
 * with a check on the current one.
 *
 * `next-themes` reads the stored theme on the very first client render, so it
 * would disagree with the server (which has no storage) and cause a hydration
 * mismatch. `useSyncExternalStore` gives a `mounted` flag that is `false` for
 * SSR and the first hydration pass and `true` thereafter — without a
 * setState-in-effect — so we render a neutral placeholder until the real theme
 * is known.
 */
export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const active =
    THEME_OPTIONS.find((t) => t.id === theme) ?? THEME_OPTIONS[0];

  const triggerClasses =
    "flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-expanded:bg-muted aria-expanded:text-foreground";

  if (!mounted) {
    return (
      <div className={triggerClasses} aria-hidden>
        <Palette className="size-4" />
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label="Change theme"
            title="Change theme"
            className={triggerClasses}
          />
        }
      >
        {/* Ring uses the theme foreground, so the dot reads against any
            background — a light ring on dark, a dark ring on white/red. */}
        <span
          className="ring-foreground/45 size-[1.15rem] rounded-full shadow-sm ring-2"
          style={{ background: active.swatch }}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {/* Plain header, not DropdownMenuLabel: Base UI's GroupLabel must live
            inside a Menu.Group, which these standalone items don't form. */}
        <div className="text-muted-foreground flex items-center gap-1.5 px-1.5 py-1 text-xs font-medium">
          <Palette className="size-3.5" />
          Theme
        </div>
        <DropdownMenuSeparator />
        {THEME_OPTIONS.map((option) => {
          const isActive = option.id === active.id;
          return (
            <DropdownMenuItem
              key={option.id}
              onClick={() => setTheme(option.id)}
              className="gap-2.5"
            >
              <span
                className="ring-foreground/30 size-4 shrink-0 rounded-full shadow-sm ring-1"
                style={{ background: option.swatch }}
              />
              <span className={cn("flex-1", isActive && "font-medium")}>
                {option.label}
              </span>
              {isActive && <Check className="size-4 shrink-0" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
