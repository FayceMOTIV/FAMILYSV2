/**
 * Configuration - Surprise du Jour
 * Fusion des probabilités et paramètres essentiels
 */
import React, { useState, useEffect } from 'react';
import { SurpriseDuJourTabs } from '../components/SurpriseDuJourTabs';
import { getConfigs, createConfig, updateConfig, deleteConfig, getSettings, updateSettings } from '../services/surpriseDuJour';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

const REWARD_TYPES = [
  { value: 'discount_percent', label: 'Réduction %', icon: '💯', needsProduct: false },
  { value: 'discount_amount', label: 'Réduction €', icon: '💰', needsProduct: false },
  { value: 'cashback', label: 'Cashback fidélité', icon: '💎', needsProduct: false },
  { value: 'product', label: 'Produit offert', icon: '🍕', needsProduct: true },
  { value: 'menu', label: 'Menu offert', icon: '🍽️', needsProduct: true }
];

const SurpriseDuJourConfiguration = () => {
  const [configs, setConfigs] = useState([]);
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState({
    module_active: true,
    reward_expiration_days: 7
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newConfig, setNewConfig] = useState({
    reward_type: 'discount_percent',
    reward_value: 10,
    label: '',
    probability: 20,
    max_per_day: 10,
    is_active: true,
    product_id: '',
    product_name: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [configsData, settingsData, productsData] = await Promise.all([
        getConfigs(),
        getSettings(),
        axios.get(`${API_URL}/api/v1/fb/products`).then(r => r.data.products || []).catch(() => [])
      ]);
      setConfigs(configsData.configs || []);
      setSettings(settingsData);
      setProducts(productsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (type) => {
    const needsProduct = REWARD_TYPES.find(t => t.value === type)?.needsProduct;
    setNewConfig({ 
      ...newConfig, 
      reward_type: type,
      reward_value: needsProduct ? 0 : 10,
      product_id: '',
      product_name: ''
    });
  };

  const handleProductChange = (productId) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setNewConfig({
        ...newConfig,
        product_id: productId,
        product_name: product.name,
        reward_value: product.base_price || product.price || 0,
        label: product.name
      });
    }
  };

  const handleAddConfig = async () => {
    try {
      setSaving(true);
      let label = newConfig.label;
      if (!label) {
        if (newConfig.product_name) {
          label = newConfig.product_name;
        } else {
          label = `${newConfig.reward_value}${newConfig.reward_type === 'discount_percent' ? '%' : '€'}`;
        }
      }
      await createConfig({ ...newConfig, label });
      setShowAddForm(false);
      setNewConfig({
        reward_type: 'discount_percent',
        reward_value: 10,
        label: '',
        probability: 20,
        max_per_day: 10,
        is_active: true,
        product_id: '',
        product_name: ''
      });
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleConfig = async (config) => {
    try {
      await updateConfig(config.id, { is_active: !config.is_active });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteConfig = async (configId) => {
    if (!window.confirm('Supprimer cette récompense ?')) return;
    try {
      await deleteConfig(configId);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      await updateSettings(settings);
      alert('Paramètres sauvegardés !');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const totalProbability = configs.filter(c => c.is_active).reduce((sum, c) => sum + (c.probability || 0), 0);
  const currentTypeNeedsProduct = REWARD_TYPES.find(t => t.value === newConfig.reward_type)?.needsProduct;

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🎰 Surprise du Jour</h1>
        <p className="text-gray-600">Gestion du module de jeu quotidien</p>
      </div>

      <SurpriseDuJourTabs />

      {/* Paramètres Généraux */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">⚙️ Paramètres Généraux</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Module actif</p>
              <p className="text-sm text-gray-500">Activer/désactiver le jeu</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.module_active}
                onChange={(e) => setSettings({ ...settings, module_active: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
            </label>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="font-medium mb-2">Validité des récompenses</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="30"
                value={settings.reward_expiration_days}
                onChange={(e) => setSettings({ ...settings, reward_expiration_days: parseInt(e.target.value) })}
                className="w-20 border rounded px-3 py-2"
              />
              <span className="text-gray-600">jours</span>
            </div>
          </div>

          <div className="flex items-center">
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              💾 Sauvegarder
            </button>
          </div>
        </div>
      </div>

      {/* Probabilités */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold">🎯 Récompenses & Probabilités</h2>
            <p className="text-sm text-gray-500">
              Total probabilités actives: 
              <span className={totalProbability === 100 ? 'text-green-600 font-bold ml-1' : 'text-orange-600 font-bold ml-1'}>
                {totalProbability}%
              </span>
              {totalProbability !== 100 && <span className="text-orange-500 ml-2">(devrait être 100%)</span>}
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            + Ajouter
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold mb-4">Nouvelle récompense</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={newConfig.reward_type}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  {REWARD_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                  ))}
                </select>
              </div>

              {currentTypeNeedsProduct ? (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Produit à offrir</label>
                  <select
                    value={newConfig.product_id}
                    onChange={(e) => handleProductChange(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">-- Choisir un produit --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} - {p.base_price || p.price}€
                      </option>
                    ))}
                  </select>
                  {newConfig.product_id && (
                    <p className="text-sm text-green-600 mt-1">
                      Valeur: {newConfig.reward_value}€
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Valeur {newConfig.reward_type === 'discount_percent' ? '(%)' : '(€)'}
                  </label>
                  <input
                    type="number"
                    value={newConfig.reward_value}
                    onChange={(e) => setNewConfig({ ...newConfig, reward_value: parseFloat(e.target.value) })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Probabilité %</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={newConfig.probability}
                  onChange={(e) => setNewConfig({ ...newConfig, probability: parseInt(e.target.value) })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Max/jour (0 = illimité)</label>
                <input
                  type="number"
                  min="0"
                  value={newConfig.max_per_day}
                  onChange={(e) => setNewConfig({ ...newConfig, max_per_day: parseInt(e.target.value) })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Libellé (optionnel)</label>
                <input
                  type="text"
                  placeholder="Ex: -10% sur ta commande"
                  value={newConfig.label}
                  onChange={(e) => setNewConfig({ ...newConfig, label: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="flex items-end gap-2">
                <button
                  onClick={handleAddConfig}
                  disabled={saving || (currentTypeNeedsProduct && !newConfig.product_id)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  ✓ Ajouter
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                >
                  ✕ Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Configs List */}
        {configs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-5xl mb-4">🎁</p>
            <p>Aucune récompense configurée</p>
            <p className="text-sm">Cliquez sur "Ajouter" pour créer votre première récompense</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b">
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Récompense</th>
                  <th className="pb-3">Valeur</th>
                  <th className="pb-3">Probabilité</th>
                  <th className="pb-3">Max/jour</th>
                  <th className="pb-3">Statut</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {configs.map((config) => {
                  const typeInfo = REWARD_TYPES.find(t => t.value === config.reward_type) || { icon: '❓', label: config.reward_type };
                  return (
                    <tr key={config.id} className={`border-b ${!config.is_active ? 'opacity-50' : ''}`}>
                      <td className="py-4">
                        <span className="text-xl mr-2">{typeInfo.icon}</span>
                        {typeInfo.label}
                      </td>
                      <td className="py-4">
                        {config.product_name || config.label || '-'}
                      </td>
                      <td className="py-4 font-bold">
                        {config.reward_value}{config.reward_type === 'discount_percent' ? '%' : '€'}
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${Math.min(config.probability, 100)}%` }}
                            ></div>
                          </div>
                          <span>{config.probability}%</span>
                        </div>
                      </td>
                      <td className="py-4">{config.max_per_day || '∞'}</td>
                      <td className="py-4">
                        <button
                          onClick={() => handleToggleConfig(config)}
                          className={`px-3 py-1 rounded-full text-sm ${config.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                        >
                          {config.is_active ? '✓ Actif' : '○ Inactif'}
                        </button>
                      </td>
                      <td className="py-4">
                        <button
                          onClick={() => handleDeleteConfig(config.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SurpriseDuJourConfiguration;
