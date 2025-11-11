import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Toaster } from './components/ui/sonner';
import SplashScreen from './components/SplashScreen';
import MobileLayout from './components/MobileLayout';
import MobileHome from './pages/MobileHome';
import MobileMenu from './pages/MobileMenu';
import ProductDetail from './pages/ProductDetail';
import MobileLoyalty from './pages/MobileLoyalty';
import MobileFavorites from './pages/MobileFavorites';
import MobileProfile from './pages/MobileProfile';
import Checkout from './pages/Checkout';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    // Check si c'est la premi\u00e8re visite ou recharge
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
    if (hasSeenSplash) {
      setShowSplash(false);
      setAppReady(true);
    }
  }, []);

  const handleSplashComplete = () => {
    sessionStorage.setItem('hasSeenSplash', 'true');
    setAppReady(true);
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (!appReady) {
    return null;
  }

  return (
    <AppProvider>
      <BrowserRouter>
        <MobileLayout>
          <Routes>
            <Route path=\"/\" element={<MobileHome />} />
            <Route path=\"/menu\" element={<MobileMenu />} />
            <Route path=\"/product/:slug\" element={<ProductDetail />} />
            <Route path=\"/loyalty\" element={<MobileLoyalty />} />
            <Route path=\"/favorites\" element={<MobileFavorites />} />
            <Route path=\"/profile\" element={<MobileProfile />} />
            <Route path=\"/checkout\" element={<Checkout />} />
          </Routes>
        </MobileLayout>
        <Toaster />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
