import * as React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight, Quote, Sparkles, Star } from 'lucide-react';
import { api } from '@/lib/api';
import { useAsync } from '@/hooks/useAsync';
import { useSiteContent } from '@/hooks/useSiteContent';
import { ProductCard } from '@/components/product/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { SmartImage } from '@/components/ui/smart-image';
import { cn } from '@/lib/utils';

const DEPT_TILES = [
  { slug: 'dama', label: 'Dama', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80' },
  { slug: 'caballero', label: 'Caballero', image: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=800&q=80' },
  { slug: 'nino', label: 'Niño', image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=800&q=80' },
];

export function Home() {
  const content = useSiteContent();
  const products = useAsync(() => api.getProducts(), []);
  const reviews = useAsync(() => api.getReviews(), []);

  const featured = (products.data ?? []).filter((p) => p.featured).slice(0, 8);
  const fresh = (products.data ?? []).filter((p) => p.isNew).slice(0, 4);

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="container pt-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-border">
          <SmartImage
            src={content.heroImage}
            alt="Colección VÉRTICE"
            ratio="aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/9]"
            wrapperClassName="w-full"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />
          <div className="absolute inset-0 flex items-center">
            <div className="container">
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-xl text-white">
                <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-sm font-semibold">
                  <Sparkles className="h-4 w-4 text-brand-400" /> {content.heroEyebrow}
                </span>
                <h1 className="mt-4 font-display text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl md:text-7xl">
                  {content.heroTitle}{' '}
                  <span className="brand-text">{content.heroHighlight}</span>
                </h1>
                <p className="mt-4 max-w-md text-base text-white/85 sm:text-lg">{content.heroSubtitle}</p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link to="/catalogo"><Button size="lg" className="w-full sm:w-auto">Comprar ahora <ArrowRight className="h-4 w-4" /></Button></Link>
                  <Link to="/categorias/dama"><Button size="lg" variant="secondary" className="w-full bg-white text-neutral-950 hover:bg-white/90 sm:w-auto">Ver colecciones</Button></Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Departamentos ===== */}
      <section className="container py-14">
        <div className="mb-8 text-center">
          <h2 className="section-title">Compra por categoría</h2>
          <p className="mt-2 text-muted-foreground">Encuentra tu estilo en cada colección.</p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {DEPT_TILES.map((d, i) => (
            <motion.div key={d.slug} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.5, delay: i * 0.08 }}>
              <Link to={`/categorias/${d.slug}`} className="group relative block aspect-[3/4] overflow-hidden rounded-3xl bg-muted">
                <img src={d.image} alt={d.label} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <h3 className="text-2xl font-extrabold tracking-tight">{d.label}</h3>
                  <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand-300">
                    Explorar <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== Tendencias ===== */}
      <section className="container py-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="section-title">Tendencia ahora</h2>
            <p className="mt-2 text-muted-foreground">Lo más deseado de la temporada.</p>
          </div>
          <Link to="/catalogo" className="hidden items-center gap-1 text-sm font-semibold text-brand-700 hover:underline dark:text-brand-400 sm:flex">
            Ver todo <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {products.loading
            ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />)
            : featured.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </section>

      {/* ===== Promo (cotización) ===== */}
      <section className="container py-14">
        <div className="relative overflow-hidden rounded-3xl brand-gradient px-8 py-14 text-neutral-950 sm:px-14 sm:py-16">
          <div className="relative z-10 max-w-lg">
            <p className="text-sm font-bold uppercase tracking-widest opacity-70">Empresas y eventos</p>
            <h3 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{content.promoTitle}</h3>
            <p className="mt-3 text-sm sm:text-base">{content.promoText}</p>
            <Link to="/nosotros" className="mt-6 inline-block">
              <Button size="lg" variant="secondary" className="bg-neutral-950 text-white hover:bg-neutral-800">Solicitar cotización</Button>
            </Link>
          </div>
          <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-white/25 blur-2xl" />
        </div>
      </section>

      {/* ===== Novedades ===== */}
      {fresh.length > 0 && (
        <section className="container py-6">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="section-title">Recién llegado</h2>
            <Link to="/catalogo" className="hidden items-center gap-1 text-sm font-semibold text-brand-700 hover:underline dark:text-brand-400 sm:flex">
              Ver todo <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {fresh.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}

      {/* ===== Reseñas teaser ===== */}
      <section className="container py-14">
        <div className="mb-8 text-center">
          <h2 className="section-title">Clientes felices</h2>
          <p className="mt-2 text-muted-foreground">Miles de personas ya visten VÉRTICE.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          {(reviews.data ?? []).slice(0, 3).map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: i * 0.06 }} className="relative rounded-2xl border border-border bg-card p-6 shadow-soft">
              <Quote className="absolute right-5 top-5 h-8 w-8 text-brand-500/20" />
              <div className="flex">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className={cn('h-4 w-4', j < r.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30')} />
                ))}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-foreground/90">{r.text}</p>
              <p className="mt-4 text-sm font-semibold">{r.name}</p>
            </motion.div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link to="/resenas"><Button variant="outline">Ver todas las reseñas</Button></Link>
        </div>
      </section>

      <Newsletter />
    </>
  );
}

function Newsletter() {
  const [email, setEmail] = React.useState('');
  const [sent, setSent] = React.useState(false);
  return (
    <section className="container py-16">
      <div className="mx-auto max-w-2xl rounded-3xl glass-panel p-8 text-center sm:p-12">
        <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">Únete a la comunidad VÉRTICE</h3>
        <p className="mt-2 text-muted-foreground">Lanzamientos, descuentos exclusivos y drops limitados directo a tu correo.</p>
        <form onSubmit={(e) => { e.preventDefault(); if (email.includes('@')) setSent(true); }} className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" className="h-12 flex-1 rounded-full border border-input bg-background px-5 text-[15px] focus:outline-none focus:ring-2 focus:ring-ring/60" />
          <Button type="submit" size="lg" disabled={sent}>{sent ? '¡Suscrito!' : 'Suscribirme'}</Button>
        </form>
      </div>
    </section>
  );
}
