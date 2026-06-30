import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ErrorPage from '../common/ErrorPage';
import useAppStore from '../../store/appStore';

const MainLayout = () => {
  const isMaintenance = useAppStore((s) => s.isMaintenance);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // Full-screen overlays take priority over the normal page layout —
  // maintenance beats offline because if the server is down the user
  // can't do anything useful even once reconnected.
  if (isMaintenance) return <ErrorPage type="maintenance" />;
  if (isOffline) return <ErrorPage type="offline" />;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
