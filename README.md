<div align="center">

# ⌁ VÉRTICE

### Plataforma e-commerce premium — tienda pública + panel de administración

Diseño inspirado en Apple · Stripe · Linear. React 18 + TypeScript + Vite en el frontend,
Google Apps Script + Google Sheets como backend/DB.

</div>

---

## ✨ Características

### 🛍️ Tienda pública
- **Home** cinematográfica: hero animado, carrusel de categorías, destacados con hover premium, banners, nuevos lanzamientos y newsletter.
- **Catálogo (PLP)**: filtros por categoría, precio, marca, disponibilidad y rating; ordenamiento; búsqueda; toggle grid/lista; lazy-loading de imágenes.
- **Detalle de producto (PDP)**: galería con thumbnails, selector de variantes, stock en vivo ("Solo quedan 3"), tabs de especificaciones/envío/reseñas, productos relacionados.
- **Carrito**: drawer lateral animado, edición de cantidades, cupones, cálculo de subtotal/envío/IVA en vivo, persistencia en `localStorage`.
- **Checkout multi-paso**: contacto → dirección → envío → pago → confirmación, con validación (Zod) y barra de progreso.
- **Mi cuenta**: login/registro, pedidos con estado, direcciones y wishlist.
- **Modo claro/oscuro** con toggle persistente y anti-FOUC.

### 🛠️ Panel admin (`/admin`)
- **Dashboard**: KPIs (ventas hoy/semana/mes, ticket promedio), gráficos (Recharts), alertas de stock/despachos, últimas transacciones.
- **Stock**: CRUD completo, modal de edición, ajuste de inventario (entradas/salidas), historial de movimientos, export CSV.
- **Ventas**: lista con filtros por estado, detalle con timeline y cambio de estado.
- **Despachos**: tablero Kanban (Pendiente → Preparando → En tránsito → Entregado), gestión de courier y tracking.
- **Clientes**: CRM básico con LTV y segmentación (VIP / Recurrente / Nuevo).
- **Analytics**: reportes exportables, distribución por categoría, productos sin rotación.
- **Configuración**: datos de tienda, impuestos/envíos, usuarios admin, logs.

## 🏗️ Stack técnico

| Capa        | Tecnología |
|-------------|------------|
| Framework   | React 18 + TypeScript + Vite |
| Estilos     | TailwindCSS + tokens de diseño (light/dark) |
| UI          | Componentes propios estilo shadcn/ui |
| Animación   | Framer Motion |
| Estado      | Zustand (cart, auth, ui) con persistencia |
| Ruteo       | React Router v6 (rutas admin protegidas) |
| Validación  | Zod |
| Iconos      | Lucide React |
| Gráficos    | Recharts |
| Backend     | Google Apps Script (Web App) |
| Base datos  | Google Sheets (una hoja por entidad) |

## 🚀 Arranque rápido (local)

Requisitos: **Node 18+**.

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar entorno (opcional: por defecto arranca en modo mock)
cp .env.example .env

