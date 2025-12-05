import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

export const PromotionWizard = ({ isOpen, onClose, promotion, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [showTooltip, setShowTooltip] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'percent_item',
    discount_type: 'percentage',
    discount_value: 10,
    eligible_products: [],
    eligible_categories: [],
    all_products: false,
    min_cart_amount: null,
    // BOGO fields
    bogo_buy_quantity: 1,
    bogo_get_quantity: 1,
    bogo_cheapest_free: false,
    // Conditional discount fields
    conditional_quantity: 2,
    conditional_discount_percent: 50,
    // Dates
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
    start_time: null,
    end_time: null,
    days_active: [],
    limit_per_customer: null,
    limit_total: null,
    priority: 0,
    stackable: false,
    // Display
    badge_text: '',
    badge_color: '#FF6B35',
    // Code promo
    promo_code: null,
    code_required: false,
    status: 'active'
  });

  useEffect(() => {
    if (isOpen) {
      loadData();
      if (promotion) {
        setFormData({...formData, ...promotion});
      }
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        axios.get(`${API_URL}/api/v1/admin/products`),
        axios.get(`${API_URL}/api/v1/admin/categories`)
      ]);
      setProducts(productsRes.data.products || []);
      setCategories(categoriesRes.data.categories || []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const url = promotion 
        ? `${API_URL}/api/v1/admin/promotions/${promotion.id}`
        : `${API_URL}/api/v1/admin/promotions`;
      
      const method = promotion ? 'put' : 'post';
      
      await axios[method](url, formData);
      
      alert('✅ Promotion enregistrée');
      onSuccess?.();
    } catch (error) {
      console.error('Error saving promotion:', error);
      alert('❌ Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const getPromoTypeOptions = () => [
    { value: 'bogo', label: '🎁 BOGO (Achetez 1 = 1 offert)', description: 'Classique Buy One Get One', tooltip: 'Le client achète un produit et en reçoit un second identique gratuitement. Idéal pour augmenter le volume des ventes.' },
    { value: 'percent_item', label: '💯 % sur produit', description: 'Réduction % sur produits spécifiques', tooltip: 'Réduction en pourcentage appliquée sur des produits sélectionnés. Ex: -15% sur tous les burgers.' },
    { value: 'percent_category', label: '💯 % sur catégorie', description: 'Réduction % sur une catégorie', tooltip: 'Réduction en pourcentage sur tous les produits d\'une ou plusieurs catégories. Ex: -20% sur toutes les boissons.' },
    { value: 'conditional_discount', label: '🔢 2e à -50%', description: '2ème article à -50%, 3 pour 2...', tooltip: 'Réduction progressive: le 2ème article à -50%, ou formules "3 pour le prix de 2". Encourage l\'achat multiple.' },
    { value: 'threshold', label: '🎯 Seuil de panier', description: 'Dès X€ d\'achat', tooltip: 'Réduction activée quand le montant du panier atteint un seuil. Ex: -5€ dès 30€ d\'achat.' },
    { value: 'shipping_free', label: '🚚 Livraison gratuite', description: 'Frais de livraison offerts', tooltip: 'Les frais de livraison sont offerts. Peut être conditionné à un montant minimum.' },
    { value: 'new_customer', label: '✨ Nouveau client', description: '1ère commande uniquement', tooltip: 'Offre réservée aux nouveaux clients pour leur première commande. Excellent pour l\'acquisition.' },
    { value: 'happy_hour', label: '🌅 Happy Hour', description: 'Promo sur horaires définis', tooltip: 'Réduction active uniquement pendant certaines heures de la journée. Ex: -15% de 15h à 18h.' },
    { value: 'flash', label: '⚡ Offre Flash', description: 'Durée très limitée', tooltip: 'Promotion de très courte durée (quelques heures) pour créer un sentiment d\'urgence.' },
    { value: 'seasonal', label: '🎉 Saisonnier', description: 'Événement spécial', tooltip: 'Promotion liée à un événement (Noël, St-Valentin, etc.) ou une saison spécifique.' },
    { value: 'promo_code', label: '🔖 Code promo', description: 'Code manuel à saisir', tooltip: 'Le client doit saisir un code pour bénéficier de la réduction. Utile pour le marketing ciblé.' }
  ];

  const renderStep1 = () => {
    const shouldShowDiscountFields = !['bogo', 'shipping_free'].includes(formData.type);
    const needsProductSelection = ['percent_item', 'fixed_item', 'bogo'].includes(formData.type);
    const needsCategorySelection = ['percent_category', 'fixed_category'].includes(formData.type);
    
    const filteredProducts = products.filter(p => 
      p.name.toLowerCase().includes(productSearch.toLowerCase())
    );
    
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-bold mb-4">Étape 1: Type & Ciblage</h3>
        
        {/* Type de promo avec tooltips */}
        <div>
          <label className="block text-sm font-medium mb-2">Type de promotion *</label>
          <div className="grid grid-cols-2 gap-2">
            {getPromoTypeOptions().map(opt => (
              <div
                key={opt.value}
                className={`relative group cursor-pointer p-3 border-2 rounded-lg transition-all ${
                  formData.type === opt.value 
                    ? 'border-primary bg-primary/5' 
                    : 'border-gray-200 hover:border-primary/50'
                }`}
                onClick={() => setFormData({...formData, type: opt.value})}
              >
                <div className="font-medium text-sm">{opt.label}</div>
                <div className="text-xs text-gray-500">{opt.description}</div>
                
                {/* Tooltip */}
                <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="font-semibold mb-1">ℹ️ Comment ça marche?</div>
                  {opt.tooltip}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nom */}
        <div>
          <label className="block text-sm font-medium mb-2">Nom de la promo *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Ex: Happy Hour Burgers"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
            rows="2"
            placeholder="Profitez de -15% sur tous nos burgers entre 15h et 18h"
          />
        </div>

        {/* Valeur remise - Conditionnel */}
        {shouldShowDiscountFields && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Type de remise</label>
              <select
                value={formData.discount_type}
                onChange={(e) => setFormData({...formData, discount_type: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="percentage">Pourcentage (%)</option>
                <option value="fixed">Montant fixe (€)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Valeur *</label>
              <input
                type="number"
                step="0.01"
                value={formData.discount_value}
                onChange={(e) => setFormData({...formData, discount_value: parseFloat(e.target.value)})}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
          </div>
        )}

        {/* BOGO Configuration */}
        {formData.type === 'bogo' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-green-800">🎁 Configuration BOGO</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Acheter (quantité)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.bogo_buy_quantity || 1}
                  onChange={(e) => setFormData({...formData, bogo_buy_quantity: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Obtenir gratuit (quantité)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.bogo_get_quantity || 1}
                  onChange={(e) => setFormData({...formData, bogo_get_quantity: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.bogo_cheapest_free || false}
                onChange={(e) => setFormData({...formData, bogo_cheapest_free: e.target.checked})}
                className="w-4 h-4"
              />
              <span className="text-sm">Le moins cher est gratuit (si produits différents)</span>
            </label>
            <p className="text-xs text-green-600">
              Exemple: Acheter {formData.bogo_buy_quantity || 1} = {formData.bogo_get_quantity || 1} offert(s)
            </p>
          </div>
        )}

        {/* Conditional Discount Configuration */}
        {formData.type === 'conditional_discount' && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-purple-800">🔢 Configuration Conditionnelle</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">À partir du Xème article</label>
                <input
                  type="number"
                  min="2"
                  value={formData.conditional_quantity || 2}
                  onChange={(e) => setFormData({...formData, conditional_quantity: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Réduction (%)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.conditional_discount_percent || 50}
                  onChange={(e) => setFormData({...formData, conditional_discount_percent: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
            <p className="text-xs text-purple-600">
              Exemple: Le {formData.conditional_quantity || 2}ème article à -{formData.conditional_discount_percent || 50}%
            </p>
          </div>
        )}

        {/* Ciblage produits - Amélioré */}
        {needsProductSelection && (
          <div>
            <label className="block text-sm font-medium mb-2">Produits éligibles</label>
            
            {/* Option toute la carte */}
            <div className="mb-3">
              <label className="flex items-center space-x-2 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={formData.all_products}
                  onChange={(e) => setFormData({
                    ...formData, 
                    all_products: e.target.checked,
                    eligible_products: e.target.checked ? [] : formData.eligible_products
                  })}
                  className="w-4 h-4"
                />
                <span className="font-medium">🍽️ Toute la carte</span>
                <span className="text-xs text-gray-500">(Tous les produits sont éligibles)</span>
              </label>
            </div>

            {!formData.all_products && (
              <>
                {/* Recherche */}
                <input
                  type="text"
                  placeholder="🔍 Rechercher un produit..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg mb-2"
                />
                
                {/* Liste avec checkboxes */}
                <div className="border rounded-lg max-h-48 overflow-y-auto p-2 space-y-1">
                  {filteredProducts.length === 0 ? (
                    <p className="text-center text-gray-400 py-4">Aucun produit trouvé</p>
                  ) : (
                    filteredProducts.map(p => (
                      <label
                        key={p.id}
                        className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.eligible_products.includes(p.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                eligible_products: [...formData.eligible_products, p.id]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                eligible_products: formData.eligible_products.filter(id => id !== p.id)
                              });
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <span className="flex-1">{p.name}</span>
                        <span className="text-sm text-gray-500">{p.price}€</span>
                      </label>
                    ))
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.eligible_products.length} produit(s) sélectionné(s)
                </p>
              </>
            )}
          </div>
        )}

        {/* Ciblage catégories - Amélioré */}
        {needsCategorySelection && (
          <div>
            <label className="block text-sm font-medium mb-2">Catégories éligibles</label>
            <p className="text-xs text-gray-500 mb-2">
              Le client pourra choisir n'importe quel produit de ces catégories
            </p>
            
            <div className="grid grid-cols-2 gap-2">
              {categories.map(c => (
                <label
                  key={c.id}
                  className="flex items-center space-x-2 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={formData.eligible_categories.includes(c.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          eligible_categories: [...formData.eligible_categories, c.id]
                        });
                      } else {
                        setFormData({
                          ...formData,
                          eligible_categories: formData.eligible_categories.filter(id => id !== c.id)
                        });
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <span className="font-medium">{c.name}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formData.eligible_categories.length} catégorie(s) sélectionnée(s)
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderStep2 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-bold mb-4">Étape 2: Conditions & Limites</h3>
      
      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Date début *</label>
          <input
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({...formData, start_date: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Date fin *</label>
          <input
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({...formData, end_date: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
      </div>

      {/* Horaires */}
      {formData.type === 'happy_hour' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Heure début</label>
            <input
              type="time"
              value={formData.start_time || ''}
              onChange={(e) => setFormData({...formData, start_time: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Heure fin</label>
            <input
              type="time"
              value={formData.end_time || ''}
              onChange={(e) => setFormData({...formData, end_time: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Jours actifs */}
      <div>
        <label className="block text-sm font-medium mb-2">Jours actifs</label>
        <div className="flex flex-wrap gap-2">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, i) => {
            const dayCode = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'][i];
            const isActive = formData.days_active.includes(dayCode);
            return (
              <button
                key={dayCode}
                type="button"
                onClick={() => {
                  if (isActive) {
                    setFormData({
                      ...formData,
                      days_active: formData.days_active.filter(d => d !== dayCode)
                    });
                  } else {
                    setFormData({
                      ...formData,
                      days_active: [...formData.days_active, dayCode]
                    });
                  }
                }}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  isActive ? 'bg-primary text-white' : 'bg-gray-200'
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* Montant minimum */}
      {formData.type === 'threshold' && (
        <div>
          <label className="block text-sm font-medium mb-2">Montant minimum panier (€)</label>
          <input
            type="number"
            step="0.01"
            value={formData.min_cart_amount || ''}
            onChange={(e) => setFormData({...formData, min_cart_amount: parseFloat(e.target.value)})}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
      )}

      {/* Code promo */}
      {formData.type === 'promo_code' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3">
          <h4 className="font-semibold text-yellow-800">🔖 Configuration Code Promo</h4>
          <div>
            <label className="block text-sm font-medium mb-1">Code à saisir *</label>
            <input
              type="text"
              value={formData.promo_code || ''}
              onChange={(e) => setFormData({...formData, promo_code: e.target.value.toUpperCase()})}
              className="w-full px-3 py-2 border rounded-lg uppercase"
              placeholder="Ex: BIENVENUE20"
            />
          </div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.code_required || false}
              onChange={(e) => setFormData({...formData, code_required: e.target.checked})}
              className="w-4 h-4"
            />
            <span className="text-sm">Code obligatoire (la promo ne s'applique pas automatiquement)</span>
          </label>
        </div>
      )}

      {/* Limites */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Limite par client</label>
          <input
            type="number"
            value={formData.limit_per_customer || ''}
            onChange={(e) => setFormData({...formData, limit_per_customer: parseInt(e.target.value) || null})}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Illimité"
          />
          <p className="text-xs text-gray-500 mt-1">Nombre max d'utilisation par client</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Limite totale</label>
          <input
            type="number"
            value={formData.limit_total || ''}
            onChange={(e) => setFormData({...formData, limit_total: parseInt(e.target.value) || null})}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Illimité"
          />
          <p className="text-xs text-gray-500 mt-1">Nombre max d'utilisation total</p>
        </div>
      </div>

      {/* Priorité */}
      <div>
        <label className="block text-sm font-medium mb-2">Priorité (0-100)</label>
        <input
          type="number"
          value={formData.priority}
          onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value) || 0})}
          className="w-full px-3 py-2 border rounded-lg"
        />
        <p className="text-xs text-gray-500 mt-1">Plus la priorité est élevée, plus la promo est appliquée en premier</p>
      </div>

      {/* Cumulable */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="stackable"
          checked={formData.stackable}
          onChange={(e) => setFormData({...formData, stackable: e.target.checked})}
          className="w-4 h-4"
        />
        <label htmlFor="stackable" className="text-sm font-medium">
          Cumulable avec d'autres promotions
        </label>
      </div>
    </div>
  );

  const renderStep3 = () => {
    // Récupérer les noms des produits/catégories sélectionnés
    const selectedProductNames = formData.eligible_products
      .map(id => products.find(p => p.id === id)?.name)
      .filter(Boolean);
    
    const selectedCategoryNames = formData.eligible_categories
      .map(id => categories.find(c => c.id === id)?.name)
      .filter(Boolean);
    
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-bold mb-4">Étape 3: Affichage & Activation</h3>
        
        {/* Badge */}
        <div>
          <label className="block text-sm font-medium mb-2">Texte badge (affiché sur produits)</label>
          <input
            type="text"
            value={formData.badge_text}
            onChange={(e) => setFormData({...formData, badge_text: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Ex: -15% 🔥"
          />
        </div>

        {/* Couleur badge */}
        <div>
          <label className="block text-sm font-medium mb-2">Couleur du badge</label>
          <input
            type="color"
            value={formData.badge_color}
            onChange={(e) => setFormData({...formData, badge_color: e.target.value})}
            className="w-20 h-10 border rounded-lg"
          />
        </div>

        {/* Statut */}
        <div>
          <label className="block text-sm font-medium mb-2">Statut</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="draft">🟡 Brouillon</option>
            <option value="active">🟢 Active</option>
            <option value="paused">🟠 Pause</option>
          </select>
        </div>

        {/* Aperçu amélioré */}
        <div className="p-4 border-2 border-dashed rounded-lg bg-gradient-to-br from-blue-50 to-purple-50">
          <h4 className="font-bold mb-3 text-lg">📋 Aperçu de la promotion</h4>
          <div className="space-y-2 text-sm">
            <p><strong>Nom:</strong> {formData.name || '(Non défini)'}</p>
            <p><strong>Type:</strong> {getPromoTypeOptions().find(o => o.value === formData.type)?.label}</p>
            
            {!['bogo', 'shipping_free'].includes(formData.type) && (
              <p><strong>Remise:</strong> {formData.discount_value}{formData.discount_type === 'percentage' ? '%' : '€'}</p>
            )}
            
            <p><strong>Période:</strong> {formData.start_date} → {formData.end_date}</p>
            
            {formData.start_time && formData.end_time && (
              <p><strong>Horaires:</strong> {formData.start_time} - {formData.end_time}</p>
            )}
            
            {/* Produits éligibles */}
            {formData.all_products && (
              <p><strong>Produits:</strong> <span className="text-green-600 font-semibold">🍽️ Toute la carte</span></p>
            )}
            
            {!formData.all_products && selectedProductNames.length > 0 && (
              <div>
                <strong>Produits éligibles:</strong>
                <div className="mt-1 flex flex-wrap gap-1">
                  {selectedProductNames.map((name, i) => (
                    <span key={i} className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Catégories éligibles */}
            {selectedCategoryNames.length > 0 && (
              <div>
                <strong>Catégories éligibles:</strong>
                <div className="mt-1 flex flex-wrap gap-1">
                  {selectedCategoryNames.map((name, i) => (
                    <span key={i} className="inline-block px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                      📂 {name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {formData.badge_text && (
              <div className="mt-3">
                <strong>Badge:</strong>
                <div className="inline-block px-3 py-1 rounded font-bold text-white ml-2" style={{backgroundColor: formData.badge_color}}>
                  {formData.badge_text}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={promotion ? '✏️ Modifier la promotion' : '➕ Créer une promotion'}
      size="lg"
    >
      <div className="p-2">

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= s ? 'bg-primary text-white' : 'bg-gray-200'
              }`}>
                {step > s ? <Check className="w-6 h-6" /> : s}
              </div>
              {s < 3 && <div className={`w-20 h-1 mx-2 ${step > s ? 'bg-primary' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <form onSubmit={(e) => e.preventDefault()}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => step === 1 ? onClose() : setStep(step - 1)}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              {step === 1 ? 'Annuler' : 'Précédent'}
            </Button>
            
            {step < 3 ? (
              <Button
                type="button"
                onClick={() => setStep(step + 1)}
              >
                Suivant
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Enregistrement...' : '✅ Enregistrer'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </Modal>
  );
};
