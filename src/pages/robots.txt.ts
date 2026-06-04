import type { APIRoute } from "astro";
import { SITE } from "../i18n/config";

export const GET: APIRoute = () => {
  const body = `User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml

# LLM-readable glossary summary: ${SITE}/llms.txt
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
