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
          <Button><Plus className="w-4 h-4 mr-2" />Créer une promo</Button>
        </div>

        {promos.length === 0 ? (
          <Card className="text-center py-12">
            <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucune promotion - Créez-en une ou utilisez l'IA pour générer des suggestions !</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promos.map((promo) => (
              <Card key={promo.id}>
                <h4 className="font-bold text-lg mb-2">{promo.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{promo.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-primary">
                    {promo.discount_type === 'percentage' ? `${promo.discount_value}%` : `${promo.discount_value}€`}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${promo.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {promo.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
