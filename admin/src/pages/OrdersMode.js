import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Package, TrendingUp, AlertCircle, Pause, Play, Clock, XCircle, CheckCircle, Truck, Calendar } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const OrdersMode = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboard, setDashboard] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [noMoreOrdersToday, setNoMoreOrdersToday] = useState(false);
  const [settings, setSettings] = useState(null);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showNoMoreOrdersModal, setShowNoMoreOrdersModal] = useState(false);
  const [pauseDuration, setPauseDuration] = useState('30');

  useEffect(() => {
    loadDashboard();
    loadPauseStatus();
    loadSettings();
    const interval = setInterval(() => {
      loadDashboard();
      loadPauseStatus();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/admin/dashboard/simple`);
      setDashboard(response.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  const loadPauseStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/admin/pause/status`);
      setIsPaused(response.data.is_paused);
      setNoMoreOrdersToday(response.data.no_more_orders_today);
    } catch (error) {
      console.error('Error loading pause status:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/admin/settings`);
      setSettings(response.data);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handlePause = async () => {
    try {
      const duration = pauseDuration === 'until_tonight' ? null : parseInt(pauseDuration);
      await axios.post(`${API_URL}/api/v1/admin/pause`, {
        is_paused: true,
        pause_reason: 'Trop de commandes',
        pause_duration_minutes: duration
      });
      setShowPauseModal(false);
      loadPauseStatus();
      alert('✅ Restaurant mis en pause');
    } catch (error) {
      alert('❌ Erreur lors de la mise en pause');
    }
  };

  const handleResume = async () => {
    try {
      await axios.post(`${API_URL}/api/v1/admin/pause`, {
        is_paused: false
      });
      loadPauseStatus();
      alert('✅ Restaurant réouvert');
    } catch (error) {
      alert('❌ Erreur');
    }
  };

  const handleNoMoreOrders = async (enable) => {
    try {
      await axios.post(`${API_URL}/api/v1/admin/no-more-orders-today`, {
        no_more_orders_today: enable
      });
      setShowNoMoreOrdersModal(false);
      loadPauseStatus();
      alert(enable ? '🚫 Plus de commandes pour aujourd\'hui' : '✅ Commandes réouvertes');
    } catch (error) {
      alert('❌ Erreur');
    }
  };

  const handleNavigateToMode = (mode) => {
    // Demander le PIN puis naviguer
    const pin = prompt(`Code PIN pour Mode ${mode === 'delivery' ? 'Livraison' : 'Réservation'} :`);
    if (pin) {
      axios.post(`${API_URL}/api/v1/admin/verify-pin`, { pin, mode })
        .then(() => {
          window.location.href = `/admin/${mode}-mode`;
        })
        .catch(() => {
          alert('❌ Code PIN incorrect');
        });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="🍽️ Mode Commande" subtitle="Gestion simplifiée pour le personnel" />
      
      <div className="p-6 space-y-6">
        {/* Alert Pause/No More Orders */}
        {(isPaused || noMoreOrdersToday) && (
          <Card className="bg-red-50 border-2 border-red-500">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <div>
                  <h3 className="font-bold text-red-900">
                    {noMoreOrdersToday ? '🚫 PLUS DE COMMANDES AUJOURD\'HUI' : '⏸️ RESTAURANT EN PAUSE'}
                  </h3>
                  {isPaused && <p className="text-sm text-red-700">Les clients ne peuvent pas commander actuellement</p>}
                </div>
              </div>
              {isPaused && (
                <Button onClick={handleResume} className="bg-green-600 hover:bg-green-700">
                  <Play className="w-4 h-4 mr-2" />
                  Reprendre
                </Button>
              )}
              {noMoreOrdersToday && (
                <Button onClick={() => handleNoMoreOrders(false)} className="bg-green-600 hover:bg-green-700">
                  Réouvrir
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 font-medium ${activeTab === 'dashboard' ? 'border-b-2 border-primary text-primary' : 'text-gray-600'}`}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setActiveTab('pause')}
            className={`px-4 py-2 font-medium ${activeTab === 'pause' ? 'border-b-2 border-primary text-primary' : 'text-gray-600'}`}
          >
            ⏸️ Pause & Fermeture
          </button>
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-4 py-2 font-medium ${activeTab === 'stock' ? 'border-b-2 border-primary text-primary' : 'text-gray-600'}`}
          >
            📦 Rupture
          </button>
          <button
            onClick={() => window.location.href = '/admin/orders'}
            className="px-4 py-2 font-medium text-gray-600 hover:text-primary"
          >
            📋 Commandes
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && dashboard && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <CheckCircle className="w-12 h-12 text-white/80" />
                    <span className="text-5xl font-black">{dashboard.orders_completed_today}</span>
                  </div>
                  <p className="text-xl font-bold">Commandes traitées</p>
                  <p className="text-sm text-white/80">Aujourd'hui</p>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <TrendingUp className="w-12 h-12 text-white/80" />
                    <span className="text-5xl font-black">{dashboard.revenue_today.toFixed(0)}€</span>
                  </div>
                  <p className="text-xl font-bold">Chiffre d'affaires</p>
                  <p className="text-sm text-white/80">Aujourd'hui</p>
                </div>
              </Card>
            </div>

            {/* Boutons vers autres modes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {settings?.enable_delivery && (
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleNavigateToMode('delivery')}>
                  <div className="p-6 flex items-center gap-4">
                    <div className="bg-orange-100 p-4 rounded-full">
                      <Truck className="w-8 h-8 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Mode Livraison</h3>
                      <p className="text-sm text-gray-600">Gérer les livraisons en cours</p>
                    </div>
                  </div>
                </Card>
              )}
              
              {settings?.enable_reservations && (
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleNavigateToMode('reservation')}>
                  <div className="p-6 flex items-center gap-4">
                    <div className="bg-purple-100 p-4 rounded-full">
                      <Calendar className="w-8 h-8 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Mode Réservation</h3>
                      <p className="text-sm text-gray-600">Gérer les réservations</p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Pause Tab */}
        {activeTab === 'pause' && (
          <div className="space-y-4">
            <Card>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4">⏸️ Mettre en pause les commandes</h3>
                <p className="text-gray-600 mb-4">Empêche temporairement les clients de passer commande</p>
                
                {!isPaused ? (
                  <Button onClick={() => setShowPauseModal(true)} className="bg-orange-500 hover:bg-orange-600">
                    <Pause className="w-4 h-4 mr-2" />
                    Mettre en pause
                  </Button>
                ) : (
                  <Button onClick={handleResume} className="bg-green-600 hover:bg-green-700">
                    <Play className="w-4 h-4 mr-2" />
                    Reprendre les commandes
                  </Button>
                )}
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4">🚫 Plus de commandes pour aujourd'hui</h3>
                <p className="text-gray-600 mb-4">Bloque toutes les nouvelles commandes jusqu'à demain</p>
                
                {!noMoreOrdersToday ? (
                  <Button onClick={() => setShowNoMoreOrdersModal(true)} className="bg-red-600 hover:bg-red-700">
                    <XCircle className="w-4 h-4 mr-2" />
                    Plus de commandes aujourd'hui
                  </Button>
                ) : (
                  <Button onClick={() => handleNoMoreOrders(false)} className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Réouvrir les commandes
                  </Button>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Stock Tab */}
        {activeTab === 'stock' && (
          <Card>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">📦 Gestion des ruptures</h3>
              <p className="text-gray-600 mb-4">Cette fonctionnalité sera disponible via le module de gestion des stocks</p>
              <Button onClick={() => window.location.href = '/admin/stock'}>
                Ouvrir gestion des stocks
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Pause Modal */}
      {showPauseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">⏸️ Mettre en pause</h3>
              <p className="text-gray-600 mb-4">Pendant combien de temps ?</p>
              
              <select
                value={pauseDuration}
                onChange={(e) => setPauseDuration(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg mb-4"
              >
                <option value="30">30 minutes</option>
                <option value="60">1 heure</option>
                <option value="120">2 heures</option>
                <option value="until_tonight">Jusqu'à ce soir</option>
                <option value="indefinite">Indéfini</option>
              </select>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowPauseModal(false)} className="flex-1">
                  Annuler
                </Button>
                <Button onClick={handlePause} className="flex-1 bg-orange-500 hover:bg-orange-600">
                  Confirmer
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* No More Orders Modal */}
      {showNoMoreOrdersModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">🚫 Plus de commandes</h3>
              <p className="text-gray-600 mb-4">Êtes-vous sûr de ne plus vouloir accepter de commandes aujourd'hui ?</p>
              <p className="text-sm text-red-600 mb-4">Les clients verront un message à l'ouverture de l'app</p>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowNoMoreOrdersModal(false)} className="flex-1">
                  Annuler
                </Button>
                <Button onClick={() => handleNoMoreOrders(true)} className="flex-1 bg-red-600 hover:bg-red-700">
                  Confirmer
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
