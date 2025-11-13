import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { customersAPI } from '../services/api';
import { Users, Download } from 'lucide-react';

export const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

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
              <Card key={customer.id} className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold">{customer.name}</h4>
                  <p className="text-sm text-gray-600">{customer.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-primary">{customer.total_spent.toFixed(2)}€</p>
                  <p className="text-sm text-gray-500">{customer.total_orders} commandes</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
