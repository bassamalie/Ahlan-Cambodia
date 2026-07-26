import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { translations, LanguageCode, Translations, languagesList, getLocalizedText } from "./translations";

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: Translations;
  lt: (text: string | undefined | null) => string;
  languagesList: typeof languagesList;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "EN",
  setLanguage: () => {},
  t: translations.EN,
  lt: (text) => text || "",
  languagesList
});

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>("EN");

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState("EN");
    try {
      localStorage.setItem("ahlan_language", "EN");
    } catch (e) {}
  };

  useEffect(() => {
    document.documentElement.dir = "ltr";
    document.documentElement.lang = "en";
  }, [language]);

  const value = {
    language,
    setLanguage,
    t: translations[language] || translations.EN,
    lt: (text: string | undefined | null) => getLocalizedText(text, language),
    languagesList
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => useContext(LanguageContext);

