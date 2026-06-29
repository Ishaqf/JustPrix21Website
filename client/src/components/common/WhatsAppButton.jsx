import { MessageCircle } from 'lucide-react';
import { SHOP_INFO } from '../../utils/shopInfo';

const DEFAULT_MESSAGE = 'Bonjour, je suis intéressé(e) par vos produits sur JustPrix21.';

// lucide-react has no WhatsApp brand glyph (it's a generic icon set, not
// brand logos) — MessageCircle stands in. Swap for the real WhatsApp mark
// (e.g. via react-icons) if the exact logo matters more than the behavior.
const WhatsAppButton = () => {
  const href = `https://wa.me/${SHOP_INFO.whatsappNumber}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Discuter sur WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center"
    >
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
      <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg">
        <MessageCircle size={28} />
      </span>
    </a>
  );
};

export default WhatsAppButton;
