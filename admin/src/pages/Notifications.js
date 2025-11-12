import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { NotificationModal } from '../components/NotificationModal';
import { notificationsAPI } from '../services/api';
import { Bell, Plus, Send, Clock, Check, Edit2, Trash2, Calendar } from 'lucide-react';

export const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await notificationsAPI.getAll();
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (id) => {
    try {
      await notificationsAPI.send(id);
      alert('Notification envoyée !');
      loadNotifications();
    } catch (error) {
      alert('Erreur lors de l\'envoi');
    }
  };

  if (loading) return <div><Header title="Notifications" /><div className="p-8">Chargement...</div></div>;

  return (
    <div>
      <Header title="Notifications" />
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">{notifications.length} notifications</h3>
          <Button><Plus className="w-4 h-4 mr-2" />Créer une notification</Button>
        </div>

        {notifications.length === 0 ? (
          <Card className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucune notification - Créez-en pour communiquer avec vos clients !</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notif) => (
              <Card key={notif.id}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-bold mb-1">{notif.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{notif.message}</p>
                    <span className={`text-xs px-2 py-1 rounded ${notif.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {notif.status}
                    </span>
                  </div>
                  {notif.status === 'draft' && (
                    <Button size="sm" onClick={() => handleSend(notif.id)}>
                      <Send className="w-4 h-4 mr-1" />Envoyer
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
