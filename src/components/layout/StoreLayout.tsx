import * as React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { GradientBlobs } from './GradientBlobs';
import { SiteEffects } from './SiteEffects';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { Toaster } from '@/components/ui/toaster';
import { useSiteContent } from '@/hooks/useSiteContent';

/** Layout de la tienda: fondo + header + contenido + footer + carrito + efectos. */
export function StoreLayout() {
  const { pathname } = useLocation();
  const content = useSiteContent();

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);

  return (
    <div className="relative flex min-h-screen flex-col">
      {content.showBlobs && <GradientBlobs intensity={content.blobIntensity} />}
      <div className="relative z-10 flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
      <CartDrawer />
      <SiteEffects />
      <Toaster />
    </div>
  );
}
