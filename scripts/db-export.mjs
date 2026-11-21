// Exporta db/catalogo.db a db/seed.sql (útil después de editar la base con un visor como DB Browser for SQLite)
import { DatabaseSync } from 'node:sqlite';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const dir = new URL('../db/', import.meta.url);
const db = new DatabaseSync(fileURLToPath(new URL('catalogo.db', dir)), { readOnly: true });

const lit = (v) => (v === null || v === undefined ? 'NULL' : typeof v === 'number' || typeof v === 'bigint' ? String(v) : `'${String(v).replaceAll("'", "''")}'`);
const tables = ['categories', 'products', 'specs', 'variants', 'presentations', 'images'];
const out = ['-- Exportado desde db/catalogo.db', 'BEGIN;'];
for (const t of tables) {
  const rows = db.prepare(`SELECT * FROM ${t} ORDER BY rowid`).all();
  if (!rows.length) continue;
  const cols = Object.keys(rows[0]);
  out.push(`INSERT INTO ${t} (${cols.join(', ')}) VALUES\n` + rows.map((r) => `(${cols.map((c) => lit(r[c])).join(', ')})`).join(',\n') + ';');
}
out.push('COMMIT;');
writeFileSync(new URL('seed.sql', dir), out.join('\n\n') + '\n');
console.log('✔ db/seed.sql actualizado');
db.close();
