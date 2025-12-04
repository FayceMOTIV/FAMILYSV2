/**
 * Dashboard Surprise du Jour
 * Page 1/6 du module
 */
import React, { useState, useEffect } from 'react';
import { getStats } from '../services/surpriseDuJour';
import { SurpriseDuJourTabs } from '../components/SurpriseDuJourTabs';

const SurpriseDuJourDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await getStats();
      setStats(data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des statistiques');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Spins Aujourd'hui</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.total_spins_today || 0}
              </p>
            </div>
            <div className="text-4xl">🎲</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Spins Cette Semaine</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.total_spins_week || 0}
              </p>
            </div>
            <div className="text-4xl">📅</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Récompenses Actives</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.active_rewards || 0}
              </p>
            </div>
            <div className="text-4xl">🎁</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Taux Conversion</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.conversion_rate || 0}%
              </p>
            </div>
            <div className="text-4xl">📊</div>
          </div>
        </div>
      </div>

      {/* Détails */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Récompenses */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">📦 État des Récompenses</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded">
              <span className="text-gray-700">Utilisées</span>
              <span className="font-bold text-green-600">
                {stats?.used_rewards || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
              <span className="text-gray-700">En attente</span>
              <span className="font-bold text-blue-600">
                {stats?.active_rewards || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded">
              <span className="text-gray-700">Expirées</span>
              <span className="font-bold text-red-600">
                {stats?.expired_rewards || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Top Récompenses */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">🏆 Récompenses Populaires</h2>
          <div className="space-y-3">
            {stats?.top_rewards && stats.top_rewards.length > 0 ? (
              stats.top_rewards.map((reward, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-700 capitalize">
                    {reward._id.replace('_', ' ')}
                  </span>
                  <span className="font-bold text-gray-900">
                    {reward.count}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Aucune donnée disponible</p>
            )}
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={loadStats}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          🔄 Actualiser
        </button>
      </div>
    </div>
  );
};

export default SurpriseDuJourDashboard;
