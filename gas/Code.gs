/**
 * ============================================================================
 * VÉRTICE — Backend Google Apps Script (Web App)
 * ----------------------------------------------------------------------------
 * Base de datos: Google Sheets (una hoja por entidad).
 * Publicación: Implementar → Nueva implementación → Aplicación web
 *              · Ejecutar como: Yo
 *              · Quién tiene acceso: Cualquier persona
 *
 * Contrato de respuesta estandarizado:
 *   Éxito:  { success: true,  data: <any>, message?: <string> }
 *   Error:  { success: false, error: <string>, code?: <string> }
 *
 * IMPORTANTE (primer uso):
 *   1) Ejecuta setup()     → crea todas las hojas con sus cabeceras.
 *   2) Ejecuta seedData()  → carga productos/categorías/pedidos de ejemplo.
 *   3) Publica como Web App y copia la URL /exec a VITE_GAS_URL del frontend.
 * ============================================================================
 */

// ---- Configuración global ----
var ADMIN_TOKEN = 'vertice-dev-token'; // Debe coincidir con VITE_ADMIN_TOKEN del frontend.
var TAX_RATE = 0.19;
var FREE_SHIPPING_THRESHOLD = 250000;
var FLAT_SHIPPING = 12000;

// Nombres de hojas (entidades).
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
};

// Cabeceras por hoja (orden = columnas).
var HEADERS = {
  Productos: ['id', 'sku', 'name', 'slug', 'description', 'price', 'cost', 'stock', 'category', 'brand', 'images', 'variants', 'rating', 'reviewsCount', 'featured', 'isNew', 'active', 'createdAt'],
  Categorias: ['id', 'name', 'slug', 'image', 'order'],
  Pedidos: ['id', 'createdAt', 'customer', 'items', 'subtotal', 'shipping', 'tax', 'discount', 'total', 'status', 'paymentMethod', 'couponCode'],
  Clientes: ['id', 'name', 'email', 'phone', 'address', 'city', 'createdAt'],
  Inventario_Mov: ['id', 'productId', 'productName', 'type', 'quantity', 'reason', 'createdAt', 'user'],
  Despachos: ['id', 'orderId', 'customerName', 'tracking', 'courier', 'status', 'shippedAt', 'deliveredAt'],
  Usuarios_Admin: ['id', 'email', 'role', 'passwordHash', 'lastAccess'],
  Configuracion: ['key', 'value'],
  Cupones: ['code', 'type', 'value', 'active'],
};

// ============================================================================
// ENRUTADORES HTTP
// ============================================================================

/** Enrutador de lecturas (GET ?action=...). */
function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) || '';
    var p = (e && e.parameter) || {};

    switch (action) {
      case 'getConfig':        return ok(getConfig_());
      case 'getCategories':    return ok(readAll_(SHEETS.CATEGORIES));
      case 'getProducts':      return ok(getProducts_(p.category, p.search));
      case 'getProduct':       return ok(getProductBySlug_(p.slug));
      case 'getDashboard':     return requireAdmin_(p.token, function () { return ok(getDashboard_()); });
      case 'getOrders':        return requireAdmin_(p.token, function () { return ok(getOrders_(p.status)); });
      case 'getShipments':     return requireAdmin_(p.token, function () { return ok(readAll_(SHEETS.SHIPMENTS)); });
      case 'getProductsAdmin': return requireAdmin_(p.token, function () { return ok(readAll_(SHEETS.PRODUCTS)); });
      case 'getMovements':     return requireAdmin_(p.token, function () { return ok(readAll_(SHEETS.INVENTORY).reverse()); });
      default:                 return fail('Acción GET no reconocida: ' + action, 'UNKNOWN_ACTION');
    }
  } catch (err) {
    return fail(String(err && err.message ? err.message : err), 'SERVER_ERROR');
  }
}

/** Enrutador de escrituras (POST JSON con { action, token?, ... }). */
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

      default:                   return fail('Acción POST no reconocida: ' + action, 'UNKNOWN_ACTION');
    }
  } catch (err) {
    return fail(String(err && err.message ? err.message : err), 'SERVER_ERROR');
  }
}

// ============================================================================
// HELPERS DE RESPUESTA (ContentService → JSON, evita preflight CORS)
// ============================================================================

