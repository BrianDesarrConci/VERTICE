import * as React from 'react';
import { Check, Eye, Layout, Palette, RotateCcw, Settings2, Share2, Sparkles, Star, ShoppingBag } from 'lucide-react';
import type { HeroAlign, RadiusStyle, ButtonStyle, SeasonalEffect, SiteContent, StoreConfig } from '@/lib/types';
import { api } from '@/lib/api';
import { MOCK_CONFIG, MOCK_CONTENT } from '@/lib/mockData';
import { useAsync } from '@/hooks/useAsync';
import { setStoreConfigCache } from '@/hooks/useStoreConfig';
import { setSiteContentCache } from '@/hooks/useSiteContent';
import { applyBrandTheme, computeBrandVars, DEFAULT_PRIMARY, DEFAULT_SECONDARY } from '@/lib/theme';
import { toast } from '@/stores/toastStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const PRESETS = [
  { name: 'Lima', primary: '#7DD100', secondary: '#BEEE00' },
  { name: 'Esmeralda', primary: '#10b981', secondary: '#6ee7b7' },
  { name: 'Océano', primary: '#2563eb', secondary: '#38bdf8' },
  { name: 'Violeta', primary: '#7c3aed', secondary: '#c4b5fd' },
  { name: 'Fucsia', primary: '#db2777', secondary: '#f9a8d4' },
  { name: 'Atardecer', primary: '#f97316', secondary: '#fbbf24' },
  { name: 'Oro', primary: '#d4af37', secondary: '#f5e08a' },
  { name: 'Carbón', primary: '#111827', secondary: '#6b7280' },
];

// Ediciones de temporada de un clic: colores + efecto + anuncio + sello.
const SEASONS: { id: string; label: string; emoji: string; primary: string; secondary: string; effect: SeasonalEffect; badge: string; announcement: string }[] = [
  { id: 'none', label: 'Sin temporada', emoji: '🟢', primary: '#7DD100', secondary: '#BEEE00', effect: 'none', badge: '', announcement: '🚚 Envío GRATIS en compras sobre $200.000 · 🎁 Usa BIENVENIDA y llévate 10% OFF' },
  { id: 'love', label: 'Amor y Amistad', emoji: '💘', primary: '#e11d48', secondary: '#fb7185', effect: 'hearts', badge: '💘 Amor y Amistad', announcement: '💝 Especial Amor y Amistad · Regala VÉRTICE · Envío GRATIS' },
  { id: 'halloween', label: 'Halloween', emoji: '🎃', primary: '#f97316', secondary: '#7c3aed', effect: 'spooky', badge: '🎃 Halloween', announcement: '🎃 Halloween VÉRTICE · Descuentos de miedo hasta -30%' },
  { id: 'christmas', label: 'Navidad', emoji: '🎄', primary: '#dc2626', secondary: '#16a34a', effect: 'snow', badge: '🎄 Navidad', announcement: '🎄 Navidad VÉRTICE · Regalos que enamoran · Envío GRATIS' },
  { id: 'blackfriday', label: 'Black Friday', emoji: '🖤', primary: '#111827', secondary: '#eab308', effect: 'confetti', badge: '🖤 Black Friday', announcement: '🖤 BLACK FRIDAY · Hasta -50% · ¡Solo por hoy!' },
  { id: 'newyear', label: 'Año Nuevo', emoji: '🎆', primary: '#d4af37', secondary: '#38bdf8', effect: 'stars', badge: '🎆 Año Nuevo', announcement: '🎆 Año Nuevo VÉRTICE · Comienza con estilo' },
];

const TABS = [
  { id: 'marca', label: 'Marca', icon: Palette },
  { id: 'portada', label: 'Portada', icon: Eye },
  { id: 'secciones', label: 'Secciones', icon: Layout },
  { id: 'temporada', label: 'Temporada', icon: Sparkles },
  { id: 'contacto', label: 'Footer & Contacto', icon: Share2 },
  { id: 'efectos', label: 'Efectos', icon: Settings2 },
] as const;

