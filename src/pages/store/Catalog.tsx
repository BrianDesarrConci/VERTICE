import * as React from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { LayoutGrid, List, SlidersHorizontal, Star, X } from 'lucide-react';
import type { Product } from '@/lib/types';
import { api } from '@/lib/api';
import { useAsync } from '@/hooks/useAsync';
import { ProductCard } from '@/components/product/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SmartImage } from '@/components/ui/smart-image';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';

type SortKey = 'relevance' | 'price-asc' | 'price-desc' | 'newest';

export function Catalog() {
  const { category } = useParams<{ category?: string }>();
  const [searchParams] = useSearchParams();
  const search = searchParams.get('q') ?? '';

  const products = useAsync(() => api.getProducts({ category, search }), [category, search]);
  const categories = useAsync(() => api.getCategories(), []);

  const [sort, setSort] = React.useState<SortKey>('relevance');
  const [view, setView] = React.useState<'grid' | 'list'>('grid');
  const [maxPrice, setMaxPrice] = React.useState<number>(0);
  const [brands, setBrands] = React.useState<Set<string>>(new Set());
  const [onlyAvailable, setOnlyAvailable] = React.useState(false);
  const [minRating, setMinRating] = React.useState(0);
  const [filtersOpen, setFiltersOpen] = React.useState(false);

  const all = products.data ?? [];
  const allBrands = React.useMemo(() => [...new Set(all.map((p) => p.brand))], [all]);
  const priceMax = React.useMemo(() => Math.max(0, ...all.map((p) => p.price)), [all]);

  // Filtrado + ordenamiento derivado (memoizado).
  const filtered = React.useMemo(() => {
    let list = [...all];
    if (maxPrice > 0) list = list.filter((p) => p.price <= maxPrice);
    if (brands.size > 0) list = list.filter((p) => brands.has(p.brand));
    if (onlyAvailable) list = list.filter((p) => p.stock > 0);
    if (minRating > 0) list = list.filter((p) => p.rating >= minRating);

    switch (sort) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
        break;
    }
    return list;
  }, [all, maxPrice, brands, onlyAvailable, minRating, sort]);

  const toggleBrand = (b: string) =>
    setBrands((prev) => {
      const next = new Set(prev);
      next.has(b) ? next.delete(b) : next.add(b);
      return next;
    });

  const clearFilters = () => {
    setMaxPrice(0);
    setBrands(new Set());
    setOnlyAvailable(false);
    setMinRating(0);
  };

  const activeFilters = (maxPrice > 0 ? 1 : 0) + brands.size + (onlyAvailable ? 1 : 0) + (minRating > 0 ? 1 : 0);
  const currentCat = categories.data?.find((c) => c.slug === category);

  return (
    <div className="container py-10">
      {/* Encabezado */}
      <div className="mb-8">
        <nav className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Inicio</Link>
          <span>/</span>
          <span className="text-foreground">{currentCat?.name ?? (search ? `“${search}”` : 'Tienda')}</span>
        </nav>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {currentCat?.name ?? (search ? `Resultados para “${search}”` : 'Todos los productos')}
        </h1>
        <p className="mt-2 text-muted-foreground">{filtered.length} productos</p>
      </div>

      {/* Chips de categorías */}
      <div className="mb-8 flex flex-wrap gap-2">
        <CategoryChip to="/catalogo" active={!category}>Todo</CategoryChip>
        {(categories.data ?? []).map((c) => (
          <CategoryChip key={c.id} to={`/catalogo/${c.slug}`} active={category === c.slug}>
            {c.name}
          </CategoryChip>
        ))}
      </div>

      <div className="flex gap-8">
        {/* Sidebar filtros (desktop) */}
        <aside className="hidden w-64 flex-shrink-0 lg:block">
          <FilterPanel
            priceMax={priceMax}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            allBrands={allBrands}
            brands={brands}
            toggleBrand={toggleBrand}
            onlyAvailable={onlyAvailable}
            setOnlyAvailable={setOnlyAvailable}
            minRating={minRating}
            setMinRating={setMinRating}
            activeFilters={activeFilters}
            clearFilters={clearFilters}
          />
        </aside>

        {/* Contenido */}
        <div className="flex-1">
          {/* Barra de herramientas */}
          <div className="mb-6 flex items-center justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden"
              onClick={() => setFiltersOpen(true)}
            >
              <SlidersHorizontal className="h-4 w-4" /> Filtros
              {activeFilters > 0 && <Badge tone="brand">{activeFilters}</Badge>}
            </Button>

            <div className="ml-auto flex items-center gap-3">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                aria-label="Ordenar"
                className="h-9 rounded-full border border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
              >
                <option value="relevance">Relevancia</option>
                <option value="newest">Novedad</option>
                <option value="price-asc">Precio: menor a mayor</option>
                <option value="price-desc">Precio: mayor a menor</option>
              </select>

              <div className="hidden items-center rounded-full border border-border p-0.5 sm:flex">
                <button
                  onClick={() => setView('grid')}
                  aria-label="Vista cuadrícula"
                  className={cn('grid h-8 w-8 place-items-center rounded-full', view === 'grid' && 'bg-muted')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setView('list')}
                  aria-label="Vista lista"
                  className={cn('grid h-8 w-8 place-items-center rounded-full', view === 'list' && 'bg-muted')}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Resultados */}
          {products.loading ? (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="grid place-items-center rounded-2xl border border-dashed border-border py-24 text-center">
              <p className="font-semibold">No encontramos productos</p>
              <p className="mt-1 text-sm text-muted-foreground">Ajusta los filtros e intenta de nuevo.</p>
              {activeFilters > 0 && (
                <Button variant="outline" size="sm" className="mt-4" onClick={clearFilters}>
                  Limpiar filtros
                </Button>
              )}
            </div>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
              {filtered.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((p) => (
                <ProductRow key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filtros móvil (drawer) */}
      {filtersOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setFiltersOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-80 max-w-[85%] overflow-y-auto bg-card p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Filtros</h3>
              <button onClick={() => setFiltersOpen(false)} aria-label="Cerrar" className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>
            <FilterPanel
              priceMax={priceMax}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              allBrands={allBrands}
              brands={brands}
              toggleBrand={toggleBrand}
              onlyAvailable={onlyAvailable}
              setOnlyAvailable={setOnlyAvailable}
              minRating={minRating}
              setMinRating={setMinRating}
              activeFilters={activeFilters}
              clearFilters={clearFilters}
            />
            <Button className="mt-6 w-full" onClick={() => setFiltersOpen(false)}>
              Ver {filtered.length} productos
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryChip({ to, active, children }: { to: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className={cn(
        'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
        active
          ? 'border-brand-600 bg-brand-600 text-white'
          : 'border-border bg-card hover:bg-muted',
      )}
    >
      {children}
    </Link>
  );
}

interface FilterPanelProps {
  priceMax: number;
  maxPrice: number;
  setMaxPrice: (v: number) => void;
  allBrands: string[];
  brands: Set<string>;
  toggleBrand: (b: string) => void;
  onlyAvailable: boolean;
  setOnlyAvailable: (v: boolean) => void;
  minRating: number;
  setMinRating: (v: number) => void;
  activeFilters: number;
  clearFilters: () => void;
}

function FilterPanel(props: FilterPanelProps) {
  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filtros</h3>
        {props.activeFilters > 0 && (
          <button onClick={props.clearFilters} className="text-xs text-brand-600 hover:underline">
            Limpiar ({props.activeFilters})
          </button>
        )}
      </div>

      {/* Precio */}
      <div>
        <p className="mb-3 text-sm font-medium">Precio máximo</p>
        <input
          type="range"
          min={0}
          max={props.priceMax}
          step={100000}
          value={props.maxPrice || props.priceMax}
          onChange={(e) => props.setMaxPrice(Number(e.target.value))}
          className="w-full accent-brand-600"
        />
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>{formatCurrency(0)}</span>
          <span>{formatCurrency(props.maxPrice || props.priceMax)}</span>
        </div>
      </div>

      {/* Marca */}
      <div>
        <p className="mb-3 text-sm font-medium">Marca</p>
        <div className="space-y-2">
          {props.allBrands.map((b) => (
            <label key={b} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={props.brands.has(b)}
                onChange={() => props.toggleBrand(b)}
                className="h-4 w-4 rounded accent-brand-600"
              />
              {b}
            </label>
          ))}
        </div>
      </div>

      {/* Disponibilidad */}
      <div>
        <p className="mb-3 text-sm font-medium">Disponibilidad</p>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={props.onlyAvailable}
            onChange={(e) => props.setOnlyAvailable(e.target.checked)}
            className="h-4 w-4 rounded accent-brand-600"
          />
          Solo disponibles
        </label>
      </div>

      {/* Rating */}
      <div>
        <p className="mb-3 text-sm font-medium">Calificación</p>
        <div className="space-y-2">
          {[4, 3, 0].map((r) => (
            <label key={r} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                name="rating"
                checked={props.minRating === r}
                onChange={() => props.setMinRating(r)}
                className="h-4 w-4 accent-brand-600"
              />
              {r === 0 ? (
                'Todas'
              ) : (
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {r}+ estrellas
                </span>
              )}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductRow({ product }: { product: Product }) {
  return (
    <Link
      to={`/producto/${product.slug}`}
      className="flex gap-5 rounded-2xl border border-border bg-card p-4 transition-all hover:shadow-soft"
    >
      <SmartImage
        src={product.images[0]}
        alt={product.name}
        ratio="aspect-square"
        wrapperClassName="h-32 w-32 flex-shrink-0 rounded-xl"
      />
      <div className="flex flex-1 flex-col">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{product.brand}</p>
        <h3 className="mt-1 text-lg font-semibold">{product.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
        <div className="mt-auto flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {product.rating.toFixed(1)}
          </span>
          <span className="text-xl font-semibold">{formatCurrency(product.price)}</span>
        </div>
      </div>
    </Link>
  );
}
