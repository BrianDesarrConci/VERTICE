// ============================================================
// api.ts — Cliente HTTP centralizado y tipado hacia el backend
// Google Apps Script (Web App). Incluye fallback a datos mock
// para que la app funcione sin backend desplegado.
//
// Contrato backend (Code.gs):
//   GET  ?action=<accion>&...    → lecturas
//   POST { action, token?, ... } → escrituras
//   Respuesta: { success, data | error, message?, code? }
// ============================================================
import type {
  AdminSession,
  ApiResult,
  Category,
  Coupon,
  CreateOrderPayload,
  DashboardStats,
  Department,
  InventoryMovement,
  Order,
  OrderStatus,
  Product,
  Review,
  Shipment,
  ShipmentStatus,
  SiteContent,
  StoreConfig,
} from './types';
import {
  MOCK_CATEGORIES,
  MOCK_CONFIG,
  MOCK_CONTENT,
  MOCK_COUPONS,
  MOCK_MOVEMENTS,
  MOCK_ORDERS,
  MOCK_PRODUCTS,
  MOCK_REVIEWS,
  MOCK_SHIPMENTS,
  buildMockDashboard,
} from './mockData';
import { shortId, sleep } from './utils';

const GAS_URL = import.meta.env.VITE_GAS_URL as string | undefined;
const ADMIN_TOKEN = (import.meta.env.VITE_ADMIN_TOKEN as string | undefined) ?? '';
const FORCE_MOCK = (import.meta.env.VITE_USE_MOCK as string | undefined) === 'true';

/** Usa mock si se fuerza por env o si no hay URL de backend configurada. */
export const USING_MOCK = FORCE_MOCK || !GAS_URL;

class ApiError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}

// ---------- Transporte HTTP real hacia GAS ----------

async function gasGet<T>(action: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(GAS_URL as string);
  url.searchParams.set('action', action);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString(), { method: 'GET', redirect: 'follow' });
  const json = (await res.json()) as ApiResult<T>;
  if (!json.success) throw new ApiError(json.error, json.code);
  return json.data;
}

async function gasPost<T>(action: string, body: Record<string, unknown>, admin = false): Promise<T> {
  // text/plain evita el preflight CORS en GAS.
  const payload = { action, ...(admin ? { token: ADMIN_TOKEN } : {}), ...body };
  const res = await fetch(GAS_URL as string, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  });
  const json = (await res.json()) as ApiResult<T>;
  if (!json.success) throw new ApiError(json.error, json.code);
  return json.data;
}

// ---------- Estado mock (en memoria durante la sesión) ----------

const mockState = {
  products: structuredClone(MOCK_PRODUCTS),
  categories: structuredClone(MOCK_CATEGORIES),
  orders: structuredClone(MOCK_ORDERS),
  shipments: structuredClone(MOCK_SHIPMENTS),
  movements: structuredClone(MOCK_MOVEMENTS),
  coupons: structuredClone(MOCK_COUPONS),
  reviews: structuredClone(MOCK_REVIEWS),
  config: structuredClone(MOCK_CONFIG),
  content: structuredClone(MOCK_CONTENT),
};

