import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Toaster } from './components/ui/sonner';
import Layout from './components/Layout';
import Home from './pages/Home';
import Menu from './pages/Menu';
import ProductDetail from './pages/ProductDetail';
import Loyalty from './pages/Loyalty';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/loyalty" element={<Loyalty />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/checkout" element={<Checkout />} />
          </Routes>
        </Layout>
        <Toaster />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
