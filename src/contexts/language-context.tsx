"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import en from "@/translations/en.json";
import de from "@/translations/de.json";
import es from "@/translations/es.json";
import fr from "@/translations/fr.json";
import it from "@/translations/it.json";

const translations = { en, de, es, fr, it } as const;
export type Language = keyof typeof translations;

export const LANGUAGES: { code: Language; name: string; flag: string }[] = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
];

const STORAGE_KEY = "nutrivault-lang";

type TranslationNode = string | { [key: string]: TranslationNode };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isFirstVisit: boolean;
  dismissLanguageSelector: () => void;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

function resolve(obj: TranslationNode, keys: string[]): string | null {
  let node: TranslationNode = obj;
  for (const k of keys) {
    if (typeof node !== "object" || node === null || !(k in node)) return null;
    node = (node as { [key: string]: TranslationNode })[k];
  }
  return typeof node === "string" ? node : null;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (stored && stored in translations) {
      setLanguageState(stored);
      setIsFirstVisit(false);
    } else {
      setIsFirstVisit(true);
    }
    setMounted(true);
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }, []);

  const dismissLanguageSelector = useCallback(() => {
    setIsFirstVisit(false);
  }, []);

  const t = useCallback(
    (key: string): string => {
      const keys = key.split(".");
      const current = translations[language] as unknown as TranslationNode;
      const result = resolve(current, keys);
      if (result !== null) return result;
      // fallback to English
      const fallback = translations.en as unknown as TranslationNode;
      return resolve(fallback, keys) ?? key;
    },
    [language]
  );

  // Render children immediately (avoids flash), selector overlays on top
  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, t, isFirstVisit: mounted && isFirstVisit, dismissLanguageSelector }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
