import React from 'react';
import { User, LogOut, Clock, ShoppingBag, Moon, Sun } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { mockUser } from '../mockData';

const Profile = () => {
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
      <div className="min-h-screen flex items-center justify-center p-4 pb-20">
        <div className="max-w-md w-full bg-white dark:bg-[#1a1a1a] rounded-3xl p-8 shadow-2xl">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-[#C62828] to-[#8B0000] rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Bienvenue chez Family's
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Connectez-vous pour accéder à votre profil, vos commandes et votre carte de fidélité
            </p>
            <div className="space-y-3">
              <Button
                onClick={handleLogin}
                className="w-full bg-gradient-to-r from-[#C62828] to-[#8B0000] hover:from-[#8B0000] hover:to-[#C62828] text-white py-6 rounded-2xl font-bold"
              >
                Se connecter
              </Button>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                (Mode démo - connexion automatique)
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#C62828] to-[#8B0000] text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">{user.name}</h1>
              <p className="text-white/90">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-lg text-center">
            <ShoppingBag className="w-8 h-8 text-[#C62828] dark:text-[#FFD54F] mx-auto mb-2" />
            <div className="text-3xl font-bold text-gray-800 dark:text-white">
              {user.orderHistory?.length || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Commandes</div>
          </div>
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-lg text-center">
            <div className="text-4xl mb-2">🎫</div>
            <div className="text-3xl font-bold text-gray-800 dark:text-white">
              {user.loyaltyStamps || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Tampons</div>
          </div>
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-lg text-center col-span-2 md:col-span-1">
            <div className="text-4xl mb-2">❤️</div>
            <div className="text-3xl font-bold text-gray-800 dark:text-white">
              {user.favoriteProducts?.length || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Favoris</div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Paramètres</h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors"
            >
              <div className="flex items-center space-x-4">
                {theme === 'light' ? (
                  <Moon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Sun className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                )}
                <div className="text-left">
                  <div className="font-semibold text-gray-800 dark:text-white">Thème</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {theme === 'light' ? 'Mode clair' : 'Mode sombre'}
                  </div>
                </div>
              </div>
              <div className="text-[#C62828] dark:text-[#FFD54F] font-semibold">
                Changer
              </div>
            </button>
          </div>
        </div>

        {/* Order History */}
        {user.orderHistory && user.orderHistory.length > 0 && (
          <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                <Clock className="w-6 h-6 mr-3 text-[#C62828] dark:text-[#FFD54F]" />
                Historique des commandes
              </h2>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {user.orderHistory.slice(0, 5).map((order) => (
                <div key={order.id} className="p-6 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-semibold text-gray-800 dark:text-white">
                        Commande #{order.id.slice(-6).toUpperCase()}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(order.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-[#C62828] dark:text-[#FFD54F]">
                        {order.total.toFixed(2)}€
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400 font-semibold">
                        Terminée
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="text-sm text-gray-600 dark:text-gray-400">
                        {item.quantity}x {item.name}
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 border-[#C62828] text-[#C62828] dark:border-[#FFD54F] dark:text-[#FFD54F] hover:bg-[#C62828] hover:text-white dark:hover:bg-[#FFD54F] dark:hover:text-[#121212]"
                  >
                    Recommander
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Account Info */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Informations du compte</h2>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Nom</div>
              <div className="font-semibold text-gray-800 dark:text-white">{user.name}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Email</div>
              <div className="font-semibold text-gray-800 dark:text-white">{user.email}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Téléphone</div>
              <div className="font-semibold text-gray-800 dark:text-white">{user.phone}</div>
            </div>
          </div>
        </div>

        {/* Logout */}
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white py-6 rounded-2xl font-bold"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Se déconnecter
        </Button>
      </div>
    </div>
  );
};

export default Profile;
