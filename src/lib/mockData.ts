// ============================================================
// Datos mock: permiten que la tienda y el admin funcionen 100%
// en local sin backend desplegado (VITE_USE_MOCK=true o sin URL GAS).
// El backend real (Code.gs → seedData) replica esta estructura.
//
// CATÁLOGO: merchandising (camisetas, hoodies, libretas, totebags…).
// Reemplaza las imágenes por fotos reales de tus productos subiéndolas
// a /public y usando rutas como "/productos/camiseta.jpg".
// ============================================================
import type {
  Category,
  DashboardStats,
  InventoryMovement,
  Order,
  Product,
  Shipment,
  StoreConfig,
} from './types';

// Imágenes de muestra (Unsplash) con aspecto de merch/apparel.
const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

export const MOCK_CONFIG: StoreConfig = {
  currency: 'COP',
  currencySymbol: '$',
  taxRate: 0.19,
  freeShippingThreshold: 250000,
  flatShipping: 12000,
  storeName: 'VÉRTICE',
};

export const MOCK_CATEGORIES: Category[] = [
  { id: 'c1', name: 'Camisetas', slug: 'camisetas', image: img('photo-1521572163474-6864f9cf17ab'), order: 1 },
  { id: 'c2', name: 'Hoodies & Sacos', slug: 'hoodies', image: img('photo-1556821840-3a63f95609a7'), order: 2 },
  { id: 'c3', name: 'Libretas', slug: 'libretas', image: img('photo-1531346878377-a5be20888e57'), order: 3 },
  { id: 'c4', name: 'Totebags', slug: 'totebags', image: img('photo-1597484661643-2f5fef640dd1'), order: 4 },
  { id: 'c5', name: 'Gorras', slug: 'gorras', image: img('photo-1588850561407-ed78c282e89b'), order: 5 },
  { id: 'c6', name: 'Accesorios', slug: 'accesorios', image: img('photo-1626785774573-4b799315345d'), order: 6 },
];

