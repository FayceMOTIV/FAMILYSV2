import React from 'react';
import { User, LogOut, Clock, ShoppingBag, Moon, Sun, ChevronRight, Award, Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { mockUser } from '../mockData';

const MobileProfile = () => {
  const { user, login, logout, theme, toggleTheme } = useApp();
  const navigate = useNavigate();

  const handleLogin = () => {
    login(mockUser);
  };

  const handleLogout = () => {
    logout();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#FAFAFA] dark:bg-[#121212]">
        <div className="max-w-md w-full bg-white dark:bg-[#1a1a1a] rounded-[32px] p-8 shadow-2xl">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-[#C62828] to-[#8B0000] rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-4">
              Bienvenue chez Family's
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Connecte-toi pour accéder à ton profil, tes commandes et ta carte fidélité
            </p>
            <Button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-[#C62828] to-[#8B0000] text-white py-7 rounded-full text-lg font-bold active:scale-95 mb-3"
            >
              Se connecter
            </Button>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              (Mode démo)
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAFA] dark:bg-[#121212] min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#C62828] to-[#8B0000] text-white pt-8 pb-8 px-4">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-10 h-10" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-black mb-1 truncate">{user.name}</h1>
            <p className="text-white/90 text-sm truncate">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl p-4 shadow-lg text-center">
            <ShoppingBag className="w-7 h-7 text-[#C62828] dark:text-[#FFD54F] mx-auto mb-2" />
            <div className="text-2xl font-black text-gray-800 dark:text-white">
              {user.orderHistory?.length || 0}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Commandes</div>
          </div>
          <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl p-4 shadow-lg text-center">
            <Award className="w-7 h-7 text-[#FFD54F] mx-auto mb-2" />
            <div className="text-2xl font-black text-gray-800 dark:text-white">
              {user.loyaltyStamps || 0}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Tampons</div>
          </div>
          <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl p-4 shadow-lg text-center">
            <Heart className="w-7 h-7 text-[#C62828] dark:text-[#FFD54F] mx-auto mb-2" />
            <div className="text-2xl font-black text-gray-800 dark:text-white">
              {user.favoriteProducts?.length || 0}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Favoris</div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-[32px] shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-black text-gray-800 dark:text-white">Paramètres</h2>
          </div>
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] active:bg-gray-100 dark:active:bg-[#2a2a2a] transition-colors border-b border-gray-200 dark:border-gray-800"
          >
            <div className="flex items-center space-x-4">
              {theme === 'light' ? (
                <Moon className="w-7 h-7 text-gray-600 dark:text-gray-400" />
              ) : (
                <Sun className="w-7 h-7 text-gray-600 dark:text-gray-400" />
              )}
              <div className="text-left">
                <div className="font-bold text-gray-800 dark:text-white">Thème</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {theme === 'light' ? 'Mode clair' : 'Mode sombre'}
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
          
          {/* Back Office Button - Dev/Admin Only */}
          {process.env.REACT_APP_SHOW_ADMIN_SHORTCUT !== 'false' && (
            <a
              href="/admin"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] active:bg-gray-100 dark:active:bg-[#2a2a2a] transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="w-7 h-7 bg-gradient-to-br from-[#C62828] to-[#8B0000] rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-gray-800 dark:text-white">Back Office</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Gestion admin (test)
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </a>
          )}
        </div>

        {/* Order History */}
        {user.orderHistory && user.orderHistory.length > 0 && (
          <div className="bg-white dark:bg-[#1a1a1a] rounded-[32px] shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-black text-gray-800 dark:text-white flex items-center">
                <Clock className="w-6 h-6 mr-3 text-[#C62828] dark:text-[#FFD54F]" />
                Mes commandes
              </h2>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {user.orderHistory.slice(0, 3).map((order) => (
                <div key={order.id} className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-bold text-gray-800 dark:text-white">
                        #{order.id.slice(-6).toUpperCase()}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(order.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black text-[#C62828] dark:text-[#FFD54F]">
                        {order.total.toFixed(2)}€
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400 font-bold">
                        ✓ Terminée
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1 mb-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="text-sm text-gray-600 dark:text-gray-400">
                        {item.quantity}x {item.name}
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-[#C62828] text-[#C62828] dark:border-[#FFD54F] dark:text-[#FFD54F] font-bold rounded-full py-5 active:scale-95"
                  >
                    Recommander
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Account Info */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-[32px] shadow-lg p-6">
          <h2 className="text-xl font-black text-gray-800 dark:text-white mb-5">Infos compte</h2>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1 font-semibold">Nom</div>
              <div className="font-bold text-gray-800 dark:text-white text-lg">{user.name}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1 font-semibold">Email</div>
              <div className="font-bold text-gray-800 dark:text-white">{user.email}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1 font-semibold">Téléphone</div>
              <div className="font-bold text-gray-800 dark:text-white">{user.phone}</div>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-gradient-to-r from-[#25D366] to-[#128C7E] rounded-[32px] p-6 text-white text-center shadow-xl">
          <div className="text-3xl mb-3">💬</div>
          <h3 className="text-xl font-black mb-2">Une question ?</h3>
          <p className="text-sm opacity-90 mb-4">
            Contacte-nous sur WhatsApp
          </p>
          <Button
            className="bg-white text-[#128C7E] hover:bg-gray-100 font-black py-6 rounded-full px-8 active:scale-95"
          >
            Ouvrir WhatsApp
          </Button>
        </div>

        {/* Logout */}
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white py-7 rounded-full text-lg font-bold active:scale-95"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Se déconnecter
        </Button>
      </div>

      {/* Spacing for bottom nav */}
      <div className="h-8"></div>
    </div>
  );
};

export default MobileProfile;
