import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Award, Heart, User, Bell } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNotifications } from '../hooks/useNotifications';
import MobileCart from './MobileCart';

const MobileLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isCartOpen, setIsCartOpen, getCartItemsCount, user } = useApp();
  const { unreadCount } = useNotifications(user?.id);
  
  const cartCount = getCartItemsCount();

  const navItems = [
    { icon: Home, label: 'Accueil', path: '/' },
    { icon: ShoppingBag, label: 'Commander', path: '/menu' },
    { icon: Award, label: 'Fidélité', path: '/loyalty' },
    { icon: Heart, label: 'Favoris', path: '/favorites' },
    { icon: User, label: 'Profil', path: '/profile' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#121212] pb-20">
      {/* Main Content - No Header */}
      <main className="min-h-screen">
        {children}
      </main>

      {/* Floating Notification Button */}
      {unreadCount > 0 && (
        <button
          onClick={() => navigate('/notifications')}
          className="fixed bottom-24 left-4 z-[9998] w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-all duration-300"
        >
          <Bell className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-black rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        </button>
      )}

      {/* Floating Cart Button V3 */}
      {cartCount > 0 && (
        <button
          onClick={() => navigate('/cart')}
          className="fixed bottom-24 right-4 z-[9998] w-16 h-16 bg-gradient-to-br from-[#C62828] to-[#8B0000] text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-all duration-300 animate-bounce"
        >
          <ShoppingBag className="w-7 h-7" />
          <span className="absolute -top-2 -right-2 bg-[#FFD54F] text-[#121212] text-sm font-black rounded-full w-7 h-7 flex items-center justify-center animate-pulse">
            {cartCount}
          </span>
        </button>
      )}

      {/* Fixed Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1a1a1a] border-t border-gray-200 dark:border-gray-800 z-[9999] safe-area-inset-bottom">
        <div className="flex justify-around items-center py-2 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            const handleClick = () => {
              console.log('🔥 CLICK DETECTED on:', item.label, '→', item.path);
              console.log('🎯 Handler executing successfully!');
              navigate(item.path);
              console.log('✅ Navigation triggered to:', item.path);
            };
            return (
              <button
                key={item.path}
                onClick={handleClick}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleClick();
                }}
                type="button"
                style={{ pointerEvents: 'auto' }}
                className={`relative flex flex-col items-center justify-center py-2 px-3 rounded-2xl min-w-[64px] transition-all duration-300 cursor-pointer touch-manipulation ${
                  active
                    ? 'text-[#C62828] dark:text-[#FFD54F] bg-[#C62828]/10 dark:bg-[#FFD54F]/10 scale-110'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {item.path === '/menu' && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#C62828] dark:bg-[#FFD54F] text-white dark:text-[#121212] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {cartCount}
                  </span>
                )}
                <Icon 
                  className={`w-6 h-6 mb-1 transition-all duration-300 ${
                    active ? 'scale-110' : ''
                  }`} 
                  strokeWidth={active ? 2.5 : 2}
                />
                <span className={`text-[10px] font-semibold ${
                  active ? 'scale-105' : ''
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Cart Overlay */}
      <MobileCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};

export default MobileLayout;
