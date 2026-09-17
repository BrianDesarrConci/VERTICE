import * as React from 'react';
import { Check, Plus, Trash2 } from 'lucide-react';
import { useStoreConfig } from '@/hooks/useStoreConfig';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';

/** Configuración de tienda: datos generales, impuestos/envíos, usuarios admin, logs. */
export function Settings() {
  const config = useStoreConfig();
  const session = useAuthStore((s) => s.session);
  const [saved, setSaved] = React.useState(false);

  const [form, setForm] = React.useState({
    storeName: config.storeName,
    taxRate: Math.round(config.taxRate * 100),
    flatShipping: config.flatShipping,
    freeShippingThreshold: config.freeShippingThreshold,
  });

  React.useEffect(() => {
    setForm({
      storeName: config.storeName,
      taxRate: Math.round(config.taxRate * 100),
      flatShipping: config.flatShipping,
      freeShippingThreshold: config.freeShippingThreshold,
    });
  }, [config]);

  const save = () => {
    // En backend real → api.saveConfig(...). En mock persiste en memoria.
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const admins = [
    { email: session?.email ?? 'admin@vertice.co', role: 'owner', active: true },
    { email: 'staff@vertice.co', role: 'staff', active: true },
  ];

  const logs = [
    { at: 'Hace 2 min', text: `${session?.email} inició sesión` },
    { at: 'Hace 1 h', text: 'Se actualizó el estado del pedido VTX-100237' },
    { at: 'Hace 3 h', text: 'Ajuste de stock: iPhone 15 Pro Max (-8)' },
  ];

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Configuración</h1>
        <p className="mt-1 text-muted-foreground">
          Ajustes generales de la tienda.{' '}
          {api.usingMock && <Badge tone="warning">Modo demo (mock)</Badge>}
        </p>
      </div>

      {/* Datos de tienda */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 font-semibold">Datos de la tienda</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Nombre de la tienda" value={form.storeName} onChange={(e) => setForm((f) => ({ ...f, storeName: e.target.value }))} />
          <Input label="IVA (%)" type="number" value={form.taxRate} onChange={(e) => setForm((f) => ({ ...f, taxRate: Number(e.target.value) }))} />
          <Input label="Costo de envío ($)" type="number" value={form.flatShipping} onChange={(e) => setForm((f) => ({ ...f, flatShipping: Number(e.target.value) }))} />
          <Input label="Envío gratis desde ($)" type="number" value={form.freeShippingThreshold} onChange={(e) => setForm((f) => ({ ...f, freeShippingThreshold: Number(e.target.value) }))} />
        </div>
        <div className="mt-5 flex justify-end">
          <Button onClick={save}>
            {saved ? (<><Check className="h-4 w-4" /> Guardado</>) : 'Guardar cambios'}
          </Button>
        </div>
      </section>

      {/* Usuarios admin */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Usuarios administradores</h2>
          <Button variant="outline" size="sm"><Plus className="h-4 w-4" /> Invitar</Button>
        </div>
        <div className="space-y-2">
          {admins.map((a) => (
            <div key={a.email} className="flex items-center justify-between rounded-xl border border-border p-3">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-muted text-sm font-semibold uppercase">{a.email.charAt(0)}</span>
                <div>
                  <p className="text-sm font-medium">{a.email}</p>
                  <p className="text-xs capitalize text-muted-foreground">{a.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={a.role === 'owner' ? 'brand' : 'neutral'}>{a.role}</Badge>
                {a.role !== 'owner' && (
                  <button className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-red-600" aria-label="Eliminar">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Logs de actividad */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 font-semibold">Logs de actividad</h2>
        <div className="space-y-3">
          {logs.map((l, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <span className="h-2 w-2 rounded-full bg-brand-600" />
              <span className="flex-1">{l.text}</span>
              <span className="text-xs text-muted-foreground">{l.at}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
