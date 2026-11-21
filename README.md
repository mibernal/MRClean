# M.R Clean Servicios · Catálogo web

Sitio estático con todo el catálogo (123 productos, 75 con ficha técnica) **sin precios**: cada producto se cotiza por WhatsApp o correo, uno por uno o con la lista "Mi cotización".

- **Astro 7** + **Tailwind CSS 4** + TypeScript estricto. El resultado es HTML estático, sin servidor y muy rápido.
- **SQLite** (`db/catalogo.db`): un solo archivo, sin servidor. Se lee al compilar.
- **GitHub Pages**: se despliega solo con cada `push` a `main`.

## Requisitos
Node.js 22.13 o superior (incluye SQLite integrado).

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # genera dist/
npm run preview    # sirve dist/
```

## Publicar en GitHub Pages
1. Cree un repositorio en GitHub (por ejemplo `mrclean-catalogo`) y suba este proyecto:
   ```bash
   git init && git add . && git commit -m "Catálogo M.R Clean"
   git branch -M main
   git remote add origin https://github.com/SU_USUARIO/mrclean-catalogo.git
   git push -u origin main
   ```
2. En el repositorio, entre a **Settings → Pages → Build and deployment → Source** y elija **GitHub Actions**.
3. Listo. El flujo `.github/workflows/deploy.yml` compila y publica en `https://SU_USUARIO.github.io/mrclean-catalogo/`.

**Dominio propio** (por ejemplo, `www.mrclean.com.co`): configúrelo en Settings → Pages → Custom domain y, en `deploy.yml`, cambie `SITE: https://www.mrclean.com.co` y `BASE: /`.

## Datos de la empresa
Todo está en `src/config/site.ts`: nombre, **número de WhatsApp**, **correo**, ciudad, horario y redes. Al cambiarlo se actualiza todo el sitio.

## Editar productos (base de datos)
La fuente de verdad es `db/catalogo.db`.

- **Con un visor gráfico** (recomendado): abra `db/catalogo.db` con [DB Browser for SQLite](https://sqlitebrowser.org/) (gratis) o TablePlus. Edite, guarde y haga `commit` + `push`.
- **Respaldo en texto**: `npm run db:export` vuelca la base a `db/seed.sql`, que se puede leer en GitHub y comparar entre versiones.
- **Reconstruir desde el respaldo**: `npm run db:build` borra `catalogo.db` y la recrea con `schema.sql` + `seed.sql`.

| Tabla | Qué guarda |
|---|---|
| `categories` | Categorías, línea (`profesional`/`hogar`), descripción y orden |
| `products` | Nombre, referencia, categoría, etiqueta (`badge`), subtítulo (`note`), foto, disponibilidad (`disponible`/`bajo_pedido`), destacado, orden, activo |
| `specs` | Ficha técnica: etiqueta / valor / orden |
| `variants` | Otras versiones del mismo equipo |
| `presentations` | Presentaciones de detergentes (500 ml, 5 l…) |

- **Ocultar un producto**: `active = 0`.
- **Destacarlo en el inicio**: `featured = 1`.
- **Agregar una foto**: copie el archivo `.webp` o `.jpg` en `public/img/productos/` y escriba el nombre del archivo en `products.image`. Fondo blanco, cerca de 900 px.

## Logo y colores
- Logo circular: `public/img/site/logo.png` y `logo.webp`. Engranaje del encabezado: `mark.png`. Íconos: `favicon.png` y `apple-touch-icon.png`.
- Colores: bloque `@theme` en `src/styles/global.css` (`--color-brand` es el amarillo del logo).

## Estructura
```
db/                 schema.sql · seed.sql · catalogo.db
public/img/         productos/ (fotos) · site/ (logo, portada)
src/config/site.ts  datos de contacto
src/lib/db.ts       lectura de SQLite
src/pages/          inicio · catalogo · producto/[slug] · cotizacion · 404
src/scripts/quote.ts  lista de cotización (se guarda en el navegador)
```
