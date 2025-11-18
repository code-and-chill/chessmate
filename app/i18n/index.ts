/**
 * i18n translation management.
 * Supports multiple locales: en, es, fr, de, ru, zh, ja
 */

export type Locale = 'en' | 'es' | 'fr' | 'de' | 'ru' | 'zh' | 'ja';

export interface TranslationDict {
  [key: string]: string | TranslationDict;
}

// Placeholder translations - will be populated from locale JSON files
const translations: Record<Locale, TranslationDict> = {
  en: require('./locales/en.json'),
  es: require('./locales/es.json'),
  fr: require('./locales/fr.json'),
  de: require('./locales/de.json'),
  ru: require('./locales/ru.json'),
  zh: require('./locales/zh.json'),
  ja: require('./locales/ja.json'),
};

/**
 * Get a translation string by key using dot notation
 * @example
 * getTranslation('en', 'game.play', 'Play') // Returns translated value or "Play"
 */
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

/**
 * Interpolate variables into translation string
 * @example
 * interpolateTranslation('Hello {{name}}', { name: 'Alice' }) // "Hello Alice"
 */
export function interpolateTranslation(
  text: string,
  variables: Record<string, string | number>
): string {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return String(variables[key] ?? match);
  });
}

/**
 * Get all supported locales
 */
export function getSupportedLocales(): Locale[] {
  return Object.keys(translations) as Locale[];
}

/**
 * Check if a locale is supported
 */
export function isLocaleSupported(locale: string): locale is Locale {
  return locale in translations;
}