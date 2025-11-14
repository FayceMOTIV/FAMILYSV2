import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://admin-kitchen.preview.emergentagent.com';

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
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
    start_time: null,
    end_time: null,
    days_active: [],
    limit_per_customer: null,
    priority: 0,
    stackable: false,
    badge_text: '',
    badge_color: '#FF6B35',
    status: 'active'
  });

  useEffect(() => {
    loadData();
    if (promotion) {
      setFormData({...formData, ...promotion});
    }
  }, []);

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

  const renderStep1 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-bold mb-4">Étape 1: Type & Ciblage</h3>
      
      {/* Type de promo */}
      <div>
        <label className="block text-sm font-medium mb-2">Type de promotion *</label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({...formData, type: e.target.value})}
          className="w-full px-3 py-2 border rounded-lg"
        >
          {getPromoTypeOptions().map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          {getPromoTypeOptions().find(o => o.value === formData.type)?.description}
        </p>
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

      {/* Valeur remise */}
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

      {/* Ciblage produits */}
      {['percent_item', 'fixed_item', 'bogo'].includes(formData.type) && (
        <div>
          <label className="block text-sm font-medium mb-2">Produits éligibles</label>
          <select
            multiple
            value={formData.eligible_products}
            onChange={(e) => setFormData({
              ...formData, 
              eligible_products: Array.from(e.target.selectedOptions, opt => opt.value)
            })}
            className="w-full px-3 py-2 border rounded-lg"
            size="5"
          >
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name} - {p.price}€</option>
            ))}
          </select>
        </div>
      )}

      {/* Ciblage catégories */}
      {['percent_category', 'fixed_category'].includes(formData.type) && (
        <div>
          <label className="block text-sm font-medium mb-2">Catégories éligibles</label>
          <select
            multiple
            value={formData.eligible_categories}
            onChange={(e) => setFormData({
              ...formData, 
              eligible_categories: Array.from(e.target.selectedOptions, opt => opt.value)
            })}
            className="w-full px-3 py-2 border rounded-lg"
            size="3"
          >
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );

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
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Priorité (0-100)</label>
          <input
            type="number"
            value={formData.priority}
            onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value) || 0})}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
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

  const renderStep3 = () => (
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

      {/* Aperçu */}
      <div className="p-4 border-2 border-dashed rounded-lg bg-gray-50">
        <h4 className="font-bold mb-2">📋 Aperçu</h4>
        <div className="space-y-2 text-sm">
          <p><strong>Nom:</strong> {formData.name}</p>
          <p><strong>Type:</strong> {getPromoTypeOptions().find(o => o.value === formData.type)?.label}</p>
          <p><strong>Remise:</strong> {formData.discount_value}{formData.discount_type === 'percentage' ? '%' : '€'}</p>
          <p><strong>Période:</strong> {formData.start_date} → {formData.end_date}</p>
          {formData.badge_text && (
            <div className="inline-block px-3 py-1 rounded font-bold text-white" style={{backgroundColor: formData.badge_color}}>
              {formData.badge_text}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">
          {promotion ? '✏️ Modifier la promotion' : '➕ Créer une promotion'}
        </h2>

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
