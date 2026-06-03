// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://animations.samkalok.com",
  i18n: {
    defaultLocale: "en",
    locales: ["en", "zh-tw", "ja", "ko", "pt-br", "es", "fr", "de"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
