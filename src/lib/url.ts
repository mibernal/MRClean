// Construye rutas respetando el "base" de GitHub Pages (/nombre-del-repo/).
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
export const url = (path = '/') => `${BASE}${path.startsWith('/') ? path : `/${path}`}`;
export const img = (file: string) => url(`/img/${file}`);
