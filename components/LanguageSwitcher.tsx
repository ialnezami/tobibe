"use client";

import { useLanguage } from "@/lib/i18n/context";
import { Button } from "@/components/ui/Button";

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  const languages = [
    { code: "en" as const, name: "English", flag: "🇬🇧" },
    { code: "ar" as const, name: "العربية", flag: "🇸🇦" },
    { code: "fr" as const, name: "Français", flag: "🇫🇷" },
  ];

  return (
    <div className="relative group">
      <Button
        variant="outline"
        className="flex items-center gap-2 px-3 py-2 text-sm"
        onClick={() => {
          // Toggle dropdown or cycle through languages
          const currentIndex = languages.findIndex((l) => l.code === language);
          const nextIndex = (currentIndex + 1) % languages.length;
          setLanguage(languages[nextIndex].code);
        }}
      >
        <span>{languages.find((l) => l.code === language)?.flag || "🌐"}</span>
        <span className="hidden sm:inline">
          {languages.find((l) => l.code === language)?.name || language.toUpperCase()}
        </span>
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </Button>

      {/* Dropdown menu */}
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="py-1">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-slate-100 transition-colors ${
                language === lang.code ? "bg-teal-50 text-teal-700" : "text-slate-700"
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span>{lang.name}</span>
              {language === lang.code && (
                <span className="ml-auto text-teal-600">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}


