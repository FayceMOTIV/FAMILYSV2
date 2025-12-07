import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ordersAPI } from '../services/api';
import { 
  Truck, Clock, CheckCircle, MapPin, Navigation,
  RefreshCw, LogOut, Phone, Package, CreditCard,
  Banknote, X, ChevronRight
} from 'lucide-react';

export const DeliveryMode = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const session = localStorage.getItem('delivery_mode_session');
    const expiry = localStorage.getItem('delivery_mode_expiry');
    
    if (!session || !expiry || new Date(expiry) < new Date()) {
      navigate('/delivery-mode-login');
      return;
    }

    loadOrders();
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
  }, [navigate]);

  const loadOrders = async () => {
    try {
      const response = await ordersAPI.getAll();
      // Seulement les commandes LIVRAISON avec statuts pertinents
      const deliveryOrders = (response.data?.orders || []).filter(
        o => o.order_type === 'delivery' && ['ready', 'delivering'].includes(o.status)
      );
      // Trier : delivering en premier, puis ready
      deliveryOrders.sort((a, b) => {
        if (a.status === 'delivering' && b.status !== 'delivering') return -1;
        if (b.status === 'delivering' && a.status !== 'delivering') return 1;
        return new Date(a.created_at) - new Date(b.created_at);
      });
      setOrders(deliveryOrders);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, newStatus);
      setSelectedOrder(null);
      loadOrders();
    } catch (error) {
      console.error('Error:', error);
      alert('Erreur lors de la mise à jour');
    }
  };

  const handlePaymentUpdate = async (orderId, paymentStatus, paymentMethod) => {
    try {
      await ordersAPI.update(orderId, { 
        payment_status: paymentStatus,
        payment_method: paymentMethod 
      });
      loadOrders();
      // Mettre à jour l'ordre sélectionné
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          payment_status: paymentStatus,
          payment_method: paymentMethod
        });
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Erreur lors de la mise à jour du paiement');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('delivery_mode_session');
    localStorage.removeItem('delivery_mode_expiry');
    navigate('/select-mode');
  };

  const openGoogleMaps = (address) => {
    if (!address) return;
    const query = encodeURIComponent(`${address.street}, ${address.postal_code} ${address.city}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const callCustomer = (phone) => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Vue détail d'une commande (mobile-first)
  if (selectedOrder) {
    return (
      <div className="min-h-screen bg-gray-100">
        {/* Header fixe */}
        <div className="bg-white shadow-sm border-b px-4 py-3 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <button onClick={() => setSelectedOrder(null)} className="p-2 -ml-2">
              <X className="w-6 h-6" />
            </button>
            <h1 className="font-bold text-lg">Commande #{selectedOrder.order_number}</h1>
            <div className="w-10"></div>
          </div>
        </div>

        <div className="p-4 space-y-4 pb-32">
          {/* Statut */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Statut</span>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                selectedOrder.status === 'delivering' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {selectedOrder.status === 'delivering' ? '🚗 En livraison' : '📦 À livrer'}
              </span>
            </div>
          </Card>

          {/* Client */}
          <Card className="p-4">
            <h3 className="font-bold text-lg mb-3">👤 Client</h3>
            <p className="text-xl font-semibold">{selectedOrder.customer_name}</p>
            
            {selectedOrder.customer_phone && (
              <button 
                onClick={() => callCustomer(selectedOrder.customer_phone)}
                className="mt-3 w-full flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-800">{selectedOrder.customer_phone}</span>
                </div>
                <span className="text-green-600 text-sm">Appeler →</span>
              </button>
            )}
          </Card>

          {/* Adresse */}
          <Card className="p-4">
            <h3 className="font-bold text-lg mb-3">📍 Adresse de livraison</h3>
            {selectedOrder.delivery_address ? (
              <>
                <div className="space-y-1 mb-3">
                  <p className="font-semibold">{selectedOrder.delivery_address.street}</p>
                  <p className="text-gray-600">
                    {selectedOrder.delivery_address.postal_code} {selectedOrder.delivery_address.city}
                  </p>
                  {selectedOrder.delivery_address.notes && (
                    <p className="text-sm text-orange-600 bg-orange-50 p-2 rounded mt-2">
                      📝 {selectedOrder.delivery_address.notes}
                    </p>
                  )}
                </div>
                <button 
                  onClick={() => openGoogleMaps(selectedOrder.delivery_address)}
                  className="w-full flex items-center justify-center gap-2 p-3 bg-blue-500 text-white rounded-lg font-semibold"
                >
                  <Navigation className="w-5 h-5" />
                  Ouvrir dans Google Maps
                </button>
              </>
            ) : (
              <p className="text-red-500">⚠️ Adresse non renseignée</p>
            )}
          </Card>

          {/* Articles */}
          <Card className="p-4">
            <h3 className="font-bold text-lg mb-3">🛒 Articles ({selectedOrder.items?.length || 0})</h3>
            <div className="space-y-2">
              {selectedOrder.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between py-2 border-b last:border-0">
                  <div>
                    <span className="font-semibold">{item.quantity}x</span> {item.name}
                    {item.options?.length > 0 && (
                      <p className="text-xs text-gray-400">{item.options.map(o => o.name || o).join(', ')}</p>
                    )}
                  </div>
                  <span className="font-semibold">{(item.price * item.quantity).toFixed(2)}€</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t flex justify-between">
              <span className="font-bold text-lg">Total</span>
              <span className="font-bold text-xl text-green-600">{selectedOrder.total?.toFixed(2)}€</span>
            </div>
          </Card>

          {/* Paiement */}
          <Card className="p-4">
            <h3 className="font-bold text-lg mb-3">💳 Paiement</h3>
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-500">Statut</span>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                selectedOrder.payment_status === 'paid' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {selectedOrder.payment_status === 'paid' ? '✅ Payé' : '❌ Non payé'}
              </span>
            </div>
            
            {selectedOrder.payment_status !== 'paid' && (
              <div className="space-y-2">
                <p className="text-sm text-gray-500 mb-2">Marquer comme payé :</p>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => handlePaymentUpdate(selectedOrder.id, 'paid', 'cash')}
                    className="flex items-center justify-center gap-2 p-3 bg-green-100 text-green-800 rounded-lg font-semibold"
                  >
                    <Banknote className="w-5 h-5" /> Espèces
                  </button>
                  <button 
                    onClick={() => handlePaymentUpdate(selectedOrder.id, 'paid', 'card')}
                    className="flex items-center justify-center gap-2 p-3 bg-blue-100 text-blue-800 rounded-lg font-semibold"
                  >
                    <CreditCard className="w-5 h-5" /> CB
                  </button>
                </div>
              </div>
            )}
            
            {selectedOrder.payment_status === 'paid' && selectedOrder.payment_method && (
              <p className="text-sm text-gray-500">
                Mode : {selectedOrder.payment_method === 'cash' ? '💵 Espèces' : 
                        selectedOrder.payment_method === 'card' ? '💳 Carte' : 
                        selectedOrder.payment_method}
              </p>
            )}
          </Card>

          {selectedOrder.notes && (
            <Card className="p-4 bg-yellow-50 border-yellow-200">
              <h3 className="font-bold mb-2">📝 Note du client</h3>
              <p>{selectedOrder.notes}</p>
            </Card>
          )}
        </div>

        {/* Footer fixe avec actions */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 space-y-2">
          {selectedOrder.status === 'ready' && (
            <Button 
              onClick={() => handleStatusChange(selectedOrder.id, 'delivering')}
              className="w-full bg-blue-500 hover:bg-blue-600 py-4 text-lg"
            >
              <Truck className="w-5 h-5 mr-2" /> Partir en livraison
            </Button>
          )}
          {selectedOrder.status === 'delivering' && (
            <Button 
              onClick={() => handleStatusChange(selectedOrder.id, 'delivered')}
              className="w-full bg-green-500 hover:bg-green-600 py-4 text-lg"
            >
              <CheckCircle className="w-5 h-5 mr-2" /> Commande livrée
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Liste des commandes (responsive)
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-4 md:px-6 py-4 sticky top-0 z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Truck className="w-8 h-8 text-green-600" />
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">Mode Livraison</h1>
              <span className="text-sm text-gray-500">
                {orders.length} livraison{orders.length > 1 ? 's' : ''} en attente
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadOrders}>
              <RefreshCw className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Actualiser</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Quitter</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Liste */}
      <div className="p-4 md:p-6">
        {orders.length === 0 ? (
          <Card className="text-center py-16">
            <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-500">Aucune livraison en attente</h3>
            <p className="text-gray-400 mt-2">Les commandes à livrer apparaîtront ici</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Card 
                key={order.id} 
                className={`p-4 cursor-pointer hover:shadow-lg transition-shadow ${
                  order.status === 'delivering' ? 'ring-2 ring-blue-400' : ''
                }`}
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-lg">#{order.order_number}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        order.status === 'delivering' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status === 'delivering' ? '🚗 En route' : '📦 À livrer'}
                      </span>
                      {order.payment_status !== 'paid' && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">
                          💰 À encaisser
                        </span>
                      )}
                    </div>
                    
                    <p className="font-semibold text-gray-800">{order.customer_name}</p>
                    
                    {order.delivery_address && (
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {order.delivery_address.street}, {order.delivery_address.city}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-3 mt-2 text-sm">
                      <span className="text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatTime(order.created_at)}
                      </span>
                      <span className="font-bold text-green-600">{order.total?.toFixed(2)}€</span>
                    </div>
                  </div>
                  
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
