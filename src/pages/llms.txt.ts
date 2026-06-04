import type { APIRoute } from "astro";
import { SITE } from "../i18n/config";
import { categories } from "../data/terms";

// A plain-text/markdown summary of the whole glossary for LLMs and AI search
// engines (the emerging /llms.txt convention). Mirrors the visible English
// content so generative engines can ingest every term and its definition.
export const GET: APIRoute = () => {
  const termCount = categories.reduce((n, cat) => n + cat.terms.length, 0);

  const intro = `# Animation Vocabulary

> A glossary of ${termCount} common animation patterns, grouped into ${categories.length} categories, with a live, adjustable demo for every term. Use these names to describe the motion you want when prompting an AI or briefing a designer.

Source: ${SITE}
Author: Sam KaLok
`;

  const body = categories
    .map((cat) => {
      const terms = cat.terms
        .map((term) => `- [${term.name}](${SITE}/#${term.id}): ${term.blurb}`)
        .join("\n");
      return `## ${cat.title}\n\n${cat.subtitle}\n\n${terms}`;
    })
    .join("\n\n");

  const text = `${intro}\n${body}\n`;

  return new Response(text, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
