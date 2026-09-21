/**
 * ============================================================================
 * VÉRTICE — Backend Google Apps Script (Web App)
 * ----------------------------------------------------------------------------
 * Base de datos: Google Sheets (una hoja por entidad).
 * Publicación: Implementar → Nueva implementación → Aplicación web
 *              · Ejecutar como: Yo · Quién tiene acceso: Cualquier persona
 *
 * Respuesta estandarizada:
 *   { success: true,  data: <any>, message?: <string> }
 *   { success: false, error: <string>, code?: <string> }
 *
 * PRIMER USO:
 *   1) Ejecuta setup()     → crea todas las hojas con cabeceras.
 *   2) Ejecuta seedData()  → carga catálogo, cupones, reseñas y admin demo.
 *   3) Publica como Web App y pon la URL /exec en VITE_GAS_URL del frontend.
 * ============================================================================
 */

var ADMIN_TOKEN = 'vertice-dev-token'; // Debe coincidir con VITE_ADMIN_TOKEN del frontend.
var TAX_RATE = 0.19;
var FREE_SHIPPING_THRESHOLD = 200000;
var FLAT_SHIPPING = 12000;

var SHEETS = {
  PRODUCTS: 'Productos',
  CATEGORIES: 'Categorias',
  ORDERS: 'Pedidos',
  CUSTOMERS: 'Clientes',
  INVENTORY: 'Inventario_Mov',
  SHIPMENTS: 'Despachos',
  ADMINS: 'Usuarios_Admin',
  CONFIG: 'Configuracion',
  COUPONS: 'Cupones',
  REVIEWS: 'Resenas',
};

var HEADERS = {
  Productos: ['id', 'sku', 'name', 'slug', 'description', 'price', 'compareAtPrice', 'cost', 'stock', 'department', 'category', 'brand', 'images', 'variants', 'rating', 'reviewsCount', 'featured', 'isNew', 'active', 'createdAt'],
  Categorias: ['id', 'name', 'slug', 'image', 'order'],
  Pedidos: ['id', 'createdAt', 'customer', 'items', 'subtotal', 'shipping', 'tax', 'discount', 'total', 'status', 'paymentMethod', 'couponCode'],
  Clientes: ['id', 'name', 'email', 'phone', 'address', 'city', 'createdAt'],
  Inventario_Mov: ['id', 'productId', 'productName', 'type', 'quantity', 'reason', 'createdAt', 'user'],
  Despachos: ['id', 'orderId', 'customerName', 'tracking', 'courier', 'status', 'shippedAt', 'deliveredAt'],
  Usuarios_Admin: ['id', 'email', 'role', 'passwordHash', 'lastAccess'],
  Configuracion: ['key', 'value'],
  Cupones: ['code', 'type', 'value', 'active', 'minPurchase', 'description'],
  Resenas: ['id', 'name', 'rating', 'text', 'product', 'date'],
};

// ============================================================================
// ROUTERS
// ============================================================================

function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) || '';
    var p = (e && e.parameter) || {};
    switch (action) {
      case 'getConfig':        return ok(getConfig_());
      case 'getContent':       return ok(getContent_());
      case 'getCategories':    return ok(readAll_(SHEETS.CATEGORIES));
      case 'getReviews':       return ok(readAll_(SHEETS.REVIEWS).reverse());
      case 'getProducts':      return ok(getProducts_(p.category, p.department, p.search));
      case 'getProduct':       return ok(getProductBySlug_(p.slug));
      case 'getDashboard':     return requireAdmin_(p.token, function () { return ok(getDashboard_()); });
      case 'getOrders':        return requireAdmin_(p.token, function () { return ok(getOrders_(p.status)); });
      case 'getShipments':     return requireAdmin_(p.token, function () { return ok(readAll_(SHEETS.SHIPMENTS)); });
      case 'getProductsAdmin': return requireAdmin_(p.token, function () { return ok(readAll_(SHEETS.PRODUCTS)); });
      case 'getMovements':     return requireAdmin_(p.token, function () { return ok(readAll_(SHEETS.INVENTORY).reverse()); });
      case 'getCoupons':       return requireAdmin_(p.token, function () { return ok(readAll_(SHEETS.COUPONS)); });
      default:                 return fail('Acción GET no reconocida: ' + action, 'UNKNOWN_ACTION');
    }
  } catch (err) {
    return fail(String(err && err.message ? err.message : err), 'SERVER_ERROR');
  }
}

