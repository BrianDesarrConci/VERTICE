import * as React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, Search, ShoppingBag, X } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useUIStore } from '@/stores/uiStore';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { cn } from '@/lib/utils';

const NAV = [
  { to: '/catalogo/camisetas', label: 'Camisetas' },
  { to: '/catalogo/hoodies', label: 'Hoodies' },
  { to: '/catalogo/libretas', label: 'Libretas' },
  { to: '/catalogo/totebags', label: 'Totebags' },
  { to: '/catalogo/gorras', label: 'Gorras' },
  { to: '/catalogo', label: 'Tienda' },
];

export function Header() {
  const count = useCartStore((s) => s.count());
  const openCart = useUIStore((s) => s.openCart);
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const navigate = useNavigate();

  // Header se reduce y aumenta opacidad del blur al hacer scroll.
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) navigate(`/catalogo?q=${encodeURIComponent(query.trim())}`);
    setMobileOpen(false);
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b transition-all duration-300 ease-premium glass',
        scrolled ? 'h-14 border-border shadow-soft' : 'h-16 border-transparent',
      )}
    >
      <div className="container flex h-full items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-600 text-white">
            V
          </span>
          VÉRTICE
        </Link>

        {/* Nav desktop */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/catalogo'}
              className={({ isActive }) =>
                cn(
                  'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                  isActive ? 'text-brand-600' : 'text-foreground/80 hover:text-foreground',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Acciones */}
        <div className="flex items-center gap-1">
          <form onSubmit={submitSearch} className="hidden lg:block">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar productos"
                aria-label="Buscar productos"
                className="h-9 w-44 rounded-full border border-input bg-muted/50 pl-9 pr-3 text-sm transition-all focus:w-60 focus:outline-none focus:ring-2 focus:ring-ring/50"
              />
            </div>
          </form>

          <ThemeToggle />

          <button
            onClick={openCart}
            aria-label="Abrir carrito"
            className="relative grid h-10 w-10 place-items-center rounded-full text-foreground transition-colors hover:bg-muted"
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand-600 px-1 text-[11px] font-semibold text-white">
                {count}
              </span>
            )}
          </button>

          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menú"
            className="grid h-10 w-10 place-items-center rounded-full text-foreground transition-colors hover:bg-muted md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Menú móvil */}
      {mobileOpen && (
        <div className="animate-fade-up border-t border-border glass md:hidden">
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
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/catalogo'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'block rounded-xl px-3 py-2.5 text-base font-medium',
                    isActive ? 'bg-muted text-brand-600' : 'text-foreground hover:bg-muted',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