export const api = {
  usingMock: USING_MOCK,

  // ---------------- Tienda (público) ----------------

  async getConfig(): Promise<StoreConfig> {
    if (USING_MOCK) return sleep(80).then(() => mockState.config);
    return gasGet<StoreConfig>('getConfig');
  },

  async getContent(): Promise<SiteContent> {
    if (USING_MOCK) return sleep(80).then(() => mockState.content);
    return gasGet<SiteContent>('getContent');
  },

  async getCategories(): Promise<Category[]> {
    if (USING_MOCK) return sleep(80).then(() => mockState.categories);
    return gasGet<Category[]>('getCategories');
  },

  async getReviews(): Promise<Review[]> {
    if (USING_MOCK) return sleep(120).then(() => mockState.reviews);
    return gasGet<Review[]>('getReviews');
  },

  async getProducts(params?: {
    category?: string;
    department?: Department;
    search?: string;
  }): Promise<Product[]> {
    if (USING_MOCK) {
      await sleep(160);
      let list = mockState.products.filter((p) => p.active);
      if (params?.department) list = list.filter((p) => p.department === params.department);
      if (params?.category) list = list.filter((p) => p.category === params.category);
      if (params?.search) {
        const q = params.search.toLowerCase();
        list = list.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q),
        );
      }
      return list;
    }
    return gasGet<Product[]>('getProducts', {
      ...(params?.category ? { category: params.category } : {}),
      ...(params?.department ? { department: params.department } : {}),
      ...(params?.search ? { search: params.search } : {}),
    });
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    if (USING_MOCK) {
      await sleep(120);
      return mockState.products.find((p) => p.slug === slug) ?? null;
    }
    return gasGet<Product | null>('getProduct', { slug });
  },

  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    if (USING_MOCK) {
      await sleep(450);
      const subtotal = payload.items.reduce((s, it) => s + it.unitPrice * it.qty, 0);
      const tax = Math.round(subtotal * mockState.config.taxRate);
      const order: Order = {
        id: `VTX-${Math.floor(100000 + Math.random() * 900000)}`,
        createdAt: new Date().toISOString(),
        customer: payload.customer,
        items: payload.items,
        subtotal,
        shipping: payload.shipping,
        tax,
        discount: 0,
        total: subtotal + payload.shipping + tax,
        status: 'pending',
        paymentMethod: payload.paymentMethod,
        couponCode: payload.couponCode ?? null,
      };
      mockState.orders.unshift(order);
      for (const it of payload.items) {
        const p = mockState.products.find((x) => x.id === it.productId);
        if (p) p.stock = Math.max(0, p.stock - it.qty);
      }
      return order;
    }
    return gasPost<Order>('createOrder', { ...payload });
  },

  async validateCoupon(code: string, subtotal: number): Promise<{ code: string; discount: number }> {
    const normalized = code.trim().toUpperCase();
    if (USING_MOCK) {
      await sleep(220);
      const c = mockState.coupons.find((x) => x.code === normalized && x.active);
      if (!c) throw new ApiError('Cupón no válido', 'INVALID_COUPON');
      if (c.minPurchase && subtotal < c.minPurchase) {
        throw new ApiError(`Compra mínima de $${c.minPurchase.toLocaleString('es-CO')}`, 'MIN_PURCHASE');
      }
      const discount = c.type === 'percent' ? Math.round(subtotal * (c.value / 100)) : c.value;
      return { code: normalized, discount };
    }
    return gasPost<{ code: string; discount: number }>('validateCoupon', { code: normalized, subtotal });
  },

  // ---------------- Admin (protegido por token) ----------------

  async adminLogin(email: string, password: string): Promise<AdminSession> {
    if (USING_MOCK) {
      await sleep(350);
      if (email === 'admin@vertice.co' && password === 'vertice123') {
        return { token: ADMIN_TOKEN || 'mock-admin-token', email, role: 'owner' };
      }
      throw new ApiError('Credenciales inválidas', 'AUTH_FAILED');
    }
    return gasPost<AdminSession>('adminLogin', { email, password });
  },

  async getDashboard(): Promise<DashboardStats> {
    if (USING_MOCK) return sleep(180).then(() => buildMockDashboard(mockState.orders, mockState.products));
    return gasGet<DashboardStats>('getDashboard', { token: ADMIN_TOKEN });
  },

  async getOrders(status?: OrderStatus): Promise<Order[]> {
    if (USING_MOCK) {
      await sleep(150);
      return status ? mockState.orders.filter((o) => o.status === status) : mockState.orders;
    }
    return gasGet<Order[]>('getOrders', { token: ADMIN_TOKEN, ...(status ? { status } : {}) });
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    if (USING_MOCK) {
      await sleep(180);
      const o = mockState.orders.find((x) => x.id === orderId);
      if (!o) throw new ApiError('Pedido no encontrado', 'NOT_FOUND');
      o.status = status;
      return o;
    }
    return gasPost<Order>('updateOrderStatus', { orderId, status }, true);
  },

  async getShipments(): Promise<Shipment[]> {
    if (USING_MOCK) return sleep(140).then(() => mockState.shipments);
    return gasGet<Shipment[]>('getShipments', { token: ADMIN_TOKEN });
  },

  async updateShipment(id: string, patch: Partial<Shipment>): Promise<Shipment> {
    if (USING_MOCK) {
      await sleep(160);
      const s = mockState.shipments.find((x) => x.id === id);
      if (!s) throw new ApiError('Despacho no encontrado', 'NOT_FOUND');
      Object.assign(s, patch);
      return s;
    }
    return gasPost<Shipment>('updateShipment', { id, ...patch }, true);
  },

  async updateShipmentStatus(id: string, status: ShipmentStatus): Promise<Shipment> {
    return this.updateShipment(id, {
      status,
      ...(status === 'in_transit' ? { shippedAt: new Date().toISOString() } : {}),
      ...(status === 'delivered' ? { deliveredAt: new Date().toISOString() } : {}),
    });
  },

  async getProductsAdmin(): Promise<Product[]> {
    if (USING_MOCK) return sleep(140).then(() => mockState.products);
    return gasGet<Product[]>('getProductsAdmin', { token: ADMIN_TOKEN });
  },

  async saveProduct(product: Product): Promise<Product> {
    if (USING_MOCK) {
      await sleep(200);
      const idx = mockState.products.findIndex((p) => p.id === product.id);
      if (idx >= 0) mockState.products[idx] = product;
      else mockState.products.unshift({ ...product, id: shortId('p') });
      return product;
    }
    return gasPost<Product>('saveProduct', { product }, true);
  },

  async deleteProduct(id: string): Promise<{ id: string }> {
    if (USING_MOCK) {
      await sleep(160);
      mockState.products = mockState.products.filter((p) => p.id !== id);
      return { id };
    }
    return gasPost<{ id: string }>('deleteProduct', { id }, true);
  },

  async adjustStock(
    productId: string,
    type: 'in' | 'out',
    quantity: number,
    reason: string,
  ): Promise<InventoryMovement> {
    if (USING_MOCK) {
      await sleep(180);
      const p = mockState.products.find((x) => x.id === productId);
      if (!p) throw new ApiError('Producto no encontrado', 'NOT_FOUND');
      p.stock = type === 'in' ? p.stock + quantity : Math.max(0, p.stock - quantity);
      const mov: InventoryMovement = {
        id: shortId('M'), productId, productName: p.name, type, quantity,
        reason, createdAt: new Date().toISOString(), user: 'admin@vertice.co',
      };
      mockState.movements.unshift(mov);
      return mov;
    }
    return gasPost<InventoryMovement>('adjustStock', { productId, type, quantity, reason }, true);
  },

  async getMovements(): Promise<InventoryMovement[]> {
    if (USING_MOCK) return sleep(120).then(() => mockState.movements);
    return gasGet<InventoryMovement[]>('getMovements', { token: ADMIN_TOKEN });
  },

  // ---- Cupones (admin) ----
  async getCoupons(): Promise<Coupon[]> {
    if (USING_MOCK) return sleep(120).then(() => mockState.coupons);
    return gasGet<Coupon[]>('getCoupons', { token: ADMIN_TOKEN });
  },

  async saveCoupon(coupon: Coupon): Promise<Coupon> {
    if (USING_MOCK) {
      await sleep(180);
      const code = coupon.code.trim().toUpperCase();
      const next = { ...coupon, code };
      const idx = mockState.coupons.findIndex((c) => c.code === code);
      if (idx >= 0) mockState.coupons[idx] = next;
      else mockState.coupons.unshift(next);
      return next;
    }
    return gasPost<Coupon>('saveCoupon', { coupon }, true);
  },

  async deleteCoupon(code: string): Promise<{ code: string }> {
    if (USING_MOCK) {
      await sleep(140);
      mockState.coupons = mockState.coupons.filter((c) => c.code !== code);
      return { code };
    }
    return gasPost<{ code: string }>('deleteCoupon', { code }, true);
  },

  // ---- Contenido y configuración editables (admin) ----
  async saveContent(content: SiteContent): Promise<SiteContent> {
    if (USING_MOCK) {
      await sleep(200);
      mockState.content = content;
      return content;
    }
    return gasPost<SiteContent>('saveContent', { content }, true);
  },

  async saveConfig(config: StoreConfig): Promise<StoreConfig> {
    if (USING_MOCK) {
      await sleep(180);
      mockState.config = config;
      return config;
    }
    return gasPost<StoreConfig>('saveConfig', { config }, true);
  },
};

export { ApiError };
