/**
 * Gestion des Récompenses - Surprise du Jour
 * Page 3/6 du module
 */
import React, { useState, useEffect } from 'react';
import { getAllRewards } from '../services/surpriseDuJour';
import { SurpriseDuJourTabs } from '../components/SurpriseDuJourTabs';

const REWARD_TYPES = {
  product: { label: 'Produit offert', icon: '🍕', color: 'bg-orange-100 text-orange-800' },
  menu: { label: 'Menu offert', icon: '🍽️', color: 'bg-purple-100 text-purple-800' },
  discount_percent: { label: '% de réduction', icon: '💯', color: 'bg-blue-100 text-blue-800' },
  discount_amount: { label: 'Montant fixe', icon: '💰', color: 'bg-green-100 text-green-800' },
  cashback: { label: 'Cashback', icon: '💸', color: 'bg-yellow-100 text-yellow-800' },
  badge: { label: 'Badge spécial', icon: '🏅', color: 'bg-pink-100 text-pink-800' }
};

const SurpriseDuJourRewards = () => {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('active'); // active, used, expired, all
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadRewards();
  }, [filter]);

  const loadRewards = async () => {
    try {
      setLoading(true);
      const includeAll = filter === 'all';
      const response = await getAllRewards(includeAll);
      
      // Extract rewards array from response
      const data = response.rewards || response || [];
      
      // Filter based on selected filter
      let filtered = data;
      if (filter === 'active') {
        filtered = data.filter(r => !r.is_used && new Date(r.expires_at) > new Date());
      } else if (filter === 'used') {
        filtered = data.filter(r => r.is_used);
      } else if (filter === 'expired') {
        filtered = data.filter(r => !r.is_used && new Date(r.expires_at) <= new Date());
      }
      
      setRewards(filtered);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des récompenses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRewards = rewards.filter(reward =>
    reward.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reward.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRewardInfo = (type) => REWARD_TYPES[type] || { label: type, icon: '❓', color: 'bg-gray-100 text-gray-800' };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString('fr-FR', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      </div>
    );
  }

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
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          🎁 Récompenses
        </h2>
        <p className="text-sm text-gray-600">
          Liste de toutes les récompenses gagnées par les utilisateurs
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Status Filter */}
          <div className="flex gap-2">
            {[
              { value: 'active', label: 'Actives', icon: '🟢' },
              { value: 'used', label: 'Utilisées', icon: '✅' },
              { value: 'expired', label: 'Expirées', icon: '⏰' },
              { value: 'all', label: 'Toutes', icon: '📋' }
            ].map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  filter === f.value
                    ? 'bg-primary text-white font-semibold'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.icon} {f.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Rechercher par email ou code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          {/* Count */}
          <div className="text-sm text-gray-600 font-semibold">
            {filteredRewards.length} récompense(s)
          </div>
        </div>
      </div>

      {/* Rewards List */}
      <div className="space-y-4">
        {filteredRewards.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-500 text-lg">Aucune récompense trouvée</p>
          </div>
        ) : (
          filteredRewards.map((reward) => {
            const rewardInfo = getRewardInfo(reward.reward_type);
            const isExpired = new Date(reward.expires_at) <= new Date();
            const isUsed = reward.is_used;

            return (
              <div
                key={reward.id}
                className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                  isUsed ? 'border-green-500 bg-green-50/30' :
                  isExpired ? 'border-gray-400 bg-gray-50' :
                  'border-blue-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Reward Type & Value */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${rewardInfo.color}`}>
                        {rewardInfo.icon} {rewardInfo.label}
                      </span>
                      <span className="text-lg font-bold text-gray-900">
                        {reward.reward_type.includes('discount') ? `${reward.reward_value}${reward.reward_type === 'discount_percent' ? '%' : '€'}` : reward.reward_value}
                      </span>
                    </div>

                    {/* User & Code */}
                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-gray-500">Utilisateur:</span>
                        <span className="ml-2 font-semibold text-gray-900">{reward.user_id}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Code:</span>
                        <span className="ml-2 font-mono font-bold text-primary">{reward.code}</span>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Créée le:</span>
                        <span className="ml-2 text-gray-700">{formatDate(reward.created_at)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Expire le:</span>
                        <span className={`ml-2 ${isExpired ? 'text-red-600 font-semibold' : 'text-gray-700'}`}>
                          {formatDate(reward.expires_at)}
                        </span>
                      </div>
                    </div>

                    {/* Used Info */}
                    {isUsed && reward.used_at && (
                      <div className="mt-3 pt-3 border-t border-green-200">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-green-600 font-semibold">✅ Utilisée le:</span>
                          <span className="text-gray-700">{formatDate(reward.used_at)}</span>
                          {reward.order_id && (
                            <>
                              <span className="text-gray-400">•</span>
                              <span className="text-gray-500">Commande: <span className="font-mono">{reward.order_id}</span></span>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="ml-4">
                    {isUsed ? (
                      <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                        ✅ Utilisée
                      </div>
                    ) : isExpired ? (
                      <div className="px-3 py-1 bg-gray-300 text-gray-700 rounded-full text-sm font-semibold">
                        ⏰ Expirée
                      </div>
                    ) : (
                      <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                        🟢 Active
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SurpriseDuJourRewards;
