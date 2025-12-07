import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { settingsAPI } from '../services/api';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Truck
} from 'lucide-react';

export const ModeSelector = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await settingsAPI.get();
      setSettings(response.data?.settings || {});
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const modes = [
    {
      id: 'admin',
      name: 'Back Office',
      description: 'Gestion complète du restaurant',
      icon: LayoutDashboard,
      color: 'from-red-500 to-red-600',
      path: '/login',
      enabled: true
    },
    {
      id: 'orders',
      name: 'Mode Commandes',
      description: 'Réception et suivi des commandes',
      icon: ShoppingBag,
      color: 'from-blue-500 to-blue-600',
      path: '/orders-mode-login',
      enabled: true
    },
    {
      id: 'delivery',
      name: 'Mode Livraison',
      description: 'Gestion des livraisons',
      icon: Truck,
      color: 'from-green-500 to-green-600',
      path: '/delivery-mode-login',
      enabled: settings.enable_delivery === true
    }
  ];

  const enabledModes = modes.filter(m => m.enabled);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-white mb-2">Le Family's</h1>
          <p className="text-gray-400">Sélectionnez votre mode d'accès</p>
        </div>

        <div className={`grid grid-cols-1 ${enabledModes.length > 2 ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6`}>
          {enabledModes.map((mode) => (
            <Card
              key={mode.id}
              className="p-8 cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-2xl border-0"
              onClick={() => navigate(mode.path)}
            >
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${mode.color} flex items-center justify-center mb-4 shadow-lg mx-auto`}>
                <mode.icon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-1 text-center">{mode.name}</h3>
              <p className="text-sm text-gray-500 text-center">{mode.description}</p>
            </Card>
          ))}
        </div>

        <p className="text-center text-gray-500 text-sm mt-10">
          © {new Date().getFullYear()} Le Family's - Bourg-en-Bresse
        </p>
      </div>
    </div>
  );
};
