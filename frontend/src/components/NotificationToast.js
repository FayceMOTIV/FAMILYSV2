import React, { useEffect, useState } from 'react';
import { X, Gift } from 'lucide-react';

export const NotificationToast = ({ notification, onClose, onRead }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 8000); // Fermer après 8 secondes

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onRead && !notification.is_read) {
        onRead(notification.id);
      }
      onClose();
    }, 300);
  };

  return (
    <div
      className={`fixed top-4 left-4 right-4 z-50 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-2xl p-4 transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
      }`}
      onClick={handleClose}
    >
      <div className="flex items-start gap-3">
        <div className="bg-white/20 p-2 rounded-full">
          <Gift className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">{notification.title}</h3>
          <p className="text-sm text-white/90">{notification.message}</p>
        </div>
        <button onClick={handleClose} className="text-white/80 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
