import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { Input, Label } from '../components/Input';
import { Settings, Save, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

export const AIMarketingSettings = () => {
  const [settings, setSettings] = useState({
    analysis_frequency: 'daily',
    max_suggestions_per_week: 5,
    max_promo_budget_percent: 15.0,
    excluded_product_ids: [],
    excluded_category_ids: [],
    priority_objectives: ['boost_ca', 'fideliser', 'reactiver', 'augmenter_panier'],
    allowed_offer_types: ['bogo', 'percentage', 'fidelity', 'happy_hour', 'reactivation']
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/fb/ai-marketing/settings`);
      setSettings(response.data);
      setError('');
    } catch (error) {
      console.error('Erreur chargement paramètres:', error);
      setError('Impossible de charger les paramètres. Utilisation des valeurs par défaut.');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await axios.put(`${API_URL}/api/v1/fb/ai-marketing/settings`, settings);
      setSuccess('Paramètres sauvegardés avec succès !');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      setError('Erreur lors de la sauvegarde: ' + (error.response?.data?.detail || error.message));
    } finally {
      setSaving(false);
    }
  };

  const toggleObjective = (objective) => {
    const newObjectives = settings.priority_objectives.includes(objective)
      ? settings.priority_objectives.filter(o => o !== objective)
      : [...settings.priority_objectives, objective];
    setSettings({ ...settings, priority_objectives: newObjectives });
  };

  const toggleOfferType = (offerType) => {
    const newTypes = settings.allowed_offer_types.includes(offerType)
      ? settings.allowed_offer_types.filter(t => t !== offerType)
      : [...settings.allowed_offer_types, offerType];
    setSettings({ ...settings, allowed_offer_types: newTypes });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const objectives = [
    { id: 'boost_ca', label: 'Booster le CA', icon: '💰', desc: 'Maximiser le chiffre d\'affaires' },
    { id: 'fideliser', label: 'Fidéliser clients', icon: '⭐', desc: 'Augmenter les clients récurrents' },
    { id: 'reactiver', label: 'Réactiver inactifs', icon: '🔄', desc: 'Faire revenir les clients perdus' },
    { id: 'augmenter_panier', label: 'Panier moyen', icon: '🛒', desc: 'Augmenter le montant par commande' }
  ];

  const offerTypes = [
    { id: 'bogo', label: 'BOGO (1 acheté = 1 offert)', icon: '🎁' },
    { id: 'percentage', label: 'Réduction en %', icon: '💸' },
    { id: 'fixed', label: 'Réduction fixe (€)', icon: '💶' },
    { id: 'fidelity', label: 'Multiplicateur fidélité (x2, x3)', icon: '⭐' },
    { id: 'happy_hour', label: 'Happy Hour (horaires spéciaux)', icon: '⏰' },
    { id: 'reactivation', label: 'Réactivation clients inactifs', icon: '🔄' }
  ];

  return (
    <div>
      <Header 
        title="⚙️ Paramètres IA Marketing" 
        subtitle="Configure le comportement de ton assistant marketing IA"
      />
      
      <div className="p-8 max-w-4xl">
        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <p className="text-green-700">{success}</p>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Configuration de l'IA</span>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Fréquence */}
            <div>
              <Label className="text-base font-bold mb-3 block">📆 Fréquence d'analyse</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                À quelle fréquence l'IA doit analyser tes données pour proposer des campagnes ?
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setSettings({ ...settings, analysis_frequency: 'daily' })}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
                    settings.analysis_frequency === 'daily'
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
                  }`}
                >
                  📅 Quotidienne
                </button>
                <button
                  onClick={() => setSettings({ ...settings, analysis_frequency: 'weekly' })}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
                    settings.analysis_frequency === 'weekly'
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
                  }`}
                >
                  📆 Hebdomadaire
                </button>
              </div>
            </div>

            {/* Suggestions max */}
            <div>
              <Label htmlFor="max_suggestions">🧮 Nombre max de suggestions par semaine</Label>
              <Input
                id="max_suggestions"
                type="number"
                min="1"
                max="10"
                value={settings.max_suggestions_per_week}
                onChange={(e) => setSettings({ ...settings, max_suggestions_per_week: parseInt(e.target.value) || 5 })}
                className="mt-2 max-w-xs"
              />
              <p className="text-xs text-gray-500 mt-1">
                L'IA générera entre 3 et {settings.max_suggestions_per_week} campagnes par semaine
              </p>
            </div>

            {/* Budget promo */}
            <div>
              <Label htmlFor="budget">💰 Réduction maximale conseillée (%)</Label>
              <div className="flex items-center space-x-3 mt-2">
                <Input
                  id="budget"
                  type="number"
                  min="5"
                  max="50"
                  step="0.5"
                  value={settings.max_promo_budget_percent}
                  onChange={(e) => setSettings({ ...settings, max_promo_budget_percent: parseFloat(e.target.value) || 15 })}
                  className="max-w-xs"
                />
                <span className="text-gray-600">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                L'IA évitera de proposer des réductions supérieures à {settings.max_promo_budget_percent}%
              </p>
            </div>

            {/* Objectifs prioritaires */}
            <div>
              <Label className="text-base font-bold mb-3 block">🎯 Objectifs prioritaires</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Sélectionne les objectifs que l'IA doit prioriser dans ses propositions
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {objectives.map((obj) => (
                  <button
                    key={obj.id}
                    onClick={() => toggleObjective(obj.id)}
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all text-left ${
                      settings.priority_objectives.includes(obj.id)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-300 dark:border-gray-600 hover:border-primary/50'
                    }`}
                  >
                    <span className="text-2xl">{obj.icon}</span>
                    <div className="flex-1">
                      <span className="font-semibold block">{obj.label}</span>
                      <span className="text-xs text-gray-500">{obj.desc}</span>
                    </div>
                    {settings.priority_objectives.includes(obj.id) && (
                      <span className="text-primary font-bold">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Types d'offres autorisées */}
            <div>
              <Label className="text-base font-bold mb-3 block">🎁 Types d'offres autorisées</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Choisis quels types de promotions l'IA peut proposer
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {offerTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => toggleOfferType(type.id)}
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all text-left ${
                      settings.allowed_offer_types.includes(type.id)
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                        : 'border-gray-300 dark:border-gray-600 hover:border-green-500/50'
                    }`}
                  >
                    <span className="text-2xl">{type.icon}</span>
                    <span className="font-semibold text-sm flex-1">{type.label}</span>
                    {settings.allowed_offer_types.includes(type.id) && (
                      <span className="text-green-600 font-bold">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Bouton sauvegarder */}
            <div className="pt-6 border-t dark:border-gray-700">
              <Button
                onClick={saveSettings}
                disabled={saving}
                className="w-full md:w-auto"
              >
                {saving ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder les paramètres
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
