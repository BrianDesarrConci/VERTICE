import * as React from 'react';
import { Check, Eye, Palette, RotateCcw, ShoppingBag, Sparkles, Star } from 'lucide-react';
import type { SiteContent, StoreConfig } from '@/lib/types';
import { api } from '@/lib/api';
import { useAsync } from '@/hooks/useAsync';
import { setStoreConfigCache } from '@/hooks/useStoreConfig';
import { setSiteContentCache } from '@/hooks/useSiteContent';
import { applyBrandTheme, computeBrandVars, DEFAULT_PRIMARY, DEFAULT_SECONDARY } from '@/lib/theme';
import { toast } from '@/stores/toastStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const PRESETS: { name: string; primary: string; secondary: string }[] = [
  { name: 'Lima (actual)', primary: '#7DD100', secondary: '#BEEE00' },
  { name: 'Esmeralda', primary: '#10b981', secondary: '#6ee7b7' },
  { name: 'Océano', primary: '#2563eb', secondary: '#38bdf8' },
  { name: 'Violeta', primary: '#7c3aed', secondary: '#c4b5fd' },
  { name: 'Fucsia', primary: '#db2777', secondary: '#f9a8d4' },
  { name: 'Atardecer', primary: '#f97316', secondary: '#fbbf24' },
  { name: 'Oro', primary: '#d4af37', secondary: '#f5e08a' },
  { name: 'Carbón', primary: '#111827', secondary: '#6b7280' },
];

