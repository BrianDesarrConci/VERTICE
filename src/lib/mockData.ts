// ============================================================
// Datos mock: permiten que la tienda y el admin funcionen 100%
// en local sin backend desplegado (VITE_USE_MOCK=true o sin URL GAS).
// El backend real (Code.gs → seedData) replica esta estructura.
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

// Imágenes remotas neutrales (Unsplash) con aspecto de producto tech.
const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

export const MOCK_CONFIG: StoreConfig = {
  currency: 'COP',
  currencySymbol: '$',
  taxRate: 0.19,
  freeShippingThreshold: 3000000,
  flatShipping: 25000,
  storeName: 'VÉRTICE',
};

export const MOCK_CATEGORIES: Category[] = [
  { id: 'c1', name: 'iPhone', slug: 'iphone', image: img('photo-1592286927505-1def25115558'), order: 1 },
  { id: 'c2', name: 'Mac', slug: 'mac', image: img('photo-1517336714731-489689fd1ca8'), order: 2 },
  { id: 'c3', name: 'iPad', slug: 'ipad', image: img('photo-1544244015-0df4b3ffc6b0'), order: 3 },
  { id: 'c4', name: 'Watch', slug: 'watch', image: img('photo-1546868871-7041f2a55e12'), order: 4 },
  { id: 'c5', name: 'Audio', slug: 'audio', image: img('photo-1606220945770-b5b6c2c55bf1'), order: 5 },
  { id: 'c6', name: 'Accesorios', slug: 'accesorios', image: img('photo-1583394838336-acd977736f90'), order: 6 },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    sku: 'IP15PM-256',
    name: 'iPhone 15 Pro Max',
    slug: 'iphone-15-pro-max',
    description:
      'Titanio. Chip A17 Pro. Sistema de cámaras Pro con teleobjetivo 5x. La experiencia iPhone más avanzada, con un diseño en titanio de grado aeroespacial y el botón de Acción personalizable.',
    price: 6499000,
    cost: 4800000,
    stock: 12,
    category: 'iphone',
    brand: 'Apple',
    images: [img('photo-1695048133142-1a20484d2569'), img('photo-1592286927505-1def25115558')],
    variants: [
      { id: 'v1', name: '256 GB — Titanio Natural', priceDelta: 0, stock: 6, sku: 'IP15PM-256-NAT' },
      { id: 'v2', name: '512 GB — Titanio Azul', priceDelta: 900000, stock: 4, sku: 'IP15PM-512-BLU' },
      { id: 'v3', name: '1 TB — Titanio Negro', priceDelta: 1800000, stock: 2, sku: 'IP15PM-1TB-BLK' },
    ],
    rating: 4.9,
    reviewsCount: 1284,
    featured: true,
    isNew: true,
    active: true,
    createdAt: '2026-09-01T10:00:00.000Z',
  },
  {
    id: 'p2',
    sku: 'MBP14-M3',
    name: 'MacBook Pro 14"',
    slug: 'macbook-pro-14',
    description:
      'Chip M3 Pro. Pantalla Liquid Retina XDR. Hasta 18 horas de batería. Potencia profesional para edición de video, código y creación 3D, en un chasis de aluminio reciclado.',
    price: 9999000,
    cost: 7600000,
    stock: 7,
    category: 'mac',
    brand: 'Apple',
    images: [img('photo-1517336714731-489689fd1ca8'), img('photo-1541807084-5c52b6b3adef')],
    variants: [
      { id: 'v4', name: 'M3 Pro · 18 GB · 512 GB', priceDelta: 0, stock: 4 },
      { id: 'v5', name: 'M3 Pro · 36 GB · 1 TB', priceDelta: 2400000, stock: 3 },
    ],
    rating: 4.8,
    reviewsCount: 642,
    featured: true,
    isNew: true,
    active: true,
    createdAt: '2026-08-20T10:00:00.000Z',
  },
  {
    id: 'p3',
    sku: 'APP-2GEN',
    name: 'AirPods Pro (2.ª gen)',
    slug: 'airpods-pro-2',
    description:
      'Cancelación activa de ruido hasta 2x mejor. Audio espacial personalizado. Estuche con USB-C, altavoz y correa. El sonido inmersivo que se adapta a ti.',
    price: 1099000,
    cost: 720000,
    stock: 34,
    category: 'audio',
    brand: 'Apple',
    images: [img('photo-1606220945770-b5b6c2c55bf1'), img('photo-1600294037681-c80b4cb5b434')],
    variants: [],
    rating: 4.7,
    reviewsCount: 2210,
    featured: true,
    isNew: false,
    active: true,
    createdAt: '2026-07-15T10:00:00.000Z',
  },
  {
    id: 'p4',
    sku: 'IPADAIR-M2',
    name: 'iPad Air 11"',
    slug: 'ipad-air-11',
    description:
      'Chip M2. Compatible con Apple Pencil Pro. Pantalla Liquid Retina de 11". Ligero, versátil y perfecto para crear, estudiar y trabajar en cualquier lugar.',
    price: 3299000,
    cost: 2400000,
    stock: 18,
    category: 'ipad',
    brand: 'Apple',
    images: [img('photo-1544244015-0df4b3ffc6b0'), img('photo-1561154464-82e9adf32764')],
    variants: [
      { id: 'v6', name: '128 GB · WiFi', priceDelta: 0, stock: 10 },
      { id: 'v7', name: '256 GB · WiFi', priceDelta: 500000, stock: 8 },
    ],
    rating: 4.6,
    reviewsCount: 431,
    featured: false,
    isNew: true,
    active: true,
    createdAt: '2026-09-05T10:00:00.000Z',
  },
  {
    id: 'p5',
    sku: 'AWU2-49',
    name: 'Apple Watch Ultra 2',
    slug: 'apple-watch-ultra-2',
    description:
      'Caja de titanio de 49 mm. GPS de doble frecuencia. Hasta 36 h de batería. El reloj más resistente y capaz, diseñado para la aventura y el deporte extremo.',
    price: 4199000,
    cost: 3100000,
    stock: 9,
    category: 'watch',
    brand: 'Apple',
    images: [img('photo-1546868871-7041f2a55e12'), img('photo-1523275335684-37898b6baf30')],
    variants: [],
    rating: 4.8,
    reviewsCount: 358,
    featured: true,
    isNew: false,
    active: true,
    createdAt: '2026-06-30T10:00:00.000Z',
  },
  {
    id: 'p6',
    sku: 'MGKB-USB',
    name: 'Magic Keyboard',
    slug: 'magic-keyboard',
    description:
      'Teclado inalámbrico con Touch ID, recargable vía USB-C. Escritura precisa y silenciosa, con una autonomía de aproximadamente un mes.',
    price: 649000,
    cost: 410000,
    stock: 3,
    category: 'accesorios',
    brand: 'Apple',
    images: [img('photo-1587829741301-dc798b83add3'), img('photo-1618384887929-16ec33fab9ef')],
    variants: [],
    rating: 4.5,
    reviewsCount: 189,
    featured: false,
    isNew: false,
    active: true,
    createdAt: '2026-05-10T10:00:00.000Z',
  },
  {
    id: 'p7',
    sku: 'IP15-128',
    name: 'iPhone 15',
    slug: 'iphone-15',
    description:
      'Dynamic Island. Cámara principal de 48 MP. USB-C. Chip A16 Bionic. Colores vibrantes con acabado en vidrio infundido de color.',
    price: 4299000,
    cost: 3200000,
    stock: 21,
    category: 'iphone',
    brand: 'Apple',
    images: [img('photo-1592286927505-1def25115558'), img('photo-1695048133142-1a20484d2569')],
    variants: [
      { id: 'v8', name: '128 GB — Rosa', priceDelta: 0, stock: 11 },
      { id: 'v9', name: '256 GB — Azul', priceDelta: 600000, stock: 10 },
    ],
    rating: 4.7,
    reviewsCount: 903,
    featured: false,
    isNew: false,
    active: true,
    createdAt: '2026-04-18T10:00:00.000Z',
  },
  {
    id: 'p8',
    sku: 'MBAIR-M3',
    name: 'MacBook Air 13"',
    slug: 'macbook-air-13',
    description:
      'Chip M3. Ultraligero (1.24 kg). Pantalla Liquid Retina. Silencioso, sin ventilador, con hasta 18 horas de batería para todo el día.',
    price: 5499000,
    cost: 4100000,
    stock: 14,
    category: 'mac',
    brand: 'Apple',
    images: [img('photo-1541807084-5c52b6b3adef'), img('photo-1611186871348-b1ce696e52c9')],
    variants: [],
    rating: 4.8,
    reviewsCount: 521,
    featured: false,
    isNew: true,
    active: true,
    createdAt: '2026-09-10T10:00:00.000Z',
  },
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'VTX-100238',
    createdAt: '2026-09-16T14:22:00.000Z',
    customer: { name: 'Laura Gómez', email: 'laura@example.com', phone: '3001234567', address: 'Cra 43A #7-50', city: 'Medellín' },
    items: [
      { productId: 'p1', variantId: 'v2', sku: 'IP15PM-512-BLU', name: 'iPhone 15 Pro Max', qty: 1, unitPrice: 7399000 },
      { productId: 'p3', variantId: null, sku: 'APP-2GEN', name: 'AirPods Pro (2.ª gen)', qty: 1, unitPrice: 1099000 },
    ],
    subtotal: 8498000, shipping: 0, tax: 1614620, discount: 0, total: 10112620,
    status: 'paid', paymentMethod: 'Tarjeta', couponCode: null,
  },
  {
    id: 'VTX-100237',
    createdAt: '2026-09-16T10:05:00.000Z',
    customer: { name: 'Carlos Ruiz', email: 'carlos@example.com', phone: '3109876543', address: 'Calle 100 #15-20', city: 'Bogotá' },
    items: [{ productId: 'p2', variantId: 'v4', sku: 'MBP14-M3', name: 'MacBook Pro 14"', qty: 1, unitPrice: 9999000 }],
    subtotal: 9999000, shipping: 0, tax: 1899810, discount: 500000, total: 11398810,
    status: 'preparing', paymentMethod: 'PSE', couponCode: 'BIENVENIDA',
  },
  {
    id: 'VTX-100236',
    createdAt: '2026-09-15T18:40:00.000Z',
    customer: { name: 'Ana Torres', email: 'ana@example.com', phone: '3204445566', address: 'Av 6N #23-11', city: 'Cali' },
    items: [{ productId: 'p5', variantId: null, sku: 'AWU2-49', name: 'Apple Watch Ultra 2', qty: 1, unitPrice: 4199000 }],
    subtotal: 4199000, shipping: 25000, tax: 797810, discount: 0, total: 5021810,
    status: 'shipped', paymentMethod: 'Tarjeta', couponCode: null,
  },
  {
    id: 'VTX-100235',
    createdAt: '2026-09-14T09:15:00.000Z',
    customer: { name: 'Diego Mora', email: 'diego@example.com', phone: '3011122334', address: 'Cra 7 #45-10', city: 'Bogotá' },
    items: [{ productId: 'p7', variantId: 'v8', sku: 'IP15-128', name: 'iPhone 15', qty: 2, unitPrice: 4299000 }],
    subtotal: 8598000, shipping: 0, tax: 1633620, discount: 0, total: 10231620,
    status: 'delivered', paymentMethod: 'Tarjeta', couponCode: null,
  },
  {
    id: 'VTX-100234',
    createdAt: '2026-09-17T08:00:00.000Z',
    customer: { name: 'Marta Ríos', email: 'marta@example.com', phone: '3155556677', address: 'Cll 10 #5-51', city: 'Medellín' },
    items: [{ productId: 'p4', variantId: 'v6', sku: 'IPADAIR-M2', name: 'iPad Air 11"', qty: 1, unitPrice: 3299000 }],
    subtotal: 3299000, shipping: 0, tax: 626810, discount: 0, total: 3925810,
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
  { id: 'M-001', productId: 'p1', productName: 'iPhone 15 Pro Max', type: 'in', quantity: 20, reason: 'Compra proveedor', createdAt: '2026-09-01T10:00:00.000Z', user: 'admin@vertice.co' },
  { id: 'M-002', productId: 'p1', productName: 'iPhone 15 Pro Max', type: 'out', quantity: 8, reason: 'Ventas', createdAt: '2026-09-15T10:00:00.000Z', user: 'sistema' },
  { id: 'M-003', productId: 'p6', productName: 'Magic Keyboard', type: 'out', quantity: 7, reason: 'Ventas', createdAt: '2026-09-16T10:00:00.000Z', user: 'sistema' },
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
