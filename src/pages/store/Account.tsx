import * as React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Package, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MOCK_ORDERS } from '@/lib/mockData';
import { formatCurrency, formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/lib/types';

const STATUS_LABEL: Record<OrderStatus, { label: string; tone: 'neutral' | 'info' | 'warning' | 'success' | 'danger' | 'brand' }> = {
  pending: { label: 'Pendiente', tone: 'warning' },
  paid: { label: 'Pagado', tone: 'info' },
  preparing: { label: 'Preparando', tone: 'brand' },
  shipped: { label: 'Enviado', tone: 'info' },
  delivered: { label: 'Entregado', tone: 'success' },
  cancelled: { label: 'Cancelado', tone: 'danger' },
};

/** Mi Cuenta — login demo del cliente + pestañas de pedidos/direcciones/wishlist. */
export function Account() {
  const [logged, setLogged] = React.useState(false);
  const [tab, setTab] = React.useState<'orders' | 'addresses' | 'wishlist'>('orders');

  if (!logged) return <ClientAuth onLogin={() => setLogged(true)} />;

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Mi cuenta</h1>
      <p className="mt-2 text-muted-foreground">Hola de nuevo 👋 Gestiona tus pedidos y datos.</p>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row">
        {/* Nav lateral */}
        <aside className="lg:w-56">
          <nav className="flex gap-2 lg:flex-col">
            <TabButton active={tab === 'orders'} onClick={() => setTab('orders')} icon={<Package className="h-4 w-4" />}>
              Mis pedidos
            </TabButton>
            <TabButton active={tab === 'addresses'} onClick={() => setTab('addresses')} icon={<MapPin className="h-4 w-4" />}>
              Direcciones
            </TabButton>
            <TabButton active={tab === 'wishlist'} onClick={() => setTab('wishlist')} icon={<Heart className="h-4 w-4" />}>
              Lista de deseos
            </TabButton>
            <button
              onClick={() => setLogged(false)}
              className="mt-2 rounded-xl px-4 py-2.5 text-left text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              Cerrar sesión
            </button>
          </nav>
        </aside>

        {/* Contenido */}
        <div className="flex-1">
          {tab === 'orders' && (
            <div className="space-y-4">
              {MOCK_ORDERS.slice(0, 3).map((o) => {
                const st = STATUS_LABEL[o.status];
                return (
                  <div key={o.id} className="rounded-2xl border border-border bg-card p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{o.id}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(o.createdAt)}</p>
                      </div>
                      <Badge tone={st.tone}>{st.label}</Badge>
                    </div>
                    <div className="mt-4 space-y-1 border-t border-border pt-4 text-sm">
                      {o.items.map((it, i) => (
                        <div key={i} className="flex justify-between">
                          <span className="text-muted-foreground">
                            {it.name} × {it.qty}
                          </span>
                          <span>{formatCurrency(it.unitPrice * it.qty)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                      <span className="font-semibold">{formatCurrency(o.total)}</span>
                      <Button variant="outline" size="sm">Ver tracking</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'addresses' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-2">
                  <Badge tone="brand">Principal</Badge>
                </div>
                <p className="mt-3 font-medium">Casa</p>
                <p className="mt-1 text-sm text-muted-foreground">Cra 43A #7-50, Apto 302<br />Medellín, Antioquia</p>
              </div>
              <button className="grid place-items-center rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground transition-colors hover:bg-muted">
                + Agregar dirección
              </button>
            </div>
          )}

          {tab === 'wishlist' && (
            <div className="grid place-items-center rounded-2xl border border-dashed border-border py-24 text-center">
              <Heart className="h-10 w-10 text-muted-foreground/40" />
              <p className="mt-4 font-semibold">Tu lista de deseos está vacía</p>
              <p className="mt-1 text-sm text-muted-foreground">Guarda tus productos favoritos para después.</p>
              <Link to="/catalogo" className="mt-4">
                <Button variant="outline" size="sm">Explorar tienda</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 rounded-xl px-4 py-2.5 text-left text-sm font-medium transition-colors',
        active ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/60',
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function ClientAuth({ onLogin }: { onLogin: () => void }) {
  const [mode, setMode] = React.useState<'login' | 'register'>('login');
  return (
    <div className="container grid place-items-center py-20">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-600/10 text-brand-600">
          <User className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-center text-2xl font-semibold tracking-tight">
          {mode === 'login' ? 'Inicia sesión' : 'Crea tu cuenta'}
        </h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          {mode === 'login' ? 'Accede a tus pedidos y datos.' : 'Compra más rápido y sigue tus envíos.'}
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onLogin();
          }}
          className="mt-6 space-y-4"
        >
          {mode === 'register' && <Input label="Nombre" placeholder="Tu nombre" required />}
          <Input label="Correo" type="email" placeholder="tu@correo.com" required />
          <Input label="Contraseña" type="password" placeholder="••••••••" required />
          <Button type="submit" className="w-full" size="lg">
            {mode === 'login' ? 'Ingresar' : 'Registrarme'}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="font-medium text-brand-600 hover:underline"
          >
            {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
          </button>
        </p>
      </div>
    </div>
  );
}
