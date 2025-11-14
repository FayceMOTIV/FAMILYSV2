import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { ProductModal } from '../components/ProductModal';
import { CategoryModal } from '../components/CategoryModal';
import { OptionModal } from '../components/OptionModal';
import { ProductsListView } from '../components/ProductsListView';
import { CategoriesListView } from '../components/CategoriesListView';
import { OptionsListView } from '../components/OptionsListView';
import { productsAPI, categoriesAPI } from '../services/api';
import { Plus, Edit2, Trash2, Package, Copy, FolderOpen, Sliders, Edit, MoreVertical, Clock, Calendar, XCircle, CheckCircle, ArrowUp, ArrowDown, LayoutGrid, List as ListIcon, Search, X, Filter } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://resto-admin-11.preview.emergentagent.com';

export const MenuManagement = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'list'
  
  // Products state
  const [products, setProducts] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [openStockMenu, setOpenStockMenu] = useState(null);
  
  // Filtres
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPromo, setFilterPromo] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStock, setFilterStock] = useState('all'); // 'all', 'available', 'out_of_stock'
  const [showOutOfStockOnly, setShowOutOfStockOnly] = useState(false);
  
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
      const sorted = (response.data.categories || []).sort((a, b) => (a.order || 0) - (b.order || 0));
      setCategories(sorted);
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

  // === FILTRAGE DES PRODUITS ===
  const filteredProducts = products.filter(product => {
    // Recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchName = product.name.toLowerCase().includes(query);
      const matchDesc = product.description?.toLowerCase().includes(query);
      if (!matchName && !matchDesc) return false;
    }
    
    // Filtre promo
    if (filterPromo && !product.isPromo) return false;
    
    // Filtre catégorie
    if (filterCategory !== 'all' && product.category !== filterCategory) return false;
    
    // Filtre stock
    if (filterStock === 'available' && product.is_out_of_stock) return false;
    if (filterStock === 'out_of_stock' && !product.is_out_of_stock) return false;
    
    // Filtre ancien (showOutOfStockOnly)
    if (showOutOfStockOnly && !product.is_out_of_stock) return false;
    
    return true;
  });

  // === REGROUPEMENT PAR CATÉGORIES ===
  const groupedProducts = () => {
    const groups = {};
    
    categories.forEach(cat => {
      groups[cat.id] = {
        category: cat,
        products: filteredProducts.filter(p => p.category === cat.id)
      };
    });
    
    // Produits sans catégorie
    groups['no_category'] = {
      category: { id: 'no_category', name: 'Sans catégorie', order: 9999 },
      products: filteredProducts.filter(p => !p.category || !categories.find(c => c.id === p.category))
    };
    
    // Supprimer les groupes vides
    Object.keys(groups).forEach(key => {
      if (groups[key].products.length === 0) {
        delete groups[key];
      }
    });
    
    return groups;
  };

  const resetFilters = () => {
    setSearchQuery('');
    setFilterPromo(false);
    setFilterCategory('all');
    setFilterStock('all');
    setShowOutOfStockOnly(false);
  };

  const hasActiveFilters = searchQuery || filterPromo || filterCategory !== 'all' || filterStock !== 'all' || showOutOfStockOnly;

  // === HANDLERS ===
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Supprimer ce produit ?')) return;
    
    try {
      await productsAPI.delete(productId);
      await loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleDuplicateProduct = (product) => {
    setEditingProduct({
      ...product,
      id: null,
      name: `${product.name} (copie)`
    });
    setShowProductModal(true);
  };

  const handleStockChange = async (productId, status) => {
    try {
      await axios.post(`${API_URL}/api/v1/admin/stock/${productId}/stock-status`, { status });
      await loadProducts();
      setOpenStockMenu(null);
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Erreur lors de la mise à jour du stock');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Supprimer cette catégorie ?')) return;
    
    try {
      await categoriesAPI.delete(categoryId);
      await loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleReorderCategory = async (categoryId, direction) => {
    const index = categories.findIndex(c => c.id === categoryId);
    if (index === -1) return;
    
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;
    
    try {
      const category1 = categories[index];
      const category2 = categories[targetIndex];
      
      // Swap orders
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
      console.error('Error reordering categories:', error);
      alert('Erreur lors du réordonnancement');
    }
  };

  const handleDeleteOption = async (optionId) => {
    if (!window.confirm('Supprimer cette option ?')) return;
    
    try {
      await axios.delete(`${API_URL}/api/v1/admin/options/${optionId}`);
      await loadOptions();
    } catch (error) {
      console.error('Error deleting option:', error);
      alert('Erreur lors de la suppression');
    }
  };

  // === RENDER PRODUITS (GRID OU LIST) ===
  const renderProducts = () => {
    if (viewMode === 'list') {
      return <ProductsListView 
        products={filteredProducts}
        categories={categories}
        onEdit={(p) => { setEditingProduct(p); setShowProductModal(true); }}
        onDelete={handleDeleteProduct}
        onDuplicate={handleDuplicateProduct}
        onStockClick={(id) => setOpenStockMenu(openStockMenu === id ? null : id)}
      />;
    }
    
    // Mode GRID avec regroupement par catégories
    const grouped = groupedProducts();
    const sortedGroups = Object.values(grouped).sort((a, b) => (a.category.order || 0) - (b.category.order || 0));
    
    return (
      <div className=\"space-y-8\">
        {sortedGroups.map(group => (
          <div key={group.category.id}>
            <div className=\"flex items-center justify-between mb-4\">
              <h3 className=\"text-xl font-bold text-gray-800\">
                {group.category.name}
                <span className=\"ml-2 text-sm font-normal text-gray-500\">
                  ({group.products.length} produit{group.products.length > 1 ? 's' : ''})
                </span>
              </h3>
            </div>
            
            <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4\">
              {group.products.map(product => (
                <ProductCard 
                  key={product.id}
                  product={product}
                  onEdit={() => { setEditingProduct(product); setShowProductModal(true); }}
                  onDelete={() => handleDeleteProduct(product.id)}
                  onDuplicate={() => handleDuplicateProduct(product)}
                  openStockMenu={openStockMenu === product.id}
                  onStockClick={() => setOpenStockMenu(openStockMenu === product.id ? null : product.id)}
                  onStockChange={(status) => handleStockChange(product.id, status)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className=\"min-h-screen bg-gray-50\">
      <Header 
        title=\"🍽️ Gestion du Menu\"
        subtitle=\"Gérez vos produits, catégories et options\"
      />

      <div className=\"p-6\">
        {/* Tabs */}
        <div className=\"flex items-center justify-between mb-6\">
          <div className=\"flex gap-2\">
            <Button
              variant={activeTab === 'products' ? 'default' : 'outline'}
              onClick={() => setActiveTab('products')}
            >
              <Package className=\"w-4 h-4 mr-2\" />
              Produits ({products.length})
            </Button>
            <Button
              variant={activeTab === 'categories' ? 'default' : 'outline'}
              onClick={() => setActiveTab('categories')}
            >
              <FolderOpen className=\"w-4 h-4 mr-2\" />
              Catégories ({categories.length})
            </Button>
            <Button
              variant={activeTab === 'options' ? 'default' : 'outline'}
              onClick={() => setActiveTab('options')}
            >
              <Sliders className=\"w-4 h-4 mr-2\" />
              Options ({options.length})
            </Button>
          </div>
          
          <div className=\"flex gap-2\">
            {activeTab === 'products' && (
              <>
                <Button
                  variant=\"outline\"
                  size=\"sm\"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                >
                  {viewMode === 'grid' ? <ListIcon className=\"w-4 h-4\" /> : <LayoutGrid className=\"w-4 h-4\" />}
                </Button>
              </>
            )}
            {activeTab === 'categories' && (
              <Button
                variant=\"outline\"
                size=\"sm\"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <ListIcon className=\"w-4 h-4\" /> : <LayoutGrid className=\"w-4 h-4\" />}
              </Button>
            )}
            {activeTab === 'options' && (
              <Button
                variant=\"outline\"
                size=\"sm\"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <ListIcon className=\"w-4 h-4\" /> : <LayoutGrid className=\"w-4 h-4\" />}
              </Button>
            )}
          </div>
        </div>

        {/* Filtres (seulement pour produits) */}
        {activeTab === 'products' && (
          <Card className=\"mb-6\">
            <CardContent className=\"p-4\">
              <div className=\"grid grid-cols-1 md:grid-cols-4 gap-4\">
                {/* Recherche */}
                <div className=\"relative\">
                  <Search className=\"absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400\" />
                  <input
                    type=\"text\"
                    placeholder=\"Rechercher...\"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className=\"w-full pl-10 pr-8 py-2 border rounded-lg text-sm\"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className=\"absolute right-3 top-1/2 transform -translate-y-1/2\"
                    >
                      <X className=\"w-4 h-4 text-gray-400\" />
                    </button>
                  )}
                </div>

                {/* Filtre Catégorie */}
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className=\"px-3 py-2 border rounded-lg text-sm\"
                >
                  <option value=\"all\">Toutes les catégories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>

                {/* Filtre Stock */}
                <select
                  value={filterStock}
                  onChange={(e) => setFilterStock(e.target.value)}
                  className=\"px-3 py-2 border rounded-lg text-sm\"
                >
                  <option value=\"all\">Tous les stocks</option>
                  <option value=\"available\">Disponibles</option>
                  <option value=\"out_of_stock\">En rupture</option>
                </select>

                {/* Filtre Promo + Reset */}
                <div className=\"flex gap-2\">
                  <Button
                    variant={filterPromo ? 'default' : 'outline'}
                    size=\"sm\"
                    onClick={() => setFilterPromo(!filterPromo)}
                    className=\"flex-1\"
                  >
                    🏷 Promo
                  </Button>
                  {hasActiveFilters && (
                    <Button
                      variant=\"outline\"
                      size=\"sm\"
                      onClick={resetFilters}
                    >
                      <X className=\"w-4 h-4\" />
                    </Button>
                  )}
                </div>
              </div>
              
              {hasActiveFilters && (
                <div className=\"mt-3 text-sm text-gray-600\">
                  {filteredProducts.length} produit(s) trouvé(s)
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className=\"flex justify-between items-center mb-6\">
          <div>
            {activeTab === 'products' && (
              <h2 className=\"text-2xl font-bold text-gray-800\">
                {filteredProducts.length} produit(s)
              </h2>
            )}
            {activeTab === 'categories' && (
              <h2 className=\"text-2xl font-bold text-gray-800\">
                {categories.length} catégorie(s)
              </h2>
            )}
            {activeTab === 'options' && (
              <h2 className=\"text-2xl font-bold text-gray-800\">
                {options.length} option(s)
              </h2>
            )}
          </div>
          
          <Button onClick={() => {
            if (activeTab === 'products') setShowProductModal(true);
            else if (activeTab === 'categories') setShowCategoryModal(true);
            else if (activeTab === 'options') setShowOptionModal(true);
          }}>
            <Plus className=\"w-4 h-4 mr-2\" />
            {activeTab === 'products' && 'Nouveau Produit'}
            {activeTab === 'categories' && 'Nouvelle Catégorie'}
            {activeTab === 'options' && 'Nouvelle Option'}
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <div className=\"text-center py-12\">Chargement...</div>
        ) : (
          <>
            {activeTab === 'products' && renderProducts()}
            
            {activeTab === 'categories' && (
              viewMode === 'list' ? (
                <CategoriesListView 
                  categories={categories}
                  products={products}
                  onEdit={(c) => { setEditingCategory(c); setShowCategoryModal(true); }}
                  onDelete={handleDeleteCategory}
                  onReorder={handleReorderCategory}
                />
              ) : (
                <CategoriesGrid 
                  categories={categories}
                  products={products}
                  onEdit={(c) => { setEditingCategory(c); setShowCategoryModal(true); }}
                  onDelete={handleDeleteCategory}
                  onReorder={handleReorderCategory}
                />
              )
            )}
            
            {activeTab === 'options' && (
              viewMode === 'list' ? (
                <OptionsListView 
                  options={options}
                  onEdit={(o) => { setEditingOption(o); setShowOptionModal(true); }}
                  onDelete={handleDeleteOption}
                />
              ) : (
                <OptionsGrid 
                  options={options}
                  onEdit={(o) => { setEditingOption(o); setShowOptionModal(true); }}
                  onDelete={handleDeleteOption}
                />
              )
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {showProductModal && (
        <ProductModal
          isOpen={showProductModal}
          onClose={() => {
            setShowProductModal(false);
            setEditingProduct(null);
          }}
          product={editingProduct}
          categories={categories}
          onSuccess={loadData}
        />
      )}

      {showCategoryModal && (
        <CategoryModal
          isOpen={showCategoryModal}
          onClose={() => {
            setShowCategoryModal(false);
            setEditingCategory(null);
          }}
          category={editingCategory}
          onSuccess={loadData}
        />
      )}

      {showOptionModal && (
        <OptionModal
          isOpen={showOptionModal}
          onClose={() => {
            setShowOptionModal(false);
            setEditingOption(null);
          }}
          option={editingOption}
          onSuccess={loadData}
        />
      )}
    </div>
  );
};

// === COMPOSANTS AUXILIAIRES ===

const ProductCard = ({ product, onEdit, onDelete, onDuplicate, openStockMenu, onStockClick, onStockChange }) => {
  const getStockBadge = () => {
    if (!product.is_out_of_stock) {
      return { text: '✓ Disponible', color: 'bg-green-100 text-green-700' };
    }
    if (product.stock_status === '2h') {
      return { text: '⏱ Rupture 2h', color: 'bg-orange-100 text-orange-700' };
    }
    if (product.stock_status === 'today') {
      return { text: '📅 Rupture journée', color: 'bg-red-100 text-red-700' };
    }
    return { text: '⛔ Indisponible', color: 'bg-gray-100 text-gray-700' };
  };

  const badge = getStockBadge();

  return (
    <Card className=\"hover:shadow-lg transition-shadow relative\">
      {product.isPromo && (
        <div className=\"absolute top-2 right-2 z-10\">
          <span className=\"px-2 py-1 bg-yellow-400 text-yellow-900 text-xs rounded-full font-bold\">
            🏷 PROMO
          </span>
        </div>
      )}
      
      <div className=\"h-48 bg-gray-100 rounded-t-lg overflow-hidden\">
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className=\"w-full h-full object-cover\"
          />
        ) : (
          <div className=\"w-full h-full flex items-center justify-center\">
            <Package className=\"w-16 h-16 text-gray-400\" />
          </div>
        )}
      </div>
      
      <CardContent className=\"p-4\">
        <h3 className=\"font-bold text-lg mb-1 truncate\">{product.name}</h3>
        {product.description && (
          <p className=\"text-sm text-gray-600 mb-2 line-clamp-2\">{product.description}</p>
        )}
        
        <div className=\"flex items-center justify-between mb-3\">
          <span className=\"text-2xl font-bold text-primary\">{product.price.toFixed(2)}€</span>
          <div className=\"relative\">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStockClick();
              }}
              className=\"focus:outline-none\"
            >
              <span className={`px-2 py-1 ${badge.color} text-xs rounded-full font-medium cursor-pointer`}>
                {badge.text}
              </span>
            </button>
            
            {openStockMenu && (
              <div className=\"absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-20\">
                <button onClick={() => onStockChange('available')} className=\"w-full px-4 py-2 text-left hover:bg-gray-50 text-sm\">✓ Disponible</button>
                <button onClick={() => onStockChange('2h')} className=\"w-full px-4 py-2 text-left hover:bg-gray-50 text-sm\">⏱ Rupture 2h</button>
                <button onClick={() => onStockChange('today')} className=\"w-full px-4 py-2 text-left hover:bg-gray-50 text-sm\">📅 Rupture journée</button>
                <button onClick={() => onStockChange('indefinite')} className=\"w-full px-4 py-2 text-left hover:bg-gray-50 text-sm\">⛔ Indisponible</button>
              </div>
            )}
          </div>
        </div>
        
        <div className=\"flex gap-2\">
          <Button size=\"sm\" variant=\"outline\" onClick={onEdit} className=\"flex-1\">
            <Edit2 className=\"w-4 h-4 mr-1\" />
            Modifier
          </Button>
          <Button size=\"sm\" variant=\"outline\" onClick={onDuplicate}>
            <Copy className=\"w-4 h-4\" />
          </Button>
          <Button size=\"sm\" variant=\"outline\" onClick={onDelete} className=\"text-red-600 border-red-300 hover:bg-red-50\">
            <Trash2 className=\"w-4 h-4\" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const CategoriesGrid = ({ categories, products, onEdit, onDelete, onReorder }) => {
  const getProductCount = (categoryId) => products.filter(p => p.category === categoryId).length;

  return (
    <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4\">
      {categories.map((category, index) => (
        <Card key={category.id} className=\"hover:shadow-lg transition-shadow\">
          <CardContent className=\"p-4\">
            <div className=\"flex items-start justify-between mb-3\">
              <div className=\"flex-1\">
                <h3 className=\"font-bold text-lg mb-1\">{category.name}</h3>
                {category.description && (
                  <p className=\"text-sm text-gray-600\">{category.description}</p>
                )}
              </div>
              <div className=\"flex flex-col gap-1 ml-2\">
                {index > 0 && (
                  <button onClick={() => onReorder(category.id, 'up')} className=\"p-1 hover:bg-gray-100 rounded\">
                    <ArrowUp className=\"w-4 h-4 text-gray-600\" />
                  </button>
                )}
                {index < categories.length - 1 && (
                  <button onClick={() => onReorder(category.id, 'down')} className=\"p-1 hover:bg-gray-100 rounded\">
                    <ArrowDown className=\"w-4 h-4 text-gray-600\" />
                  </button>
                )}
              </div>
            </div>
            
            <div className=\"mb-3\">
              <span className=\"inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800\">
                <Package className=\"w-3 h-3 mr-1\" />
                {getProductCount(category.id)} produit(s)
              </span>
            </div>
            
            <div className=\"flex gap-2\">
              <Button size=\"sm\" variant=\"outline\" onClick={() => onEdit(category)} className=\"flex-1\">
                <Edit2 className=\"w-4 h-4 mr-1\" />
                Modifier
              </Button>
              <Button size=\"sm\" variant=\"outline\" onClick={() => onDelete(category.id)} className=\"text-red-600 border-red-300 hover:bg-red-50\">
                <Trash2 className=\"w-4 h-4\" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const OptionsGrid = ({ options, onEdit, onDelete }) => {
  return (
    <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4\">
      {options.map((option) => (
        <Card key={option.id} className=\"hover:shadow-lg transition-shadow\">
          <CardContent className=\"p-4\">
            <div className=\"mb-3\">
              <h3 className=\"font-bold text-lg mb-2\">{option.name}</h3>
              <div className=\"flex items-center gap-2 mb-2\">
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                  option.type === 'single' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                }`}>
                  {option.type === 'single' ? '◉ Choix unique' : '☑ Choix multiple'}
                </span>
                {option.required && (
                  <span className=\"px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium\">* Requis</span>
                )}
              </div>
            </div>
            
            <div className=\"mb-3\">
              <p className=\"text-xs text-gray-500 mb-2\">{option.choices?.length || 0} choix :</p>
              <div className=\"flex flex-wrap gap-1\">
                {option.choices?.slice(0, 4).map((choice, idx) => (
                  <span key={idx} className=\"inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700\">
                    {choice.name}
                    {choice.price > 0 && <span className=\"ml-1 text-green-600 font-medium\">+{choice.price}€</span>}
                  </span>
                ))}
                {option.choices?.length > 4 && (
                  <span className=\"text-xs text-gray-500\">+{option.choices.length - 4}</span>
                )}
              </div>
            </div>
            
            <div className=\"flex gap-2\">
              <Button size=\"sm\" variant=\"outline\" onClick={() => onEdit(option)} className=\"flex-1\">
                <Edit2 className=\"w-4 h-4 mr-1\" />
                Modifier
              </Button>
              <Button size=\"sm\" variant=\"outline\" onClick={() => onDelete(option.id)} className=\"text-red-600 border-red-300 hover:bg-red-50\">
                <Trash2 className=\"w-4 h-4\" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
