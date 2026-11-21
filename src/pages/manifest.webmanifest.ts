import type { APIRoute } from 'astro';
import { SITE } from '../config/site';

export const GET: APIRoute = () => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const manifest = {
    name: SITE.legalName,
    short_name: SITE.name,
    description: SITE.description,
    lang: 'es-CO',
    start_url: `${base}/`,
    scope: `${base}/`,
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#111214',
    icons: [
      { src: `${base}/img/site/icon-192.png`, sizes: '192x192', type: 'image/png' },
      { src: `${base}/img/site/icon-512.png`, sizes: '512x512', type: 'image/png' },
    ],
  };
  return new Response(JSON.stringify(manifest), { headers: { 'Content-Type': 'application/manifest+json' } });
};
