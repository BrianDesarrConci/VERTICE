import * as React from 'react';
import type { SeasonalEffect as Effect } from '@/lib/types';

const EMOJIS: Record<Exclude<Effect, 'none'>, string[]> = {
  hearts: ['💖', '💗', '❤️', '💕', '💝'],
  snow: ['❄️', '❅', '⛄', '🌨️'],
  leaves: ['🍂', '🍁', '🍃'],
  confetti: ['🎉', '🎊', '✨', '🎈'],
  spooky: ['🎃', '👻', '🦇', '🕸️'],
  stars: ['⭐', '✨', '🌟', '💫'],
};

/** Partículas temáticas que caen (Amor, Halloween, Navidad, etc.). */
export function SeasonalEffect({ effect }: { effect: Effect }) {
  const particles = React.useMemo(() => {
    if (effect === 'none') return [];
    const set = EMOJIS[effect];
    return Array.from({ length: 28 }).map((_, i) => ({
      key: i,
      emoji: set[Math.floor(Math.random() * set.length)],
      left: Math.random() * 100,
      size: 14 + Math.random() * 24,
      duration: 6 + Math.random() * 9,
      delay: -Math.random() * 12,
    }));
  }, [effect]);

  if (effect === 'none') return null;

  return (
    <div className="season-layer" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.key}
          className="season-particle"
          style={{
            left: `${p.left}%`,
            fontSize: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}
