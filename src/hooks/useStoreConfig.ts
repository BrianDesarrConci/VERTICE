import * as React from 'react';
import type { StoreConfig } from '@/lib/types';
import { api } from '@/lib/api';
import { MOCK_CONFIG } from '@/lib/mockData';

// Cache a nivel de módulo para no re-pedir la config en cada componente.
let cache: StoreConfig | null = null;
let inflight: Promise<StoreConfig> | null = null;

/** Devuelve la configuración de tienda (impuestos, envíos). Sincrónico con default sensato. */
export function useStoreConfig(): StoreConfig {
  const [config, setConfig] = React.useState<StoreConfig>(cache ?? MOCK_CONFIG);

  React.useEffect(() => {
    if (cache) return;
    inflight ??= api.getConfig();
    let active = true;
    inflight
      .then((c) => {
        cache = c;
        if (active) setConfig(c);
      })
      .catch(() => {
        /* mantiene default */
      });
    return () => {
      active = false;
    };
  }, []);

  return config;
}