export function Appearance() {
  const cfg = useAsync(() => api.getConfig(), []);
  const cnt = useAsync(() => api.getContent(), []);
  const [config, setConfig] = React.useState<StoreConfig | null>(null);
  const [content, setContent] = React.useState<SiteContent | null>(null);
  const [tab, setTab] = React.useState<(typeof TABS)[number]['id']>('marca');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => { if (cfg.data) setConfig({ ...MOCK_CONFIG, ...cfg.data }); }, [cfg.data]);
  React.useEffect(() => { if (cnt.data) setContent({ ...MOCK_CONTENT, ...cnt.data }); }, [cnt.data]);

  if (!config || !content) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <Skeleton className="h-[620px] rounded-2xl" />
        <Skeleton className="hidden h-[620px] rounded-2xl lg:block" />
      </div>
    );
  }

  const setC = <K extends keyof StoreConfig>(k: K, v: StoreConfig[K]) => setConfig((f) => (f ? { ...f, [k]: v } : f));
  const setT = <K extends keyof SiteContent>(k: K, v: SiteContent[K]) => setContent((f) => (f ? { ...f, [k]: v } : f));

  const applySeason = (s: (typeof SEASONS)[number]) => {
    setC('primaryColor', s.primary);
    setC('secondaryColor', s.secondary);
    setContent((f) => (f ? { ...f, seasonalEffect: s.effect, seasonBadge: s.badge, announcement: s.announcement, showAnnouncement: true } : f));
    toast.info(`Temporada "${s.label}" aplicada · Guarda para publicar`);
  };

  const save = async () => {
    setSaving(true);
    try {
      const [sc, sn] = await Promise.all([api.saveConfig(config), api.saveContent(content)]);
      setStoreConfigCache(sc);
      setSiteContentCache(sn);
      applyBrandTheme(sc.primaryColor, sc.secondaryColor);
      toast.success('Personalización guardada y publicada');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Personalización</h1>
          <p className="mt-1 text-muted-foreground">Controla colores, portada, secciones, temporada y más — con vista previa en vivo.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setC('primaryColor', DEFAULT_PRIMARY); setC('secondaryColor', DEFAULT_SECONDARY); }}><RotateCcw className="h-4 w-4" /> Color base</Button>
          <Button onClick={save} loading={saving}><Check className="h-4 w-4" /> Guardar y publicar</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all',
              tab === t.id ? 'border-transparent bg-brand-500 text-neutral-950 shadow-btn-brand' : 'border-border bg-card hover:bg-muted',
            )}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        {/* ---- Panel de controles ---- */}
        <div className="space-y-6">
          {tab === 'marca' && (
            <>
              <Card title="Colores de marca">
                <div className="grid gap-4 sm:grid-cols-2">
                  <ColorField label="Color principal" value={config.primaryColor} onChange={(v) => setC('primaryColor', v)} />
                  <ColorField label="Color secundario" value={config.secondaryColor} onChange={(v) => setC('secondaryColor', v)} />
                </div>
                <p className="mb-2 mt-1 text-sm font-medium">Paletas rápidas</p>
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map((p) => (
                    <button key={p.name} onClick={() => { setC('primaryColor', p.primary); setC('secondaryColor', p.secondary); }} title={p.name}
                      className={cn('flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-medium transition-all hover:shadow-soft', p.primary.toLowerCase() === (config.primaryColor || '').toLowerCase() ? 'border-foreground' : 'border-border')}>
                      <span className="h-4 w-4 rounded-full" style={{ background: p.primary }} />
                      <span className="ml-1">{p.name}</span>
                    </button>
                  ))}
                </div>
              </Card>
              <Card title="Identidad">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Nombre de la tienda" value={config.storeName} onChange={(e) => setC('storeName', e.target.value)} />
                  <Input label="Logo (URL)" value={config.logoUrl} onChange={(e) => setC('logoUrl', e.target.value)} placeholder="https://… (vacío = texto)" />
                </div>
                {config.logoUrl && <img src={config.logoUrl} alt="Logo" className="h-10 w-auto max-w-[160px] rounded-lg bg-muted/40 object-contain p-1" />}
              </Card>
              <Card title="Estilo global">
                <div className="grid gap-4 sm:grid-cols-2">
                  <SelectField label="Esquinas" value={content.radius} onChange={(v) => setT('radius', v as RadiusStyle)} options={[['soft', 'Suaves'], ['round', 'Muy redondeadas'], ['sharp', 'Rectas']]} />
                  <SelectField label="Botones" value={content.buttonStyle} onChange={(v) => setT('buttonStyle', v as ButtonStyle)} options={[['pill', 'Píldora'], ['rounded', 'Redondeados']]} />
                </div>
              </Card>
            </>
          )}

          {tab === 'portada' && (
            <>
              <Card title="Textos del hero">
                <Input label="Etiqueta superior" value={content.heroEyebrow} onChange={(e) => setT('heroEyebrow', e.target.value)} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Título" value={content.heroTitle} onChange={(e) => setT('heroTitle', e.target.value)} />
                  <Input label="Palabra destacada" value={content.heroHighlight} onChange={(e) => setT('heroHighlight', e.target.value)} />
                </div>
                <Area label="Subtítulo" value={content.heroSubtitle} onChange={(v) => setT('heroSubtitle', v)} />
                <Input label="Imagen del hero (URL)" value={content.heroImage} onChange={(e) => setT('heroImage', e.target.value)} />
              </Card>
              <Card title="Botones y estilo del hero">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Texto botón principal" value={content.heroCtaText} onChange={(e) => setT('heroCtaText', e.target.value)} />
                  <Input label="Enlace botón principal" value={content.heroCtaLink} onChange={(e) => setT('heroCtaLink', e.target.value)} placeholder="/catalogo" />
                  <Input label="Texto botón secundario" value={content.heroSecondaryText} onChange={(e) => setT('heroSecondaryText', e.target.value)} placeholder="(vacío = ocultar)" />
                  <SelectField label="Alineación" value={content.heroAlign} onChange={(v) => setT('heroAlign', v as HeroAlign)} options={[['left', 'Izquierda'], ['center', 'Centrado']]} />
                </div>
                <Range label="Oscurecido de la imagen" value={content.heroOverlay} onChange={(v) => setT('heroOverlay', v)} />
              </Card>
            </>
          )}

          {tab === 'secciones' && (
            <>
              <Card title="Encabezado">
                <Input label="Barra de anuncios" value={content.announcement} onChange={(e) => setT('announcement', e.target.value)} />
                <Toggle label="Mostrar barra de anuncios" value={content.showAnnouncement} onChange={(v) => setT('showAnnouncement', v)} />
                <Toggle label="Mostrar buscador" value={content.showSearch} onChange={(v) => setT('showSearch', v)} />
              </Card>
              <Card title="Secciones del inicio">
                <ToggleRow label="Categorías (Dama/Caballero/Niño)" value={content.showCategories} onChange={(v) => setT('showCategories', v)} extra={<Input value={content.categoriesTitle} onChange={(e) => setT('categoriesTitle', e.target.value)} />} />
                <ToggleRow label="Tendencias" value={content.showTrending} onChange={(v) => setT('showTrending', v)} extra={<Input value={content.trendingTitle} onChange={(e) => setT('trendingTitle', e.target.value)} />} />
                <ToggleRow label="Novedades" value={content.showNew} onChange={(v) => setT('showNew', v)} extra={<Input value={content.newTitle} onChange={(e) => setT('newTitle', e.target.value)} />} />
                <Toggle label="Reseñas en el inicio" value={content.showReviewsHome} onChange={(v) => setT('showReviewsHome', v)} />
                <ToggleRow label="Boletín (newsletter)" value={content.showNewsletter} onChange={(v) => setT('showNewsletter', v)} extra={<Input value={content.newsletterTitle} onChange={(e) => setT('newsletterTitle', e.target.value)} />} />
              </Card>
              <Card title="Bloque promocional">
                <Toggle label="Mostrar bloque promocional" value={content.showPromo} onChange={(v) => setT('showPromo', v)} />
                <Input label="Título" value={content.promoTitle} onChange={(e) => setT('promoTitle', e.target.value)} />
                <Area label="Texto" value={content.promoText} onChange={(v) => setT('promoText', v)} />
              </Card>
              <Card title="¿Quiénes Somos?">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Título" value={content.aboutTitle} onChange={(e) => setT('aboutTitle', e.target.value)} />
                  <Input label="Imagen (URL)" value={content.aboutImage} onChange={(e) => setT('aboutImage', e.target.value)} />
                </div>
                <Area label="Texto" value={content.aboutText} onChange={(v) => setT('aboutText', v)} rows={3} />
              </Card>
            </>
          )}

          {tab === 'temporada' && (
            <>
              <Card title="Ediciones de temporada (1 clic)">
                <p className="text-sm text-muted-foreground">Aplica colores, efecto animado, sello y anuncio de golpe. Luego pulsa “Guardar y publicar”.</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {SEASONS.map((s) => (
                    <button key={s.id} onClick={() => applySeason(s)}
                      className="group rounded-2xl border border-border p-4 text-center transition-all hover:-translate-y-0.5 hover:border-brand-500 hover:shadow-lift">
                      <div className="text-3xl">{s.emoji}</div>
                      <p className="mt-1 text-sm font-semibold">{s.label}</p>
                      <div className="mt-2 flex justify-center gap-1">
                        <span className="h-3 w-3 rounded-full" style={{ background: s.primary }} />
                        <span className="h-3 w-3 rounded-full" style={{ background: s.secondary }} />
                      </div>
                    </button>
                  ))}
                </div>
              </Card>
              <Card title="Ajuste manual de temporada">
                <SelectField label="Efecto animado" value={content.seasonalEffect} onChange={(v) => setT('seasonalEffect', v as SeasonalEffect)}
                  options={[['none', 'Ninguno'], ['hearts', 'Corazones 💖'], ['snow', 'Nieve ❄️'], ['leaves', 'Hojas 🍂'], ['confetti', 'Confeti 🎉'], ['spooky', 'Halloween 🎃'], ['stars', 'Estrellas ⭐']]} />
                <Input label="Sello de temporada (sobre el hero)" value={content.seasonBadge} onChange={(e) => setT('seasonBadge', e.target.value)} placeholder="Ej: 🎄 Navidad (vacío = ocultar)" />
              </Card>
            </>
          )}

          {tab === 'contacto' && (
            <>
              <Card title="Footer">
                <Area label="Texto del footer" value={content.footerText} onChange={(v) => setT('footerText', v)} />
              </Card>
              <Card title="Redes sociales">
                <Input label="Instagram (URL)" value={content.instagramUrl} onChange={(e) => setT('instagramUrl', e.target.value)} />
                <Input label="Facebook (URL)" value={content.facebookUrl} onChange={(e) => setT('facebookUrl', e.target.value)} />
                <Input label="TikTok (URL)" value={content.tiktokUrl} onChange={(e) => setT('tiktokUrl', e.target.value)} />
              </Card>
              <Card title="WhatsApp">
                <Input label="Número de WhatsApp (con indicativo)" value={content.whatsappNumber} onChange={(e) => setT('whatsappNumber', e.target.value)} placeholder="573001234567" />
                <Toggle label="Mostrar botón flotante de WhatsApp" value={content.showWhatsappFloat} onChange={(v) => setT('showWhatsappFloat', v)} />
              </Card>
              <Card title="Datos de contacto">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Correo" value={content.contactEmail} onChange={(e) => setT('contactEmail', e.target.value)} />
                  <Input label="Teléfono" value={content.contactPhone} onChange={(e) => setT('contactPhone', e.target.value)} />
                  <Input label="Dirección" value={content.contactAddress} onChange={(e) => setT('contactAddress', e.target.value)} />
                  <Input label="Horario" value={content.contactHours} onChange={(e) => setT('contactHours', e.target.value)} />
                </div>
              </Card>
            </>
          )}

          {tab === 'efectos' && (
            <Card title="Fondo y efectos">
              <Toggle label="Fondo con gradient blobs" value={content.showBlobs} onChange={(v) => setT('showBlobs', v)} />
              <Range label="Intensidad del fondo" value={content.blobIntensity} onChange={(v) => setT('blobIntensity', v)} />
              <SelectField label="Efecto de temporada" value={content.seasonalEffect} onChange={(v) => setT('seasonalEffect', v as SeasonalEffect)}
                options={[['none', 'Ninguno'], ['hearts', 'Corazones 💖'], ['snow', 'Nieve ❄️'], ['leaves', 'Hojas 🍂'], ['confetti', 'Confeti 🎉'], ['spooky', 'Halloween 🎃'], ['stars', 'Estrellas ⭐']]} />
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField label="Esquinas" value={content.radius} onChange={(v) => setT('radius', v as RadiusStyle)} options={[['soft', 'Suaves'], ['round', 'Muy redondeadas'], ['sharp', 'Rectas']]} />
                <SelectField label="Botones" value={content.buttonStyle} onChange={(v) => setT('buttonStyle', v as ButtonStyle)} options={[['pill', 'Píldora'], ['rounded', 'Redondeados']]} />
              </div>
            </Card>
          )}
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

