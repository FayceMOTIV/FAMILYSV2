import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { X, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://diner-admin.preview.emergentagent.com';

export const RefundModal = ({ isOpen, onClose, order, onSuccess }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [reason, setReason] = useState('Produit manquant');
  const [customReason, setCustomReason] = useState('');
  const [loading, setLoading] = useState(false);

  if (!order) return null;

  const handleToggleItem = (index) => {
    if (selectedItems.includes(index)) {
      setSelectedItems(selectedItems.filter(i => i !== index));
    } else {
      setSelectedItems([...selectedItems, index]);
    }
  };

  const calculateRefundTotal = () => {
    return selectedItems.reduce((total, index) => {
      const item = order.items[index];
      return total + (item.total_price || 0);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedItems.length === 0) {
      alert('Veuillez sélectionner au moins un article à rembourser');
      return;
    }

    if (!window.confirm(`Rembourser ${calculateRefundTotal().toFixed(2)}€ sur la carte de fidélité ?`)) {
      return;
    }

    setLoading(true);

    try {
      const finalReason = reason === 'Autre' && customReason ? customReason : reason;
      
      const response = await axios.post(
        `${API_URL}/api/v1/admin/orders/${order.id}/refund-missing-items`,
        {
          missing_item_indices: selectedItems,
          reason: finalReason
        }
      );

      alert(`✅ ${response.data.message}`);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error processing refund:', error);
      alert(error.response?.data?.detail || 'Erreur lors du remboursement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">💳 Remboursement partiel</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-bold mb-1">Remboursement sur carte de fidélité</p>
            <p>Les articles manquants seront remboursés en crédit de fidélité au client.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Order info */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <span className="font-bold">Commande #{order.order_number || order.id?.slice(0, 8)}</span>
          </p>
          <p className="text-sm text-gray-600">
            Client: {order.customer_name || order.customer_email}
          </p>
        </div>

        {/* Items selection */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Articles à rembourser
          </label>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {order.items?.map((item, index) => (
              <div
                key={index}
                className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedItems.includes(index)
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleToggleItem(index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(index)}
                        onChange={() => handleToggleItem(index)}
                        className="w-4 h-4"
                      />
                      <span className="font-medium">{item.quantity}x {item.name}</span>
                    </div>
                    {item.notes && (
                      <p className="text-xs text-gray-500 ml-6 mt-1">{item.notes}</p>
                    )}
                  </div>
                  <span className="font-bold text-primary">
                    {(item.total_price || 0).toFixed(2)}€
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium mb-2">Raison</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="Produit manquant">Produit manquant</option>
            <option value="Produit incorrect">Produit incorrect</option>
            <option value="Qualité insatisfaisante">Qualité insatisfaisante</option>
            <option value="Erreur de commande">Erreur de commande</option>
            <option value="Autre">Autre</option>
          </select>
        </div>

        {/* Total refund */}
        {selectedItems.length > 0 && (
          <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-bold text-green-800">Montant à rembourser:</span>
              <span className="text-2xl font-black text-green-600">
                {calculateRefundTotal().toFixed(2)}€
              </span>
            </div>
            <p className="text-xs text-green-700 mt-2">
              Ce montant sera crédité sur la carte de fidélité du client
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Annuler
          </Button>
          <Button 
            type="submit" 
            disabled={loading || selectedItems.length === 0} 
            className="flex-1"
          >
            {loading ? 'Traitement...' : 'Rembourser'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
