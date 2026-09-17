import * as React from 'react';
import { Search } from 'lucide-react';
import { api } from '@/lib/api';
import { useAsync } from '@/hooks/useAsync';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/format';

interface CRMCustomer {
  name: string;
  email: string;
  city: string;
  orders: number;
  ltv: number;
  segment: 'VIP' | 'Recurrente' | 'Nuevo';
}

/** CRM básico: agrega pedidos por cliente para calcular LTV y segmento. */
export function Customers() {
  const { data, loading } = useAsync(() => api.getOrders(), []);
  const [query, setQuery] = React.useState('');

  const customers = React.useMemo<CRMCustomer[]>(() => {
    const map = new Map<string, CRMCustomer>();
    for (const o of data ?? []) {
      const key = o.customer.email;
      const cur = map.get(key) ?? {
        name: o.customer.name,
        email: o.customer.email,
        city: o.customer.city,
        orders: 0,
        ltv: 0,
        segment: 'Nuevo' as const,
      };
      cur.orders += 1;
      cur.ltv += o.total;
      map.set(key, cur);
    }
    // Segmentación por LTV / recurrencia.
    return [...map.values()]
      .map((c): CRMCustomer => ({
        ...c,
        segment: c.ltv > 10000000 ? 'VIP' : c.orders > 1 ? 'Recurrente' : 'Nuevo',
      }))
      .sort((a, b) => b.ltv - a.ltv);
  }, [data]);

  const filtered = customers.filter(
    (c) => c.name.toLowerCase().includes(query.toLowerCase()) || c.email.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Clientes</h1>
        <p className="mt-1 text-muted-foreground">{customers.length} clientes · CRM y segmentación</p>
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar cliente"
          className="h-10 w-full rounded-xl border border-input bg-card pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Ciudad</th>
                <th className="px-4 py-3 font-medium">Pedidos</th>
                <th className="px-4 py-3 font-medium">LTV</th>
                <th className="px-4 py-3 font-medium">Segmento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={5} className="p-4"><Skeleton className="h-24 w-full" /></td></tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.email} className="transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-muted text-sm font-semibold uppercase">
                          {c.name.charAt(0)}
                        </span>
                        <div>
                          <p className="font-medium">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{c.city}</td>
                    <td className="px-4 py-3">{c.orders}</td>
                    <td className="px-4 py-3 font-medium">{formatCurrency(c.ltv)}</td>
                    <td className="px-4 py-3">
                      <Badge tone={c.segment === 'VIP' ? 'brand' : c.segment === 'Recurrente' ? 'info' : 'neutral'}>
                        {c.segment}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
