import React, { createContext, useState, useCallback } from 'react';
import { Locale, getTranslation, interpolateTranslation } from './index';

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, defaultValue?: string) => string;
  ti: (key: string, variables: Record<string, string | number>, defaultValue?: string) => string;
}

export const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export interface I18nProviderProps {
  defaultLocale?: Locale;
  children: React.ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ defaultLocale = 'en', children }) => {
  const [locale, setLocale] = useState<Locale>(defaultLocale);

  const t = useCallback(
    (key: string, defaultValue?: string) => getTranslation(locale, key, defaultValue),
    [locale]
  );

  const ti = useCallback(
    (key: string, variables: Record<string, string | number>, defaultValue?: string) => {
      const text = getTranslation(locale, key, defaultValue);
      return interpolateTranslation(text, variables);
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, ti }}>
      {children}
    </I18nContext.Provider>
  );
};

export function useI18n(): I18nContextValue {
  const context = React.useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
