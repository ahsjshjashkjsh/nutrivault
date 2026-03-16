"use client";

import { SessionProvider } from "next-auth/react";
import { LanguageProvider } from "@/contexts/language-context";
import { ThemeProvider } from "@/contexts/theme-context";
import { FirstVisitLanguageSelector } from "@/components/language-selector";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <LanguageProvider>
          <FirstVisitLanguageSelector />
          {children}
        </LanguageProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
