import type { APIRoute } from "astro";
import { LOCALES, DEFAULT_LOCALE, localeMeta, localeUrl } from "../i18n/config";

const alternates = LOCALES.map(
  (loc) =>
    `    <xhtml:link rel="alternate" hreflang="${localeMeta[loc].hreflang}" href="${localeUrl(loc, "/")}" />`
)
  .concat(
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${localeUrl(DEFAULT_LOCALE, "/")}" />`
  )
  .join("\n");

export const GET: APIRoute = () => {
  const urls = LOCALES.map(
    (loc) => `  <url>
    <loc>${localeUrl(loc, "/")}</loc>
${alternates}
  </url>`
  ).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
