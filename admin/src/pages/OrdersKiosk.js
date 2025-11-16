import React, { useState, useEffect } from 'react';
import { Clock, Truck, CheckCircle, Package, Printer, XCircle } from 'lucide-react';
import axios from 'axios';
import useNotificationSound from '../hooks/useNotificationSound';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://react-reborn.preview.emergentagent.com';

export const OrdersKiosk = () => {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('new');
  const [previousNewOrdersCount, setPreviousNewOrdersCount] = useState(0);

  const { playNotificationSound } = useNotificationSound();

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const newOrdersCount = orders.filter(o => o.status === 'new').length;
    if (newOrdersCount > previousNewOrdersCount && previousNewOrdersCount > 0) {
      playNotificationSound();
    }
    setPreviousNewOrdersCount(newOrdersCount);
  }, [orders]);

  const loadOrders = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/admin/orders`);
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
      await axios.patch(`${API_URL}/api/v1/admin/orders/${orderId}/status`, { status: newStatus });
    } catch (error) {
      console.error('Error updating order:', error);
      loadOrders();
    }
  };

  const printOrder = (order) => {
    // Logique d'impression simplifiée
    const printContent = `
COMMANDE #${order.order_number || order.id?.slice(0, 8)}
${new Date(order.created_at).toLocaleString('fr-FR')}
-----------------------------------
${order.items?.map(item => `${item.quantity}x ${item.name}`).join('\n')}
-----------------------------------
TOTAL: ${order.total.toFixed(2)}€
${order.notes ? `\nNOTES: ${order.notes}` : ''}
    `;
    
    const printWindow = window.open('', '', 'width=300,height=600');
    printWindow.document.write(`<pre style="font-family: monospace; font-size: 12px;">${printContent}</pre>`);
    printWindow.print();
    printWindow.close();
  };

  const tabs = [
    { id: 'new', label: 'Nouvelles', icon: Package, status: 'new', color: 'bg-red-500' },
    { id: 'in_preparation', label: 'En cours', icon: Clock, status: 'in_preparation', color: 'bg-orange-500' },
    { id: 'ready', label: 'Prêtes', icon: CheckCircle, status: 'ready', color: 'bg-green-500' },
  ];

  const filteredOrders = orders.filter(o => o.status === tabs.find(t => t.id === activeTab)?.status);

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Header simple */}
      <div className="bg-white shadow-md p-4">
        <h1 className="text-3xl font-black text-center">🍔 COMMANDES EN DIRECT</h1>
      </div>

      {/* Onglets grands */}
      <div className="flex p-4 gap-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const count = orders.filter(o => o.status === tab.status).length;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 p-8 rounded-2xl shadow-lg transition-all transform ${
                activeTab === tab.id 
                  ? `${tab.color} text-white scale-105` 
                  : 'bg-white text-gray-700 hover:scale-102'
              }`}
            >
              <Icon className="w-16 h-16 mx-auto mb-4" />
              <div className="text-2xl font-bold">{tab.label}</div>
              <div className="text-5xl font-black mt-2">{count}</div>
            </button>
          );
        })}
      </div>

      {/* Liste des commandes en grand */}
      <div className="flex-1 overflow-auto p-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-2xl">
            Aucune commande
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-3xl shadow-xl p-6 border-4 border-gray-200">
                {/* En-tête de la commande */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b-4 border-gray-200">
                  <div>
                    <div className="text-4xl font-black text-primary">
                      #{order.order_number || order.id?.slice(0, 8)}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {new Date(order.created_at).toLocaleTimeString('fr-FR')}
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-full ${
                    order.order_type === 'delivery' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-purple-100 text-purple-700'
                  } font-bold text-lg`}>
                    {order.order_type === 'delivery' ? (
                      <><Truck className="w-5 h-5 inline mr-1" /> Livraison</>
                    ) : (
                      <><Package className="w-5 h-5 inline mr-1" /> À emporter</>
                    )}
                  </div>
                </div>

                {/* Articles */}
                <div className="mb-6">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="mb-3 p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <span className="inline-block bg-primary text-white px-3 py-1 rounded-full text-lg font-bold mr-2">
                            x{item.quantity}
                          </span>
                          <span className="text-xl font-bold">{item.name}</span>
                        </div>
                      </div>
                      {item.notes && (
                        <div className="mt-2 ml-12 text-sm text-gray-600 bg-yellow-50 p-2 rounded">
                          📝 {item.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Notes de commande */}
                {order.notes && (
                  <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                    <p className="font-bold text-yellow-800 mb-1">📝 Notes:</p>
                    <p className="text-yellow-700">{order.notes}</p>
                  </div>
                )}

                {/* Total */}
                <div className="mb-6 text-center p-4 bg-gray-100 rounded-xl">
                  <div className="text-sm text-gray-600">TOTAL</div>
                  <div className="text-4xl font-black text-primary">{order.total.toFixed(2)}€</div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => printOrder(order)}
                    className="py-4 px-6 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all"
                  >
                    <Printer className="w-6 h-6" />
                    Imprimer
                  </button>
                  
                  {activeTab === 'new' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'in_preparation')}
                      className="py-4 px-6 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-lg transition-all"
                    >
                      🔥 EN COURS
                    </button>
                  )}
                  
                  {activeTab === 'in_preparation' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'ready')}
                      className="py-4 px-6 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-lg transition-all"
                    >
                      ✅ PRÊTE
                    </button>
                  )}
                  
                  {activeTab === 'ready' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'completed')}
                      className="py-4 px-6 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-bold text-lg transition-all"
                    >
                      🎉 TERMINÉE
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
