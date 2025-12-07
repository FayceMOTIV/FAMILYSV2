/**
 * Dashboard - Surprise du Jour
 * Stats complètes avec coût mensuel
 */
import React, { useState, useEffect } from 'react';
import { SurpriseDuJourTabs } from '../components/SurpriseDuJourTabs';
import { getStats } from '../services/surpriseDuJour';

const SurpriseDuJourDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await getStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
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

      {/* Tabs */}
      <SurpriseDuJourTabs />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Spins Aujourd'hui */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Spins Aujourd'hui</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.spins_today || 0}</p>
            </div>
            <div className="text-4xl">🎲</div>
          </div>
        </div>

        {/* Spins Ce Mois */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Spins Ce Mois</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.spins_month || 0}</p>
            </div>
            <div className="text-4xl">📅</div>
          </div>
        </div>

        {/* Récompenses Actives */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Récompenses Actives</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.active_rewards || 0}</p>
            </div>
            <div className="text-4xl">🎁</div>
          </div>
        </div>

        {/* Coût Mensuel */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Coût Ce Mois</p>
              <p className="text-3xl font-bold text-red-600">{stats?.monthly_cost || 0}€</p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>
      </div>

      {/* Détails */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* État des Récompenses */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">🎁 État des Récompenses</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-gray-700">Utilisées</span>
              <span className="text-xl font-bold text-green-600">{stats?.used_rewards || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-gray-700">En attente</span>
              <span className="text-xl font-bold text-blue-600">{stats?.active_rewards || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Expirées</span>
              <span className="text-xl font-bold text-gray-600">{stats?.expired_rewards || 0}</span>
            </div>
          </div>
        </div>

        {/* Taux de Conversion */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">📈 Performance</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">Taux de Conversion</span>
                <span className="font-bold text-gray-900">{stats?.conversion_rate || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-green-500 h-4 rounded-full transition-all"
                  style={{ width: `${Math.min(stats?.conversion_rate || 0, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Pourcentage de récompenses utilisées vs distribuées
              </p>
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                <span className="font-bold">💡 Conseil :</span> Un bon taux de conversion est entre 60-80%. 
                {stats?.conversion_rate < 50 && " Pensez à envoyer des rappels aux clients !"}
                {stats?.conversion_rate >= 80 && " Excellent ! Vos clients utilisent bien leurs récompenses."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bouton Actualiser */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={loadStats}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-red-700 transition"
        >
          🔄 Actualiser
        </button>
      </div>
    </div>
  );
};

export default SurpriseDuJourDashboard;
