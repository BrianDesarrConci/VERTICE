import * as React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { Check, ChevronLeft, CreditCard, Lock, Tag } from 'lucide-react';
import { api } from '@/lib/api';
import { useCartStore } from '@/stores/cartStore';
import { useStoreConfig } from '@/hooks/useStoreConfig';
import { formatCurrency } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SmartImage } from '@/components/ui/smart-image';
import { cn } from '@/lib/utils';
import type { CreateOrderPayload } from '@/lib/types';

// ---- Esquemas de validación por paso (Zod) ----
const contactSchema = z.object({
  name: z.string().min(3, 'Ingresa tu nombre completo'),
  email: z.string().email('Correo no válido'),
  phone: z.string().min(7, 'Teléfono no válido'),
});
const addressSchema = z.object({
  address: z.string().min(5, 'Ingresa una dirección válida'),
  city: z.string().min(2, 'Ingresa tu ciudad'),
});

const SHIPPING_METHODS = [
  { id: 'standard', label: 'Estándar', desc: '3-5 días hábiles', price: 25000 },
  { id: 'express', label: 'Express', desc: '24-48 horas', price: 45000 },
  { id: 'pickup', label: 'Recoger en tienda', desc: 'Gratis · disponible hoy', price: 0 },
];

const PAYMENT_METHODS = [
  { id: 'card', label: 'Tarjeta de crédito/débito' },
  { id: 'pse', label: 'PSE — débito bancario' },
  { id: 'cod', label: 'Contra entrega' },
];

const STEPS = ['Contacto', 'Dirección', 'Envío', 'Pago', 'Confirmación'];

