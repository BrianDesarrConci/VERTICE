import * as React from 'react';
import { AlertTriangle, CheckCircle2, RefreshCw, XCircle } from 'lucide-react';
import { api, BACKEND, pingBackend } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Check = { name: string; run: () => Promise<string> };

// Cada prueba llama a un endpoint real y devuelve un resumen legible (o lanza).
const CHECKS: Check[] = [
  { name: 'Configuración (getConfig)', run: async () => `Tienda: ${(await api.getConfig()).storeName}` },
  { name: 'Contenido (getContent)', run: async () => `Hero: “${(await api.getContent()).heroTitle}”` },
  { name: 'Categorías (getCategories)', run: async () => `${(await api.getCategories()).length} categorías` },
  { name: 'Productos (getProducts)', run: async () => `${(await api.getProducts()).length} productos activos` },
  { name: 'Reseñas (getReviews)', run: async () => `${(await api.getReviews()).length} reseñas` },
  { name: 'Cupones (getCoupons) — admin', run: async () => `${(await api.getCoupons()).length} cupones` },
  { name: 'Productos admin (getProductsAdmin)', run: async () => `${(await api.getProductsAdmin()).length} productos` },
  { name: 'Pedidos (getOrders) — admin', run: async () => `${(await api.getOrders()).length} pedidos` },
  { name: 'Despachos (getShipments) — admin', run: async () => `${(await api.getShipments()).length} despachos` },
  { name: 'Dashboard (getDashboard) — admin', run: async () => `Ventas mes: ${(await api.getDashboard()).salesMonth}` },
];

interface Result { status: 'idle' | 'running' | 'ok' | 'fail'; detail?: string }

export function Diagnostics() {
  const [ping, setPing] = React.useState<Awaited<ReturnType<typeof pingBackend>> | null>(null);
  const [pinging, setPinging] = React.useState(false);
  const [results, setResults] = React.useState<Record<string, Result>>({});
  const [running, setRunning] = React.useState(false);

  const doPing = async () => {
    setPinging(true);
    setPing(await pingBackend());
    setPinging(false);
  };

  const runAll = async () => {
    setRunning(true);
    for (const c of CHECKS) {
      setResults((r) => ({ ...r, [c.name]: { status: 'running' } }));
      try {
        const detail = await c.run();
        setResults((r) => ({ ...r, [c.name]: { status: 'ok', detail } }));
      } catch (e) {
        setResults((r) => ({ ...r, [c.name]: { status: 'fail', detail: e instanceof Error ? e.message : String(e) } }));
      }
    }
    setRunning(false);
  };

  React.useEffect(() => {
    doPing();
    runAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const okCount = Object.values(results).filter((r) => r.status === 'ok').length;
  const failCount = Object.values(results).filter((r) => r.status === 'fail').length;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Diagnóstico de conexión</h1>
          <p className="mt-1 text-muted-foreground">Verifica que la tienda esté conectada a Google Sheets.</p>
        </div>
        <Button variant="outline" onClick={() => { doPing(); runAll(); }} loading={running || pinging}>
          <RefreshCw className="h-4 w-4" /> Reintentar
        </Button>
      </div>

      {/* Modo */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center gap-3">
          {BACKEND.usingMock ? (
            <Badge tone="warning">Modo DEMO (mock) — no conectado a Sheets</Badge>
          ) : (
            <Badge tone="success">Modo REAL — apunta a Google Apps Script</Badge>
          )}
          <span className="text-sm text-muted-foreground">{okCount} OK · {failCount} con error</span>
        </div>
        <p className="mt-3 break-all rounded-lg bg-muted/50 p-3 font-mono text-xs text-muted-foreground">{BACKEND.url}</p>
      </div>

      {/* Ping crudo */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-semibold">Prueba de conexión directa</h2>
        {!ping ? (
          <p className="mt-2 text-sm text-muted-foreground">Probando…</p>
        ) : ping.ok ? (
          <div className="mt-2 flex items-start gap-2 text-sm text-emerald-600">
            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>Conexión correcta. El backend respondió JSON (HTTP {ping.status}).</span>
          </div>
        ) : (
          <div className="mt-2 space-y-3">
            <div className="flex items-start gap-2 text-sm text-red-600">
              <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>
                No se pudo leer JSON del backend.{' '}
                {ping.error ? `Error: ${ping.error}` : `HTTP ${ping.status} · ${ping.contentType || 'sin content-type'}`}
              </span>
            </div>
            {ping.snippet && (
              <pre className="max-h-40 overflow-auto rounded-lg bg-muted/50 p-3 text-xs">{ping.snippet}</pre>
            )}
            <BackendHelp ping={ping} />
          </div>
        )}
      </div>

      {/* Checks por endpoint */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-3 font-semibold">Funciones del backend</h2>
        <div className="divide-y divide-border">
          {CHECKS.map((c) => {
            const r = results[c.name] ?? { status: 'idle' as const };
            return (
              <div key={c.name} className="flex items-start justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{c.name}</p>
                  {r.detail && (
                    <p className={cn('mt-0.5 break-words text-xs', r.status === 'fail' ? 'text-red-600' : 'text-muted-foreground')}>
                      {r.detail}
                    </p>
                  )}
                </div>
                <StatusPill status={r.status} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: Result['status'] }) {
  if (status === 'ok') return <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600"><CheckCircle2 className="h-4 w-4" /> OK</span>;
  if (status === 'fail') return <span className="flex items-center gap-1 text-xs font-semibold text-red-600"><XCircle className="h-4 w-4" /> Error</span>;
  if (status === 'running') return <span className="text-xs text-muted-foreground">Probando…</span>;
  return <span className="text-xs text-muted-foreground">—</span>;
}

function BackendHelp({ ping }: { ping: Awaited<ReturnType<typeof pingBackend>> }) {
  const isNetwork = !!ping.error;
  const isHtml = ping.snippet.trim().startsWith('<');
  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
      <p className="flex items-center gap-2 font-semibold text-amber-600">
        <AlertTriangle className="h-4 w-4" /> Cómo resolverlo
      </p>
      <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted-foreground">
        {isNetwork && (
          <li><strong>Bloqueo de red/CORS o URL errada:</strong> confirma que la URL de arriba es exactamente tu <code>/exec</code> y que el Web App está publicado.</li>
        )}
        {isHtml && (
          <li><strong>El Deploy no es anónimo:</strong> en Apps Script → Implementar → Gestionar implementaciones → editar → <em>Quién tiene acceso: <strong>Cualquier persona</strong></em> (no "con cuenta de Google").</li>
        )}
        <li>¿Ejecutaste <code>setup()</code> y <code>seedData()</code>? Sin eso, las hojas están vacías o faltan.</li>
        <li>Tras pegar/editar <code>Code.gs</code>, publica una <strong>versión nueva</strong> (Implementar → Gestionar implementaciones → editar ✎ → Versión: Nueva) para conservar la misma URL.</li>
        <li>Verifica que la constante <code>ADMIN_TOKEN</code> en <code>Code.gs</code> sea <code>vertice-dev-token</code>.</li>
      </ol>
    </div>
  );
}
