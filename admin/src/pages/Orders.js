import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { Select } from '../components/Input';
import { ordersAPI } from '../services/api';
import { ShoppingCart, Clock, CheckCircle, XCircle } from 'lucide-react';

const statusConfig = {
  new: { label: 'Nouvelle', color: 'blue', icon: Clock },
  in_preparation: { label: 'En préparation', color: 'yellow', icon: Clock },
  ready: { label: 'Prête', color: 'green', icon: CheckCircle },
  completed: { label: 'Terminée', color: 'gray', icon: CheckCircle },
  canceled: { label: 'Annulée', color: 'red', icon: XCircle },
};

export const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadOrders();
  }, [filter]);

  const loadOrders = async () => {
    try {
      const params = filter ? { status: filter } : {};
      const response = await ordersAPI.getAll(params);
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, newStatus);
      loadOrders();
    } catch (error) {
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  if (loading) {
    return (
      <div>
        <Header title="Commandes" />
        <div className="p-8"><p>Chargement...</p></div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Commandes" />
      <div className="p-8">
        <div className="mb-6">
          <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="max-w-xs">
            <option value="">Tous les statuts</option>
            <option value="new">Nouvelles</option>
            <option value="in_preparation">En préparation</option>
            <option value="ready">Prêtes</option>
            <option value="completed">Terminées</option>
            <option value="canceled">Annulées</option>
          </Select>
        </div>

        <div className="space-y-4">
          {orders.map((order) => {
            const config = statusConfig[order.status] || statusConfig.new;
            const StatusIcon = config.icon;

            return (
              <Card key={order.id}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="font-bold text-lg">#{order.order_number}</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold bg-${config.color}-100 text-${config.color}-700 flex items-center space-x-1`}>
                        <StatusIcon className="w-4 h-4" />
                        <span>{config.label}</span>
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>Client:</strong> {order.customer_name || 'Anonyme'}</p>
                      <p><strong>Mode:</strong> {order.consumption_mode}</p>
                      <p><strong>Paiement:</strong> {order.payment_method}</p>
                      <p><strong>Articles:</strong> {order.items.length}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-primary mb-3">{order.total.toFixed(2)}€</p>
                    <Select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="text-sm"
                    >
                      <option value="new">Nouvelle</option>
                      <option value="in_preparation">En préparation</option>
                      <option value="ready">Prête</option>
                      <option value="completed">Terminée</option>
                      <option value="canceled">Annulée</option>
                    </Select>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {orders.length === 0 && (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucune commande</p>
          </div>
        )}
      </div>
    </div>
  );
};
