import { Link } from 'react-router-dom';
import { Instagram, Facebook, Music2, Mail, Phone, MapPin, ShieldCheck, Truck, CreditCard } from 'lucide-react';
import { useSiteContent } from '@/hooks/useSiteContent';
import { useStoreConfig } from '@/hooks/useStoreConfig';

const COLUMNS = [
  {
    title: 'Comprar',
    links: [
      { label: 'Dama', to: '/categorias/dama' },
      { label: 'Caballero', to: '/categorias/caballero' },
      { label: 'Niño', to: '/categorias/nino' },
      { label: 'Toda la colección', to: '/catalogo' },
    ],
  },
  {
    title: 'VÉRTICE',
    links: [
      { label: '¿Quiénes Somos?', to: '/nosotros' },
      { label: 'Reseñas', to: '/resenas' },
      { label: 'Mi cuenta', to: '/cuenta' },
    ],
  },
  {
    title: 'Ayuda',
    links: [
      { label: 'Envíos y entregas', to: '/nosotros' },
      { label: 'Cambios y devoluciones', to: '/nosotros' },
      { label: 'Contáctanos', to: '/nosotros' },
    ],
  },
];

export function Footer() {
  const content = useSiteContent();
  const config = useStoreConfig();
  const socials = [
    { url: content.instagramUrl, Icon: Instagram },
    { url: content.facebookUrl, Icon: Facebook },
    { url: content.tiktokUrl, Icon: Music2 },
  ].filter((s) => s.url);

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
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold">
            {config.logoUrl ? (
              <img src={config.logoUrl} alt={config.storeName} className="h-7 w-auto max-w-[150px] object-contain" />
            ) : (
              <>
                <span className="grid h-7 w-7 place-items-center rounded-lg brand-gradient text-neutral-950">{config.storeName.charAt(0)}</span>
                {config.storeName}
              </>
            )}
          </Link>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">{content.footerText}</p>
          {socials.length > 0 && (
            <div className="mt-4 flex gap-2">
              {socials.map(({ url, Icon }, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Red social"
                  className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-brand-500 hover:text-neutral-950"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          )}
          {/* Contacto */}
          <div className="mt-5 space-y-1.5 text-sm text-muted-foreground">
            {content.contactEmail && <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> {content.contactEmail}</p>}
            {content.contactPhone && <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> {content.contactPhone}</p>}
            {content.contactAddress && <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {content.contactAddress}</p>}
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
