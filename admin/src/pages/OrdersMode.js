import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ordersAPI, settingsAPI, productsAPI } from '../services/api';
import { 
  Package, Clock, CheckCircle, XCircle, 
  Pause, Play, RefreshCw, LogOut, ChefHat,
  AlertTriangle, X, Timer, Ban
} from 'lucide-react';

export const OrdersMode = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({});
  const [isPaused, setIsPaused] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockFilter, setStockFilter] = useState('all'); // all, out_of_stock
  const [searchProduct, setSearchProduct] = useState('');

  useEffect(() => {
    const session = localStorage.getItem('orders_mode_session');
    const expiry = localStorage.getItem('orders_mode_expiry');
    
    if (!session || !expiry || new Date(expiry) < new Date()) {
      navigate('/orders-mode-login');
      return;
    }

    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [navigate]);

  const loadData = async () => {
    try {
      const [ordersRes, settingsRes, productsRes] = await Promise.all([
        ordersAPI.getActive(),
        settingsAPI.get(),
        productsAPI.getAll()
      ]);
      setOrders(ordersRes.data?.orders || []);
      const s = settingsRes.data?.settings || {};
      setSettings(s);
      setIsPaused(s.is_paused || false);
      
      // Vérifier les ruptures 24H expirées
      const prods = productsRes.data?.products || [];
      const now = new Date();
      prods.forEach(p => {
        if (p.out_of_stock_until) {
          const until = new Date(p.out_of_stock_until);
          if (until <= now && p.is_out_of_stock) {
            // Remettre en stock automatiquement
            productsAPI.toggleStock(p.id, false);
          }
        }
      });
      setProducts(prods);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, newStatus);
      loadData();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Erreur lors de la mise à jour');
    }
  };

  const togglePause = async () => {
    try {
      await settingsAPI.update({ is_paused: !isPaused });
      setIsPaused(!isPaused);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const setProductOutOfStock = async (productId, type) => {
    try {
      if (type === '24h') {
        // Rupture jusqu'à minuit
        const midnight = new Date();
        midnight.setHours(23, 59, 59, 999);
        await productsAPI.update(productId, { 
          is_out_of_stock: true,
          out_of_stock_until: midnight.toISOString()
        });
      } else if (type === 'indefinite') {
        // Rupture indéfinie
        await productsAPI.update(productId, { 
          is_out_of_stock: true,
          out_of_stock_until: null
        });
      } else {
        // Remettre en stock
        await productsAPI.update(productId, { 
          is_out_of_stock: false,
          out_of_stock_until: null
        });
      }
      loadData();
    } catch (error) {
      console.error('Error:', error);
      alert('Erreur lors de la mise à jour du stock');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('orders_mode_session');
    localStorage.removeItem('orders_mode_expiry');
    navigate('/select-mode');
  };

  const getStatusBadge = (status) => {
    const badges = {
      'new': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '🆕 Nouvelle' },
      'in_preparation': { bg: 'bg-blue-100', text: 'text-blue-800', label: '👨‍🍳 En préparation' },
      'ready': { bg: 'bg-green-100', text: 'text-green-800', label: '✅ Prête' },
      'delivering': { bg: 'bg-purple-100', text: 'text-purple-800', label: '🚗 En livraison' }
    };
    const badge = badges[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
    return <span className={`px-3 py-1 rounded-full text-sm font-semibold ${badge.bg} ${badge.text}`}>{badge.label}</span>;
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const getStockStatus = (product) => {
    if (!product.is_out_of_stock) return 'in_stock';
    if (product.out_of_stock_until) return '24h';
    return 'indefinite';
  };

  const outOfStockProducts = products.filter(p => p.is_out_of_stock === true);
  
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchProduct.toLowerCase());
    const matchesFilter = stockFilter === 'all' || 
      (stockFilter === 'out_of_stock' && p.is_out_of_stock);
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-4 md:px-6 py-4 sticky top-0 z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <ChefHat className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">Mode Commandes</h1>
              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-semibold">
                {orders.length} active{orders.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadData}>
              <RefreshCw className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Actualiser</span>
            </Button>
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setShowStockModal(true)}
              className={outOfStockProducts.length > 0 ? 'border-red-300 text-red-600' : ''}
            >
              <AlertTriangle className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Ruptures</span> ({outOfStockProducts.length})
            </Button>
            <Button 
              size="sm"
              variant={isPaused ? "default" : "outline"}
              onClick={togglePause}
              className={isPaused ? 'bg-red-500 hover:bg-red-600' : ''}
            >
              {isPaused ? <Play className="w-4 h-4 md:mr-2" /> : <Pause className="w-4 h-4 md:mr-2" />}
              <span className="hidden md:inline">{isPaused ? 'Reprendre' : 'Pause'}</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Quitter</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Alerte Pause */}
      {isPaused && (
        <div className="bg-red-500 text-white px-4 py-3 text-center font-semibold">
          ⏸️ Commandes en pause - Les clients ne peuvent pas commander
        </div>
      )}

      {/* Liste des commandes */}
      <div className="p-4 md:p-6">
        {orders.length === 0 ? (
          <Card className="text-center py-16">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-500">Aucune commande active</h3>
            <p className="text-gray-400 mt-2">Les nouvelles commandes apparaîtront ici</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {orders.map((order) => (
              <Card key={order.id} className={`p-4 ${order.status === 'new' ? 'ring-2 ring-yellow-400 animate-pulse' : ''}`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-xl">#{order.order_number}</h3>
                    <p className="text-sm text-gray-600">{order.customer_name}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {formatTime(order.created_at)}
                    </p>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                <div className="border-t pt-3 mb-3 max-h-32 overflow-y-auto">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="text-sm py-1 border-b border-gray-100 last:border-0">
                      <span className="font-semibold">{item.quantity}x</span> {item.name}
                      {item.options && item.options.length > 0 && (
                        <p className="text-xs text-gray-400 ml-4">
                          {item.options.map(o => o.name || o).join(', ')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {order.notes && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mb-3 text-sm">
                    📝 {order.notes}
                  </div>
                )}

                <div className="border-t pt-3">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs text-gray-500">
                      {order.order_type === 'delivery' ? '🚗 Livraison' : '🏪 À emporter'}
                    </span>
                    <span className="font-bold text-xl text-green-600">{order.total?.toFixed(2)}€</span>
                  </div>
                  
                  <div className="flex gap-2">
                    {order.status === 'new' && (
                      <>
                        <Button 
                          size="sm" 
                          className="flex-1 bg-blue-500 hover:bg-blue-600"
                          onClick={() => handleStatusChange(order.id, 'in_preparation')}
                        >
                          <ChefHat className="w-4 h-4 mr-1" /> Préparer
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-red-500 border-red-300"
                          onClick={() => handleStatusChange(order.id, 'cancelled')}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    {order.status === 'in_preparation' && (
                      <Button 
                        size="sm" 
                        className="flex-1 bg-green-500 hover:bg-green-600"
                        onClick={() => handleStatusChange(order.id, 'ready')}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" /> Prête !
                      </Button>
                    )}
                    {order.status === 'ready' && order.order_type === 'delivery' && (
                      <Button 
                        size="sm" 
                        className="flex-1 bg-purple-500 hover:bg-purple-600"
                        onClick={() => handleStatusChange(order.id, 'delivering')}
                      >
                        🚗 En livraison
                      </Button>
                    )}
                    {order.status === 'ready' && order.order_type !== 'delivery' && (
                      <Button 
                        size="sm" 
                        className="flex-1 bg-gray-600 hover:bg-gray-700"
                        onClick={() => handleStatusChange(order.id, 'completed')}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" /> Récupérée
                      </Button>
                    )}
                    {order.status === 'delivering' && (
                      <Button 
                        size="sm" 
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleStatusChange(order.id, 'delivered')}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" /> Livrée
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal Gestion des Ruptures */}
      {showStockModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">🚫 Gestion des Ruptures</h2>
              <button onClick={() => setShowStockModal(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Filtres */}
            <div className="p-4 border-b bg-gray-50">
              <input
                type="text"
                placeholder="🔍 Rechercher un produit..."
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg mb-3"
              />
              <div className="flex gap-2">
                <button 
                  onClick={() => setStockFilter('all')}
                  className={`px-3 py-1 rounded-full text-sm ${stockFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                  Tous ({products.length})
                </button>
                <button 
                  onClick={() => setStockFilter('out_of_stock')}
                  className={`px-3 py-1 rounded-full text-sm ${stockFilter === 'out_of_stock' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
                >
                  En rupture ({outOfStockProducts.length})
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto max-h-[50vh]">
              <div className="space-y-3">
                {filteredProducts.map((product) => {
                  const status = getStockStatus(product);
                  return (
                    <div 
                      key={product.id}
                      className={`p-3 rounded-lg border ${
                        status !== 'in_stock' 
                          ? 'bg-red-50 border-red-300' 
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {product.image_url && (
                            <img src={product.image_url} alt="" className="w-12 h-12 rounded object-cover" />
                          )}
                          <div>
                            <p className="font-semibold">{product.name}</p>
                            <p className="text-sm text-gray-500">{product.category_name}</p>
                          </div>
                        </div>
                        {status === 'in_stock' && (
                          <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                            ✅ En stock
                          </span>
                        )}
                        {status === '24h' && (
                          <span className="px-2 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                            ⏰ Rupture 24H
                          </span>
                        )}
                        {status === 'indefinite' && (
                          <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                            🚫 Rupture indéfinie
                          </span>
                        )}
                      </div>
                      
                      <div className="flex gap-2 mt-2">
                        {status === 'in_stock' ? (
                          <>
                            <button
                              onClick={() => setProductOutOfStock(product.id, '24h')}
                              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg text-sm font-semibold hover:bg-orange-200"
                            >
                              <Timer className="w-4 h-4" /> Rupture 24H
                            </button>
                            <button
                              onClick={() => setProductOutOfStock(product.id, 'indefinite')}
                              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-200"
                            >
                              <Ban className="w-4 h-4" /> Rupture indéfinie
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setProductOutOfStock(product.id, 'in_stock')}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-semibold hover:bg-green-200"
                          >
                            <CheckCircle className="w-4 h-4" /> Remettre en stock
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="p-4 border-t bg-gray-50">
              <Button onClick={() => setShowStockModal(false)} className="w-full">
                Fermer
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
