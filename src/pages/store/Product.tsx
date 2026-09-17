import * as React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ChevronLeft, Minus, Plus, ShieldCheck, Star, Truck, RotateCcw } from 'lucide-react';
import type { Product as ProductType, ProductVariant } from '@/lib/types';
import { api } from '@/lib/api';
import { useAsync } from '@/hooks/useAsync';
import { useCartStore } from '@/stores/cartStore';
import { useUIStore } from '@/stores/uiStore';
import { formatCurrency } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SmartImage } from '@/components/ui/smart-image';
import { ProductCard } from '@/components/product/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function Product() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: product, loading } = useAsync(() => api.getProductBySlug(slug!), [slug]);
  const related = useAsync(() => api.getProducts(), []);

  const addItem = useCartStore((s) => s.addItem);
  const openCart = useUIStore((s) => s.openCart);

  const [variant, setVariant] = React.useState<ProductVariant | null>(null);
  const [qty, setQty] = React.useState(1);
  const [activeImg, setActiveImg] = React.useState(0);
  const [tab, setTab] = React.useState<'specs' | 'shipping' | 'reviews'>('specs');
  const [added, setAdded] = React.useState(false);

  // Selecciona la primera variante disponible por defecto.
  React.useEffect(() => {
    if (product?.variants.length) {
      setVariant(product.variants.find((v) => v.stock > 0) ?? product.variants[0]);
    } else {
      setVariant(null);
    }
    setQty(1);
    setActiveImg(0);
  }, [product]);

  if (loading) return <ProductSkeleton />;
  if (!product) {
    return (
      <div className="container grid place-items-center py-32 text-center">
        <p className="text-lg font-semibold">Producto no encontrado</p>
        <Link to="/catalogo" className="mt-4">
          <Button variant="outline">Volver a la tienda</Button>
        </Link>
      </div>
    );
  }

  const currentStock = variant ? variant.stock : product.stock;
  const price = product.price + (variant?.priceDelta ?? 0);
  const installment = Math.round(price / 36);
  const relatedProducts = (related.data ?? [])
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAdd = () => {
    addItem(product, variant, qty);
    setAdded(true);
    openCart();
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="container py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Volver
      </button>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Galería */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <motion.div key={activeImg} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <SmartImage
              src={product.images[activeImg]}
              alt={product.name}
              ratio="aspect-square"
              wrapperClassName="rounded-3xl border border-border"
            />
          </motion.div>
          {product.images.length > 1 && (
            <div className="mt-4 flex gap-3">
              {product.images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={cn(
                    'overflow-hidden rounded-xl border-2 transition-all',
                    activeImg === i ? 'border-brand-600' : 'border-transparent opacity-60 hover:opacity-100',
                  )}
                >
                  <SmartImage src={src} alt={`Vista ${i + 1}`} ratio="aspect-square" wrapperClassName="h-20 w-20" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              {product.brand}
            </span>
            {product.isNew && <Badge tone="brand">Nuevo</Badge>}
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{product.name}</h1>

          <div className="mt-3 flex items-center gap-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'h-4 w-4',
                    i < Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30',
                  )}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {product.rating.toFixed(1)} · {product.reviewsCount} reseñas
            </span>
          </div>

          <div className="mt-6">
            <p className="text-4xl font-semibold tracking-tight">{formatCurrency(price)}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              o {formatCurrency(installment)}/mes a 36 cuotas
            </p>
          </div>

          <p className="mt-6 leading-relaxed text-muted-foreground">{product.description}</p>

          {/* Variantes */}
          {product.variants.length > 0 && (
            <div className="mt-7">
              <p className="mb-3 text-sm font-medium">Configuración</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    disabled={v.stock === 0}
                    onClick={() => setVariant(v)}
                    className={cn(
                      'rounded-xl border-2 p-3 text-left text-sm transition-all disabled:opacity-40',
                      variant?.id === v.id
                        ? 'border-brand-600 bg-brand-600/5'
                        : 'border-border hover:border-muted-foreground/40',
                    )}
                  >
                    <span className="block font-medium">{v.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {v.priceDelta > 0 ? `+ ${formatCurrency(v.priceDelta)}` : 'Precio base'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock */}
          <div className="mt-6 flex items-center gap-2 text-sm">
            {currentStock > 0 ? (
              <>
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-muted-foreground">
                  {currentStock <= 5 ? (
                    <span className="font-medium text-amber-600">¡Solo quedan {currentStock}!</span>
                  ) : (
                    'En stock · Envío inmediato'
                  )}
                </span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-red-500" />
                <span className="font-medium text-red-600">Agotado</span>
              </>
            )}
          </div>

          {/* Cantidad + añadir */}
          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center rounded-full border border-border">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="grid h-11 w-11 place-items-center rounded-full hover:bg-muted"
                aria-label="Restar"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center font-medium">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(currentStock, q + 1))}
                disabled={qty >= currentStock}
                className="grid h-11 w-11 place-items-center rounded-full hover:bg-muted disabled:opacity-40"
                aria-label="Sumar"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Button
              size="lg"
              className="flex-1"
              disabled={currentStock === 0}
              onClick={handleAdd}
            >
              {added ? (
                <>
                  <Check className="h-5 w-5" /> Añadido
                </>
              ) : (
                'Añadir al carrito'
              )}
            </Button>
          </div>

          {/* Garantías */}
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Perk icon={<Truck className="h-5 w-5" />} text="Envío gratis y rápido" />
            <Perk icon={<ShieldCheck className="h-5 w-5" />} text="Garantía oficial 12 meses" />
            <Perk icon={<RotateCcw className="h-5 w-5" />} text="Devolución en 30 días" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-16">
        <div className="flex gap-1 border-b border-border">
          {([
            ['specs', 'Especificaciones'],
            ['shipping', 'Envío y garantía'],
            ['reviews', `Reseñas (${product.reviewsCount})`],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                'relative px-4 py-3 text-sm font-medium transition-colors',
                tab === key ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {label}
              {tab === key && (
                <motion.span layoutId="tab-underline" className="absolute inset-x-0 -bottom-px h-0.5 bg-brand-600" />
              )}
            </button>
          ))}
        </div>

        <div className="py-8">
          {tab === 'specs' && <SpecsTab product={product} />}
          {tab === 'shipping' && <ShippingTab />}
          {tab === 'reviews' && <ReviewsTab product={product} />}
        </div>
      </div>

      {/* Relacionados */}
      {relatedProducts.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight">También te puede gustar</h2>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {relatedProducts.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Perk({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-3 text-sm">
      <span className="text-brand-600">{icon}</span>
      {text}
    </div>
  );
}

function SpecsTab({ product }: { product: ProductType }) {
  const specs = [
    ['SKU', product.sku],
    ['Marca', product.brand],
    ['Categoría', product.category],
    ['Calificación', `${product.rating.toFixed(1)} / 5`],
    ['Garantía', '12 meses'],
    ['Disponibilidad', product.stock > 0 ? 'En stock' : 'Agotado'],
  ];
  return (
    <div className="max-w-2xl">
      <dl className="divide-y divide-border">
        {specs.map(([k, v]) => (
          <div key={k} className="flex justify-between py-3 text-sm">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="font-medium capitalize">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function ShippingTab() {
  return (
    <div className="max-w-2xl space-y-4 text-sm text-muted-foreground">
      <p>
        <strong className="text-foreground">Envío gratis</strong> en compras superiores a
        $3.000.000. Entregas en 24-72 horas hábiles en las principales ciudades.
      </p>
      <p>
        <strong className="text-foreground">Garantía oficial</strong> de 12 meses contra defectos de
        fabricación. Soporte técnico especializado.
      </p>
      <p>
        <strong className="text-foreground">Devoluciones</strong> dentro de los primeros 30 días,
        sin preguntas, con producto en su empaque original.
      </p>
    </div>
  );
}

function ReviewsTab({ product }: { product: ProductType }) {
  // Reseñas de ejemplo (en producción vendrían del backend).
  const reviews = [
    { name: 'Andrés P.', rating: 5, text: 'Producto impecable, llegó rapidísimo. Totalmente recomendado.' },
    { name: 'Valentina M.', rating: 5, text: 'La calidad es excepcional. La mejor compra del año.' },
    { name: 'Julián R.', rating: 4, text: 'Muy buen producto, aunque el empaque llegó un poco golpeado.' },
  ];
  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center gap-4">
        <span className="text-5xl font-semibold">{product.rating.toFixed(1)}</span>
        <div>
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn('h-4 w-4', i < Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30')}
              />
            ))}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Basado en {product.reviewsCount} reseñas</p>
        </div>
      </div>
      <div className="space-y-5">
        {reviews.map((r, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="font-medium">{r.name}</span>
              <div className="flex">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className={cn('h-3.5 w-3.5', j < r.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30')} />
                ))}
              </div>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{r.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="container grid gap-10 py-8 lg:grid-cols-2">
      <Skeleton className="aspect-square rounded-3xl" />
      <div className="space-y-4">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}
