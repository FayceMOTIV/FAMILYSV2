import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Lock } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const ModeLogin = ({ mode = 'orders', onSuccess }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const modeLabels = {
    'orders': 'Commande',
    'delivery': 'Livraison',
    'reservation': 'Réservation'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post(`${API_URL}/api/v1/admin/verify-pin`, {
        pin,
        mode
      });
      
      // Stocker en session
      sessionStorage.setItem(`${mode}_mode_auth`, 'true');
      
      if (onSuccess) {
        onSuccess();
      } else {
        window.location.href = `/admin/${mode}-mode`;
      }
    } catch (err) {
      setError('Code PIN incorrect');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  const handlePinInput = (value) => {
    if (value.length <= 4 && /^\d*$/.test(value)) {
      setPin(value);
      setError('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
              <Lock className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">
              Mode {modeLabels[mode]}
            </h1>
            <p className="text-gray-600">Entrez votre code PIN à 4 chiffres</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="text"
                inputMode="numeric"
                pattern="\d{4}"
                maxLength="4"
                value={pin}
                onChange={(e) => handlePinInput(e.target.value)}
                placeholder="••••"
                className={`w-full text-center text-4xl font-bold tracking-widest px-4 py-4 border-2 rounded-lg ${
                  error ? 'border-red-500' : 'border-gray-300'
                } focus:border-primary focus:outline-none`}
                autoFocus
              />
              {error && (
                <p className="text-red-600 text-sm mt-2 text-center">{error}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full py-4 text-lg"
              disabled={pin.length !== 4 || loading}
            >
              {loading ? 'Vérification...' : 'Accéder'}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => window.location.href = '/admin'}
                className="text-sm text-gray-600 hover:text-primary"
              >
                ← Retour à l'admin
              </button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};
