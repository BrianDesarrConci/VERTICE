import * as React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Package, Truck } from 'lucide-react';
import type { Shipment, ShipmentStatus } from '@/lib/types';
import { api } from '@/lib/api';
import { useAsync } from '@/hooks/useAsync';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/format';

const COLUMNS: { status: ShipmentStatus; label: string; tone: 'warning' | 'brand' | 'info' | 'success' }[] = [
  { status: 'pending', label: 'Pendiente', tone: 'warning' },
  { status: 'preparing', label: 'Preparando', tone: 'brand' },
  { status: 'in_transit', label: 'En tránsito', tone: 'info' },
  { status: 'delivered', label: 'Entregado', tone: 'success' },
];

const NEXT: Record<ShipmentStatus, ShipmentStatus | null> = {
  pending: 'preparing',
  preparing: 'in_transit',
  in_transit: 'delivered',
  delivered: null,
};

const COURIERS = ['Servientrega', 'Coordinadora', 'Interrapidísimo', 'TCC', 'Envía'];

export function Shipments() {
  const { data, loading, reload } = useAsync(() => api.getShipments(), []);
  const [editing, setEditing] = React.useState<Shipment | null>(null);

  const advance = async (s: Shipment) => {
    const next = NEXT[s.status];
    if (!next) return;
    await api.updateShipmentStatus(s.id, next);
    reload();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Despachos</h1>
        <p className="mt-1 text-muted-foreground">Tablero de envíos en tiempo real.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {COLUMNS.map((c) => (
            <Skeleton key={c.status} className="h-64" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {COLUMNS.map((col) => {
            const items = (data ?? []).filter((s) => s.status === col.status);
            return (
              <div key={col.status} className="rounded-2xl border border-border bg-muted/20 p-3">
                <div className="mb-3 flex items-center justify-between px-1">
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    <Badge tone={col.tone}>{col.label}</Badge>
                  </span>
                  <span className="text-xs text-muted-foreground">{items.length}</span>
                </div>
                <div className="space-y-3">
                  {items.length === 0 && (
                    <p className="px-1 py-6 text-center text-xs text-muted-foreground">Sin despachos</p>
                  )}
                  {items.map((s) => (
                    <motion.div
                      key={s.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border border-border bg-card p-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">{s.orderId}</span>
                        <button onClick={() => setEditing(s)} className="text-xs text-brand-600 hover:underline">
                          Editar
                        </button>
                      </div>
                      <p className="mt-1 text-sm">{s.customerName}</p>
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Truck className="h-3.5 w-3.5" />
                        {s.courier || 'Sin courier'}
                      </div>
                      {s.tracking && (
                        <p className="mt-1 font-mono text-xs text-muted-foreground">{s.tracking}</p>
                      )}
                      {s.deliveredAt && (
                        <p className="mt-1 text-xs text-emerald-600">Entregado {formatDate(s.deliveredAt)}</p>
                      )}
                      {NEXT[s.status] && (
                        <button
                          onClick={() => advance(s)}
                          className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg bg-brand-600/10 py-1.5 text-xs font-medium text-brand-600 transition-colors hover:bg-brand-600/20"
                        >
                          Mover a {COLUMNS.find((c) => c.status === NEXT[s.status])?.label}
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <ShipmentModal
          shipment={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            reload();
          }}
        />
      )}
    </div>
  );
}

function ShipmentModal({ shipment, onClose, onSaved }: { shipment: Shipment; onClose: () => void; onSaved: () => void }) {
  const [tracking, setTracking] = React.useState(shipment.tracking);
  const [courier, setCourier] = React.useState(shipment.courier || COURIERS[0]);
  const [saving, setSaving] = React.useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await api.updateShipment(shipment.id, { tracking, courier });
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl"
      >
        <div className="mb-1 flex items-center gap-2">
          <Package className="h-5 w-5 text-brand-600" />
          <h2 className="text-lg font-semibold">Despacho {shipment.orderId}</h2>
        </div>
        <p className="mb-5 text-sm text-muted-foreground">{shipment.customerName}</p>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Courier</label>
            <select
              value={courier}
              onChange={(e) => setCourier(e.target.value)}
              className="h-11 w-full rounded-xl border border-input bg-background px-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-ring/50"
            >
              {COURIERS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <Input label="Número de tracking" value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="CO123456789" />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={save} loading={saving}>Guardar</Button>
        </div>
      </motion.div>
    </div>
  );
}
