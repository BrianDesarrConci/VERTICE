import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Star } from 'lucide-react';
import type { Product } from '@/lib/types';
import { formatCurrency } from '@/lib/format';
import { useCartStore } from '@/stores/cartStore';
import { useUIStore } from '@/stores/uiStore';
import { SmartImage } from '@/components/ui/smart-image';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/** Tarjeta de producto con hover premium, descuento y quick-add. */
export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useUIStore((s) => s.openCart);
  const lowStock = product.stock > 0 && product.stock <= 5;
  const hasDiscount = !!product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round((1 - product.price / (product.compareAtPrice as number)) * 100)
    : 0;

  const quickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.variants.length > 0) return; // con variantes → ir al PDP
    addItem(product, null, 1);
    openCart();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3), ease: [0.16, 1, 0.3, 1] }}
      className="group relative"
    >
      <Link
        to={`/producto/${product.slug}`}
        className={cn(
          'block overflow-hidden rounded-2xl border border-border bg-card',
          'transition-all duration-300 ease-premium hover:shadow-lift hover:-translate-y-1',
        )}
      >
        <div className="relative">
          <SmartImage
            src={product.images[0]}
            alt={product.name}
            ratio="aspect-[4/5]"
            className="transition-transform duration-500 group-hover:scale-[1.05]"
          />
          {/* Segunda imagen al hover (efecto Shein) */}
          {product.images[1] && (
            <img
              src={product.images[1]}
              alt=""
              aria-hidden
              loading="lazy"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          )}
          <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
            {hasDiscount && <Badge tone="danger">-{discountPct}%</Badge>}
            {product.isNew && <Badge tone="brand">Nuevo</Badge>}
            {lowStock && <Badge tone="warning">Solo {product.stock}</Badge>}
            {product.stock === 0 && <Badge tone="danger">Agotado</Badge>}
          </div>

          {product.variants.length === 0 && product.stock > 0 && (
            <button
              onClick={quickAdd}
              aria-label={`Añadir ${product.name} al carrito`}
              className={cn(
                'absolute bottom-3 right-3 z-10 grid h-11 w-11 place-items-center rounded-full',
                'bg-brand-500 text-neutral-950 shadow-glow',
                'opacity-0 translate-y-2 transition-all duration-300 ease-premium',
                'group-hover:opacity-100 group-hover:translate-y-0 hover:bg-brand-400 active:scale-95',
              )}
            >
              <Plus className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {product.brand}
          </p>
          <h3 className="mt-1 line-clamp-2 text-[15px] font-semibold leading-snug">{product.name}</h3>
          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span>{product.rating.toFixed(1)}</span>
            <span className="opacity-60">({product.reviewsCount})</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-lg font-bold tracking-tight">{formatCurrency(product.price)}</p>
            {hasDiscount && (
              <p className="text-sm text-muted-foreground line-through">
                {formatCurrency(product.compareAtPrice as number)}
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
