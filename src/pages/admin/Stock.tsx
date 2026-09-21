import * as React from 'react';
import { motion } from 'framer-motion';
import { Download, Pencil, Plus, Search, Trash2, TrendingDown, TrendingUp, X } from 'lucide-react';
import type { Department, Product, ProductVariant } from '@/lib/types';
import { DEPARTMENTS } from '@/lib/types';
import { api } from '@/lib/api';
import { toast } from '@/stores/toastStore';
import { shortId } from '@/lib/utils';
import { useAsync } from '@/hooks/useAsync';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { SmartImage } from '@/components/ui/smart-image';
import { formatCurrency } from '@/lib/format';
import { slugify } from '@/lib/utils';

const emptyProduct = (): Product => ({
  id: '',
  sku: '',
  name: '',
  slug: '',
  description: '',
  price: 0,
  compareAtPrice: 0,
  cost: 0,
  stock: 0,
  department: 'unisex',
  category: 'camisetas',
  brand: 'VÉRTICE',
  images: [],
  variants: [],
  rating: 0,
  reviewsCount: 0,
  featured: false,
  isNew: true,
  active: true,
  createdAt: new Date().toISOString(),
});

export function Stock() {
  const { data, loading, reload } = useAsync(() => api.getProductsAdmin(), []);
  const [query, setQuery] = React.useState('');
  const [editing, setEditing] = React.useState<Product | null>(null);
  const [adjusting, setAdjusting] = React.useState<Product | null>(null);

  const products = (data ?? []).filter(
    (p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.sku.toLowerCase().includes(query.toLowerCase()),
  );

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) return;
    try {
      await api.deleteProduct(id);
      toast.success('Producto eliminado');
      reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo eliminar');
    }
  };

  const exportCSV = () => {
    const rows = [
      ['sku', 'nombre', 'precio', 'costo', 'stock', 'categoria', 'marca', 'activo'],
      ...(data ?? []).map((p) => [p.sku, p.name, p.price, p.cost, p.stock, p.category, p.brand, p.active]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vertice-inventario.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Gestión de stock</h1>
          <p className="mt-1 text-muted-foreground">{(data ?? []).length} productos en catálogo</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV}>
            <Download className="h-4 w-4" /> Exportar CSV
          </Button>
          <Button onClick={() => setEditing(emptyProduct())}>
            <Plus className="h-4 w-4" /> Nuevo producto
          </Button>
        </div>
      </div>

      {/* Buscador */}
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre o SKU"
          className="h-10 w-full rounded-xl border border-input bg-card pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
        />
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Producto</th>
                <th className="px-4 py-3 font-medium">SKU</th>
                <th className="px-4 py-3 font-medium">Precio</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3" colSpan={6}>
                      <Skeleton className="h-10 w-full" />
                    </td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    No hay productos que coincidan.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <SmartImage src={p.images[0]} alt={p.name} ratio="aspect-square" wrapperClassName="h-11 w-11 flex-shrink-0 rounded-lg" />
                        <div className="min-w-0">
                          <p className="truncate font-medium">{p.name}</p>
                          <p className="text-xs capitalize text-muted-foreground">{p.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.sku}</td>
                    <td className="px-4 py-3 font-medium">{formatCurrency(p.price)}</td>
                    <td className="px-4 py-3">
                      <span className={p.stock <= 5 ? 'font-semibold text-amber-600' : ''}>{p.stock}</span>
                      {p.stock <= 5 && p.stock > 0 && <Badge tone="warning" className="ml-2">Bajo</Badge>}
                      {p.stock === 0 && <Badge tone="danger" className="ml-2">Agotado</Badge>}
                    </td>
                    <td className="px-4 py-3">
                      {p.active ? <Badge tone="success">Activo</Badge> : <Badge tone="neutral">Inactivo</Badge>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <IconBtn label="Ajustar stock" onClick={() => setAdjusting(p)}>
                          <TrendingUp className="h-4 w-4" />
                        </IconBtn>
                        <IconBtn label="Editar" onClick={() => setEditing(p)}>
                          <Pencil className="h-4 w-4" />
                        </IconBtn>
                        <IconBtn label="Eliminar" onClick={() => handleDelete(p.id)} danger>
                          <Trash2 className="h-4 w-4" />
                        </IconBtn>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historial de movimientos */}
      <MovementsHistory />

      {editing && (
        <ProductModal
          product={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            reload();
          }}
        />
      )}
      {adjusting && (
        <AdjustModal
          product={adjusting}
          onClose={() => setAdjusting(null)}
          onSaved={() => {
            setAdjusting(null);
            reload();
          }}
        />
      )}
    </div>
  );
}

