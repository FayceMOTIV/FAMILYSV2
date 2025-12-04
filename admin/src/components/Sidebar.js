import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  FolderOpen, 
  Settings,
  LogOut,
  Sparkles,
  Tag,
  Users,
  Bell,
  Calendar,
  Zap,
  History,
  Sliders,
  Menu,
  DollarSign,
  Image
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../utils/cn';

const menuItems = [
  // 1. Tableau de bord - Vue d'ensemble
  { name: 'Tableau de bord', path: '/', icon: LayoutDashboard, exact: true },
  
  // 2. Commandes - Le plus utilisé quotidiennement
  { name: 'Commandes', path: '/orders', icon: ShoppingCart },
  
  // 3. Gestion du Menu - Produits, catégories, stock
  { name: 'Gestion du Menu', path: '/menu', icon: Menu, highlight: true },
  
  // 4. Promotions V2 - Nouveau moteur de promotions
  { name: '🎯 Promotions', path: '/promotions', icon: Tag, highlight: true },
  
  // 5. Notifications - Communication clients
  { name: 'Notifications', path: '/notifications', icon: Bell },
  
  // 6. Chiffre d'Affaires - Analytics
  { name: 'Chiffre d\'Affaires', path: '/revenue', icon: DollarSign },
  
  // 7. IA Marketing - Campagnes intelligentes
  { name: '🤖 IA Marketing', path: '/ai-marketing', icon: Zap, section: true },
  { name: 'Campagnes proposées', path: '/ai-marketing/campaigns', icon: Zap, indent: true },
  { name: 'Historique & Résultats', path: '/ai-marketing/history', icon: History, indent: true },
  { name: 'Paramètres IA', path: '/ai-marketing/settings', icon: Sliders, indent: true },
  
  // 8. SURPRISE DU JOUR - MODULE INDÉPENDANT (avec onglets internes)
  { name: '🎰 Surprise du Jour', path: '/surprise-du-jour', icon: Sparkles, highlight: true },
  
  // 9. Clients - Gestion clientèle
  { name: 'Clients', path: '/customers', icon: Users },
  
  // 10. Assistant IA - Aide contextuelle
  { name: 'Assistant IA', path: '/ai', icon: Sparkles },
  
  // 11. Réservations - Moins fréquent
  { name: 'Réservations', path: '/reservations', icon: Calendar },
  // 11.5 Popups - Gestion popups app mobile
  { name: '📱 Popups', path: '/popups', icon: Image, highlight: true },

  
  // 12. Paramètres - Configuration
  { name: 'Paramètres', path: '/settings', icon: Settings },
];

export const Sidebar = () => {
  const { logout, user } = useAuth();

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-black text-primary">Family's</h1>
        <p className="text-sm text-gray-500">Back Office</p>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          if (item.section) {
            return (
              <div key={item.path} className="pt-4 pb-2">
                <div className="flex items-center space-x-2 px-4 text-sm font-bold text-primary">
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </div>
              </div>
            );
          }
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                cn(
                  'flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200',
                  item.indent && 'pl-8',
                  item.highlight && 'border-2 border-orange-300',
                  isActive
                    ? item.highlight 
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold shadow-lg'
                      : 'bg-primary text-white font-semibold'
                    : item.highlight
                      ? 'bg-gradient-to-r from-orange-50 to-red-50 text-orange-700 font-bold hover:from-orange-100 hover:to-red-100'
                      : 'text-gray-700 hover:bg-gray-100'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-200">
        <div className="mb-3">
          <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
          <p className="text-xs text-gray-500">{user?.email}</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center space-x-2 w-full px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-semibold">Déconnexion</span>
        </button>
      </div>
    </div>
  );
};
