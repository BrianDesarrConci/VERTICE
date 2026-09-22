// ============================================================
// Datos mock: permiten que la tienda y el admin funcionen sin
// backend desplegado. El backend real (Code.gs → seedData) replica
// esta estructura. Reemplaza imágenes por fotos reales en /public.
// ============================================================
import type {
  Category,
  Coupon,
  DashboardStats,
  InventoryMovement,
  Order,
  Product,
  ProductVariant,
  Review,
  Shipment,
  SiteContent,
  StoreConfig,
} from './types';

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

export const MOCK_CONFIG: StoreConfig = {
  currency: 'COP',
  currencySymbol: '$',
  taxRate: 0.19,
  freeShippingThreshold: 200000,
  flatShipping: 12000,
  storeName: 'VÉRTICE',
  primaryColor: '#7DD100',
  secondaryColor: '#BEEE00',
  logoUrl: '',
};

// Categorías = tipo de prenda (transversal a los departamentos).
export const MOCK_CATEGORIES: Category[] = [
  { id: 'c1', name: 'Camisetas', slug: 'camisetas', image: img('photo-1521572163474-6864f9cf17ab'), order: 1 },
  { id: 'c2', name: 'Hoodies & Sacos', slug: 'hoodies', image: img('photo-1556821840-3a63f95609a7'), order: 2 },
  { id: 'c3', name: 'Gorras', slug: 'gorras', image: img('photo-1588850561407-ed78c282e89b'), order: 3 },
  { id: 'c4', name: 'Libretas', slug: 'libretas', image: img('photo-1531346878377-a5be20888e57'), order: 4 },
  { id: 'c5', name: 'Totebags', slug: 'totebags', image: img('photo-1597484661643-2f5fef640dd1'), order: 5 },
  { id: 'c6', name: 'Accesorios', slug: 'accesorios', image: img('photo-1626785774573-4b799315345d'), order: 6 },
];

const adultSizes = (stocks: number[]): ProductVariant[] =>
  ['S', 'M', 'L', 'XL'].map((s, i) => ({
    id: `t-${s.toLowerCase()}`,
    name: `Talla ${s}`,
    priceDelta: s === 'XL' ? 5000 : 0,
    stock: stocks[i] ?? 5,
  }));

const kidSizes = (stocks: number[]): ProductVariant[] =>
  ['4', '6', '8', '10'].map((s, i) => ({
    id: `t-${s}`,
    name: `Talla ${s} años`,
    priceDelta: 0,
    stock: stocks[i] ?? 5,
  }));

