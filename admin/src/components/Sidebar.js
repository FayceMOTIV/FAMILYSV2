import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  FolderOpen, 
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../utils/cn';

const menuItems = [
  { name: 'Tableau de bord', path: '/admin', icon: LayoutDashboard, exact: true },
  { name: 'Produits', path: '/admin/products', icon: Package },
  { name: 'Commandes', path: '/admin/orders', icon: ShoppingCart },
  { name: 'Catégories', path: '/admin/categories', icon: FolderOpen },
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
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) =>
              cn(
                'flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-primary text-white font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.name}</span>
          </NavLink>
        ))}
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
