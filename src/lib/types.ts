// ============================================================
// Modelos de dominio compartidos (tienda + admin + api).
// Espejo tipado de las hojas de Google Sheets.
// ============================================================

export type ID = string;

/** Departamento (división por público). */
export type Department = 'dama' | 'caballero' | 'nino' | 'unisex';

export const DEPARTMENTS: { slug: Department; label: string }[] = [
  { slug: 'dama', label: 'Dama' },
  { slug: 'caballero', label: 'Caballero' },
  { slug: 'nino', label: 'Niño' },
];

/** Variante de un producto (talla, color, etc.). */
export interface ProductVariant {
  id: ID;
  name: string; // ej: "Talla M" o "Rojo / M"
  priceDelta: number; // diferencia sobre el precio base (puede ser 0 o negativa)
  stock: number;
  sku?: string;
}

export interface Product {
  id: ID;
  sku: string;
  name: string;
  slug: string;
  description: string;
  price: number; // precio base en la moneda de la tienda
  compareAtPrice?: number; // precio "antes" para mostrar descuento (0/undefined = sin descuento)
  cost: number; // costo (solo admin)
  stock: number;
  department: Department; // dama | caballero | nino | unisex
  category: string; // slug de categoría (tipo de prenda)
  brand: string;
  images: string[];
  variants: ProductVariant[];
  rating: number; // 0..5
  reviewsCount: number;
  featured: boolean;
  isNew: boolean;
  active: boolean;
  createdAt: string; // ISO
}

/** Cupón de descuento gestionable desde el admin. */
export interface Coupon {
  code: string;
  type: 'percent' | 'fixed';
  value: number; // % (0..100) o monto fijo
  active: boolean;
  minPurchase?: number; // compra mínima para aplicar
  description?: string;
}

/** Reseña de cliente. */
export interface Review {
  id: ID;
  name: string;
  rating: number; // 1..5
  text: string;
  product?: string;
  date: string; // ISO
  avatar?: string;
}

export type SeasonalEffect = 'none' | 'hearts' | 'snow' | 'leaves' | 'confetti' | 'spooky' | 'stars';
export type RadiusStyle = 'sharp' | 'soft' | 'round';
export type ButtonStyle = 'pill' | 'rounded';
export type HeroAlign = 'left' | 'center';

/** Contenido editable del sitio (CMS ligero; se guarda como JSON en Configuracion). */
export interface SiteContent {
  // --- Portada (hero) ---
  heroEyebrow: string;
  heroTitle: string;
  heroHighlight: string;
  heroSubtitle: string;
  heroImage: string;
  heroCtaText: string;
  heroCtaLink: string;
  heroSecondaryText: string;
  heroAlign: HeroAlign;
  heroOverlay: number; // 0..100 intensidad del oscurecido

  // --- Barra de anuncios ---
  announcement: string;
  showAnnouncement: boolean;

  // --- Encabezado ---
  showSearch: boolean;

  // --- Secciones del home (mostrar/ocultar + títulos) ---
  showCategories: boolean;
  categoriesTitle: string;
  showTrending: boolean;
  trendingTitle: string;
  showNew: boolean;
  newTitle: string;
  showReviewsHome: boolean;
  showNewsletter: boolean;
  newsletterTitle: string;
  showPromo: boolean;

  // --- Bloque promocional ---
  promoTitle: string;
  promoText: string;

  // --- ¿Quiénes Somos? ---
  aboutTitle: string;
  aboutText: string;
  aboutImage: string;

  // --- Estética global ---
  radius: RadiusStyle;
  buttonStyle: ButtonStyle;

  // --- Efectos y temporada ---
  showBlobs: boolean;
  blobIntensity: number; // 0..100
  seasonalEffect: SeasonalEffect;
  seasonBadge: string; // texto opcional del sello de temporada

  // --- Footer + contacto + redes ---
  footerText: string;
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
  whatsappNumber: string; // solo dígitos, ej: 573001234567
  showWhatsappFloat: boolean;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  contactHours: string;
}

export interface Category {
  id: ID;
  name: string;
  slug: string;
  image: string;
  order: number;
}

export interface CartItem {
  productId: ID;
  variantId: ID | null;
  sku: string;
  name: string;
  image: string;
  unitPrice: number;
  qty: number;
  maxStock: number;
}

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'preparing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  productId: ID;
  variantId: ID | null;
  sku: string;
  name: string;
  qty: number;
  unitPrice: number;
}

export interface Customer {
  id?: ID;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
}

export interface Order {
  id: ID;
  createdAt: string; // ISO
  customer: Customer;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  couponCode?: string | null;
}

export type ShipmentStatus = 'pending' | 'preparing' | 'in_transit' | 'delivered';

export interface Shipment {
  id: ID;
  orderId: ID;
  customerName: string;
  tracking: string;
  courier: string;
  status: ShipmentStatus;
  shippedAt: string | null;
  deliveredAt: string | null;
}

export interface InventoryMovement {
  id: ID;
  productId: ID;
  productName: string;
  type: 'in' | 'out';
  quantity: number;
  reason: string;
  createdAt: string;
  user: string;
}

export interface StoreConfig {
  currency: string; // 'COP'
  currencySymbol: string; // '$'
  taxRate: number; // 0.19
  freeShippingThreshold: number;
  flatShipping: number;
  storeName: string;
  primaryColor: string; // hex, color principal de marca
  secondaryColor: string; // hex, color secundario
  logoUrl: string; // URL del logo (vacío = logotipo por texto)
}

/** Respuesta estandarizada del backend GAS. */
export type ApiResult<T> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; code?: string };

/** Payload para crear un pedido desde el checkout. */
export interface CreateOrderPayload {
  customer: Customer;
  items: OrderItem[];
  shipping: number;
  paymentMethod: string;
  couponCode?: string | null;
}

/** Sesión admin autenticada. */
export interface AdminSession {
  token: string;
  email: string;
  role: 'owner' | 'staff';
}

/** KPIs del dashboard admin. */
export interface DashboardStats {
  salesToday: number;
  salesWeek: number;
  salesMonth: number;
  ordersToday: number;
  avgTicket: number;
  lowStockCount: number;
  pendingShipments: number;
  salesByDay: { date: string; total: number }[];
  salesByCategory: { category: string; total: number }[];
  topProducts: { name: string; units: number; revenue: number }[];
}
