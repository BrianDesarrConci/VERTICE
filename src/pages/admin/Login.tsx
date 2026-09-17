import * as React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Lock, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/** Login del panel admin. Credenciales demo mostradas en pantalla (modo mock). */
export function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);

  const [email, setEmail] = React.useState('admin@vertice.co');
  const [password, setPassword] = React.useState('vertice123');

  const from = (location.state as { from?: string })?.from ?? '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await login(email, password);
    if (ok) navigate(from, { replace: true });
  };

  return (
    <div className="grid min-h-screen place-items-center bg-muted/20 p-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-600 text-2xl font-bold text-white">
            V
          </div>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight">Panel VÉRTICE</h1>
          <p className="mt-1 text-sm text-muted-foreground">Acceso exclusivo para administradores</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-border bg-card p-7">
          <Input
            label="Correo"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
          />
          <Input
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          {error && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600">{error}</p>
          )}
          <Button type="submit" className="w-full" size="lg" loading={loading}>
            <Lock className="h-4 w-4" /> Ingresar
          </Button>

          <div className="flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-2.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 flex-shrink-0" />
            Demo: <strong>admin@vertice.co</strong> / <strong>vertice123</strong>
          </div>
        </form>
      </div>
    </div>
  );
}
