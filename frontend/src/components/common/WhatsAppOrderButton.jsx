import { MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSettings } from '../../contexts/SettingsContext';
import { buildWhatsAppProductUrl, openWhatsApp } from '../../utils/whatsapp';
import Button from '../common/Button';

export default function WhatsAppOrderButton({
  product,
  selectedSize,
  selectedColor,
  quantity = 1,
  className,
  buttonSize = 'lg',
  requireSelection = true,
}) {
  const { settings } = useSettings();

  const handleClick = () => {
    if (requireSelection && (!selectedSize || !selectedColor)) {
      toast.error('Please select size and color first');
      return;
    }

    const productUrl = `${window.location.origin}/product/${product.slug}`;
    const url = buildWhatsAppProductUrl({
      phone: settings.whatsappNumber,
      product,
      size: selectedSize,
      color: selectedColor,
      quantity,
      productUrl,
    });

    if (!url) {
      toast.error('WhatsApp number not configured');
      return;
    }

    openWhatsApp(url);
    toast.success('Opening WhatsApp...');
  };

  return (
    <Button
      type="button"
      size={buttonSize}
      className={`!bg-[#25D366] hover:!bg-[#1ebe57] text-white ${className || ''}`}
      onClick={handleClick}
    >
      <MessageCircle size={18} />
      Enquire on WhatsApp
    </Button>
  );
}
