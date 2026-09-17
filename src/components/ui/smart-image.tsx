import * as React from 'react';
import { cn } from '@/lib/utils';

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  ratio?: string; // ej: 'aspect-square', 'aspect-[4/3]'
  wrapperClassName?: string;
}

/**
 * Imagen con aspect-ratio fijo, lazy-load nativo y placeholder blur
 * mientras carga (evita CLS y da sensación premium).
 */
export function SmartImage({
  src,
  alt,
  className,
  ratio = 'aspect-square',
  wrapperClassName,
  ...props
}: SmartImageProps) {
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);

  return (
    <div className={cn('relative overflow-hidden bg-muted', ratio, wrapperClassName)}>
      {!loaded && !error && <div className="absolute inset-0 animate-pulse bg-muted" />}
      {error ? (
        <div className="absolute inset-0 grid place-items-center text-xs text-muted-foreground">
          Sin imagen
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={cn(
            'h-full w-full object-cover transition-all duration-700 ease-premium',
            loaded ? 'scale-100 blur-0 opacity-100' : 'scale-105 blur-lg opacity-0',
            className,
          )}
          {...props}
        />
      )}
    </div>
  );
}
