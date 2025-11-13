import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import ru from './locales/ru.json';
import zh from './locales/zh.json';
import ja from './locales/ja.json';

export type Locale = 'en' | 'es' | 'fr' | 'de' | 'ru' | 'zh' | 'ja';

export type TranslationKeys = keyof typeof en;

export interface TranslationDict {
  [key: string]: string | TranslationDict;
}

export const translations: Record<Locale, TranslationDict> = {
  en,
  es,
  fr,
  de,
  ru,
  zh,
  ja,
};

export function getTranslation(locale: Locale, key: string, defaultValue?: string): string {
  const parts = key.split('.');
  let value: any = translations[locale];

  for (const part of parts) {
    if (typeof value === 'object' && value !== null) {
      value = value[part];
    } else {
      return defaultValue || key;
    }
  }

  if (typeof value === 'string') {
    return value;
  }

  return defaultValue || key;
}

export function interpolateTranslation(text: string, variables: Record<string, string | number>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return String(variables[key] ?? match);
  });
}