// ---------- Controles reutilizables ----------
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
      <h2 className="font-semibold">{title}</h2>
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
function Area({ label, value, onChange, rows = 2 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-input bg-background px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-ring/50" />
    </div>
  );
}
function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="h-11 w-full rounded-xl border border-input bg-background px-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-ring/50">
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );
}
function Range({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm font-medium"><span>{label}</span><span className="text-muted-foreground">{value}%</span></div>
      <input type="range" min={0} max={100} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-brand-500" />
    </div>
  );
}
function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3">
      <span className="text-sm font-medium">{label}</span>
      <button type="button" role="switch" aria-checked={value} onClick={() => onChange(!value)}
        className={cn('relative h-6 w-11 flex-shrink-0 rounded-full transition-colors', value ? 'bg-brand-500' : 'bg-muted-foreground/30')}>
        <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all', value ? 'left-[22px]' : 'left-0.5')} />
      </button>
    </label>
  );
}
function ToggleRow({ label, value, onChange, extra }: { label: string; value: boolean; onChange: (v: boolean) => void; extra: React.ReactNode }) {
  return (
    <div className="space-y-2 border-b border-border pb-3 last:border-0 last:pb-0">
      <Toggle label={label} value={value} onChange={onChange} />
      {value && <div className="pl-1">{extra}</div>}
    </div>
  );
}

