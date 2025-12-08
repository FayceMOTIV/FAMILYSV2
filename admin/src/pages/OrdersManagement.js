import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Card, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { PaymentModal } from '../components/PaymentModal';
import { CancellationModal } from '../components/CancellationModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { RefundModal } from '../components/RefundModal';
import { Package, Clock, Truck, CheckCircle, XCircle, CreditCard, Loader, Printer, Grid, List, DollarSign, FileText, AlertCircle } from 'lucide-react';
import { ordersAPI } from '../services/api';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

export const OrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('new');
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [previousNewOrdersCount, setPreviousNewOrdersCount] = useState(0);
  const [viewMode, setViewMode] = useState('list'); // 'cards' ou 'list' - LISTE PAR DÉFAUT
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  
  // Ticket Z states
  const [dailyStatus, setDailyStatus] = useState(null);
  const [showTicketZModal, setShowTicketZModal] = useState(false);
  const [closingDay, setClosingDay] = useState(false);

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
    loadDailyStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Polling pour nouvelles commandes (toutes les 30 secondes)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await ordersAPI.getAll('new');
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
      const response = await ordersAPI.getAll();
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Erreur chargement commandes:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const loadDailyStatus = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/v1/fb/ticket-z/daily-status/${today}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (response.ok) {
        const data = await response.json();
        setDailyStatus(data);
      }
    } catch (error) {
      console.error('Error loading daily status:', error);
    }
  };

  const handleCloseDay = async () => {
    if (!window.confirm('⚠️ Confirmer la clôture de journée ? Cette action est irréversible et générera le Ticket Z.')) {
      return;
    }

    setClosingDay(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/v1/fb/ticket-z`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ date: today })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Erreur lors de la clôture');
      }

      const ticketZ = await response.json();
      alert('✅ Journée clôturée avec succès !');
      setShowTicketZModal(true);
      loadDailyStatus();
      loadOrders();
    } catch (error) {
      alert(`❌ ${error.message}`);
    } finally {
      setClosingDay(false);
    }
  };

  // Fonction pour déterminer l'étape suivante automatiquement
  const getNextStatus = (currentStatus, orderType) => {
    const statusFlow = {
      'new': 'in_preparation',
      'in_preparation': 'ready',
      'ready': orderType === 'delivery' ? 'out_for_delivery' : 'completed',
      'out_for_delivery': 'completed',
      'completed': null,
      'canceled': null
    };
    
    return statusFlow[currentStatus] || null;
  };

  const getNextStatusLabel = (currentStatus, orderType) => {
    const nextStatus = getNextStatus(currentStatus, orderType);
    const labels = {
      'in_preparation': '👨‍🍳 En préparation',
      'ready': '✅ Prête',
      'out_for_delivery': '🚚 En livraison',
      'completed': '🎉 Terminée'
    };
    
    return labels[nextStatus] || null;
  };

  const handleNextStep = async (order, e) => {
    e?.stopPropagation();
    
    const nextStatus = getNextStatus(order.status, order.order_type);
    
    if (!nextStatus) {
      alert('Cette commande est déjà à l\'étape finale');
      return;
    }
    
    requestStatusChange(order.id, order.status, nextStatus);
  };

  const requestStatusChange = (orderId, currentStatus, newStatus) => {
    // Vérifier si on essaie de terminer une commande
    if (newStatus === 'completed') {
      // Trouver la commande
      const order = orders.find(o => o.id === orderId);
      
      // Bloquer si la commande n'est pas payée
      if (order && order.payment_status !== 'paid') {
        alert('❌ PAIEMENT REQUIS\n\nCette commande ne peut pas être terminée car elle n\'est pas encore payée.\n\nVeuillez d\'abord enregistrer le paiement avant de la marquer comme terminée.');
        return;
      }
    }
    
    setPendingStatusChange({ orderId, currentStatus, newStatus });
    setShowConfirmationModal(true);
  };

  const updateOrderStatus = async () => {
    if (!pendingStatusChange) return;
    
    const { orderId, newStatus } = pendingStatusChange;
    
    try {
      // Mise à jour optimiste : déplacer immédiatement la commande dans l'UI
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
      // Envoyer la requête au backend
      await ordersAPI.updateStatus(orderId, newStatus);
      
      setPendingStatusChange(null);
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
      alert('Erreur lors de la mise à jour du statut');
      // Recharger en cas d'erreur
      loadOrders();
      setPendingStatusChange(null);
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
      await ordersAPI.cancel(selectedOrder.id, reason);
      
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

  const getStatusChangeConfirmation = (currentStatus, nextStatus) => {
    const confirmations = {
      'new_to_in_preparation': {
        title: '🔥 Commencer la préparation ?',
        message: 'Vous êtes sur le point de marquer cette commande comme "En cours de préparation". Le client sera notifié.',
        confirmText: 'Oui, commencer',
        type: 'warning'
      },
      'in_preparation_to_ready': {
        title: '✅ Commande prête ?',
        message: 'La commande est-elle prête à être récupérée ou livrée ? Le client recevra une notification.',
        confirmText: 'Oui, elle est prête',
        type: 'success'
      },
      'ready_to_out_for_delivery': {
        title: '🚚 Partir pour la livraison ?',
        message: 'Le livreur prend la commande. Le client recevra une notification que son livreur est en route.',
        confirmText: 'Oui, partir livrer',
        type: 'info'
      },
      'ready_to_completed': {
        title: '🎉 Terminer la commande ?',
        message: 'Cette commande sera marquée comme terminée et archivée. Cette action est définitive.',
        confirmText: 'Oui, terminer',
        type: 'success'
      },
      'out_for_delivery_to_completed': {
        title: '📦 Livraison terminée ?',
        message: 'Le livreur confirme que la commande a été livrée avec succès au client.',
        confirmText: 'Oui, livrée',
        type: 'success'
      }
    };

    const key = `${currentStatus}_to_${nextStatus}`;
    return confirmations[key] || {
      title: '⚠️ Confirmer le changement',
      message: `Voulez-vous vraiment changer le statut de cette commande ?`,
      confirmText: 'Confirmer',
      type: 'warning'
    };
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
  const filteredOrders = orders.filter(o => {
    // Filtre par statut
    if (o.status !== currentTab.status) return false;
    
    // Pour l'onglet "En Livraison", afficher SEULEMENT les commandes de type delivery
    if (currentTab.status === 'out_for_delivery' && o.order_type !== 'delivery') {
      return false;
    }
    
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <Header title="📦 Gestion des Commandes" subtitle="Système de suivi optimisé pour tablette" />
      
      {/* Ticket Z - Clôture de Journée */}
      {dailyStatus && !dailyStatus.is_closed && (
        <div className={`mx-4 mt-4 p-4 rounded-lg border-2 ${
          dailyStatus.needs_closure 
            ? 'bg-red-50 border-red-500' 
            : dailyStatus.can_close
              ? 'bg-green-50 border-green-500'
              : 'bg-yellow-50 border-yellow-500'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className={`w-6 h-6 ${
                dailyStatus.needs_closure ? 'text-red-600' : 'text-green-600'
              }`} />
              <div>
                <h3 className="font-bold text-lg">
                  {dailyStatus.needs_closure ? '⚠️ Clôture de journée requise' : '📊 Ticket Z'}
                </h3>
                <p className="text-sm text-gray-600">
                  {dailyStatus.pending_orders > 0 ? (
                    <span className="text-orange-600 font-semibold">
                      <AlertCircle className="w-4 h-4 inline mr-1" />
                      {dailyStatus.pending_orders} commande(s) en attente
                    </span>
                  ) : (
                    <span className="text-green-600 font-semibold">
                      <CheckCircle className="w-4 h-4 inline mr-1" />
                      Toutes les commandes sont traitées
                    </span>
                  )}
                </p>
              </div>
            </div>
            <Button
              onClick={handleCloseDay}
              disabled={!dailyStatus.can_close || closingDay}
              className={`${
                dailyStatus.can_close 
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg' 
                  : 'bg-gray-400'
              } text-white font-bold px-6 py-3`}
            >
              {closingDay ? (
                <><Loader className="w-5 h-5 mr-2 animate-spin" /> Clôture en cours...</>
              ) : (
                <>🔒 Clôturer la journée</>
              )}
            </Button>
          </div>
        </div>
      )}

      {dailyStatus && dailyStatus.is_closed && (
        <div className="mx-4 mt-4 p-4 rounded-lg bg-blue-50 border-2 border-blue-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="font-bold text-lg text-blue-900">
                  ✅ Journée clôturée - {dailyStatus.date}
                </h3>
                <p className="text-sm text-blue-700">
                  Le Ticket Z a été généré avec succès
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Onglets */}
      <div className="p-4 bg-white border-b overflow-x-auto">
        <div className="flex justify-between items-center">
          <div className="flex space-x-3 min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              // Appliquer le même filtre que pour l'affichage
              const count = orders.filter(o => {
                if (o.status !== tab.status) return false;
                // Pour "En Livraison", compter seulement les commandes delivery
                if (tab.status === 'out_for_delivery' && o.order_type !== 'delivery') {
                  return false;
                }
                return true;
              }).length;
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
          
          {/* Boutons de vue */}
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                viewMode === 'cards' 
                  ? 'bg-white text-primary font-bold shadow' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Grid className="w-5 h-5" />
              <span>Cartes</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                viewMode === 'list' 
                  ? 'bg-white text-primary font-bold shadow' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <List className="w-5 h-5" />
              <span>Liste</span>
            </button>
          </div>
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
        ) : viewMode === 'list' ? (
          /* Vue Liste (compacte en ligne) */
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">N° Commande</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Client</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Heure de récupération</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Montant</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Paiement</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowDetailModal(true);
                    }}
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-lg text-primary">#{order.order_number || order.id?.slice(0, 8)}</div>
                      <div className="text-xs text-gray-500">{formatDate(order.created_at)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800">
                        {order.customer_name || order.customer_email || 'Client'}
                      </div>
                      {order.customer_phone && (
                        <div className="text-sm text-gray-500">{order.customer_phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800">
                        {order.pickup_time || order.delivery_time || 'Dès que possible'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {order.order_type === 'delivery' ? (
                        <span className="flex items-center gap-1 text-blue-600 font-semibold">
                          <Truck className="w-4 h-4" />
                          Livraison
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-purple-600 font-semibold">
                          <Package className="w-4 h-4" />
                          À emporter
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xl font-black text-gray-800">{order.total.toFixed(2)}€</div>
                    </td>
                    <td className="px-6 py-4">
                      {order.payment_status === 'paid' ? (
                        <span className="flex items-center gap-2 text-green-600 font-semibold">
                          <CheckCircle className="w-4 h-4" />
                          Payé
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 text-orange-600 font-semibold">
                          <Clock className="w-4 h-4" />
                          En attente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
                        {/* Bouton ÉTAPE SUIVANTE - Prominent et automatique */}
                        {getNextStatus(order.status, order.order_type) && (
                          <Button
                            size="sm"
                            onClick={(e) => handleNextStep(order, e)}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold hover:from-green-600 hover:to-emerald-700 shadow-md whitespace-nowrap"
                            title={`Passer à: ${getNextStatusLabel(order.status, order.order_type)}`}
                          >
                            ▶️ ÉTAPE SUIVANTE
                          </Button>
                        )}
                        
                        {/* Autres actions */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => printOrder(order)}
                          className="border-blue-500 text-blue-600 hover:bg-blue-50"
                          title="Imprimer"
                        >
                          <Printer className="w-4 h-4" />
                        </Button>
                        {order.payment_status !== 'paid' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowPaymentModal(true);
                            }}
                            className="border-green-500 text-green-600 hover:bg-green-50"
                            title="Paiement"
                          >
                            <CreditCard className="w-4 h-4" />
                          </Button>
                        )}
                        {order.payment_status === 'paid' && order.status !== 'canceled' && order.status !== 'completed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowRefundModal(true);
                            }}
                            className="border-purple-500 text-purple-600 hover:bg-purple-50"
                            title="Remboursement partiel"
                          >
                            <DollarSign className="w-4 h-4" />
                          </Button>
                        )}
                        {order.status !== 'canceled' && order.status !== 'completed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowCancellationModal(true);
                            }}
                            className="border-red-500 text-red-600 hover:bg-red-50"
                            title="Annuler"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Vue Cartes (détaillée) */
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
                          <p className="font-semibold text-gray-800">
                            <span className="inline-block bg-primary text-white px-2 py-0.5 rounded-full text-sm font-bold mr-2">
                              x{item.quantity}
                            </span>
                            {item.name}
                          </p>
                          {item.notes && (
                            <p className="text-xs text-gray-500 ml-12">📝 {item.notes}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-800">{item.total_price?.toFixed(2)}€</p>
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

                  {/* Raison d'annulation (si annulée) */}
                  {order.status === 'canceled' && order.cancellation_reason && (
                    <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-red-800">Raison d'annulation:</p>
                          <p className="text-sm text-red-700 mt-1">{order.cancellation_reason}</p>
                        </div>
                      </div>
                    </div>
                  )}

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
                        {/* Boutons actions paiement */}
                        <div className="space-y-2">
                          {!['online'].includes(order.payment_method) && (
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
                          {order.status !== 'canceled' && order.status !== 'completed' && (
                            <Button
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowRefundModal(true);
                              }}
                              variant="outline"
                              size="sm"
                              className="w-full border border-purple-300 text-purple-600 hover:bg-purple-50 text-xs"
                            >
                              <DollarSign className="w-3 h-3 mr-1" />
                              Remboursement partiel
                            </Button>
                          )}
                        </div>
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
                      {getNextStatus(order.status, order.order_type) && (
                        <Button
                          onClick={() => requestStatusChange(order.id, order.status, getNextStatus(order.status, order.order_type))}
                          className="flex-1 py-4 text-lg font-bold"
                        >
                          {getNextStatus(order.status, order.order_type) === 'in_preparation' && '🔥 EN COURS DE PREPARATION'}
                          {getNextStatus(order.status, order.order_type) === 'ready' && '✅ PRETE'}
                          {getNextStatus(order.status, order.order_type) === 'out_for_delivery' && '🚚 PARTI POUR LA LIVRAISON'}
                          {getNextStatus(order.status, order.order_type) === 'completed' && (order.status === 'out_for_delivery' ? '📦 LIVREE' : '🎉 TERMINE')}
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

      {/* Modal Remboursement Partiel */}
      <RefundModal
        isOpen={showRefundModal}
        onClose={() => {
          setShowRefundModal(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
        onSuccess={() => {
          loadOrders();
          setShowRefundModal(false);
          setSelectedOrder(null);
        }}
      />

      {/* Modal Confirmation Changement Statut */}
      <ConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => {
          setShowConfirmationModal(false);
          setPendingStatusChange(null);
        }}
        onConfirm={updateOrderStatus}
        title={pendingStatusChange ? getStatusChangeConfirmation(pendingStatusChange.currentStatus, pendingStatusChange.newStatus).title : ''}
        message={pendingStatusChange ? getStatusChangeConfirmation(pendingStatusChange.currentStatus, pendingStatusChange.newStatus).message : ''}
        confirmText={pendingStatusChange ? getStatusChangeConfirmation(pendingStatusChange.currentStatus, pendingStatusChange.newStatus).confirmText : 'Confirmer'}
        type={pendingStatusChange ? getStatusChangeConfirmation(pendingStatusChange.currentStatus, pendingStatusChange.newStatus).type : 'warning'}
      />

      {/* Modal Détail Commande (Vue Liste) */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Commande #{selectedOrder.order_number || selectedOrder.id?.slice(0, 8)}
                </h2>
                <p className="text-sm text-gray-500">{formatDate(selectedOrder.created_at)}</p>
              </div>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedOrder(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="w-8 h-8" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Client */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-bold text-gray-600 mb-2">👤 Client</h3>
                <p className="font-bold text-lg text-gray-800">{selectedOrder.customer_name || 'Client'}</p>
                {selectedOrder.customer_email && (
                  <p className="text-sm text-gray-600">📧 {selectedOrder.customer_email}</p>
                )}
                {selectedOrder.customer_phone && (
                  <p className="text-sm text-gray-600">📱 {selectedOrder.customer_phone}</p>
                )}
              </div>

              {/* Type & Heure */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="text-sm font-bold text-gray-600 mb-2">📦 Type</h3>
                  {selectedOrder.order_type === 'delivery' ? (
                    <span className="flex items-center gap-2 text-blue-600 font-bold">
                      <Truck className="w-5 h-5" />
                      Livraison
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-purple-600 font-bold">
                      <Package className="w-5 h-5" />
                      À emporter
                    </span>
                  )}
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="text-sm font-bold text-gray-600 mb-2">🕐 Heure</h3>
                  <p className="font-bold text-gray-800">
                    {selectedOrder.pickup_time || selectedOrder.delivery_time || 'Dès que possible'}
                  </p>
                </div>
              </div>

              {/* Articles */}
              <div>
                <h3 className="text-sm font-bold text-gray-600 mb-3">🍽️ Articles commandés</h3>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">
                          <span className="inline-block bg-primary text-white px-3 py-1 rounded-full text-sm font-bold mr-2">
                            x{item.quantity}
                          </span>
                          {item.name}
                        </p>
                        {item.notes && (
                          <p className="text-xs text-gray-500 mt-1 ml-14">📝 {item.notes}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-800">{item.total_price?.toFixed(2)}€</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="text-sm font-bold text-gray-600 mb-2">📝 Notes</h3>
                  <p className="text-gray-800">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Paiement */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-sm font-bold text-gray-600 mb-2">💳 Paiement</h3>
                <div className="flex items-center justify-between">
                  <div>
                    {selectedOrder.payment_status === 'paid' ? (
                      <span className="flex items-center gap-2 text-green-600 font-bold">
                        <CheckCircle className="w-5 h-5" />
                        Payé ({selectedOrder.payment_method})
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-orange-600 font-bold">
                        <Clock className="w-5 h-5" />
                        En attente
                      </span>
                    )}
                  </div>
                  <div className="text-3xl font-black text-gray-800">
                    {selectedOrder.total.toFixed(2)}€
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4 border-t">
                <Button
                  onClick={() => printOrder(selectedOrder)}
                  variant="outline"
                  className="flex-1 border-2 border-blue-500 text-blue-600 hover:bg-blue-50 py-3"
                >
                  <Printer className="w-5 h-5 mr-2" />
                  Imprimer
                </Button>
                {selectedOrder.payment_status !== 'paid' && (
                  <Button
                    onClick={() => {
                      setShowDetailModal(false);
                      setShowPaymentModal(true);
                    }}
                    className="flex-1 py-3"
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    Enregistrer paiement
                  </Button>
                )}
              </div>

              {/* Changement de statut */}
              {getNextStatus(selectedOrder.status, selectedOrder.order_type) && (
                <Button
                  onClick={() => {
                    requestStatusChange(selectedOrder.id, selectedOrder.status, getNextStatus(selectedOrder.status, selectedOrder.order_type));
                    setShowDetailModal(false);
                  }}
                  className="w-full py-4 text-lg font-bold"
                >
                  {getNextStatus(selectedOrder.status, selectedOrder.order_type) === 'in_preparation' && '🔥 PASSER EN PRÉPARATION'}
                  {getNextStatus(selectedOrder.status, selectedOrder.order_type) === 'ready' && '✅ MARQUER COMME PRÊTE'}
                  {getNextStatus(selectedOrder.status, selectedOrder.order_type) === 'out_for_delivery' && '🚚 PARTI POUR LA LIVRAISON'}
                  {getNextStatus(selectedOrder.status, selectedOrder.order_type) === 'completed' && '🎉 MARQUER COMME TERMINÉE'}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
