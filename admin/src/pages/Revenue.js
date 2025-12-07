import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Card, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { DollarSign, TrendingUp, CreditCard, Wallet, Smartphone, Calendar, Printer } from 'lucide-react';
import { ordersAPI } from '../services/api';

export const Revenue = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('today');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    cash: 0,
    card_restaurant: 0,
    ticket_resto: 0,
    check: 0,
    online: 0,
    orderCount: 0
  });

  useEffect(() => {
    loadRevenue();
  }, [dateRange, customStartDate, customEndDate]);

  const loadRevenue = async () => {
    setLoading(true);
    try {
      const response = await ordersAPI.getAll();
      const allOrders = response.data?.orders || [];
      
      // Filtrer par statut et paiement
      const paidOrders = allOrders.filter(o => 
        o.payment_status === 'paid' && 
        ['completed', 'ready', 'in_preparation', 'out_for_delivery'].includes(o.status)
      );
      
      // Filtrer par date
      const filteredOrders = filterOrdersByDate(paidOrders);
      
      // Calculer les stats
      calculateStats(filteredOrders);
      setOrders(filteredOrders);
    } catch (error) {
      console.error('Error loading revenue:', error);
      setOrders([]);
      setStats({
        total: 0,
        cash: 0,
        card_restaurant: 0,
        ticket_resto: 0,
        check: 0,
        online: 0,
        orderCount: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const filterOrdersByDate = (orders) => {
    if (!orders || orders.length === 0) return [];
    
    const now = new Date();
    let startDate, endDate;

    switch (dateRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        break;
      case 'yesterday':
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        startDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0);
        endDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59);
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        endDate = new Date();
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
        endDate = new Date();
        break;
      case 'custom':
        if (!customStartDate || !customEndDate) return orders;
        startDate = new Date(customStartDate);
        endDate = new Date(customEndDate);
        endDate.setHours(23, 59, 59, 999);
        break;
      default:
        return orders;
    }

    return orders.filter(order => {
      const orderDate = new Date(order.created_at);
      return orderDate >= startDate && orderDate <= endDate;
    });
  };

  const calculateStats = (orders) => {
    const newStats = {
      total: 0,
      cash: 0,
      card_restaurant: 0,
      ticket_resto: 0,
      check: 0,
      online: 0,
      orderCount: orders?.length || 0
    };

    if (!orders || orders.length === 0) {
      setStats(newStats);
      return;
    }

    orders.forEach(order => {
      const amount = order.total || 0;
      newStats.total += amount;

      const isPaidOnline = order.payment_status === 'paid';
      const method = order.payment_method?.toLowerCase() || 'cash';

      if (isPaidOnline) {
        newStats.online += amount;
      } else {
        if (method === 'cash' || method === 'espece') {
          newStats.cash += amount;
        } else if (method === 'card' || method === 'cb' || method === 'card_restaurant') {
          newStats.card_restaurant += amount;
        } else if (method === 'ticket_resto' || method === 'ticket_restaurant') {
          newStats.ticket_resto += amount;
        } else if (method === 'check' || method === 'cheque') {
          newStats.check += amount;
        } else {
          newStats.card_restaurant += amount;
        }
      }
    });

    setStats(newStats);
  };

  const dateRangeOptions = [
    { value: 'today', label: "Aujourd'hui" },
    { value: 'yesterday', label: 'Hier' },
    { value: 'week', label: '7 derniers jours' },
    { value: 'month', label: '30 derniers jours' },
    { value: 'custom', label: 'Période personnalisée' }
  ];

  const paymentMethods = [
    { key: 'online', label: 'Paiement en ligne', icon: Smartphone, color: 'purple', amount: stats.online || 0 },
    { key: 'card_restaurant', label: 'CB (restaurant)', icon: CreditCard, color: 'blue', amount: stats.card_restaurant || 0 },
    { key: 'ticket_resto', label: 'Ticket restaurant', icon: Wallet, color: 'orange', amount: stats.ticket_resto || 0 },
    { key: 'check', label: 'Chèque bancaire', icon: CreditCard, color: 'indigo', amount: stats.check || 0 },
    { key: 'cash', label: 'Espèce', icon: Wallet, color: 'green', amount: stats.cash || 0 }
  ];

  if (loading) {
    return (
      <div>
        <Header title="💰 Chiffre d'Affaires" subtitle="Analysez vos revenus" />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="💰 Chiffre d'Affaires" subtitle="Analysez vos revenus" />
      
      <div className="p-6 space-y-6">
        {/* Filtres de date */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4 flex-wrap">
              <Calendar className="w-5 h-5 text-gray-600" />
              <div className="flex gap-2 flex-wrap flex-1">
                {dateRangeOptions.map(option => (
                  <Button
                    key={option.value}
                    size="sm"
                    variant={dateRange === option.value ? 'primary' : 'outline'}
                    onClick={() => setDateRange(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {dateRange === 'custom' && (
              <div className="flex gap-4 mt-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Date début</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Date fin</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Total CA */}
        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-1">Chiffre d'Affaires Total</p>
                <p className="text-5xl font-black">{(stats.total || 0).toFixed(2)}€</p>
                <p className="text-green-100 text-sm mt-2">{stats.orderCount || 0} commandes</p>
              </div>
              <DollarSign className="w-20 h-20 text-white/30" />
            </div>
          </CardContent>
        </Card>

        {/* Répartition par mode de paiement */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {paymentMethods.map(method => {
            const Icon = method.icon;
            const percentage = stats.total > 0 ? ((method.amount || 0) / stats.total * 100) : 0;
            
            return (
              <Card key={method.key}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Icon className={`w-8 h-8 text-${method.color}-500`} />
                    <span className={`text-xs font-bold px-2 py-1 rounded-full bg-${method.color}-100 text-${method.color}-700`}>
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{method.label}</p>
                  <p className="text-2xl font-black text-gray-800">{(method.amount || 0).toFixed(2)}€</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Message si pas de données */}
        {orders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Aucune commande pour cette période</p>
              <p className="text-gray-400 text-sm mt-2">Les revenus s'afficheront ici quand vous aurez des commandes</p>
            </CardContent>
          </Card>
        ) : (
          /* Tableau détaillé */
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">N° Commande</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Client</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Mode Paiement</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase">Montant</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orders.map(order => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {new Date(order.created_at).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold text-primary">
                            #{order.order_number || order.id?.slice(0, 8)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {order.customer_name || 'Client'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                            {order.payment_method || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="text-lg font-black text-gray-800">
                            {(order.total || 0).toFixed(2)}€
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