function doPost(e) {
  try {
    var body = {};
    if (e && e.postData && e.postData.contents) body = JSON.parse(e.postData.contents);
    var action = body.action || '';
    switch (action) {
      case 'createOrder':        return ok(createOrder_(body));
      case 'validateCoupon':     return ok(validateCoupon_(body.code, Number(body.subtotal)));
      case 'adminLogin':         return ok(adminLogin_(body.email, body.password));
      case 'updateOrderStatus':  return requireAdmin_(body.token, function () { return ok(updateOrderStatus_(body.orderId, body.status)); });
      case 'updateShipment':     return requireAdmin_(body.token, function () { return ok(updateShipment_(body)); });
      case 'saveProduct':        return requireAdmin_(body.token, function () { return ok(saveProduct_(body.product)); });
      case 'deleteProduct':      return requireAdmin_(body.token, function () { return ok(deleteProduct_(body.id)); });
      case 'adjustStock':        return requireAdmin_(body.token, function () { return ok(adjustStock_(body.productId, body.type, Number(body.quantity), body.reason)); });
      case 'saveCoupon':         return requireAdmin_(body.token, function () { return ok(saveCoupon_(body.coupon)); });
      case 'deleteCoupon':       return requireAdmin_(body.token, function () { return ok(deleteCoupon_(body.code)); });
      case 'saveContent':        return requireAdmin_(body.token, function () { return ok(saveContent_(body.content)); });
      case 'saveConfig':         return requireAdmin_(body.token, function () { return ok(saveConfig_(body.config)); });
      default:                   return fail('Acción POST no reconocida: ' + action, 'UNKNOWN_ACTION');
    }
  } catch (err) {
    return fail(String(err && err.message ? err.message : err), 'SERVER_ERROR');
  }
}

// ============================================================================
// RESPUESTAS
// ============================================================================
function ok(data, message) { return json_({ success: true, data: data, message: message || '' }); }
function fail(error, code) { return json_({ success: false, error: error, code: code || 'ERROR' }); }
function json_(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
function requireAdmin_(token, cb) { if (token !== ADMIN_TOKEN) return fail('No autorizado', 'UNAUTHORIZED'); return cb(); }

// ============================================================================
// ACCESO A HOJAS
// ============================================================================
function getSheet_(name) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sh) throw new Error('Hoja no encontrada: ' + name + '. Ejecuta setup().');
  return sh;
}

function readAll_(name) {
  var sh = getSheet_(name);
  var values = sh.getDataRange().getValues();
  if (values.length < 2) return [];
  var headers = values[0];
  var rows = [];
  for (var i = 1; i < values.length; i++) rows.push(rowToObject_(name, headers, values[i]));
  return rows;
}

function rowToObject_(name, headers, row) {
  var obj = {};
  for (var c = 0; c < headers.length; c++) obj[headers[c]] = deserialize_(headers[c], row[c]);
  return obj;
}

var JSON_FIELDS = { images: true, variants: true, customer: true, items: true };
var NUMBER_FIELDS = { price: true, compareAtPrice: true, cost: true, stock: true, rating: true, reviewsCount: true, order: true, subtotal: true, shipping: true, tax: true, discount: true, total: true, quantity: true, value: true, minPurchase: true };
var BOOL_FIELDS = { featured: true, isNew: true, active: true };

function deserialize_(key, val) {
  if (JSON_FIELDS[key]) {
    if (val === '' || val === null || val === undefined) return key === 'customer' ? {} : [];
    try { return JSON.parse(val); } catch (e) { return val; }
  }
  if (NUMBER_FIELDS[key]) return Number(val) || 0;
  if (BOOL_FIELDS[key]) return val === true || val === 'TRUE' || val === 'true' || val === 1;
  return val;
}

function serialize_(key, val) {
  if (JSON_FIELDS[key]) return JSON.stringify(val || (key === 'customer' ? {} : []));
  if (val === undefined || val === null) return '';
  return val;
}

function objectToRow_(name, obj) {
  return HEADERS[name].map(function (h) { return serialize_(h, obj[h]); });
}
function appendRow_(name, obj) { getSheet_(name).appendRow(objectToRow_(name, obj)); return obj; }

