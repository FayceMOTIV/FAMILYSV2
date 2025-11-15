import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { ProductModal } from '../components/ProductModal';
import { CategoryModal } from '../components/CategoryModal';
import { OptionModal } from '../components/OptionModal';
import { ProductVisualModal } from '../components/ProductVisualModal';
import { productsAPI, categoriesAPI } from '../services/api';
import { Plus, Edit2, Trash2, Package, Copy, FolderOpen, Sliders, Edit, MoreVertical, Clock, Calendar, XCircle, CheckCircle, ArrowUp, ArrowDown, LayoutGrid, List as ListIcon, Search, X, Filter, Grid, Image } from 'lucide-react';
import { ProductsListView } from '../components/ProductsListView';
import { CategoriesListView } from '../components/CategoriesListView';
import { OptionsListView } from '../components/OptionsListView';
import { ChoiceLibraryModal } from '../components/ChoiceLibraryModal';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://chefs-control.preview.emergentagent.com';

export const MenuManagement = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'list'
  const [optionsViewMode, setOptionsViewMode] = useState('grid'); // 'grid' ou 'list' pour options
  const [draggedCategoryIndex, setDraggedCategoryIndex] = useState(null);
  const [draggedProductIndex, setDraggedProductIndex] = useState(null);
  
  // Choice Library state
  const [choiceLibrary, setChoiceLibrary] = useState([]);
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [editingChoice, setEditingChoice] = useState(null);
  const [librarySearchTerm, setLibrarySearchTerm] = useState('');
  const [libraryViewMode, setLibraryViewMode] = useState('grid'); // 'grid' ou 'list'
  
  // Products state
  const [products, setProducts] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showVisualModal, setShowVisualModal] = useState(false);
  const [editingVisualProduct, setEditingVisualProduct] = useState(null);
  const [openStockMenu, setOpenStockMenu] = useState(null);
  const [showOutOfStockOnly, setShowOutOfStockOnly] = useState(false);
  
  // Filtres
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPromo, setFilterPromo] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStock, setFilterStock] = useState('all');
  const [expandedCategory, setExpandedCategory] = useState(null);
  
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

  // Close stock menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (openStockMenu && !e.target.closest('.relative')) {
        setOpenStockMenu(null);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openStockMenu]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadProducts(),
        loadCategories(),
        loadOptions(),
        loadChoiceLibrary()
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

  const loadChoiceLibrary = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/admin/choice-library`);
      setChoiceLibrary(response.data.choices || []);
    } catch (error) {
      console.error('Error loading choice library:', error);
    }
  };

  // === FILTRAGE DES PRODUITS ===
  const filteredProducts = products.filter(product => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchName = product.name?.toLowerCase().includes(query);
      const matchDesc = product.description?.toLowerCase().includes(query);
      if (!matchName && !matchDesc) return false;
    }
    if (filterPromo && !product.isPromo) return false;
    if (filterCategory !== 'all' && product.category !== filterCategory) return false;
    if (filterStock === 'available' && product.is_out_of_stock) return false;
    if (filterStock === 'out_of_stock' && !product.is_out_of_stock) return false;
    if (showOutOfStockOnly && !product.is_out_of_stock) return false;
    return true;
  });

  const resetFilters = () => {
    setSearchQuery('');
    setFilterPromo(false);
    setFilterCategory('all');
    setFilterStock('all');
    setShowOutOfStockOnly(false);
  };

  const hasActiveFilters = searchQuery || filterPromo || filterCategory !== 'all' || filterStock !== 'all' || showOutOfStockOnly;

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
      };
      delete duplicatedProduct.id;
      await productsAPI.create(duplicatedProduct);
      loadProducts();
      alert('✅ Produit dupliqué avec succès !');
    } catch (error) {
      alert('Erreur lors de la duplication');
    }
  };

  const handleStockStatus = async (productId, status) => {
    try {
      await axios.post(`${API_URL}/api/v1/admin/products/${productId}/stock-status`, { status });
      loadProducts();
      
      const messages = {
        '2h': '⏰ Produit en rupture pour 2 heures',
        'today': '📅 Produit en rupture jusqu\'à minuit',
        'indefinite': '🚫 Produit en rupture indéfinie',
        'available': '✅ Produit remis en stock'
      };
      alert(messages[status]);
    } catch (error) {
      alert('❌ Erreur lors de la mise à jour du stock');
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

  const handleDuplicateCategory = async (category) => {
    if (!window.confirm(`Dupliquer la catégorie "${category.name}" ?`)) return;
    try {
      const duplicatedCategory = {
        ...category,
        name: `${category.name} (copie)`,
      };
      delete duplicatedCategory.id;
      delete duplicatedCategory.order; // Reset order so it goes to the end
      await categoriesAPI.create(duplicatedCategory);
      loadCategories();
      alert('✅ Catégorie dupliquée avec succès !');
    } catch (error) {
      alert('Erreur lors de la duplication');
      console.error(error);
    }
  };

  const handleReorderCategory = async (categoryId, direction) => {
    const sortedCats = [...categories].sort((a, b) => (a.order || 0) - (b.order || 0));
    const index = sortedCats.findIndex(c => c.id === categoryId);
    if (index === -1) return;
    
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sortedCats.length) return;
    
    try {
      const category1 = sortedCats[index];
      const category2 = sortedCats[targetIndex];
      
      await axios.put(`${API_URL}/api/v1/admin/categories/${category1.id}`, {
        ...category1,
        order: category2.order || targetIndex
      });
      
      await axios.put(`${API_URL}/api/v1/admin/categories/${category2.id}`, {
        ...category2,
        order: category1.order || index
      });
      
      await loadCategories();
    } catch (error) {
      console.error('Error reordering:', error);
      alert('Erreur lors du réordonnancement');
    }
  };

  const handleMoveCategoryUp = async (category, index) => {
    if (index === 0) return; // Already at top
    
    const sortedCategories = [...categories].sort((a, b) => (a.order || 0) - (b.order || 0));
    const prevCategory = sortedCategories[index - 1];
    
    try {
      // Swap orders
      await categoriesAPI.update(category.id, { order: prevCategory.order || 0 });
      await categoriesAPI.update(prevCategory.id, { order: category.order || 0 });
      loadCategories();
    } catch (error) {
      alert('Erreur lors du déplacement');
    }
  };

  const handleMoveCategoryDown = async (category, index) => {
    const sortedCategories = [...categories].sort((a, b) => (a.order || 0) - (b.order || 0));
    if (index === sortedCategories.length - 1) return; // Already at bottom
    
    const nextCategory = sortedCategories[index + 1];
    
    try {
      // Swap orders
      await categoriesAPI.update(category.id, { order: nextCategory.order || 0 });
      await categoriesAPI.update(nextCategory.id, { order: category.order || 0 });
      loadCategories();
    } catch (error) {
      alert('Erreur lors du déplacement');
    }
  };

  // Drag & Drop handlers for categories
  const handleCategoryDragStart = (e, index) => {
    setDraggedCategoryIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleCategoryDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleCategoryDrop = async (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedCategoryIndex === null || draggedCategoryIndex === dropIndex) {
      setDraggedCategoryIndex(null);
      return;
    }

    const sortedCategories = [...categories].sort((a, b) => (a.order || 0) - (b.order || 0));
    const draggedCategory = sortedCategories[draggedCategoryIndex];
    const targetCategory = sortedCategories[dropIndex];

    try {
      // Swap orders
      await categoriesAPI.update(draggedCategory.id, { order: targetCategory.order || dropIndex });
      await categoriesAPI.update(targetCategory.id, { order: draggedCategory.order || draggedCategoryIndex });
      await loadCategories();
      setDraggedCategoryIndex(null);
    } catch (error) {
      alert('Erreur lors du déplacement');
      setDraggedCategoryIndex(null);
    }
  };

  // Drag & Drop handlers for products
  const handleProductDragStart = (e, index) => {
    setDraggedProductIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleProductDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleProductDrop = async (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedProductIndex === null || draggedProductIndex === dropIndex) {
      setDraggedProductIndex(null);
      return;
    }

    const sortedProducts = [...filteredProducts].sort((a, b) => (a.order || 0) - (b.order || 0));
    const draggedProduct = sortedProducts[draggedProductIndex];
    const targetProduct = sortedProducts[dropIndex];

    try {
      // Swap orders
      await productsAPI.update(draggedProduct.id, { order: targetProduct.order || dropIndex });
      await productsAPI.update(targetProduct.id, { order: draggedProduct.order || draggedProductIndex });
      await loadProducts();
      setDraggedProductIndex(null);
    } catch (error) {
      alert('Erreur lors du déplacement');
      setDraggedProductIndex(null);
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

  const handleDeleteChoice = async (choiceId) => {
    if (!window.confirm('Supprimer ce choix de la bibliothèque ?')) return;
    try {
      await axios.delete(`${API_URL}/api/v1/admin/choice-library/${choiceId}`);
      loadChoiceLibrary();
      alert('✅ Choix supprimé!');
    } catch (error) {
      alert('Erreur lors de la suppression');
    }
  };

  const tabs = [
    { id: 'products', label: '🍔 Produits', icon: Package, count: products.length },
    { id: 'categories', label: '📁 Catégories', icon: FolderOpen, count: categories.length },
    { id: 'options', label: '🎛️ Options', icon: Sliders, count: options.length },
    { id: 'choice-library', label: '📚 Bibliothèque', icon: Package, count: choiceLibrary.length }
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
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold">🍔 Produits ({filteredProducts.length})</h2>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                >
                  {viewMode === 'grid' ? <ListIcon className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
                </Button>
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
            </div>
            
            {/* Filtres */}
            <div className="mb-4 p-4 bg-white rounded-lg shadow">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-8 py-2 border rounded-lg text-sm"
                  />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="all">Toutes catégories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <select
                  value={filterStock}
                  onChange={(e) => setFilterStock(e.target.value)}
                  className="px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="all">Tous stocks</option>
                  <option value="available">Disponibles</option>
                  <option value="out_of_stock">En rupture</option>
                </select>
                <div className="flex gap-2">
                  <Button
                    variant={filterPromo ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterPromo(!filterPromo)}
                    className="flex-1"
                  >
                    Promo
                  </Button>
                  {hasActiveFilters && (
                    <Button variant="outline" size="sm" onClick={resetFilters}>
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {viewMode === 'list' ? (
              <ProductsListView 
                products={filteredProducts}
                categories={categories}
                onEdit={(p) => { setEditingProduct(p); setShowProductModal(true); }}
                onDelete={handleDeleteProduct}
                onDuplicate={handleDuplicateProduct}
                onStockClick={(id) => setOpenStockMenu(openStockMenu === id ? null : id)}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product, productIndex) => {
                const price = product.base_price || product.basePrice || 0;
                let imageUrl = product.image_url || product.image;
                // Construire l'URL complète si nécessaire
                if (imageUrl) {
                  // Si c'est une ancienne URL d'un autre domaine, extraire le chemin
                  if (imageUrl.includes('.preview.emergentagent.com/uploads/')) {
                    const match = imageUrl.match(/\/uploads\/.+$/);
                    if (match) {
                      imageUrl = `${API_URL}${match[0]}`;
                    }
                  } else if (imageUrl.startsWith('http')) {
                    // URL externe complète (Unsplash, etc.) - garder telle quelle
                    imageUrl = imageUrl;
                  } else if (!imageUrl.startsWith('http')) {
                    if (imageUrl.startsWith('/')) {
                      imageUrl = `${API_URL}${imageUrl}`;
                    } else {
                      imageUrl = `${API_URL}/${imageUrl}`;
                    }
                  }
                }
                return (
                  <Card 
                    key={product.id}
                    draggable
                    onDragStart={(e) => handleProductDragStart(e, productIndex)}
                    onDragOver={handleProductDragOver}
                    onDrop={(e) => handleProductDrop(e, productIndex)}
                    className={`cursor-move transition-all ${draggedProductIndex === productIndex ? 'opacity-50 scale-95' : ''}`}
                  >
                    {/* Zone cliquable pour ouvrir le modal */}
                    <div 
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => {
                        setEditingProduct(product);
                        setShowProductModal(true);
                      }}
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
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
                    </div>
                    
                    {/* Stock Status Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-black text-primary">{price.toFixed(2)}€</span>
                      {product.is_out_of_stock ? (
                        <div className="flex flex-col items-end">
                          {(() => {
                            const now = new Date();
                            const resumeAt = product.stock_resume_at ? new Date(product.stock_resume_at) : null;
                            
                            if (!resumeAt) {
                              // Rupture indéfinie
                              return (
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-700 text-white">
                                  ⛔ Rupture indéfinie
                                </span>
                              );
                            }
                            
                            const diffHours = (resumeAt - now) / (1000 * 60 * 60);
                            const isToday = resumeAt.toDateString() === now.toDateString();
                            const isTomorrow = resumeAt.toDateString() === new Date(now.getTime() + 24*60*60*1000).toDateString();
                            
                            if (diffHours <= 2.5 && diffHours > 0) {
                              // Rupture 2H
                              return (
                                <>
                                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                                    ⏰ Rupture 2H
                                  </span>
                                  <span className="text-xs text-gray-500 mt-1">
                                    Retour {resumeAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </>
                              );
                            } else if (isToday || (isTomorrow && resumeAt.getHours() === 0)) {
                              // Rupture aujourd'hui (jusqu'à minuit)
                              return (
                                <>
                                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                                    📅 Rupture journée
                                  </span>
                                  <span className="text-xs text-gray-500 mt-1">
                                    Retour demain
                                  </span>
                                </>
                              );
                            } else {
                              // Autre (date future)
                              return (
                                <>
                                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                                    🚫 Rupture
                                  </span>
                                  <span className="text-xs text-gray-500 mt-1">
                                    {resumeAt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} {resumeAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </>
                              );
                            }
                          })()}
                        </div>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                          ✅ En stock
                        </span>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="space-y-2 mb-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => {
                          setEditingVisualProduct(product);
                          setShowVisualModal(true);
                        }}
                        className="w-full bg-blue-50 hover:bg-blue-100 border-blue-200"
                        title="Image & Badge"
                      >
                        <Image className="w-4 h-4 mr-2" />
                        Image & Badge
                      </Button>
                      <div className="grid grid-cols-2 gap-2">
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
                      </div>
                    </div>
                    
                    {/* Stock Management Dropdown */}
                    <div className="relative mb-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setOpenStockMenu(openStockMenu === product.id ? null : product.id)}
                        className="w-full"
                        title="Gérer le stock"
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        Gérer le stock
                      </Button>
                      
                      {openStockMenu === product.id && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                          <button
                            onClick={() => {
                              handleStockStatus(product.id, '2h');
                              setOpenStockMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
                          >
                            <Clock className="w-4 h-4 mr-2 text-orange-500" />
                            Rupture 2 heures
                          </button>
                          <button
                            onClick={() => {
                              handleStockStatus(product.id, 'today');
                              setOpenStockMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
                          >
                            <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                            Rupture aujourd'hui
                          </button>
                          <button
                            onClick={() => {
                              handleStockStatus(product.id, 'indefinite');
                              setOpenStockMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center border-b"
                          >
                            <XCircle className="w-4 h-4 mr-2 text-red-500" />
                            Rupture indéfinie
                          </button>
                          <button
                            onClick={() => {
                              handleStockStatus(product.id, 'available');
                              setOpenStockMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center text-green-600 font-bold"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Remettre en stock
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Delete Button */}
                    <Button 
                      size="sm" 
                      variant="danger" 
                      onClick={() => handleDeleteProduct(product.id)}
                      title="Supprimer"
                      className="w-full"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer
                    </Button>
                  </Card>
                );
              })}
              </div>
            )}
          </div>
        )}

        {/* CATÉGORIES */}
        {activeTab === 'categories' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">📁 Catégories ({categories.length})</h2>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                >
                  {viewMode === 'grid' ? <ListIcon className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
                </Button>
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
            </div>

            {viewMode === 'list' ? (
              <CategoriesListView 
                categories={[...categories].sort((a, b) => (a.order || 0) - (b.order || 0))}
                products={products}
                onEdit={(c) => { setEditingCategory(c); setShowCategoryModal(true); }}
                onDelete={handleDeleteCategory}
                onReorder={handleReorderCategory}
                onDuplicate={handleDuplicateCategory}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...categories].sort((a, b) => (a.order || 0) - (b.order || 0)).map((category, index) => {
                let imageUrl = category.image_url || category.image;
                // Construire l'URL complète si nécessaire
                if (imageUrl) {
                  // Si c'est une ancienne URL d'un autre domaine, extraire le chemin
                  if (imageUrl.includes('.preview.emergentagent.com/uploads/')) {
                    const match = imageUrl.match(/\/uploads\/.+$/);
                    if (match) {
                      imageUrl = `${API_URL}${match[0]}`;
                    }
                  } else if (imageUrl.startsWith('http')) {
                    // URL externe complète (Unsplash, etc.) - garder telle quelle
                    imageUrl = imageUrl;
                  } else if (!imageUrl.startsWith('http')) {
                    if (imageUrl.startsWith('/')) {
                      imageUrl = `${API_URL}${imageUrl}`;
                    } else {
                      imageUrl = `${API_URL}/${imageUrl}`;
                    }
                  }
                }
                const sortedCategories = [...categories].sort((a, b) => (a.order || 0) - (b.order || 0));
                const isFirst = index === 0;
                const isLast = index === sortedCategories.length - 1;
                
                return (
                  <Card 
                    key={category.id}
                    draggable
                    onDragStart={(e) => handleCategoryDragStart(e, index)}
                    onDragOver={handleCategoryDragOver}
                    onDrop={(e) => handleCategoryDrop(e, index)}
                    className={`cursor-move transition-all ${draggedCategoryIndex === index ? 'opacity-50 scale-95' : ''}`}
                  >
                    {/* Zone cliquable pour expand/collapse les produits */}
                    <div 
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => {
                        setExpandedCategory(expandedCategory === category.id ? null : category.id);
                      }}
                    >
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
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-bold text-lg">{category.name}</h4>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">#{index + 1}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{category.description}</p>
                    </div>
                    
                    {/* View products - show count and expand */}
                    <div className="mb-2">
                      <div className="text-sm text-gray-600 font-medium mb-2">
                        <Package className="w-4 h-4 inline mr-1" />
                        {products.filter(p => p.category === category.name).length} produit(s)
                      </div>
                      
                      {/* Display products of this category */}
                      {expandedCategory === category.id && (
                        <div className="space-y-2 mt-3 p-3 bg-gray-50 rounded-lg">
                          {products.filter(p => p.category === category.name).map(product => {
                            // Construire l'URL de l'image du produit
                            let productImageUrl = product.image_url || product.image;
                            if (productImageUrl) {
                              if (productImageUrl.includes('.preview.emergentagent.com/uploads/')) {
                                const match = productImageUrl.match(/\/uploads\/.+$/);
                                if (match) {
                                  productImageUrl = `${API_URL}${match[0]}`;
                                }
                              } else if (productImageUrl.startsWith('http')) {
                                // URL externe (Unsplash, etc.) - garder telle quelle
                                productImageUrl = productImageUrl;
                              } else if (!productImageUrl.startsWith('http')) {
                                if (productImageUrl.startsWith('/')) {
                                  productImageUrl = `${API_URL}${productImageUrl}`;
                                } else {
                                  productImageUrl = `${API_URL}/${productImageUrl}`;
                                }
                              }
                            }

                            return (
                              <div 
                                key={product.id}
                                onClick={() => {
                                  setEditingProduct(product);
                                  setShowProductModal(true);
                                }}
                                className="flex items-center justify-between p-2 bg-white rounded hover:bg-blue-50 cursor-pointer transition-colors"
                              >
                                <div className="flex items-center space-x-2">
                                  {productImageUrl ? (
                                    <img src={productImageUrl} alt={product.name} className="w-10 h-10 object-cover rounded" />
                                  ) : (
                                    <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                                      <Package className="w-5 h-5 text-gray-400" />
                                    </div>
                                  )}
                                  <span className="text-sm font-medium">{product.name}</span>
                                </div>
                                <span className="text-sm font-bold text-primary">{product.base_price?.toFixed(2)}€</span>
                              </div>
                            );
                          })}
                          {products.filter(p => p.category === category.name).length === 0 && (
                            <p className="text-xs text-gray-400 italic text-center">Aucun produit dans cette catégorie</p>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Reorder buttons */}
                    <div className="flex space-x-2 mb-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleMoveCategoryUp(category, index)}
                        disabled={isFirst}
                        className="flex-1"
                        title="Monter"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleMoveCategoryDown(category, index)}
                        disabled={isLast}
                        className="flex-1"
                        title="Descendre"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {/* Edit and Delete buttons */}
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
            )}
          </div>
        )}

        {/* OPTIONS */}
        {activeTab === 'options' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">🎛️ Options ({options.length})</h2>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => setOptionsViewMode(optionsViewMode === 'grid' ? 'list' : 'grid')}
                >
                  {optionsViewMode === 'grid' ? <ListIcon className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
                </Button>
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
            </div>

            {optionsViewMode === 'list' ? (
              <OptionsListView 
                options={options}
                onEdit={(opt) => { setEditingOption(opt); setShowOptionModal(true); }}
                onDelete={handleDeleteOption}
                onDuplicate={handleDuplicateOption}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {options.map((option) => (
                <Card key={option.id}>
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex-1">
                        <span className="text-lg font-bold">{option.name}</span>
                        {option.internal_comment && (
                          <p className="text-xs text-yellow-700 mt-1 font-normal">💬 {option.internal_comment}</p>
                        )}
                      </div>
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

                  <CardContent 
                    className="space-y-3 cursor-pointer hover:bg-gray-50 transition-colors rounded-lg"
                    onClick={() => {
                      setEditingOption(option);
                      setShowOptionModal(true);
                    }}
                  >
                    {option.description && (
                      <p className="text-sm text-gray-600">{option.description}</p>
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
            )}
          </div>
        )}

        {/* BIBLIOTHÈQUE DE CHOIX */}
        {activeTab === 'choice-library' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold">📚 Bibliothèque de Choix ({choiceLibrary.filter(c => 
                  c.name.toLowerCase().includes(librarySearchTerm.toLowerCase())
                ).length})</h2>
                <p className="text-sm text-gray-600 mt-1">Créez des choix réutilisables avec images pour vos options</p>
              </div>
              <Button 
                onClick={() => {
                  setEditingChoice(null);
                  setShowChoiceModal(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouveau choix
              </Button>
            </div>

            {/* Barre de recherche et boutons de vue */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un choix (nom, catégorie, prix...)"
                  value={librarySearchTerm}
                  onChange={(e) => setLibrarySearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                />
                {librarySearchTerm && (
                  <button
                    onClick={() => setLibrarySearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              
              {/* Boutons de vue */}
              <div className="flex gap-2">
                <Button
                  variant={libraryViewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLibraryViewMode('grid')}
                  title="Vue grille"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={libraryViewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLibraryViewMode('list')}
                  title="Vue liste"
                >
                  <ListIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>

{(() => {
              const filteredChoices = choiceLibrary.filter(c => 
                c.name.toLowerCase().includes(librarySearchTerm.toLowerCase())
              );

              if (choiceLibrary.length === 0) {
                return (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-center">
                    <Package className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-blue-900 mb-2">Bibliothèque vide</h3>
                    <p className="text-sm text-blue-700 mb-4">
                      Créez vos premiers choix réutilisables (Chantilly, Ketchup, Bacon...)
                    </p>
                    <Button onClick={() => setShowChoiceModal(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Créer mon premier choix
                    </Button>
                  </div>
                );
              }

              if (filteredChoices.length === 0) {
                return (
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 text-center">
                    <Search className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-yellow-900 mb-2">Aucun résultat</h3>
                    <p className="text-sm text-yellow-700 mb-4">
                      Aucun choix ne correspond à votre recherche "{librarySearchTerm}"
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => setLibrarySearchTerm('')}
                    >
                      Effacer la recherche
                    </Button>
                  </div>
                );
              }

              if (libraryViewMode === 'list') {
                return (
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Choix
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Description
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Prix
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredChoices.map((choice) => (
                            <tr key={choice.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {choice.image_url ? (
                                    <img 
                                      src={choice.image_url} 
                                      alt={choice.name}
                                      className="w-12 h-12 object-cover rounded-lg mr-4"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                      }}
                                    />
                                  ) : (
                                    <div className="w-12 h-12 bg-gray-100 rounded-lg mr-4 flex items-center justify-center">
                                      <Package className="w-6 h-6 text-gray-400" />
                                    </div>
                                  )}
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">{choice.name}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-600 max-w-xs truncate">
                                  {choice.description || '-'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm font-bold text-primary">
                                  {choice.default_price.toFixed(2)}€
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      setEditingChoice(choice);
                                      setShowChoiceModal(true);
                                    }}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="danger"
                                    onClick={() => handleDeleteChoice(choice.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              }

              // Vue grille (par défaut)
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredChoices.map((choice) => (
                    <Card key={choice.id}>
                      <CardContent className="p-4">
                        {choice.image_url && (
                          <img 
                            src={choice.image_url} 
                            alt={choice.name}
                            className="w-full h-32 object-cover rounded-lg mb-3"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        )}
                        <h3 className="font-bold text-lg mb-1">{choice.name}</h3>
                        {choice.description && (
                          <p className="text-sm text-gray-600 mb-2">{choice.description}</p>
                        )}
                        <p className="text-lg font-bold text-primary mb-3">
                          {choice.default_price.toFixed(2)}€
                        </p>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setEditingChoice(choice);
                              setShowChoiceModal(true);
                            }}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Modifier
                          </Button>
                          <Button 
                            size="sm" 
                            variant="danger"
                            onClick={() => handleDeleteChoice(choice.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              );
            })()}
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

      <ChoiceLibraryModal
        isOpen={showChoiceModal}
        onClose={() => {
          setShowChoiceModal(false);
          setEditingChoice(null);
        }}
        choice={editingChoice}
        onSuccess={loadChoiceLibrary}
      />
    </div>
  );
};
