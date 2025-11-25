import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Truck, MapPin, Phone, CheckCircle, DollarSign } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const DeliveryMode = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/admin/orders`);
      const deliveryOrders = response.data.orders.filter(
        o => o.order_type === 'delivery' && ['ready', 'out_for_delivery'].includes(o.status)
      );
      setOrders(deliveryOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePickup = async (orderId) => {
    if (!window.confirm('Commande récupérée ?')) return;
    try {
      await axios.put(`${API_URL}/api/v1/admin/orders/${orderId}/status`, {
        status: 'out_for_delivery'
      });
      loadOrders();
    } catch (error) {
      alert('Erreur');
    }
  };

  const handleDelivered = async (orderId) => {
    if (!window.confirm('Commande livrée ?')) return;
    try {
      await axios.put(`${API_URL}/api/v1/admin/orders/${orderId}/status`, {
        status: 'completed'
      });
      loadOrders();
    } catch (error) {
      alert('Erreur');
    }
  };

  const handlePayment = async (orderId, method) => {
    try {
      await axios.post(`${API_URL}/api/v1/admin/orders/${orderId}/payment`, {
        payment_method: method,
        payment_status: 'paid'
      });
      loadOrders();
      alert('✅ Paiement enregistré');
    } catch (error) {
      alert('❌ Erreur');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="🚚 Mode Livraison" subtitle="Gestion des livraisons en cours" />
      
      <div className="p-6">
        {orders.length === 0 ? (
          <Card>
            <div className="p-12 text-center">
              <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">Aucune livraison en cours</h3>
              <p className="text-gray-500">Les commandes prêtes à livrer apparaîtront ici</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <Card key={order.id} className="hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-black text-primary mb-1">#{order.order_number}</h3>
                      <p className="text-sm text-gray-600">{new Date(order.created_at).toLocaleTimeString('fr-FR')}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-full font-bold ${order.status === 'ready' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {order.status === 'ready' ? '✅ Prête' : '🚚 En livraison'}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-bold">{order.customer_name}</p>
                          <p className="text-sm text-gray-600">{order.delivery_address}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <p className="text-sm text-gray-600">{order.customer_phone}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Articles :</p>
                      <ul className="text-sm space-y-1">
                        {order.items?.slice(0, 3).map((item, idx) => (
                          <li key={idx}>
                            {item.quantity}x {item.name}
                          </li>
                        ))}
                        {order.items?.length > 3 && <li className="text-gray-500">+{order.items.length - 3} autres...</li>}
                      </ul>
                      <p className="text-xl font-black text-primary mt-3">{order.total}€</p>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {order.status === 'ready' && (
                      <Button onClick={() => handlePickup(order.id)} className="flex-1">
                        <Truck className="w-4 h-4 mr-2" />
                        Récupérer et partir
                      </Button>
                    )}
                    
                    {order.status === 'out_for_delivery' && (
                      <>
                        <Button onClick={() => handleDelivered(order.id)} className="flex-1 bg-green-600 hover:bg-green-700">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Livré
                        </Button>
                        
                        {order.payment_status !== 'paid' && (
                          <div className="flex gap-2 w-full">
                            <Button onClick={() => handlePayment(order.id, 'card')} variant="outline" className="flex-1">
                              <DollarSign className="w-4 h-4 mr-2" />
                              CB
                            </Button>
                            <Button onClick={() => handlePayment(order.id, 'cash')} variant="outline" className="flex-1">
                              <DollarSign className="w-4 h-4 mr-2" />
                              Espèces
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => window.location.href = '/admin/orders-mode'}
            className="text-gray-600 hover:text-primary"
          >
            ← Retour au Mode Commande
          </button>
        </div>
      </div>
    </div>
  );
};
