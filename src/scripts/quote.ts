// Lista de cotización guardada en el navegador (localStorage). Sin precios.
export interface QuoteItem { slug: string; name: string; ref: string; image: string | null; qty: number }

const KEY = 'mrclean:cotizacion:v1';
const EVT = 'quote:change';

const SLUG = /^[a-z0-9-]{1,120}$/;
const IMG = /^[a-z0-9-]{1,120}\.(webp|jpg|png)$/;
const MAX_ITEMS = 100;

/** Acepta solo datos con la forma esperada (localStorage puede haber sido alterado). */
function clean(v: unknown): QuoteItem | null {
  if (!v || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  if (typeof o.slug !== 'string' || !SLUG.test(o.slug)) return null;
  const qty = Math.trunc(Number(o.qty));
  return {
    slug: o.slug,
    name: String(o.name ?? '').slice(0, 120),
    ref: String(o.ref ?? '').slice(0, 40),
    image: typeof o.image === 'string' && IMG.test(o.image) ? o.image : null,
    qty: Number.isFinite(qty) ? Math.min(999, Math.max(1, qty)) : 1,
  };
}

export function readQuote(): QuoteItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    const data: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(data)) return [];
    return data.map(clean).filter((x): x is QuoteItem => x !== null).slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
}

function save(items: QuoteItem[]) {
  try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* modo privado: se ignora */ }
  window.dispatchEvent(new CustomEvent(EVT, { detail: items }));
}

export function addToQuote(item: Omit<QuoteItem, 'qty'>, qty = 1) {
  const safe = clean({ ...item, qty });
  if (!safe) return;
  const items = readQuote();
  const found = items.find((i) => i.slug === safe.slug);
  if (found) found.qty = Math.min(999, found.qty + qty);
  else if (items.length < MAX_ITEMS) items.push(safe);
  save(items);
}
export function setQty(slug: string, qty: number) {
  save(readQuote().map((i) => (i.slug === slug ? { ...i, qty: Math.max(1, Math.min(999, qty)) } : i)));
}
export function removeFromQuote(slug: string) { save(readQuote().filter((i) => i.slug !== slug)); }
export function clearQuote() { save([]); }
export function inQuote(slug: string) { return readQuote().some((i) => i.slug === slug); }
export function onQuoteChange(fn: (items: QuoteItem[]) => void) {
  window.addEventListener(EVT, () => fn(readQuote()));
  window.addEventListener('storage', (e) => { if (e.key === KEY) fn(readQuote()); });
}
