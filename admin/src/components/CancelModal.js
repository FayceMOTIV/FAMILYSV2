import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { X, AlertTriangle } from 'lucide-react';

export const CancelModal = ({ isOpen, onClose, order, onConfirm }) => {
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [loading, setLoading] = useState(false);

  const predefinedReasons = [
    'Client a annulé',
    'Produit non disponible',
    'Erreur de commande',
    'Délai trop long',
    'Problème de paiement',
    'Autre raison'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const finalReason = reason === 'Autre raison' ? customReason : reason;
    
    if (!finalReason.trim()) {
      alert('⚠️ Veuillez indiquer une raison d\'annulation');
      return;
    }

    setLoading(true);
    try {
      await onConfirm(finalReason);
      onClose();
    } catch (error) {
      console.error('Error cancelling order:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="medium">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-red-500" />
          <h2 className="text-2xl font-bold">Annuler la commande</h2>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Info commande */}
        {order && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Commande</div>
            <div className="font-bold text-lg">{order.order_number}</div>
            <div className="text-sm text-gray-600 mt-1">
              Client: {order.customer_name} - Total: {order.total}€
            </div>
          </div>
        )}

        {/* Raison prédéfinie */}
        <div>
          <label className="block text-sm font-medium mb-3">Raison de l'annulation *</label>
          <div className="space-y-2">
            {predefinedReasons.map((r) => (
              <label
                key={r}
                className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  reason === r
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="reason"
                  value={r}
                  checked={reason === r}
                  onChange={(e) => setReason(e.target.value)}
                  className="mr-3"
                />
                <span className="text-sm font-medium">{r}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Raison personnalisée */}
        {reason === 'Autre raison' && (
          <div>
            <label className="block text-sm font-medium mb-2">Précisez la raison</label>
            <textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              rows="3"
              placeholder="Décrivez la raison de l'annulation..."
              required
            />
          </div>
        )}

        {/* Warning */}
        <div className="bg-red-50 border-2 border-red-200 p-4 rounded-lg">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-700">
              <strong>Attention:</strong> Cette action est irréversible. 
              La commande sera marquée comme annulée et le client pourra être notifié.
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex space-x-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Retour
          </Button>
          <Button 
            type="submit" 
            disabled={loading || !reason}
            className="flex-1 bg-red-500 hover:bg-red-600"
          >
            {loading ? 'Annulation...' : '❌ Confirmer l\'annulation'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
