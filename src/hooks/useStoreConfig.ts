import * as React from 'react';
import type { StoreConfig } from '@/lib/types';
import { api } from '@/lib/api';
import { MOCK_CONFIG } from '@/lib/mockData';

// Cache a nivel de módulo + suscriptores para actualización reactiva.
let cache: StoreConfig | null = null;
let inflight: Promise<StoreConfig> | null = null;
const subscribers = new Set<(c: StoreConfig) => void>();

/** Actualiza el caché de config y notifica a todos los consumidores (tras guardar en admin). */
export function setStoreConfigCache(config: StoreConfig) {
  cache = config;
  inflight = Promise.resolve(config);
  subscribers.forEach((fn) => fn(config));
}

/** Devuelve la configuración de tienda. Reactiva a cambios del admin. */
export function useStoreConfig(): StoreConfig {
  const [config, setConfig] = React.useState<StoreConfig>(cache ?? MOCK_CONFIG);

  React.useEffect(() => {
    subscribers.add(setConfig);
    if (cache) {
      setConfig(cache);
    } else {
      inflight ??= api.getConfig();
      inflight
        .then((c) => {
          cache = c;
          setConfig(c);
        })
        .catch(() => {
          /* mantiene default */
        });
    }
    return () => {
      subscribers.delete(setConfig);
    };
  }, []);

  return config;
}
