import type { Locale, BodyTranslation, UIKey } from './locales';
import { LOCALES, UI_STRINGS, BODY_STRINGS, bodyFromData } from './locales';
import type { BodyData } from '../data/types';

export type { Locale };

/** Resource-lookup helpers for translating UI strings and body content. */
export const i18n = {
  isLocale(value: unknown): value is Locale {
    return typeof value === 'string' && (LOCALES as string[]).includes(value);
  },

  /** Look up a UI string for the given locale ('en' is always authoritative). */
  t(key: UIKey, locale: Locale): string {
    return UI_STRINGS[locale][key];
  },

  /** Format a simple numeric placeholder template, e.g. "{n} moons". */
  format(template: string, values: Record<string, string | number>): string {
    return template.replace(/\{(\w+)\}/g, (_, k: string) =>
      k in values ? String(values[k]) : '',
    );
  },

  /** Localized display text for a body, falling back to the canonical data. */
  body(body: BodyData, locale: Locale): BodyTranslation {
    if (locale !== 'en' && BODY_STRINGS[locale][body.id]) {
      const t = BODY_STRINGS[locale][body.id];
      return {
        ...bodyFromData(body),
        ...t,
      };
    }
    return bodyFromData(body);
  },

  /** Localized name for a body. */
  name(body: BodyData, locale: Locale): string {
    return this.body(body, locale).name;
  },

  /** Localized description for a body. */
  description(body: BodyData, locale: Locale): string {
    return this.body(body, locale).description;
  },

  /** Localized fun fact for a body (may be undefined). */
  funFact(body: BodyData, locale: Locale): string | undefined {
    return this.body(body, locale).funFact;
  },

  /** Localized atmosphere description for a body. */
  atmosphere(body: BodyData, locale: Locale): string {
    return this.body(body, locale).atmosphere ?? body.atmosphere.description;
  },
};

/** Human-readable label of a locale. */
export function localeLabel(locale: Locale): string {
  return locale === 'es' ? 'Español' : 'English';
}