export const MOCK_PRODUCTS: Product[] = [
  // ---------- DAMA ----------
  {
    id: 'p1', sku: 'DAM-CAM-CROP', name: 'Camiseta Crop Estampada', slug: 'camiseta-crop-estampada',
    description: 'Crop top en algodón peinado con estampado exclusivo VÉRTICE. Corte moderno y caída ligera.',
    price: 59900, compareAtPrice: 79900, cost: 26000, stock: 32, department: 'dama', category: 'camisetas', brand: 'VÉRTICE',
    images: [img('photo-1503342217505-b0a15ec3261c'), img('photo-1521572163474-6864f9cf17ab')],
    variants: adultSizes([10, 12, 8, 2]), rating: 4.9, reviewsCount: 214, featured: true, isNew: true, active: true, createdAt: '2026-09-15T10:00:00.000Z',
  },
  {
    id: 'p2', sku: 'DAM-HOO-OVR', name: 'Hoodie Oversize Dama', slug: 'hoodie-oversize-dama',
    description: 'Buzo oversize en felpa perchada 320 g, súper suave. Estampado frontal y capota amplia.',
    price: 149900, cost: 72000, stock: 20, department: 'dama', category: 'hoodies', brand: 'VÉRTICE',
    images: [img('photo-1620799140408-edc6dcb6d633'), img('photo-1556821840-3a63f95609a7')],
    variants: adultSizes([6, 8, 4, 2]), rating: 4.8, reviewsCount: 132, featured: true, isNew: true, active: true, createdAt: '2026-09-12T10:00:00.000Z',
  },
  {
    id: 'p3', sku: 'DAM-BLU-ML', name: 'Blusa Manga Larga', slug: 'blusa-manga-larga',
    description: 'Blusa de manga larga en tela suave y fresca. Versátil para el día a día.',
    price: 69900, cost: 30000, stock: 26, department: 'dama', category: 'camisetas', brand: 'VÉRTICE',
    images: [img('photo-1485462537746-965f33f7f6a7'), img('photo-1434389677669-e08b4cac3105')],
    variants: adultSizes([8, 10, 6, 2]), rating: 4.6, reviewsCount: 74, featured: false, isNew: false, active: true, createdAt: '2026-08-20T10:00:00.000Z',
  },
  // ---------- CABALLERO ----------
  {
    id: 'p4', sku: 'CAB-CAM-IMP', name: 'Camiseta Oversize "Impacto"', slug: 'camiseta-oversize-impacto',
    description: 'Algodón 100% peinado 190 g. Estampado de alta durabilidad. Corte oversize con caída perfecta.',
    price: 69900, cost: 32000, stock: 40, department: 'caballero', category: 'camisetas', brand: 'VÉRTICE',
    images: [img('photo-1576566588028-4147f3842f27'), img('photo-1583743814966-8936f5b7be1a')],
    variants: adultSizes([12, 14, 10, 4]), rating: 4.9, reviewsCount: 287, featured: true, isNew: true, active: true, createdAt: '2026-09-14T10:00:00.000Z',
  },
  {
    id: 'p5', sku: 'CAB-HOO-BRD', name: 'Hoodie Premium Bordado', slug: 'hoodie-premium-bordado',
    description: 'Felpa perchada 320 g, interior suave. Bordado premium en pecho y bolsillo canguro.',
    price: 159900, compareAtPrice: 189900, cost: 78000, stock: 22, department: 'caballero', category: 'hoodies', brand: 'VÉRTICE',
    images: [img('photo-1556821840-3a63f95609a7'), img('photo-1620799140408-edc6dcb6d633')],
    variants: adultSizes([6, 8, 6, 2]), rating: 4.8, reviewsCount: 156, featured: true, isNew: false, active: true, createdAt: '2026-09-08T10:00:00.000Z',
  },
  {
    id: 'p6', sku: 'CAB-SAC-CR', name: 'Saco Estampado Cuello Redondo', slug: 'saco-estampado-cuello-redondo',
    description: 'Crewneck en mezcla de algodón 300 g. Estampado frontal de alta definición.',
    price: 129900, cost: 60000, stock: 18, department: 'caballero', category: 'hoodies', brand: 'VÉRTICE',
    images: [img('photo-1509942774463-acf339cf87d5'), img('photo-1618354691373-d851c5c3a990')],
    variants: adultSizes([5, 6, 5, 2]), rating: 4.7, reviewsCount: 63, featured: false, isNew: false, active: true, createdAt: '2026-08-28T10:00:00.000Z',
  },
  // ---------- NIÑO ----------
  {
    id: 'p7', sku: 'NIN-CAM-EST', name: 'Camiseta Niño Estampada', slug: 'camiseta-nino-estampada',
    description: 'Camiseta infantil en algodón suave con estampado divertido y resistente a los lavados.',
    price: 44900, cost: 18000, stock: 30, department: 'nino', category: 'camisetas', brand: 'VÉRTICE',
    images: [img('photo-1519238263530-99bdd11df2ea'), img('photo-1503944583220-79d8926ad5e2')],
    variants: kidSizes([8, 10, 8, 4]), rating: 4.8, reviewsCount: 52, featured: true, isNew: true, active: true, createdAt: '2026-09-10T10:00:00.000Z',
  },
  {
    id: 'p8', sku: 'NIN-HOO-EST', name: 'Hoodie Niño', slug: 'hoodie-nino',
    description: 'Buzo con capota para niños, felpa cálida y estampado frontal. Cómodo para jugar.',
    price: 99900, cost: 44000, stock: 16, department: 'nino', category: 'hoodies', brand: 'VÉRTICE',
    images: [img('photo-1522771930-78848d9293e8'), img('photo-1503944583220-79d8926ad5e2')],
    variants: kidSizes([4, 6, 4, 2]), rating: 4.7, reviewsCount: 38, featured: false, isNew: true, active: true, createdAt: '2026-09-11T10:00:00.000Z',
  },
  // ---------- UNISEX / ACCESORIOS ----------
  {
    id: 'p9', sku: 'UNI-GOR-BRD', name: 'Gorra Bordada Clásica', slug: 'gorra-bordada-clasica',
    description: 'Gorra de 6 paneles, visera curva, bordado 3D y cierre ajustable.',
    price: 55000, cost: 22000, stock: 35, department: 'unisex', category: 'gorras', brand: 'VÉRTICE',
    images: [img('photo-1588850561407-ed78c282e89b'), img('photo-1521369909029-2afed882baee')],
    variants: [], rating: 4.5, reviewsCount: 41, featured: false, isNew: false, active: true, createdAt: '2026-07-30T10:00:00.000Z',
  },
  {
    id: 'p10', sku: 'UNI-TOT-LON', name: 'Totebag de Lona Estampada', slug: 'totebag-lona-estampada',
    description: 'Lona de algodón resistente, asas reforzadas y estampado a gran formato. Ecológica y lavable.',
    price: 45000, cost: 18000, stock: 60, department: 'unisex', category: 'totebags', brand: 'VÉRTICE',
    images: [img('photo-1597484661643-2f5fef640dd1'), img('photo-1544816155-12df9643f363')],
    variants: [], rating: 4.6, reviewsCount: 74, featured: false, isNew: true, active: true, createdAt: '2026-09-12T10:00:00.000Z',
  },
  {
    id: 'p11', sku: 'UNI-LIB-A5', name: 'Libreta A5 Tapa Dura', slug: 'libreta-a5-tapa-dura',
    description: 'Tapa dura, 160 páginas de 90 g, elástico y bolsillo interior. Portada personalizada.',
    price: 38000, cost: 15000, stock: 80, department: 'unisex', category: 'libretas', brand: 'VÉRTICE',
    images: [img('photo-1531346878377-a5be20888e57'), img('photo-1517842645767-c639042777db')],
    variants: [
      { id: 'v-ray', name: 'Interior rayado', priceDelta: 0, stock: 30 },
      { id: 'v-pun', name: 'Interior de puntos', priceDelta: 0, stock: 28 },
      { id: 'v-lis', name: 'Interior liso', priceDelta: 0, stock: 22 },
    ], rating: 4.7, reviewsCount: 98, featured: false, isNew: false, active: true, createdAt: '2026-08-01T10:00:00.000Z',
  },
  {
    id: 'p12', sku: 'UNI-STK-10', name: 'Set de Stickers (x10)', slug: 'set-stickers-x10',
    description: 'Pack de 10 stickers de vinilo resistente al agua, corte de precisión y colores vibrantes.',
    price: 25000, cost: 8000, stock: 120, department: 'unisex', category: 'accesorios', brand: 'VÉRTICE',
    images: [img('photo-1626785774573-4b799315345d'), img('photo-1600783245526-8b6f0f5b0f62')],
    variants: [], rating: 4.9, reviewsCount: 132, featured: false, isNew: true, active: true, createdAt: '2026-09-14T10:00:00.000Z',
  },
];

