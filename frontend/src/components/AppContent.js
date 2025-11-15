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
// V3 Pages
import { HomeV3 } from '../pages/v3/HomeV3';
import { MenuV3 } from '../pages/v3/MenuV3';
import { WalletV3 } from '../pages/v3/WalletV3';

export const AppContent = () => {
  const { setRestaurantStatus, user } = useApp();
  const restaurantStatus = useRestaurantStatus();
  const { notifications, markAsRead } = useNotifications(user?.id);
  
  const [displayedNotifications, setDisplayedNotifications] = useState([]);
  const previousNotificationsRef = useRef([]);

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

  // Détecter les nouvelles notifications et afficher un toast
  useEffect(() => {
    if (notifications.length > 0 && previousNotificationsRef.current.length > 0) {
      const newNotifications = notifications.filter(
        (notification) =>
          !previousNotificationsRef.current.some((prev) => prev.id === notification.id) &&
          !notification.is_read
      );

      if (newNotifications.length > 0) {
        setDisplayedNotifications((prev) => [...prev, ...newNotifications]);
      }
    }
    previousNotificationsRef.current = notifications;
  }, [notifications]);

  const handleCloseToast = (notificationId) => {
    setDisplayedNotifications((prev) =>
      prev.filter((notification) => notification.id !== notificationId)
    );
  };

  return (
    <>
      <MobileLayout>
        <Routes>
          <Route path="/" element={<MobileHome />} />
          <Route path="/menu" element={<MobileMenu />} />
          <Route path="/loyalty" element={<MobileLoyalty />} />
          <Route path="/favorites" element={<MobileFavorites />} />
          <Route path="/profile" element={<MobileProfile />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/notifications" element={<Notifications />} />
        </Routes>
      </MobileLayout>

      {/* Toasts de notification */}
      {displayedNotifications.map((notification, index) => (
        <div key={notification.id} style={{ top: `${4 + index * 6}rem` }}>
          <NotificationToast
            notification={notification}
            onClose={() => handleCloseToast(notification.id)}
            onRead={markAsRead}
          />
        </div>
      ))}
    </>
  );
};
