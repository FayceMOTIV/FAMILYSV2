/**
 * Gestion des Probabilités - Surprise du Jour
 * Page 2/6 du module
 */
import React, { useState, useEffect } from 'react';
import { getConfigs, createConfig, updateConfig, deleteConfig } from '../services/surpriseDuJour';
import { SurpriseDuJourTabs } from '../components/SurpriseDuJourTabs';

const REWARD_TYPES = [
  { value: 'product', label: 'Produit offert', icon: '🍕' },
  { value: 'menu', label: 'Menu offert', icon: '🍽️' },
  { value: 'discount_percent', label: '% de réduction', icon: '💯' },
  { value: 'discount_amount', label: 'Montant fixe', icon: '💰' },
  { value: 'cashback', label: 'Cashback', icon: '💸' },
  { value: 'badge', label: 'Badge spécial', icon: '🏅' }
];

const SurpriseDuJourProbabilities = () => {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    reward_type: 'discount_percent',
    reward_value: '',
    reward_label: '',
    probability: 0.05,
    max_per_day: 10,
    active: true
  });

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const data = await getConfigs(false);
      setConfigs(data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des configurations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTotalProbability = () => {
    return configs
      .filter(c => c.active && c.id !== editingId)
      .reduce((sum, c) => sum + c.probability, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Vérifier que la somme ne dépasse pas 1
      const total = getTotalProbability() + parseFloat(formData.probability);
      if (total > 1) {
        alert(`Erreur : La somme des probabilités dépasserait 100% (actuel: ${(getTotalProbability() * 100).toFixed(0)}%)`);
        return;
      }

      if (editingId) {
        await updateConfig(editingId, formData);
      } else {
        await createConfig(formData);
      }
      
      setShowAddForm(false);
      setEditingId(null);
      resetForm();
      loadConfigs();
    } catch (err) {
      alert(`Erreur: ${err.response?.data?.detail || err.message}`);
    }
  };

  const handleEdit = (config) => {
    setFormData({
      reward_type: config.reward_type,
      reward_value: config.reward_value,
      reward_label: config.reward_label,
      probability: config.probability,
      max_per_day: config.max_per_day,
      active: config.active
    });
    setEditingId(config.id);
    setShowAddForm(true);
  };

  const handleDelete = async (configId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir désactiver cette configuration ?')) {
      return;
    }
    
    try {
      await deleteConfig(configId);
      loadConfigs();
    } catch (err) {
      alert(`Erreur: ${err.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      reward_type: 'discount_percent',
      reward_value: '',
      reward_label: '',
      probability: 0.05,
      max_per_day: 10,
      active: true
    });
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingId(null);
    resetForm();
  };

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

  const totalProb = getTotalProbability();
  const remainingProb = 1 - totalProb;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🎰 Surprise du Jour
        </h1>
        <p className="text-gray-600">
          Gestion du module de jeu quotidien
        </p>
      </div>

      {/* Tabs Navigation */}
      <SurpriseDuJourTabs />

      {/* Page Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            🎯 Probabilités
          </h2>
          <p className="text-sm text-gray-600">
            Configuration des récompenses et de leur fréquence
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          ➕ Ajouter une récompense
        </button>
      </div>

      {/* Probability Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="font-semibold">Total des probabilités actives:</span>
          <span className={`text-2xl font-bold ${totalProb > 1 ? 'text-red-600' : 'text-green-600'}`}>
            {(totalProb * 100).toFixed(1)}%
          </span>
        </div>
        <div className="mt-2 bg-gray-200 rounded-full h-4">
          <div
            className={`h-4 rounded-full transition-all ${totalProb > 1 ? 'bg-red-500' : 'bg-green-500'}`}
            style={{ width: `${Math.min(totalProb * 100, 100)}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Probabilité disponible: <strong>{(remainingProb * 100).toFixed(1)}%</strong>
        </p>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? '✏️ Modifier' : '➕ Ajouter'} une récompense
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Type de récompense</label>
                <select
                  value={formData.reward_type}
                  onChange={(e) => setFormData({...formData, reward_type: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  {REWARD_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Valeur</label>
                <input
                  type="text"
                  value={formData.reward_value}
                  onChange={(e) => setFormData({...formData, reward_value: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  placeholder="5, 10, ID_PRODUIT..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Libellé affiché</label>
                <input
                  type="text"
                  value={formData.reward_label}
                  onChange={(e) => setFormData({...formData, reward_label: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  placeholder="5% de réduction"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Probabilité (0-1)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={formData.probability}
                  onChange={(e) => setFormData({...formData, probability: parseFloat(e.target.value)})}
                  className="w-full border rounded px-3 py-2"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  = {(formData.probability * 100).toFixed(0)}%
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Max par jour</label>
                <input
                  type="number"
                  min="1"
                  value={formData.max_per_day}
                  onChange={(e) => setFormData({...formData, max_per_day: parseInt(e.target.value)})}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({...formData, active: e.target.checked})}
                    className="mr-2"
                  />
                  <span>Actif</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {editingId ? 'Mettre à jour' : 'Créer'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Configs Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Libellé
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Valeur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Probabilité
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Max/Jour
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {configs.map((config) => {
              const typeInfo = REWARD_TYPES.find(t => t.value === config.reward_type);
              return (
                <tr key={config.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-2xl mr-2">{typeInfo?.icon}</span>
                    <span className="text-sm">{typeInfo?.label}</span>
                  </td>
                  <td className="px-6 py-4">{config.reward_label}</td>
                  <td className="px-6 py-4">{config.reward_value}</td>
                  <td className="px-6 py-4">
                    <span className="font-bold">{(config.probability * 100).toFixed(1)}%</span>
                  </td>
                  <td className="px-6 py-4">{config.max_per_day}</td>
                  <td className="px-6 py-4">
                    {config.active ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                        Actif
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                        Inactif
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 space-x-2">
                    <button
                      onClick={() => handleEdit(config)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(config.id)}
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

        {configs.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucune configuration. Ajoutez votre première récompense !
          </div>
        )}
      </div>
    </div>
  );
};

export default SurpriseDuJourProbabilities;
