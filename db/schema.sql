-- Mr Clean · catálogo (SQLite)
-- Sin precios: las cotizaciones se gestionan por WhatsApp o correo.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS categories (
  id          INTEGER PRIMARY KEY,
  slug        TEXT    NOT NULL UNIQUE,
  line        TEXT    NOT NULL CHECK (line IN ('profesional','hogar')),
  name        TEXT    NOT NULL,
  description TEXT,
  icon        TEXT,
  sort        INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS products (
  id           INTEGER PRIMARY KEY,
  slug         TEXT    NOT NULL UNIQUE,
  name         TEXT    NOT NULL,
  ref          TEXT    NOT NULL,              -- referencia del fabricante
  category_id  INTEGER NOT NULL REFERENCES categories(id),
  kind         TEXT    NOT NULL DEFAULT 'equipo' CHECK (kind IN ('equipo','quimico','accesorio')),
  badge        TEXT,                          -- etiqueta corta: Batería, Trifásica, Zona 22...
  note         TEXT,                          -- subtítulo: "Aspiradora de espalda"...
  image        TEXT,                          -- archivo en public/img/productos (NULL = sin foto)
  availability TEXT    NOT NULL DEFAULT 'disponible' CHECK (availability IN ('disponible','bajo_pedido')),
  featured     INTEGER NOT NULL DEFAULT 0,
  sort         INTEGER NOT NULL DEFAULT 0,
  active       INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS specs (
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  label      TEXT    NOT NULL,
  value      TEXT    NOT NULL,
  sort       INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS variants (
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name       TEXT    NOT NULL,
  ref        TEXT    NOT NULL,
  sort       INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS presentations (
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  label      TEXT    NOT NULL,              -- 500 ml, 5 l, 20 l...
  ref        TEXT    NOT NULL,
  sort       INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_specs_product ON specs(product_id);
