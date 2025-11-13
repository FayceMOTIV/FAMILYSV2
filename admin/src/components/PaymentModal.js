import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { X, CreditCard, Banknote, Smartphone, Globe } from 'lucide-react';

export const PaymentModal = ({ isOpen, onClose, order, onSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [amountReceived, setAmountReceived] = useState('');
  const [change, setChange] = useState(0);
  const [loading, setLoading] = useState(false);

  // Paiements en ligne (non modifiables)
  const onlinePaymentMethods = ['online'];
  
  // Vérifier si le paiement est déjà enregistré et s'il est modifiable
  const isPaymentLocked = order?.payment_status === 'paid' && 
                          onlinePaymentMethods.includes(order?.payment_method);
  
  const isModifyingPayment = order?.payment_status === 'paid';

  useEffect(() => {
    if (order && isOpen) {
      setPaymentMethod(order.payment_method || 'cash');
      setAmountReceived(order.amount_received?.toString() || '');
      setChange(order.change_given || 0);
    }
  }, [order, isOpen]);

  useEffect(() => {
    if (amountReceived && order) {
      const received = parseFloat(amountReceived);
      const total = parseFloat(order.total);
      if (received > total) {
        setChange(received - total);
      } else {
        setChange(0);
      }
    } else {
      setChange(0);
    }
  }, [amountReceived, order]);

  const paymentMethods = [
    { id: 'card_restaurant', label: 'CB (payé au restaurant)', icon: CreditCard, online: false },
    { id: 'online', label: 'PAIEMENT EN LIGNE', icon: Globe, online: true },
    { id: 'ticket_resto', label: 'TICKET RESTAURANT', icon: CreditCard, online: false },
    { id: 'check', label: 'CHEQUE BANCAIRE', icon: CreditCard, online: false },
    { id: 'cash', label: 'ESPECE', icon: Banknote, online: false }
  ];

  const handleAppoint = () => {
    setAmountReceived(order.total.toString());
    setChange(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Montant de la commande */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Montant de la commande</div>
          <div className="text-3xl font-bold text-blue-600">{order.total.toFixed(2)}€</div>
        </div>

        {/* Mode de paiement */}
        <div>
          <label className="block text-xs font-medium mb-2">Mode de paiement *</label>
          <div className="grid grid-cols-3 gap-2">
            {paymentMethods.map(method => {
              const Icon = method.icon;
              const isDisabled = isPaymentLocked;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => !isDisabled && setPaymentMethod(method.id)}
                  disabled={isDisabled}
                  className={`p-2 border-2 rounded flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === method.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium text-center leading-tight">{method.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Montant reçu (pour espèces principalement) */}
        <div>
          <label className="block text-xs font-medium mb-1">
            Montant reçu {paymentMethod === 'cash' && '(Espèces)'}
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.01"
              min="0"
              value={amountReceived}
              onChange={(e) => setAmountReceived(e.target.value)}
              disabled={isPaymentLocked}
              className={`flex-1 px-3 py-2 border rounded text-base ${isPaymentLocked ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder={`${order.total.toFixed(2)}€`}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleAppoint}
              disabled={isPaymentLocked}
              size="sm"
            >
              💵 Appoint
            </Button>
          </div>
        </div>

        {/* Monnaie à rendre */}
        {change > 0 && (
          <div className="bg-green-50 border-2 border-green-200 p-4 rounded-lg">
            <div className="text-sm text-green-700 mb-1">💸 Monnaie à rendre</div>
            <div className="text-3xl font-bold text-green-600">{change.toFixed(2)}€</div>
            <div className="text-xs text-green-600 mt-2">
              Reçu: {parseFloat(amountReceived).toFixed(2)}€ - Commande: {order.total.toFixed(2)}€
            </div>
          </div>
        )}

        {/* Récapitulatif compact */}
        <div className="border-t pt-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">#{order.order_number}</span>
            <span className="font-bold text-lg">{order.total.toFixed(2)}€</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            {isPaymentLocked ? 'Fermer' : 'Annuler'}
          </Button>
          {!isPaymentLocked && (
            <Button type="submit" disabled={loading} className="flex-1">
              {loading 
                ? 'Enregistrement...' 
                : isModifyingPayment 
                  ? '✏️ Modifier le paiement'
                  : '✅ Enregistrer le paiement'
              }
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
};
