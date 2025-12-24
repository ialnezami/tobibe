"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";

type Language = "en" | "ar" | "fr";

interface Translations {
  [key: string]: any;
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Load translations
const loadTranslations = async (lang: Language): Promise<Translations> => {
  try {
    const translations = await import(`./translations/${lang}.json`);
    return translations.default;
  } catch (error) {
    console.error(`Failed to load translations for ${lang}:`, error);
    // Fallback to English
    const fallback = await import(`./translations/en.json`);
    return fallback.default;
  }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [language, setLanguageState] = useState<Language>("en");
  const [translations, setTranslations] = useState<Translations>({});
  const [isLoading, setIsLoading] = useState(true);

  // Initialize language from user preference or default
  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        // First, try to get user's language preference
        if (session?.user?.id) {
          const response = await fetch("/api/users/language");
          if (response.ok) {
            const data = await response.json();
            if (data.language) {
              setLanguageState(data.language);
              const userTranslations = await loadTranslations(data.language);
              setTranslations(userTranslations);
              setIsLoading(false);
              return;
            }
          }
        }

        // Fallback to browser language or default
        const browserLang = navigator.language.split("-")[0];
        const defaultLang: Language =
          browserLang === "ar" || browserLang === "fr" ? browserLang : "en";

        // Get default language from system settings
        const systemResponse = await fetch("/api/admin/settings/default-language");
        if (systemResponse.ok) {
          const systemData = await systemResponse.json();
          if (systemData.defaultLanguage) {
            const lang = systemData.defaultLanguage as Language;
            setLanguageState(lang);
            const systemTranslations = await loadTranslations(lang);
            setTranslations(systemTranslations);
            setIsLoading(false);
            return;
          }
        }

        // Use browser language or fallback to English
        setLanguageState(defaultLang);
        const defaultTranslations = await loadTranslations(defaultLang);
        setTranslations(defaultTranslations);
      } catch (error) {
        console.error("Error initializing language:", error);
        // Fallback to English
        const englishTranslations = await loadTranslations("en");
        setTranslations(englishTranslations);
      } finally {
        setIsLoading(false);
      }
    };

    initializeLanguage();
  }, [session]);

  // Update language and save preference
  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    const newTranslations = await loadTranslations(lang);
    setTranslations(newTranslations);

    // Save user preference if logged in
    if (session?.user?.id) {
      try {
        await fetch("/api/users/language", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ language: lang }),
        });
      } catch (error) {
        console.error("Error saving language preference:", error);
      }
    }
  };

  // Translation function
  const t = (key: string): string => {
    const keys = key.split(".");
    let value: any = translations;

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }

    return typeof value === "string" ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}


