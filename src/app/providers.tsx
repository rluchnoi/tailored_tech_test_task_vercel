"use client";

import { ThemeProvider } from "next-themes";

/** Named colour themes; `dark` is the default. Kept in sync with globals.css. */
export const THEMES = ["dark", "white", "red"] as const;
export type ThemeName = (typeof THEMES)[number];

/**
 * App-wide client providers. `next-themes` writes the active theme's name as a
 * class on <html> before paint (no flash), which the token blocks in
 * globals.css key off. System preference is intentionally disabled — the theme
 * is an explicit, user-chosen setting.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      themes={[...THEMES]}
      disableTransitionOnChange={false}
    >
      {children}
    </ThemeProvider>
  );
}
