import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Toaster } from './components/ui/sonner';
import MobileLayout from './components/MobileLayout';
import MobileHome from './pages/MobileHome';
import MobileMenu from './pages/MobileMenu';
import ProductDetail from './pages/ProductDetail';
import MobileLoyalty from './pages/MobileLoyalty';
import MobileFavorites from './pages/MobileFavorites';
import MobileProfile from './pages/MobileProfile';
import Checkout from './pages/Checkout';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <MobileLayout>
          <Routes>
            <Route path="/" element={<MobileHome />} />
            <Route path="/menu" element={<MobileMenu />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/loyalty" element={<MobileLoyalty />} />
            <Route path="/favorites" element={<MobileFavorites />} />
            <Route path="/profile" element={<MobileProfile />} />
            <Route path="/checkout" element={<Checkout />} />
          </Routes>
        </MobileLayout>
        <Toaster />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
