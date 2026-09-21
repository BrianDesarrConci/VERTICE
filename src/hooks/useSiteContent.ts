import * as React from 'react';
import type { SiteContent } from '@/lib/types';
import { api } from '@/lib/api';
import { MOCK_CONTENT } from '@/lib/mockData';

// Cache a nivel de módulo para no re-pedir el contenido en cada componente.
let cache: SiteContent | null = null;
let inflight: Promise<SiteContent> | null = null;

/** Actualiza el caché de contenido (tras guardar desde el admin). */
export function setSiteContentCache(content: SiteContent) {
  cache = content;
  inflight = Promise.resolve(content);
}

/** Devuelve el contenido editable del sitio (hero, banners, about, anuncio). */
export function useSiteContent(): SiteContent {
  const [content, setContent] = React.useState<SiteContent>(cache ?? MOCK_CONTENT);

  React.useEffect(() => {
    if (cache) return;
    inflight ??= api.getContent();
    let active = true;
    inflight
      .then((c) => {
        cache = c;
        if (active) setContent(c);
      })
      .catch(() => {
        /* mantiene default */
      });
    return () => {
      active = false;
    };
  }, []);

  return content;
}
