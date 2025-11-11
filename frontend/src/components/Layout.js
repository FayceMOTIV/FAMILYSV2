import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Heart, User, Menu, X, Sun, Moon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from './ui/button';
import Cart from './Cart';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getCartItemsCount, isCartOpen, setIsCartOpen, user, theme, toggleTheme } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const cartCount = getCartItemsCount();

  const navItems = [
    { icon: Home, label: 'Accueil', path: '/' },
    { icon: ShoppingBag, label: 'Commander', path: '/menu' },
    { icon: Heart, label: 'Favoris', path: '/favorites' },
    { icon: User, label: 'Profil', path: '/profile' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#121212] transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-[#1a1a1a] shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#C62828] to-[#8B0000] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <span className="text-xl font-bold text-[#C62828] dark:text-[#FFD54F]">Family's</span>
          </button>

          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </Button>
            
            <Button
              onClick={() => navigate('/loyalty')}
              variant="outline"
              className="border-[#FFD54F] text-[#C62828] dark:text-[#FFD54F] hover:bg-[#FFD54F] hover:text-[#121212] transition-all duration-300"
            >
              Carte Fidélité
            </Button>

            <Button
              onClick={() => setIsCartOpen(true)}
              className="bg-[#C62828] hover:bg-[#8B0000] text-white relative rounded-full px-6 shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Panier
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#FFD54F] text-[#121212] text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </Button>
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-[#1a1a1a] border-t border-gray-200 dark:border-gray-800">
            <div className="p-4 space-y-2">
              <Button
                onClick={() => {
                  navigate('/loyalty');
                  setIsMobileMenuOpen(false);
                }}
                variant="outline"
                className="w-full border-[#FFD54F] text-[#C62828] dark:text-[#FFD54F]"
              >
                Carte Fidélité
              </Button>
              <Button
                onClick={toggleTheme}
                variant="outline"
                className="w-full"
              >
                {theme === 'light' ? 'Mode Sombre' : 'Mode Clair'}
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-140px)]">{children}</main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1a1a1a] border-t border-gray-200 dark:border-gray-800 z-30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-around items-center py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center justify-center py-2 px-4 rounded-xl transition-all duration-300 ${
                    active
                      ? 'text-[#C62828] dark:text-[#FFD54F] bg-[#C62828]/10 dark:bg-[#FFD54F]/10'
                      : 'text-gray-500 dark:text-gray-400 hover:text-[#C62828] dark:hover:text-[#FFD54F]'
                  }`}
                >
                  <Icon className={`w-6 h-6 ${ active ? 'animate-bounce' : ''}`} />
                  <span className="text-xs mt-1 font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Cart Sidebar */}
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};

export default Layout;
