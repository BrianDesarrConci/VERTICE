import { Routes, Route } from 'react-router-dom';
import { StoreLayout } from '@/components/layout/StoreLayout';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ProtectedRoute } from '@/components/admin/ProtectedRoute';

// --- Tienda pública ---
import { Home } from '@/pages/store/Home';
import { Catalog } from '@/pages/store/Catalog';
import { Product } from '@/pages/store/Product';
import { Checkout } from '@/pages/store/Checkout';
import { Account } from '@/pages/store/Account';
import { Reviews } from '@/pages/store/Reviews';
import { About } from '@/pages/store/About';

// --- Panel admin ---
import { AdminLogin } from '@/pages/admin/Login';
import { Dashboard } from '@/pages/admin/Dashboard';
import { Stock } from '@/pages/admin/Stock';
import { Orders } from '@/pages/admin/Orders';
import { Shipments } from '@/pages/admin/Shipments';
import { Customers } from '@/pages/admin/Customers';
import { Analytics } from '@/pages/admin/Analytics';
import { Coupons } from '@/pages/admin/Coupons';
import { Content } from '@/pages/admin/Content';
import { Diagnostics } from '@/pages/admin/Diagnostics';
import { Settings } from '@/pages/admin/Settings';

import { NotFound } from '@/pages/NotFound';

export default function App() {
  return (
    <Routes>
      {/* ===== Tienda pública ===== */}
      <Route element={<StoreLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/catalogo" element={<Catalog />} />
        <Route path="/catalogo/:category" element={<Catalog />} />
        <Route path="/categorias/:department" element={<Catalog />} />
        <Route path="/producto/:slug" element={<Product />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/cuenta" element={<Account />} />
        <Route path="/resenas" element={<Reviews />} />
        <Route path="/nosotros" element={<About />} />
      </Route>

      {/* ===== Admin ===== */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="stock" element={<Stock />} />
        <Route path="ventas" element={<Orders />} />
        <Route path="despachos" element={<Shipments />} />
        <Route path="cupones" element={<Coupons />} />
        <Route path="contenido" element={<Content />} />
        <Route path="clientes" element={<Customers />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="diagnostico" element={<Diagnostics />} />
        <Route path="configuracion" element={<Settings />} />
      </Route>

      {/* ===== 404 ===== */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
