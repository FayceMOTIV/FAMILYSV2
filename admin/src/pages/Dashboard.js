import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { dashboardAPI } from '../services/api';
import { 
  Euro, 
  ShoppingCart, 
  TrendingUp, 
  AlertTriangle,
  CreditCard,
  Banknote
} from 'lucide-react';

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await dashboardAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Header title="Tableau de bord" />
        <div className="p-8">
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Tableau de bord" />
      <div className="p-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-semibold">CA Aujourd'hui</p>
                <p className="text-3xl font-black text-primary mt-2">
                  {stats?.ca_today?.toFixed(2) || '0.00'}€
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Euro className="w-6 h-6 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-semibold">Commandes</p>
                <p className="text-3xl font-black text-blue-600 mt-2">
                  {stats?.orders_today || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-semibold">Panier moyen</p>
                <p className="text-3xl font-black text-green-600 mt-2">
                  {stats?.orders_today > 0 
                    ? (stats.ca_today / stats.orders_today).toFixed(2)
                    : '0.00'
                  }€
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-semibold">Alertes</p>
                <p className="text-3xl font-black text-orange-600 mt-2">
                  {stats?.alerts?.out_of_stock_count || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Répartition paiements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats?.payment_breakdown || {}).map(([method, amount]) => (
                  <div key={method} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {method === 'card' && <CreditCard className="w-5 h-5 text-gray-600" />}
                      {method === 'cash' && <Banknote className="w-5 h-5 text-gray-600" />}
                      <span className="font-semibold text-gray-700 capitalize">{method}</span>
                    </div>
                    <span className="font-bold text-gray-900">{amount.toFixed(2)}€</span>
                  </div>
                ))}
                {Object.keys(stats?.payment_breakdown || {}).length === 0 && (
                  <p className="text-gray-500 text-center py-4">Aucune vente aujourd'hui</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top 5 produits (7 jours)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.top_products?.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.quantity} ventes</p>
                    </div>
                    <span className="font-bold text-primary">{product.revenue.toFixed(2)}€</span>
                  </div>
                ))}
                {(!stats?.top_products || stats.top_products.length === 0) && (
                  <p className="text-gray-500 text-center py-4">Aucune vente cette semaine</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
