"use client";

import { useState } from "react";
import { Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage, LANGUAGES, type Language } from "@/contexts/language-context";
import { APP_NAME } from "@/constants";

const labels: Record<Language, { title: string; subtitle: string; cta: string }> = {
  en: { title: "Choose your language", subtitle: "Select your preferred language to continue", cta: "Continue" },
  de: { title: "Sprache wählen", subtitle: "Wähle deine bevorzugte Sprache, um fortzufahren", cta: "Weiter" },
  es: { title: "Elige tu idioma", subtitle: "Selecciona tu idioma preferido para continuar", cta: "Continuar" },
  fr: { title: "Choisissez votre langue", subtitle: "Sélectionnez votre langue préférée pour continuer", cta: "Continuer" },
  it: { title: "Scegli la lingua", subtitle: "Seleziona la tua lingua preferita per continuare", cta: "Continua" },
};

export function FirstVisitLanguageSelector() {
  const { isFirstVisit, setLanguage, dismissLanguageSelector, language } = useLanguage();
  const [selected, setSelected] = useState<Language>(language);

  if (!isFirstVisit) return null;

  const handleContinue = () => {
    setLanguage(selected);
    dismissLanguageSelector();
  };

  const { title, subtitle, cta } = labels[selected];

  return (
    <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-500 flex items-center justify-center shadow-lg glow-green">
            <Leaf className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold">{APP_NAME}</h1>
        </div>

        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground mb-1">{title}</h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>

        <div className="space-y-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setSelected(lang.code)}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl border transition-all duration-150 text-left ${
                selected === lang.code
                  ? "border-brand-500 bg-brand-500/10 text-foreground"
                  : "border-border bg-card hover:border-brand-500/40 text-foreground"
              }`}
            >
              <span className="text-2xl leading-none">{lang.flag}</span>
              <span className="font-medium text-foreground">{lang.name}</span>
              {selected === lang.code && (
                <span className="ml-auto w-2.5 h-2.5 rounded-full bg-brand-500 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>

        <Button
          className="w-full py-5 font-semibold glow-green"
          onClick={handleContinue}
        >
          {cta}
        </Button>
      </div>
    </div>
  );
}
