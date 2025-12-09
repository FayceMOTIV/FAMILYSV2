import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { CheckCircle, XCircle, TrendingUp, Users, DollarSign, Award, Loader, RefreshCw, Clock, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

export const CampaignHistory = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, accepted, refused
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      // Charger les campagnes
      const statusFilter = filter === 'all' ? '' : `?status=${filter}`;
      const campaignsRes = await axios.get(`${API_URL}/api/v1/fb/ai-marketing/campaigns/all${statusFilter}`);
      
      // Charger les stats
      const statsRes = await axios.get(`${API_URL}/api/v1/fb/ai-marketing/stats`);
      
      setCampaigns(campaignsRes.data.campaigns || []);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Erreur chargement données:', error);
      setError('Impossible de charger les données. Vérifiez que le backend est démarré.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'accepted') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Activée
        </span>
      );
    } else if (status === 'refused') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          <XCircle className="w-3 h-3 mr-1" />
          Refusée
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          <Clock className="w-3 h-3 mr-1" />
          En attente
        </span>
      );
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'produit': return '🍔';
      case 'fidelite': return '⭐';
      case 'happy_hour': return '⏰';
      case 'reactivation': return '🔄';
      case 'panier_moyen': return '🛒';
      default: return '💡';
    }
  };

  return (
    <div>
      <Header 
        title="📊 Historique & Résultats" 
        subtitle="Suivi des performances de toutes tes campagnes IA"
      />
      
      <div className="p-8">
        {/* Erreur */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-700">{error}</p>
            </div>
            <button onClick={loadData} className="p-2 hover:bg-red-100 rounded">
              <RefreshCw className="w-4 h-4 text-red-500" />
            </button>
          </div>
        )}

        {/* Stats globales */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Campagnes totales</p>
                    <p className="text-3xl font-bold text-gray-800 dark:text-white">{stats.total_campaigns || 0}</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Acceptées</p>
                    <p className="text-3xl font-bold text-green-600">{stats.accepted || 0}</p>
                    <p className="text-xs text-gray-500">Taux: {stats.acceptance_rate || 0}%</p>
                  </div>
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">CA généré</p>
                    <p className="text-3xl font-bold text-yellow-600">{stats.total_ca_generated || 0}€</p>
                  </div>
                  <DollarSign className="w-10 h-10 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pts fidélité</p>
                    <p className="text-3xl font-bold text-purple-600">{stats.total_fidelity_points || 0}</p>
                  </div>
                  <Award className="w-10 h-10 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Résumé hebdo IA */}
        {stats?.weekly_summary && (
          <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>💡 Résumé IA de la semaine</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {stats.weekly_summary}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Filtres */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filter === 'all'
                ? 'bg-primary text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
            }`}
          >
            Toutes ({stats?.total_campaigns || 0})
          </button>
          <button
            onClick={() => setFilter('accepted')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filter === 'accepted'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
            }`}
          >
            ✅ Activées ({stats?.accepted || 0})
          </button>
          <button
            onClick={() => setFilter('refused')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filter === 'refused'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
            }`}
          >
            ❌ Refusées ({stats?.refused || 0})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filter === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
            }`}
          >
            ⏳ En attente ({stats?.pending || 0})
          </button>
        </div>

        {/* Table historique */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">Nom</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">Statut</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">Réduction</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">Impact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {campaigns.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                          <div className="flex flex-col items-center">
                            <TrendingUp className="w-12 h-12 text-gray-300 mb-4" />
                            <p className="text-lg font-medium">Aucune campagne trouvée</p>
                            <p className="text-sm">Générez des campagnes dans l'onglet "Campagnes proposées"</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      campaigns.map((campaign) => (
                        <tr key={campaign.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-800 dark:text-white">
                            {formatDate(campaign.created_at)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">{getTypeIcon(campaign.type)}</span>
                              <div>
                                <div className="text-sm font-semibold text-gray-800 dark:text-white">{campaign.name}</div>
                                <div className="text-xs text-gray-500 line-clamp-1 max-w-xs">{campaign.message}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 capitalize">
                            {(campaign.type || 'promo').replace('_', ' ')}
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(campaign.status)}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-800 dark:text-white">
                            {campaign.discount_type === 'percentage' ? `${campaign.discount_value}%` : `${campaign.discount_value}€`}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-green-600">
                            {campaign.impact_estimate?.ca_increase || 'N/A'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
