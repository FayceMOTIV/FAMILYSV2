import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Card, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { PaymentModal } from '../components/PaymentModal';
import { CancellationModal } from '../components/CancellationModal';
import { Package, Clock, Truck, CheckCircle, XCircle, CreditCard, Loader, Printer, Grid, List } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://resto-backoffice-1.preview.emergentagent.com';

export const OrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('new');
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [previousNewOrdersCount, setPreviousNewOrdersCount] = useState(0);

  const tabs = [
    { id: 'new', label: 'Nouvelles', icon: Package, color: 'bg-red-500', status: 'new' },
    { id: 'preparing', label: 'En Préparation', icon: Clock, color: 'bg-orange-500', status: 'in_preparation' },
    { id: 'ready', label: 'Prête', icon: CheckCircle, color: 'bg-purple-500', status: 'ready' },
    { id: 'delivering', label: 'En Livraison', icon: Truck, color: 'bg-blue-500', status: 'out_for_delivery' },
    { id: 'completed', label: 'Terminées', icon: CheckCircle, color: 'bg-green-500', status: 'completed' },
    { id: 'cancelled', label: 'Annulées', icon: XCircle, color: 'bg-gray-500', status: 'canceled' }
  ];

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Polling pour nouvelles commandes (toutes les 30 secondes)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`${API_URL}/api/v1/admin/orders?status=new`);
        const newOrders = response.data.orders || [];
        
        // Si nouvelle commande détectée, jouer le son
        if (newOrders.length > previousNewOrdersCount && previousNewOrdersCount > 0) {
          playNotificationSound();
        }
        
        setPreviousNewOrdersCount(newOrders.length);
        
        // Recharger silencieusement en arrière-plan sans bloquer l'UI
        loadOrders();
      } catch (error) {
        console.error('Erreur polling commandes:', error);
      }
    }, 30000); // 30 secondes

    return () => clearInterval(interval);
  }, [previousNewOrdersCount]);

  const playNotificationSound = () => {
    // Créer un son de bip avec Web Audio API
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800; // Fréquence du bip
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
      
      // Répéter 3 fois
      setTimeout(() => {
        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();
        osc2.connect(gain2);
        gain2.connect(audioContext.destination);
        osc2.frequency.value = 800;
        osc2.type = 'sine';
        gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        osc2.start(audioContext.currentTime);
        osc2.stop(audioContext.currentTime + 0.5);
      }, 200);
      
      setTimeout(() => {
        const osc3 = audioContext.createOscillator();
        const gain3 = audioContext.createGain();
        osc3.connect(gain3);
        gain3.connect(audioContext.destination);
        osc3.frequency.value = 800;
        osc3.type = 'sine';
        gain3.gain.setValueAtTime(0.3, audioContext.currentTime);
        gain3.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        osc3.start(audioContext.currentTime);
        osc3.stop(audioContext.currentTime + 0.5);
      }, 400);
      
      console.log('🔔 BIP! Nouvelle commande!');
    } catch (error) {
      console.error('Erreur son:', error);
    }
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      // Charger toutes les commandes sans filtre
      const response = await axios.get(`${API_URL}/api/v1/admin/orders`);
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Erreur chargement commandes:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // Mise à jour optimiste: modifier l'état local immédiatement
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus }
            : order
        )
      );
      
      // Envoyer la requête au backend
      await axios.patch(`${API_URL}/api/v1/admin/orders/${orderId}/status`, { status: newStatus });
      
      // Basculer vers le nouvel onglet SANS recharger (l'état local est déjà à jour)
      const newTab = tabs.find(t => t.status === newStatus);
      if (newTab) {
        setActiveTab(newTab.id);
      }
      
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
      alert('Erreur lors de la mise à jour du statut');
      // En cas d'erreur, recharger pour avoir l'état correct
      loadOrders();
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setSelectedOrder(null);
    loadOrders();
  };

  const handleCancelOrder = async (reason) => {
    if (!selectedOrder) return;
    
    try {
      // Mise à jour optimiste
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === selectedOrder.id 
            ? { ...order, status: 'canceled', cancellation_reason: reason }
            : order
        )
      );
      
      // Envoyer la requête au backend
      await axios.patch(`${API_URL}/api/v1/admin/orders/${selectedOrder.id}/status`, { 
        status: 'canceled',
        cancellation_reason: reason 
      });
      
      setShowCancellationModal(false);
      setSelectedOrder(null);
      
      // Basculer vers l'onglet annulés
      setActiveTab('cancelled');
      
    } catch (error) {
      console.error('Erreur annulation commande:', error);
      alert('❌ Erreur lors de l\'annulation de la commande');
      // Recharger en cas d'erreur
      loadOrders();
    }
  };

  const printOrder = (order) => {
    // ESC/POS commands for 80MM thermal printer
    const ESC = '\x1B';
    const GS = '\x1D';
    
    let receipt = '';
    
    // Initialize printer
    receipt += ESC + '@';
    
    // Center align + Bold + Double size
    receipt += ESC + 'a' + '\x01'; // Center
    receipt += ESC + 'E' + '\x01'; // Bold on
    receipt += GS + '!' + '\x11'; // Double width and height
    
    receipt += "FAMILY'S\n";
    receipt += "Original Burger\n";
    
    // Normal size
    receipt += GS + '!' + '\x00';
    receipt += ESC + 'E' + '\x00'; // Bold off
    receipt += '\n';
    
    // Left align
    receipt += ESC + 'a' + '\x00';
    
    // Order info
    receipt += '================================\n';
    receipt += `COMMANDE #${order.id?.slice(0, 8)}\n`;
    receipt += `Date: ${formatDate(order.created_at)}\n`;
    receipt += '================================\n\n';
    
    // Customer
    receipt += ESC + 'E' + '\x01'; // Bold on
    receipt += `Client: ${order.customer_name || 'Client'}\n`;
    receipt += ESC + 'E' + '\x00'; // Bold off
    if (order.customer_phone) {
      receipt += `Tel: ${order.customer_phone}\n`;
    }
    receipt += '\n';
    
    // Order type
    receipt += `Type: ${order.order_type === 'delivery' ? 'LIVRAISON' : 'A EMPORTER'}\n`;
    receipt += '\n';
    
    // Items
    receipt += '--------------------------------\n';
    receipt += ESC + 'E' + '\x01'; // Bold on
    receipt += 'ARTICLES:\n';
    receipt += ESC + 'E' + '\x00'; // Bold off
    receipt += '--------------------------------\n';
    
    order.items?.forEach((item) => {
      receipt += `${item.quantity}x ${item.name}\n`;
      if (item.notes) {
        receipt += `   >> ${item.notes}\n`;
      }
      receipt += `   ${item.total_price}€\n\n`;
    });
    
    receipt += '--------------------------------\n';
    
    // Total
    receipt += ESC + 'E' + '\x01'; // Bold on
    receipt += GS + '!' + '\x11'; // Double size
    receipt += `TOTAL: ${order.total}€\n`;
    receipt += GS + '!' + '\x00'; // Normal size
    receipt += ESC + 'E' + '\x00'; // Bold off
    
    receipt += '================================\n';
    receipt += ESC + 'a' + '\x01'; // Center
    receipt += '\nMerci de votre commande!\n';
    receipt += 'Bon appetit!\n\n';
    
    // Cut paper
    receipt += GS + 'V' + '\x00';
    
    // Create a blob with the receipt data
    const blob = new Blob([receipt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Try to open print dialog
    const printWindow = window.open(url, '_blank', 'width=302,height=500');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
        setTimeout(() => {
          URL.revokeObjectURL(url);
          printWindow.close();
        }, 100);
      };
    } else {
      // Fallback: download the receipt
      const a = document.createElement('a');
      a.href = url;
      a.download = `commande-${order.id?.slice(0, 8)}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      alert('📄 Fichier de commande téléchargé. Ouvrez-le avec votre logiciel d\'impression thermique.');
    }
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      'new': 'in_preparation',
      'in_preparation': 'ready',
      'ready': 'completed',
      'out_for_delivery': 'completed'
    };
    return statusFlow[currentStatus];
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const currentTab = tabs.find(t => t.id === activeTab);
  const filteredOrders = orders.filter(o => o.status === currentTab.status);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header title="📦 Gestion des Commandes" subtitle="Système de suivi optimisé pour tablette" />
      
      {/* Onglets */}
      <div className="p-4 bg-white border-b overflow-x-auto">
        <div className="flex space-x-3 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const count = orders.filter(o => o.status === tab.status).length;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-3 px-6 py-4 rounded-xl font-bold text-white transition-all transform ${
                  activeTab === tab.id 
                    ? `${tab.color} scale-105 shadow-xl` 
                    : 'bg-gray-300 hover:bg-gray-400 scale-95'
                }`}
              >
                <Icon className="w-6 h-6" />
                <div className="text-left">
                  <div className="text-sm">{tab.label}</div>
                  <div className="text-2xl font-black">{count}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Liste des commandes */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="w-12 h-12 animate-spin text-primary" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl font-bold text-gray-400">Pas de commandes pour le moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="hover:shadow-2xl transition-all duration-300 animate-fadeIn">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-black text-gray-800">#{order.id?.slice(0, 8)}</h3>
                      <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-white font-bold ${currentTab.color}`}>
                      {order.total}€
                    </div>
                  </div>

                  {/* Client */}
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Client</p>
                    <p className="font-bold text-gray-800">{order.customer_name || 'Client'}</p>
                    {order.customer_phone && (
                      <p className="text-sm text-gray-600">{order.customer_phone}</p>
                    )}
                  </div>

                  {/* Articles */}
                  <div className="mb-4 space-y-2">
                    <p className="text-sm font-bold text-gray-600">Articles:</p>
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{item.name}</p>
                          {item.notes && (
                            <p className="text-xs text-gray-500">📝 {item.notes}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-800">x{item.quantity}</p>
                          <p className="text-sm text-gray-600">{item.total_price}€</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Type de commande */}
                  <div className="mb-4 flex items-center space-x-2 text-sm">
                    {order.order_type === 'delivery' ? (
                      <>
                        <Truck className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-blue-600">Livraison</span>
                      </>
                    ) : (
                      <>
                        <Package className="w-4 h-4 text-purple-600" />
                        <span className="font-semibold text-purple-600">À emporter</span>
                      </>
                    )}
                  </div>

                  {/* Paiement */}
                  <div className="mb-4">
                    {order.payment_status === 'paid' ? (
                      <div>
                        <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg mb-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <div className="flex-1">
                            <p className="font-bold text-green-700">Payé</p>
                            <p className="text-sm text-gray-600 capitalize">{order.payment_method}</p>
                          </div>
                        </div>
                        {/* Bouton modifier paiement (seulement pour paiements physiques) */}
                        {!['card', 'mobile', 'online', 'apple_pay', 'google_pay'].includes(order.payment_method) && (
                          <Button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowPaymentModal(true);
                            }}
                            variant="outline"
                            size="sm"
                            className="w-full border border-blue-300 text-blue-600 hover:bg-blue-50 text-xs"
                          >
                            ✏️ Modifier le paiement
                          </Button>
                        )}
                      </div>
                    ) : (
                      <Button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowPaymentModal(true);
                        }}
                        variant="outline"
                        className="w-full border-2 border-orange-500 text-orange-600 hover:bg-orange-50"
                      >
                        <CreditCard className="w-5 h-5 mr-2" />
                        Enregistrer le paiement
                      </Button>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    {/* Bouton Imprimer */}
                    <Button
                      onClick={() => printOrder(order)}
                      variant="outline"
                      className="w-full border-2 border-blue-500 text-blue-600 hover:bg-blue-50 py-3"
                    >
                      <Printer className="w-5 h-5 mr-2" />
                      🖨️ Imprimer
                    </Button>

                    {/* Boutons de changement de statut */}
                    <div className="flex space-x-2">
                      {getNextStatus(order.status) && (
                        <Button
                          onClick={() => updateOrderStatus(order.id, getNextStatus(order.status))}
                          className="flex-1 py-4 text-lg font-bold"
                        >
                          {getNextStatus(order.status) === 'in_preparation' && '🔥 EN COURS DE PREPARATION'}
                          {getNextStatus(order.status) === 'ready' && '✅ PRETE'}
                          {getNextStatus(order.status) === 'completed' && '🎉 TERMINE'}
                        </Button>
                      )}
                      {order.status !== 'canceled' && order.status !== 'completed' && (
                        <Button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowCancellationModal(true);
                          }}
                          variant="outline"
                          className="px-6 border-2 border-red-500 text-red-600 hover:bg-red-50"
                        >
                          ❌
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal Paiement */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
        onSuccess={handlePaymentSuccess}
      />

      {/* Modal Annulation */}
      <CancellationModal
        isOpen={showCancellationModal}
        onClose={() => {
          setShowCancellationModal(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
        onConfirm={handleCancelOrder}
      />
    </div>
  );
};
