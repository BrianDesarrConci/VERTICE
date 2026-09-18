import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Youtube, ShieldCheck, Truck, CreditCard } from 'lucide-react';

const COLUMNS = [
  {
    title: 'Comprar',
    links: [
      { label: 'Camisetas', to: '/catalogo/camisetas' },
      { label: 'Hoodies & Sacos', to: '/catalogo/hoodies' },
      { label: 'Libretas', to: '/catalogo/libretas' },
      { label: 'Totebags', to: '/catalogo/totebags' },
      { label: 'Accesorios', to: '/catalogo/accesorios' },
    ],
  },
  {
    title: 'Cuenta',
    links: [
      { label: 'Iniciar sesión', to: '/cuenta' },
      { label: 'Mis pedidos', to: '/cuenta' },
      { label: 'Lista de deseos', to: '/cuenta' },
    ],
  },
  {
    title: 'Ayuda',
    links: [
      { label: 'Centro de soporte', to: '/catalogo' },
      { label: 'Envíos y entregas', to: '/catalogo' },
      { label: 'Devoluciones', to: '/catalogo' },
      { label: 'Garantía', to: '/catalogo' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-muted/30">
      {/* Certificaciones */}
      <div className="container grid grid-cols-1 gap-6 border-b border-border py-10 sm:grid-cols-3">
        <Trust icon={<Truck className="h-5 w-5" />} title="Envío gratis" desc="En compras sobre $250.000" />
        <Trust icon={<ShieldCheck className="h-5 w-5" />} title="Calidad garantizada" desc="Estampados que duran, o te devolvemos" />
        <Trust icon={<CreditCard className="h-5 w-5" />} title="Pago seguro" desc="Tarjeta, PSE, Nequi y contra entrega" />
      </div>

      <div className="container grid grid-cols-2 gap-8 py-14 md:grid-cols-5">
        <div className="col-span-2">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-600 text-white">V</span>
            VÉRTICE
          </Link>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Merchandising que deja huella. Camisetas, hoodies, libretas y más, estampados con
            calidad premium y envío a todo el país.
          </p>
          <div className="mt-4 flex gap-2">
            {[Instagram, Facebook, Twitter, Youtube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="Red social"
                className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-semibold">{col.title}</h4>
            <ul className="mt-3 space-y-2">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="container flex flex-col items-center justify-between gap-3 py-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} VÉRTICE. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            <span>Visa</span>
            <span>Mastercard</span>
            <span>PSE</span>
            <span>Nequi</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Trust({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-full bg-brand-600/10 text-brand-600">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}
