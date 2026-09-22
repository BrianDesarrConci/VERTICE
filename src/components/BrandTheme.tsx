import * as React from 'react';
import { useStoreConfig } from '@/hooks/useStoreConfig';
import { applyBrandTheme, DEFAULT_PRIMARY, DEFAULT_SECONDARY } from '@/lib/theme';

/**
 * Aplica los colores de marca (definidos por el admin) a las variables CSS
 * globales. Se monta una vez en la raíz de la app.
 */
export function BrandTheme() {
  const config = useStoreConfig();
  React.useEffect(() => {
    applyBrandTheme(config.primaryColor || DEFAULT_PRIMARY, config.secondaryColor || DEFAULT_SECONDARY);
  }, [config.primaryColor, config.secondaryColor]);
  return null;
}
