// Reconstruye db/catalogo.db a partir de db/schema.sql + db/seed.sql
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, rmSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const dir = new URL('../db/', import.meta.url);
const dbPath = fileURLToPath(new URL('catalogo.db', dir));
if (existsSync(dbPath)) rmSync(dbPath);

const db = new DatabaseSync(dbPath);
db.exec(readFileSync(new URL('schema.sql', dir), 'utf8'));
db.exec(readFileSync(new URL('seed.sql', dir), 'utf8'));

const count = (t) => db.prepare(`SELECT COUNT(*) AS n FROM ${t}`).get().n;
console.log(`✔ db/catalogo.db creada · ${count('categories')} categorías · ${count('products')} productos · ${count('specs')} especificaciones`);
db.close();
