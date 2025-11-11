import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ShoppingBag, ChevronLeft, Plus, Minus } from 'lucide-react';
import { products, productOptions } from '../mockData';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { toast } from '../hooks/use-toast';
import ProductNotes from '../components/ProductNotes';
import AddToCartAnimation from '../components/AddToCartAnimation';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleFavorite, isFavorite } = useApp();

  const product = products.find(p => p.slug === slug);
  const options = productOptions[product?.id] || [];

  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [productNotes, setProductNotes] = useState('');
  const [showAnimation, setShowAnimation] = useState(false);

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

    // Ajouter les notes si présentes
    const productWithNotes = { ...product, notes: productNotes };
    addToCart(productWithNotes, selectedOptionsArray, quantity);
    
    // Animation
    setShowAnimation(true);
    setTimeout(() => setShowAnimation(false), 1000);
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50]);
    }
    
    toast({
      title: '🎉 Ajouté au panier !',
      description: `${product.name} x${quantity}`,
    });
  };

  return (
    <div className="bg-[#FAFAFA] dark:bg-[#121212] min-h-screen pb-20">
      {/* Back Button - Fixed at top */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/20 to-transparent p-4">
        <button
          onClick={() => navigate(-1)}
          className="w-12 h-12 bg-white dark:bg-[#1a1a1a] rounded-full flex items-center justify-center shadow-xl active:scale-90 transition-transform"
        >
          <ChevronLeft className="w-6 h-6 text-gray-800 dark:text-white" />
        </button>
      </div>

      {/* Mobile Product Page */}
      <div className="relative">
        <div className="space-y-0">
          {/* Product Image - Full Width */}
          <div className="relative h-80">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => toggleFavorite(product.id)}
              className="absolute top-4 right-4 w-12 h-12 bg-white/90 dark:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
            >
              <Star
                className={`w-6 h-6 ${
                  isFavorite(product.id)
                    ? 'fill-[#C62828] text-[#C62828]'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              />
            </button>
            {product.tags.length > 0 && (
              <div className="absolute bottom-4 left-4">
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
          <div className="bg-white dark:bg-[#1a1a1a] rounded-t-[32px] -mt-8 relative z-10 px-4 pt-6 pb-6 space-y-6">
            <div>
              <h1 className="text-3xl font-black text-gray-800 dark:text-white mb-3">
                {product.name}
              </h1>
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="bg-gradient-to-r from-[#C62828] to-[#8B0000] text-white rounded-3xl p-5 flex items-center justify-between">
              <div>
                <div className="text-sm opacity-90 mb-1">Prix</div>
                <div className="text-4xl font-black">{product.basePrice.toFixed(2)}€</div>
              </div>
            </div>

            {/* Options */}
            {options.length > 0 && (
              <div className="space-y-4">
                {options.map(group => {
                  // Check if this group should be shown based on showIf condition
                  if (group.showIf) {
                    const conditionMet = (selectedOptions[group.showIf.optionGroupId] || []).includes(group.showIf.optionId);
                    if (!conditionMet) return null;
                  }

                  return (
                    <div key={group.id} className="bg-gray-50 dark:bg-[#0f0f0f] rounded-3xl p-5">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                        {group.name}
                        {group.required && <span className="text-[#C62828] ml-2">*</span>}
                      </h3>
                      <div className="space-y-2">
                        {group.options.map(option => {
                          const isSelected = (selectedOptions[group.id] || []).includes(option.id);
                          return (
                            <button
                              key={option.id}
                              onClick={() => handleOptionChange(group.id, option.id, group.type === 'multi')}
                              className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-200 active:scale-98 ${
                                isSelected
                                  ? 'border-[#C62828] bg-[#C62828]/10 dark:bg-[#C62828]/20'
                                  : 'border-gray-200 dark:border-gray-700'
                              }`}
                            >
                              <span className="font-bold text-gray-800 dark:text-white">{option.name}</span>
                              <span className="text-[#C62828] dark:text-[#FFD54F] font-bold text-sm">
                                {option.deltaPrice > 0 ? `+${option.deltaPrice.toFixed(2)}€` : 'Inclus'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Product Notes */}
            <ProductNotes notes={productNotes} onNotesChange={setProductNotes} />

            {/* Quantity & Total */}
            <div className="bg-gray-50 dark:bg-[#0f0f0f] rounded-3xl p-5">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Quantité</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 bg-white dark:bg-[#1a1a1a] rounded-full p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 rounded-full flex items-center justify-center active:bg-gray-100 dark:active:bg-gray-700 transition-colors"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="text-2xl font-black px-4 min-w-[60px] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 rounded-full flex items-center justify-center active:bg-gray-100 dark:active:bg-gray-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Total</div>
                  <div className="text-4xl font-black text-[#C62828] dark:text-[#FFD54F]">
                    {calculateTotalPrice.toFixed(2)}€
                  </div>
                </div>
              </div>
            </div>

            {/* Add to Cart Animation */}
            <AddToCartAnimation trigger={showAnimation} productImage={product.imageUrl} />

            {/* Add to Cart Button - Fixed at bottom */}
            <div className="fixed bottom-20 left-0 right-0 p-4 bg-white dark:bg-[#1a1a1a] border-t border-gray-200 dark:border-gray-800 z-10">
              <Button
                onClick={handleAddToCart}
                className="w-full bg-gradient-to-r from-[#C62828] to-[#8B0000] text-white py-7 rounded-full text-xl font-black shadow-2xl active:scale-95 transition-all duration-200"
              >
                <ShoppingBag className="w-6 h-6 mr-3" />
                Ajouter - {calculateTotalPrice.toFixed(2)}€
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
