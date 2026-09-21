import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useToast } from '@/stores/toastStore';
import { cn } from '@/lib/utils';

const ICON = { success: CheckCircle2, error: XCircle, info: Info };
const TONE = {
  success: 'border-emerald-500/30',
  error: 'border-red-500/40',
  info: 'border-border',
};
const ICON_TONE = { success: 'text-emerald-500', error: 'text-red-500', info: 'text-brand-500' };

/** Contenedor global de notificaciones (fijo, esquina inferior derecha). */
export function Toaster() {
  const toasts = useToast((s) => s.toasts);
  const dismiss = useToast((s) => s.dismiss);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = ICON[t.type];
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ type: 'spring', damping: 24, stiffness: 320 }}
              className={cn('pointer-events-auto flex items-start gap-3 rounded-xl border bg-card p-3.5 shadow-lift', TONE[t.type])}
            >
              <Icon className={cn('mt-0.5 h-5 w-5 flex-shrink-0', ICON_TONE[t.type])} />
              <p className="flex-1 text-sm">{t.message}</p>
              <button onClick={() => dismiss(t.id)} aria-label="Cerrar" className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