function findRowIndexById_(name, idField, idValue) {
  var values = getSheet_(name).getDataRange().getValues();
  var col = values[0].indexOf(idField);
  if (col < 0) return -1;
  for (var i = 1; i < values.length; i++) if (String(values[i][col]) === String(idValue)) return i + 1;
  return -1;
}
function findById_(name, idField, idValue) {
  var all = readAll_(name);
  for (var i = 0; i < all.length; i++) if (String(all[i][idField]) === String(idValue)) return all[i];
  return null;
}
function updateRow_(name, idField, idValue, patch) {
  var rowIndex = findRowIndexById_(name, idField, idValue);
  if (rowIndex < 0) throw new Error('Registro no encontrado en ' + name + ': ' + idValue);
  var sh = getSheet_(name);
  var current = rowToObject_(name, HEADERS[name], sh.getRange(rowIndex, 1, 1, HEADERS[name].length).getValues()[0]);
  var merged = Object.assign({}, current, patch);
  sh.getRange(rowIndex, 1, 1, HEADERS[name].length).setValues([objectToRow_(name, merged)]);
  return merged;
}

// ============================================================================
// TIENDA
// ============================================================================
function getConfig_() {
  var map = configMap_();
  return {
    currency: map.currency || 'COP',
    currencySymbol: map.currencySymbol || '$',
    taxRate: Number(map.taxRate) || TAX_RATE,
    freeShippingThreshold: Number(map.freeShippingThreshold) || FREE_SHIPPING_THRESHOLD,
    flatShipping: Number(map.flatShipping) || FLAT_SHIPPING,
    storeName: map.storeName || 'VÉRTICE',
  };
}

function configMap_() {
  var rows = readAll_(SHEETS.CONFIG);
  var map = {};
  rows.forEach(function (r) { map[r.key] = r.value; });
  return map;
}

function getContent_() {
  var map = configMap_();
  if (map.content) {
    try { return JSON.parse(map.content); } catch (e) {}
  }
  return defaultContent_();
}

function defaultContent_() {
  var img = function (id) { return 'https://images.unsplash.com/' + id + '?auto=format&fit=crop&w=1200&q=80'; };
  return {
    heroEyebrow: 'Nueva colección 2026',
    heroTitle: 'Viste tu', heroHighlight: 'impacto',
    heroSubtitle: 'Moda con estampados premium para dama, caballero y niño. Diseño que deja huella, hecho para durar.',
    heroImage: img('photo-1441984904996-e0b6ba687e04'),
    announcement: '🚚 Envío GRATIS en compras sobre $200.000 · 🎁 Usa BIENVENIDA y llévate 10% OFF · Nueva colección disponible',
    promoTitle: '¿Merch para tu empresa o evento?',
    promoText: 'Estampamos tu marca por volumen con precios especiales y entrega a tiempo. Cotización en menos de 24h.',
    aboutTitle: 'Somos VÉRTICE',
    aboutText: 'Nacimos para que lleves puesto lo que te representa. Estampamos camisetas, hoodies, libretas y más con calidad premium.',
    aboutImage: img('photo-1489987707025-afc232f7ea0f'),
  };
}

function getProducts_(category, department, search) {
  var list = readAll_(SHEETS.PRODUCTS).filter(function (p) { return p.active; });
  if (department) list = list.filter(function (p) { return p.department === department; });
  if (category) list = list.filter(function (p) { return p.category === category; });
  if (search) {
    var q = String(search).toLowerCase();
    list = list.filter(function (p) {
      return String(p.name).toLowerCase().indexOf(q) >= 0 || String(p.brand).toLowerCase().indexOf(q) >= 0 || String(p.category).toLowerCase().indexOf(q) >= 0;
    });
  }
  return list;
}

function getProductBySlug_(slug) { return findById_(SHEETS.PRODUCTS, 'slug', slug); }

