import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AlertTriangle, DollarSign, Package, Receipt, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';
import { useAsync } from '@/hooks/useAsync';
import { StatCard } from '@/components/admin/StatCard';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCompact, formatCurrency, formatDateTime } from '@/lib/format';

const CHART_COLORS = ['#7DD100', '#34c759', '#ff9500', '#af52de', '#ff2d55', '#5ac8fa'];

export function Dashboard() {
  const { data: stats, loading } = useAsync(() => api.getDashboard(), []);
  const orders = useAsync(() => api.getOrders(), []);

  if (loading || !stats) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Resumen del rendimiento de tu tienda.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Ventas hoy" value={formatCurrency(stats.salesToday)} icon={<DollarSign className="h-5 w-5" />} trend={12.5} hint="vs. ayer" />
        <StatCard label="Ventas del mes" value={formatCurrency(stats.salesMonth)} icon={<TrendingUp className="h-5 w-5" />} trend={8.2} hint="últimos 30 días" />
        <StatCard label="Ticket promedio" value={formatCurrency(stats.avgTicket)} icon={<Receipt className="h-5 w-5" />} trend={-2.1} hint="por pedido" />
        <StatCard label="Pedidos hoy" value={String(stats.ordersToday)} icon={<Package className="h-5 w-5" />} trend={5} hint="nuevos" />
      </div>

      {/* Alertas */}
      {(stats.lowStockCount > 0 || stats.pendingShipments > 0) && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <div>
              <p className="text-sm font-medium">Stock crítico</p>
              <p className="text-sm text-muted-foreground">{stats.lowStockCount} productos con 5 o menos unidades</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-sky-500/30 bg-sky-500/5 p-4">
            <Package className="h-5 w-5 text-sky-600" />
            <div>
              <p className="text-sm font-medium">Despachos pendientes</p>
              <p className="text-sm text-muted-foreground">{stats.pendingShipments} envíos por procesar</p>
            </div>
          </div>
        </div>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Ventas por día */}
        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          <h3 className="font-semibold">Ventas de los últimos 7 días</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.salesByDay} margin={{ left: -10, right: 10, top: 10 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7DD100" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#7DD100" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => formatCompact(v)} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={48} />
                <Tooltip
                  formatter={(v: number) => [formatCurrency(v), 'Ventas']}
                  contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }}
                />
                <Area type="monotone" dataKey="total" stroke="#7DD100" strokeWidth={2.5} fill="url(#salesGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ventas por categoría */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-semibold">Por categoría</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.salesByCategory} layout="vertical" margin={{ left: 10, right: 10 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="category" type="category" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={70} />
                <Tooltip
                  formatter={(v: number) => [formatCurrency(v), 'Ventas']}
                  contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }}
                />
                <Bar dataKey="total" radius={[0, 6, 6, 0]}>
                  {stats.salesByCategory.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top productos + últimas transacciones */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-semibold">Productos top</h3>
          <div className="mt-4 space-y-3">
            {stats.topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-muted text-xs font-semibold">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.units} unidades</p>
                </div>
                <span className="text-sm font-medium">{formatCurrency(p.revenue)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-semibold">Últimas transacciones</h3>
          <div className="mt-4 space-y-3">
            {(orders.data ?? []).slice(0, 5).map((o) => (
              <div key={o.id} className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{o.customer.name}</p>
                  <p className="text-xs text-muted-foreground">{o.id} · {formatDateTime(o.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{formatCurrency(o.total)}</p>
                  <Badge tone={o.status === 'delivered' ? 'success' : o.status === 'pending' ? 'warning' : 'info'}>
                    {o.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