// Tallas estándar reutilizables para prendas.
const sizes = (stocks: number[]) =>
  ['S', 'M', 'L', 'XL'].map((s, i) => ({
    id: `t-${s.toLowerCase()}`,
    name: `Talla ${s}`,
    priceDelta: s === 'XL' ? 5000 : 0,
    stock: stocks[i] ?? 5,
  }));

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    sku: 'CAM-OVR-IMP',
    name: 'Camiseta Oversize "Impacto"',
    slug: 'camiseta-oversize-impacto',
    description:
      'Camiseta oversize en algodón 100% peinado de 190 g. Estampado de alta durabilidad que no se agrieta ni se destiñe. Corte holgado, caída perfecta y una prenda pensada para durar.',
    price: 69000,
    cost: 32000,
    stock: 40,
    category: 'camisetas',
    brand: 'VÉRTICE',
    images: [img('photo-1576566588028-4147f3842f27'), img('photo-1521572163474-6864f9cf17ab')],
    variants: sizes([12, 14, 10, 4]),
    rating: 4.9,
    reviewsCount: 214,
    featured: true,
    isNew: true,
    active: true,
    createdAt: '2026-09-10T10:00:00.000Z',
  },
  {
    id: 'p2',
    sku: 'HOO-PRM-BRD',
    name: 'Hoodie Premium Bordado',
    slug: 'hoodie-premium-bordado',
    description:
      'Hoodie de felpa perchada 320 g con interior suave. Bordado premium en pecho, cordón grueso y bolsillo canguro. Abrigo real con acabado de marca.',
    price: 159000,
    cost: 78000,
    stock: 22,
    category: 'hoodies',
    brand: 'VÉRTICE',
    images: [img('photo-1556821840-3a63f95609a7'), img('photo-1620799140408-edc6dcb6d633')],
    variants: sizes([6, 8, 6, 2]),
    rating: 4.8,
    reviewsCount: 156,
    featured: true,
    isNew: true,
    active: true,
    createdAt: '2026-09-08T10:00:00.000Z',
  },
  {
    id: 'p3',
    sku: 'LIB-A5-TD',
    name: 'Libreta A5 Tapa Dura',
    slug: 'libreta-a5-tapa-dura',
    description:
      'Libreta A5 de tapa dura con 160 páginas de papel de 90 g, elástico de cierre y bolsillo interior. Estampado personalizado en portada. Ideal para regalo corporativo.',
    price: 38000,
    cost: 15000,
    stock: 80,
    category: 'libretas',
    brand: 'VÉRTICE',
    images: [img('photo-1531346878377-a5be20888e57'), img('photo-1517842645767-c639042777db')],
    variants: [
      { id: 'v-ray', name: 'Interior rayado', priceDelta: 0, stock: 30 },
      { id: 'v-pun', name: 'Interior de puntos', priceDelta: 0, stock: 28 },
      { id: 'v-lis', name: 'Interior liso', priceDelta: 0, stock: 22 },
    ],
    rating: 4.7,
    reviewsCount: 98,
    featured: true,
    isNew: false,
    active: true,
    createdAt: '2026-08-20T10:00:00.000Z',
  },
  {
    id: 'p4',
    sku: 'TOT-LON-EST',
    name: 'Totebag de Lona Estampada',
    slug: 'totebag-lona-estampada',
    description:
      'Bolsa de lona de algodón resistente con asas reforzadas y estampado a gran formato. Ecológica, lavable y perfecta para el día a día o para tu evento.',
    price: 45000,
    cost: 18000,
    stock: 60,
    category: 'totebags',
    brand: 'VÉRTICE',
    images: [img('photo-1597484661643-2f5fef640dd1'), img('photo-1544816155-12df9643f363')],
    variants: [],
    rating: 4.6,
    reviewsCount: 74,
    featured: false,
    isNew: true,
    active: true,
    createdAt: '2026-09-12T10:00:00.000Z',
  },
  {
    id: 'p5',
    sku: 'SAC-EST-CR',
    name: 'Saco Estampado Cuello Redondo',
    slug: 'saco-estampado-cuello-redondo',
    description:
      'Sudadera cuello redondo (crewneck) en mezcla de algodón 300 g. Estampado frontal de alta definición. Suave, cálido y con caída moderna.',
    price: 129000,
    cost: 60000,
    stock: 18,
    category: 'hoodies',
    brand: 'VÉRTICE',
    images: [img('photo-1509942774463-acf339cf87d5'), img('photo-1618354691373-d851c5c3a990')],
    variants: sizes([5, 6, 5, 2]),
    rating: 4.8,
    reviewsCount: 63,
    featured: true,
    isNew: false,
    active: true,
    createdAt: '2026-08-28T10:00:00.000Z',
  },
  {
    id: 'p6',
    sku: 'GOR-BRD-CL',
    name: 'Gorra Bordada Clásica',
    slug: 'gorra-bordada-clasica',
    description:
      'Gorra de 6 paneles con visera curva y bordado 3D frontal. Cierre trasero ajustable. Estructura firme y acabado profesional.',
    price: 55000,
    cost: 22000,
    stock: 35,
    category: 'gorras',
    brand: 'VÉRTICE',
    images: [img('photo-1588850561407-ed78c282e89b'), img('photo-1521369909029-2afed882baee')],
    variants: [],
    rating: 4.5,
    reviewsCount: 41,
    featured: false,
    isNew: false,
    active: true,
    createdAt: '2026-07-30T10:00:00.000Z',
  },
  {
    id: 'p7',
    sku: 'CAM-CLS-EST',
    name: 'Camiseta Clásica Estampada',
    slug: 'camiseta-clasica-estampada',
    description:
      'Camiseta corte regular en algodón 160 g, cómoda y versátil. Estampado serigráfico duradero. El básico que combina con todo.',
    price: 59000,
    cost: 26000,
    stock: 55,
    category: 'camisetas',
    brand: 'VÉRTICE',
    images: [img('photo-1583743814966-8936f5b7be1a'), img('photo-1503341504253-dff4815485f1')],
    variants: sizes([16, 18, 14, 7]),
    rating: 4.7,
    reviewsCount: 187,
    featured: false,
    isNew: false,
    active: true,
    createdAt: '2026-06-18T10:00:00.000Z',
  },
  {
    id: 'p8',
    sku: 'STK-SET-10',
    name: 'Set de Stickers (x10)',
    slug: 'set-stickers-x10',
    description:
      'Pack de 10 stickers de vinilo resistente al agua, corte de precisión y colores vibrantes. Perfectos para portátiles, botellas y cuadernos.',
    price: 25000,
    cost: 8000,
    stock: 120,
    category: 'accesorios',
    brand: 'VÉRTICE',
    images: [img('photo-1626785774573-4b799315345d'), img('photo-1600783245526-8b6f0f5b0f62')],
    variants: [],
    rating: 4.9,
    reviewsCount: 132,
    featured: false,
    isNew: true,
    active: true,
    createdAt: '2026-09-14T10:00:00.000Z',
  },
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'VTX-100238',
    createdAt: '2026-09-16T14:22:00.000Z',
    customer: { name: 'Laura Gómez', email: 'laura@example.com', phone: '3001234567', address: 'Cra 43A #7-50', city: 'Medellín' },
    items: [
      { productId: 'p2', variantId: 't-m', sku: 'HOO-PRM-BRD', name: 'Hoodie Premium Bordado · Talla M', qty: 1, unitPrice: 159000 },
      { productId: 'p1', variantId: 't-l', sku: 'CAM-OVR-IMP', name: 'Camiseta Oversize "Impacto" · Talla L', qty: 2, unitPrice: 69000 },
    ],
    subtotal: 297000, shipping: 0, tax: 56430, discount: 0, total: 353430,
    status: 'paid', paymentMethod: 'Tarjeta', couponCode: null,
  },
  {
    id: 'VTX-100237',
    createdAt: '2026-09-16T10:05:00.000Z',
    customer: { name: 'Carlos Ruiz', email: 'carlos@example.com', phone: '3109876543', address: 'Calle 100 #15-20', city: 'Bogotá' },
    items: [{ productId: 'p3', variantId: 'v-pun', sku: 'LIB-A5-TD', name: 'Libreta A5 Tapa Dura · Puntos', qty: 10, unitPrice: 38000 }],
    subtotal: 380000, shipping: 0, tax: 72200, discount: 38000, total: 414200,
    status: 'preparing', paymentMethod: 'PSE', couponCode: 'BIENVENIDA',
  },
  {
    id: 'VTX-100236',
    createdAt: '2026-09-15T18:40:00.000Z',
    customer: { name: 'Ana Torres', email: 'ana@example.com', phone: '3204445566', address: 'Av 6N #23-11', city: 'Cali' },
    items: [{ productId: 'p5', variantId: 't-m', sku: 'SAC-EST-CR', name: 'Saco Estampado · Talla M', qty: 1, unitPrice: 129000 }],
    subtotal: 129000, shipping: 12000, tax: 24510, discount: 0, total: 165510,
    status: 'shipped', paymentMethod: 'Tarjeta', couponCode: null,
  },
  {
    id: 'VTX-100235',
    createdAt: '2026-09-14T09:15:00.000Z',
    customer: { name: 'Diego Mora', email: 'diego@example.com', phone: '3011122334', address: 'Cra 7 #45-10', city: 'Bogotá' },
    items: [{ productId: 'p4', variantId: null, sku: 'TOT-LON-EST', name: 'Totebag de Lona Estampada', qty: 4, unitPrice: 45000 }],
    subtotal: 180000, shipping: 12000, tax: 34200, discount: 0, total: 226200,
    status: 'delivered', paymentMethod: 'Tarjeta', couponCode: null,
  },
  {
    id: 'VTX-100234',
    createdAt: '2026-09-17T08:00:00.000Z',
    customer: { name: 'Marta Ríos', email: 'marta@example.com', phone: '3155556677', address: 'Cll 10 #5-51', city: 'Medellín' },
    items: [{ productId: 'p8', variantId: null, sku: 'STK-SET-10', name: 'Set de Stickers (x10)', qty: 3, unitPrice: 25000 }],
    subtotal: 75000, shipping: 12000, tax: 14250, discount: 0, total: 101250,
    status: 'pending', paymentMethod: 'Contra entrega', couponCode: null,
  },
];

