import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Plus, Calendar, TrendingUp, Users, DollarSign, Edit2, Trash2, Copy, Eye } from 'lucide-react';
import { PromotionWizard } from '../components/PromotionWizard';
import { PromotionCalendar } from '../components/PromotionCalendar';
import { promotionsAPI } from '../services/api';

export const PromotionsV2 = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list');
  const [selectedPromoForPreview, setSelectedPromoForPreview] = useState(null);
  const [showWizard, setShowWizard] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [analytics, setAnalytics] = useState({
    active_promotions: 0,
    total_usage: 0,
    total_revenue: 0,
    total_discount: 0
  });

  useEffect(() => {
    loadPromotions();
  }, []);

  // FIX: Calculer analytics quand promotions change
  useEffect(() => {
    if (promotions.length > 0) {
      calculateAnalytics(promotions);
    }
  }, [promotions]);

  const loadPromotions = async () => {
    setLoading(true);
    try {
      const response = await promotionsAPI.getAll();
      const promos = response.data.promotions || [];
      setPromotions(promos);
    } catch (error) {
      console.error('Error loading promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  // FIX: Fonction qui prend les promos en paramètre
  const calculateAnalytics = (promos) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Compter les promos actives (is_active ET dans les dates valides)
    const activeCount = promos.filter(p => {
      if (!p.is_active) return false;
      
      const startDate = p.start_date || '';
      const endDate = p.end_date || '';
      
      // Vérifier les dates
      if (startDate && startDate > today) return false;
      if (endDate && endDate < today) return false;
      
      return true;
    }).length;
    
    // Total utilisations
    const totalUsage = promos.reduce((sum, p) => sum + (p.usage_count || 0), 0);
    
    // CA généré et remises (à calculer depuis les commandes idéalement)
    // Pour l'instant, estimation basée sur usage_count et discount_value
    let totalRevenue = 0;
    let totalDiscount = 0;
    
    promos.forEach(p => {
      const usage = p.usage_count || 0;
      const discountValue = p.discount_value || 0;
      
      // Estimation: chaque utilisation génère en moyenne 15€ de CA
      totalRevenue += usage * 15;
      
      // Remise donnée
      if (p.type === 'percentage' || p.type === 'conditional_discount') {
        // Estimation: panier moyen 15€ * % de remise
        totalDiscount += usage * (15 * discountValue / 100);
      } else {
        totalDiscount += usage * discountValue;
      }
    });
    
    setAnalytics({
      active_promotions: activeCount,
      total_usage: totalUsage,
      total_revenue: Math.round(totalRevenue),
      total_discount: Math.round(totalDiscount)
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette promotion ?')) return;
    
    try {
      await promotionsAPI.delete(id);
      loadPromotions();
      alert('✅ Promotion supprimée');
    } catch (error) {
      alert('❌ Erreur lors de la suppression');
    }
  };

  const handleDuplicate = async (promo) => {
    const duplicate = {
      ...promo,
      name: `${promo.name} (copie)`,
      id: undefined,
      created_at: undefined,
      updated_at: undefined,
      usage_count: 0
    };
    setEditingPromo(duplicate);
    setShowWizard(true);
  };

  const handleToggle = async (promo) => {
    try {
      await promotionsAPI.toggle(promo.id, !promo.is_active);
      loadPromotions();
    } catch (error) {
      alert('❌ Erreur lors de la mise à jour');
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      'bogo': '🎁 BOGO',
      'percentage': '% Réduction',
      'percent_item': '% Produit',
      'percent_category': '% Catégorie',
      'fixed_amount': '€ Fixe',
      'fixed_item': '€ Produit',
      'fixed_category': '€ Catégorie',
      'conditional_discount': '🔢 Conditionnelle',
      'threshold': '🎯 Seuil',
      'shipping_free': '🚚 Livraison gratuite',
      'new_customer': '✨ Nouveau client',
      'inactive_customer': '💤 Client inactif',
      'loyalty_multiplier': '⭐ Multiplicateur',
      'happy_hour': '🌅 Happy Hour',
      'flash': '⚡ Flash',
      'seasonal': '🎉 Saisonnier',
      'promo_code': '🔖 Code promo'
    };
    return labels[type] || type;
  };

  const getTypeColor = (type) => {
    const colors = {
      'bogo': 'bg-purple-100 text-purple-700',
      'percentage': 'bg-blue-100 text-blue-700',
      'conditional_discount': 'bg-yellow-100 text-yellow-700',
      'fixed_amount': 'bg-green-100 text-green-700',
      'happy_hour': 'bg-orange-100 text-orange-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div>
        <Header title="🎯 Promotions & Offres" subtitle="Moteur de promotions Family's" />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="🎯 Promotions & Offres" subtitle="Moteur de promotions Family's" />
      
      <div className="p-6 space-y-6">
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-white/80" />
                <span className="text-3xl font-black">{analytics.active_promotions}</span>
              </div>
              <p className="text-sm text-white/80">Promos actives</p>
            </div>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-white/80" />
                <span className="text-3xl font-black">{analytics.total_usage}</span>
              </div>
              <p className="text-sm text-white/80">Utilisations</p>
            </div>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-white/80" />
                <span className="text-3xl font-black">{analytics.total_revenue}€</span>
              </div>
              <p className="text-sm text-white/80">CA généré</p>
            </div>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-white/80" />
                <span className="text-3xl font-black">{analytics.total_discount}€</span>
              </div>
              <p className="text-sm text-white/80">Remises totales</p>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <Button
              variant={activeTab === 'list' ? 'primary' : 'outline'}
              onClick={() => setActiveTab('list')}
            >
              📋 Liste
            </Button>
            <Button
              variant={activeTab === 'calendar' ? 'primary' : 'outline'}
              onClick={() => setActiveTab('calendar')}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Calendrier
            </Button>
            <Button
              variant={activeTab === 'preview' ? 'primary' : 'outline'}
              onClick={() => setActiveTab('preview')}
            >
              <Eye className="w-4 h-4 mr-2" />
              Aperçu App
            </Button>
          </div>
          
          <Button onClick={() => { setEditingPromo(null); setShowWizard(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Créer une promotion
          </Button>
        </div>

        {/* Content based on tab */}
        {activeTab === 'list' && (
          <div className="space-y-4">
            {promotions.length === 0 ? (
              <Card className="text-center py-12">
                <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Aucune promotion créée</p>
                <Button onClick={() => setShowWizard(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Créer ma première promotion
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {promotions.map((promo) => {
                  const isActive = promo.is_active;
                  const now = new Date().toISOString().split('T')[0];
                  const isExpired = promo.end_date && promo.end_date < now;
                  const isUpcoming = promo.start_date && promo.start_date > now;
                  
                  let statusColor = 'border-gray-300 bg-gray-50';
                  let statusText = 'Brouillon';
                  
                  if (isActive && !isExpired && !isUpcoming) {
                    statusColor = 'border-green-500 bg-green-50';
                    statusText = '✅ Active';
                  } else if (isExpired) {
                    statusColor = 'border-red-400 bg-red-50';
                    statusText = '⏰ Expirée';
                  } else if (isUpcoming) {
                    statusColor = 'border-blue-400 bg-blue-50';
                    statusText = '📅 À venir';
                  } else if (!isActive) {
                    statusColor = 'border-orange-400 bg-orange-50';
                    statusText = '⏸️ Inactive';
                  }
                  
                  return (
                    <Card key={promo.id} className={`border-2 ${statusColor}`}>
                      <div className="p-4">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-3">
                          <span className={`text-xs font-semibold px-2 py-1 rounded ${getTypeColor(promo.type)}`}>
                            {getTypeLabel(promo.type)}
                          </span>
                          <span className="text-2xl font-black text-primary">
                            {promo.discount_value}{promo.type?.includes('percent') || promo.type === 'conditional_discount' || promo.type === 'percentage' ? '%' : '€'}
                          </span>
                        </div>
                        
                        {/* Name & Description */}
                        <h3 className="font-bold text-gray-900 mb-1">{promo.name}</h3>
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{promo.description}</p>
                        
                        {/* Badge */}
                        {promo.badge_text && (
                          <div 
                            className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white mb-3"
                            style={{ backgroundColor: promo.badge_color || '#FF6B35' }}
                          >
                            {promo.badge_text}
                          </div>
                        )}
                        
                        {/* Dates */}
                        <div className="text-xs text-gray-400 mb-3">
                          🗓️ {promo.start_date} → {promo.end_date}
                        </div>
                        
                        {/* Stats */}
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                          <span>📊 {promo.usage_count || 0} utilisations</span>
                          {promo.usage_limit && <span>/ {promo.usage_limit} max</span>}
                        </div>
                        
                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant={isActive ? 'outline' : 'primary'}
                            onClick={() => handleToggle(promo)}
                            className="flex-1"
                          >
                            {isActive ? '⏸️ Désactiver' : '▶️ Activer'}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => {
                              setEditingPromo(promo);
                              setShowWizard(true);
                            }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDuplicate(promo)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="danger" 
                            onClick={() => handleDelete(promo.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'calendar' && (
          <PromotionCalendar promotions={promotions} />
        )}

        {activeTab === 'preview' && (
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">📱 Aperçu dans l'app</h3>
            <div className="bg-gray-100 rounded-xl p-4 max-w-sm mx-auto">
              <p className="text-center text-gray-500 mb-4">Promos en cours visibles par les clients :</p>
              <div className="space-y-3">
                {promotions.filter(p => p.is_active && p.is_visible_in_app).map(promo => (
                  <div 
                    key={promo.id} 
                    className="bg-white rounded-lg p-3 shadow"
                  >
                    <div className="flex justify-between items-center">
                      <span 
                        className="text-xs font-bold px-2 py-1 rounded text-white"
                        style={{ backgroundColor: promo.badge_color || '#FF6B35' }}
                      >
                        {promo.badge_text || promo.name}
                      </span>
                      <span className="font-bold text-primary">
                        -{promo.discount_value}{promo.type?.includes('percent') || promo.type === 'conditional_discount' ? '%' : '€'}
                      </span>
                    </div>
                  </div>
                ))}
                {promotions.filter(p => p.is_active && p.is_visible_in_app).length === 0 && (
                  <p className="text-center text-gray-400 text-sm">Aucune promo visible</p>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Wizard Modal */}
      {showWizard && (
        <PromotionWizard
          isOpen={showWizard}
          onClose={() => {
            setShowWizard(false);
            setEditingPromo(null);
          }}
          promotion={editingPromo}
          onSuccess={() => {
            setShowWizard(false);
            setEditingPromo(null);
            loadPromotions();
          }}
        />
      )}
    </div>
  );
};