# 3. Levantar el servidor de desarrollo
npm run dev
```

Abre **http://localhost:5173**.

- Tienda: `/`
- Panel admin: `/admin` → login **admin@vertice.co / vertice123**

> **Modo mock**: sin backend configurado (o con `VITE_USE_MOCK=true`), la app usa datos
> de ejemplo en memoria y **todo funciona** (catálogo, carrito, checkout, admin). Ideal para
> desarrollo y demos. Para datos reales y persistentes, conecta el backend GAS ↓.

## 🔌 Conectar el backend (Google Apps Script)

Guía completa paso a paso en **[`docs/DEPLOY_GAS.md`](docs/DEPLOY_GAS.md)**. Resumen:

1. Crea una Google Sheet nueva → **Extensiones → Apps Script**.
2. Pega [`gas/Code.gs`](gas/Code.gs).
3. Ejecuta `setup()` y luego `seedData()`.
4. **Implementar → Aplicación web** (ejecutar como *yo*, acceso *cualquiera*). Copia la URL `/exec`.
5. En `.env`: `VITE_GAS_URL=<url>`, `VITE_ADMIN_TOKEN=<token>`, `VITE_USE_MOCK=false`.

## 📁 Estructura del proyecto

```
VERTICE/
├── gas/
│   ├── Code.gs                 # Backend completo (router doGet/doPost, helpers, setup, seedData)
│   └── appsscript.json         # Manifiesto Web App
├── docs/
│   ├── DEPLOY_GAS.md           # Guía de despliegue del backend
│   └── BRANDING.md             # Cómo personalizar la marca
├── src/
│   ├── components/
│   │   ├── ui/                 # Primitivos: button, card, input, badge, skeleton, smart-image
│   │   ├── layout/             # Header (sticky+blur), Footer, StoreLayout
│   │   ├── theme/              # ThemeToggle (claro/oscuro)
│   │   ├── product/            # ProductCard (hover premium + quick-add)
│   │   ├── cart/               # CartDrawer (drawer lateral animado)
│   │   └── admin/              # AdminLayout, ProtectedRoute, StatCard
│   ├── pages/
│   │   ├── store/              # Home, Catalog (PLP), Product (PDP), Checkout, Account
│   │   ├── admin/              # Login, Dashboard, Stock, Orders, Shipments, Customers, Analytics, Settings
│   │   └── NotFound.tsx
│   ├── stores/                 # cartStore, authStore, uiStore (Zustand)
│   ├── hooks/                  # useAsync, useStoreConfig
│   ├── lib/
│   │   ├── api.ts              # Cliente HTTP tipado → GAS (con fallback mock)
│   │   ├── types.ts            # Modelos de dominio (espejo de las hojas)
│   │   ├── mockData.ts         # Datos de ejemplo + KPIs
│   │   ├── format.ts           # Moneda / fecha / número
│   │   └── utils.ts            # cn, slugify, etc.
│   ├── App.tsx                 # Definición de rutas
│   ├── main.tsx                # Bootstrap
│   └── index.css               # Tokens de diseño + base Tailwind
├── tailwind.config.ts
├── vite.config.ts
└── package.json
```

## 🗄️ Modelo de datos (hojas de Google Sheets)

| Hoja | Campos principales |
|------|--------------------|
| `Productos` | id, sku, name, slug, description, price, cost, stock, category, brand, images[], variants[], rating, reviewsCount, featured, isNew, active |
| `Categorias` | id, name, slug, image, order |
| `Pedidos` | id, createdAt, customer, items[], subtotal, shipping, tax, discount, total, status, paymentMethod, couponCode |
| `Clientes` | id, name, email, phone, address, city |
| `Inventario_Mov` | id, productId, type (in/out), quantity, reason, createdAt, user |
| `Despachos` | id, orderId, tracking, courier, status, shippedAt, deliveredAt |
| `Usuarios_Admin` | id, email, role, passwordHash, lastAccess |
| `Configuracion` | key, value |
| `Cupones` | code, type, value, active |

## 🎨 Personalización

Ver **[`docs/BRANDING.md`](docs/BRANDING.md)** para cambiar color de acento, tipografía, logo, moneda y catálogo.

## 📜 Scripts

```bash
npm run dev        # Desarrollo (Vite)
npm run build      # Build de producción (tsc + vite)
npm run preview    # Previsualiza el build
npm run typecheck  # Chequeo de tipos
```

## 🔐 Notas de seguridad

- El panel admin usa un token compartido + hash SHA-256 de contraseña (adecuado para MVP/demo).
- Para producción real, migra la autenticación a un proveedor dedicado (Firebase Auth / JWT) y
  no expongas el `ADMIN_TOKEN` en el bundle del cliente.

---

<div align="center">
Hecho con precisión. Listo para producción.
</div>
