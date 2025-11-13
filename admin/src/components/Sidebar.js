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
  DollarSign
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../utils/cn';

const menuItems = [
  { name: 'Tableau de bord', path: '/admin', icon: LayoutDashboard, exact: true },
  { name: 'Assistant IA', path: '/admin/ai', icon: Sparkles },
  { name: '🤖 IA Marketing', path: '/admin/ai-marketing', icon: Zap, section: true },
  { name: 'Campagnes proposées', path: '/admin/ai-marketing/campaigns', icon: Zap, indent: true },
  { name: 'Historique & Résultats', path: '/admin/ai-marketing/history', icon: History, indent: true },
  { name: 'Paramètres IA', path: '/admin/ai-marketing/settings', icon: Sliders, indent: true },
  { name: 'Gestion du Menu', path: '/admin/menu', icon: Menu, highlight: true },
  { name: 'Commandes', path: '/admin/orders', icon: ShoppingCart },
  { name: 'Chiffre d\'Affaires', path: '/admin/revenue', icon: DollarSign },
  { name: 'Promos', path: '/admin/promos', icon: Tag },
  { name: 'Clients', path: '/admin/customers', icon: Users },
  { name: 'Notifications', path: '/admin/notifications', icon: Bell },
  { name: 'Réservations', path: '/admin/reservations', icon: Calendar },
  { name: 'Paramètres', path: '/admin/settings', icon: Settings },
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
