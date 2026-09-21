import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Leaf, Sparkles, Truck } from 'lucide-react';
import { useSiteContent } from '@/hooks/useSiteContent';
import { Button } from '@/components/ui/button';
import { SmartImage } from '@/components/ui/smart-image';

const VALUES = [
  { icon: Sparkles, title: 'Calidad premium', text: 'Estampados de alta durabilidad que no se agrietan ni destiñen.' },
  { icon: Leaf, title: 'Procesos responsables', text: 'Materiales cuidados y producción consciente en cada lote.' },
  { icon: Heart, title: 'Hecho con pasión', text: 'Un equipo que ama el diseño y cuida cada detalle.' },
  { icon: Truck, title: 'Entrega a tiempo', text: 'Enviamos a todo el país con seguimiento en cada pedido.' },
];

const STATS = [
  { value: '15K+', label: 'Prendas entregadas' },
  { value: '4.9', label: 'Calificación promedio' },
  { value: '48h', label: 'Despacho promedio' },
  { value: '100%', label: 'Clientes felices' },
];

export function About() {
  const content = useSiteContent();

  return (
    <div className="pb-20">
      {/* Hero */}
      <section className="container py-14">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <p className="text-sm font-bold uppercase tracking-widest text-brand-700 dark:text-brand-400">¿Quiénes Somos?</p>
            <h1 className="mt-2 section-title">{content.aboutTitle}</h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{content.aboutText}</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link to="/catalogo"><Button size="lg" className="w-full sm:w-auto">Ver la colección</Button></Link>
              <Link to="/resenas"><Button size="lg" variant="outline" className="w-full sm:w-auto">Ver reseñas</Button></Link>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
            <SmartImage src={content.aboutImage} alt="Sobre VÉRTICE" ratio="aspect-[4/3]" wrapperClassName="rounded-3xl border border-border shadow-lift" />
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="container">
        <div className="grid grid-cols-2 gap-4 rounded-3xl brand-gradient p-8 text-neutral-950 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-extrabold sm:text-4xl">{s.value}</p>
              <p className="mt-1 text-sm font-medium opacity-80">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Valores */}
      <section className="container py-16">
        <h2 className="text-center section-title">Lo que nos mueve</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
              className="rounded-2xl border border-border bg-card p-6 text-center"
            >
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-500/15 text-brand-700 dark:text-brand-400">
                <v.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-bold">{v.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{v.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="container">
        <div className="rounded-3xl border border-border bg-card p-10 text-center">
          <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">Lleva puesto tu impacto</h3>
          <p className="mx-auto mt-2 max-w-xl text-muted-foreground">Únete a miles de personas que ya visten VÉRTICE. Diseño, calidad y actitud.</p>
          <Link to="/catalogo" className="mt-6 inline-block"><Button size="lg">Explorar tienda</Button></Link>
        </div>
      </section>
    </div>
  );
}