function createOrder_(body) {
  var items = body.items || [];
  if (!items.length) throw new Error('El pedido no tiene items');
  var subtotal = 0;
  items.forEach(function (it) { subtotal += Number(it.unitPrice) * Number(it.qty); });
  var discount = 0;
  if (body.couponCode) { try { discount = validateCoupon_(body.couponCode, subtotal).discount; } catch (e) { discount = 0; } }
  var base = Math.max(0, subtotal - discount);
  var shipping = base >= FREE_SHIPPING_THRESHOLD ? 0 : Number(body.shipping || FLAT_SHIPPING);
  var tax = Math.round(base * TAX_RATE);
  var order = {
    id: 'VTX-' + Math.floor(100000 + Math.random() * 900000),
    createdAt: new Date().toISOString(), customer: body.customer, items: items,
    subtotal: subtotal, shipping: shipping, tax: tax, discount: discount, total: base + shipping + tax,
    status: 'pending', paymentMethod: body.paymentMethod || 'Tarjeta', couponCode: body.couponCode || '',
  };
  appendRow_(SHEETS.ORDERS, order);
  upsertCustomer_(body.customer);
  items.forEach(function (it) {
    if (it.productId) {
      var p = findById_(SHEETS.PRODUCTS, 'id', it.productId);
      if (p) {
        updateRow_(SHEETS.PRODUCTS, 'id', it.productId, { stock: Math.max(0, Number(p.stock) - Number(it.qty)) });
        appendRow_(SHEETS.INVENTORY, { id: 'M-' + Utilities.getUuid().slice(0, 8), productId: it.productId, productName: it.name, type: 'out', quantity: it.qty, reason: 'Venta ' + order.id, createdAt: order.createdAt, user: 'sistema' });
      }
    }
  });
  appendRow_(SHEETS.SHIPMENTS, { id: 'S-' + Utilities.getUuid().slice(0, 8), orderId: order.id, customerName: body.customer ? body.customer.name : '', tracking: '', courier: '', status: 'pending', shippedAt: '', deliveredAt: '' });
  return order;
}

function upsertCustomer_(customer) {
  if (!customer || !customer.email) return;
  var existing = findById_(SHEETS.CUSTOMERS, 'email', customer.email);
  if (existing) {
    updateRow_(SHEETS.CUSTOMERS, 'email', customer.email, { name: customer.name, phone: customer.phone, address: customer.address, city: customer.city });
  } else {
    appendRow_(SHEETS.CUSTOMERS, { id: 'C-' + Utilities.getUuid().slice(0, 8), name: customer.name, email: customer.email, phone: customer.phone, address: customer.address, city: customer.city, createdAt: new Date().toISOString() });
  }
}

function validateCoupon_(code, subtotal) {
  var normalized = String(code || '').trim().toUpperCase();
  var c = findById_(SHEETS.COUPONS, 'code', normalized);
  if (!c || !c.active) throw new Error('Cupón no válido');
  if (c.minPurchase && subtotal < Number(c.minPurchase)) throw new Error('Compra mínima de $' + Number(c.minPurchase).toLocaleString('es-CO'));
  var discount = c.type === 'percent' ? Math.round(subtotal * (Number(c.value) / 100)) : Number(c.value);
  return { code: normalized, discount: discount };
}

// ============================================================================
// ADMIN
// ============================================================================
function adminLogin_(email, password) {
  var user = findById_(SHEETS.ADMINS, 'email', email);
  if (!user) throw new Error('Credenciales inválidas');
  if (String(user.passwordHash) !== sha256_(password)) throw new Error('Credenciales inválidas');
  updateRow_(SHEETS.ADMINS, 'email', email, { lastAccess: new Date().toISOString() });
  return { token: ADMIN_TOKEN, email: email, role: user.role || 'staff' };
}

function sha256_(text) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text, Utilities.Charset.UTF_8);
  return bytes.map(function (b) { return ('0' + (b & 0xff).toString(16)).slice(-2); }).join('');
}

function getOrders_(status) {
  var list = readAll_(SHEETS.ORDERS).reverse();
  if (status) list = list.filter(function (o) { return o.status === status; });
  return list;
}
function updateOrderStatus_(orderId, status) { return updateRow_(SHEETS.ORDERS, 'id', orderId, { status: status }); }

function updateShipment_(body) {
  var patch = {};
  ['tracking', 'courier', 'status', 'shippedAt', 'deliveredAt'].forEach(function (k) { if (body[k] !== undefined) patch[k] = body[k]; });
  return updateRow_(SHEETS.SHIPMENTS, 'id', body.id, patch);
}

