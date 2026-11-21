// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// En GitHub Actions estas variables se llenan solas (ver .github/workflows/deploy.yml).
// Con dominio propio: SITE=https://www.midominio.com y BASE=/
const site = process.env.SITE ?? 'http://localhost:4321';
const base = process.env.BASE ?? '/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
    // Scripts siempre como archivos externos: permite una CSP sin 'unsafe-inline'.
    build: { assetsInlineLimit: 0 },
  },
  build: { format: 'directory', inlineStylesheets: 'never' },
});
