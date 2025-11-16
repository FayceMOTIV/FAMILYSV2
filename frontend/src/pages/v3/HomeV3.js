import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { CashbackCard } from '../../components/v3/CashbackCard';
import { PromoBanner } from '../../components/v3/PromoBanner';
import { CategoryCard } from '../../components/v3/CategoryCard';
import { ProductCardV3 } from '../../components/v3/ProductCardV3';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://react-native-reboot.preview.emergentagent.com';

/**
 * Home Page V3 - Design ultra moderne avec cashback en avant
 */
export const HomeV3 = () => {
  const navigate = useNavigate();
  const { user } = useApp();
  
  const [cashbackBalance, setCashbackBalance] = useState(0);
  const [activePromos, setActivePromos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Charger le solde cashback si connecté
      if (user?.id) {
        try {
          const cashbackRes = await axios.get(`${API_URL}/api/v1/cashback/balance/${user.id}`);
          setCashbackBalance(cashbackRes.data.balance || 0);
        } catch (error) {
          console.log('Cashback non disponible:', error);
        }
      }

      // Charger les promotions actives
      try {
        const promosRes = await axios.get(`${API_URL}/api/v1/admin/promotions?active=true`);
        setActivePromos(promosRes.data.promotions?.slice(0, 3) || []);
      } catch (error) {
        console.log('Promos non disponibles:', error);
      }

      // Charger les catégories
      try {
        const categoriesRes = await axios.get(`${API_URL}/api/v1/admin/categories`);
        setCategories(categoriesRes.data.categories || []);
      } catch (error) {
        console.log('Catégories non disponibles:', error);
      }

      // Charger les best sellers (produits avec badge "bestseller")
      try {
        const productsRes = await axios.get(`${API_URL}/api/v1/admin/products`);
        const products = productsRes.data.products || [];
        const bestSellersFiltered = products.filter(p => p.badge === 'bestseller' || p.tags?.includes('best-seller'));
        setBestSellers(bestSellersFiltered.slice(0, 4));
      } catch (error) {
        console.log('Produits non disponibles:', error);
      }

    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C62828]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-gray-900">Family's</h1>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <MapPin className="w-4 h-4" />
                <span>Bourg-en-Bresse</span>
                <span className="text-gray-400">•</span>
                <Clock className="w-4 h-4" />
                <span>~15 min</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
            >
              <span className="text-lg">👤</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Carte de Fidélité - MISE EN AVANT */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {user ? (
            // Carte pour utilisateur connecté
            <CashbackCard
              balance={cashbackBalance}
              earnedToday={0}
              onClick={() => navigate('/wallet')}
            />
          ) : (
            // Carte pour visiteur non connecté
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/profile')}
              className="relative bg-gradient-to-br from-[#C62828] via-[#D32F2F] to-[#8B0000] rounded-3xl p-8 shadow-2xl cursor-pointer overflow-hidden border-2 border-[#FFD54F]/30"
            >
              {/* Effet brillant animé */}
              <motion.div
                animate={{ 
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 opacity-20 pointer-events-none"
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#FFD54F] rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl" />
              </motion.div>

              {/* Badge */}
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-2 -right-2 bg-[#FFD54F] text-[#C62828] px-4 py-2 rounded-full text-xs font-bold shadow-lg"
              >
                🎁 Gagne 5% sur chaque commande !
              </motion.div>

              {/* Contenu */}
              <div className="relative z-10 text-center">
                <div className="mb-6">
                  <div className="bg-white/25 p-4 rounded-2xl backdrop-blur-sm shadow-lg inline-block mb-4">
                    <span className="text-6xl">💳</span>
                  </div>
                  <h3 className="text-white text-2xl font-black mb-2">Ta Carte de Fidélité t'attend !</h3>
                  <p className="text-white/80 text-sm">Gagne de l'argent à chaque commande</p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md rounded-xl px-4 py-3">
                    <span className="text-2xl">💰</span>
                    <p className="text-white text-sm font-medium text-left">
                      <strong>5%</strong> de fidélité sur toutes tes commandes
                    </p>
                  </div>
                  <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md rounded-xl px-4 py-3">
                    <span className="text-2xl">♻️</span>
                    <p className="text-white text-sm font-medium text-left">
                      Réutilise tes points <strong>sans limite</strong>
                    </p>
                  </div>
                  <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md rounded-xl px-4 py-3">
                    <span className="text-2xl">⚡</span>
                    <p className="text-white text-sm font-medium text-left">
                      Utilisable <strong>immédiatement</strong> sur ta prochaine commande
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    console.log('🔥 CLICK DETECTED on: Je crée mon compte gratuitement');
                    console.log('🎯 Handler executing successfully!');
                    navigate('/signup');
                    console.log('✅ Navigation triggered to: /signup');
                  }}
                  className="w-full py-4 bg-[#FFD54F] text-[#C62828] font-black text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all hover:scale-105"
                >
                  🚀 Je crée mon compte gratuitement
                </button>
              </div>

              {/* Chip design doré */}
              <motion.div 
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-[#FFD54F] to-[#FFA726] rounded-xl shadow-xl opacity-80"
              />
            </motion.div>
          )}
        </motion.div>

        {/* Bannières Promos */}
        {activePromos.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-black text-gray-900">🔥 Offres du moment</h2>
            {activePromos.map((promo, index) => (
              <motion.div
                key={promo.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <PromoBanner
                  promo={promo}
                  onClick={() => {
                    // Navigation vers les produits concernés
                    if (promo.applicable_categories?.length > 0) {
                      navigate(`/menu?category=${promo.applicable_categories[0]}`);
                    } else {
                      navigate('/menu');
                    }
                  }}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Catégories */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-gray-900">Que veux-tu manger ?</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {categories.slice(0, 6).map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <CategoryCard
                  category={category}
                  onClick={() => navigate(`/menu?category=${category.id}`)}
                />
              </motion.div>
            ))}
          </div>
          <button
            onClick={() => navigate('/menu')}
            className="w-full mt-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            Voir tout le menu
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Best Sellers */}
        {bestSellers.length > 0 && (
          <div>
            <h2 className="text-xl font-black text-gray-900 mb-4">
              🔥 Les incontournables du moment
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {bestSellers.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ProductCardV3
                    product={product}
                    onClick={() => navigate(`/product/${product.id}`)}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* CTA Commander */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/menu')}
          className="w-full bg-gradient-to-r from-[#C62828] to-orange-500 text-white py-4 rounded-2xl font-black text-lg shadow-xl"
        >
          Commander maintenant 🍔
        </motion.button>
      </div>
    </div>
  );
};
