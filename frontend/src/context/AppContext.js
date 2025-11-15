import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockUser } from '../mockData';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loyaltyStamps, setLoyaltyStamps] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [theme, setTheme] = useState('light');
  const [restaurantStatus, setRestaurantStatus] = useState({
    canOrder: true,
    isPaused: false,
    noMoreOrdersToday: false
  });

  // Load from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('familys_cart');
    const savedFavorites = localStorage.getItem('familys_favorites');
    const savedTheme = localStorage.getItem('familys_theme');
    const savedUser = localStorage.getItem('familys_user');
    const autoTheme = localStorage.getItem('familys_auto_theme');
    
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    
    // Auto dark mode basé sur l'heure (19h-7h)
    if (autoTheme === 'true' || !savedTheme) {
      const hour = new Date().getHours();
      const isDarkHours = hour >= 19 || hour < 7;
      setTheme(isDarkHours ? 'dark' : 'light');
    } else if (savedTheme) {
      setTheme(savedTheme);
    }
    
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setLoyaltyStamps(userData.loyaltyStamps || 0);
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('familys_cart', JSON.stringify(cart));
  }, [cart]);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('familys_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Save theme to localStorage
  useEffect(() => {
    localStorage.setItem('familys_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const login = (userData = mockUser) => {
    setUser(userData);
    setLoyaltyStamps(userData.loyaltyStamps || 0);
    setFavorites(userData.favoriteProducts || []);
    localStorage.setItem('familys_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setLoyaltyStamps(0);
    localStorage.removeItem('familys_user');
  };

  const addToCart = (product, options = [], quantity = 1) => {
    // Vérifier si le restaurant accepte les commandes
    if (!restaurantStatus.canOrder) {
      alert('Désolé, le restaurant ne prend pas de commandes pour le moment.');
      return false;
    }
    
    const cartItem = {
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      basePrice: product.basePrice,
      imageUrl: product.imageUrl,
      options,
      quantity,
      totalPrice: calculateItemPrice(product.basePrice, options, quantity)
    };
    
    setCart([...cart, cartItem]);
    setIsCartOpen(true);
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const updateCartQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(cart.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          quantity,
          totalPrice: calculateItemPrice(item.basePrice, item.options, quantity)
        };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCart([]);
  };

  const calculateItemPrice = (basePrice, options, quantity) => {
    const optionsPrice = options.reduce((sum, opt) => sum + (opt.deltaPrice || 0), 0);
    return (basePrice + optionsPrice) * quantity;
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const getCartItemsCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const toggleFavorite = (productId) => {
    if (favorites.includes(productId)) {
      setFavorites(favorites.filter(id => id !== productId));
    } else {
      setFavorites([...favorites, productId]);
    }
  };

  const isFavorite = (productId) => {
    return favorites.includes(productId);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const completeOrder = () => {
    // Simulate order completion
    if (getCartTotal() >= 8) {
      setLoyaltyStamps(prev => prev + 1);
      if (user) {
        const updatedUser = { ...user, loyaltyStamps: loyaltyStamps + 1 };
        setUser(updatedUser);
        localStorage.setItem('familys_user', JSON.stringify(updatedUser));
      }
    }
    clearCart();
  };

  const value = {
    user,
    login,
    logout,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    isCartOpen,
    setIsCartOpen,
    favorites,
    toggleFavorite,
    isFavorite,
    loyaltyStamps,
    setLoyaltyStamps,
    theme,
    toggleTheme,
    completeOrder
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
