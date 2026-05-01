"use client";

import { useState } from "react";
import { Globe, X } from "lucide-react";

const languages = [
  { code: "en", name: "English", flag: "EN" },
  { code: "fr", name: "French", flag: "FR" },
  { code: "rw", name: "Kinyarwanda", flag: "RW" },
  { code: "sw", name: "Swahili", flag: "SW" },
  { code: "ig", name: "Igbo", flag: "IG" },
  { code: "ha", name: "Hausa", flag: "HA" },
  { code: "yo", name: "Yoruba", flag: "YO" },
  { code: "ar", name: "Arabic", flag: "AR" },
  { code: "pt", name: "Portuguese", flag: "PT" },
  { code: "es", name: "Spanish", flag: "ES" },
  { code: "de", name: "German", flag: "DE" },
  { code: "zh-CN", name: "Chinese", flag: "ZH" },
];

export default function GoogleTranslate() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("en");

  const handleTranslate = (langCode: string) => {
    setCurrentLang(langCode);
    setIsOpen(false);

    if (langCode === "en") {
      window.location.reload();
    } else {
      // Open Google Translate in new tab
      const url = `https://translate.google.com/translate?sl=en&tl=${langCode}&u=${encodeURIComponent(window.location.href)}`;
      window.open(url, "_blank");
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {/* Collapsed State - Small Icon Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-10 h-10 bg-white border border-gray-200 rounded-full shadow-md hover:shadow-lg [transition:all_0.3s_ease] hover:scale-110 flex items-center justify-center group"
          aria-label="Translate page"
          title="Translate"
        >
          <Globe className="w-5 h-5 text-teal-600 group-hover:text-teal-700" />
        </button>
      )}

      {/* Expanded State - Language Selector */}
      {isOpen && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden w-44">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-teal-600" />
              <span className="text-xs font-medium text-gray-700">Translate</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Language List */}
          <div className="max-h-48 overflow-y-auto">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleTranslate(lang.code)}
                className={`w-full px-3 py-1.5 text-left text-xs hover:bg-teal-50 [transition:all_0.2s_ease] flex items-center justify-between ${
                  currentLang === lang.code
                    ? "text-teal-600 font-medium bg-teal-50"
                    : "text-gray-600"
                }`}
              >
                <span>{lang.name}</span>
                <span className="text-[10px] text-gray-400 font-mono">{lang.flag}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
