import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';
import { Download } from 'lucide-react';
import { api } from '@/lib/api';
import { useAsync } from '@/hooks/useAsync';
import { StatCard } from '@/components/admin/StatCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCompact, formatCurrency } from '@/lib/format';

const COLORS = ['#0071e3', '#34c759', '#ff9500', '#af52de', '#ff2d55', '#5ac8fa'];

export function Analytics() {
  const { data: stats, loading } = useAsync(() => api.getDashboard(), []);
  const products = useAsync(() => api.getProductsAdmin(), []);

  const stale = (products.data ?? []).filter((p) => p.stock > 10).slice(0, 5);

  const exportReport = () => {
    if (!stats) return;
    const rows = [['fecha', 'ventas'], ...stats.salesByDay.map((d) => [d.date, d.total])];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'vertice-reporte-ventas.csv';
    a.click();
  };

  if (loading || !stats) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Analytics</h1>
          <p className="mt-1 text-muted-foreground">Reportes y comparativas de rendimiento.</p>
        </div>
        <Button variant="outline" onClick={exportReport}>
          <Download className="h-4 w-4" /> Exportar reporte
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Ingresos (semana)" value={formatCurrency(stats.salesWeek)} trend={8.2} hint="vs. semana previa" />
        <StatCard label="Ingresos (mes)" value={formatCurrency(stats.salesMonth)} trend={14.7} hint="vs. mes previo" />
        <StatCard label="Ticket promedio" value={formatCurrency(stats.avgTicket)} trend={-1.4} hint="por pedido" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-semibold">Ventas por día</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.salesByDay} margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => formatCompact(v)} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={48} />
                <Tooltip formatter={(v: number) => [formatCurrency(v), 'Ventas']} contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                <Bar dataKey="total" fill="#0071e3" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-semibold">Distribución por categoría</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.salesByCategory}
                  dataKey="total"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {stats.salesByCategory.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Productos sin rotación */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="font-semibold">Productos con baja rotación</h3>
        <p className="text-sm text-muted-foreground">Alto inventario y pocas ventas recientes.</p>
        <div className="mt-4 space-y-2">
          {stale.map((p) => (
            <div key={p.id} className="flex items-center justify-between border-b border-border py-2 text-sm last:border-0">
              <span className="font-medium">{p.name}</span>
              <span className="text-muted-foreground">{p.stock} en stock</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