function ok(data, message) {
  return json_({ success: true, data: data, message: message || '' });
}
function fail(error, code) {
  return json_({ success: false, error: error, code: code || 'ERROR' });
}
function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Ejecuta el callback sólo si el token es válido; si no, responde 403 lógico. */
function requireAdmin_(token, callback) {
  if (token !== ADMIN_TOKEN) return fail('No autorizado', 'UNAUTHORIZED');
  return callback();
}

// ============================================================================
// HELPERS DE ACCESO A HOJAS (capa de "ORM" mínima)
// ============================================================================

function getSheet_(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh) throw new Error('Hoja no encontrada: ' + name + '. Ejecuta setup().');
  return sh;
}

/** Lee todas las filas de una hoja como array de objetos (parseando JSON/tipos). */
function readAll_(name) {
  var sh = getSheet_(name);
  var values = sh.getDataRange().getValues();
  if (values.length < 2) return [];
  var headers = values[0];
  var rows = [];
  for (var i = 1; i < values.length; i++) {
    rows.push(rowToObject_(name, headers, values[i]));
  }
  return rows;
}

/** Convierte una fila (array) en objeto tipado según cabeceras. */
function rowToObject_(sheetName, headers, row) {
  var obj = {};
  for (var c = 0; c < headers.length; c++) {
    obj[headers[c]] = deserialize_(sheetName, headers[c], row[c]);
  }
  return obj;
}

/** Campos que se guardan como JSON string en la celda. */
var JSON_FIELDS = { images: true, variants: true, customer: true, items: true };
var NUMBER_FIELDS = { price: true, cost: true, stock: true, rating: true, reviewsCount: true, order: true, subtotal: true, shipping: true, tax: true, discount: true, total: true, quantity: true, value: true };
var BOOL_FIELDS = { featured: true, isNew: true, active: true };

function deserialize_(sheetName, key, val) {
  if (JSON_FIELDS[key]) {
    if (val === '' || val === null || val === undefined) return key === 'images' || key === 'variants' || key === 'items' ? [] : {};
    try { return JSON.parse(val); } catch (e) { return val; }
  }
  if (NUMBER_FIELDS[key]) return Number(val) || 0;
  if (BOOL_FIELDS[key]) return val === true || val === 'TRUE' || val === 'true' || val === 1;
  return val;
}

/** Serializa un valor de objeto para escribir en celda. */
function serialize_(key, val) {
  if (JSON_FIELDS[key]) return JSON.stringify(val || (key === 'customer' ? {} : []));
  if (val === undefined || val === null) return '';
  return val;
}

/** Objeto → fila (array) según cabeceras de la hoja. */
function objectToRow_(sheetName, obj) {
  var headers = HEADERS[sheetName];
  return headers.map(function (h) { return serialize_(h, obj[h]); });
}

/** Agrega una fila a partir de un objeto. */
function appendRow_(name, obj) {
  var sh = getSheet_(name);
  sh.appendRow(objectToRow_(name, obj));
  return obj;
}

/** Busca el índice de fila (1-based en la hoja) por valor de columna id. */
function findRowIndexById_(name, idField, idValue) {
  var sh = getSheet_(name);
  var values = sh.getDataRange().getValues();
  var headers = values[0];
  var col = headers.indexOf(idField);
  if (col < 0) return -1;
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][col]) === String(idValue)) return i + 1; // fila real en la hoja
  }
  return -1;
}

/** Busca un objeto por id. */
function findById_(name, idField, idValue) {
  var all = readAll_(name);
  for (var i = 0; i < all.length; i++) {
    if (String(all[i][idField]) === String(idValue)) return all[i];
  }
  return null;
}

/** Actualiza una fila completa por id con los campos del objeto. */
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
// LÓGICA DE NEGOCIO — TIENDA
// ============================================================================

function getConfig_() {
  var rows = readAll_(SHEETS.CONFIG);
  var map = {};
  rows.forEach(function (r) { map[r.key] = r.value; });
  return {
    currency: map.currency || 'COP',
    currencySymbol: map.currencySymbol || '$',
    taxRate: Number(map.taxRate) || TAX_RATE,
    freeShippingThreshold: Number(map.freeShippingThreshold) || FREE_SHIPPING_THRESHOLD,
    flatShipping: Number(map.flatShipping) || FLAT_SHIPPING,
    storeName: map.storeName || 'VÉRTICE',
  };
}

