import * as React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import { useAsync } from '@/hooks/useAsync';
import { ProductCard } from '@/components/product/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { SmartImage } from '@/components/ui/smart-image';

export function Home() {
  const products = useAsync(() => api.getProducts(), []);
  const categories = useAsync(() => api.getCategories(), []);

  const featured = (products.data ?? []).filter((p) => p.featured);
  const fresh = (products.data ?? []).filter((p) => p.isNew).slice(0, 4);

  return (
    <>
      {/* ===== HERO cinematográfico ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-600/10 via-background to-background" />
        <div className="container flex flex-col items-center py-20 text-center sm:py-28 md:py-32">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Nuevos lanzamientos disponibles
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="max-w-4xl text-balance text-4xl font-semibold tracking-tight sm:text-6xl md:text-7xl"
          >
            Tecnología que se siente{' '}
            <span className="bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
              extraordinaria
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 max-w-2xl text-lg text-muted-foreground"
          >
            Descubre iPhone, Mac, iPad y más. Productos originales, garantía oficial y la mejor
            experiencia de compra del país.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Link to="/catalogo">
              <Button size="lg" className="w-full sm:w-auto">
                Explorar tienda <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/catalogo/iphone">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Ver iPhone
              </Button>
            </Link>
          </motion.div>

          {/* Imagen estrella */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-14 w-full max-w-4xl"
          >
            <SmartImage
              src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1600&q=80"
              alt="Producto destacado"
              ratio="aspect-[16/10]"
              wrapperClassName="rounded-3xl border border-border shadow-lift"
            />
          </motion.div>
        </div>
      </section>

      {/* ===== Carrusel de categorías ===== */}
      <section className="container py-16">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="section-title">Explora por categoría</h2>
          <Link
            to="/catalogo"
            className="hidden items-center gap-1 text-sm font-medium text-brand-600 hover:underline sm:flex"
          >
            Ver todo <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-2xl" />
              ))
            : (categories.data ?? []).map((cat, i) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.04 }}
                >
                  <Link
                    to={`/catalogo/${cat.slug}`}
                    className="group relative block overflow-hidden rounded-2xl border border-border"
                  >
                    <SmartImage
                      src={cat.image}
                      alt={cat.name}
                      ratio="aspect-square"
                      className="transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className="absolute bottom-3 left-3 text-sm font-semibold text-white">
                      {cat.name}
                    </span>
                  </Link>
                </motion.div>
              ))}
        </div>
      </section>

      {/* ===== Banner promocional ===== */}
      <section className="container py-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 to-brand-500 px-8 py-16 text-white sm:px-14 sm:py-20">
          <div className="relative z-10 max-w-lg">
            <p className="text-sm font-medium uppercase tracking-widest opacity-80">Oferta limitada</p>
            <h3 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Hasta 15% de descuento en accesorios seleccionados
            </h3>
            <ul className="mt-5 space-y-2 text-sm opacity-90">
              {['Envío gratis', 'Garantía oficial', 'Pago a cuotas'].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <Check className="h-4 w-4" /> {t}
                </li>
              ))}
            </ul>
            <Link to="/catalogo/accesorios" className="mt-7 inline-block">
              <Button variant="secondary" size="lg" className="bg-white text-brand-700 hover:bg-white/90">
                Aprovechar oferta
              </Button>
            </Link>
          </div>
          <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        </div>
      </section>

      {/* ===== Destacados ===== */}
      <section className="container py-16">
        <div className="mb-8">
          <h2 className="section-title">Destacados</h2>
          <p className="mt-2 text-muted-foreground">Lo más deseado por nuestra comunidad.</p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {products.loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
              ))
            : featured.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </section>

      {/* ===== Nuevos lanzamientos ===== */}
      {fresh.length > 0 && (
        <section className="container py-16">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="section-title">Nuevos lanzamientos</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {fresh.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* ===== Newsletter ===== */}
      <Newsletter />
    </>
  );
}

function Newsletter() {
  const [email, setEmail] = React.useState('');
  const [sent, setSent] = React.useState(false);
  return (
    <section className="container py-20">
      <div className="mx-auto max-w-2xl rounded-3xl border border-border bg-card p-8 text-center sm:p-12">
        <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Sé el primero en enterarte
        </h3>
        <p className="mt-2 text-muted-foreground">
          Lanzamientos, ofertas exclusivas y novedades directo a tu correo.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (email.includes('@')) setSent(true);
          }}
          className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            className="h-12 flex-1 rounded-full border border-input bg-background px-5 text-[15px] focus:outline-none focus:ring-2 focus:ring-ring/60"
          />
          <Button type="submit" size="lg" disabled={sent}>
            {sent ? '¡Suscrito!' : 'Suscribirme'}
          </Button>
        </form>
      </div>
    </section>
  );
}
