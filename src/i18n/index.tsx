import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getItem, setItem, StorageKeys } from "../utils/storage";
import { en } from "./en";
import { hi } from "./hi";
import { te } from "./te";

export type Locale = "en" | "hi" | "te";
export const LOCALES: { code: Locale; label: string; native: string }[] = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
];

const catalogs: Record<Locale, Record<string, string>> = { en, hi, te };

type Ctx = { locale: Locale; setLocale: (l: Locale) => void; t: (k: string, fallback?: string) => string };
const I18nCtx = createContext<Ctx | null>(null);

const KEY = "aarambh.locale";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const saved = getItem<string>(KEY);
    if (saved === "hi" || saved === "te" || saved === "en") setLocaleState(saved);
    else {
      // fall back to language selection value if any
      const lang = getItem<string>(StorageKeys.language);
      if (lang === "Hindi") setLocaleState("hi");
      else if (lang === "Telugu") setLocaleState("te");
    }
  }, []);

  const value = useMemo<Ctx>(() => ({
    locale,
    setLocale: (l) => { setLocaleState(l); setItem(KEY, l); },
    t: (k, fallback) => catalogs[locale][k] ?? catalogs.en[k] ?? fallback ?? k,
  }), [locale]);

  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

export function useI18n(): Ctx {
  const ctx = useContext(I18nCtx);
  if (!ctx) return { locale: "en", setLocale: () => {}, t: (k, f) => catalogs.en[k] ?? f ?? k };
  return ctx;
}

export function useT() { return useI18n().t; }