function getProducts_(category, search) {
  var list = readAll_(SHEETS.PRODUCTS).filter(function (p) { return p.active; });
  if (category) list = list.filter(function (p) { return p.category === category; });
  if (search) {
    var q = String(search).toLowerCase();
    list = list.filter(function (p) {
      return String(p.name).toLowerCase().indexOf(q) >= 0 || String(p.brand).toLowerCase().indexOf(q) >= 0;
    });
  }
  return list;
}

function getProductBySlug_(slug) {
  return findById_(SHEETS.PRODUCTS, 'slug', slug);
}

/** Crea un pedido: calcula totales en servidor, descuenta stock y crea despacho. */
function createOrder_(body) {
  var items = body.items || [];
  if (!items.length) throw new Error('El pedido no tiene items');

  var subtotal = 0;
  items.forEach(function (it) { subtotal += Number(it.unitPrice) * Number(it.qty); });

  var discount = 0;
  if (body.couponCode) {
    try { discount = validateCoupon_(body.couponCode, subtotal).discount; } catch (e) { discount = 0; }
  }
  var base = Math.max(0, subtotal - discount);
  var shipping = base >= FREE_SHIPPING_THRESHOLD ? 0 : Number(body.shipping || FLAT_SHIPPING);
  var tax = Math.round(base * TAX_RATE);
  var total = base + shipping + tax;

  var order = {
    id: 'VTX-' + Math.floor(100000 + Math.random() * 900000),
    createdAt: new Date().toISOString(),
    customer: body.customer,
    items: items,
    subtotal: subtotal,
    shipping: shipping,
    tax: tax,
    discount: discount,
    total: total,
    status: 'pending',
    paymentMethod: body.paymentMethod || 'Tarjeta',
    couponCode: body.couponCode || '',
  };
  appendRow_(SHEETS.ORDERS, order);

  // Persistir/actualizar cliente.
  upsertCustomer_(body.customer);

  // Descontar stock y registrar movimiento por cada item.
  items.forEach(function (it) {
    if (it.productId) {
      var p = findById_(SHEETS.PRODUCTS, 'id', it.productId);
      if (p) {
        updateRow_(SHEETS.PRODUCTS, 'id', it.productId, { stock: Math.max(0, Number(p.stock) - Number(it.qty)) });
        appendRow_(SHEETS.INVENTORY, {
          id: 'M-' + Utilities.getUuid().slice(0, 8),
          productId: it.productId,
          productName: it.name,
          type: 'out',
          quantity: it.qty,
          reason: 'Venta ' + order.id,
          createdAt: order.createdAt,
          user: 'sistema',
        });
      }
    }
  });

  // Crear despacho asociado en estado pendiente.
  appendRow_(SHEETS.SHIPMENTS, {
    id: 'S-' + Utilities.getUuid().slice(0, 8),
    orderId: order.id,
    customerName: body.customer ? body.customer.name : '',
    tracking: '',
    courier: '',
    status: 'pending',
    shippedAt: '',
    deliveredAt: '',
  });

  return order;
}

function upsertCustomer_(customer) {
  if (!customer || !customer.email) return;
  var existing = findById_(SHEETS.CUSTOMERS, 'email', customer.email);
  if (existing) {
    updateRow_(SHEETS.CUSTOMERS, 'email', customer.email, {
      name: customer.name, phone: customer.phone, address: customer.address, city: customer.city,
    });
  } else {
    appendRow_(SHEETS.CUSTOMERS, {
      id: 'C-' + Utilities.getUuid().slice(0, 8),
      name: customer.name, email: customer.email, phone: customer.phone,
      address: customer.address, city: customer.city, createdAt: new Date().toISOString(),
    });
  }
}

function validateCoupon_(code, subtotal) {
  var normalized = String(code || '').trim().toUpperCase();
  var coupon = findById_(SHEETS.COUPONS, 'code', normalized);
  if (!coupon || !coupon.active) throw new Error('Cupón no válido');
  var discount = coupon.type === 'percent'
    ? Math.round(subtotal * (Number(coupon.value) / 100))
    : Number(coupon.value);
  return { code: normalized, discount: discount };
}

