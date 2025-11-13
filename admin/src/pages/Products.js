import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ProductModal } from '../components/ProductModal';
import { productsAPI } from '../services/api';
import { Plus, Edit2, Trash2, Package, Copy } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'https://resto-backoffice-1.preview.emergentagent.com';

export const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Failed to load products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;
    
    try {
      await productsAPI.delete(id);
      loadProducts();
    } catch (error) {
      alert('Erreur lors de la suppression');
    }
  };

  const handleDuplicate = async (product) => {
    if (!window.confirm(`Dupliquer "${product.name}" ?`)) return;
    
    try {
      const duplicatedProduct = {
        ...product,
        name: `${product.name} (copie)`,
        slug: `${product.slug}-copie-${Date.now()}`,
      };
      
      // Remove the id so backend creates a new one
      delete duplicatedProduct.id;
      
      await productsAPI.create(duplicatedProduct);
      loadProducts();
      alert('✅ Produit dupliqué avec succès !');
    } catch (error) {
      alert('Erreur lors de la duplication');
    }
  };

  if (loading) {
    return (
      <div>
        <Header title="Produits" />
        <div className="p-8"><p>Chargement...</p></div>
      </div>
    );
  }

  return (
    <div>
      <Header title="📦 Produits" subtitle={`${products.length} produits disponibles`} />
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">{products.length} produits</h3>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un produit
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            // Support both "price" and "base_price" fields
            const price = product.price || product.base_price || 0;
            
            // Construire l'URL complète si nécessaire
            let imageUrl = product.image_url || product.image;
            if (imageUrl && imageUrl.startsWith('/')) {
              imageUrl = `${API_URL}${imageUrl}`;
            }
            
            return (
              <Card key={product.id}>
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
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-black text-primary">{price.toFixed(2)}€</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Button size="sm" variant="outline" onClick={() => {
                    setEditingProduct(product);
                    setShowModal(true);
                  }} title="Modifier">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDuplicate(product)} title="Dupliquer">
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(product.id)} title="Supprimer">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="mt-3 flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded ${product.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {product.is_available ? 'Disponible' : 'Indisponible'}
                  </span>
                  {product.is_out_of_stock && (
                    <span className="text-xs px-2 py-1 rounded bg-orange-100 text-orange-700">Rupture</span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun produit pour le moment</p>
          </div>
        )}
      </div>

      {/* Product Modal */}
      <ProductModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingProduct(null);
        }}
        product={editingProduct}
        onSuccess={loadProducts}
      />
    </div>
  );
};
