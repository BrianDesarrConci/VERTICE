import * as React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import { useAsync } from '@/hooks/useAsync';
import { ProductCard } from '@/components/product/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { SmartImage } from '@/components/ui/smart-image';

// Mosaico de colecciones destacadas estilo Apple (texto arriba, imagen debajo).
const FEATURE_TILES = [
  {
    eyebrow: 'Camisetas',
    title: 'Tu diseño, en algodón premium',
    subtitle: 'Estampados que no se agrietan. Cortes que se sienten.',
    to: '/catalogo/camisetas',
    image:
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1400&q=80',
    dark: true,
  },
  {
    eyebrow: 'Hoodies & Sacos',
    title: 'Abrígate con actitud',
    subtitle: 'Felpa premium, bordados de marca y una caída impecable.',
    to: '/catalogo/hoodies',
    image:
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1400&q=80',
    dark: true,
  },
];

export function Home() {
  const products = useAsync(() => api.getProducts(), []);
  const categories = useAsync(() => api.getCategories(), []);

  const featured = (products.data ?? []).filter((p) => p.featured);
  const fresh = (products.data ?? []).filter((p) => p.isNew).slice(0, 4);

  return (
    <>
      {/* ===== HERO cinematográfico ===== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-muted/40 to-background">
        <div className="container flex flex-col items-center py-16 text-center sm:py-24">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground"
          >
            <Sparkles className="h-4 w-4 text-brand-600" /> Nueva colección disponible
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="max-w-4xl text-balance text-5xl font-semibold tracking-tight sm:text-7xl md:text-[5.5rem] md:leading-[1.02]"
          >
            Impacto que se{' '}
            <span className="bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
              lleva puesto
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl"
          >
            Camisetas, hoodies, libretas y más — estampados con calidad premium.
            Diseño que deja huella, hecho para durar.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Link to="/catalogo">
              <Button size="lg" className="w-full sm:w-auto">
                Explorar colección <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/catalogo/camisetas">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Ver camisetas
              </Button>
            </Link>
          </motion.div>

          {/* Imagen estrella */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-14 w-full max-w-5xl"
          >
            <SmartImage
              src="https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1600&q=80"
              alt="Colección VÉRTICE"
              ratio="aspect-[16/9]"
              wrapperClassName="rounded-3xl border border-border shadow-lift"
            />
          </motion.div>
        </div>
      </section>

      {/* ===== Mosaico de colecciones (estilo Apple) ===== */}
      <section className="container grid grid-cols-1 gap-4 py-4 md:grid-cols-2">
        {FEATURE_TILES.map((tile, i) => (
          <motion.div
            key={tile.to}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
          >
            <Link
              to={tile.to}
              className="group relative flex aspect-[4/5] flex-col items-center overflow-hidden rounded-3xl bg-muted sm:aspect-[16/10] md:aspect-[4/5] lg:aspect-[16/10]"
            >
              <img
                src={tile.image}
                alt={tile.eyebrow}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-transparent" />
              <div className="relative z-10 px-6 pt-8 text-center text-white sm:pt-10">
                <p className="text-sm font-semibold uppercase tracking-widest opacity-90">{tile.eyebrow}</p>
                <h3 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{tile.title}</h3>
                <p className="mt-1 text-sm opacity-90 sm:text-base">{tile.subtitle}</p>
                <span className="mt-4 inline-flex items-center gap-1 rounded-full bg-white px-5 py-2 text-sm font-medium text-black transition-transform group-hover:scale-[1.03]">
                  Comprar <ChevronRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
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

      {/* ===== Banner: personalización ===== */}
      <section className="container py-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 to-brand-500 px-8 py-16 text-white sm:px-14 sm:py-20">
          <div className="relative z-10 max-w-lg">
            <p className="text-sm font-medium uppercase tracking-widest opacity-80">Para empresas y eventos</p>
            <h3 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              ¿Necesitas merch personalizado por volumen?
            </h3>
            <p className="mt-4 text-sm opacity-90 sm:text-base">
              Estampamos tu marca en camisetas, hoodies, libretas y totebags. Cotización rápida,
              precios por cantidad y entrega a tiempo.
            </p>
            <Link to="/catalogo" className="mt-7 inline-block">
              <Button variant="secondary" size="lg" className="bg-white text-brand-700 hover:bg-white/90">
                Solicitar cotización
              </Button>
            </Link>
          </div>
          <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        </div>
      </section>

      {/* ===== Destacados ===== */}
      <section className="container py-16">
        <div className="mb-8">
          <h2 className="section-title">Los favoritos</h2>
          <p className="mt-2 text-muted-foreground">Lo más pedido por nuestra comunidad.</p>
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
            <h2 className="section-title">Recién llegado</h2>
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
          Únete a la comunidad VÉRTICE
        </h3>
        <p className="mt-2 text-muted-foreground">
          Lanzamientos, descuentos exclusivos y drops limitados directo a tu correo.
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
