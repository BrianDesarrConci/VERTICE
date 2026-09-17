// ============================================================
// Modelos de dominio compartidos (tienda + admin + api).
// Espejo tipado de las hojas de Google Sheets.
// ============================================================

export type ID = string;

/** Variante de un producto (color, capacidad, etc.). */
export interface ProductVariant {
  id: ID;
  name: string; // ej: "256 GB — Titanio Natural"
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
  cost: number; // costo (solo admin)
  stock: number;
  category: string; // slug de categoría
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
