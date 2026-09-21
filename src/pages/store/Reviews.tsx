import * as React from 'react';
import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import { api } from '@/lib/api';
import { useAsync } from '@/hooks/useAsync';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';

export function Reviews() {
  const { data, loading } = useAsync(() => api.getReviews(), []);
  const reviews = data ?? [];
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <div className="container py-14">
      {/* Cabecera con promedio */}
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-brand-700 dark:text-brand-400">Reseñas</p>
        <h1 className="mt-2 section-title">Lo que dice nuestra gente</h1>
        <div className="mt-5 inline-flex items-center gap-4 rounded-2xl glass-panel px-6 py-4">
          <span className="text-4xl font-extrabold">{avg.toFixed(1)}</span>
          <div className="text-left">
            <Stars value={Math.round(avg)} />
            <p className="mt-1 text-sm text-muted-foreground">{reviews.length} reseñas verificadas</p>
          </div>
        </div>
      </div>

      {/* Grid de reseñas */}
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)
          : reviews.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: Math.min(i * 0.05, 0.3) }}
                className="relative rounded-2xl border border-border bg-card p-6 shadow-soft"
              >
                <Quote className="absolute right-5 top-5 h-8 w-8 text-brand-500/20" />
                <Stars value={r.rating} />
                <p className="mt-3 text-sm leading-relaxed text-foreground/90">{r.text}</p>
                <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                  <span className="grid h-10 w-10 place-items-center rounded-full brand-gradient text-sm font-bold text-neutral-950">
                    {r.name.charAt(0)}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{r.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.product ? `${r.product} · ` : ''}{formatDate(r.date)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
      </div>

      {/* Deja tu reseña */}
      <ReviewForm />
    </div>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <div className="flex">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={cn('h-4 w-4', i < value ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30')} />
      ))}
    </div>
  );
}

function ReviewForm() {
  const [rating, setRating] = React.useState(5);
  const [sent, setSent] = React.useState(false);

  if (sent) {
    return (
      <div className="mx-auto mt-16 max-w-xl rounded-3xl border border-border bg-card p-8 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-500/15">
          <Star className="h-7 w-7 fill-brand-500 text-brand-500" />
        </div>
        <h3 className="mt-4 text-xl font-bold">¡Gracias por tu reseña!</h3>
        <p className="mt-1 text-sm text-muted-foreground">La revisaremos y la publicaremos muy pronto.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-16 max-w-xl rounded-3xl border border-border bg-card p-8">
      <h3 className="text-xl font-bold tracking-tight">Deja tu reseña</h3>
      <p className="mt-1 text-sm text-muted-foreground">Tu opinión ayuda a más personas a comprar con confianza.</p>
      <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="mt-5 space-y-4">
        <div>
          <p className="mb-1.5 text-sm font-medium">Tu calificación</p>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <button key={i} type="button" onClick={() => setRating(i + 1)} aria-label={`${i + 1} estrellas`}>
                <Star className={cn('h-7 w-7 transition-transform hover:scale-110', i < rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30')} />
              </button>
            ))}
          </div>
        </div>
        <Input label="Tu nombre" placeholder="Cómo te llamas" required />
        <div>
          <label className="mb-1.5 block text-sm font-medium">Tu experiencia</label>
          <textarea rows={4} required placeholder="Cuéntanos qué te pareció…" className="w-full rounded-xl border border-input bg-background px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-ring/50" />
        </div>
        <Button type="submit" className="w-full" size="lg">Publicar reseña</Button>
      </form>
    </div>
  );
}
