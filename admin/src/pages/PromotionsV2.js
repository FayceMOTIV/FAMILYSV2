import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Plus, Calendar, TrendingUp, Users, DollarSign, Edit2, Trash2, Copy, Eye } from 'lucide-react';
import { PromotionWizard } from '../components/PromotionWizard';
import { PromotionCalendar } from '../components/PromotionCalendar';
// import { PromotionSimulator } from '../components/PromotionSimulator';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://menu-master-141.preview.emergentagent.com';

export const PromotionsV2 = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list'); // list, calendar, analytics, preview
  const [selectedPromoForPreview, setSelectedPromoForPreview] = useState(null);
  const [showWizard, setShowWizard] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    loadPromotions();
    loadAnalytics();
  }, []);

  const loadPromotions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/v1/admin/promotions`);
      setPromotions(response.data.promotions || []);
    } catch (error) {
      console.error('Error loading promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/admin/promotions/analytics/overview`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette promotion ?')) return;
    
    try {
      await axios.delete(`${API_URL}/api/v1/admin/promotions/${id}`);
      loadPromotions();
      loadAnalytics();
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

  const getTypeLabel = (type) => {
    const labels = {
      'bogo': '🎁 BOGO',
      'percent_item': '% Produit',
      'percent_category': '% Catégorie',
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

  const getStatusColor = (status) => {
    const colors = {
      'active': 'bg-green-100 text-green-700 border-green-500',
      'paused': 'bg-orange-100 text-orange-700 border-orange-500',
      'draft': 'bg-gray-100 text-gray-700 border-gray-500',
      'expired': 'bg-red-100 text-red-700 border-red-500'
    };
    return colors[status] || colors.draft;
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
        {analytics && (
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
                  <span className="text-3xl font-black">{analytics.total_revenue?.toFixed(0)}€</span>
                </div>
                <p className="text-sm text-white/80">CA généré</p>
              </div>
            </Card>
            
            <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white">
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="w-8 h-8 text-white/80" />
                  <span className="text-3xl font-black">{analytics.total_discount?.toFixed(0)}€</span>
                </div>
                <p className="text-sm text-white/80">Remises totales</p>
              </div>
            </Card>
          </div>
        )}

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

        {/* List View */}
        {activeTab === 'list' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {promotions.map(promo => (
              <Card key={promo.id} className={`border-2 ${getStatusColor(promo.status)}`}>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-xs font-bold px-2 py-1 rounded bg-white/50">
                        {getTypeLabel(promo.type)}
                      </span>
                      <h3 className="font-bold text-lg mt-2">{promo.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{promo.description}</p>
                    </div>
                    <span className="text-2xl font-black text-primary">
                      {promo.discount_value}{promo.discount_type === 'percentage' ? '%' : '€'}
                    </span>
                  </div>
                  
                  {promo.badge_text && (
                    <div className="mb-3 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded">
                      {promo.badge_text}
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-600 space-y-1 mb-3">
                    <p>📅 {promo.start_date} → {promo.end_date}</p>
                    {promo.usage_count > 0 && (
                      <p>📊 {promo.usage_count} utilisations</p>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => { setEditingPromo(promo); setShowWizard(true); }}>
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDuplicate(promo)}>
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(promo.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Calendar View */}
        {activeTab === 'calendar' && (
          <PromotionCalendar promotions={promotions} />
        )}

        {/* Preview View */}
        {activeTab === 'preview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mobile preview */}
            <div>
              <h3 className="font-bold text-lg mb-4">📱 Aperçu dans l'application</h3>
              <div className="bg-gradient-to-b from-gray-100 to-gray-200 rounded-3xl p-4 shadow-2xl mx-auto" style={{maxWidth: '375px'}}>
                {/* Phone notch */}
                <div className="bg-black rounded-t-3xl h-8 flex items-center justify-center mb-2">
                  <div className="w-20 h-5 bg-gray-900 rounded-full"></div>
                </div>
                
                {/* App content */}
                <div className="bg-white rounded-2xl overflow-hidden shadow-inner" style={{height: '667px'}}>
                  {/* App header */}
                  <div className="bg-gradient-to-r from-red-500 to-orange-500 p-4 text-white">
                    <h2 className="text-xl font-bold">Family's 🍔</h2>
                    <p className="text-sm text-white/80">Promotions du moment</p>
                  </div>
                  
                  {/* Scrollable promo list */}
                  <div className="p-4 overflow-y-auto" style={{height: 'calc(667px - 72px)'}}>
                    {promotions.length === 0 ? (
                      <div className="text-center py-20">
                        <div className="text-6xl mb-4">🎯</div>
                        <h3 className="text-xl font-bold text-gray-700 mb-2">Aucune promotion</h3>
                        <p className="text-gray-500">Créez votre première promotion</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {promotions.slice(0, 8).map(promo => (
                          <div 
                            key={promo.id}
                            className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-orange-200 rounded-xl p-4"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="font-bold text-lg">{promo.name}</h4>
                                <p className="text-sm text-gray-600 mt-1">{promo.description}</p>
                              </div>
                              <div className="text-3xl font-black text-orange-600 ml-4">
                                -{promo.discount_value}{promo.discount_type === 'percentage' ? '%' : '€'}
                              </div>
                            </div>
                            {promo.badge_text && (
                              <div className="mt-3 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold inline-block">
                                {promo.badge_text}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Phone home button */}
                <div className="bg-black rounded-b-3xl h-8 flex items-center justify-center mt-2">
                  <div className="w-32 h-1 bg-white/30 rounded-full"></div>
                </div>
              </div>
            </div>
            
            {/* Promo list */}
            <div>
              <h3 className="font-bold text-lg mb-4">Vos promotions</h3>
              <div className="space-y-2 max-h-[700px] overflow-y-auto">
                {promotions.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    <p>Aucune promotion disponible</p>
                  </div>
                ) : (
                  promotions.map(promo => (
                    <Card 
                      key={promo.id}
                      className="p-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-bold">{promo.name}</h4>
                          <p className="text-sm text-gray-600">{promo.description}</p>
                        </div>
                        <span className="text-xl font-black text-primary ml-3">
                          -{promo.discount_value}{promo.discount_type === 'percentage' ? '%' : '€'}
                        </span>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Wizard Modal */}
      {showWizard && (
        <PromotionWizard
          isOpen={showWizard}
          onClose={() => { setShowWizard(false); setEditingPromo(null); }}
          promotion={editingPromo}
          onSuccess={() => {
            loadPromotions();
            loadAnalytics();
            setShowWizard(false);
            setEditingPromo(null);
          }}
        />
      )}
    </div>
  );
};
