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
import { useRestaurantStatus } from './hooks/useRestaurantStatus';
import { RestaurantClosedModal } from './components/RestaurantClosedModal';
import { AppContent } from './components/AppContent';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [appReady, setAppReady] = useState(false);
  const [showClosedModal, setShowClosedModal] = useState(false);
  const restaurantStatus = useRestaurantStatus();

  useEffect(() => {
    // Check si c'est la premi\u00e8re visite ou recharge
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
    if (hasSeenSplash) {
      setShowSplash(false);
      setAppReady(true);
    }
  }, []);

  // Afficher la modal si restaurant fermé
  useEffect(() => {
    if (!restaurantStatus.loading && restaurantStatus.noMoreOrdersToday) {
      const hasSeenClosedModal = sessionStorage.getItem('hasSeenClosedModal');
      if (!hasSeenClosedModal) {
        setShowClosedModal(true);
      }
    }
  }, [restaurantStatus]);

  const handleSplashComplete = () => {
    sessionStorage.setItem('hasSeenSplash', 'true');
    setShowSplash(false);
    setAppReady(true);
  };

  if (showSplash && !appReady) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (!appReady) {
    return null;
  }

  return (
    <AppProvider>
      <BrowserRouter>
        <AppContent />
        <Toaster />
        
        {/* Modal restaurant fermé */}
        <RestaurantClosedModal
          isOpen={showClosedModal}
          onClose={() => {
            setShowClosedModal(false);
            sessionStorage.setItem('hasSeenClosedModal', 'true');
          }}
          reason={restaurantStatus.noMoreOrdersToday ? "Désolé, nous ne prenons plus de commandes pour aujourd'hui." : null}
        />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