function saveProduct_(product) {
  if (!product.id) {
    product.id = 'P-' + Utilities.getUuid().slice(0, 8);
    product.createdAt = product.createdAt || new Date().toISOString();
    return appendRow_(SHEETS.PRODUCTS, product);
  }
  if (findById_(SHEETS.PRODUCTS, 'id', product.id)) return updateRow_(SHEETS.PRODUCTS, 'id', product.id, product);
  return appendRow_(SHEETS.PRODUCTS, product);
}
function deleteProduct_(id) {
  var rowIndex = findRowIndexById_(SHEETS.PRODUCTS, 'id', id);
  if (rowIndex < 0) throw new Error('Producto no encontrado');
  getSheet_(SHEETS.PRODUCTS).deleteRow(rowIndex);
  return { id: id };
}

function adjustStock_(productId, type, quantity, reason) {
  var p = findById_(SHEETS.PRODUCTS, 'id', productId);
  if (!p) throw new Error('Producto no encontrado');
  var newStock = type === 'in' ? Number(p.stock) + quantity : Math.max(0, Number(p.stock) - quantity);
  updateRow_(SHEETS.PRODUCTS, 'id', productId, { stock: newStock });
  var mov = { id: 'M-' + Utilities.getUuid().slice(0, 8), productId: productId, productName: p.name, type: type, quantity: quantity, reason: reason || '', createdAt: new Date().toISOString(), user: 'admin' };
  appendRow_(SHEETS.INVENTORY, mov);
  return mov;
}

// ---- Cupones ----
function saveCoupon_(coupon) {
  var code = String(coupon.code || '').trim().toUpperCase();
  if (!code) throw new Error('Código requerido');
  coupon.code = code;
  if (findById_(SHEETS.COUPONS, 'code', code)) return updateRow_(SHEETS.COUPONS, 'code', code, coupon);
  return appendRow_(SHEETS.COUPONS, coupon);
}
function deleteCoupon_(code) {
  var rowIndex = findRowIndexById_(SHEETS.COUPONS, 'code', String(code).toUpperCase());
  if (rowIndex < 0) throw new Error('Cupón no encontrado');
  getSheet_(SHEETS.COUPONS).deleteRow(rowIndex);
  return { code: code };
}

// ---- Contenido / configuración ----
function upsertConfigKey_(key, value) {
  var rowIndex = findRowIndexById_(SHEETS.CONFIG, 'key', key);
  var sh = getSheet_(SHEETS.CONFIG);
  if (rowIndex < 0) sh.appendRow([key, value]);
  else sh.getRange(rowIndex, 2).setValue(value);
}
function saveContent_(content) {
  upsertConfigKey_('content', JSON.stringify(content));
  return content;
}
function saveConfig_(config) {
  upsertConfigKey_('currency', config.currency);
  upsertConfigKey_('currencySymbol', config.currencySymbol);
  upsertConfigKey_('taxRate', config.taxRate);
  upsertConfigKey_('freeShippingThreshold', config.freeShippingThreshold);
  upsertConfigKey_('flatShipping', config.flatShipping);
  upsertConfigKey_('storeName', config.storeName);
  return config;
}

