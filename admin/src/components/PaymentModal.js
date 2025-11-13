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
  const onlinePaymentMethods = ['card', 'mobile', 'online', 'apple_pay', 'google_pay'];
  
  // Vérifier si le paiement est déjà enregistré et s'il est modifiable
  const isPaymentLocked = order?.payment_status === 'paid' && 
                          onlinePaymentMethods.includes(order?.payment_method);
  
  const isModifyingPayment = order?.payment_status === 'paid';

  useEffect(() => {
    if (order && isOpen) {
      setPaymentMethod(order.payment_method || 'card');
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
    { id: 'card', label: 'Carte bancaire', icon: CreditCard },
    { id: 'cash', label: 'Espèces', icon: Banknote },
    { id: 'mobile', label: 'Mobile (Apple/Google Pay)', icon: Smartphone },
    { id: 'online', label: 'Paiement en ligne', icon: Globe }
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">💳 Enregistrer le paiement</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Montant de la commande */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Montant de la commande</div>
          <div className="text-3xl font-bold text-blue-600">{order.total.toFixed(2)}€</div>
        </div>

        {/* Mode de paiement */}
        <div>
          <label className="block text-sm font-medium mb-3">Mode de paiement *</label>
          <div className="grid grid-cols-2 gap-3">
            {paymentMethods.map(method => {
              const Icon = method.icon;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id)}
                  className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                    paymentMethod === method.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-sm font-medium">{method.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Montant reçu (pour espèces principalement) */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Montant reçu {paymentMethod === 'cash' && '(Espèces)'}
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.01"
              min="0"
              value={amountReceived}
              onChange={(e) => setAmountReceived(e.target.value)}
              className="flex-1 px-4 py-3 border rounded-lg text-lg"
              placeholder={`${order.total.toFixed(2)}€`}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleAppoint}
              className="px-6"
            >
              💵 Appoint
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Laissez vide si paiement exact, ou entrez le montant remis par le client
          </p>
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

        {/* Récapitulatif */}
        <div className="border-t pt-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Commande #{order.order_number}</span>
              <span className="font-medium">{order.total.toFixed(2)}€</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Mode de paiement</span>
              <span className="font-medium">
                {paymentMethods.find(m => m.id === paymentMethod)?.label}
              </span>
            </div>
            {amountReceived && parseFloat(amountReceived) !== order.total && (
              <div className="flex justify-between text-green-600">
                <span>Montant reçu</span>
                <span className="font-medium">{parseFloat(amountReceived).toFixed(2)}€</span>
              </div>
            )}
          </div>
        </div>

        {/* Note importante */}
        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-xs text-yellow-800">
          ℹ️ Le montant de <strong>{order.total.toFixed(2)}€</strong> sera enregistré dans le chiffre d'affaires, 
          pas le montant reçu.
        </div>

        {/* Buttons */}
        <div className="flex space-x-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Annuler
          </Button>
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Enregistrement...' : '✅ Enregistrer le paiement'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
