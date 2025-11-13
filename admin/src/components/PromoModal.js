import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { X } from 'lucide-react';

export const PromoModal = ({ isOpen, onClose, promo, onSuccess }) => {
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 0,
    min_order_amount: 0,
    max_uses: '',
    valid_from: '',
    valid_until: '',
    is_active: true
  });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (promo) {
      setFormData({
        code: promo.code || '',
        description: promo.description || '',
        discount_type: promo.discount_type || 'percentage',
        discount_value: promo.discount_value || 0,
        min_order_amount: promo.min_order_amount || 0,
        max_uses: promo.max_uses || '',
        valid_from: promo.valid_from ? promo.valid_from.split('T')[0] : '',
        valid_until: promo.valid_until ? promo.valid_until.split('T')[0] : '',
        is_active: promo.is_active !== false
      });
    } else {
      setFormData({
        code: '',
        description: '',
        discount_type: 'percentage',
        discount_value: 0,
        min_order_amount: 0,
        max_uses: '',
        valid_from: '',
        valid_until: '',
        is_active: true
      });
    }
  }, [promo, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const API_URL = process.env.REACT_APP_BACKEND_URL || '';
      
      // Prepare data
      const data = {
        ...formData,
        discount_value: parseFloat(formData.discount_value),
        min_order_amount: parseFloat(formData.min_order_amount),
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
        valid_from: formData.valid_from ? new Date(formData.valid_from).toISOString() : new Date().toISOString(),
        valid_until: formData.valid_until ? new Date(formData.valid_until).toISOString() : new Date(Date.now() + 30*24*60*60*1000).toISOString()
      };
      
      const url = promo 
        ? `${API_URL}/api/v1/admin/promos/${promo.id}`
        : `${API_URL}/api/v1/admin/promos`;
      
      const method = promo ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to save promo');
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error saving promo:', error);
      alert(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="large">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          {promo ? 'Modifier la promotion' : 'Créer une promotion'}
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Code */}
          <div>
            <label className="block text-sm font-medium mb-2">Code promo *</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
              className="w-full px-4 py-2 border rounded-lg font-mono"
              placeholder="WELCOME10"
              required
            />
          </div>

          {/* Discount Type */}
          <div>
            <label className="block text-sm font-medium mb-2">Type de réduction *</label>
            <select
              value={formData.discount_type}
              onChange={(e) => setFormData({...formData, discount_type: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
              required
            >
              <option value="percentage">💯 Pourcentage (%)</option>
              <option value="fixed">💶 Montant fixe (€)</option>
              <option value="bogo">🎁 BOGO (Achetez 1, obtenez 1 gratuit)</option>
              <option value="free_delivery">🚚 Livraison gratuite</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2">Description *</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg"
            rows="2"
            placeholder="10% de réduction pour les nouveaux clients"
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Discount Value */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Valeur * {formData.discount_type === 'percentage' ? '(%)' : '(€)'}
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.discount_value}
              onChange={(e) => setFormData({...formData, discount_value: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          {/* Min Order Amount */}
          <div>
            <label className="block text-sm font-medium mb-2">Commande min. (€)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.min_order_amount}
              onChange={(e) => setFormData({...formData, min_order_amount: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          {/* Max Uses */}
          <div>
            <label className="block text-sm font-medium mb-2">Utilisation max.</label>
            <input
              type="number"
              min="1"
              value={formData.max_uses}
              onChange={(e) => setFormData({...formData, max_uses: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Illimité"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Valid From */}
          <div>
            <label className="block text-sm font-medium mb-2">Valide du</label>
            <input
              type="date"
              value={formData.valid_from}
              onChange={(e) => setFormData({...formData, valid_from: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          {/* Valid Until */}
          <div>
            <label className="block text-sm font-medium mb-2">Valide jusqu'au</label>
            <input
              type="date"
              value={formData.valid_until}
              onChange={(e) => setFormData({...formData, valid_until: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
        </div>

        {/* Is Active */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
            className="mr-2"
          />
          <label htmlFor="is_active" className="text-sm font-medium">
            Promotion active
          </label>
        </div>

        {/* Buttons */}
        <div className="flex space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Annuler
          </Button>
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Enregistrement...' : promo ? 'Modifier' : 'Créer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