// ---- Dashboard ----
function getDashboard_() {
  var orders = readAll_(SHEETS.ORDERS);
  var products = readAll_(SHEETS.PRODUCTS);
  var shipments = readAll_(SHEETS.SHIPMENTS);
  var now = new Date();
  function sameDay(iso) { return new Date(iso).toDateString() === now.toDateString(); }
  function daysAgo(iso) { return (now.getTime() - new Date(iso).getTime()) / 86400000; }
  var paid = orders.filter(function (o) { return o.status !== 'cancelled' && o.status !== 'pending'; });
  var salesToday = sum_(paid.filter(function (o) { return sameDay(o.createdAt); }), 'total');
  var salesWeek = sum_(paid.filter(function (o) { return daysAgo(o.createdAt) <= 7; }), 'total');
  var salesMonth = sum_(paid.filter(function (o) { return daysAgo(o.createdAt) <= 30; }), 'total');
  var salesByDay = [];
  for (var d = 6; d >= 0; d--) {
    var day = new Date(now.getTime() - d * 86400000);
    salesByDay.push({ date: (day.getMonth() + 1) + '-' + day.getDate(), total: sum_(paid.filter(function (o) { return new Date(o.createdAt).toDateString() === day.toDateString(); }), 'total') });
  }
  var catMap = {};
  paid.forEach(function (o) { (o.items || []).forEach(function (it) { var pr = findInArray_(products, 'id', it.productId); var cat = pr ? pr.category : 'otros'; catMap[cat] = (catMap[cat] || 0) + it.unitPrice * it.qty; }); });
  var salesByCategory = Object.keys(catMap).map(function (c) { return { category: c, total: catMap[c] }; });
  var prodMap = {};
  paid.forEach(function (o) { (o.items || []).forEach(function (it) { if (!prodMap[it.name]) prodMap[it.name] = { units: 0, revenue: 0 }; prodMap[it.name].units += it.qty; prodMap[it.name].revenue += it.unitPrice * it.qty; }); });
  var topProducts = Object.keys(prodMap).map(function (n) { return { name: n, units: prodMap[n].units, revenue: prodMap[n].revenue }; }).sort(function (a, b) { return b.units - a.units; }).slice(0, 5);
  return {
    salesToday: salesToday, salesWeek: salesWeek, salesMonth: salesMonth,
    ordersToday: orders.filter(function (o) { return sameDay(o.createdAt); }).length,
    avgTicket: paid.length ? Math.round(salesMonth / paid.length) : 0,
    lowStockCount: products.filter(function (p) { return Number(p.stock) <= 5; }).length,
    pendingShipments: shipments.filter(function (s) { return s.status !== 'delivered'; }).length,
    salesByDay: salesByDay, salesByCategory: salesByCategory, topProducts: topProducts,
  };
}
function sum_(arr, f) { return arr.reduce(function (s, o) { return s + Number(o[f] || 0); }, 0); }
function findInArray_(arr, f, v) { for (var i = 0; i < arr.length; i++) if (String(arr[i][f]) === String(v)) return arr[i]; return null; }

// ============================================================================
// SETUP + SEED
// ============================================================================
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(HEADERS).forEach(function (name) {
    var sh = ss.getSheetByName(name);
    if (!sh) sh = ss.insertSheet(name);
    sh.clear();
    var headers = HEADERS[name];
    sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    sh.setFrozenRows(1);
  });
  var def = ss.getSheetByName('Hoja 1') || ss.getSheetByName('Sheet1');
  if (def && ss.getSheets().length > 1) ss.deleteSheet(def);
  return 'Setup completado: ' + Object.keys(HEADERS).join(', ');
}

