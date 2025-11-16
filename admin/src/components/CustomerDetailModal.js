import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { X, MapPin, Phone, Mail, Calendar, ShoppingBag, TrendingUp } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://foodapp-redesign.preview.emergentagent.com';

export const CustomerDetailModal = ({ isOpen, onClose, customer }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && customer) {
      loadCustomerOrders();
    }
  }, [isOpen, customer]);

  const loadCustomerOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/v1/admin/orders?customer_id=${customer.id}`);
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  if (!customer) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Détails client: ${customer.name || 'Client inconnu'}`}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Informations principales */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold text-3xl mx-auto mb-4">
              {customer.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <h3 className="text-xl font-bold text-center mb-2">{customer.name}</h3>
            <p className="text-gray-600 text-center text-sm">Client #{customer.id?.slice(0, 8)}</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium">{customer.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Phone className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-xs text-gray-500">Téléphone</p>
                <p className="font-medium">{customer.phone || 'Non renseigné'}</p>
              </div>
            </div>
            {customer.address && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <MapPin className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-500">Adresse</p>
                  <p className="font-medium">{customer.address}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <ShoppingBag className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">{customer.total_orders || 0}</p>
            <p className="text-xs text-gray-600">Commandes</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">{(customer.total_spent || 0).toFixed(2)}€</p>
            <p className="text-xs text-gray-600">Total dépensé</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <span className="text-2xl">💰</span>
            <p className="text-2xl font-bold text-purple-600">{(customer.loyalty_points || 0).toFixed(2)}€</p>
            <p className="text-xs text-gray-600">Points fidélité</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <Calendar className="w-6 h-6 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-orange-600">
              {customer.total_orders > 0 ? Math.round((customer.total_spent || 0) / customer.total_orders) : 0}€
            </p>
            <p className="text-xs text-gray-600">Panier moyen</p>
          </div>
        </div>

        {/* Historique des commandes */}
        <div>
          <h4 className="font-bold text-lg mb-3">Historique des commandes</h4>
          {loading ? (
            <p className="text-center py-4 text-gray-500">Chargement...</p>
          ) : orders.length === 0 ? (
            <p className="text-center py-8 text-gray-400">Aucune commande</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {orders.slice(0, 10).map((order) => (
                <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <div>
                    <p className="font-medium">Commande #{order.order_number || order.id?.slice(0, 8)}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('fr-FR')} - {order.status}
                    </p>
                  </div>
                  <p className="font-bold text-lg">{(order.total_amount || 0).toFixed(2)}€</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bouton fermer */}
        <div className="flex justify-end">
          <Button onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>
    </Modal>
  );
};
