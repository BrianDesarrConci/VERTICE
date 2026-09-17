# Personalización de marca (branding)

Todo el sistema de diseño vive en tokens, así que rebrandear es rápido.

## 1. Color de acento

Edita `tailwind.config.ts` → `theme.extend.colors.brand`. Cambia la escala 50–900.
El color principal es `brand-600` (por defecto `#0071e3`, azul Apple).

```ts
brand: {
  600: '#0071e3', // ← tu color principal
  700: '#005bbb', // hover
  // ...
}
```

## 2. Colores base y modo oscuro

Edita las variables HSL en `src/index.css`:

- `:root { ... }` → paleta modo claro.
- `.dark { ... }` → paleta modo oscuro.

Tokens clave: `--background`, `--foreground`, `--card`, `--muted`, `--border`, `--ring`.

## 3. Tipografía

En `tailwind.config.ts` → `fontFamily.sans`. Por defecto usa la fuente del
sistema Apple (SF Pro) con fallback a Inter. Para cargar otra fuente, agrégala
en `index.html` (Google Fonts) y actualiza la lista.

## 4. Logo y nombre

- **Nombre**: busca `VÉRTICE` en `Header.tsx`, `Footer.tsx`, `AdminLayout.tsx`,
  `index.html` y en `Code.gs` (`storeName`).
- **Logo**: el cuadro con la "V" está en esos componentes; reemplázalo por un `<img>`.
- **Favicon**: `public/favicon.svg`.

## 5. Moneda y locale

En `src/lib/format.ts` cambia `CURRENCY` (`'COP'`) y `LOCALE` (`'es-CO'`).
En el backend (`Code.gs`) ajusta `TAX_RATE`, `FLAT_SHIPPING`,
`FREE_SHIPPING_THRESHOLD` (o edítalos desde el panel **Configuración**).

## 6. Categorías y productos

- **Sin backend** (demo): edita `src/lib/mockData.ts`.
- **Con backend**: edita la función `seedData()` en `Code.gs`, o mejor,
  gestiona todo desde el panel **Admin → Stock**.
