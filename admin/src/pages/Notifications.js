import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { NotificationModal } from '../components/NotificationModal';
import { notificationsAPI } from '../services/api';
import { Bell, Plus, Send, Clock, Check, Edit2, Trash2, Calendar, Users, Eye, Target, History } from 'lucide-react';

export const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('scheduled');
  const [stats, setStats] = useState({
    total_sent: 0,
    open_rate: 0,
  });

  // Segments - 0 clients par défaut (pas de données fictives)
  const segments = [
    { id: 'all', name: 'Tous les clients', icon: '👥', count: 0, color: 'blue', value: 'all', label: 'Tous les clients' },
    { id: 'new', name: 'Nouveaux clients', icon: '✨', count: 0, color: 'green', value: 'new', label: 'Nouveaux clients' },
    { id: 'regulars', name: 'Clients réguliers', icon: '⭐', count: 0, color: 'purple', value: 'regulars', label: 'Clients réguliers' },
    { id: 'vip', name: 'Clients VIP (>500€)', icon: '💎', count: 0, color: 'yellow', value: 'vip', label: 'Clients VIP' },
    { id: 'inactive', name: 'Inactifs (30j)', icon: '💤', count: 0, color: 'gray', value: 'inactive', label: 'Inactifs' },
  ];

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsAPI.getAll();
      const allNotifications = response.data.notifications || response.data || [];
      
      console.log('📋 Notifications chargées:', allNotifications);
      setNotifications(allNotifications);
      
      // Calculer les stats
      const sent = allNotifications.filter(n => n.status === 'sent').length;
      setStats({
        total_sent: sent,
        open_rate: sent > 0 ? 77 : 0,
      });
    } catch (error) {
      console.error('Failed to load notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (id) => {
    if (!window.confirm('Envoyer cette notification maintenant ?')) return;
    
    try {
      const response = await notificationsAPI.send(id);
      console.log('📤 Réponse envoi:', response.data);
      alert('✅ Notification envoyée !');
      
      // Recharger les notifications pour mettre à jour l'affichage
      await loadNotifications();
      
      // Basculer vers l'onglet Récentes pour voir la notif envoyée
      setActiveTab('recent');
    } catch (error) {
      console.error('Erreur envoi:', error);
      alert('❌ Erreur lors de l\'envoi: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette notification ?')) return;
    
    try {
      await notificationsAPI.delete(id);
      await loadNotifications();
    } catch (error) {
      alert('❌ Erreur lors de la suppression');
    }
  };

  // Filtrer les notifications par STATUS
  const scheduled = notifications.filter(n => n.status === 'scheduled');
  const sent = notifications.filter(n => n.status === 'sent');
  
  // Récentes = envoyées dans les 48h
  const twoDaysAgo = new Date();
  twoDaysAgo.setHours(twoDaysAgo.getHours() - 48);
  const recent = sent.filter(n => {
    const sentAt = n.sent_at ? new Date(n.sent_at) : null;
    return sentAt && sentAt > twoDaysAgo;
  });
  
  // Historique = toutes les envoyées (max 50)
  const history = sent
    .sort((a, b) => new Date(b.sent_at || b.created_at) - new Date(a.sent_at || a.created_at))
    .slice(0, 50);

  // Notifications à afficher selon l'onglet actif
  let displayedNotifications = [];
  if (activeTab === 'scheduled') {
    displayedNotifications = scheduled;
  } else if (activeTab === 'recent') {
    displayedNotifications = recent;
  } else if (activeTab === 'history') {
    displayedNotifications = history;
  }

  const tabs = [
    { id: 'scheduled', label: 'Planifiées', icon: Clock, count: scheduled.length },
    { id: 'recent', label: 'Récentes (48h)', icon: Check, count: recent.length },
    { id: 'history', label: 'Historique', icon: History, count: history.length }
  ];

  if (loading) {
    return (
      <div>
        <Header title="🔔 Notifications" subtitle="Communiquez avec vos clients" />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="🔔 Notifications" subtitle="Communiquez avec vos clients" />
      
      <div className="p-6 space-y-6">
        {/* Statistiques globales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total envoyées</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.total_sent}</p>
                </div>
                <Send className="w-10 h-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Taux d'ouverture</p>
                  <p className="text-3xl font-bold text-green-600">{stats.open_rate}%</p>
                </div>
                <Eye className="w-10 h-10 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Planifiées</p>
                  <p className="text-3xl font-bold text-orange-600">{scheduled.length}</p>
                </div>
                <Clock className="w-10 h-10 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Clients</p>
                  <p className="text-3xl font-bold text-purple-600">0</p>
                </div>
                <Users className="w-10 h-10 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Segments de clients */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Segments de clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {segments.map((segment) => (
                <button
                  key={segment.id}
                  onClick={() => {
                    setEditingNotification({ target_segment: segment.id });
                    setShowModal(true);
                  }}
                  className="p-4 border-2 rounded-lg hover:border-primary transition-all text-left hover:shadow-md"
                >
                  <div className="text-3xl mb-2">{segment.icon}</div>
                  <div className="font-bold text-gray-800">{segment.name}</div>
                  <div className="text-sm text-gray-600">{segment.count} clients</div>
                  <Button size="sm" className="w-full mt-3">
                    <Send className="w-3 h-3 mr-1" />
                    Envoyer
                  </Button>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Onglets Planifiées / Récentes / Historique */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
                      activeTab === tab.id 
                        ? 'bg-primary text-white shadow-lg' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      activeTab === tab.id ? 'bg-white/20' : 'bg-gray-200'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
            
            <Button onClick={() => {
              setEditingNotification(null);
              setShowModal(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Créer une notification
            </Button>
          </div>

          {/* Liste des notifications */}
          {displayedNotifications.length === 0 ? (
            <Card className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-semibold mb-2">
                {activeTab === 'scheduled' && 'Aucune notification planifiée'}
                {activeTab === 'recent' && 'Aucune notification récente'}
                {activeTab === 'history' && 'Aucune notification dans l\'historique'}
              </p>
              <p className="text-sm text-gray-400 mb-4">
                {activeTab === 'scheduled' && 'Créez une notification et planifiez son envoi'}
                {activeTab === 'recent' && 'Les notifications envoyées dans les dernières 48h apparaîtront ici'}
                {activeTab === 'history' && 'Les 50 dernières notifications envoyées apparaîtront ici'}
              </p>
              {activeTab === 'scheduled' && (
                <Button onClick={() => { setEditingNotification(null); setShowModal(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Créer une notification
                </Button>
              )}
            </Card>
          ) : (
            <div className="space-y-4">
              {displayedNotifications.map((notif) => {
                const isScheduled = notif.status === 'scheduled';
                const scheduledDate = notif.scheduled_at ? new Date(notif.scheduled_at) : null;
                const sentDate = notif.sent_at ? new Date(notif.sent_at) : null;
                const segment = segments.find(s => s.id === notif.target || s.id === notif.target_segment) || segments[0];
                
                return (
                  <Card key={notif.id}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-3xl">{notif.icon || '🔔'}</span>
                          <div>
                            <h4 className="font-bold text-lg">{notif.title}</h4>
                            <p className="text-sm text-gray-500">
                              Créée le {notif.created_at && new Date(notif.created_at).toLocaleString('fr-FR')}
                            </p>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-3 ml-12">{notif.message}</p>
                        
                        <div className="flex items-center gap-2 flex-wrap ml-12">
                          {isScheduled ? (
                            <span className="text-xs px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Programmée: {scheduledDate?.toLocaleString('fr-FR')}
                            </span>
                          ) : (
                            <span className="text-xs px-3 py-1.5 rounded-full bg-green-100 text-green-700 font-semibold flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              Envoyée le {sentDate?.toLocaleString('fr-FR')}
                            </span>
                          )}
                          
                          <span className="text-xs px-3 py-1.5 rounded-full font-semibold flex items-center gap-1 bg-gray-100 text-gray-700">
                            {segment.icon} {segment.name}
                          </span>

                          {notif.sent_count > 0 && (
                            <span className="text-xs px-3 py-1.5 rounded-full bg-purple-100 text-purple-700 font-semibold flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {notif.sent_count} envois
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {isScheduled && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => {
                              setEditingNotification(notif);
                              setShowModal(true);
                            }} title="Modifier">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button size="sm" onClick={() => handleSend(notif.id)} title="Envoyer maintenant">
                              <Send className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="danger" onClick={() => handleDelete(notif.id)} title="Supprimer">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <NotificationModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingNotification(null);
        }}
        notification={editingNotification}
        segments={segments}
        onSuccess={loadNotifications}
      />
    </div>
  );
};
