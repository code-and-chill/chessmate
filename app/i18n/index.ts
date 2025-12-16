/**
 * i18n translation management.
 * Supports multiple locales: en, es, fr, de, ru, zh, ja
 * 
 * Performance optimizations:
 * - English locale is bundled (default, always needed)
 * - Other locales are lazy-loaded on demand to reduce initial bundle size
 */

export type Locale = 'en' | 'es' | 'fr' | 'de' | 'ru' | 'zh' | 'ja';

export interface TranslationDict {
  [key: string]: string | TranslationDict;
}

// Default locale bundled statically (most users)
const defaultTranslations: TranslationDict = require('./locales/en.json');

// Cache for lazy-loaded translations
const translationsCache: Partial<Record<Locale, TranslationDict>> = {
  en: defaultTranslations,
};

// Lazy loaders for non-default locales (reduces initial bundle by ~80% for i18n)
const localeLoaders: Record<Locale, () => TranslationDict> = {
  en: () => defaultTranslations,
  es: () => require('./locales/es.json'),
  fr: () => require('./locales/fr.json'),
  de: () => require('./locales/de.json'),
  ru: () => require('./locales/ru.json'),
  zh: () => require('./locales/zh.json'),
  ja: () => require('./locales/ja.json'),
};

/**
 * Get translations for a locale, loading lazily if needed.
 * Caches loaded translations to avoid repeated require() calls.
 */
function getTranslationsForLocale(locale: Locale): TranslationDict {
  if (!translationsCache[locale]) {
    translationsCache[locale] = localeLoaders[locale]();
  }
  return translationsCache[locale]!;
}

/**
 * Preload a locale's translations (useful for anticipated locale switches)
 */
export function preloadLocale(locale: Locale): void {
  if (!translationsCache[locale]) {
    translationsCache[locale] = localeLoaders[locale]();
  }
}

/**
 * Get a translation string by key using dot notation
 * @example
 * getTranslation('en', 'game.play', 'Play') // Returns translated value or "Play"
 */
export function getTranslation(locale: Locale, key: string, defaultValue?: string): string {
  const parts = key.split('.');
  const translations = getTranslationsForLocale(locale);
  let value: TranslationDict | string = translations;

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
  return Object.keys(localeLoaders) as Locale[];
}

/**
 * Check if a locale is supported
 */
export function isLocaleSupported(locale: string): locale is Locale {
  return locale in localeLoaders;
}

/**
 * Check if a locale is already loaded in cache
 */
export function isLocaleLoaded(locale: Locale): boolean {
  return locale in translationsCache;
}