import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { reservationsAPI } from '../services/api';
import { Calendar, Check, X } from 'lucide-react';

export const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      const response = await reservationsAPI.getAll();
      setReservations(response.data);
    } catch (error) {
      console.error('Failed to load reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await reservationsAPI.updateStatus(id, { status });
      loadReservations();
    } catch (error) {
      alert('Erreur lors de la mise à jour');
    }
  };

  if (loading) return <div><Header title="Réservations" /><div className="p-8">Chargement...</div></div>;

  return (
    <div>
      <Header title="Réservations" />
      <div className="p-8">
        <h3 className="text-xl font-bold mb-6">{reservations.length} réservations</h3>

        {reservations.length === 0 ? (
          <Card className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucune réservation</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation) => (
              <Card key={reservation.id}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold">{reservation.customer_name}</h4>
                    <p className="text-sm text-gray-600">
                      {reservation.reservation_date} à {reservation.reservation_time} • {reservation.party_size} personnes
                    </p>
                    <p className="text-sm text-gray-500">{reservation.customer_phone}</p>
                  </div>
                  <div className="flex space-x-2">
                    {reservation.status === 'pending' && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => handleStatusChange(reservation.id, 'confirmed')}>
                          <Check className="w-4 h-4 mr-1" />Confirmer
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleStatusChange(reservation.id, 'canceled')}>
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    {reservation.status !== 'pending' && (
                      <span className={`px-3 py-1 rounded text-sm ${
                        reservation.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {reservation.status}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
