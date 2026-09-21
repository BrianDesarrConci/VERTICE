import * as React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { GradientBlobs } from './GradientBlobs';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { Toaster } from '@/components/ui/toaster';

/** Layout de la tienda: burbujas de fondo + header + contenido + footer + carrito. */
export function StoreLayout() {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);

  return (
    <div className="relative flex min-h-screen flex-col">
      <GradientBlobs />
      {/* Todo el contenido va sobre la capa de burbujas */}
      <div className="relative z-10 flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
      <CartDrawer />
      <Toaster />
    </div>
  );
}
