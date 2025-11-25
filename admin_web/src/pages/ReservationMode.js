import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Calendar, Users, Clock, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const ReservationMode = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('today');

  useEffect(() => {
    loadReservations();
    const interval = setInterval(loadReservations, 30000);
    return () => clearInterval(interval);
  }, [filter]);

  const loadReservations = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/admin/reservations`);
      let filtered = response.data.reservations || [];
      
      const today = new Date().toISOString().split('T')[0];
      
      if (filter === 'today') {
        filtered = filtered.filter(r => r.date === today);
      } else if (filter === 'upcoming') {
        filtered = filtered.filter(r => r.date >= today && r.status === 'confirmed');
      } else if (filter === 'pending') {
        filtered = filtered.filter(r => r.status === 'pending');
      }
      
      setReservations(filtered);
    } catch (error) {
      console.error('Error loading reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id) => {
    try {
      await axios.put(`${API_URL}/api/v1/admin/reservations/${id}`, {
        status: 'confirmed'
      });
      loadReservations();
      alert('✅ Réservation confirmée');
    } catch (error) {
      alert('❌ Erreur');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Annuler cette réservation ?')) return;
    try {
      await axios.put(`${API_URL}/api/v1/admin/reservations/${id}`, {
        status: 'cancelled'
      });
      loadReservations();
      alert('✅ Réservation annulée');
    } catch (error) {
      alert('❌ Erreur');
    }
  };

  const handleComplete = async (id) => {
    try {
      await axios.put(`${API_URL}/api/v1/admin/reservations/${id}`, {
        status: 'completed'
      });
      loadReservations();
      alert('✅ Client arrivé');
    } catch (error) {
      alert('❌ Erreur');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="📅 Mode Réservation" subtitle="Gestion des réservations" />
      
      <div className="p-6">
        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => setFilter('today')}
            variant={filter === 'today' ? 'primary' : 'outline'}
          >
            Aujourd'hui
          </Button>
          <Button
            onClick={() => setFilter('upcoming')}
            variant={filter === 'upcoming' ? 'primary' : 'outline'}
          >
            À venir
          </Button>
          <Button
            onClick={() => setFilter('pending')}
            variant={filter === 'pending' ? 'primary' : 'outline'}
          >
            En attente
          </Button>
        </div>

        {reservations.length === 0 ? (
          <Card>
            <div className="p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">Aucune réservation</h3>
              <p className="text-gray-500">Les réservations apparaîtront ici</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {reservations.map(reservation => (
              <Card key={reservation.id} className="hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-black text-primary mb-1">{reservation.customer_name}</h3>
                      <p className="text-sm text-gray-600">{reservation.customer_phone}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-full font-bold ${
                      reservation.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      reservation.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                      reservation.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {reservation.status === 'confirmed' ? '✅ Confirmée' :
                       reservation.status === 'pending' ? '⏳ En attente' :
                       reservation.status === 'completed' ? '🎉 Terminée' :
                       '❌ Annulée'}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4 bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Date</p>
                        <p className="font-bold">{new Date(reservation.date).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Heure</p>
                        <p className="font-bold">{reservation.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Personnes</p>
                        <p className="font-bold">{reservation.party_size}</p>
                      </div>
                    </div>
                  </div>

                  {reservation.notes && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-sm">{reservation.notes}</p>
                    </div>
                  )}

                  <div className="flex gap-2 flex-wrap">
                    {reservation.status === 'pending' && (
                      <>
                        <Button onClick={() => handleConfirm(reservation.id)} className="flex-1 bg-green-600 hover:bg-green-700">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Confirmer
                        </Button>
                        <Button onClick={() => handleCancel(reservation.id)} variant="outline" className="flex-1">
                          <XCircle className="w-4 h-4 mr-2" />
                          Refuser
                        </Button>
                      </>
                    )}
                    
                    {reservation.status === 'confirmed' && (
                      <>
                        <Button onClick={() => handleComplete(reservation.id)} className="flex-1">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Client arrivé
                        </Button>
                        <Button onClick={() => handleCancel(reservation.id)} variant="outline" className="flex-1">
                          <XCircle className="w-4 h-4 mr-2" />
                          Annuler
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => window.location.href = '/admin/orders-mode'}
            className="text-gray-600 hover:text-primary"
          >
            ← Retour au Mode Commande
          </button>
        </div>
      </div>
    </div>
  );
};
