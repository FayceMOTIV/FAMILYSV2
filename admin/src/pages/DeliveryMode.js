import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ordersAPI } from '../services/api';
import { 
  Truck, Clock, CheckCircle, MapPin, Navigation,
  RefreshCw, LogOut, Phone, Package, CreditCard,
  Banknote, X, ChevronRight, ArrowLeft
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
      const deliveryOrders = (response.data?.orders || []).filter(
        o => o.order_type === 'delivery' && ['ready', 'delivering'].includes(o.status)
      );
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
        <div className="animate-spin w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Vue détail d'une commande
  if (selectedOrder) {
    return (
      <div className="min-h-screen bg-gray-100">
        {/* Header fixe */}
        <div className="bg-white shadow-sm border-b px-4 py-3 sm:py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            <button 
              onClick={() => setSelectedOrder(null)} 
              className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="font-bold text-lg sm:text-xl">Commande #{selectedOrder.order_number}</h1>
            <div className="w-10"></div>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4 pb-36 max-w-3xl mx-auto">
          {/* Statut */}
          <Card className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-sm sm:text-base">Statut</span>
              <span className={`px-3 sm:px-4 py-1.5 rounded-full text-sm sm:text-base font-bold ${
                selectedOrder.status === 'delivering' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {selectedOrder.status === 'delivering' ? '🚗 En livraison' : '📦 À livrer'}
              </span>
            </div>
          </Card>

          {/* Client */}
          <Card className="p-4 sm:p-5">
            <h3 className="font-bold text-lg sm:text-xl mb-3 sm:mb-4">👤 Client</h3>
            <p className="text-xl sm:text-2xl font-semibold">{selectedOrder.customer_name}</p>
            
            {selectedOrder.customer_phone && (
              <button 
                onClick={() => callCustomer(selectedOrder.customer_phone)}
                className="mt-4 w-full flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-colors touch-manipulation"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <span className="font-semibold text-green-800 text-lg">{selectedOrder.customer_phone}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-green-600" />
              </button>
            )}
          </Card>

          {/* Adresse */}
          <Card className="p-4 sm:p-5">
            <h3 className="font-bold text-lg sm:text-xl mb-3 sm:mb-4">📍 Adresse de livraison</h3>
            {selectedOrder.delivery_address ? (
              <>
                <div className="space-y-1 mb-4">
                  <p className="font-semibold text-lg">{selectedOrder.delivery_address.street}</p>
                  <p className="text-gray-600 text-base sm:text-lg">
                    {selectedOrder.delivery_address.postal_code} {selectedOrder.delivery_address.city}
                  </p>
                  {selectedOrder.delivery_address.notes && (
                    <p className="text-sm sm:text-base text-orange-600 bg-orange-50 p-3 rounded-lg mt-3">
                      📝 {selectedOrder.delivery_address.notes}
                    </p>
                  )}
                </div>
                <button 
                  onClick={() => openGoogleMaps(selectedOrder.delivery_address)}
                  className="w-full flex items-center justify-center gap-2 p-4 bg-blue-500 text-white rounded-xl font-semibold text-base sm:text-lg hover:bg-blue-600 transition-colors touch-manipulation"
                >
                  <Navigation className="w-5 h-5 sm:w-6 sm:h-6" />
                  Ouvrir dans Google Maps
                </button>
              </>
            ) : (
              <p className="text-red-500 text-lg">⚠️ Adresse non renseignée</p>
            )}
          </Card>

          {/* Articles */}
          <Card className="p-4 sm:p-5">
            <h3 className="font-bold text-lg sm:text-xl mb-3 sm:mb-4">🛒 Articles ({selectedOrder.items?.length || 0})</h3>
            <div className="space-y-2">
              {selectedOrder.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between py-3 border-b last:border-0">
                  <div>
                    <span className="font-bold text-base sm:text-lg">{item.quantity}x</span>
                    <span className="text-base sm:text-lg ml-2">{item.name}</span>
                    {item.options?.length > 0 && (
                      <p className="text-sm text-gray-400 mt-1">{item.options.map(o => o.name || o).join(', ')}</p>
                    )}
                  </div>
                  <span className="font-semibold text-base sm:text-lg">{(item.price * item.quantity).toFixed(2)}€</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t flex justify-between items-center">
              <span className="font-bold text-lg sm:text-xl">Total</span>
              <span className="font-bold text-2xl sm:text-3xl text-green-600">{selectedOrder.total?.toFixed(2)}€</span>
            </div>
          </Card>

          {/* Paiement */}
          <Card className="p-4 sm:p-5">
            <h3 className="font-bold text-lg sm:text-xl mb-3 sm:mb-4">💳 Paiement</h3>
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-500">Statut</span>
              <span className={`px-4 py-2 rounded-full text-sm sm:text-base font-bold ${
                selectedOrder.payment_status === 'paid' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {selectedOrder.payment_status === 'paid' ? '✅ Payé' : '❌ Non payé'}
              </span>
            </div>
            
            {selectedOrder.payment_status !== 'paid' && (
              <div className="space-y-3">
                <p className="text-sm sm:text-base text-gray-500">Marquer comme payé :</p>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => handlePaymentUpdate(selectedOrder.id, 'paid', 'cash')}
                    className="flex items-center justify-center gap-2 p-4 bg-green-100 text-green-800 rounded-xl font-semibold text-base hover:bg-green-200 transition-colors touch-manipulation"
                  >
                    <Banknote className="w-5 h-5 sm:w-6 sm:h-6" /> Espèces
                  </button>
                  <button 
                    onClick={() => handlePaymentUpdate(selectedOrder.id, 'paid', 'card')}
                    className="flex items-center justify-center gap-2 p-4 bg-blue-100 text-blue-800 rounded-xl font-semibold text-base hover:bg-blue-200 transition-colors touch-manipulation"
                  >
                    <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" /> CB
                  </button>
                </div>
              </div>
            )}
            
            {selectedOrder.payment_status === 'paid' && selectedOrder.payment_method && (
              <p className="text-sm sm:text-base text-gray-500">
                Mode : {selectedOrder.payment_method === 'cash' ? '💵 Espèces' : 
                        selectedOrder.payment_method === 'card' ? '💳 Carte' : 
                        selectedOrder.payment_method}
              </p>
            )}
          </Card>

          {selectedOrder.notes && (
            <Card className="p-4 sm:p-5 bg-yellow-50 border-yellow-200">
              <h3 className="font-bold text-lg mb-2">📝 Note du client</h3>
              <p className="text-base sm:text-lg">{selectedOrder.notes}</p>
            </Card>
          )}
        </div>

        {/* Footer fixe avec actions */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 sm:p-5 safe-area-inset-bottom">
          <div className="max-w-3xl mx-auto">
            {selectedOrder.status === 'ready' && (
              <Button 
                onClick={() => handleStatusChange(selectedOrder.id, 'delivering')}
                className="w-full bg-blue-500 hover:bg-blue-600 py-4 sm:py-5 text-lg sm:text-xl rounded-xl"
              >
                <Truck className="w-6 h-6 mr-2" /> Partir en livraison
              </Button>
            )}
            {selectedOrder.status === 'delivering' && (
              <Button 
                onClick={() => handleStatusChange(selectedOrder.id, 'delivered')}
                className="w-full bg-green-500 hover:bg-green-600 py-4 sm:py-5 text-lg sm:text-xl rounded-xl"
              >
                <CheckCircle className="w-6 h-6 mr-2" /> Commande livrée
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Liste des commandes
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-4 sm:px-6 py-4 sticky top-0 z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <Truck className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Mode Livraison</h1>
              <p className="text-sm sm:text-base text-gray-500">
                {orders.length} livraison{orders.length > 1 ? 's' : ''} en attente
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadOrders}
              className="flex-1 sm:flex-none py-2.5 px-4"
            >
              <RefreshCw className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Actualiser</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="flex-1 sm:flex-none py-2.5 px-4"
            >
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Quitter</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Liste */}
      <div className="p-4 sm:p-6 max-w-5xl mx-auto">
        {orders.length === 0 ? (
          <Card className="text-center py-16 sm:py-20">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300" />
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-500">Aucune livraison en attente</h3>
            <p className="text-gray-400 mt-2 text-base sm:text-lg">Les commandes à livrer apparaîtront ici</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {orders.map((order) => (
              <Card 
                key={order.id} 
                className={`p-4 sm:p-5 cursor-pointer hover:shadow-lg active:scale-[0.99] transition-all touch-manipulation ${
                  order.status === 'delivering' ? 'ring-2 ring-blue-400 bg-blue-50/50' : ''
                }`}
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-bold text-lg sm:text-xl">#{order.order_number}</span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        order.status === 'delivering' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status === 'delivering' ? '🚗 En route' : '📦 À livrer'}
                      </span>
                      {order.payment_status !== 'paid' && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                          💰 À encaisser
                        </span>
                      )}
                    </div>
                    
                    <p className="font-semibold text-gray-800 text-base sm:text-lg truncate">{order.customer_name}</p>
                    
                    {order.delivery_address && (
                      <p className="text-sm sm:text-base text-gray-500 flex items-center gap-1.5 mt-1.5 truncate">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{order.delivery_address.street}, {order.delivery_address.city}</span>
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 mt-3 text-sm sm:text-base">
                      <span className="text-gray-400 flex items-center gap-1">
                        <Clock className="w-4 h-4" /> {formatTime(order.created_at)}
                      </span>
                      <span className="font-bold text-green-600 text-lg">{order.total?.toFixed(2)}€</span>
                    </div>
                  </div>
                  
                  <ChevronRight className="w-6 h-6 text-gray-400 flex-shrink-0 ml-2" />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
