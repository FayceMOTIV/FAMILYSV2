import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { X } from 'lucide-react';

export const NotificationModal = ({ isOpen, onClose, notification, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    icon: '🔔',
    target_type: 'all',
    target_segment: null,
    scheduled_for: ''
  });
  
  const [loading, setLoading] = useState(false);
  const preSelectedSegment = notification?.target_segment || null;

  useEffect(() => {
    if (notification) {
      setFormData({
        title: notification.title || '',
        message: notification.message || '',
        icon: notification.icon || '🔔',
        target_type: notification.target_type || (notification.target_segment ? 'segment' : 'all'),
        target_segment: notification.target_segment || null,
        scheduled_for: notification.scheduled_for || ''
      });
    } else {
      setFormData({
        title: '',
        message: '',
        icon: '🔔',
        target_type: 'all',
        target_segment: null,
        scheduled_for: ''
      });
    }
  }, [notification, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const API_URL = process.env.REACT_APP_BACKEND_URL || '';
      const url = notification 
        ? `${API_URL}/api/v1/admin/notifications/${notification.id}`
        : `${API_URL}/api/v1/admin/notifications`;
      
      const method = notification ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to save notification');

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error saving notification:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const iconOptions = ['🔔', '🎉', '🍔', '🎁', '⚠️', '📢', '✨', '🔥', '💰', '🚀'];

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          {notification ? 'Modifier la notification' : 'Créer une notification'}
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Icon Selector */}
        <div>
          <label className="block text-sm font-medium mb-2">Icône</label>
          <div className="flex gap-2 flex-wrap">
            {iconOptions.map(icon => (
              <button
                key={icon}
                type="button"
                onClick={() => setFormData({...formData, icon})}
                className={`text-2xl p-2 rounded border-2 ${
                  formData.icon === icon 
                    ? 'border-primary bg-primary/10' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-2">Titre *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Nouvelle offre disponible!"
            required
          />
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium mb-2">Message *</label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({...formData, message: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg"
            rows="4"
            placeholder="Profitez de 20% de réduction sur tous nos burgers..."
            required
          />
        </div>

        {/* Target Type */}
        <div>
          <label className="block text-sm font-medium mb-2">Destinataires</label>
          <select
            value={formData.target_type}
            onChange={(e) => setFormData({...formData, target_type: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="all">Tous les clients</option>
            <option value="segment">Segment spécifique</option>
            <option value="individual">Client individuel</option>
          </select>
        </div>

        {/* Scheduled For */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Programmer pour plus tard (optionnel)
          </label>
          <input
            type="datetime-local"
            value={formData.scheduled_for}
            onChange={(e) => setFormData({...formData, scheduled_for: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg"
          />
          <p className="text-xs text-gray-500 mt-1">
            Laissez vide pour envoyer immédiatement
          </p>
        </div>

        {/* Buttons */}
        <div className="flex space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Annuler
          </Button>
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Enregistrement...' : notification ? 'Modifier' : 'Créer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
