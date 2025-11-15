import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { CustomerDetailModal } from '../components/CustomerDetailModal';
import { customersAPI } from '../services/api';
import { Users, Download, Eye } from 'lucide-react';

export const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const response = await customersAPI.getAll();
      setCustomers(response.data.customers || []);
    } catch (error) {
      console.error('Failed to load customers:', error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (customers.length === 0) {
      alert('Aucun client à exporter');
      return;
    }

    // Créer les en-têtes CSV
    const headers = ['Nom', 'Email', 'Téléphone', 'Adresse', 'Total dépensé', 'Nombre de commandes', 'Points fidélité'];
    
    // Créer les lignes de données
    const rows = customers.map(customer => [
      customer.name || '',
      customer.email || '',
      customer.phone || '',
      customer.address || '',
      (customer.total_spent || 0).toFixed(2),
      customer.total_orders || 0,
      (customer.loyalty_points || 0).toFixed(2)
    ]);
    
    // Combiner en-têtes et données
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Créer le blob et télécharger
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `clients_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div><Header title="Clients" /><div className="p-8">Chargement...</div></div>;

  return (
    <div>
      <Header title="Clients & Fidélité" />
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">{customers.length} clients</h3>
          <Button variant="outline"><Download className="w-4 h-4 mr-2" />Exporter CSV</Button>
        </div>

        {customers.length === 0 ? (
          <Card className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun client enregistré</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {customers.map((customer) => (
              <Card 
                key={customer.id} 
                className="flex items-center justify-between p-4 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedCustomer(customer);
                  setShowDetailModal(true);
                }}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl">
                    {customer.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{customer.name || 'Client inconnu'}</h4>
                    <p className="text-sm text-gray-600">{customer.email}</p>
                    {customer.phone && (
                      <p className="text-xs text-gray-500 mt-1">📱 {customer.phone}</p>
                    )}
                    {customer.address && (
                      <p className="text-xs text-gray-500 mt-1">📍 {customer.address}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-black text-primary">
                      {(customer.total_spent || 0).toFixed(2)}€
                    </p>
                    <p className="text-sm text-gray-500">
                      {customer.total_orders || 0} commandes
                    </p>
                    <p className="text-xs text-green-600 font-semibold mt-1">
                      💰 {(customer.loyalty_points || 0).toFixed(2)}€ fidélité
                    </p>
                  </div>
                  <Eye className="w-5 h-5 text-gray-400" />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal de détails */}
      <CustomerDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        customer={selectedCustomer}
      />
    </div>
  );
};
