import * as React from 'react';
import { motion } from 'framer-motion';
import { Pencil, Plus, Ticket, Trash2, X } from 'lucide-react';
import type { Coupon } from '@/lib/types';
import { api } from '@/lib/api';
import { useAsync } from '@/hooks/useAsync';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/format';

const empty = (): Coupon => ({ code: '', type: 'percent', value: 10, active: true, minPurchase: 0, description: '' });

export function Coupons() {
  const { data, loading, reload } = useAsync(() => api.getCoupons(), []);
  const [editing, setEditing] = React.useState<Coupon | null>(null);

  const toggle = async (c: Coupon) => {
    await api.saveCoupon({ ...c, active: !c.active });
    reload();
  };
  const remove = async (code: string) => {
    if (!confirm(`¿Eliminar el cupón ${code}?`)) return;
    await api.deleteCoupon(code);
    reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Cupones</h1>
          <p className="mt-1 text-muted-foreground">Crea y administra códigos de descuento.</p>
        </div>
        <Button onClick={() => setEditing(empty())}><Plus className="h-4 w-4" /> Nuevo cupón</Button>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : (data ?? []).length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-border py-20 text-center">
          <Ticket className="h-10 w-10 text-muted-foreground/40" />
          <p className="mt-4 font-semibold">Aún no hay cupones</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => setEditing(empty())}>Crear el primero</Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(data ?? []).map((c) => (
            <div key={c.code} className="relative overflow-hidden rounded-2xl border border-border bg-card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-lg font-bold tracking-wide">{c.code}</p>
                  <p className="text-sm text-muted-foreground">{c.description || 'Sin descripción'}</p>
                </div>
                <Badge tone={c.active ? 'success' : 'neutral'}>{c.active ? 'Activo' : 'Inactivo'}</Badge>
              </div>
              <p className="mt-4 text-3xl font-extrabold text-brand-700 dark:text-brand-400">
                {c.type === 'percent' ? `${c.value}%` : formatCurrency(c.value)}
              </p>
              <p className="text-xs text-muted-foreground">
                {c.minPurchase ? `Compra mínima ${formatCurrency(c.minPurchase)}` : 'Sin compra mínima'}
              </p>
              <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
                <Button variant="outline" size="sm" onClick={() => setEditing(c)}><Pencil className="h-4 w-4" /> Editar</Button>
                <Button variant="ghost" size="sm" onClick={() => toggle(c)}>{c.active ? 'Desactivar' : 'Activar'}</Button>
                <button onClick={() => remove(c.code)} aria-label="Eliminar" className="ml-auto grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && <CouponModal coupon={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />}
    </div>
  );
}

function CouponModal({ coupon, onClose, onSaved }: { coupon: Coupon; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = React.useState<Coupon>(coupon);
  const [saving, setSaving] = React.useState(false);
  const isNew = !coupon.code;
  const set = <K extends keyof Coupon>(k: K, v: Coupon[K]) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.code.trim()) return;
    setSaving(true);
    try {
      await api.saveCoupon({ ...form, code: form.code.trim().toUpperCase() });
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">{isNew ? 'Nuevo cupón' : `Editar ${coupon.code}`}</h2>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted" aria-label="Cerrar"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-4">
          <Input label="Código" value={form.code} onChange={(e) => set('code', e.target.value.toUpperCase())} placeholder="EJ: BIENVENIDA" disabled={!isNew} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Tipo</label>
              <select value={form.type} onChange={(e) => set('type', e.target.value as Coupon['type'])} className="h-11 w-full rounded-xl border border-input bg-background px-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-ring/50">
                <option value="percent">Porcentaje (%)</option>
                <option value="fixed">Monto fijo ($)</option>
              </select>
            </div>
            <Input label={form.type === 'percent' ? 'Valor (%)' : 'Valor ($)'} type="number" value={form.value} onChange={(e) => set('value', Number(e.target.value))} />
          </div>
          <Input label="Compra mínima ($)" type="number" value={form.minPurchase ?? 0} onChange={(e) => set('minPurchase', Number(e.target.value))} />
          <Input label="Descripción" value={form.description ?? ''} onChange={(e) => set('description', e.target.value)} placeholder="Ej: Primera compra" />
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={form.active} onChange={(e) => set('active', e.target.checked)} className="h-4 w-4 rounded accent-brand-500" /> Activo
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={save} loading={saving} disabled={!form.code.trim()}>Guardar</Button>
        </div>
      </motion.div>
    </div>
  );
}
