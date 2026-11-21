// Descarga y optimiza las fotos de la tabla `images` que aún no existan en public/img/productos/.
// Genera dos versiones WebP: grande (máx. 1200 px) y pequeña "-sm" (máx. 600 px).
// Uso: npm run images:sync   (se ejecuta solo en GitHub Actions antes de compilar)
import { DatabaseSync } from 'node:sqlite';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import sharp from 'sharp';

const ROOT = resolve(import.meta.dirname, '..');
const OUT = resolve(ROOT, 'public/img/productos');
const db = new DatabaseSync(resolve(ROOT, 'db/catalogo.db'), { readOnly: true });
const rows = db.prepare('SELECT file, url FROM images WHERE url IS NOT NULL ORDER BY product_id, sort').all();
db.close();

const ALLOWED_HOSTS = new Set(['s1.kaercher-media.com']);
const pending = rows.filter((r) => !existsSync(resolve(OUT, r.file)));
console.log(`Imágenes en la base: ${rows.length} · por descargar: ${pending.length}`);

let ok = 0;
const failed = [];

async function download(url, tries = 3) {
  for (let i = 1; i <= tries; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'MRClean-catalogo/1.0' }, signal: AbortSignal.timeout(30_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const type = res.headers.get('content-type') ?? '';
      if (!type.startsWith('image/')) throw new Error(`tipo ${type}`);
      return Buffer.from(await res.arrayBuffer());
    } catch (e) {
      if (i === tries) throw e;
      await new Promise((r) => setTimeout(r, 1000 * i));
    }
  }
  throw new Error('sin respuesta');
}

async function work(r) {
  const u = new URL(r.url);
  if (u.protocol !== 'https:' || !ALLOWED_HOSTS.has(u.hostname)) throw new Error(`origen no permitido: ${u.hostname}`);
  if (!/^[a-z0-9/-]+\.webp$/.test(r.file)) throw new Error(`nombre de archivo inválido: ${r.file}`);
  const buf = await download(r.url);
  const big = resolve(OUT, r.file);
  const small = big.replace(/\.webp$/, '-sm.webp');
  mkdirSync(dirname(big), { recursive: true });
  const base = sharp(buf, { failOn: 'error' }).rotate().flatten({ background: '#ffffff' });
  await base.clone().resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true }).webp({ quality: 80, effort: 5 }).toFile(big);
  await base.clone().resize({ width: 600, height: 600, fit: 'inside', withoutEnlargement: true }).webp({ quality: 78, effort: 5 }).toFile(small);
}

const queue = [...pending];
await Promise.all(Array.from({ length: 6 }, async () => {
  for (let r = queue.shift(); r; r = queue.shift()) {
    try { await work(r); ok++; } catch (e) { failed.push(`${r.file}: ${e.message}`); }
  }
}));

console.log(`✔ ${ok} descargadas · ✖ ${failed.length} con error`);
for (const f of failed) console.log(`::warning title=Imagen no descargada::${f}`);
