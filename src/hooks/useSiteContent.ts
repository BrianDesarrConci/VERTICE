import * as React from 'react';
import type { SiteContent } from '@/lib/types';
import { api } from '@/lib/api';
import { MOCK_CONTENT } from '@/lib/mockData';

// Cache a nivel de módulo + suscriptores para actualización reactiva.
let cache: SiteContent | null = null;
let inflight: Promise<SiteContent> | null = null;
const subscribers = new Set<(c: SiteContent) => void>();

/** Actualiza el caché de contenido y notifica a los consumidores (tras guardar). */
export function setSiteContentCache(content: SiteContent) {
  cache = content;
  inflight = Promise.resolve(content);
  subscribers.forEach((fn) => fn(content));
}

/** Devuelve el contenido editable del sitio. Reactivo a cambios del admin. */
export function useSiteContent(): SiteContent {
  const [content, setContent] = React.useState<SiteContent>(cache ?? MOCK_CONTENT);

  React.useEffect(() => {
    subscribers.add(setContent);
    if (cache) {
      setContent(cache);
    } else {
      inflight ??= api.getContent();
      inflight
        .then((c) => {
          cache = c;
          setContent(c);
        })
        .catch(() => {
          /* mantiene default */
        });
    }
    return () => {
      subscribers.delete(setContent);
    };
  }, []);

  return content;
}
