import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function NotFound() {
  return (
    <div className="container grid min-h-[60vh] place-items-center text-center">
      <div>
        <p className="text-7xl font-semibold tracking-tight text-brand-600">404</p>
        <h1 className="mt-4 text-2xl font-semibold">Página no encontrada</h1>
        <p className="mt-2 text-muted-foreground">La página que buscas no existe o fue movida.</p>
        <Link to="/" className="mt-6 inline-block">
          <Button>Volver al inicio</Button>
        </Link>
      </div>
    </div>
  );
}
