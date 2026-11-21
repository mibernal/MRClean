// Índice liviano para el buscador global (se genera al compilar).
import type { APIRoute } from 'astro';
import { getProducts } from '../lib/db';

export const GET: APIRoute = () => {
  const data = getProducts().map((p) => ({
    n: p.name,
    r: p.ref,
    c: p.category.name,
    l: p.category.line,
    s: p.slug,
    i: p.photos[0]?.srcSm ?? null,
    k: [p.note, p.badge, ...p.variants.map((v) => `${v.name} ${v.ref}`), ...p.presentations.map((x) => x.ref)].filter(Boolean).join(' '),
  }));
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
