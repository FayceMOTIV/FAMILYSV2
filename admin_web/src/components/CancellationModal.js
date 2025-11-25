import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { X, AlertTriangle } from 'lucide-react';

export const CancellationModal = ({ isOpen, onClose, order, onConfirm }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setReason('');
    }
  }, [isOpen]);

  const commonReasons = [
    '❌ Client a annulé',
    '⏰ Client non disponible',
    '🍔 Produit manquant',
    '💳 Problème de paiement',
    '🚫 Commande frauduleuse',
    '🔄 Commande dupliquée',
    '📝 Erreur de saisie'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      alert('⚠️ Veuillez saisir une raison d\'annulation');
      return;
    }

    setLoading(true);
    try {
      await onConfirm(reason);
      onClose();
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('❌ Erreur lors de l\'annulation');
    } finally {
      setLoading(false);
    }
  };

  if (!order) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="medium">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-red-600" />
          <h2 className="text-2xl font-bold text-red-600">⚠️ Annuler la commande</h2>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de la commande */}
        <div className="bg-red-50 border-2 border-red-200 p-4 rounded-lg">
          <div className="text-sm text-red-700 mb-1">Commande à annuler</div>
          <div className="text-2xl font-bold text-red-600">#{order.order_number || order.id?.slice(0, 8)}</div>
          <div className="text-sm text-gray-600 mt-2">
            Montant: <strong>{order.total.toFixed(2)}€</strong>
          </div>
        </div>

        {/* Raisons communes */}
        <div>
          <label className="block text-sm font-medium mb-3">Raisons communes</label>
          <div className="grid grid-cols-2 gap-2">
            {commonReasons.map((commonReason) => (
              <button
                key={commonReason}
                type="button"
                onClick={() => setReason(commonReason)}
                className={`p-3 border-2 rounded-lg text-sm font-medium transition-all text-left ${
                  reason === commonReason
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                {commonReason}
              </button>
            ))}
          </div>
        </div>

        {/* Raison personnalisée */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Raison de l'annulation *
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg resize-none"
            rows="4"
            placeholder="Décrivez la raison de l'annulation..."
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Cette raison sera enregistrée dans l'historique de la commande
          </p>
        </div>

        {/* Avertissement */}
        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-sm text-yellow-800">
          ⚠️ <strong>Attention :</strong> Cette action est irréversible. 
          {order.payment_status === 'paid' && (
            <span className="block mt-1">
              💳 Le paiement a été enregistré. Pensez à rembourser le client si nécessaire.
            </span>
          )}
        </div>

        {/* Buttons */}
        <div className="flex space-x-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Annuler
          </Button>
          <Button 
            type="submit" 
            disabled={loading || !reason.trim()} 
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            {loading ? 'Annulation...' : '❌ Confirmer l\'annulation'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
