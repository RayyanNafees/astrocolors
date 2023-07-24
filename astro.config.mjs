// astro.config.ts
import UnoCSS from 'unocss/astro';
import { defineConfig } from 'astro/config';
import vercel from "@astrojs/vercel/edge";

// https://astro.build/config
export default defineConfig({
  integrations: [UnoCSS()],
  output: "server",
  adapter: vercel()
});