// ============================================================================
// LÓGICA DE NEGOCIO — ADMIN
// ============================================================================

function adminLogin_(email, password) {
  var user = findById_(SHEETS.ADMINS, 'email', email);
  if (!user) throw new Error('Credenciales inválidas');
  // Hash simple SHA-256 (demo). En producción usar sal + PBKDF2 / servicio externo.
  var hash = sha256_(password);
  if (String(user.passwordHash) !== hash) throw new Error('Credenciales inválidas');
  updateRow_(SHEETS.ADMINS, 'email', email, { lastAccess: new Date().toISOString() });
  return { token: ADMIN_TOKEN, email: email, role: user.role || 'staff' };
}

function sha256_(text) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text, Utilities.Charset.UTF_8);
  return bytes.map(function (b) { return ('0' + (b & 0xff).toString(16)).slice(-2); }).join('');
}

function getOrders_(status) {
  var list = readAll_(SHEETS.ORDERS).reverse(); // más recientes primero
  if (status) list = list.filter(function (o) { return o.status === status; });
  return list;
}

function updateOrderStatus_(orderId, status) {
  return updateRow_(SHEETS.ORDERS, 'id', orderId, { status: status });
}

function updateShipment_(body) {
  var patch = {};
  ['tracking', 'courier', 'status', 'shippedAt', 'deliveredAt'].forEach(function (k) {
    if (body[k] !== undefined) patch[k] = body[k];
  });
  return updateRow_(SHEETS.SHIPMENTS, 'id', body.id, patch);
}

function saveProduct_(product) {
  if (!product.id) {
    product.id = 'P-' + Utilities.getUuid().slice(0, 8);
    product.createdAt = product.createdAt || new Date().toISOString();
    return appendRow_(SHEETS.PRODUCTS, product);
  }
  var exists = findById_(SHEETS.PRODUCTS, 'id', product.id);
  if (exists) return updateRow_(SHEETS.PRODUCTS, 'id', product.id, product);
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
  var mov = {
    id: 'M-' + Utilities.getUuid().slice(0, 8),
    productId: productId,
    productName: p.name,
    type: type,
    quantity: quantity,
    reason: reason || '',
    createdAt: new Date().toISOString(),
    user: 'admin',
  };
  appendRow_(SHEETS.INVENTORY, mov);
  return mov;
}

/** Deriva KPIs y series para el dashboard admin a partir de los pedidos. */
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

  // Serie por día (7 días).
  var salesByDay = [];
  for (var d = 6; d >= 0; d--) {
    var day = new Date(now.getTime() - d * 86400000);
    var total = sum_(paid.filter(function (o) { return new Date(o.createdAt).toDateString() === day.toDateString(); }), 'total');
    salesByDay.push({ date: (day.getMonth() + 1) + '-' + day.getDate(), total: total });
  }

  // Ventas por categoría.
  var catMap = {};
  paid.forEach(function (o) {
    (o.items || []).forEach(function (it) {
      var prod = findInArray_(products, 'id', it.productId);
      var cat = prod ? prod.category : 'otros';
      catMap[cat] = (catMap[cat] || 0) + it.unitPrice * it.qty;
    });
  });
  var salesByCategory = Object.keys(catMap).map(function (c) { return { category: c, total: catMap[c] }; });

  // Top productos.
  var prodMap = {};
  paid.forEach(function (o) {
    (o.items || []).forEach(function (it) {
      if (!prodMap[it.name]) prodMap[it.name] = { units: 0, revenue: 0 };
      prodMap[it.name].units += it.qty;
      prodMap[it.name].revenue += it.unitPrice * it.qty;
    });
  });
  var topProducts = Object.keys(prodMap).map(function (name) {
    return { name: name, units: prodMap[name].units, revenue: prodMap[name].revenue };
  }).sort(function (a, b) { return b.units - a.units; }).slice(0, 5);

  return {
    salesToday: salesToday,
    salesWeek: salesWeek,
    salesMonth: salesMonth,
    ordersToday: orders.filter(function (o) { return sameDay(o.createdAt); }).length,
    avgTicket: paid.length ? Math.round(salesMonth / paid.length) : 0,
    lowStockCount: products.filter(function (p) { return Number(p.stock) <= 5; }).length,
    pendingShipments: shipments.filter(function (s) { return s.status !== 'delivered'; }).length,
    salesByDay: salesByDay,
    salesByCategory: salesByCategory,
    topProducts: topProducts,
  };
}