/** Mini-render de la tienda con los valores pendientes (colores aplicados solo aquí). */
function LivePreview({ config, content }: { config: StoreConfig; content: SiteContent }) {
  const brandVars = computeBrandVars(config.primaryColor, config.secondaryColor) as unknown as React.CSSProperties;
  const centered = content.heroAlign === 'center';
  return (
    <div style={brandVars} className="overflow-hidden rounded-[1.75rem] border-4 border-neutral-800 bg-background shadow-lift">
      {content.showAnnouncement && content.announcement && (
        <div className="brand-gradient truncate px-3 py-1 text-center text-[10px] font-bold text-neutral-950">{content.announcement}</div>
      )}
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-1.5 text-xs font-extrabold">
          {config.logoUrl ? <img src={config.logoUrl} alt="" className="h-5 w-auto max-w-[90px] object-contain" /> : (
            <><span className="grid h-5 w-5 place-items-center rounded-md brand-gradient text-[10px] text-neutral-950">{config.storeName.charAt(0)}</span>{config.storeName}</>
          )}
        </div>
        <span className="grid h-5 w-5 place-items-center rounded-full brand-gradient"><ShoppingBag className="h-3 w-3 text-neutral-950" /></span>
      </div>
      <div className="relative h-40">
        <img src={content.heroImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className={cn('absolute inset-0', centered ? 'bg-black' : 'bg-gradient-to-r from-black to-transparent')} style={{ opacity: content.heroOverlay / 100 }} />
        <div className={cn('absolute inset-0 flex flex-col justify-center gap-1.5 p-4 text-white', centered && 'items-center text-center')}>
          {content.seasonBadge && <span className="w-fit rounded-full bg-brand-500 px-2 py-0.5 text-[9px] font-bold text-neutral-950">{content.seasonBadge}</span>}
          <span className="w-fit rounded-full bg-white/15 px-2 py-0.5 text-[9px] font-semibold backdrop-blur">{content.heroEyebrow}</span>
          <p className="font-display text-2xl font-extrabold leading-none">{content.heroTitle} <span className="brand-text">{content.heroHighlight}</span></p>
          <p className="max-w-[80%] text-[10px] text-white/85 line-clamp-2">{content.heroSubtitle}</p>
          <span className="mt-1 w-fit rounded-full bg-brand-500 px-3 py-1 text-[10px] font-bold text-neutral-950 shadow-btn-brand">{content.heroCtaText || 'Comprar'}</span>
        </div>
      </div>
      {content.showTrending && (
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
      )}
    </div>
  );
}