export const MOCK_SHIPMENTS: Shipment[] = [
  { id: 'S-001', orderId: 'VTX-100236', customerName: 'Ana Torres', tracking: 'CO9928374651', courier: 'Servientrega', status: 'in_transit', shippedAt: '2026-09-16T09:00:00.000Z', deliveredAt: null },
  { id: 'S-002', orderId: 'VTX-100235', customerName: 'Diego Mora', tracking: 'CO1122334455', courier: 'Coordinadora', status: 'delivered', shippedAt: '2026-09-14T12:00:00.000Z', deliveredAt: '2026-09-15T16:30:00.000Z' },
  { id: 'S-003', orderId: 'VTX-100237', customerName: 'Carlos Ruiz', tracking: '', courier: 'Servientrega', status: 'preparing', shippedAt: null, deliveredAt: null },
  { id: 'S-004', orderId: 'VTX-100234', customerName: 'Marta Ríos', tracking: '', courier: '', status: 'pending', shippedAt: null, deliveredAt: null },
];

export const MOCK_MOVEMENTS: InventoryMovement[] = [
  { id: 'M-001', productId: 'p1', productName: 'Camiseta Oversize "Impacto"', type: 'in', quantity: 50, reason: 'Producción lote #12', createdAt: '2026-09-01T10:00:00.000Z', user: 'admin@vertice.co' },
  { id: 'M-002', productId: 'p1', productName: 'Camiseta Oversize "Impacto"', type: 'out', quantity: 10, reason: 'Ventas', createdAt: '2026-09-15T10:00:00.000Z', user: 'sistema' },
  { id: 'M-003', productId: 'p2', productName: 'Hoodie Premium Bordado', type: 'out', quantity: 8, reason: 'Ventas', createdAt: '2026-09-16T10:00:00.000Z', user: 'sistema' },
];

