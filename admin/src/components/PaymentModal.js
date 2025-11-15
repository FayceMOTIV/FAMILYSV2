import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { X, Plus, Trash2 } from 'lucide-react';

export const PaymentModal = ({ isOpen, onClose, order, onSuccess }) => {
  const [payments, setPayments] = useState([]);
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const isModifyingPayment = order?.payment_status === 'paid';
  const isPaymentLocked = isModifyingPayment && order?.payment_method === 'online';

  useEffect(() => {
    if (order && isOpen) {
      if (isModifyingPayment && !isPaymentLocked) {
        // Modifier un paiement existant
        setPayments([{
          method: order.payment_method || '',
          amount: parseFloat(order.total)
        }]);
      } else {
        // Nouveau paiement
        setPayments([]);
      }
      setCurrentPaymentMethod('');
      setCurrentAmount('');
    }
  }, [order, isModifyingPayment, isPaymentLocked, isOpen]);

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = order ? parseFloat(order.total) - totalPaid : 0;

  const handleAddPayment = () => {
    if (!currentPaymentMethod) {
      alert('⚠️ Sélectionnez un mode de paiement');
      return;
    }

    const amount = parseFloat(currentAmount) || remaining;
    
    if (amount <= 0) {
      alert('⚠️ Le montant doit être supérieur à 0');
      return;
    }

    if (amount > remaining) {
      alert('⚠️ Le montant ne peut pas dépasser le restant à payer');
      return;
    }

    setPayments([...payments, {
      method: currentPaymentMethod,
      amount: amount
    }]);

    setCurrentPaymentMethod('');
    setCurrentAmount('');
  };

  const handleRemovePayment = (index) => {
    setPayments(payments.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (payments.length === 0) {
      alert('⚠️ Ajoutez au moins un paiement');
      return;
    }

    if (remaining > 0.01) { // Tolérance de 1 centime
      alert(`⚠️ Il reste ${remaining.toFixed(2)}€ à payer`);
      return;
    }

    setLoading(true);

    try {
      const API_URL = process.env.REACT_APP_BACKEND_URL || '';
      
      // Si un seul paiement, utiliser l'ancien format
      // Si multi-paiements, envoyer le tableau
      const paymentData = payments.length === 1 ? {
        payment_method: payments[0].method,
        payment_status: 'paid',
        amount_received: payments[0].amount,
        change_given: totalPaid - parseFloat(order.total)
      } : {
        payment_method: 'multi', // Nouveau type
        payment_status: 'paid',
        payments: payments, // Tableau de paiements
        amount_received: totalPaid,
        change_given: totalPaid - parseFloat(order.total)
      };

      const response = await fetch(`${API_URL}/api/v1/admin/orders/${order.id}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });

      if (!response.ok) throw new Error('Failed to record payment');

      alert('✅ Paiement enregistré');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Payment error:', error);
      alert('❌ Erreur lors de l\'enregistrement du paiement');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodLabel = (method) => {
    const labels = {
      'espece': '💵 Espèce',
      'cb': '💳 CB',
      'cheque': '📝 Chèque',
      'ticket_restaurant': '🎟️ Ticket restaurant'
    };
    return labels[method] || method;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="medium">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">
          {isModifyingPayment ? '✏️ Modifier le paiement' : '💳 Enregistrer le paiement'}
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Avertissement paiement verrouillé */}
      {isPaymentLocked && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔒</span>
            <p className="text-sm text-red-700 font-medium">
              Paiement en ligne non modifiable
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Order Summary avec RESTANT À PAYER */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-sm text-gray-600">Commande:</span>
              <span className="ml-2 font-bold">#{order?.id?.slice(0, 8)}</span>
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-600">Total:</span>
              <span className="ml-2 font-bold text-lg">{order?.total?.toFixed(2)}€</span>
            </div>
            <div>
              <span className="text-sm text-gray-600">Déjà payé:</span>
              <span className="ml-2 font-bold text-green-600">{totalPaid.toFixed(2)}€</span>
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-600">Restant:</span>
              <span className={`ml-2 font-bold text-xl ${remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {remaining.toFixed(2)}€
              </span>
            </div>
          </div>
        </div>

        {/* Liste des paiements enregistrés */}
        {payments.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-gray-700">Paiements enregistrés:</h3>
            {payments.map((payment, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{getPaymentMethodLabel(payment.method)}</span>
                  <span className="text-gray-400">→</span>
                  <span className="font-bold text-green-600">{payment.amount.toFixed(2)}€</span>
                </div>
                {!isPaymentLocked && (
                  <button
                    type="button"
                    onClick={() => handleRemovePayment(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Ajouter un paiement */}
        {!isPaymentLocked && remaining > 0.01 && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-sm text-gray-700">Ajouter un paiement:</h3>
            
            {/* Modes de paiement */}
            <div>
              <label className="block text-sm font-medium mb-2">Mode de paiement *</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPaymentMethod('espece')}
                  className={`p-3 rounded-lg border-2 transition-all text-sm font-bold ${
                    currentPaymentMethod === 'espece'
                      ? 'border-green-600 bg-green-500 text-white shadow-lg scale-105'
                      : 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100'
                  }`}
                >
                  💵 Espèce
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPaymentMethod('cb')}
                  className={`p-3 rounded-lg border-2 transition-all text-sm font-bold ${
                    currentPaymentMethod === 'cb'
                      ? 'border-blue-600 bg-blue-500 text-white shadow-lg scale-105'
                      : 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  💳 CB
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPaymentMethod('cheque')}
                  className={`p-3 rounded-lg border-2 transition-all text-sm font-bold ${
                    currentPaymentMethod === 'cheque'
                      ? 'border-purple-600 bg-purple-500 text-white shadow-lg scale-105'
                      : 'border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100'
                  }`}
                >
                  📝 Chèque
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPaymentMethod('ticket_restaurant')}
                  className={`p-3 rounded-lg border-2 transition-all text-sm font-bold ${
                    currentPaymentMethod === 'ticket_restaurant'
                      ? 'border-orange-600 bg-orange-500 text-white shadow-lg scale-105'
                      : 'border-orange-300 bg-orange-50 text-orange-700 hover:bg-orange-100'
                  }`}
                >
                  🎟️ Ticket restaurant
                </button>
              </div>
            </div>

            {/* Montant */}
            <div>
              <label className="block text-sm font-medium mb-2">Montant</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  placeholder={`Max: ${remaining.toFixed(2)}€`}
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentAmount(remaining.toFixed(2))}
                >
                  Tout le restant
                </Button>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleAddPayment}
              className="w-full"
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter ce paiement
            </Button>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={loading || isPaymentLocked || payments.length === 0}
          >
            {loading ? 'Enregistrement...' : remaining > 0.01 ? `Il reste ${remaining.toFixed(2)}€` : 'Valider le paiement'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
