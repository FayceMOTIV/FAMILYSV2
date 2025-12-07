import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { settingsAPI } from '../services/api';
import { Lock, AlertCircle, ShoppingBag, Truck } from 'lucide-react';

const MODE_CONFIG = {
  orders: {
    name: 'Mode Commandes',
    icon: ShoppingBag,
    color: 'from-blue-500 to-blue-600',
    pinField: 'pin_orders_mode',
    redirect: '/orders-mode'
  },
  delivery: {
    name: 'Mode Livraison', 
    icon: Truck,
    color: 'from-green-500 to-green-600',
    pinField: 'pin_delivery_mode',
    redirect: '/delivery-mode'
  }
};

export const ModeLogin = ({ mode }) => {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];
  const navigate = useNavigate();
  
  const config = MODE_CONFIG[mode] || MODE_CONFIG.orders;
  const IconComponent = config.icon;

  useEffect(() => {
    inputRefs[0].current?.focus();
  }, []);

  const handleChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;
    
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError('');

    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    if (index === 3 && value) {
      handleLogin(newPin.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleLogin = async (fullPin) => {
    setLoading(true);
    setError('');

    try {
      const response = await settingsAPI.get();
      const settings = response.data?.settings || {};
      const correctPin = settings[config.pinField] || '0000';

      if (fullPin === correctPin) {
        // Stocker la session du mode
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + 8); // 8h de session
        localStorage.setItem(`${mode}_mode_session`, 'true');
        localStorage.setItem(`${mode}_mode_expiry`, expiry.toISOString());
        
        navigate(config.redirect);
      } else {
        setError('Code PIN incorrect');
        setPin(['', '', '', '']);
        inputRefs[0].current?.focus();
      }
    } catch (err) {
      setError('Erreur de connexion');
      setPin(['', '', '', '']);
    }

    setLoading(false);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${config.color} flex items-center justify-center p-4`}>
      <Card className="w-full max-w-sm p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <IconComponent className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-black text-gray-800 mb-1">{config.name}</h1>
          <p className="text-gray-500">Entrez votre code PIN à 4 chiffres</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="flex justify-center gap-3 mb-8">
          {pin.map((digit, index) => (
            <input
              key={index}
              ref={inputRefs[index]}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              disabled={loading}
              className={`w-14 h-16 text-center text-2xl font-bold rounded-xl border-2 transition-all duration-200 outline-none ${error ? 'border-red-300 bg-red-50' : 'border-gray-200'} ${digit ? 'border-blue-500 bg-blue-50' : ''} focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:opacity-50`}
            />
          ))}
        </div>

        {loading && (
          <div className="text-center text-gray-500 mb-4">
            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            Vérification...
          </div>
        )}

        <Button 
          onClick={() => handleLogin(pin.join(''))} 
          disabled={pin.join('').length !== 4 || loading}
          className="w-full mb-4"
        >
          Accéder
        </Button>

        <button
          onClick={() => navigate('/select-mode')}
          className="w-full text-center text-gray-500 hover:text-gray-700 text-sm"
        >
          ← Retour au choix des modes
        </button>
      </Card>
    </div>
  );
};