export const MOCK_COUPONS: Coupon[] = [
  { code: 'BIENVENIDA', type: 'percent', value: 10, active: true, minPurchase: 0, description: 'Primera compra' },
  { code: 'VERTICE5', type: 'percent', value: 5, active: true, minPurchase: 0, description: 'Descuento general' },
  { code: 'ENVIOGRATIS', type: 'fixed', value: 12000, active: true, minPurchase: 80000, description: 'Cubre el envío' },
];

export const MOCK_REVIEWS: Review[] = [
  { id: 'r1', name: 'Valentina M.', rating: 5, text: '¡La calidad del estampado es brutal! Lavé la camiseta mil veces y sigue intacta. Mi marca favorita.', product: 'Camiseta Crop Estampada', date: '2026-09-14T10:00:00.000Z' },
  { id: 'r2', name: 'Andrés P.', rating: 5, text: 'El hoodie es una nave, súper abrigado y el bordado se ve premium. Llegó en 2 días.', product: 'Hoodie Premium Bordado', date: '2026-09-12T10:00:00.000Z' },
  { id: 'r3', name: 'Camila R.', rating: 5, text: 'Le compré la camiseta a mi hijo y le encantó. Excelente atención por WhatsApp.', product: 'Camiseta Niño Estampada', date: '2026-09-10T10:00:00.000Z' },
  { id: 'r4', name: 'Julián G.', rating: 4, text: 'Muy buena tela y horma. El empaque llegó un poco golpeado pero el producto perfecto.', product: 'Saco Estampado', date: '2026-09-08T10:00:00.000Z' },
  { id: 'r5', name: 'Daniela S.', rating: 5, text: 'Pedí totebags para mi evento y quedaron espectaculares. Cumplieron con la fecha.', product: 'Totebag de Lona', date: '2026-09-05T10:00:00.000Z' },
  { id: 'r6', name: 'Mateo L.', rating: 5, text: 'Los colores del estampado son vivos y no se agrietan. Recomendadísimo.', product: 'Camiseta Oversize', date: '2026-09-02T10:00:00.000Z' },
];

