import React, { useEffect, useState, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useRestaurantStatus } from '../hooks/useRestaurantStatus';
import { useNotifications } from '../hooks/useNotifications';
import MobileLayout from './MobileLayout';
import MobileHome from '../pages/MobileHome';
import MobileMenu from '../pages/MobileMenu';
import ProductDetail from '../pages/ProductDetail';
import MobileLoyalty from '../pages/MobileLoyalty';
import MobileFavorites from '../pages/MobileFavorites';
import MobileProfile from '../pages/MobileProfile';
import Checkout from '../pages/Checkout';
import { Notifications } from '../pages/Notifications';
import { NotificationToast } from './NotificationToast';

export const AppContent = () => {
  const { setRestaurantStatus } = useApp();
  const restaurantStatus = useRestaurantStatus();

  // Mettre à jour le contexte avec le statut du restaurant
  useEffect(() => {
    if (!restaurantStatus.loading) {
      setRestaurantStatus({
        canOrder: restaurantStatus.canOrder,
        isPaused: restaurantStatus.isPaused,
        noMoreOrdersToday: restaurantStatus.noMoreOrdersToday
      });
    }
  }, [restaurantStatus, setRestaurantStatus]);

  return (
    <MobileLayout>
      <Routes>
        <Route path="/" element={<MobileHome />} />
        <Route path="/menu" element={<MobileMenu />} />
        <Route path="/loyalty" element={<MobileLoyalty />} />
        <Route path="/favorites" element={<MobileFavorites />} />
        <Route path="/profile" element={<MobileProfile />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
      </Routes>
    </MobileLayout>
  );
};
