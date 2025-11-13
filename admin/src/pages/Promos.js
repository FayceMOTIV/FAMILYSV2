import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { PromoModal } from '../components/PromoModal';
import { promosAPI } from '../services/api';
import { Plus, Tag, Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

export const Promos = () => {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);

  useEffect(() => {
    loadPromos();
  }, []);

  const loadPromos = async () => {
    try {
      const response = await promosAPI.getAll();
      setPromos(response.data.promos || response.data || []);
    } catch (error) {
      console.error('Failed to load promos:', error);
      setPromos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette promotion ?')) return;
    
    try {
      await promosAPI.delete(id);
      loadPromos();
    } catch (error) {
      alert('❌ Erreur lors de la suppression');
    }
  };

  const handleToggle = async (promo) => {
    try {
      const API_URL = process.env.REACT_APP_BACKEND_URL || '';
      await fetch(`${API_URL}/api/v1/admin/promos/${promo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !promo.is_active })
      });
      loadPromos();
    } catch (error) {
      alert('❌ Erreur lors de la mise à jour');
    }
  };

  if (loading) return <div><Header title="Promos & Offres" /><div className="p-8">Chargement...</div></div>;

  return (
    <div>
      <Header title="Promos & Offres" />
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">{promos.length} promotions</h3>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Créer une promo
          </Button>
        </div>

        {promos.length === 0 ? (
          <Card className="text-center py-12">
            <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucune promotion - Créez-en une ou utilisez l'IA pour générer des suggestions !</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {promos.map((promo) => (
              <Card key={promo.id} className={`${
                promo.is_active 
                  ? 'border-2 border-green-500 bg-green-50' 
                  : 'border-2 border-red-300 bg-red-50'
              }`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <code className={`text-lg font-bold px-3 py-1 rounded ${
                        promo.is_active ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                      }`}>
                        {promo.code}
                      </code>
                      <span className={`text-xs font-bold px-3 py-1 rounded ${
                        promo.is_active ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                      }`}>
                        {promo.is_active ? '✅ ACTIVE' : '❌ INACTIVE'}
                      </span>
                    </div>
                    <h4 className={`font-medium ${
                      promo.is_active ? 'text-green-900' : 'text-red-900'
                    }`}>{promo.description}</h4>
                  </div>
                  <span className={`text-2xl font-black ${
                    promo.is_active ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {promo.discount_type === 'percentage' ? `${promo.discount_value}%` : `${promo.discount_value}€`}
                  </span>
                </div>
                
                <div className="text-xs text-gray-500 space-y-1 mb-4">
                  {promo.min_order_amount > 0 && (
                    <div>💰 Commande minimum: {promo.min_order_amount}€</div>
                  )}
                  {promo.usage_count !== undefined && (
                    <div>📊 Utilisations: {promo.usage_count}</div>
                  )}
                  {promo.valid_until && (
                    <div>📅 Valide jusqu'au: {new Date(promo.valid_until).toLocaleDateString('fr-FR')}</div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleToggle(promo)}
                    className="flex-1"
                  >
                    {promo.is_active ? <ToggleRight className="w-4 h-4 mr-1" /> : <ToggleLeft className="w-4 h-4 mr-1" />}
                    {promo.is_active ? 'Désactiver' : 'Activer'}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      setEditingPromo(promo);
                      setShowModal(true);
                    }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="danger" 
                    onClick={() => handleDelete(promo.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <PromoModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingPromo(null);
        }}
        promo={editingPromo}
        onSuccess={loadPromos}
      />
    </div>
  );
};