function sum_(arr, field) {
  return arr.reduce(function (s, o) { return s + Number(o[field] || 0); }, 0);
}
function findInArray_(arr, field, val) {
  for (var i = 0; i < arr.length; i++) if (String(arr[i][field]) === String(val)) return arr[i];
  return null;
}

// ============================================================================
// SETUP + SEED
// ============================================================================

/** Crea todas las hojas con sus cabeceras (idempotente). Ejecutar una vez. */
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
  // Elimina la hoja por defecto "Hoja 1"/"Sheet1" si quedó vacía.
  var def = ss.getSheetByName('Hoja 1') || ss.getSheetByName('Sheet1');
  if (def && ss.getSheets().length > 1) ss.deleteSheet(def);
  return 'Setup completado. Hojas creadas: ' + Object.keys(HEADERS).join(', ');
}

/** Carga datos de ejemplo. Ejecutar después de setup(). */
function seedData() {
  // Configuración
  var config = [
    ['currency', 'COP'], ['currencySymbol', '$'], ['taxRate', TAX_RATE],
    ['freeShippingThreshold', FREE_SHIPPING_THRESHOLD], ['flatShipping', FLAT_SHIPPING], ['storeName', 'VÉRTICE'],
  ];
  var cfgSheet = getSheet_(SHEETS.CONFIG);
  config.forEach(function (r) { cfgSheet.appendRow(r); });

  // Cupones
  [['BIENVENIDA', 'percent', 10, true], ['VERTICE5', 'percent', 5, true]].forEach(function (r) {
    getSheet_(SHEETS.COUPONS).appendRow(r);
  });

  // Categorías (merchandising)
  var img = function (id) { return 'https://images.unsplash.com/' + id + '?auto=format&fit=crop&w=1200&q=80'; };
  var categories = [
    ['c1', 'Camisetas', 'camisetas', img('photo-1521572163474-6864f9cf17ab'), 1],
    ['c2', 'Hoodies & Sacos', 'hoodies', img('photo-1556821840-3a63f95609a7'), 2],
    ['c3', 'Libretas', 'libretas', img('photo-1531346878377-a5be20888e57'), 3],
    ['c4', 'Totebags', 'totebags', img('photo-1597484661643-2f5fef640dd1'), 4],
    ['c5', 'Gorras', 'gorras', img('photo-1588850561407-ed78c282e89b'), 5],
    ['c6', 'Accesorios', 'accesorios', img('photo-1626785774573-4b799315345d'), 6],
  ];
  categories.forEach(function (r) { getSheet_(SHEETS.CATEGORIES).appendRow(r); });

  // Tallas estándar para prendas.
  var sizes = function (a, b, c, d) {
    return [
      { id: 't-s', name: 'Talla S', priceDelta: 0, stock: a },
      { id: 't-m', name: 'Talla M', priceDelta: 0, stock: b },
      { id: 't-l', name: 'Talla L', priceDelta: 0, stock: c },
      { id: 't-xl', name: 'Talla XL', priceDelta: 5000, stock: d },
    ];
  };

  // Productos (id, sku, name, slug, description, price, cost, stock, category, brand, images, variants, rating, reviewsCount, featured, isNew, active, createdAt)
  var products = [
    ['p1', 'CAM-OVR-IMP', 'Camiseta Oversize "Impacto"', 'camiseta-oversize-impacto', 'Algodón 100% peinado 190 g. Estampado de alta durabilidad. Corte oversize con caída perfecta.', 69000, 32000, 40, 'camisetas', 'VÉRTICE',
      JSON.stringify([img('photo-1576566588028-4147f3842f27'), img('photo-1521572163474-6864f9cf17ab')]),
      JSON.stringify(sizes(12, 14, 10, 4)),
      4.9, 214, true, true, true, new Date().toISOString()],
    ['p2', 'HOO-PRM-BRD', 'Hoodie Premium Bordado', 'hoodie-premium-bordado', 'Felpa perchada 320 g, interior suave. Bordado premium en pecho y bolsillo canguro.', 159000, 78000, 22, 'hoodies', 'VÉRTICE',
      JSON.stringify([img('photo-1556821840-3a63f95609a7'), img('photo-1620799140408-edc6dcb6d633')]),
      JSON.stringify(sizes(6, 8, 6, 2)),
      4.8, 156, true, true, true, new Date().toISOString()],
    ['p3', 'LIB-A5-TD', 'Libreta A5 Tapa Dura', 'libreta-a5-tapa-dura', 'Tapa dura, 160 páginas de 90 g, elástico y bolsillo interior. Portada personalizada.', 38000, 15000, 80, 'libretas', 'VÉRTICE',
      JSON.stringify([img('photo-1531346878377-a5be20888e57'), img('photo-1517842645767-c639042777db')]),
      JSON.stringify([{ id: 'v-ray', name: 'Interior rayado', priceDelta: 0, stock: 30 }, { id: 'v-pun', name: 'Interior de puntos', priceDelta: 0, stock: 28 }, { id: 'v-lis', name: 'Interior liso', priceDelta: 0, stock: 22 }]),
      4.7, 98, true, false, true, new Date().toISOString()],
    ['p4', 'TOT-LON-EST', 'Totebag de Lona Estampada', 'totebag-lona-estampada', 'Lona de algodón resistente, asas reforzadas y estampado a gran formato. Ecológica y lavable.', 45000, 18000, 60, 'totebags', 'VÉRTICE',
      JSON.stringify([img('photo-1597484661643-2f5fef640dd1'), img('photo-1544816155-12df9643f363')]), JSON.stringify([]),
      4.6, 74, false, true, true, new Date().toISOString()],
    ['p5', 'SAC-EST-CR', 'Saco Estampado Cuello Redondo', 'saco-estampado-cuello-redondo', 'Crewneck en mezcla de algodón 300 g. Estampado frontal de alta definición.', 129000, 60000, 18, 'hoodies', 'VÉRTICE',
      JSON.stringify([img('photo-1509942774463-acf339cf87d5'), img('photo-1618354691373-d851c5c3a990')]),
      JSON.stringify(sizes(5, 6, 5, 2)),
      4.8, 63, true, false, true, new Date().toISOString()],
    ['p6', 'GOR-BRD-CL', 'Gorra Bordada Clásica', 'gorra-bordada-clasica', 'Gorra de 6 paneles, visera curva, bordado 3D y cierre ajustable.', 55000, 22000, 35, 'gorras', 'VÉRTICE',
      JSON.stringify([img('photo-1588850561407-ed78c282e89b'), img('photo-1521369909029-2afed882baee')]), JSON.stringify([]),
      4.5, 41, false, false, true, new Date().toISOString()],
    ['p7', 'CAM-CLS-EST', 'Camiseta Clásica Estampada', 'camiseta-clasica-estampada', 'Corte regular en algodón 160 g. Estampado serigráfico duradero. El básico que combina con todo.', 59000, 26000, 55, 'camisetas', 'VÉRTICE',
      JSON.stringify([img('photo-1583743814966-8936f5b7be1a'), img('photo-1503341504253-dff4815485f1')]),
      JSON.stringify(sizes(16, 18, 14, 7)),
      4.7, 187, false, false, true, new Date().toISOString()],
    ['p8', 'STK-SET-10', 'Set de Stickers (x10)', 'set-stickers-x10', 'Pack de 10 stickers de vinilo resistente al agua, corte de precisión y colores vibrantes.', 25000, 8000, 120, 'accesorios', 'VÉRTICE',
      JSON.stringify([img('photo-1626785774573-4b799315345d'), img('photo-1600783245526-8b6f0f5b0f62')]), JSON.stringify([]),
      4.9, 132, false, true, true, new Date().toISOString()],
  ];
  products.forEach(function (r) { getSheet_(SHEETS.PRODUCTS).appendRow(r); });

  // Usuario admin demo: admin@vertice.co / vertice123
  getSheet_(SHEETS.ADMINS).appendRow(['a1', 'admin@vertice.co', 'owner', sha256_('vertice123'), '']);

  return 'Seed completado: ' + products.length + ' productos, ' + categories.length + ' categorías, 1 admin (admin@vertice.co / vertice123).';
}

/** Utilidad: reinicia todo (setup + seed). Úsalo con cuidado. */
function resetAll() {
  setup();
  return seedData();
}
