import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { X } from 'lucide-react';

export const PaymentModal = ({ isOpen, onClose, order, onSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [amountReceived, setAmountReceived] = useState('');
  const [change, setChange] = useState(0);
  const [loading, setLoading] = useState(false);

  const isModifyingPayment = order?.payment_status === 'paid';
  const isPaymentLocked = isModifyingPayment && order?.payment_method === 'online';

  useEffect(() => {
    if (order) {
      // If modifying, pre-fill with existing data
      if (isModifyingPayment) {
        setPaymentMethod(order.payment_method || '');
        setAmountReceived(order.amount_received?.toString() || order.total.toString());
        setChange(order.change_given || 0);
      } else {
        // New payment
        setPaymentMethod('');
        setAmountReceived('');
        setChange(0);
      }
    }
  }, [order, isModifyingPayment, isOpen]);

  useEffect(() => {
    // Calculate change when amount received changes
    if (amountReceived && order && paymentMethod === 'cash') {
      const received = parseFloat(amountReceived);
      const total = parseFloat(order.total);
      if (received >= total) {
        setChange(received - total);
      } else {
        setChange(0);
      }
    } else {
      setChange(0);
    }
  }, [amountReceived, order, paymentMethod]);

  const handleAppoint = () => {
    setAmountReceived(order.total.toString());
    setChange(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // VALIDATION : Vérifier qu'un mode de paiement est sélectionné
    if (!paymentMethod || paymentMethod === '') {
      alert('⚠️ Veuillez sélectionner un mode de paiement');
      return;
    }

    setLoading(true);

    try {
      const API_URL = process.env.REACT_APP_BACKEND_URL || '';
      
      const response = await fetch(`${API_URL}/api/v1/admin/orders/${order.id}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_method: paymentMethod,
          payment_status: 'paid',
          amount_received: amountReceived ? parseFloat(amountReceived) : parseFloat(order.total),
          change_given: change
        })
      });

      if (!response.ok) throw new Error('Failed to record payment');

      alert('✅ Paiement enregistré');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error recording payment:', error);
      alert('❌ Erreur lors de l\'enregistrement du paiement');
    } finally {
      setLoading(false);
    }
  };

  if (!order) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="medium">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold">
          {isModifyingPayment ? '✏️ Modifier le paiement' : '💳 Enregistrer le paiement'}
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Avertissement paiement verrouillé */}
      {isPaymentLocked && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔒</span>
            <p className="text-xs text-red-700 font-medium">
              Paiement en ligne non modifiable
            </p>
          </div>
        </div>
      )}

      {/* Info modification paiement physique */}
      {isModifyingPayment && !isPaymentLocked && (
        <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <p className="text-xs text-yellow-700 font-medium">
              Modification d'un paiement existant
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Order Summary */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Commande:</span>
              <span className="ml-2 font-medium">#{order.id.slice(0, 8)}</span>
            </div>
            <div className="text-right">
              <span className="text-gray-600">Total:</span>
              <span className="ml-2 font-bold text-lg text-primary">{order.total.toFixed(2)}€</span>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium mb-1">Mode de paiement *</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => !isPaymentLocked && setPaymentMethod('espece')}
              disabled={isPaymentLocked}
              className={`p-3 rounded-lg border-2 transition-colors text-sm font-medium ${
                paymentMethod === 'espece'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-gray-300'
              } ${isPaymentLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              💵 Espèce
            </button>
            <button
              type="button"
              onClick={() => !isPaymentLocked && setPaymentMethod('cb')}
              disabled={isPaymentLocked}
              className={`p-3 rounded-lg border-2 transition-colors text-sm font-medium ${
                paymentMethod === 'cb'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              } ${isPaymentLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              💳 CB
            </button>
            <button
              type="button"
              onClick={() => !isPaymentLocked && setPaymentMethod('cheque')}
              disabled={isPaymentLocked}
              className={`p-3 rounded-lg border-2 transition-colors text-sm font-medium ${
                paymentMethod === 'cheque'
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-200 hover:border-gray-300'
              } ${isPaymentLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              📝 Chèque
            </button>
            <button
              type="button"
              onClick={() => !isPaymentLocked && setPaymentMethod('ticket_restaurant')}
              disabled={isPaymentLocked}
              className={`p-3 rounded-lg border-2 transition-colors text-sm font-medium ${
                paymentMethod === 'ticket_restaurant'
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-gray-200 hover:border-gray-300'
              } ${isPaymentLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              🎟️ Ticket restaurant
            </button>
            <button
              type="button"
              onClick={() => !isPaymentLocked && setPaymentMethod('online')}
              disabled={isPaymentLocked}
              className={`p-3 rounded-lg border-2 transition-colors text-sm font-medium ${
                paymentMethod === 'online'
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-gray-200 hover:border-gray-300'
              } ${isPaymentLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              🌐 En ligne
            </button>
          </div>
          {!paymentMethod && (
            <p className="text-xs text-red-500 mt-1">* Sélectionnez un mode de paiement</p>
          )}
        </div>

        {/* Amount Received (for cash only) */}
        {paymentMethod === 'cash' && (
          <div>
            <label className="block text-sm font-medium mb-1">Montant reçu</label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                value={amountReceived}
                onChange={(e) => setAmountReceived(e.target.value)}
                disabled={isPaymentLocked}
                className="flex-1 px-3 py-2 border rounded-lg text-sm"
                placeholder="0.00"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAppoint}
                disabled={isPaymentLocked}
              >
                Appoint
              </Button>
            </div>
          </div>
        )}

        {/* Change Display */}
        {paymentMethod === 'cash' && change > 0 && (
          <div className="p-2 bg-green-50 border border-green-200 rounded">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-700">À rendre:</span>
              <span className="text-lg font-bold text-green-700">{change.toFixed(2)}€</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={loading || isPaymentLocked || !paymentMethod}
            className="flex-1"
          >
            {loading ? 'Enregistrement...' : (isModifyingPayment ? 'Modifier' : 'Valider le paiement')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
