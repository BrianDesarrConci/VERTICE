import { MessageCircle } from 'lucide-react';

/** Botón flotante de WhatsApp (esquina inferior izquierda). */
export function WhatsAppFloat({ number }: { number: string }) {
  const clean = number.replace(/\D/g, '');
  if (!clean) return null;
  return (
    <a
      href={`https://wa.me/${clean}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className="fixed bottom-5 left-5 z-[80] grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lift transition-transform hover:scale-110 active:scale-95"
    >
      <MessageCircle className="h-7 w-7" />
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-40" />
    </a>
  );
}
