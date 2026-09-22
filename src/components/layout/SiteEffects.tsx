import * as React from 'react';
import { useSiteContent } from '@/hooks/useSiteContent';
import { SeasonalEffect } from './SeasonalEffect';
import { WhatsAppFloat } from './WhatsAppFloat';

const RADIUS_MAP = { sharp: '0.4rem', soft: '1rem', round: '1.5rem' } as const;

/**
 * Aplica la estética global editable (radios, estilo de botón) y monta los
 * efectos ambientales (temporada + WhatsApp flotante) según el contenido.
 */
export function SiteEffects() {
  const content = useSiteContent();

  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--radius', RADIUS_MAP[content.radius] ?? RADIUS_MAP.soft);
    root.style.setProperty('--btn-radius', content.buttonStyle === 'rounded' ? '0.85rem' : '9999px');
  }, [content.radius, content.buttonStyle]);

  return (
    <>
      <SeasonalEffect effect={content.seasonalEffect} />
      {content.showWhatsappFloat && <WhatsAppFloat number={content.whatsappNumber} />}
    </>
  );
}
