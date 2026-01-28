import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations } from '../translations';

interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (lang: string) => void;
  t: (key: keyof typeof translations.en) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Get language from URL path (e.g., /app?lang=es) or localStorage
const getInitialLanguage = (): string => {
  // Check URL parameter first
  const urlParams = new URLSearchParams(window.location.search);
  const langParam = urlParams.get('lang');
  if (langParam && translations[langParam]) {
    return langParam;
  }

  // Then check localStorage
  const stored = localStorage.getItem('hotosm_language');
  if (stored && translations[stored]) {
    return stored;
  }

  // Finally, check browser language
  const browserLang = navigator.language.split('-')[0];
  if (translations[browserLang]) {
    return browserLang;
  }

  return 'en'; // Default to English
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState(getInitialLanguage);

  // Save to localStorage when language changes
  useEffect(() => {
    localStorage.setItem('hotosm_language', currentLanguage);
  }, [currentLanguage]);

  const setLanguage = (lang: string) => {
    if (translations[lang]) {
      setCurrentLanguage(lang);
    }
  };

  // Translation helper function with fallback to English
  const t = (key: keyof typeof translations.en): string => {
    const langTranslations = translations[currentLanguage] || translations.en;
    return langTranslations[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
