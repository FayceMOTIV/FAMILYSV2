import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { Sparkles, TrendingUp, Calendar, Target, CheckCircle, XCircle, Loader, RefreshCw, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

export const AICampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPendingCampaigns();
  }, []);

  const loadPendingCampaigns = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/api/v1/fb/ai-marketing/campaigns/pending`);
      setCampaigns(response.data.campaigns || []);
    } catch (error) {
      console.error('Erreur chargement campagnes:', error);
      setError('Impossible de charger les campagnes. Vérifiez que le backend est démarré.');
    } finally {
      setLoading(false);
    }
  };

  const generateCampaigns = async () => {
    setGenerating(true);
    setError('');
    try {
      const response = await axios.post(`${API_URL}/api/v1/fb/ai-marketing/campaigns/generate`, { 
        force_regenerate: true 
      });
      await loadPendingCampaigns();
      const count = response.data.campaigns?.length || 0;
      alert(`✨ ${count} nouvelles campagnes générées !`);
    } catch (error) {
      console.error('Erreur génération:', error);
      const errMsg = error.response?.data?.detail || 'Erreur lors de la génération';
      setError(errMsg);
      alert('❌ ' + errMsg);
    } finally {
      setGenerating(false);
    }
  };

  const validateCampaign = async (campaignId, accepted) => {
    try {
      await axios.post(`${API_URL}/api/v1/fb/ai-marketing/campaigns/${campaignId}/validate`, { 
        accepted, 
        notes: null 
      });
      
      // Retirer la campagne de la liste
      setCampaigns(campaigns.filter(c => c.id !== campaignId));
      
      if (accepted) {
        alert('✅ Campagne activée ! Une promo en brouillon a été créée dans Promotions.');
      } else {
        alert('❌ Campagne refusée.');
      }
    } catch (error) {
      console.error('Erreur validation:', error);
      alert('Erreur lors de la validation: ' + (error.response?.data?.detail || error.message));
    }
  };

  const getCampaignTypeIcon = (type) => {
    switch (type) {
      case 'produit': return '🍔';
      case 'fidelite': return '⭐';
      case 'happy_hour': return '⏰';
      case 'reactivation': return '🔄';
      case 'panier_moyen': return '🛒';
      default: return '💡';
    }
  };

  const getCampaignTypeColor = (type) => {
    switch (type) {
      case 'produit': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'fidelite': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'happy_hour': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'reactivation': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'panier_moyen': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
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

  return (
    <div>
      <Header 
        title="🤖 Campagnes IA" 
        subtitle="L'IA analyse tes données et te propose des campagnes pertinentes"
      />
      
      <div className="p-8">
        {/* Erreur */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-700 font-medium">Erreur</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
            <Button size="sm" variant="outline" onClick={loadPendingCampaigns}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Actions */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Campagnes en attente</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {campaigns.length} {campaigns.length > 1 ? 'campagnes proposées' : 'campagne proposée'}
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={loadPendingCampaigns} 
              disabled={loading}
              variant="outline"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
            <Button 
              onClick={generateCampaigns} 
              disabled={generating}
            >
              {generating ? (
                <>
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  Génération...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Générer des campagnes
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Campagnes */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : campaigns.length === 0 ? (
          <Card>
            <CardContent className="text-center py-20">
              <Sparkles className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                Aucune campagne en attente
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Clique sur "Générer des campagnes" pour que l'IA analyse tes données de vente et te propose des offres pertinentes.
              </p>
              <Button onClick={generateCampaigns} disabled={generating}>
                <Sparkles className="w-4 h-4 mr-2" />
                Générer des campagnes
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-gold/10">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-2xl">{getCampaignTypeIcon(campaign.type)}</span>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${getCampaignTypeColor(campaign.type)}`}>
                          {(campaign.type || 'promo').replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <CardTitle className="text-xl">{campaign.name}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Message IA */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {campaign.message}
                    </p>
                  </div>

                  {/* Détails */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Période</p>
                        <p className="font-semibold text-gray-800 dark:text-white">
                          {formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <div>
                        <p className="text-xs text-gray-500">Impact estimé</p>
                        <p className="font-semibold text-green-600">
                          {campaign.impact_estimate?.ca_increase || '+5-10%'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-purple-500" />
                      <div>
                        <p className="text-xs text-gray-500">Réduction</p>
                        <p className="font-semibold text-gray-800 dark:text-white">
                          {campaign.discount_type === 'percentage' ? `${campaign.discount_value}%` : `${campaign.discount_value}€`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-orange-500" />
                      <div>
                        <p className="text-xs text-gray-500">Difficulté</p>
                        <p className="font-semibold text-gray-800 dark:text-white capitalize">
                          {campaign.impact_estimate?.difficulty || 'Facile'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {campaign.target_hours && (
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded text-sm">
                      <p className="font-semibold text-purple-800 dark:text-purple-200">
                        ⏰ Horaires cibles : {campaign.target_hours}
                      </p>
                    </div>
                  )}

                  {/* Boutons de validation */}
                  <div className="flex space-x-3 pt-4 border-t dark:border-gray-700">
                    <Button
                      onClick={() => validateCampaign(campaign.id, true)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Activer
                    </Button>
                    <Button
                      onClick={() => validateCampaign(campaign.id, false)}
                      variant="outline"
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Refuser
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
