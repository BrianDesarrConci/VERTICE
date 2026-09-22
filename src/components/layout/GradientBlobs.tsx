import * as React from 'react';

interface BlobSpec {
  top: string;
  left: string;
  size: number; // px
  gradient: string;
  speed: number; // factor de parallax vertical (px por px de scroll)
  dur: number; // duración de la flotación (s)
}

// Manchas de color que siguen las variables de marca (cambian con el tema).
const g = (v: string) => `radial-gradient(circle at 30% 30%, rgb(var(${v})), rgb(var(${v}) / 0) 70%)`;
const BLOBS: BlobSpec[] = [
  { top: '-8%', left: '-6%', size: 620, gradient: g('--brand-500'), speed: 0.12, dur: 20 },
  { top: '10%', left: '62%', size: 560, gradient: g('--brand2'), speed: -0.08, dur: 24 },
  { top: '45%', left: '20%', size: 480, gradient: g('--brand-400'), speed: 0.06, dur: 18 },
  { top: '68%', left: '72%', size: 600, gradient: g('--brand-500'), speed: -0.14, dur: 26 },
  { top: '82%', left: '8%', size: 440, gradient: g('--brand-300'), speed: 0.1, dur: 22 },
];

/**
 * Fondo ambiental de "gradient blobs": manchas de color grandes y difuminadas
 * que flotan suavemente y se desplazan con parallax al hacer scroll.
 * Decorativo (aria-hidden), sin captura de clics y respetando reduced-motion.
 */
export function GradientBlobs({ intensity = 55 }: { intensity?: number }) {
  const wrapsRef = React.useRef<Array<HTMLDivElement | null>>([]);
  const layerOpacity = Math.max(0.1, Math.min(1, intensity / 100));

  React.useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      for (let i = 0; i < BLOBS.length; i++) {
        const el = wrapsRef.current[i];
        if (!el) continue;
        const sy = y * BLOBS[i].speed;
        const sx = y * BLOBS[i].speed * 0.25; // leve deriva horizontal
        el.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0)`;
      }
    };
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="blobs-layer" aria-hidden="true" style={{ opacity: layerOpacity }}>
      {BLOBS.map((b, i) => (
        <div
          key={i}
          ref={(el) => (wrapsRef.current[i] = el)}
          className="blob-wrap"
          style={{ top: b.top, left: b.left, width: b.size, height: b.size }}
        >
          <div className="blob" style={{ background: b.gradient, ['--dur' as string]: `${b.dur}s` }} />
        </div>
      ))}
    </div>
  );
}
