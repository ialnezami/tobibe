"use client";

import { LanguageProvider as BaseLanguageProvider } from "@/lib/i18n/context";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  return <BaseLanguageProvider>{children}</BaseLanguageProvider>;
}

