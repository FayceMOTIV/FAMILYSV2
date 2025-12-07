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
      shadowColor: 'shadow-red-500/30',
      path: '/login',
      enabled: true
    },
    {
      id: 'orders',
      name: 'Mode Commandes',
      description: 'Réception et suivi des commandes',
      icon: ShoppingBag,
      color: 'from-blue-500 to-blue-600',
      shadowColor: 'shadow-blue-500/30',
      path: '/orders-mode-login',
      enabled: true
    },
    {
      id: 'delivery',
      name: 'Mode Livraison',
      description: 'Gestion des livraisons',
      icon: Truck,
      color: 'from-green-500 to-green-600',
      shadowColor: 'shadow-green-500/30',
      path: '/delivery-mode-login',
      enabled: settings.enable_delivery === true
    }
  ];

  const enabledModes = modes.filter(m => m.enabled);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl">
        {/* Logo & Titre */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-2xl shadow-red-500/30">
            <span className="text-3xl sm:text-4xl font-black text-white">F</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-2 sm:mb-3">Le Family's</h1>
          <p className="text-gray-400 text-base sm:text-lg">Sélectionnez votre mode d'accès</p>
        </div>

        {/* Grille des modes */}
        <div className={`grid grid-cols-1 gap-4 sm:gap-6 ${
          enabledModes.length === 2 
            ? 'sm:grid-cols-2 max-w-2xl mx-auto' 
            : 'sm:grid-cols-2 lg:grid-cols-3'
        }`}>
          {enabledModes.map((mode) => (
            <Card
              key={mode.id}
              className={`
                p-6 sm:p-8 cursor-pointer 
                hover:scale-[1.02] active:scale-[0.98]
                transition-all duration-300 
                hover:shadow-2xl ${mode.shadowColor}
                border-0 bg-white/95 backdrop-blur
                touch-manipulation
              `}
              onClick={() => navigate(mode.path)}
            >
              <div className={`
                w-16 h-16 sm:w-20 sm:h-20 
                rounded-xl sm:rounded-2xl 
                bg-gradient-to-br ${mode.color} 
                flex items-center justify-center 
                mb-4 sm:mb-5 shadow-lg mx-auto
              `}>
                <mode.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1 sm:mb-2 text-center">
                {mode.name}
              </h3>
              <p className="text-sm sm:text-base text-gray-500 text-center leading-relaxed">
                {mode.description}
              </p>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs sm:text-sm mt-8 sm:mt-12">
          © {new Date().getFullYear()} Le Family's - Bourg-en-Bresse
        </p>
      </div>
    </div>
  );
};
