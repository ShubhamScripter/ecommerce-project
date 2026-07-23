import { MessageCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useSettings } from '../../contexts/SettingsContext';
import { buildWhatsAppSupportUrl, openWhatsApp } from '../../utils/whatsapp';

export default function WhatsAppFloat() {
  const { settings } = useSettings();
  const { pathname } = useLocation();
  const onProductPage = pathname.startsWith('/product/');

  const handleClick = () => {
    const url = buildWhatsAppSupportUrl(
      settings.whatsappNumber,
      'Hi Stride! I have a question about your shoes.'
    );
    if (!url) {
      toast.error('WhatsApp number not configured');
      return;
    }
    openWhatsApp(url);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Chat on WhatsApp"
      className={`fixed z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-110 hover:bg-[#1ebe57] sm:h-14 sm:w-14 ${
        onProductPage
          ? 'bottom-24 right-4 md:bottom-8 md:right-8'
          : 'bottom-5 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8'
      }`}
      style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
    >
      <MessageCircle size={22} className="sm:h-[26px] sm:w-[26px]" />
      <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
      </span>
    </button>
  );
}
