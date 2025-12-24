"use client";

import { useLanguage } from "@/lib/i18n/context";
import { useEffect } from "react";

export default function LanguageWrapper({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage();

  useEffect(() => {
    // Update HTML lang and dir attributes
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  return <>{children}</>;
}


