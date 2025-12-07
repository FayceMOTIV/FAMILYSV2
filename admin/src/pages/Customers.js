import React, { useState, useEffect, useMemo } from 'react';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { CustomerDetailModal } from '../components/CustomerDetailModal';
import { customersAPI } from '../services/api';
import { Users, Download, Eye, Search, ArrowUpDown, TrendingUp, ShoppingBag, Calendar } from 'lucide-react';

export const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const response = await customersAPI.getAll(500);
      setCustomers(response.data.customers || []);
    } catch (error) {
      console.error('Failed to load customers:', error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  // Calcul des stats globales
  const globalStats = useMemo(() => {
    const total = customers.length;
    const totalRevenue = customers.reduce((sum, c) => sum + (c.total_spent || 0), 0);
    const totalOrders = customers.reduce((sum, c) => sum + (c.order_count || c.total_orders || 0), 0);
    const avgPerCustomer = total > 0 ? totalRevenue / total : 0;
    
    // Clients actifs (commande dans les 30 derniers jours)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeCustomers = customers.filter(c => {
      if (!c.last_order_at) return false;
      const lastOrder = new Date(c.last_order_at);
      return lastOrder >= thirtyDaysAgo;
    }).length;

    return { total, totalRevenue, totalOrders, avgPerCustomer, activeCustomers };
  }, [customers]);

  // Filtrage et tri
  const filteredCustomers = useMemo(() => {
    let result = [...customers];
    
    // Recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(c => 
        (c.name || '').toLowerCase().includes(term) ||
        (c.email || '').toLowerCase().includes(term) ||
        (c.phone || '').includes(term)
      );
    }
    
    // Tri
    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      // Gérer les dates
      if (sortField === 'created_at' || sortField === 'last_order_at') {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      }
      
      // Gérer les nombres
      if (typeof aVal === 'number' || sortField === 'total_spent' || sortField === 'order_count') {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      }
      
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });
    
    return result;
  }, [customers, searchTerm, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getMonthlyAverage = (customer) => {
    if (!customer.created_at || !customer.total_spent) return 0;
    const created = new Date(customer.created_at);
    const now = new Date();
    const months = Math.max(1, (now.getFullYear() - created.getFullYear()) * 12 + (now.getMonth() - created.getMonth()) + 1);
    return (customer.total_spent / months).toFixed(2);
  };

  const handleExportCSV = () => {
    if (filteredCustomers.length === 0) {
      alert('Aucun client à exporter');
      return;
    }

    const headers = [
      'Nom', 'Prénom', 'Email', 'Téléphone', 'Adresse', 
      'Date inscription', 'Dernière commande', 
      'Nb commandes', 'Total dépensé (€)', 'Moyenne/mois (€)', 'Fidélité (€)'
    ];
    
    const rows = filteredCustomers.map(customer => [
      customer.last_name || customer.name?.split(' ').pop() || '',
      customer.first_name || customer.name?.split(' ')[0] || '',
      customer.email || '',
      customer.phone || '',
      customer.address || '',
      formatDate(customer.created_at),
      formatDate(customer.last_order_at),
      customer.order_count || customer.total_orders || 0,
      (customer.total_spent || 0).toFixed(2),
      getMonthlyAverage(customer),
      (customer.loyalty_balance || customer.loyalty_points || 0).toFixed(2)
    ]);
    
    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(';'))
    ].join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `clients_familys_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) return <div><Header title="Clients" /><div className="p-8">Chargement...</div></div>;

  return (
    <div>
      <Header title="Clients & Fidélité" />
      <div className="p-8">
        
        {/* Stats globales */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card className="p-4 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <p className="text-3xl font-black text-gray-800">{globalStats.total}</p>
            <p className="text-sm text-gray-500">Clients total</p>
          </Card>
          <Card className="p-4 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="text-3xl font-black text-gray-800">{globalStats.activeCustomers}</p>
            <p className="text-sm text-gray-500">Actifs (30j)</p>
          </Card>
          <Card className="p-4 text-center">
            <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <p className="text-3xl font-black text-gray-800">{globalStats.totalOrders}</p>
            <p className="text-sm text-gray-500">Commandes</p>
          </Card>
          <Card className="p-4 text-center">
            <span className="text-3xl">💰</span>
            <p className="text-3xl font-black text-primary">{globalStats.totalRevenue.toFixed(0)}€</p>
            <p className="text-sm text-gray-500">CA Total</p>
          </Card>
          <Card className="p-4 text-center">
            <span className="text-3xl">📊</span>
            <p className="text-3xl font-black text-gray-800">{globalStats.avgPerCustomer.toFixed(0)}€</p>
            <p className="text-sm text-gray-500">Moy/client</p>
          </Card>
        </div>

        {/* Barre de recherche et export */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Rechercher par nom, email ou téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Exporter CSV ({filteredCustomers.length})
          </Button>
        </div>

        {filteredCustomers.length === 0 ? (
          <Card className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm ? 'Aucun client trouvé' : 'Aucun client enregistré'}
            </p>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Client
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('created_at')}
                    >
                      <div className="flex items-center gap-1">
                        Inscrit le
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('last_order_at')}
                    >
                      <div className="flex items-center gap-1">
                        Dernière cmd
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('order_count')}
                    >
                      <div className="flex items-center justify-center gap-1">
                        Cmd
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('total_spent')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Total
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Moy/mois
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Fidélité
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCustomers.map((customer) => (
                    <tr 
                      key={customer.id} 
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-red-400 flex items-center justify-center text-white font-bold">
                            {customer.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{customer.name || 'Client'}</p>
                            <p className="text-xs text-gray-500">{customer.email}</p>
                            {customer.phone && <p className="text-xs text-gray-400">{customer.phone}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(customer.created_at)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(customer.last_order_at)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                          {customer.order_count || customer.total_orders || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900">
                        {(customer.total_spent || 0).toFixed(2)}€
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-600">
                        {getMonthlyAverage(customer)}€
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                          💰 {(customer.loyalty_balance || customer.loyalty_points || 0).toFixed(2)}€
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setShowDetailModal(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      <CustomerDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        customer={selectedCustomer}
      />
    </div>
  );
};
