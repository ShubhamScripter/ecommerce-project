import { createContext, useContext, useEffect, useState } from 'react';
import { productService } from '../services';

const SettingsContext = createContext(null);

const DEFAULT_SETTINGS = {
  websiteName: 'Stride',
  whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER || '919549710379',
  contact: {
    email: 'support@stride.com',
    phone: '+919549710379',
  },
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productService
      .getSettings()
      .then(({ data }) => {
        setSettings({
          ...DEFAULT_SETTINGS,
          ...data.data,
          whatsappNumber:
            data.data?.whatsappNumber ||
            data.data?.contact?.phone ||
            DEFAULT_SETTINGS.whatsappNumber,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
};
