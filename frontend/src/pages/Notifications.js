import React from 'react';
import { useApp } from '../context/AppContext';
import { useNotifications } from '../hooks/useNotifications';
import { Bell, Gift, CheckCircle } from 'lucide-react';

export const Notifications = () => {
  const { user } = useApp();
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications(user?.id);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getIcon = (type) => {
    switch (type) {
      case 'loyalty_credited':
        return <Gift className="w-6 h-6 text-green-600" />;
      case 'order_confirmed':
        return <CheckCircle className="w-6 h-6 text-blue-600" />;
      default:
        return <Bell className="w-6 h-6 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-orange-500 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-white/80">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Tout marquer comme lu
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="p-4 space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-20">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">Aucune notification</h3>
            <p className="text-gray-500">Vos notifications apparaîtront ici</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => !notification.is_read && markAsRead(notification.id)}
              className={`bg-white rounded-xl p-4 shadow-sm ${
                notification.is_read ? 'opacity-60' : 'border-2 border-primary/20'
              } transition-all hover:shadow-md cursor-pointer`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${
                  notification.type === 'loyalty_credited' ? 'bg-green-100' : 'bg-blue-100'
                }`}>
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-gray-900">{notification.title}</h3>
                    {!notification.is_read && (
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(notification.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
