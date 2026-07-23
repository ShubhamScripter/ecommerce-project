import { Outlet } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import WhatsAppFloat from '../components/common/WhatsAppFloat';
import { useSettings } from '../contexts/SettingsContext';

export default function MainLayout() {
  const { settings } = useSettings();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer settings={settings} />
      <WhatsAppFloat />
    </div>
  );
}
