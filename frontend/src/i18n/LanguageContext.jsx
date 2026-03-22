import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { translations } from './translations.js';

const STORAGE_KEY = 'eventbazaar-locale';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [locale, setLocaleState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'hi' || stored === 'en') return stored;
    } catch {
      /* ignore */
    }
    return 'en';
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = locale === 'hi' ? 'hi' : 'en';
  }, [locale]);

  const setLocale = useCallback((next) => {
    setLocaleState(next === 'hi' ? 'hi' : 'en');
  }, []);

  const t = useCallback(
    (key, vars) => {
      const dict = translations[locale] ?? translations.en;
      let s = dict[key];
      if (s === undefined) s = translations.en[key];
      if (s === undefined) return key;
      if (vars && typeof s === 'string') {
        return Object.keys(vars).reduce(
          (acc, k) => acc.replaceAll(`{${k}}`, String(vars[k])),
          s
        );
      }
      return s;
    },
    [locale]
  );

  const value = useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t]
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return ctx;
}
