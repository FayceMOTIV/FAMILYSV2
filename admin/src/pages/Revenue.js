import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Card, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { DollarSign, TrendingUp, CreditCard, Wallet, Smartphone, Calendar, Printer } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://resto-hub-54.preview.emergentagent.com';

export const Revenue = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('today');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    cash: 0,
    card: 0,
    mobile: 0,
    online: 0,
    orderCount: 0
  });

  useEffect(() => {
    loadRevenue();
  }, [dateRange, customStartDate, customEndDate]);

  const loadRevenue = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/v1/admin/orders`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const allOrders = response.data.orders || [];
      
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
    } finally {
      setLoading(false);
    }
  };

  const filterOrdersByDate = (orders) => {
    const now = new Date();
    let startDate, endDate;

    switch (dateRange) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date(now.setHours(23, 59, 59, 999));
        break;
      case 'yesterday':
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        startDate = new Date(yesterday.setHours(0, 0, 0, 0));
        endDate = new Date(yesterday.setHours(23, 59, 59, 999));
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
    const stats = {
      total: 0,
      cash: 0,
      card_restaurant: 0,
      ticket_resto: 0,
      check: 0,
      online: 0,
      orderCount: orders.length
    };

    orders.forEach(order => {
      const amount = order.total || 0;
      stats.total += amount;

      // Logique de distinction :
      // 1. Si payment_status === 'paid' → Paiement en ligne (via l'app)
      // 2. Sinon → Paiement au restaurant selon la méthode
      
      const isPaidOnline = order.payment_status === 'paid';
      const method = order.payment_method?.toLowerCase() || 'cash';

      if (isPaidOnline) {
        // Tous les paiements faits via l'app vont dans "Paiement en ligne"
        stats.online += amount;
      } else {
        // Paiements au restaurant selon la méthode
        if (method === 'cash' || method === 'espece') {
          stats.cash += amount;
        } else if (method === 'card' || method === 'cb' || method === 'card_restaurant') {
          stats.card_restaurant += amount;
        } else if (method === 'ticket_resto' || method === 'ticket_restaurant') {
          stats.ticket_resto += amount;
        } else if (method === 'check' || method === 'cheque') {
          stats.check += amount;
        } else {
          // Par défaut, si méthode inconnue et non payé en ligne, on met en CB restaurant
          stats.card_restaurant += amount;
        }
      }
    });

    setStats(stats);
  };

  const dateRangeOptions = [
    { value: 'today', label: "Aujourd'hui" },
    { value: 'yesterday', label: 'Hier' },
    { value: 'week', label: '7 derniers jours' },
    { value: 'month', label: '30 derniers jours' },
    { value: 'custom', label: 'Période personnalisée' }
  ];

  const paymentMethods = [
    { key: 'online', label: 'Paiement en ligne', icon: Smartphone, color: 'purple', amount: stats.online },
    { key: 'card_restaurant', label: 'CB (restaurant)', icon: CreditCard, color: 'blue', amount: stats.card_restaurant },
    { key: 'ticket_resto', label: 'Ticket restaurant', icon: Wallet, color: 'orange', amount: stats.ticket_resto },
    { key: 'check', label: 'Chèque bancaire', icon: CreditCard, color: 'indigo', amount: stats.check },
    { key: 'cash', label: 'Espèce', icon: Wallet, color: 'green', amount: stats.cash }
  ];

  const printRevenue = () => {
    // ESC/POS commands for 80MM thermal printer
    const ESC = '\x1B';
    const GS = '\x1D';
    
    let receipt = '';
    
    // Initialize printer
    receipt += ESC + '@';
    
    // Center align + Bold + Double size
    receipt += ESC + 'a' + '\x01'; // Center
    receipt += ESC + 'E' + '\x01'; // Bold
    receipt += GS + '!' + '\x11'; // Double size
    receipt += 'CHIFFRE D\'AFFAIRES\n';
    receipt += GS + '!' + '\x00'; // Normal size
    receipt += ESC + 'E' + '\x00'; // Bold off
    receipt += '\n';
    
    // Date range
    receipt += ESC + 'a' + '\x01'; // Center
    const dateRangeLabel = dateRangeOptions.find(opt => opt.value === dateRange)?.label || 'Personnalisé';
    receipt += dateRangeLabel + '\n';
    if (dateRange === 'custom' && customStartDate && customEndDate) {
      receipt += `${customStartDate} - ${customEndDate}\n`;
    }
    receipt += '\n';
    
    // Line separator
    receipt += ESC + 'a' + '\x00'; // Left align
    receipt += '--------------------------------\n';
    
    // Total
    receipt += ESC + 'E' + '\x01'; // Bold
    receipt += GS + '!' + '\x11'; // Double size
    receipt += 'TOTAL: ' + stats.total.toFixed(2) + ' EUR\n';
    receipt += GS + '!' + '\x00'; // Normal size
    receipt += ESC + 'E' + '\x00'; // Bold off
    receipt += '--------------------------------\n\n';
    
    // Payment methods breakdown
    receipt += ESC + 'E' + '\x01'; // Bold
    receipt += 'REPARTITION PAR MOYEN:\n';
    receipt += ESC + 'E' + '\x00'; // Bold off
    receipt += '\n';
    
    paymentMethods.forEach(method => {
      if (method.amount > 0) {
        const label = method.label.padEnd(20, ' ');
        const amount = method.amount.toFixed(2).padStart(10, ' ');
        receipt += label + amount + ' EUR\n';
      }
    });
    
    receipt += '\n--------------------------------\n\n';
    
    // Number of orders
    receipt += 'Nombre de commandes: ' + filteredOrders.length + '\n';
    receipt += '\n--------------------------------\n\n';
    
    // Orders list (last 10)
    receipt += ESC + 'E' + '\x01'; // Bold
    receipt += 'DERNIERES COMMANDES:\n';
    receipt += ESC + 'E' + '\x00'; // Bold off
    receipt += '\n';
    
    const lastOrders = filteredOrders.slice(0, 10);
    lastOrders.forEach((order, index) => {
      receipt += `#${order.order_number || order.id.substring(0, 8)}\n`;
      receipt += `  ${order.customer_name || 'Client'}\n`;
      receipt += `  ${order.total.toFixed(2)} EUR\n`;
      if (index < lastOrders.length - 1) {
        receipt += '\n';
      }
    });
    
    receipt += '\n--------------------------------\n';
    
    // Footer
    receipt += ESC + 'a' + '\x01'; // Center
    receipt += '\n';
    const now = new Date();
    receipt += `Imprime le ${now.toLocaleDateString('fr-FR')} a ${now.toLocaleTimeString('fr-FR')}\n`;
    receipt += '\n\n\n';
    
    // Cut paper
    receipt += GS + 'V' + '\x41' + '\x03';
    
    // Create blob and open print dialog
    const blob = new Blob([receipt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
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
      alert('Veuillez autoriser les pop-ups pour imprimer');
    }
  };

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
                <p className="text-5xl font-black">{stats.total.toFixed(2)}€</p>
                <p className="text-green-100 text-sm mt-2">{stats.orderCount} commandes</p>
              </div>
              <DollarSign className="w-20 h-20 text-white/30" />
            </div>
          </CardContent>
        </Card>

        {/* Répartition par mode de paiement */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {paymentMethods.map(method => {
            const Icon = method.icon;
            const percentage = stats.total > 0 ? (method.amount / stats.total * 100) : 0;
            
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
                  <p className="text-2xl font-black text-gray-800">{method.amount.toFixed(2)}€</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tableau détaillé */}
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
                        <br />
                        <span className="text-xs text-gray-500">
                          {new Date(order.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-primary">
                          #{order.order_number || order.id?.slice(0, 8)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {order.customer_name || order.customer_email || 'Client'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          order.payment_method === 'cash' ? 'bg-green-100 text-green-700' :
                          order.payment_method === 'card_restaurant' ? 'bg-blue-100 text-blue-700' :
                          order.payment_method === 'online' ? 'bg-purple-100 text-purple-700' :
                          order.payment_method === 'ticket_resto' ? 'bg-orange-100 text-orange-700' :
                          order.payment_method === 'check' ? 'bg-indigo-100 text-indigo-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {order.payment_method === 'cash' ? '💵 Espèce' :
                           order.payment_method === 'card_restaurant' ? '💳 CB (restaurant)' :
                           order.payment_method === 'online' ? '🌐 Paiement en ligne' :
                           order.payment_method === 'ticket_resto' ? '🎫 Ticket Restaurant' :
                           order.payment_method === 'check' ? '📝 Chèque bancaire' :
                           order.payment_method}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-lg font-black text-gray-800">
                          {order.total.toFixed(2)}€
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                      TOTAL
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-2xl font-black text-green-600">
                        {stats.total.toFixed(2)}€
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