export function Checkout() {
  const config = useStoreConfig();
  const items = useCartStore((s) => s.items);
  const coupon = useCartStore((s) => s.coupon);
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const removeCoupon = useCartStore((s) => s.removeCoupon);
  const clear = useCartStore((s) => s.clear);
  const subtotal = useCartStore((s) => s.subtotal());

  const [step, setStep] = React.useState(0);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [form, setForm] = React.useState({ name: '', email: '', phone: '', address: '', city: '' });
  const [shippingId, setShippingId] = React.useState('standard');
  const [paymentId, setPaymentId] = React.useState('card');
  const [couponInput, setCouponInput] = React.useState('');
  const [couponError, setCouponError] = React.useState('');
  const [couponLoading, setCouponLoading] = React.useState(false);
  const [placing, setPlacing] = React.useState(false);
  const [orderId, setOrderId] = React.useState<string | null>(null);

  const shippingCost = SHIPPING_METHODS.find((m) => m.id === shippingId)?.price ?? 0;
  const discount = coupon?.discount ?? 0;
  const base = Math.max(0, subtotal - discount);
  const effectiveShipping = base >= config.freeShippingThreshold ? 0 : shippingCost;
  const tax = Math.round(base * config.taxRate);
  const total = base + effectiveShipping + tax;

  const set = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: '' }));
  };

  const validateStep = (): boolean => {
    if (step === 0) {
      const r = contactSchema.safeParse(form);
      if (!r.success) {
        setErrors(fieldErrors(r.error));
        return false;
      }
    }
    if (step === 1) {
      const r = addressSchema.safeParse(form);
      if (!r.success) {
        setErrors(fieldErrors(r.error));
        return false;
      }
    }
    return true;
  };

  const next = () => {
    if (validateStep()) setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };
  const back = () => setStep((s) => Math.max(0, s - 1));

  const handleCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await api.validateCoupon(couponInput, subtotal);
      applyCoupon(res.code, res.discount);
      setCouponInput('');
    } catch (e) {
      setCouponError(e instanceof Error ? e.message : 'Cupón inválido');
    } finally {
      setCouponLoading(false);
    }
  };

  const placeOrder = async () => {
    setPlacing(true);
    try {
      const payload: CreateOrderPayload = {
        customer: {
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          city: form.city,
        },
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          sku: i.sku,
          name: i.name,
          qty: i.qty,
          unitPrice: i.unitPrice,
        })),
        shipping: effectiveShipping,
        paymentMethod: PAYMENT_METHODS.find((p) => p.id === paymentId)?.label ?? 'Tarjeta',
        couponCode: coupon?.code ?? null,
      };
      const order = await api.createOrder(payload);
      setOrderId(order.id);
      clear();
      setStep(4);
    } catch {
      setErrors({ submit: 'No pudimos procesar el pedido. Intenta de nuevo.' });
    } finally {
      setPlacing(false);
    }
  };

  // Carrito vacío (y no en confirmación) → invitar a comprar.
  if (items.length === 0 && step !== 4) {
    return (
      <div className="container grid place-items-center py-32 text-center">
        <p className="text-lg font-semibold">Tu carrito está vacío</p>
        <p className="mt-1 text-sm text-muted-foreground">Agrega productos para continuar con la compra.</p>
        <Link to="/catalogo" className="mt-6">
          <Button>Ir a la tienda</Button>
        </Link>
      </div>
    );
  }

  // ===== Paso final: confirmación =====
  if (step === 4 && orderId) {
    return (
      <div className="container grid place-items-center py-24">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20 }}
          className="max-w-md text-center"
        >
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-500/15">
            <Check className="h-10 w-10 text-emerald-600" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight">¡Gracias por tu compra!</h1>
          <p className="mt-2 text-muted-foreground">
            Tu pedido fue recibido. Enviamos la confirmación a tu correo.
          </p>
          <div className="mt-6 rounded-2xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">Número de pedido</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">{orderId}</p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link to="/catalogo">
              <Button variant="outline" className="w-full sm:w-auto">Seguir comprando</Button>
            </Link>
            <Link to="/cuenta">
              <Button className="w-full sm:w-auto">Ver mis pedidos</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <Link to="/catalogo" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Continuar comprando
      </Link>

      {/* Barra de progreso */}
      <div className="mb-10">
        <div className="flex items-center justify-between">
          {STEPS.slice(0, 4).map((label, i) => (
            <React.Fragment key={label}>
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    'grid h-9 w-9 place-items-center rounded-full text-sm font-semibold transition-colors',
                    i < step ? 'bg-brand-600 text-white' : i === step ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground',
                  )}
                >
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span className={cn('hidden text-xs font-medium sm:block', i === step ? 'text-foreground' : 'text-muted-foreground')}>
                  {label}
                </span>
              </div>
              {i < 3 && (
                <div className={cn('mx-2 h-0.5 flex-1 rounded-full transition-colors', i < step ? 'bg-brand-600' : 'bg-muted')} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        {/* Formulario por paso */}
        <div>
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
            {step === 0 && (
              <StepCard title="Datos de contacto">
                <Input label="Nombre completo" name="name" value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} placeholder="Juan Pérez" />
                <Input label="Correo electrónico" name="email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} error={errors.email} placeholder="juan@correo.com" />
                <Input label="Teléfono" name="phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} error={errors.phone} placeholder="300 123 4567" />
              </StepCard>
            )}

            {step === 1 && (
              <StepCard title="Dirección de envío">
                <Input label="Dirección" name="address" value={form.address} onChange={(e) => set('address', e.target.value)} error={errors.address} placeholder="Cra 43A #7-50, Apto 302" />
                <Input label="Ciudad" name="city" value={form.city} onChange={(e) => set('city', e.target.value)} error={errors.city} placeholder="Medellín" />
              </StepCard>
            )}

            {step === 2 && (
              <StepCard title="Método de envío">
                <div className="space-y-3">
                  {SHIPPING_METHODS.map((m) => (
                    <OptionRow
                      key={m.id}
                      selected={shippingId === m.id}
                      onClick={() => setShippingId(m.id)}
                      title={m.label}
                      desc={m.desc}
                      trailing={m.price === 0 ? 'Gratis' : formatCurrency(m.price)}
                    />
                  ))}
                </div>
              </StepCard>
            )}

            {step === 3 && (
              <StepCard title="Método de pago">
                <div className="space-y-3">
                  {PAYMENT_METHODS.map((m) => (
                    <OptionRow key={m.id} selected={paymentId === m.id} onClick={() => setPaymentId(m.id)} title={m.label} />
                  ))}
                </div>
                {paymentId === 'card' && (
                  <div className="mt-5 space-y-4 rounded-2xl border border-border p-5">
                    <Input label="Número de tarjeta" placeholder="4242 4242 4242 4242" />
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Vencimiento" placeholder="MM/AA" />
                      <Input label="CVC" placeholder="123" />
                    </div>
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Lock className="h-3.5 w-3.5" /> Pago simulado — listo para integrar Stripe.
                    </p>
                  </div>
                )}
                {errors.submit && <p className="mt-4 text-sm text-red-500">{errors.submit}</p>}
              </StepCard>
            )}
          </motion.div>

          {/* Navegación */}
          <div className="mt-6 flex items-center justify-between">
            <Button variant="ghost" onClick={back} disabled={step === 0}>
              Atrás
            </Button>
            {step < 3 ? (
              <Button onClick={next}>Continuar</Button>
            ) : (
              <Button onClick={placeOrder} loading={placing}>
                <CreditCard className="h-4 w-4" /> Pagar {formatCurrency(total)}
              </Button>
            )}
          </div>
        </div>

        {/* Resumen */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-semibold">Resumen del pedido</h3>
            <div className="mt-4 space-y-3">
              {items.map((i) => (
                <div key={`${i.productId}-${i.variantId}`} className="flex gap-3">
                  <SmartImage src={i.image} alt={i.name} ratio="aspect-square" wrapperClassName="h-14 w-14 flex-shrink-0 rounded-lg" />
                  <div className="flex flex-1 items-center justify-between gap-2">
                    <div>
                      <p className="line-clamp-1 text-sm font-medium">{i.name}</p>
                      <p className="text-xs text-muted-foreground">x{i.qty}</p>
                    </div>
                    <p className="text-sm font-medium">{formatCurrency(i.unitPrice * i.qty)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Cupón */}
            <div className="mt-5 border-t border-border pt-5">
              {coupon ? (
                <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 px-3 py-2 text-sm">
                  <span className="flex items-center gap-1.5 font-medium text-emerald-600">
                    <Tag className="h-4 w-4" /> {coupon.code}
                  </span>
                  <button onClick={removeCoupon} className="text-xs text-muted-foreground hover:text-foreground">
                    Quitar
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Código de cupón"
                    className="h-10 flex-1 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
                  />
                  <Button variant="outline" size="sm" onClick={handleCoupon} loading={couponLoading}>
                    Aplicar
                  </Button>
                </div>
              )}
              {couponError && <p className="mt-1.5 text-xs text-red-500">{couponError}</p>}
              <p className="mt-2 text-xs text-muted-foreground">Prueba: BIENVENIDA (10%) o VERTICE5 (5%)</p>
            </div>

            {/* Totales */}
            <div className="mt-5 space-y-2 border-t border-border pt-5 text-sm">
              <SummaryRow label="Subtotal" value={formatCurrency(subtotal)} />
              {discount > 0 && <SummaryRow label="Descuento" value={`- ${formatCurrency(discount)}`} accent />}
              <SummaryRow label="Envío" value={effectiveShipping === 0 ? 'Gratis' : formatCurrency(effectiveShipping)} />
              <SummaryRow label={`IVA (${Math.round(config.taxRate * 100)}%)`} value={formatCurrency(tax)} />
              <div className="flex items-center justify-between border-t border-border pt-3 text-base font-semibold">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" /> Compra 100% segura y encriptada
          </p>
        </aside>
      </div>
    </div>
  );
}

function StepCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-5 text-2xl font-semibold tracking-tight">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function OptionRow({
  selected,
  onClick,
  title,
  desc,
  trailing,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  desc?: string;
  trailing?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all',
        selected ? 'border-brand-600 bg-brand-600/5' : 'border-border hover:border-muted-foreground/40',
      )}
    >
      <span className={cn('grid h-5 w-5 place-items-center rounded-full border-2', selected ? 'border-brand-600' : 'border-muted-foreground/40')}>
        {selected && <span className="h-2.5 w-2.5 rounded-full bg-brand-600" />}
      </span>
      <span className="flex-1">
        <span className="block font-medium">{title}</span>
        {desc && <span className="text-sm text-muted-foreground">{desc}</span>}
      </span>
      {trailing && <span className="font-medium">{trailing}</span>}
    </button>
  );
}

function SummaryRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={accent ? 'font-medium text-emerald-600' : 'font-medium'}>{value}</span>
    </div>
  );
}

/** Convierte un ZodError en un mapa campo→mensaje. */
function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && !out[key]) out[key] = issue.message;
  }
  return out;
}