export const MOCK_CONTENT: SiteContent = {
  heroEyebrow: 'Nueva colección 2026',
  heroTitle: 'Viste tu',
  heroHighlight: 'impacto',
  heroSubtitle: 'Moda con estampados premium para dama, caballero y niño. Diseño que deja huella, hecho para durar.',
  heroImage: img('photo-1441984904996-e0b6ba687e04'),
  announcement: '🚚 Envío GRATIS en compras sobre $200.000 · 🎁 Usa BIENVENIDA y llévate 10% OFF · Nueva colección disponible',
  promoTitle: '¿Merch para tu empresa o evento?',
  promoText: 'Estampamos tu marca por volumen con precios especiales y entrega a tiempo. Cotización en menos de 24h.',
  aboutTitle: 'Somos VÉRTICE',
  aboutText: 'Nacimos para que lleves puesto lo que te representa. Estampamos camisetas, hoodies, libretas y más con calidad premium, procesos responsables y un equipo que ama lo que hace. Cada prenda es diseño, detalle y durabilidad.',
  aboutImage: img('photo-1489987707025-afc232f7ea0f'),
};

export const MOCK_ORDERS: Order[] = [
  {
    id: 'VTX-100238', createdAt: '2026-09-20T14:22:00.000Z',
    customer: { name: 'Laura Gómez', email: 'laura@example.com', phone: '3001234567', address: 'Cra 43A #7-50', city: 'Medellín' },
    items: [
      { productId: 'p5', variantId: 't-m', sku: 'CAB-HOO-BRD', name: 'Hoodie Premium Bordado · Talla M', qty: 1, unitPrice: 159900 },
      { productId: 'p1', variantId: 't-m', sku: 'DAM-CAM-CROP', name: 'Camiseta Crop Estampada · Talla M', qty: 2, unitPrice: 59900 },
    ],
    subtotal: 279700, shipping: 0, tax: 53143, discount: 0, total: 332843, status: 'paid', paymentMethod: 'Tarjeta', couponCode: null,
  },
  {
    id: 'VTX-100237', createdAt: '2026-09-20T10:05:00.000Z',
    customer: { name: 'Carlos Ruiz', email: 'carlos@example.com', phone: '3109876543', address: 'Calle 100 #15-20', city: 'Bogotá' },
    items: [{ productId: 'p4', variantId: 't-l', sku: 'CAB-CAM-IMP', name: 'Camiseta Oversize "Impacto" · Talla L', qty: 3, unitPrice: 69900 }],
    subtotal: 209700, shipping: 0, tax: 39843, discount: 20970, total: 228573, status: 'preparing', paymentMethod: 'PSE', couponCode: 'BIENVENIDA',
  },
  {
    id: 'VTX-100236', createdAt: '2026-09-19T18:40:00.000Z',
    customer: { name: 'Ana Torres', email: 'ana@example.com', phone: '3204445566', address: 'Av 6N #23-11', city: 'Cali' },
    items: [{ productId: 'p2', variantId: 't-s', sku: 'DAM-HOO-OVR', name: 'Hoodie Oversize Dama · Talla S', qty: 1, unitPrice: 149900 }],
    subtotal: 149900, shipping: 12000, tax: 28481, discount: 0, total: 190381, status: 'shipped', paymentMethod: 'Tarjeta', couponCode: null,
  },
  {
    id: 'VTX-100235', createdAt: '2026-09-18T09:15:00.000Z',
    customer: { name: 'Diego Mora', email: 'diego@example.com', phone: '3011122334', address: 'Cra 7 #45-10', city: 'Bogotá' },
    items: [{ productId: 'p7', variantId: 't-8', sku: 'NIN-CAM-EST', name: 'Camiseta Niño · Talla 8', qty: 4, unitPrice: 44900 }],
    subtotal: 179600, shipping: 12000, tax: 34124, discount: 0, total: 225724, status: 'delivered', paymentMethod: 'Tarjeta', couponCode: null,
  },
  {
    id: 'VTX-100234', createdAt: '2026-09-21T08:00:00.000Z',
    customer: { name: 'Marta Ríos', email: 'marta@example.com', phone: '3155556677', address: 'Cll 10 #5-51', city: 'Medellín' },
    items: [{ productId: 'p12', variantId: null, sku: 'UNI-STK-10', name: 'Set de Stickers (x10)', qty: 3, unitPrice: 25000 }],
    subtotal: 75000, shipping: 12000, tax: 14250, discount: 0, total: 101250, status: 'pending', paymentMethod: 'Contra entrega', couponCode: null,
  },
];

