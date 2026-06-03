import { categories, type Category } from "../data/terms";
import type { ControlSpec } from "../scripts/demos/types";
import type { Locale } from "./config";

import { zhTW } from "./content/zh-tw";
import { ja } from "./content/ja";
import { ko } from "./content/ko";
import { ptBR } from "./content/pt-br";
import { es } from "./content/es";
import { fr } from "./content/fr";
import { de } from "./content/de";

export interface ContentStrings {
  /** Keyed by category id. */
  categories: Record<string, { title: string; subtitle: string }>;
  /** Keyed by term id (globally unique). */
  terms: Record<string, { name: string; blurb: string }>;
  /** Keyed by the English control label. Omit a key to keep the English text. */
  controlLabels: Record<string, string>;
  /** Keyed by the English select-option label. Omit a key to keep the English text. */
  optionLabels: Record<string, string>;
}

const registry: Partial<Record<Locale, ContentStrings>> = {
  "zh-tw": zhTW,
  ja,
  ko,
  "pt-br": ptBR,
  es,
  fr,
  de,
};

function localizeControl(c: ControlSpec, t: ContentStrings): ControlSpec {
  const label = t.controlLabels[c.label] ?? c.label;
  if (c.kind === "select") {
    return {
      ...c,
      label,
      options: c.options.map((o) => ({ ...o, label: t.optionLabels[o.label] ?? o.label })),
    };
  }
  return { ...c, label };
}

/** Return the glossary categories with all user-facing text translated for `locale`. */
export function localizeCategories(locale: Locale): Category[] {
  const t = registry[locale];
  if (!t) return categories;
  return categories.map((cat) => ({
    ...cat,
    title: t.categories[cat.id]?.title ?? cat.title,
    subtitle: t.categories[cat.id]?.subtitle ?? cat.subtitle,
    terms: cat.terms.map((term) => ({
      ...term,
      name: t.terms[term.id]?.name ?? term.name,
      blurb: t.terms[term.id]?.blurb ?? term.blurb,
      controls: term.controls?.map((c) => localizeControl(c, t)),
    })),
  }));
}
