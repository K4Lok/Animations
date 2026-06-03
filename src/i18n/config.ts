export const SITE = "https://animations.samkalok.com";

export const DEFAULT_LOCALE = "en" as const;

export const LOCALES = ["en", "zh-tw", "ja", "ko", "pt-br", "es", "fr", "de"] as const;

export type Locale = (typeof LOCALES)[number];

export interface LocaleMeta {
  /** Native name shown in the language switcher. */
  label: string;
  /** Value for hreflang alternate links. */
  hreflang: string;
  /** Value for the <html lang> attribute. */
  htmlLang: string;
  /** Open Graph og:locale value. */
  ogLocale: string;
  dir: "ltr" | "rtl";
}

export const localeMeta: Record<Locale, LocaleMeta> = {
  en: { label: "English", hreflang: "en", htmlLang: "en", ogLocale: "en_US", dir: "ltr" },
  "zh-tw": { label: "繁體中文", hreflang: "zh-Hant", htmlLang: "zh-Hant-TW", ogLocale: "zh_TW", dir: "ltr" },
  ja: { label: "日本語", hreflang: "ja", htmlLang: "ja", ogLocale: "ja_JP", dir: "ltr" },
  ko: { label: "한국어", hreflang: "ko", htmlLang: "ko", ogLocale: "ko_KR", dir: "ltr" },
  "pt-br": { label: "Português", hreflang: "pt-BR", htmlLang: "pt-BR", ogLocale: "pt_BR", dir: "ltr" },
  es: { label: "Español", hreflang: "es", htmlLang: "es", ogLocale: "es_ES", dir: "ltr" },
  fr: { label: "Français", hreflang: "fr", htmlLang: "fr", ogLocale: "fr_FR", dir: "ltr" },
  de: { label: "Deutsch", hreflang: "de", htmlLang: "de", ogLocale: "de_DE", dir: "ltr" },
};

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

/** Coerce Astro.currentLocale (which may be undefined) to a known Locale. */
export function resolveLocale(value: string | undefined): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/** Build a root-relative path for a locale (default locale has no prefix). */
export function localizedPath(locale: Locale, path = "/"): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === DEFAULT_LOCALE) return clean;
  return clean === "/" ? `/${locale}/` : `/${locale}${clean}`;
}

/** Build an absolute URL for a locale, used for canonical / hreflang / og tags. */
export function localeUrl(locale: Locale, path = "/"): string {
  return SITE + localizedPath(locale, path);
}
