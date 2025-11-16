import React, { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Plus, Trash2, Play } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://react-native-reboot.preview.emergentagent.com';

export const PromotionSimulator = ({ promotions }) => {
  const [cart, setCart] = useState({
    items: [],
    total: 0,
    delivery_fee: 5
  });
  const [promoCode, setPromoCode] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const addItem = () => {
    setCart({
      ...cart,
      items: [...cart.items, { product_id: '', name: '', price: 0, quantity: 1, category_id: '' }]
    });
  };
  
  const removeItem = (index) => {
    setCart({
      ...cart,
      items: cart.items.filter((_, i) => i !== index)
    });
  };
  
  const updateItem = (index, field, value) => {
    const newItems = [...cart.items];
    newItems[index][field] = value;
    setCart({ ...cart, items: newItems });
    calculateTotal(newItems);
  };
  
  const calculateTotal = (items) => {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setCart(c => ({ ...c, total }));
  };
  
  const simulate = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/v1/admin/promotions/simulate`, {
        cart,
        customer: null,
        promo_code: promoCode || null
      });
      setResult(response.data.simulation);
    } catch (error) {
      console.error('Error simulating:', error);
      alert('Erreur lors de la simulation');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Cart Builder */}
      <Card>
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4">🛒 Panier Test</h3>
          
          <div className="space-y-3 mb-4">
            {cart.items.map((item, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Nom produit"
                  value={item.name}
                  onChange={(e) => updateItem(index, 'name', e.target.value)}
                  className="flex-1 px-2 py-1 border rounded text-sm"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Prix"
                  value={item.price}
                  onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                  className="w-20 px-2 py-1 border rounded text-sm"
                />
                <input
                  type="number"
                  placeholder="Qté"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                  className="w-16 px-2 py-1 border rounded text-sm"
                />
                <button
                  onClick={() => removeItem(index)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          
          <Button size="sm" variant="outline" onClick={addItem}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un article
          </Button>
          
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between mb-2">
              <span>Sous-total:</span>
              <span className="font-bold">{cart.total.toFixed(2)}€</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Livraison:</span>
              <span>{cart.delivery_fee.toFixed(2)}€</span>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Code promo (optionnel)</label>
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Ex: WELCOME10"
            />
          </div>
          
          <Button className="w-full mt-4" onClick={simulate} disabled={loading || cart.items.length === 0}>
            <Play className="w-4 h-4 mr-2" />
            {loading ? 'Simulation...' : 'Simuler les promotions'}
          </Button>
        </div>
      </Card>
      
      {/* Results */}
      <Card>
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4">📊 Résultats</h3>
          
          {result ? (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span>Montant original:</span>
                  <span className="font-bold">{result.original_total?.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between mb-2 text-green-600">
                  <span>Remise totale:</span>
                  <span className="font-bold">-{result.total_discount?.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-xl font-black border-t pt-2">
                  <span>Total final:</span>
                  <span className="text-primary">{result.final_total?.toFixed(2)}€</span>
                </div>
              </div>
              
              {result.applied_promotions?.length > 0 && (
                <div>
                  <h4 className="font-bold mb-2">Promotions appliquées:</h4>
                  <div className="space-y-2">
                    {result.applied_promotions.map((promo, index) => (
                      <div key={index} className="p-3 border rounded-lg bg-green-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-green-800">{promo.name}</p>
                            {promo.badge && (
                              <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded mt-1 inline-block">
                                {promo.badge}
                              </span>
                            )}
                          </div>
                          <span className="text-green-600 font-bold">-{promo.discount?.toFixed(2)}€</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {result.loyalty_multiplier > 1 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⭐ Points fidélité multipliés par <strong>x{result.loyalty_multiplier}</strong>
                  </p>
                </div>
              )}
              
              {result.applied_promotions?.length === 0 && (
                <div className="p-4 bg-gray-100 rounded-lg text-center text-gray-600">
                  Aucune promotion applicable pour ce panier
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <p>Ajoutez des articles et lancez la simulation</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};