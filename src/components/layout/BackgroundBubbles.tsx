import * as React from 'react';

interface BubbleSpec {
  left: number; // %
  size: number; // px
  duration: number; // s
  delay: number; // s
}

/**
 * Capa ambiental de burbujas verdes que ascienden lentamente.
 * Puramente decorativa (aria-hidden, sin captura de clics).
 * Respeta prefers-reduced-motion (se oculta vía CSS).
 */
export function BackgroundBubbles({ count = 14 }: { count?: number }) {
  const bubbles = React.useMemo<BubbleSpec[]>(
    () =>
      Array.from({ length: count }).map(() => ({
        left: Math.random() * 100,
        size: 40 + Math.random() * 160,
        duration: 16 + Math.random() * 22,
        delay: -Math.random() * 30,
      })),
    [count],
  );

  return (
    <div className="bubbles-layer" aria-hidden="true">
      {bubbles.map((b, i) => (
        <span
          key={i}
          className="bubble"
          style={{
            left: `${b.left}%`,
            width: `${b.size}px`,
            height: `${b.size}px`,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