export function Appearance() {
  const cfg = useAsync(() => api.getConfig(), []);
  const cnt = useAsync(() => api.getContent(), []);
  const [config, setConfig] = React.useState<StoreConfig | null>(null);
  const [content, setContent] = React.useState<SiteContent | null>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => { if (cfg.data) setConfig(cfg.data); }, [cfg.data]);
  React.useEffect(() => { if (cnt.data) setContent(cnt.data); }, [cnt.data]);

  if (!config || !content) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <Skeleton className="h-[600px] rounded-2xl" />
        <Skeleton className="hidden h-[600px] rounded-2xl lg:block" />
      </div>
    );
  }

  const setC = <K extends keyof StoreConfig>(k: K, v: StoreConfig[K]) => setConfig((f) => (f ? { ...f, [k]: v } : f));
  const setT = <K extends keyof SiteContent>(k: K, v: SiteContent[K]) => setContent((f) => (f ? { ...f, [k]: v } : f));

  const save = async () => {
    setSaving(true);
    try {
      const [savedCfg, savedCnt] = await Promise.all([api.saveConfig(config), api.saveContent(content)]);
      setStoreConfigCache(savedCfg);
      setSiteContentCache(savedCnt);
      applyBrandTheme(savedCfg.primaryColor, savedCfg.secondaryColor); // aplica global al instante
      toast.success('Personalización guardada y publicada');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setC('primaryColor', DEFAULT_PRIMARY);
    setC('secondaryColor', DEFAULT_SECONDARY);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Personalización</h1>
          <p className="mt-1 text-muted-foreground">Cambia colores, logo y portada. Mira el resultado en vivo.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={reset}><RotateCcw className="h-4 w-4" /> Restablecer color</Button>
          <Button onClick={save} loading={saving}><Check className="h-4 w-4" /> Guardar y publicar</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        {/* ---- Formulario ---- */}
        <div className="space-y-6">
          {/* Marca */}
          <Section icon={<Palette className="h-4 w-4" />} title="Colores de marca">
            <div className="grid gap-4 sm:grid-cols-2">
              <ColorField label="Color principal" value={config.primaryColor} onChange={(v) => setC('primaryColor', v)} />
              <ColorField label="Color secundario" value={config.secondaryColor} onChange={(v) => setC('secondaryColor', v)} />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">Paletas rápidas</p>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => {
                  const active = p.primary.toLowerCase() === config.primaryColor.toLowerCase();
                  return (
                    <button
                      key={p.name}
                      onClick={() => { setC('primaryColor', p.primary); setC('secondaryColor', p.secondary); }}
                      title={p.name}
                      className={cn('flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-medium transition-all hover:shadow-soft', active ? 'border-foreground' : 'border-border')}
                    >
                      <span className="h-4 w-4 rounded-full" style={{ background: p.primary }} />
                      <span className="h-4 w-4 -ml-3 rounded-full ring-2 ring-card" style={{ background: p.secondary }} />
                      <span className="ml-1">{p.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </Section>

          {/* Identidad */}
          <Section icon={<Sparkles className="h-4 w-4" />} title="Identidad">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Nombre de la tienda" value={config.storeName} onChange={(e) => setC('storeName', e.target.value)} />
              <Input label="Logo (URL de imagen)" value={config.logoUrl} onChange={(e) => setC('logoUrl', e.target.value)} placeholder="https://… (vacío = logo por texto)" />
            </div>
            {config.logoUrl && (
              <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3">
                <img src={config.logoUrl} alt="Logo" className="h-10 w-auto max-w-[160px] object-contain" />
                <span className="text-xs text-muted-foreground">Vista del logo</span>
              </div>
            )}
          </Section>

          {/* Portada */}
          <Section icon={<Eye className="h-4 w-4" />} title="Portada (Hero)">
            <Input label="Etiqueta superior" value={content.heroEyebrow} onChange={(e) => setT('heroEyebrow', e.target.value)} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Título" value={content.heroTitle} onChange={(e) => setT('heroTitle', e.target.value)} />
              <Input label="Palabra destacada" value={content.heroHighlight} onChange={(e) => setT('heroHighlight', e.target.value)} />
            </div>
            <Textarea label="Subtítulo" value={content.heroSubtitle} onChange={(v) => setT('heroSubtitle', v)} rows={2} />
            <Input label="Imagen del hero (URL)" value={content.heroImage} onChange={(e) => setT('heroImage', e.target.value)} />
            <Input label="Barra de anuncios" value={content.announcement} onChange={(e) => setT('announcement', e.target.value)} />
          </Section>

          {/* Promo + About */}
          <Section title="Bloque promocional">
            <Input label="Título" value={content.promoTitle} onChange={(e) => setT('promoTitle', e.target.value)} />
            <Textarea label="Texto" value={content.promoText} onChange={(v) => setT('promoText', v)} rows={2} />
          </Section>
          <Section title="¿Quiénes Somos?">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Título" value={content.aboutTitle} onChange={(e) => setT('aboutTitle', e.target.value)} />
              <Input label="Imagen (URL)" value={content.aboutImage} onChange={(e) => setT('aboutImage', e.target.value)} />
            </div>
            <Textarea label="Texto" value={content.aboutText} onChange={(v) => setT('aboutText', v)} rows={3} />
          </Section>
        </div>

        {/* ---- Vista previa en vivo ---- */}
        <div className="lg:sticky lg:top-24 lg:h-fit">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" /></span>
            Vista previa en vivo
          </div>
          <LivePreview config={config} content={content} />
        </div>
      </div>
    </div>
  );
}

function Section({ icon, title, children }: { icon?: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
      <h2 className="flex items-center gap-2 font-semibold">{icon}{title}</h2>
      {children}
    </section>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-11 w-14 cursor-pointer rounded-xl border border-input bg-transparent p-1" />
        <input value={value} onChange={(e) => onChange(e.target.value)} className="h-11 flex-1 rounded-xl border border-input bg-background px-3 font-mono text-sm uppercase focus:outline-none focus:ring-2 focus:ring-ring/50" />
      </div>
    </div>
  );
}

function Textarea({ label, value, onChange, rows = 2 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-input bg-background px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-ring/50" />
    </div>
  );
}

/** Mini-render de la tienda con los valores pendientes (colores aplicados solo aquí). */
function LivePreview({ config, content }: { config: StoreConfig; content: SiteContent }) {
  const brandVars = computeBrandVars(config.primaryColor, config.secondaryColor) as unknown as React.CSSProperties;
  return (
    <div style={brandVars} className="overflow-hidden rounded-[1.75rem] border-4 border-neutral-800 bg-background shadow-lift">
      {/* Announcement */}
      <div className="brand-gradient truncate px-3 py-1 text-center text-[10px] font-bold text-neutral-950">{content.announcement}</div>
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-1.5 text-xs font-extrabold">
          {config.logoUrl ? (
            <img src={config.logoUrl} alt="" className="h-5 w-auto max-w-[90px] object-contain" />
          ) : (
            <>
              <span className="grid h-5 w-5 place-items-center rounded-md brand-gradient text-[10px] text-neutral-950">{config.storeName.charAt(0)}</span>
              {config.storeName}
            </>
          )}
        </div>
        <div className="hidden items-center gap-2 text-[9px] font-semibold text-muted-foreground sm:flex">
          <span>Inicio</span><span>Categorías</span><span>Reseñas</span>
        </div>
        <span className="grid h-5 w-5 place-items-center rounded-full brand-gradient"><ShoppingBag className="h-3 w-3 text-neutral-950" /></span>
      </div>
      {/* Hero */}
      <div className="relative h-40">
        <img src={content.heroImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center gap-1.5 p-4 text-white">
          <span className="w-fit rounded-full bg-white/15 px-2 py-0.5 text-[9px] font-semibold backdrop-blur">{content.heroEyebrow}</span>
          <p className="font-display text-2xl font-extrabold leading-none">
            {content.heroTitle} <span className="brand-text">{content.heroHighlight}</span>
          </p>
          <p className="max-w-[70%] text-[10px] text-white/85 line-clamp-2">{content.heroSubtitle}</p>
          <span className="mt-1 w-fit rounded-full bg-brand-500 px-3 py-1 text-[10px] font-bold text-neutral-950 shadow-btn-brand">Comprar ahora</span>
        </div>
      </div>
      {/* Producto + promo */}
      <div className="grid grid-cols-2 gap-2 p-3">
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="relative h-20 bg-muted">
            <img src="https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=300&q=60" alt="" className="h-full w-full object-cover" />
            <span className="absolute left-1.5 top-1.5 rounded-full bg-red-500 px-1.5 py-0.5 text-[8px] font-bold text-white">-25%</span>
          </div>
          <div className="p-2">
            <p className="truncate text-[10px] font-semibold">Camiseta Oversize</p>
            <div className="flex items-center gap-0.5 text-[8px] text-muted-foreground"><Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" /> 4.9</div>
            <p className="text-xs font-bold">$59.900</p>
          </div>
        </div>
        <div className="flex flex-col justify-center rounded-xl brand-gradient p-3 text-neutral-950">
          <p className="text-[11px] font-extrabold leading-tight line-clamp-2">{content.promoTitle}</p>
          <span className="mt-1.5 w-fit rounded-full bg-neutral-950 px-2 py-1 text-[9px] font-bold text-white">Cotizar</span>
        </div>
      </div>
    </div>
  );
}
