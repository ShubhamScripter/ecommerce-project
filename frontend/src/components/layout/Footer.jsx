import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { buildWhatsAppSupportUrl } from '../../utils/whatsapp';

export default function Footer({ settings }) {
  const year = new Date().getFullYear();
  const waUrl = buildWhatsAppSupportUrl(
    settings?.whatsappNumber || settings?.contact?.phone,
    'Hi! I want to know more about your shoes.'
  );

  return (
    <footer className="mt-auto border-t border-line bg-ink text-white dark:border-white/10">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 sm:gap-10 sm:py-14 lg:grid-cols-3 lg:px-6">
        <div>
          <Link to="/" className="font-display text-4xl tracking-wide">
            STRIDE
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
            Browse shoes and enquire instantly on WhatsApp. No login needed.
          </p>
          {waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1ebe57]"
            >
              <MessageCircle size={16} />
              Chat on WhatsApp
            </a>
          )}
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider">Browse</h4>
          <ul className="space-y-2.5 text-sm text-white/60">
            <li>
              <Link to="/shop" className="hover:text-white">
                All Shoes
              </Link>
            </li>
            <li>
              <Link to="/shop?gender=men" className="hover:text-white">
                Men
              </Link>
            </li>
            <li>
              <Link to="/shop?gender=women" className="hover:text-white">
                Women
              </Link>
            </li>
            <li>
              <Link to="/shop?gender=kids" className="hover:text-white">
                Kids
              </Link>
            </li>
            <li>
              <Link to="/shop?newArrival=true" className="hover:text-white">
                New Arrivals
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider">Contact</h4>
          <ul className="space-y-2.5 text-sm text-white/60">
            <li>{settings?.contact?.email || 'support@stride.com'}</li>
            <li>{settings?.contact?.phone || '+919549710379'}</li>
            <li className="max-w-xs">{settings?.contact?.address || 'Mumbai, India'}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-5 text-center text-xs text-white/40">
        © {year} {settings?.websiteName || 'Stride'}. All rights reserved.
      </div>
    </footer>
  );
}
