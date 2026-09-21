import * as React from 'react';
import { Check, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { SiteContent } from '@/lib/types';
import { api } from '@/lib/api';
import { useAsync } from '@/hooks/useAsync';
import { setSiteContentCache } from '@/hooks/useSiteContent';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { SmartImage } from '@/components/ui/smart-image';

/** Editor de contenido del sitio (hero, anuncio, promo, ¿Quiénes Somos?). */
export function Content() {
  const { data, loading } = useAsync(() => api.getContent(), []);
  const [form, setForm] = React.useState<SiteContent | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  if (loading || !form) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  const set = <K extends keyof SiteContent>(k: K, v: SiteContent[K]) => {
    setForm((f) => (f ? { ...f, [k]: v } : f));
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await api.saveContent(form);
      setSiteContentCache(res); // refresca la tienda sin recargar
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Contenido del sitio</h1>
          <p className="mt-1 text-muted-foreground">Edita los textos e imágenes de la tienda.</p>
        </div>
        <Link to="/" target="_blank"><Button variant="outline"><Eye className="h-4 w-4" /> Ver tienda</Button></Link>
      </div>

      <Section title="Barra de anuncios">
        <Input label="Texto del anuncio (se desliza en la parte superior)" value={form.announcement} onChange={(e) => set('announcement', e.target.value)} />
      </Section>

      <Section title="Hero principal">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Etiqueta superior" value={form.heroEyebrow} onChange={(e) => set('heroEyebrow', e.target.value)} />
          <Input label="Imagen (URL)" value={form.heroImage} onChange={(e) => set('heroImage', e.target.value)} />
          <Input label="Título" value={form.heroTitle} onChange={(e) => set('heroTitle', e.target.value)} />
          <Input label="Palabra destacada (verde)" value={form.heroHighlight} onChange={(e) => set('heroHighlight', e.target.value)} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Subtítulo</label>
          <textarea rows={2} value={form.heroSubtitle} onChange={(e) => set('heroSubtitle', e.target.value)} className="w-full rounded-xl border border-input bg-background px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-ring/50" />
        </div>
        {form.heroImage && <SmartImage src={form.heroImage} alt="Vista previa hero" ratio="aspect-[21/9]" wrapperClassName="rounded-xl border border-border" />}
      </Section>

      <Section title="Bloque promocional (empresas/eventos)">
        <Input label="Título" value={form.promoTitle} onChange={(e) => set('promoTitle', e.target.value)} />
        <div>
          <label className="mb-1.5 block text-sm font-medium">Texto</label>
          <textarea rows={2} value={form.promoText} onChange={(e) => set('promoText', e.target.value)} className="w-full rounded-xl border border-input bg-background px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-ring/50" />
        </div>
      </Section>

      <Section title="¿Quiénes Somos?">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Título" value={form.aboutTitle} onChange={(e) => set('aboutTitle', e.target.value)} />
          <Input label="Imagen (URL)" value={form.aboutImage} onChange={(e) => set('aboutImage', e.target.value)} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Texto</label>
          <textarea rows={4} value={form.aboutText} onChange={(e) => set('aboutText', e.target.value)} className="w-full rounded-xl border border-input bg-background px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-ring/50" />
        </div>
      </Section>

      <div className="sticky bottom-4 flex justify-end">
        <Button onClick={save} loading={saving} size="lg" className="shadow-lift">
          {saved ? (<><Check className="h-4 w-4" /> Guardado</>) : 'Guardar cambios'}
        </Button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
      <h2 className="font-semibold">{title}</h2>
      {children}
    </section>
  );
}
