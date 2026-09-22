import * as React from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useUIStore } from '@/stores/uiStore';
import { useSiteContent } from '@/hooks/useSiteContent';
import { useStoreConfig } from '@/hooks/useStoreConfig';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { cn } from '@/lib/utils';
import { DEPARTMENTS } from '@/lib/types';

// Categorías (tipo de prenda) que se muestran dentro de cada departamento.
const DEPT_CATEGORIES = [
  { slug: 'camisetas', label: 'Camisetas' },
  { slug: 'hoodies', label: 'Hoodies & Sacos' },
  { slug: 'gorras', label: 'Gorras' },
  { slug: 'accesorios', label: 'Accesorios' },
];

const DEPT_IMAGES: Record<string, string> = {
  dama: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80',
  caballero: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=600&q=80',
  nino: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=600&q=80',
};

export function Header() {
  const count = useCartStore((s) => s.count());
  const openCart = useUIStore((s) => s.openCart);
  const content = useSiteContent();
  const config = useStoreConfig();
  const location = useLocation();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [mega, setMega] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const closeTimer = React.useRef<number | null>(null);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Cierra menús al cambiar de ruta.
  React.useEffect(() => {
    setMega(false);
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  const openMega = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setMega(true);
  };
  const scheduleClose = () => {
    closeTimer.current = window.setTimeout(() => setMega(false), 120);
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) navigate(`/catalogo?q=${encodeURIComponent(query.trim())}`);
    setMobileOpen(false);
  };

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    cn(
      'rounded-full px-3 py-1.5 text-sm font-semibold transition-colors',
      isActive ? 'text-brand-700 dark:text-brand-400' : 'text-foreground/80 hover:text-foreground',
    );

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Barra de anuncios (marquee) */}
      {content.showAnnouncement && content.announcement && (
        <div className="brand-gradient overflow-hidden text-neutral-950">
          <div className="flex whitespace-nowrap py-1.5 text-xs font-semibold">
            <div className="flex animate-marquee gap-12 pr-12">
              {[0, 1].map((k) => (
                <span key={k}>{content.announcement}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Barra principal */}
      <div
        className={cn(
          'w-full border-b transition-all duration-300 ease-premium glass',
          scrolled ? 'border-border shadow-soft' : 'border-transparent',
        )}
        onMouseLeave={scheduleClose}
      >
        <div className={cn('container flex items-center justify-between gap-4 transition-all', scrolled ? 'h-14' : 'h-16')}>
          {/* Logo (dinámico: imagen si el admin subió logo, si no logotipo por texto) */}
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-extrabold tracking-tight">
            {config.logoUrl ? (
              <img src={config.logoUrl} alt={config.storeName} className="h-8 w-auto max-w-[160px] object-contain" />
            ) : (
              <>
                <span className="grid h-8 w-8 place-items-center rounded-xl brand-gradient text-neutral-950">
                  {config.storeName.charAt(0)}
                </span>
                {config.storeName}
              </>
            )}
          </Link>

          {/* Nav desktop */}
          <nav className="hidden items-center gap-1 md:flex">
            <NavLink to="/" end className={linkCls}>Inicio</NavLink>

            {/* Categorías con mega-menú */}
            <div className="relative" onMouseEnter={openMega}>
              <button
                onClick={() => navigate('/categorias/dama')}
                className={cn(
                  'flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors',
                  mega || location.pathname.startsWith('/categorias')
                    ? 'text-brand-700 dark:text-brand-400'
                    : 'text-foreground/80 hover:text-foreground',
                )}
                aria-expanded={mega}
              >
                Categorías
                <ChevronDown className={cn('h-4 w-4 transition-transform', mega && 'rotate-180')} />
              </button>
            </div>

            <NavLink to="/resenas" className={linkCls}>Reseñas</NavLink>
            <NavLink to="/nosotros" className={linkCls}>¿Quiénes Somos?</NavLink>
          </nav>

          {/* Acciones */}
          <div className="flex items-center gap-1">
            {content.showSearch && (
              <form onSubmit={submitSearch} className="hidden lg:block">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar…"
                    aria-label="Buscar productos"
                    className="h-9 w-40 rounded-full border border-input bg-muted/50 pl-9 pr-3 text-sm transition-all focus:w-56 focus:outline-none focus:ring-2 focus:ring-ring/50"
                  />
                </div>
              </form>
            )}

            <ThemeToggle />

            <Link to="/cuenta" aria-label="Mi cuenta" className="hidden h-10 w-10 place-items-center rounded-full text-foreground transition-colors hover:bg-muted sm:grid">
              <User className="h-5 w-5" />
            </Link>

            <button onClick={openCart} aria-label="Abrir carrito" className="relative grid h-10 w-10 place-items-center rounded-full text-foreground transition-colors hover:bg-muted">
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full brand-gradient px-1 text-[11px] font-bold text-neutral-950">
                  {count}
                </span>
              )}
            </button>

            <button onClick={() => setMobileOpen((v) => !v)} aria-label="Menú" className="grid h-10 w-10 place-items-center rounded-full text-foreground transition-colors hover:bg-muted md:hidden">
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mega-menú (glassmorphism sobre contenido) */}
        <AnimatePresence>
          {mega && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              onMouseEnter={openMega}
              onMouseLeave={scheduleClose}
              className="absolute inset-x-0 top-full hidden border-b border-border bg-card shadow-lift md:block"
            >
              <div className="container grid grid-cols-4 gap-6 py-8">
                {DEPARTMENTS.map((dep) => (
                  <div key={dep.slug}>
                    <Link
                      to={`/categorias/${dep.slug}`}
                      className="mb-3 flex items-center gap-1 text-base font-bold tracking-tight hover:text-brand-700 dark:hover:text-brand-400"
                    >
                      {dep.label}
                    </Link>
                    <ul className="space-y-2">
                      {DEPT_CATEGORIES.map((c) => (
                        <li key={c.slug}>
                          <Link
                            to={`/categorias/${dep.slug}?cat=${c.slug}`}
                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                          >
                            {c.label}
                          </Link>
                        </li>
                      ))}
                      <li>
                        <Link to={`/categorias/${dep.slug}`} className="text-sm font-semibold text-brand-700 hover:underline dark:text-brand-400">
                          Ver todo →
                        </Link>
                      </li>
                    </ul>
                  </div>
                ))}
                {/* Tile promocional */}
                <Link to="/categorias/dama" className="relative overflow-hidden rounded-2xl">
                  <img src={DEPT_IMAGES.dama} alt="Colección" className="h-full min-h-[180px] w-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="text-xs font-semibold uppercase tracking-widest opacity-90">Nueva colección</p>
                    <p className="text-lg font-bold">Explora ya</p>
                  </div>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Menú móvil */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-b border-border bg-card md:hidden"
          >
            <div className="container space-y-1 py-4">
              <form onSubmit={submitSearch} className="relative mb-3">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar productos"
                  className="h-11 w-full rounded-xl border border-input bg-muted/50 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
                />
              </form>
              <MobileLink to="/">Inicio</MobileLink>
              <p className="px-3 pb-1 pt-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Categorías</p>
              {DEPARTMENTS.map((d) => (
                <MobileLink key={d.slug} to={`/categorias/${d.slug}`} indent>{d.label}</MobileLink>
              ))}
              <MobileLink to="/resenas">Reseñas</MobileLink>
              <MobileLink to="/nosotros">¿Quiénes Somos?</MobileLink>
              <MobileLink to="/cuenta">Mi cuenta</MobileLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function MobileLink({ to, children, indent }: { to: string; children: React.ReactNode; indent?: boolean }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'block rounded-xl px-3 py-2.5 text-base font-medium transition-colors',
          indent && 'pl-6',
          isActive ? 'bg-muted text-brand-700 dark:text-brand-400' : 'text-foreground hover:bg-muted',
        )
      }
    >
      {children}
    </NavLink>
  );
}