function IconBtn({ children, label, onClick, danger }: { children: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`grid h-8 w-8 place-items-center rounded-lg transition-colors hover:bg-muted ${danger ? 'text-muted-foreground hover:text-red-600' : 'text-muted-foreground hover:text-foreground'}`}
    >
      {children}
    </button>
  );
}

function MovementsHistory() {
  const { data, loading } = useAsync(() => api.getMovements(), []);
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="font-semibold">Historial de movimientos de inventario</h3>
      <div className="mt-4 space-y-2">
        {loading ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          (data ?? []).map((m) => (
            <div key={m.id} className="flex items-center justify-between border-b border-border py-2 text-sm last:border-0">
              <div className="flex items-center gap-3">
                <span className={`grid h-8 w-8 place-items-center rounded-full ${m.type === 'in' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                  {m.type === 'in' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                </span>
                <div>
                  <p className="font-medium">{m.productName}</p>
                  <p className="text-xs text-muted-foreground">{m.reason} · {m.user}</p>
                </div>
              </div>
              <span className={`font-semibold ${m.type === 'in' ? 'text-emerald-600' : 'text-red-600'}`}>
                {m.type === 'in' ? '+' : '-'}{m.quantity}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ---- Modal de creación/edición de producto ----
function ProductModal({ product, onClose, onSaved }: { product: Product; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = React.useState<Product>(product);
  const [saving, setSaving] = React.useState(false);
  const set = <K extends keyof Product>(k: K, v: Product[K]) => setForm((f) => ({ ...f, [k]: v }));

  // --- Editor de tallas / variantes ---
  const setVariant = (id: string, patch: Partial<ProductVariant>) =>
    setForm((f) => ({ ...f, variants: f.variants.map((v) => (v.id === id ? { ...v, ...patch } : v)) }));
  const addVariant = () =>
    setForm((f) => ({ ...f, variants: [...f.variants, { id: shortId('v'), name: 'Talla', priceDelta: 0, stock: 0 }] }));
  const removeVariant = (id: string) =>
    setForm((f) => ({ ...f, variants: f.variants.filter((v) => v.id !== id) }));
  const addStandardSizes = () =>
    setForm((f) => ({
      ...f,
      variants: ['S', 'M', 'L', 'XL'].map((s) => ({ id: shortId('v'), name: `Talla ${s}`, priceDelta: 0, stock: 0 })),
    }));

  const save = async () => {
    setSaving(true);
    try {
      // Si hay variantes con stock, el stock total del producto es su suma.
      const variantStock = form.variants.reduce((s, v) => s + (Number(v.stock) || 0), 0);
      const payload: Product = {
        ...form,
        slug: form.slug || slugify(form.name),
        stock: form.variants.length ? variantStock : form.stock,
        images: form.images.length ? form.images.filter(Boolean) : ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80'],
      };
      await api.saveProduct(payload);
      toast.success('Producto guardado');
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo guardar el producto');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title={product.id ? 'Editar producto' : 'Nuevo producto'} onClose={onClose}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Input label="Nombre" value={form.name} onChange={(e) => set('name', e.target.value)} />
        </div>
        <Input label="SKU" value={form.sku} onChange={(e) => set('sku', e.target.value)} />
        <Input label="Marca" value={form.brand} onChange={(e) => set('brand', e.target.value)} />
        <div>
          <label className="mb-1.5 block text-sm font-medium">Departamento</label>
          <select
            value={form.department}
            onChange={(e) => set('department', e.target.value as Department)}
            className="h-11 w-full rounded-xl border border-input bg-background px-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-ring/50"
          >
            {[...DEPARTMENTS, { slug: 'unisex' as Department, label: 'Unisex' }].map((d) => (
              <option key={d.slug} value={d.slug}>{d.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Categoría</label>
          <select
            value={form.category}
            onChange={(e) => set('category', e.target.value)}
            className="h-11 w-full rounded-xl border border-input bg-background px-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-ring/50"
          >
            {['camisetas', 'hoodies', 'gorras', 'libretas', 'totebags', 'accesorios'].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <Input label="URL de imagen principal" value={form.images[0] ?? ''} onChange={(e) => set('images', [e.target.value, ...(form.images.slice(1))])} placeholder="https://... o /productos/foto.jpg" />
        </div>
        <div className="sm:col-span-2">
          <Input label="URL de imagen secundaria (hover)" value={form.images[1] ?? ''} onChange={(e) => set('images', [form.images[0] ?? '', e.target.value])} placeholder="Opcional" />
        </div>
        <Input label="Precio" type="number" value={form.price} onChange={(e) => set('price', Number(e.target.value))} />
        <Input label="Precio antes (oferta)" type="number" value={form.compareAtPrice ?? 0} onChange={(e) => set('compareAtPrice', Number(e.target.value))} />
        <Input label="Costo" type="number" value={form.cost} onChange={(e) => set('cost', Number(e.target.value))} />
        <Input label="Stock (si no usas tallas)" type="number" value={form.stock} onChange={(e) => set('stock', Number(e.target.value))} disabled={form.variants.length > 0} />
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium">Descripción</label>
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-ring/50"
          />
        </div>

        {/* Editor de tallas / variantes */}
        <div className="sm:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium">Tallas / variantes</label>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={addStandardSizes}>S · M · L · XL</Button>
              <Button type="button" variant="outline" size="sm" onClick={addVariant}><Plus className="h-4 w-4" /> Añadir</Button>
            </div>
          </div>
          {form.variants.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-3 text-center text-sm text-muted-foreground">
              Sin variantes. Usa el stock general de arriba, o añade tallas.
            </p>
          ) : (
            <div className="space-y-2">
              {form.variants.map((v) => (
                <div key={v.id} className="flex items-center gap-2">
                  <input value={v.name} onChange={(e) => setVariant(v.id, { name: e.target.value })} placeholder="Nombre (ej: Talla M)" className="h-10 flex-1 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50" />
                  <input type="number" value={v.priceDelta} onChange={(e) => setVariant(v.id, { priceDelta: Number(e.target.value) })} placeholder="+$" title="Diferencia de precio" className="h-10 w-20 rounded-lg border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50" />
                  <input type="number" value={v.stock} onChange={(e) => setVariant(v.id, { stock: Number(e.target.value) })} placeholder="Stock" title="Stock" className="h-10 w-20 rounded-lg border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50" />
                  <button onClick={() => removeVariant(v.id)} aria-label="Quitar" className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-red-600"><X className="h-4 w-4" /></button>
                </div>
              ))}
              <p className="text-xs text-muted-foreground">Stock total (suma de tallas): {form.variants.reduce((s, v) => s + (Number(v.stock) || 0), 0)}</p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-6 sm:col-span-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.active} onChange={(e) => set('active', e.target.checked)} className="h-4 w-4 rounded accent-brand-500" /> Activo
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} className="h-4 w-4 rounded accent-brand-500" /> Destacado
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isNew} onChange={(e) => set('isNew', e.target.checked)} className="h-4 w-4 rounded accent-brand-500" /> Nuevo
          </label>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button onClick={save} loading={saving} disabled={!form.name || !form.sku}>Guardar</Button>
      </div>
    </ModalShell>
  );
}

// ---- Modal de ajuste de stock (entrada/salida) ----
function AdjustModal({ product, onClose, onSaved }: { product: Product; onClose: () => void; onSaved: () => void }) {
  const [type, setType] = React.useState<'in' | 'out'>('in');
  const [qty, setQty] = React.useState(1);
  const [reason, setReason] = React.useState('Compra proveedor');
  const [saving, setSaving] = React.useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await api.adjustStock(product.id, type, qty, reason);
      toast.success(`Stock ${type === 'in' ? 'sumado' : 'restado'}: ${qty} u.`);
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo ajustar el stock');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title={`Ajustar stock · ${product.name}`} onClose={onClose}>
      <p className="text-sm text-muted-foreground">Stock actual: <strong className="text-foreground">{product.stock}</strong></p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          onClick={() => setType('in')}
          className={`rounded-xl border-2 p-3 text-sm font-medium ${type === 'in' ? 'border-emerald-500 bg-emerald-500/5 text-emerald-600' : 'border-border'}`}
        >
          Entrada
        </button>
        <button
          onClick={() => setType('out')}
          className={`rounded-xl border-2 p-3 text-sm font-medium ${type === 'out' ? 'border-red-500 bg-red-500/5 text-red-600' : 'border-border'}`}
        >
          Salida
        </button>
      </div>
      <div className="mt-4 space-y-4">
        <Input label="Cantidad" type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value)))} />
        <Input label="Motivo" value={reason} onChange={(e) => setReason(e.target.value)} />
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button onClick={save} loading={saving}>Confirmar ajuste</Button>
      </div>
    </ModalShell>
  );
}

function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted" aria-label="Cerrar">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}
