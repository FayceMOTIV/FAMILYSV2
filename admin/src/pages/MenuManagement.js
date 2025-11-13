import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { ProductModal } from '../components/ProductModal';
import { CategoryModal } from '../components/CategoryModal';
import { OptionModal } from '../components/OptionModal';
import { productsAPI, categoriesAPI } from '../services/api';
import { Plus, Edit2, Trash2, Package, Copy, FolderOpen, Sliders, Edit } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://resto-backoffice-1.preview.emergentagent.com';

export const MenuManagement = () => {
  const [activeTab, setActiveTab] = useState('products');
  
  // Products state
  const [products, setProducts] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Categories state
  const [categories, setCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  // Options state
  const [options, setOptions] = useState([]);
  const [showOptionModal, setShowOptionModal] = useState(false);
  const [editingOption, setEditingOption] = useState(null);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadProducts(),
        loadCategories(),
        loadOptions()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadOptions = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/admin/options`);
      setOptions(response.data.options || []);
    } catch (error) {
      console.error('Error loading options:', error);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;
    try {
      await productsAPI.delete(id);
      loadProducts();
    } catch (error) {
      alert('Erreur lors de la suppression');
    }
  };

  const handleDuplicateProduct = async (product) => {
    if (!window.confirm(`Dupliquer "${product.name}" ?`)) return;
    try {
      const duplicatedProduct = {
        ...product,
        name: `${product.name} (copie)`,
        slug: `${product.slug}-copie-${Date.now()}`,
      };
      delete duplicatedProduct.id;
      await productsAPI.create(duplicatedProduct);
      loadProducts();
      alert('✅ Produit dupliqué avec succès !');
    } catch (error) {
      alert('Erreur lors de la duplication');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Supprimer cette catégorie ?')) return;
    try {
      await categoriesAPI.delete(id);
      loadCategories();
      alert('✅ Catégorie supprimée!');
    } catch (error) {
      alert('Erreur lors de la suppression');
    }
  };

  const handleDeleteOption = async (optionId) => {
    if (!window.confirm('Supprimer cette option ?')) return;
    try {
      await axios.delete(`${API_URL}/api/v1/admin/options/${optionId}`);
      loadOptions();
      alert('✅ Option supprimée!');
    } catch (error) {
      alert('Erreur lors de la suppression');
    }
  };

  const handleDuplicateOption = async (option) => {
    if (!window.confirm(`Dupliquer l'option "${option.name}" ?`)) return;
    try {
      const duplicatedOption = {
        ...option,
        name: `${option.name} (copie)`,
      };
      delete duplicatedOption.id;
      await axios.post(`${API_URL}/api/v1/admin/options`, duplicatedOption);
      loadOptions();
      alert('✅ Option dupliquée avec succès !');
    } catch (error) {
      alert('Erreur lors de la duplication');
    }
  };

  const tabs = [
    { id: 'products', label: '🍔 Produits', icon: Package, count: products.length },
    { id: 'categories', label: '📁 Catégories', icon: FolderOpen, count: categories.length },
    { id: 'options', label: '🎛️ Options', icon: Sliders, count: options.length }
  ];

  if (loading) {
    return (
      <div>
        <Header title="📋 Gestion du Menu" subtitle="Gérez vos produits, catégories et options" />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="📋 Gestion du Menu" subtitle="Gérez vos produits, catégories et options" />
      
      {/* Onglets horizontaux */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex space-x-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-3 px-6 py-3 rounded-lg font-bold transition-all ${
                    activeTab === tab.id 
                      ? 'bg-primary text-white shadow-lg scale-105' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    activeTab === tab.id ? 'bg-white/20' : 'bg-gray-200'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contenu selon l'onglet actif */}
      <div className="p-6">
        {/* PRODUITS */}
        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">🍔 Produits ({products.length})</h2>
              <Button 
                onClick={() => {
                  setEditingProduct(null);
                  setShowProductModal(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouveau produit
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => {
                const price = product.base_price || product.basePrice || 0;
                return (
                  <Card key={product.id}>
                    {(product.image_url || product.image) ? (
                      <img
                        src={product.image_url || product.image}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                        <Package className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <h4 className="font-bold text-lg mb-2">{product.name}</h4>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-black text-primary">{price.toFixed(2)}€</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        product.is_available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {product.is_available ? 'Disponible' : 'Indisponible'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => {
                          setEditingProduct(product);
                          setShowProductModal(true);
                        }}
                        title="Modifier"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDuplicateProduct(product)}
                        title="Dupliquer"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="danger" 
                        onClick={() => handleDeleteProduct(product.id)}
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* CATÉGORIES */}
        {activeTab === 'categories' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">📁 Catégories ({categories.length})</h2>
              <Button 
                onClick={() => {
                  setEditingCategory(null);
                  setShowCategoryModal(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle catégorie
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map((category) => {
                const imageUrl = category.image_url || category.image;
                return (
                  <Card key={category.id}>
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={category.name}
                        className="w-full h-40 object-cover rounded-lg mb-4"
                      />
                    ) : (
                      <div className="w-full h-40 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg mb-4 flex items-center justify-center">
                        <FolderOpen className="w-12 h-12 text-orange-400" />
                      </div>
                    )}
                    <h4 className="font-bold text-lg mb-2">{category.name}</h4>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{category.description}</p>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        setEditingCategory(category);
                        setShowCategoryModal(true);
                      }}
                      className="flex-1"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="danger" 
                      onClick={() => handleDeleteCategory(category.id)}
                      className="flex-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              );
              })}
            </div>
          </div>
        )}

        {/* OPTIONS */}
        {activeTab === 'options' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">🎛️ Options ({options.length})</h2>
              <Button 
                onClick={() => {
                  setEditingOption(null);
                  setShowOptionModal(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle option
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {options.map((option) => (
                <Card key={option.id}>
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-lg font-bold">{option.name}</span>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => {
                            setEditingOption(option);
                            setShowOptionModal(true);
                          }}
                          className="p-2 hover:bg-white rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDuplicateOption(option)}
                          className="p-2 hover:bg-white rounded-lg transition-colors"
                          title="Dupliquer"
                        >
                          <Copy className="w-4 h-4 text-green-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteOption(option.id)}
                          className="p-2 hover:bg-white rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {option.description && (
                      <p className="text-sm text-gray-600">{option.description}</p>
                    )}
                    
                    {option.internal_comment && (
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                        <p className="text-xs font-semibold text-yellow-800 mb-1">📝 Commentaire interne</p>
                        <p className="text-sm text-yellow-700">{option.internal_comment}</p>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2 text-sm">
                      <span className={`px-3 py-1 rounded-full font-bold ${
                        option.is_required 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {option.is_required ? 'Obligatoire' : 'Optionnel'}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-bold">
                        {option.type === 'single' ? 'Choix unique' : 'Choix multiple'}
                      </span>
                    </div>

                    {option.type === 'multiple' && option.max_choices && (
                      <p className="text-xs text-gray-500">
                        Maximum {option.max_choices} choix
                      </p>
                    )}

                    <div className="pt-3 border-t">
                      <p className="text-xs font-semibold text-gray-600 mb-2">
                        Choix disponibles ({option.choices?.length || 0})
                      </p>
                      <div className="space-y-1">
                        {option.choices?.slice(0, 3).map((choice, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-gray-700">{choice.name}</span>
                            {choice.price_modifier > 0 && (
                              <span className="text-green-600 font-semibold">
                                +{choice.price_modifier.toFixed(2)}€
                              </span>
                            )}
                          </div>
                        ))}
                        {option.choices?.length > 3 && (
                          <p className="text-xs text-gray-400 italic">
                            +{option.choices.length - 3} autres choix...
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ProductModal
        isOpen={showProductModal}
        onClose={() => {
          setShowProductModal(false);
          setEditingProduct(null);
        }}
        product={editingProduct}
        onSuccess={loadProducts}
      />

      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => {
          setShowCategoryModal(false);
          setEditingCategory(null);
        }}
        category={editingCategory}
        onSuccess={loadCategories}
      />

      <OptionModal
        isOpen={showOptionModal}
        onClose={() => {
          setShowOptionModal(false);
          setEditingOption(null);
        }}
        option={editingOption}
        onSuccess={loadOptions}
      />
    </div>
  );
};
