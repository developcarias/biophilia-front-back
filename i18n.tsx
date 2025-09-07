

import React, { createContext, useState, useContext, useMemo, ReactNode } from 'react';
import { translations } from './translations';

type Language = 'en' | 'es';
export type TranslationKey = keyof typeof translations.en;

interface I18nContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, replacements?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const getInitialLanguage = (): Language => {
  const browserLang = navigator.language.split('-')[0];
  return browserLang === 'es' ? 'es' : 'en';
};

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);

  const t = (key: TranslationKey, replacements?: Record<string, string | number>): string => {
    let text = translations[language][key] || translations.en[key];
    if (replacements) {
      Object.entries(replacements).forEach(([key, value]) => {
        text = text.replace(`{{${key}}}`, String(value));
      });
    }
    return text;
  };

  const value = useMemo(() => ({
    language,
    setLanguage,
    t
  }), [language]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

export const useTranslate = () => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useTranslate must be used within an I18nProvider');
  }
  return context.t;
};