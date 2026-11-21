// Acceso a la base SQLite (solo en tiempo de compilación: el sitio final es 100 % estático).
import { DatabaseSync } from 'node:sqlite';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';

export type Line = 'profesional' | 'hogar';

export interface Category {
  id: number;
  slug: string;
  line: Line;
  name: string;
  description: string | null;
  icon: string | null;
  sort: number;
  count: number;
}

export interface Spec { label: string; value: string }
export interface Variant { name: string; ref: string }
export interface Presentation { label: string; ref: string }
/** Foto lista para usar: rutas relativas a public/img/ */
export interface Photo { src: string; srcSm: string; alt: string }

export interface Product {
  id: number;
  slug: string;
  name: string;
  ref: string;
  kind: 'equipo' | 'quimico' | 'accesorio';
  badge: string | null;
  note: string | null;
  image: string | null;
  availability: 'disponible' | 'bajo_pedido';
  featured: boolean;
  sort: number;
  category: Pick<Category, 'id' | 'slug' | 'name' | 'line'>;
  specs: Spec[];
  variants: Variant[];
  presentations: Presentation[];
  /** Galería (la primera es la portada). Vacía si el producto no tiene fotos. */
  photos: Photo[];
}

// Se resuelve desde la raíz del proyecto (donde se ejecuta `npm run build`).
const DB_PATH = resolve(process.cwd(), 'db/catalogo.db');
const IMG_DIR = resolve(process.cwd(), 'public/img/productos');

let cache: { categories: Category[]; products: Product[] } | null = null;

function load() {
  if (cache) return cache;
  const db = new DatabaseSync(DB_PATH, { readOnly: true });

  const cats = db
    .prepare(
      `SELECT c.id, c.slug, c.line, c.name, c.description, c.icon, c.sort,
              (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.active = 1) AS count
         FROM categories c ORDER BY c.sort`,
    )
    .all() as unknown as Category[];
  const catById = new Map(cats.map((c) => [c.id, c]));

  const group = <T,>(sql: string) => {
    const m = new Map<number, T[]>();
    for (const r of db.prepare(sql).all() as unknown as (T & { product_id: number })[]) {
      const { product_id, ...rest } = r;
      const list = m.get(product_id) ?? [];
      list.push(rest as T);
      m.set(product_id, list);
    }
    return m;
  };
  const specs = group<Spec>('SELECT product_id, label, value FROM specs ORDER BY product_id, sort');
  const variants = group<Variant>('SELECT product_id, name, ref FROM variants ORDER BY product_id, sort');
  const pres = group<Presentation>('SELECT product_id, label, ref FROM presentations ORDER BY product_id, sort');
  // Solo se usan las fotos que ya están descargadas en public/img/productos/
  const gallery = group<{ file: string; alt: string | null }>('SELECT product_id, file, alt FROM images ORDER BY product_id, sort');
  const toPhoto = (file: string, alt: string): Photo | null => {
    if (!existsSync(resolve(IMG_DIR, file))) return null;
    const sm = file.replace(/\.webp$/, '-sm.webp');
    return { src: `productos/${file}`, srcSm: existsSync(resolve(IMG_DIR, sm)) ? `productos/${sm}` : `productos/${file}`, alt };
  };

  type Row = Omit<Product, 'featured' | 'category' | 'specs' | 'variants' | 'presentations'> & { featured: number; category_id: number };
  const rows = db
    .prepare(
      `SELECT p.id, p.slug, p.name, p.ref, p.kind, p.badge, p.note, p.image, p.availability, p.featured, p.sort, p.category_id
         FROM products p JOIN categories c ON c.id = p.category_id
        WHERE p.active = 1
        ORDER BY c.sort, p.sort`,
    )
    .all() as unknown as Row[];

  const products: Product[] = rows.map(({ category_id, featured, ...r }) => {
    const c = catById.get(category_id);
    if (!c) throw new Error(`Producto ${r.slug} con categoría inexistente ${category_id}`);
    return {
      ...r,
      featured: featured === 1,
      category: { id: c.id, slug: c.slug, name: c.name, line: c.line },
      specs: specs.get(r.id) ?? [],
      variants: variants.get(r.id) ?? [],
      presentations: pres.get(r.id) ?? [],
      photos: (() => {
        const list = (gallery.get(r.id) ?? []).map((g) => toPhoto(g.file, g.alt ?? r.name)).filter((x): x is Photo => x !== null);
        // Respaldo: foto tomada del catálogo PDF
        if (!list.length && r.image) { const legacy = toPhoto(r.image, r.name); if (legacy) list.push(legacy); }
        return list;
      })(),
    };
  });

  db.close();
  cache = { categories: cats.filter((c) => c.count > 0), products };
  return cache;
}

export const getCategories = (line?: Line) => load().categories.filter((c) => !line || c.line === line);
export const getProducts = () => load().products;
export const getFeatured = () => load().products.filter((p) => p.featured);
export const getProduct = (slug: string) => load().products.find((p) => p.slug === slug);
export const getRelated = (p: Product, n = 4) =>
  load().products.filter((x) => x.category.id === p.category.id && x.id !== p.id).slice(0, n);