function seedData() {
  var img = function (id) { return 'https://images.unsplash.com/' + id + '?auto=format&fit=crop&w=1200&q=80'; };

  // Config + contenido
  [['currency', 'COP'], ['currencySymbol', '$'], ['taxRate', TAX_RATE], ['freeShippingThreshold', FREE_SHIPPING_THRESHOLD], ['flatShipping', FLAT_SHIPPING], ['storeName', 'VÉRTICE'], ['content', JSON.stringify(defaultContent_())]]
    .forEach(function (r) { getSheet_(SHEETS.CONFIG).appendRow(r); });

  // Cupones
  [['BIENVENIDA', 'percent', 10, true, 0, 'Primera compra'], ['VERTICE5', 'percent', 5, true, 0, 'Descuento general'], ['ENVIOGRATIS', 'fixed', 12000, true, 80000, 'Cubre el envío']]
    .forEach(function (r) { getSheet_(SHEETS.COUPONS).appendRow(r); });

  // Categorías
  [
    ['c1', 'Camisetas', 'camisetas', img('photo-1521572163474-6864f9cf17ab'), 1],
    ['c2', 'Hoodies & Sacos', 'hoodies', img('photo-1556821840-3a63f95609a7'), 2],
    ['c3', 'Gorras', 'gorras', img('photo-1588850561407-ed78c282e89b'), 3],
    ['c4', 'Libretas', 'libretas', img('photo-1531346878377-a5be20888e57'), 4],
    ['c5', 'Totebags', 'totebags', img('photo-1597484661643-2f5fef640dd1'), 5],
    ['c6', 'Accesorios', 'accesorios', img('photo-1626785774573-4b799315345d'), 6],
  ].forEach(function (r) { getSheet_(SHEETS.CATEGORIES).appendRow(r); });

  // Tallas
  var adult = function (a, b, c, d) { return [
    { id: 't-s', name: 'Talla S', priceDelta: 0, stock: a }, { id: 't-m', name: 'Talla M', priceDelta: 0, stock: b },
    { id: 't-l', name: 'Talla L', priceDelta: 0, stock: c }, { id: 't-xl', name: 'Talla XL', priceDelta: 5000, stock: d },
  ]; };
  var kid = function (a, b, c, d) { return [
    { id: 't-4', name: 'Talla 4 años', priceDelta: 0, stock: a }, { id: 't-6', name: 'Talla 6 años', priceDelta: 0, stock: b },
    { id: 't-8', name: 'Talla 8 años', priceDelta: 0, stock: c }, { id: 't-10', name: 'Talla 10 años', priceDelta: 0, stock: d },
  ]; };
  var now = new Date().toISOString();

  // Productos: [id, sku, name, slug, description, price, compareAtPrice, cost, stock, department, category, brand, images, variants, rating, reviewsCount, featured, isNew, active, createdAt]
  var P = [
    ['p1', 'DAM-CAM-CROP', 'Camiseta Crop Estampada', 'camiseta-crop-estampada', 'Crop top en algodón peinado con estampado exclusivo VÉRTICE.', 59900, 79900, 26000, 32, 'dama', 'camisetas', 'VÉRTICE', [img('photo-1503342217505-b0a15ec3261c'), img('photo-1521572163474-6864f9cf17ab')], adult(10, 12, 8, 2), 4.9, 214, true, true, true, now],
    ['p2', 'DAM-HOO-OVR', 'Hoodie Oversize Dama', 'hoodie-oversize-dama', 'Buzo oversize en felpa perchada 320 g, súper suave.', 149900, 0, 72000, 20, 'dama', 'hoodies', 'VÉRTICE', [img('photo-1620799140408-edc6dcb6d633'), img('photo-1556821840-3a63f95609a7')], adult(6, 8, 4, 2), 4.8, 132, true, true, true, now],
    ['p3', 'DAM-BLU-ML', 'Blusa Manga Larga', 'blusa-manga-larga', 'Blusa de manga larga en tela suave y fresca.', 69900, 0, 30000, 26, 'dama', 'camisetas', 'VÉRTICE', [img('photo-1485462537746-965f33f7f6a7'), img('photo-1434389677669-e08b4cac3105')], adult(8, 10, 6, 2), 4.6, 74, false, false, true, now],
    ['p4', 'CAB-CAM-IMP', 'Camiseta Oversize "Impacto"', 'camiseta-oversize-impacto', 'Algodón 100% peinado 190 g. Estampado de alta durabilidad.', 69900, 0, 32000, 40, 'caballero', 'camisetas', 'VÉRTICE', [img('photo-1576566588028-4147f3842f27'), img('photo-1583743814966-8936f5b7be1a')], adult(12, 14, 10, 4), 4.9, 287, true, true, true, now],
    ['p5', 'CAB-HOO-BRD', 'Hoodie Premium Bordado', 'hoodie-premium-bordado', 'Felpa perchada 320 g, interior suave. Bordado premium.', 159900, 189900, 78000, 22, 'caballero', 'hoodies', 'VÉRTICE', [img('photo-1556821840-3a63f95609a7'), img('photo-1620799140408-edc6dcb6d633')], adult(6, 8, 6, 2), 4.8, 156, true, false, true, now],
    ['p6', 'CAB-SAC-CR', 'Saco Estampado Cuello Redondo', 'saco-estampado-cuello-redondo', 'Crewneck en mezcla de algodón 300 g. Estampado frontal HD.', 129900, 0, 60000, 18, 'caballero', 'hoodies', 'VÉRTICE', [img('photo-1509942774463-acf339cf87d5'), img('photo-1618354691373-d851c5c3a990')], adult(5, 6, 5, 2), 4.7, 63, false, false, true, now],
    ['p7', 'NIN-CAM-EST', 'Camiseta Niño Estampada', 'camiseta-nino-estampada', 'Camiseta infantil en algodón suave con estampado resistente.', 44900, 0, 18000, 30, 'nino', 'camisetas', 'VÉRTICE', [img('photo-1519238263530-99bdd11df2ea'), img('photo-1503944583220-79d8926ad5e2')], kid(8, 10, 8, 4), 4.8, 52, true, true, true, now],
    ['p8', 'NIN-HOO-EST', 'Hoodie Niño', 'hoodie-nino', 'Buzo con capota para niños, felpa cálida y estampado frontal.', 99900, 0, 44000, 16, 'nino', 'hoodies', 'VÉRTICE', [img('photo-1522771930-78848d9293e8'), img('photo-1503944583220-79d8926ad5e2')], kid(4, 6, 4, 2), 4.7, 38, false, true, true, now],
    ['p9', 'UNI-GOR-BRD', 'Gorra Bordada Clásica', 'gorra-bordada-clasica', 'Gorra de 6 paneles, visera curva, bordado 3D y cierre ajustable.', 55000, 0, 22000, 35, 'unisex', 'gorras', 'VÉRTICE', [img('photo-1588850561407-ed78c282e89b'), img('photo-1521369909029-2afed882baee')], [], 4.5, 41, false, false, true, now],
    ['p10', 'UNI-TOT-LON', 'Totebag de Lona Estampada', 'totebag-lona-estampada', 'Lona de algodón resistente, asas reforzadas y estampado a gran formato.', 45000, 0, 18000, 60, 'unisex', 'totebags', 'VÉRTICE', [img('photo-1597484661643-2f5fef640dd1'), img('photo-1544816155-12df9643f363')], [], 4.6, 74, false, true, true, now],
    ['p11', 'UNI-LIB-A5', 'Libreta A5 Tapa Dura', 'libreta-a5-tapa-dura', 'Tapa dura, 160 páginas de 90 g, elástico y bolsillo interior.', 38000, 0, 15000, 80, 'unisex', 'libretas', 'VÉRTICE', [img('photo-1531346878377-a5be20888e57'), img('photo-1517842645767-c639042777db')], [{ id: 'v-ray', name: 'Interior rayado', priceDelta: 0, stock: 30 }, { id: 'v-pun', name: 'Interior de puntos', priceDelta: 0, stock: 28 }, { id: 'v-lis', name: 'Interior liso', priceDelta: 0, stock: 22 }], 4.7, 98, false, false, true, now],
    ['p12', 'UNI-STK-10', 'Set de Stickers (x10)', 'set-stickers-x10', 'Pack de 10 stickers de vinilo resistente al agua.', 25000, 0, 8000, 120, 'unisex', 'accesorios', 'VÉRTICE', [img('photo-1626785774573-4b799315345d'), img('photo-1600783245526-8b6f0f5b0f62')], [], 4.9, 132, false, true, true, now],
  ];
  P.forEach(function (r) {
    // Serializa images (idx 12) y variants (idx 13) a JSON antes de escribir.
    r[12] = JSON.stringify(r[12]); r[13] = JSON.stringify(r[13]);
    getSheet_(SHEETS.PRODUCTS).appendRow(r);
  });

  // Reseñas
  [
    ['r1', 'Valentina M.', 5, '¡La calidad del estampado es brutal! Lavé la camiseta mil veces y sigue intacta.', 'Camiseta Crop Estampada', '2026-09-14T10:00:00.000Z'],
    ['r2', 'Andrés P.', 5, 'El hoodie es una nave, súper abrigado y el bordado se ve premium.', 'Hoodie Premium Bordado', '2026-09-12T10:00:00.000Z'],
    ['r3', 'Camila R.', 5, 'Le compré la camiseta a mi hijo y le encantó. Excelente atención.', 'Camiseta Niño Estampada', '2026-09-10T10:00:00.000Z'],
    ['r4', 'Julián G.', 4, 'Muy buena tela y horma. El producto llegó perfecto.', 'Saco Estampado', '2026-09-08T10:00:00.000Z'],
    ['r5', 'Daniela S.', 5, 'Pedí totebags para mi evento y quedaron espectaculares.', 'Totebag de Lona', '2026-09-05T10:00:00.000Z'],
    ['r6', 'Mateo L.', 5, 'Los colores del estampado son vivos y no se agrietan. Recomendadísimo.', 'Camiseta Oversize', '2026-09-02T10:00:00.000Z'],
  ].forEach(function (r) { getSheet_(SHEETS.REVIEWS).appendRow(r); });

  // Admin demo: admin@vertice.co / vertice123
  getSheet_(SHEETS.ADMINS).appendRow(['a1', 'admin@vertice.co', 'owner', sha256_('vertice123'), '']);

  return 'Seed OK: ' + P.length + ' productos, cupones, reseñas y admin (admin@vertice.co / vertice123).';
}

function resetAll() { setup(); return seedData(); }