/** Deriva KPIs del dashboard a partir de los pedidos mock. */
export function buildMockDashboard(orders: Order[], products: Product[]): DashboardStats {
  const now = new Date('2026-09-17T12:00:00.000Z');
  const isSameDay = (iso: string) => new Date(iso).toDateString() === now.toDateString();
  const daysAgo = (iso: string) => (now.getTime() - new Date(iso).getTime()) / 86400000;

  const paid = orders.filter((o) => o.status !== 'cancelled' && o.status !== 'pending');
  const salesToday = paid.filter((o) => isSameDay(o.createdAt)).reduce((s, o) => s + o.total, 0);
  const salesWeek = paid.filter((o) => daysAgo(o.createdAt) <= 7).reduce((s, o) => s + o.total, 0);
  const salesMonth = paid.filter((o) => daysAgo(o.createdAt) <= 30).reduce((s, o) => s + o.total, 0);
  const ordersToday = orders.filter((o) => isSameDay(o.createdAt)).length;
  const avgTicket = paid.length ? Math.round(salesMonth / paid.length) : 0;

  // Serie de ventas por día (últimos 7 días).
  const salesByDay = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(now.getTime() - (6 - i) * 86400000);
    const total = paid
      .filter((o) => new Date(o.createdAt).toDateString() === d.toDateString())
      .reduce((s, o) => s + o.total, 0);
    return { date: d.toISOString().slice(5, 10), total };
  });

  // Ventas por categoría.
  const catMap = new Map<string, number>();
  for (const o of paid) {
    for (const it of o.items) {
      const p = products.find((x) => x.id === it.productId);
      const cat = p?.category ?? 'otros';
      catMap.set(cat, (catMap.get(cat) ?? 0) + it.unitPrice * it.qty);
    }
  }
  const salesByCategory = [...catMap.entries()].map(([category, total]) => ({ category, total }));

  // Top productos por unidades.
  const prodMap = new Map<string, { units: number; revenue: number }>();
  for (const o of paid) {
    for (const it of o.items) {
      const cur = prodMap.get(it.name) ?? { units: 0, revenue: 0 };
      cur.units += it.qty;
      cur.revenue += it.unitPrice * it.qty;
      prodMap.set(it.name, cur);
    }
  }
  const topProducts = [...prodMap.entries()]
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.units - a.units)
    .slice(0, 5);

  return {
    salesToday,
    salesWeek,
    salesMonth,
    ordersToday,
    avgTicket,
    lowStockCount: products.filter((p) => p.stock <= 5).length,
    pendingShipments: MOCK_SHIPMENTS.filter((s) => s.status !== 'delivered').length,
    salesByDay,
    salesByCategory,
    topProducts,
  };
}
