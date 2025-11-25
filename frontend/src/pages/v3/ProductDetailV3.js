import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Plus, Minus, TrendingUp, Heart, Share2, Info } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://react-reborn.preview.emergentagent.com';

/**
 * Page Détail Produit V3 - Machine à conversion
 */
export const ProductDetailV3 = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, user } = useApp();
  
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [notes, setNotes] = useState('');
  const [cashbackAmount, setCashbackAmount] = useState(0);
  const [cashbackMultiplier, setCashbackMultiplier] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showNotes, setShowNotes] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [slug]);

  const loadProduct = async () => {
    try {
      setLoading(true);

      // Charger le produit
      const productsRes = await axios.get(`${API_URL}/api/v1/admin/products`);
      const products = productsRes.data.products || [];
      const foundProduct = products.find(p => p.id === slug || p.name.toLowerCase().replace(/\s+/g, '-') === slug);

      if (!foundProduct) {
        navigate('/menu');
        return;
      }

      // Charger les settings cashback
      let loyaltyPercentage = 5;
      try {
        const settingsRes = await axios.get(`${API_URL}/api/v1/cashback/settings`);
        loyaltyPercentage = settingsRes.data.loyalty_percentage || 5;
      } catch (error) {
        console.log('Settings non disponibles');
      }

      // Calculer le cashback
      const basePrice = foundProduct.base_price || 0;
      const cashback = (basePrice * loyaltyPercentage) / 100;

      // Vérifier s'il y a un multiplicateur (promo cashback boosté)
      let multiplier = 1;
      if (foundProduct.badge === 'cashback_booste') {
        multiplier = 2;
      }

      setProduct(foundProduct);
      setCashbackAmount(cashback);
      setCashbackMultiplier(multiplier);

    } catch (error) {
      console.error('Erreur chargement produit:', error);
      navigate('/menu');
    } finally {
      setLoading(false);
    }
  };

  const getTotalPrice = () => {
    if (!product) return 0;
    let total = product.base_price * quantity;
    
    // Ajouter les options
    Object.values(selectedOptions).forEach(option => {
      if (Array.isArray(option)) {
        option.forEach(opt => {
          total += opt.delta_price || 0;
        });
      } else if (option) {
        total += option.delta_price || 0;
      }
    });

    return total;
  };

  const handleAddToCart = () => {
    if (!product) return;

    const item = {
      product_id: product.id,
      name: product.name,
      base_price: product.base_price,
      quantity: quantity,
      options: selectedOptions,
      total_price: getTotalPrice(),
      notes: notes
    };

    addToCart(item);
    
    // Animation success et retour
    setTimeout(() => {
      navigate('/menu');
    }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C62828]"></div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const finalCashback = (cashbackAmount || 0) * (cashbackMultiplier || 1);
  
  console.log('Product Detail Debug:', {
    product: product?.name,
    base_price: product?.base_price,
    cashbackAmount,
    cashbackMultiplier,
    finalCashback
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-40">
      {/* Image Header */}
      <div className="relative h-80 bg-gray-900">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-8xl">🍔</span>
          </div>
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg z-10"
        >
          <ChevronLeft className="w-6 h-6 text-gray-900" />
        </button>

        {/* Actions */}
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <button className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg">
            <Heart className="w-5 h-5 text-gray-900" />
          </button>
          <button className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg">
            <Share2 className="w-5 h-5 text-gray-900" />
          </button>
        </div>

        {/* Badge */}
        {product.badge && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#FFD54F] px-4 py-2 rounded-full shadow-lg">
            <span className="text-gray-900 font-bold text-sm">
              {product.badge === 'bestseller' && '⭐ Best Seller'}
              {product.badge === 'nouveau' && '✨ Nouveau'}
              {product.badge === 'promo' && '🔥 Promo'}
              {product.badge === 'cashback_booste' && '⚡ Cashback x2'}
            </span>
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="relative -mt-6 bg-white rounded-t-3xl p-6 space-y-6">
        {/* Titre + Prix */}
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">{product.name}</h1>
          <p className="text-gray-600 text-base">{product.description}</p>
          <div className="mt-4">
            <span className="text-4xl font-black text-gray-900">
              {typeof product.base_price === 'number' ? product.base_price.toFixed(2) : product.base_price}€
            </span>
          </div>
        </div>

        {/* Bloc Cashback - TRÈS IMPORTANT */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-4"
        >
          <div className="flex items-start gap-3">
            <div className="bg-green-500 p-2 rounded-full flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-black text-green-900 text-lg mb-1">
                💳 Gagne {finalCashback.toFixed(2)}€ sur ta carte !
              </h3>
              <p className="text-green-800 text-sm">
                En commandant ce produit, tu gagnes <strong>{finalCashback.toFixed(2)}€</strong> sur ta carte de fidélité Family's.
              </p>
              {cashbackMultiplier > 1 && (
                <div className="mt-2 bg-amber-100 border border-amber-300 rounded-lg px-3 py-2">
                  <p className="text-amber-900 text-sm font-bold">
                    ⚡ Fidélité boostée aujourd'hui : tu gagnes {finalCashback.toFixed(2)}€ au lieu de {cashbackAmount.toFixed(2)}€
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Options (si disponibles) */}
        {product.option_groups && product.option_groups.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-black text-gray-900">Personnalise ton produit</h2>
            {product.option_groups.map(group => (
              <div key={group.id} className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900">{group.name}</h3>
                  {group.required && (
                    <span className="text-xs bg-[#C62828] text-white px-2 py-1 rounded-full">
                      Requis
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  {group.options.map(option => (
                    <label
                      key={option.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type={group.type === 'single' ? 'radio' : 'checkbox'}
                          name={group.id}
                          className="w-5 h-5 text-[#C62828]"
                          onChange={() => {
                            if (group.type === 'single') {
                              setSelectedOptions({
                                ...selectedOptions,
                                [group.id]: option
                              });
                            } else {
                              const current = selectedOptions[group.id] || [];
                              const exists = current.find(o => o.id === option.id);
                              if (exists) {
                                setSelectedOptions({
                                  ...selectedOptions,
                                  [group.id]: current.filter(o => o.id !== option.id)
                                });
                              } else {
                                setSelectedOptions({
                                  ...selectedOptions,
                                  [group.id]: [...current, option]
                                });
                              }
                            }
                          }}
                        />
                        <span className="font-medium text-gray-900">{option.name}</span>
                      </div>
                      {option.delta_price > 0 && (
                        <span className="text-gray-600 text-sm">+{option.delta_price.toFixed(2)}€</span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Instructions spéciales */}
        <button
          onClick={() => setShowNotes(!showNotes)}
          className="w-full py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-gray-700 transition-colors flex items-center justify-center gap-2"
        >
          <Info className="w-5 h-5" />
          Instructions spéciales
        </button>

        <AnimatePresence>
          {showNotes && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <textarea
                placeholder="Ex: Sans oignons, bien cuit..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl resize-none focus:border-[#C62828] focus:ring-0 transition-colors"
                rows={4}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quantité */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="font-bold text-gray-900 mb-3">Quantité</h3>
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <Minus className="w-5 h-5" />
            </button>
            <span className="text-3xl font-black text-gray-900">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Sticky bottom CTA */}
      <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-200 p-4 z-[10000]">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleAddToCart}
          className="w-full bg-gradient-to-r from-[#C62828] to-orange-500 text-white py-4 rounded-2xl font-black text-lg shadow-xl flex items-center justify-center gap-4"
        >
          <span>Ajouter au panier</span>
          <span>{getTotalPrice().toFixed(2)}€</span>
        </motion.button>
      </div>
    </div>
  );
};
