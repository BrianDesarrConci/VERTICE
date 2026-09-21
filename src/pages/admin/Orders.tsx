import * as React from 'react';
import { motion } from 'framer-motion';
import { Check, Search, X } from 'lucide-react';
import type { Order, OrderStatus } from '@/lib/types';
import { api } from '@/lib/api';
import { toast } from '@/stores/toastStore';
import { useAsync } from '@/hooks/useAsync';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { cn } from '@/lib/utils';

const STATUS_FLOW: OrderStatus[] = ['pending', 'paid', 'preparing', 'shipped', 'delivered'];
const STATUS_META: Record<OrderStatus, { label: string; tone: 'neutral' | 'info' | 'warning' | 'success' | 'danger' | 'brand' }> = {
  pending: { label: 'Pendiente', tone: 'warning' },
  paid: { label: 'Pagado', tone: 'info' },
  preparing: { label: 'Preparando', tone: 'brand' },
  shipped: { label: 'Enviado', tone: 'info' },
  delivered: { label: 'Entregado', tone: 'success' },
  cancelled: { label: 'Cancelado', tone: 'danger' },
};

export function Orders() {
  const { data, loading, reload } = useAsync(() => api.getOrders(), []);
  const [filter, setFilter] = React.useState<OrderStatus | 'all'>('all');
  const [query, setQuery] = React.useState('');
  const [selected, setSelected] = React.useState<Order | null>(null);

  const orders = (data ?? [])
    .filter((o) => filter === 'all' || o.status === filter)
    .filter((o) => o.id.toLowerCase().includes(query.toLowerCase()) || o.customer.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Ventas</h1>
        <p className="mt-1 text-muted-foreground">Gestiona pedidos y su estado.</p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>Todos</FilterChip>
          {STATUS_FLOW.map((s) => (
            <FilterChip key={s} active={filter === s} onClick={() => setFilter(s)}>
              {STATUS_META[s].label}
            </FilterChip>
          ))}
        </div>
        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar pedido o cliente"
            className="h-10 w-full rounded-xl border border-input bg-card pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Pedido</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={5} className="p-4"><Skeleton className="h-24 w-full" /></td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">Sin pedidos.</td></tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} onClick={() => setSelected(o)} className="cursor-pointer transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{o.id}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{o.customer.name}</p>
                      <p className="text-xs text-muted-foreground">{o.customer.city}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDateTime(o.createdAt)}</td>
                    <td className="px-4 py-3 font-medium">{formatCurrency(o.total)}</td>
                    <td className="px-4 py-3"><Badge tone={STATUS_META[o.status].tone}>{STATUS_META[o.status].label}</Badge></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <OrderDetail
          order={selected}
          onClose={() => setSelected(null)}
          onUpdated={(updated) => {
            setSelected(updated);
            reload();
          }}
        />
      )}
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
        active ? 'border-brand-600 bg-brand-600 text-white' : 'border-border bg-card hover:bg-muted',
      )}
    >
      {children}
    </button>
  );
}

function OrderDetail({ order, onClose, onUpdated }: { order: Order; onClose: () => void; onUpdated: (o: Order) => void }) {
  const [saving, setSaving] = React.useState<OrderStatus | null>(null);
  const currentIdx = STATUS_FLOW.indexOf(order.status);

  const changeStatus = async (status: OrderStatus) => {
    setSaving(status);
    try {
      const updated = await api.updateOrderStatus(order.id, status);
      toast.success(`Pedido ${order.id} → ${STATUS_META[status].label}`);
      onUpdated(updated);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo actualizar el pedido');
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="relative z-10 flex h-full w-full max-w-lg flex-col overflow-y-auto bg-card shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-border p-5">
          <div>
            <h2 className="text-lg font-semibold">{order.id}</h2>
            <p className="text-sm text-muted-foreground">{formatDateTime(order.createdAt)}</p>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted" aria-label="Cerrar">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-5">
          {/* Timeline de estado */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">Estado del pedido</h3>
            <div className="space-y-0">
              {STATUS_FLOW.map((s, i) => {
                const done = i <= currentIdx;
                const isCurrent = i === currentIdx;
                return (
                  <div key={s} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={cn('grid h-7 w-7 place-items-center rounded-full text-xs', done ? 'bg-brand-600 text-white' : 'bg-muted text-muted-foreground')}>
                        {done ? <Check className="h-4 w-4" /> : i + 1}
                      </div>
                      {i < STATUS_FLOW.length - 1 && <div className={cn('h-8 w-0.5', i < currentIdx ? 'bg-brand-600' : 'bg-border')} />}
                    </div>
                    <div className="pb-2 pt-1">
                      <p className={cn('text-sm font-medium', isCurrent && 'text-brand-600')}>{STATUS_META[s].label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Acciones de estado */}
            {order.status !== 'delivered' && order.status !== 'cancelled' && (
              <div className="mt-4 flex flex-wrap gap-2">
                {currentIdx < STATUS_FLOW.length - 1 && (
                  <Button size="sm" loading={saving === STATUS_FLOW[currentIdx + 1]} onClick={() => changeStatus(STATUS_FLOW[currentIdx + 1])}>
                    Avanzar a {STATUS_META[STATUS_FLOW[currentIdx + 1]].label}
                  </Button>
                )}
                <Button size="sm" variant="outline" loading={saving === 'cancelled'} onClick={() => changeStatus('cancelled')}>
                  Cancelar pedido
                </Button>
              </div>
            )}
          </div>

          {/* Cliente */}
          <div className="rounded-2xl border border-border p-4">
            <h3 className="mb-2 text-sm font-semibold">Cliente</h3>
            <p className="text-sm">{order.customer.name}</p>
            <p className="text-sm text-muted-foreground">{order.customer.email} · {order.customer.phone}</p>
            <p className="mt-1 text-sm text-muted-foreground">{order.customer.address}, {order.customer.city}</p>
          </div>

          {/* Items */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">Productos</h3>
            <div className="space-y-2">
              {order.items.map((it, i) => (
                <div key={i} className="flex items-center justify-between border-b border-border py-2 text-sm last:border-0">
                  <span>{it.name} <span className="text-muted-foreground">× {it.qty}</span></span>
                  <span className="font-medium">{formatCurrency(it.unitPrice * it.qty)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Totales */}
          <div className="space-y-1.5 rounded-2xl bg-muted/40 p-4 text-sm">
            <Row label="Subtotal" value={formatCurrency(order.subtotal)} />
            {order.discount > 0 && <Row label="Descuento" value={`- ${formatCurrency(order.discount)}`} />}
            <Row label="Envío" value={order.shipping === 0 ? 'Gratis' : formatCurrency(order.shipping)} />
            <Row label="IVA" value={formatCurrency(order.tax)} />
            <div className="flex justify-between border-t border-border pt-2 font-semibold">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
            <p className="pt-1 text-xs text-muted-foreground">Método de pago: {order.paymentMethod}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}
