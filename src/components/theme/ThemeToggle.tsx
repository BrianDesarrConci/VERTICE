import { Moon, Sun } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';

/** Toggle claro/oscuro con transición suave; persiste en localStorage. */
export function ThemeToggle({ className }: { className?: string }) {
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
      className={cn(
        'relative grid h-10 w-10 place-items-center rounded-full',
        'text-foreground transition-colors hover:bg-muted',
        className,
      )}
    >
      <Sun
        className={cn(
          'h-5 w-5 transition-all duration-500',
          theme === 'dark' ? 'scale-0 -rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100',
        )}
      />
      <Moon
        className={cn(
          'absolute h-5 w-5 transition-all duration-500',
          theme === 'dark' ? 'scale-100 rotate-0 opacity-100' : 'scale-0 rotate-90 opacity-0',
        )}
      />
    </button>
  );
}
