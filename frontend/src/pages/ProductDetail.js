import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ShoppingBag, ChevronLeft, Plus, Minus } from 'lucide-react';
import { products, productOptions } from '../mockData';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { toast } from '../hooks/use-toast';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleFavorite, isFavorite } = useApp();

  const product = products.find(p => p.slug === slug);
  const options = productOptions[product?.id] || [];

  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({});

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Produit non trouvé</h2>
          <Button onClick={() => navigate('/menu')}>Retour au menu</Button>
        </div>
      </div>
    );
  }

  const handleOptionChange = (groupId, optionId, isMulti) => {
    if (isMulti) {
      setSelectedOptions(prev => {
        const current = prev[groupId] || [];
        if (current.includes(optionId)) {
          return { ...prev, [groupId]: current.filter(id => id !== optionId) };
        }
        return { ...prev, [groupId]: [...current, optionId] };
      });
    } else {
      setSelectedOptions(prev => ({ ...prev, [groupId]: [optionId] }));
    }
  };

  const calculateTotalPrice = useMemo(() => {
    let total = product.basePrice;
    
    options.forEach(group => {
      const selected = selectedOptions[group.id] || [];
      selected.forEach(optId => {
        const option = group.options.find(o => o.id === optId);
        if (option) {
          total += option.deltaPrice;
        }
      });
    });
    
    return total * quantity;
  }, [product.basePrice, selectedOptions, quantity, options]);

  const handleAddToCart = () => {
    // Validate required options
    const missingRequired = options.find(
      group => group.required && (!selectedOptions[group.id] || selectedOptions[group.id].length === 0)
    );

    if (missingRequired) {
      toast({
        title: 'Options manquantes',
        description: `Veuillez sélectionner: ${missingRequired.name}`,
        variant: 'destructive'
      });
      return;
    }

    const selectedOptionsArray = [];
    options.forEach(group => {
      const selected = selectedOptions[group.id] || [];
      selected.forEach(optId => {
        const option = group.options.find(o => o.id === optId);
        if (option) {
          selectedOptionsArray.push(option);
        }
      });
    });

    addToCart(product, selectedOptionsArray, quantity);
    
    toast({
      title: 'Ajouté au panier !',
      description: `${product.name} a été ajouté à votre panier`,
    });
  };

  return (
    <div className="bg-[#FAFAFA] dark:bg-[#121212] min-h-screen pb-20">
      {/* Mobile Product Page */}
      <div className="relative">
        {/* Back Button Floating */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-10 w-12 h-12 bg-white/90 dark:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
        >
          <ChevronLeft className="w-6 h-6 text-gray-800 dark:text-white" />
        </button>

        <div className="space-y-0">
          {/* Product Image */}
          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-96 lg:h-[600px] object-cover"
              />
            </div>
            <button
              onClick={() => toggleFavorite(product.id)}
              className="absolute top-4 right-4 w-14 h-14 bg-white/90 dark:bg-black/60 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
            >
              <Star
                className={`w-7 h-7 ${
                  isFavorite(product.id)
                    ? 'fill-[#C62828] text-[#C62828]'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              />
            </button>
            {product.tags.length > 0 && (
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                {product.tags.map(tag => (
                  <span
                    key={tag}
                    className="bg-[#FFD54F] text-[#121212] px-4 py-2 rounded-full text-sm font-bold"
                  >
                    {tag === 'best-seller' ? 'Best-Seller' : tag === 'new' ? 'Nouveau' : 'Populaire'}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
                {product.name}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {product.description}
              </p>
            </div>

            <div className="bg-gradient-to-r from-[#C62828] to-[#8B0000] text-white rounded-2xl p-6">
              <div className="text-sm opacity-90 mb-1">Prix</div>
              <div className="text-4xl font-bold">{product.basePrice.toFixed(2)}€</div>
            </div>

            {/* Options */}
            {options.length > 0 && (
              <div className="space-y-6">
                {options.map(group => (
                  <div key={group.id} className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-lg">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                      {group.name}
                      {group.required && <span className="text-[#C62828] ml-2">*</span>}
                    </h3>
                    <div className="space-y-3">
                      {group.options.map(option => {
                        const isSelected = (selectedOptions[group.id] || []).includes(option.id);
                        return (
                          <button
                            key={option.id}
                            onClick={() => handleOptionChange(group.id, option.id, group.type === 'multi')}
                            className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 ${
                              isSelected
                                ? 'border-[#C62828] bg-[#C62828]/10 dark:bg-[#C62828]/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-[#C62828] dark:hover:border-[#FFD54F]'
                            }`}
                          >
                            <span className="font-semibold text-gray-800 dark:text-white">{option.name}</span>
                            <span className="text-[#C62828] dark:text-[#FFD54F] font-bold">
                              {option.deltaPrice > 0 ? `+${option.deltaPrice.toFixed(2)}€` : 'Inclus'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity */}
            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Quantité</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 bg-gray-100 dark:bg-[#2a2a2a] rounded-full p-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 bg-white dark:bg-[#1a1a1a] rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="text-2xl font-bold w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 bg-white dark:bg-[#1a1a1a] rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
                  <div className="text-3xl font-bold text-[#C62828] dark:text-[#FFD54F]">
                    {calculateTotalPrice.toFixed(2)}€
                  </div>
                </div>
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              className="w-full bg-gradient-to-r from-[#C62828] to-[#8B0000] hover:from-[#8B0000] hover:to-[#C62828] text-white py-8 rounded-2xl text-xl font-bold shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <ShoppingBag className="w-6 h-6 mr-3" />
              Ajouter au panier
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
