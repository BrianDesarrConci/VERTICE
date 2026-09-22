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

// URL del Web App de Google Apps Script (backend real). Se puede sobreescribir
// con la variable de entorno VITE_GAS_URL; si no, usa esta por defecto.
const DEFAULT_GAS_URL =
  'https://script.google.com/macros/s/AKfycbyJPNONWQP5sSsTX6Gmxk3FOaocK90_CloLp2taIO_feaZNdVug91Bvt3BkfwFgOIsV/exec';

const GAS_URL = (import.meta.env.VITE_GAS_URL as string | undefined) || DEFAULT_GAS_URL;
const ADMIN_TOKEN = (import.meta.env.VITE_ADMIN_TOKEN as string | undefined) || 'vertice-dev-token';
const FORCE_MOCK = (import.meta.env.VITE_USE_MOCK as string | undefined) === 'true';

/** Usa mock SOLO si se fuerza por env. Por defecto: backend real. */
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

/** Info del backend para la página de diagnóstico. */
export const BACKEND = { url: GAS_URL, usingMock: USING_MOCK };

/**
 * Lee la respuesta de GAS de forma tolerante: si no es JSON (p. ej. GAS devolvió
 * una página HTML de login porque el Web App NO tiene acceso anónimo), lanza un
 * error claro y accionable en vez de un críptico "Unexpected token".
 */
async function readGas<T>(res: Response): Promise<T> {
  const text = await res.text();
  let json: ApiResult<T> | null = null;
  try {
    json = JSON.parse(text) as ApiResult<T>;
  } catch {
    const looksHtml = text.trim().startsWith('<') || /accounts\.google\.com|iniciar sesión|sign in/i.test(text);
    if (looksHtml) {
      throw new ApiError(
        'El Web App respondió HTML en vez de JSON. Casi siempre significa que el Deploy NO tiene acceso "Cualquier persona" (anónimo), o que hay que publicar una versión nueva.',
        'BACKEND_HTML',
      );
    }
    throw new ApiError('Respuesta no válida del backend (no es JSON). HTTP ' + res.status, 'BAD_RESPONSE');
  }
  if (!json.success) throw new ApiError(json.error, json.code);
  return json.data;
}

async function gasGet<T>(action: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(GAS_URL as string);
  url.searchParams.set('action', action);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  let res: Response;
  try {
    res = await fetch(url.toString(), { method: 'GET', redirect: 'follow' });
  } catch (e) {
    throw new ApiError(
      'No se pudo contactar el backend (posible bloqueo CORS o URL incorrecta): ' + (e instanceof Error ? e.message : String(e)),
      'NETWORK',
    );
  }
  return readGas<T>(res);
}

async function gasPost<T>(action: string, body: Record<string, unknown>, admin = false): Promise<T> {
  // text/plain evita el preflight CORS en GAS.
  const payload = { action, ...(admin ? { token: ADMIN_TOKEN } : {}), ...body };
  let res: Response;
  try {
    res = await fetch(GAS_URL as string, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    throw new ApiError(
      'No se pudo contactar el backend (posible bloqueo CORS o URL incorrecta): ' + (e instanceof Error ? e.message : String(e)),
      'NETWORK',
    );
  }
  return readGas<T>(res);
}

/** Prueba de conexión cruda (para la página de diagnóstico). */
export async function pingBackend(): Promise<{
  ok: boolean;
  status: number;
  contentType: string;
  snippet: string;
  parsedOk: boolean;
  error?: string;
}> {
  try {
    const url = new URL(GAS_URL as string);
    url.searchParams.set('action', 'getConfig');
    const res = await fetch(url.toString(), { method: 'GET', redirect: 'follow' });
    const text = await res.text();
    let parsedOk = false;
    try {
      const j = JSON.parse(text);
      parsedOk = !!j && typeof j.success === 'boolean';
    } catch {
      parsedOk = false;
    }
    return {
      ok: res.ok && parsedOk,
      status: res.status,
      contentType: res.headers.get('content-type') || '',
      snippet: text.slice(0, 240),
      parsedOk,
    };
  } catch (e) {
    return { ok: false, status: 0, contentType: '', snippet: '', parsedOk: false, error: e instanceof Error ? e.message : String(e) };
  }
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
    // Merge con defaults para tolerar backends antiguos sin los campos nuevos.
    const c = await gasGet<Partial<StoreConfig>>('getConfig');
    return { ...MOCK_CONFIG, ...c } as StoreConfig;
  },

  async getContent(): Promise<SiteContent> {
    if (USING_MOCK) return sleep(80).then(() => mockState.content);
    const c = await gasGet<Partial<SiteContent>>('getContent');
    return { ...MOCK_CONTENT, ...c } as SiteContent;
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
    try {
      return await gasPost<AdminSession>('adminLogin', { email, password });
    } catch (e) {
      // Respaldo: si el backend no responde (red/CORS/deploy), permite entrar
      // con las credenciales demo para poder usar el Diagnóstico y no quedar bloqueado.
      const isConnErr = e instanceof ApiError && (e.code === 'NETWORK' || e.code === 'BACKEND_HTML' || e.code === 'BAD_RESPONSE');
      if (isConnErr && email === 'admin@vertice.co' && password === 'vertice123') {
        return { token: ADMIN_TOKEN, email, role: 'owner' };
      }
      throw e;
    }
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
