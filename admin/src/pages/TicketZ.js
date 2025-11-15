import React, { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { AlertCircle, CheckCircle, FileText, Clock, DollarSign, Users } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://chefs-control.preview.emergentagent.com';

export const TicketZ = () => {
  const [dailyStatus, setDailyStatus] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadDailyStatus();
    loadTickets();
  }, []);

  const loadDailyStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/v1/admin/ticket-z/daily-status/${today}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!response.ok) {
        console.error('Failed to load daily status:', response.status);
        return;
      }
      const data = await response.json();
      setDailyStatus(data);
    } catch (error) {
      console.error('Error loading daily status:', error);
    }
  };

  const loadTickets = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/v1/admin/ticket-z`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!response.ok) {
        console.error('Failed to load tickets:', response.status);
        return;
      }
      const data = await response.json();
      setTickets(data);
    } catch (error) {
      console.error('Error loading tickets:', error);
    }
  };

  const handleCloseDay = async () => {
    if (!window.confirm('⚠️ Confirmer la clôture de journée ? Cette action est irréversible.')) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/v1/admin/ticket-z`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ date: today })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Erreur lors de la clôture');
      }

      alert('✅ Journée clôturée avec succès !');
      loadDailyStatus();
      loadTickets();
    } catch (error) {
      alert(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">📊 Ticket Z - Clôture de Journée</h1>
        <p className="text-gray-600">Gérez la clôture quotidienne de votre établissement</p>
      </div>

      {/* Status de la journée actuelle */}
      {dailyStatus && (
        <div className="mb-8">
          <div className={`p-6 rounded-lg border-2 ${
            dailyStatus.is_closed 
              ? 'bg-green-50 border-green-500' 
              : dailyStatus.needs_closure 
                ? 'bg-red-50 border-red-500' 
                : 'bg-blue-50 border-blue-500'
          }`}>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2 flex items-center">
                  {dailyStatus.is_closed ? (
                    <><CheckCircle className="w-6 h-6 text-green-600 mr-2" /> Journée clôturée</>
                  ) : dailyStatus.needs_closure ? (
                    <><AlertCircle className="w-6 h-6 text-red-600 mr-2" /> ⚠️ Clôture requise</>
                  ) : (
                    <><Clock className="w-6 h-6 text-blue-600 mr-2" /> Journée en cours</>
                  )}
                </h2>
                <p className="text-gray-700 mb-3">Date : {dailyStatus.date}</p>
                
                {!dailyStatus.is_closed && (
                  <div className="space-y-2">
                    {dailyStatus.pending_orders > 0 ? (
                      <div className="flex items-center text-red-700 font-semibold">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        {dailyStatus.pending_orders} commande(s) en attente
                      </div>
                    ) : (
                      <div className="flex items-center text-green-700 font-semibold">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Toutes les commandes sont traitées
                      </div>
                    )}
                    
                    {dailyStatus.needs_closure && (
                      <div className="flex items-center text-red-700 font-bold mt-2">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        La clôture de la veille n'a pas été effectuée
                      </div>
                    )}
                  </div>
                )}
              </div>

              {!dailyStatus.is_closed && (
                <Button
                  onClick={handleCloseDay}
                  disabled={!dailyStatus.can_close || loading}
                  className={`${
                    dailyStatus.can_close 
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' 
                      : 'bg-gray-400'
                  } text-white font-bold px-6 py-3 shadow-lg`}
                >
                  {loading ? 'Clôture en cours...' : '🔒 Clôturer la journée'}
                </Button>
              )}
            </div>

            {dailyStatus.is_closed && dailyStatus.ticket_z && (
              <div className="mt-4 pt-4 border-t border-green-300">
                <Button
                  onClick={() => setSelectedTicket(dailyStatus.ticket_z)}
                  className="bg-white text-green-700 border-2 border-green-500 hover:bg-green-100"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Voir le Ticket Z
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Historique des Tickets Z */}
      <div>
        <h2 className="text-2xl font-bold mb-4">📜 Historique des clôtures</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tickets.map(ticket => (
            <div
              key={ticket.id}
              onClick={() => setSelectedTicket(ticket)}
              className="p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-lg">{ticket.date}</span>
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ventes:</span>
                  <span className="font-bold text-green-600">{ticket.total_sales.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Commandes:</span>
                  <span className="font-bold">{ticket.total_orders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Couverts:</span>
                  <span className="font-bold">{ticket.covers_count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal détail Ticket Z */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">📊 Ticket Z - {selectedTicket.date}</h2>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Résumé */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm text-gray-600">Ventes totales</span>
                  </div>
                  <p className="text-3xl font-bold text-green-600">{selectedTicket.total_sales.toFixed(2)}€</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Users className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm text-gray-600">Couverts</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-600">{selectedTicket.covers_count}</p>
                </div>
              </div>

              {/* Commandes */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-bold mb-3">📦 Commandes</h3>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-2xl font-bold">{selectedTicket.total_orders}</p>
                    <p className="text-xs text-gray-600">Total</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{selectedTicket.completed_orders}</p>
                    <p className="text-xs text-gray-600">Terminées</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">{selectedTicket.cancelled_orders}</p>
                    <p className="text-xs text-gray-600">Annulées</p>
                  </div>
                </div>
              </div>

              {/* Répartition paiements */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-bold mb-3">💳 Répartition des paiements</h3>
                <div className="space-y-2">
                  {selectedTicket.payment_breakdown.espece > 0 && (
                    <div className="flex justify-between p-2 bg-green-100 rounded">
                      <span className="font-medium">💵 Espèce</span>
                      <span className="font-bold">{selectedTicket.payment_breakdown.espece.toFixed(2)}€</span>
                    </div>
                  )}
                  {selectedTicket.payment_breakdown.cb > 0 && (
                    <div className="flex justify-between p-2 bg-blue-100 rounded">
                      <span className="font-medium">💳 CB</span>
                      <span className="font-bold">{selectedTicket.payment_breakdown.cb.toFixed(2)}€</span>
                    </div>
                  )}
                  {selectedTicket.payment_breakdown.cheque > 0 && (
                    <div className="flex justify-between p-2 bg-purple-100 rounded">
                      <span className="font-medium">📝 Chèque</span>
                      <span className="font-bold">{selectedTicket.payment_breakdown.cheque.toFixed(2)}€</span>
                    </div>
                  )}
                  {selectedTicket.payment_breakdown.ticket_restaurant > 0 && (
                    <div className="flex justify-between p-2 bg-orange-100 rounded">
                      <span className="font-medium">🎟️ Ticket restaurant</span>
                      <span className="font-bold">{selectedTicket.payment_breakdown.ticket_restaurant.toFixed(2)}€</span>
                    </div>
                  )}
                  {selectedTicket.payment_breakdown.online > 0 && (
                    <div className="flex justify-between p-2 bg-indigo-100 rounded">
                      <span className="font-medium">🌐 Paiement en ligne</span>
                      <span className="font-bold">{selectedTicket.payment_breakdown.online.toFixed(2)}€</span>
                    </div>
                  )}
                </div>
              </div>

              {/* TVA */}
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-bold">💰 TVA collectée</span>
                  <span className="text-2xl font-bold text-yellow-700">{selectedTicket.tva_collected.toFixed(2)}€</span>
                </div>
              </div>

              {/* Métadonnées */}
              <div className="pt-4 border-t text-xs text-gray-500">
                <p>Clôturé par: {selectedTicket.closed_by}</p>
                <p>Le: {new Date(selectedTicket.closed_at).toLocaleString('fr-FR')}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
