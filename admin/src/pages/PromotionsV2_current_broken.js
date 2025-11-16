import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Plus, Calendar, TrendingUp, Users, DollarSign, Edit2, Trash2, Copy, Eye, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { PromotionWizard } from '../components/PromotionWizard';
import { PromotionCalendar } from '../components/PromotionCalendar';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://foodapp-redesign.preview.emergentagent.com';

export const PromotionsV2 = () => {
  const [promotions, setPromotions] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list'); // list, calendar, preview
  const [showWizard, setShowWizard] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsRange, setAnalyticsRange] = useState('30days'); // 7days, 30days, year, all
  const [selectedPromoForPreview, setSelectedPromoForPreview] = useState(null);
  
  // Calendar navigation
  const [calendarView, setCalendarView] = useState('month'); // month, year
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    loadPromotions();
    loadAnalytics();
    loadProducts();
    loadCategories();
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [analyticsRange]);

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

  const loadProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/admin/products`);
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/admin/categories`);
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/admin/promotions/analytics/overview?range=${analyticsRange}`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const handleResetAnalytics = async () => {
    if (!window.confirm('⚠️ Voulez-vous vraiment réinitialiser toutes les statistiques ? Cette action est irréversible.')) return;
    
    try {
      await axios.post(`${API_URL}/api/v1/admin/promotions/analytics/reset`);
      loadAnalytics();
      alert('✅ Statistiques réinitialisées');
    } catch (error) {
      alert('❌ Erreur lors de la réinitialisation');
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

  const getTargetInfo = (promo) => {
    if (promo.type === 'percent_item' || promo.type === 'fixed_item') {
      const product = products.find(p => promo.applicable_products?.includes(p.id));
      if (product) return `🍔 ${product.name}`;
      if (promo.applicable_products?.length > 0) return `🍔 ${promo.applicable_products.length} produits`;
    }
    
    if (promo.type === 'percent_category' || promo.type === 'fixed_category') {
      const category = categories.find(c => promo.applicable_categories?.includes(c.id));
      if (category) return `📁 ${category.name}`;
      if (promo.applicable_categories?.length > 0) return `📁 ${promo.applicable_categories.length} catégories`;
    }
    
    if (promo.type === 'bogo') {
      const product = products.find(p => p.id === promo.buy_product_id);
      if (product) return `🎁 Achetez ${product.name}`;
    }
    
    if (promo.type === 'threshold') {
      return `🎯 Panier ≥ ${promo.min_cart_amount}€`;
    }
    
    if (promo.type === 'happy_hour') {
      return `🌅 ${promo.time_start} - ${promo.time_end}`;
    }
    
    if (promo.type === 'promo_code') {
      return `🔖 Code: ${promo.promo_code}`;
    }
    
    return null;
  };

  const getRangeLabel = () => {
    const labels = {
      '7days': 'Derniers 7 jours',
      '30days': 'Derniers 30 jours',
      'year': 'Année en cours',
      'all': 'Depuis le début'
    };
    return labels[analyticsRange] || labels['30days'];
  };

  // Calendar navigation functions
  const navigateCalendar = (direction) => {
    const newDate = new Date(currentDate);
    if (calendarView === 'month') {
      newDate.setMonth(currentDate.getMonth() + direction);
    } else {
      newDate.setFullYear(currentDate.getFullYear() + direction);
    }
    setCurrentDate(newDate);
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
        {/* Analytics Cards with Period Selection */}
        {analytics && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">Période:</span>
                <select
                  value={analyticsRange}
                  onChange={(e) => setAnalyticsRange(e.target.value)}
                  className="px-3 py-1 border rounded text-sm"
                >
                  <option value="7days">7 derniers jours</option>
                  <option value="30days">30 derniers jours</option>
                  <option value="year">Année en cours</option>
                  <option value="all">Depuis le début</option>
                </select>
                <span className="text-sm text-gray-500">{getRangeLabel()}</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleResetAnalytics}
                className="text-red-600 hover:text-red-700"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                RAZ statistiques
              </Button>
            </div>
            
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
            {promotions.map(promo => {
              const targetInfo = getTargetInfo(promo);
              return (
                <Card key={promo.id} className={`border-2 ${getStatusColor(promo.status)}`}>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <span className="text-xs font-bold px-2 py-1 rounded bg-white/50">
                          {getTypeLabel(promo.type)}
                        </span>
                        <h3 className="font-bold text-lg mt-2">{promo.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{promo.description}</p>
                        
                        {/* Target info */}
                        {targetInfo && (
                          <p className="text-xs text-blue-600 font-medium mt-2 bg-blue-50 px-2 py-1 rounded inline-block">
                            {targetInfo}
                          </p>
                        )}
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
                      <Button size="sm" variant="outline" onClick={() => { setSelectedPromoForPreview(promo); setActiveTab('preview'); }}>
                        <Eye className="w-3 h-3" />
                      </Button>
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
              );
            })}
          </div>
        )}

        {/* Calendar View with Navigation */}
        {activeTab === 'calendar' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => navigateCalendar(-1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="font-bold text-lg min-w-[200px] text-center">
                  {calendarView === 'month' 
                    ? currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
                    : currentDate.getFullYear()
                  }
                </span>
                <Button size="sm" variant="outline" onClick={() => navigateCalendar(1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => setCurrentDate(new Date())}>
                  Aujourd'hui
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={calendarView === 'month' ? 'primary' : 'outline'}
                  onClick={() => setCalendarView('month')}
                >
                  📅 Mois
                </Button>
                <Button
                  size="sm"
                  variant={calendarView === 'year' ? 'primary' : 'outline'}
                  onClick={() => setCalendarView('year')}
                >
                  📆 Année
                </Button>
              </div>
            </div>
            
            <PromotionCalendar 
              promotions={promotions} 
              currentDate={currentDate}
              view={calendarView}
            />
          </div>
        )}

        {/* App Preview View */}
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
                    {selectedPromoForPreview ? (
                      // Single promo detail
                      <div className="space-y-4">
                        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-6 text-white shadow-lg">
                          <div className="text-6xl font-black mb-2">
                            {selectedPromoForPreview.discount_value}
                            {selectedPromoForPreview.discount_type === 'percentage' ? '%' : '€'}
                          </div>
                          <h3 className="text-2xl font-bold mb-2">{selectedPromoForPreview.name}</h3>
                          <p className="text-white/90 text-sm">{selectedPromoForPreview.description}</p>
                          
                          {selectedPromoForPreview.badge_text && (
                            <div className="mt-4 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-center font-bold">
                              {selectedPromoForPreview.badge_text}
                            </div>
                          )}
                          
                          {getTargetInfo(selectedPromoForPreview) && (
                            <div className="mt-3 text-sm bg-white/20 px-3 py-1 rounded inline-block">
                              {getTargetInfo(selectedPromoForPreview)}
                            </div>
                          )}
                        </div>
                        
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h4 className="font-bold mb-2">📅 Validité</h4>
                          <p className="text-sm text-gray-600">
                            Du {selectedPromoForPreview.start_date} au {selectedPromoForPreview.end_date}
                          </p>
                        </div>
                        
                        <button className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold py-4 rounded-xl shadow-lg">
                          Profiter de l'offre
                        </button>
                      </div>
                    ) : (
                      // Promo list - AFFICHE TOUTES LES PROMOS, PAS SEULEMENT ACTIVES
                      <div className="space-y-3">
                        {promotions.length === 0 ? (
                          <div className="text-center py-20">
                            <div className="text-6xl mb-4">🎯</div>
                            <h3 className="text-xl font-bold text-gray-700 mb-2">Aucune promotion</h3>
                            <p className="text-gray-500">Créez votre première promotion pour la voir apparaître ici</p>
                          </div>
                        ) : (
                          promotions.slice(0, 8).map(promo => (
                            <div 
                              key={promo.id}
                              onClick={() => setSelectedPromoForPreview(promo)}
                              className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-orange-200 rounded-xl p-4 cursor-pointer hover:shadow-lg transition-shadow"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs text-orange-600 font-bold">
                                      {getTypeLabel(promo.type)}
                                    </span>
                                    {promo.status !== 'active' && (
                                      <span className={`text-xs px-2 py-0.5 rounded ${
                                        promo.status === 'draft' ? 'bg-gray-200 text-gray-700' :
                                        promo.status === 'paused' ? 'bg-orange-200 text-orange-700' :
                                        'bg-red-200 text-red-700'
                                      }`}>
                                        {promo.status === 'draft' ? '📝 Brouillon' : 
                                         promo.status === 'paused' ? '⏸️ Pausé' : 
                                         '🚫 Expiré'}
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="font-bold text-lg">{promo.name}</h4>
                                  <p className="text-sm text-gray-600 mt-1">{promo.description}</p>
                                  {getTargetInfo(promo) && (
                                    <p className="text-xs text-blue-600 mt-2">{getTargetInfo(promo)}</p>
                                  )}
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
                          ))
                        )}
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
            
            {/* Promo selector */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Sélectionner une promotion</h3>
                {selectedPromoForPreview && (
                  <Button size="sm" variant="outline" onClick={() => setSelectedPromoForPreview(null)}>
                    Voir toutes
                  </Button>
                )}
              </div>
              
              <div className="space-y-2 max-h-[700px] overflow-y-auto">
                {promotions.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    <p>Aucune promotion disponible</p>
                    <p className="text-sm mt-2">Créez une promotion pour la prévisualiser</p>
                  </div>
                ) : (
                  promotions.map(promo => (
                    <Card 
                      key={promo.id}
                      className={`p-3 cursor-pointer hover:shadow-md transition-shadow ${
                        selectedPromoForPreview?.id === promo.id ? 'border-2 border-primary' : ''
                      }`}
                      onClick={() => setSelectedPromoForPreview(promo)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-primary">{getTypeLabel(promo.type)}</span>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              promo.status === 'active' ? 'bg-green-100 text-green-700' :
                              promo.status === 'draft' ? 'bg-gray-200 text-gray-700' :
                              promo.status === 'paused' ? 'bg-orange-200 text-orange-700' :
                              'bg-red-200 text-red-700'
                            }`}>
                              {promo.status === 'active' ? '✅ Active' :
                               promo.status === 'draft' ? '📝 Brouillon' : 
                               promo.status === 'paused' ? '⏸️ Pausé' : 
                               '🚫 Expiré'}
                            </span>
                          </div>
                          <h4 className="font-bold mt-1">{promo.name}</h4>
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
            setShowWizard(false);
            setEditingPromo(null);
            loadPromotions();
            loadAnalytics();
          }}
        />
      )}
    </div>
  );
};
