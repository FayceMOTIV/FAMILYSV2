import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { Input, Label } from '../components/Input';
import { Settings, Save, Loader } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://fastfood-fixes.preview.emergentagent.com';

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

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API_URL}/api/v1/admin/ai-marketing/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettings(response.data);
    } catch (error) {
      console.error('Erreur chargement paramètres:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('admin_token');
      await axios.put(
        `${API_URL}/api/v1/admin/ai-marketing/settings`,
        settings,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('✅ Paramètres sauvegardés !');
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('❌ Erreur lors de la sauvegarde');
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
    { id: 'boost_ca', label: '💰 Booster CA', icon: '💰' },
    { id: 'fideliser', label: '⭐ Fidéliser clients', icon: '⭐' },
    { id: 'reactiver', label: '🔄 Réactiver inactifs', icon: '🔄' },
    { id: 'augmenter_panier', label: '🛒 Augmenter panier moyen', icon: '🛒' }
  ];

  const offerTypes = [
    { id: 'bogo', label: 'BOGO (Buy One Get One)', icon: '🎁' },
    { id: 'percentage', label: 'Réduction en %', icon: '💸' },
    { id: 'fixed', label: 'Réduction fixe (€)', icon: '💶' },
    { id: 'fidelity', label: 'Multiplicateur fidélité (x2, x3)', icon: '⭐' },
    { id: 'happy_hour', label: 'Happy Hour', icon: '⏰' },
    { id: 'reactivation', label: 'Réactivation clients', icon: '🔄' }
  ];

  return (
    <div>
      <Header 
        title="⚙️ Paramètres IA Marketing" 
        subtitle="Configure le comportement de ton assistant marketing IA"
      />
      
      <div className="p-8 max-w-4xl">
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
              <div className="flex space-x-4">
                <button
                  onClick={() => setSettings({ ...settings, analysis_frequency: 'daily' })}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
                    settings.analysis_frequency === 'daily'
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Quotidienne
                </button>
                <button
                  onClick={() => setSettings({ ...settings, analysis_frequency: 'weekly' })}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
                    settings.analysis_frequency === 'weekly'
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Hebdomadaire
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
                onChange={(e) => setSettings({ ...settings, max_suggestions_per_week: parseInt(e.target.value) })}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">L'IA générera entre 3 et {settings.max_suggestions_per_week} campagnes par semaine</p>
            </div>

            {/* Budget promo */}
            <div>
              <Label htmlFor="budget">💰 Budget promo max conseillé (%)</Label>
              <Input
                id="budget"
                type="number"
                min="5"
                max="50"
                step="0.5"
                value={settings.max_promo_budget_percent}
                onChange={(e) => setSettings({ ...settings, max_promo_budget_percent: parseFloat(e.target.value) })}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">L'IA évitera de proposer des réductions supérieures à {settings.max_promo_budget_percent}%</p>
            </div>

            {/* Objectifs prioritaires */}
            <div>
              <Label className="text-base font-bold mb-3 block">📊 Objectifs prioritaires</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Sélectionne les objectifs que l'IA doit prioriser dans ses propositions
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {objectives.map((obj) => (
                  <button
                    key={obj.id}
                    onClick={() => toggleObjective(obj.id)}
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all ${
                      settings.priority_objectives.includes(obj.id)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-300 dark:border-gray-600 hover:border-primary/50'
                    }`}
                  >
                    <span className="text-2xl">{obj.icon}</span>
                    <span className="font-semibold">{obj.label.split(' ').slice(1).join(' ')}</span>
                    {settings.priority_objectives.includes(obj.id) && (
                      <span className="ml-auto">✓</span>
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
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all ${
                      settings.allowed_offer_types.includes(type.id)
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                        : 'border-gray-300 dark:border-gray-600 hover:border-green-500/50'
                    }`}
                  >
                    <span className="text-2xl">{type.icon}</span>
                    <span className="font-semibold text-sm">{type.label}</span>
                    {settings.allowed_offer_types.includes(type.id) && (
                      <span className="ml-auto text-green-600">✓</span>
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
