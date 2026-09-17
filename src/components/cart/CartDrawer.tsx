import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useUIStore } from '@/stores/uiStore';
import { useStoreConfig } from '@/hooks/useStoreConfig';
import { formatCurrency } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { SmartImage } from '@/components/ui/smart-image';

/** Carrito como drawer lateral deslizante con cálculo de totales en vivo. */
export function CartDrawer() {
  const open = useUIStore((s) => s.cartOpen);
  const closeCart = useUIStore((s) => s.closeCart);
  const items = useCartStore((s) => s.items);
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);
  const config = useStoreConfig();
  const totals = useCartStore((s) => s.totals)(config);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeCart}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
          />
          {/* Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-[61] flex h-full w-full max-w-md flex-col bg-card shadow-2xl"
            role="dialog"
            aria-label="Carrito de compras"
          >
            <div className="flex items-center justify-between border-b border-border p-5">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <ShoppingBag className="h-5 w-5" /> Tu carrito
              </h2>
              <button
                onClick={closeCart}
                aria-label="Cerrar carrito"
                className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-muted">
                  <ShoppingBag className="h-7 w-7 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold">Tu carrito está vacío</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Explora nuestros productos y encuentra algo increíble.
                  </p>
                </div>
                <Button onClick={closeCart} variant="outline">
                  Seguir comprando
                </Button>
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-4 overflow-y-auto p-5">
                  {items.map((item) => (
                    <div key={`${item.productId}-${item.variantId}`} className="flex gap-3">
                      <SmartImage
                        src={item.image}
                        alt={item.name}
                        ratio="aspect-square"
                        wrapperClassName="h-20 w-20 flex-shrink-0 rounded-xl"
                      />
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium leading-snug">{item.name}</p>
                          <button
                            onClick={() => removeItem(item.productId, item.variantId)}
                            aria-label="Eliminar"
                            className="text-muted-foreground transition-colors hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {formatCurrency(item.unitPrice)}
                        </p>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center rounded-full border border-border">
                            <button
                              onClick={() => updateQty(item.productId, item.variantId, item.qty - 1)}
                              className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted"
                              aria-label="Restar"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium">{item.qty}</span>
                            <button
                              onClick={() => updateQty(item.productId, item.variantId, item.qty + 1)}
                              disabled={item.qty >= item.maxStock}
                              className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted disabled:opacity-40"
                              aria-label="Sumar"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <p className="text-sm font-semibold">
                            {formatCurrency(item.unitPrice * item.qty)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Resumen */}
                <div className="space-y-3 border-t border-border p-5">
                  <Row label="Subtotal" value={formatCurrency(totals.subtotal)} />
                  {totals.discount > 0 && (
                    <Row label="Descuento" value={`- ${formatCurrency(totals.discount)}`} accent />
                  )}
                  <Row
                    label="Envío"
                    value={totals.shipping === 0 ? 'Gratis' : formatCurrency(totals.shipping)}
                  />
                  <Row label={`IVA (${Math.round(config.taxRate * 100)}%)`} value={formatCurrency(totals.tax)} />
                  <div className="flex items-center justify-between border-t border-border pt-3 text-base font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(totals.total)}</span>
                  </div>
                  <Link to="/checkout" onClick={closeCart}>
                    <Button className="w-full" size="lg">
                      Finalizar compra
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={accent ? 'font-medium text-emerald-600' : 'font-medium'}>{value}</span>
    </div>
  );
}