export const MOCK_SHIPMENTS: Shipment[] = [
  { id: 'S-001', orderId: 'VTX-100236', customerName: 'Ana Torres', tracking: 'CO9928374651', courier: 'Servientrega', status: 'in_transit', shippedAt: '2026-09-20T09:00:00.000Z', deliveredAt: null },
  { id: 'S-002', orderId: 'VTX-100235', customerName: 'Diego Mora', tracking: 'CO1122334455', courier: 'Coordinadora', status: 'delivered', shippedAt: '2026-09-18T12:00:00.000Z', deliveredAt: '2026-09-19T16:30:00.000Z' },
  { id: 'S-003', orderId: 'VTX-100237', customerName: 'Carlos Ruiz', tracking: '', courier: 'Servientrega', status: 'preparing', shippedAt: null, deliveredAt: null },
  { id: 'S-004', orderId: 'VTX-100234', customerName: 'Marta Ríos', tracking: '', courier: '', status: 'pending', shippedAt: null, deliveredAt: null },
];

export const MOCK_MOVEMENTS: InventoryMovement[] = [
  { id: 'M-001', productId: 'p4', productName: 'Camiseta Oversize "Impacto"', type: 'in', quantity: 50, reason: 'Producción lote #12', createdAt: '2026-09-01T10:00:00.000Z', user: 'admin@vertice.co' },
  { id: 'M-002', productId: 'p4', productName: 'Camiseta Oversize "Impacto"', type: 'out', quantity: 10, reason: 'Ventas', createdAt: '2026-09-15T10:00:00.000Z', user: 'sistema' },
  { id: 'M-003', productId: 'p5', productName: 'Hoodie Premium Bordado', type: 'out', quantity: 8, reason: 'Ventas', createdAt: '2026-09-16T10:00:00.000Z', user: 'sistema' },
];

/** Deriva KPIs del dashboard a partir de los pedidos mock. */
export function buildMockDashboard(orders: Order[], products: Product[]): DashboardStats {
  const now = new Date('2026-09-21T12:00:00.000Z');
  const isSameDay = (iso: string) => new Date(iso).toDateString() === now.toDateString();
  const daysAgo = (iso: string) => (now.getTime() - new Date(iso).getTime()) / 86400000;

  const paid = orders.filter((o) => o.status !== 'cancelled' && o.status !== 'pending');
  const salesToday = paid.filter((o) => isSameDay(o.createdAt)).reduce((s, o) => s + o.total, 0);
  const salesWeek = paid.filter((o) => daysAgo(o.createdAt) <= 7).reduce((s, o) => s + o.total, 0);
  const salesMonth = paid.filter((o) => daysAgo(o.createdAt) <= 30).reduce((s, o) => s + o.total, 0);
  const ordersToday = orders.filter((o) => isSameDay(o.createdAt)).length;
  const avgTicket = paid.length ? Math.round(salesMonth / paid.length) : 0;

  const salesByDay = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(now.getTime() - (6 - i) * 86400000);
    const total = paid
      .filter((o) => new Date(o.createdAt).toDateString() === d.toDateString())
      .reduce((s, o) => s + o.total, 0);
    return { date: d.toISOString().slice(5, 10), total };
  });

  const catMap = new Map<string, number>();
  for (const o of paid) {
    for (const it of o.items) {
      const p = products.find((x) => x.id === it.productId);
      const cat = p?.category ?? 'otros';
      catMap.set(cat, (catMap.get(cat) ?? 0) + it.unitPrice * it.qty);
    }
  }
  const salesByCategory = [...catMap.entries()].map(([category, total]) => ({ category, total }));

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
    salesToday, salesWeek, salesMonth, ordersToday, avgTicket,
    lowStockCount: products.filter((p) => p.stock <= 5).length,
    pendingShipments: MOCK_SHIPMENTS.filter((s) => s.status !== 'delivered').length,
    salesByDay, salesByCategory, topProducts,
  };
}
