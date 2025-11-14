import React from 'react';
import { Edit2, Trash2, Tag, AlertCircle, CheckCircle, Package } from 'lucide-react';
import { Button } from './Button';

export const ProductsListView = ({ products, categories, onEdit, onDelete, onDuplicate, onStockClick }) => {
  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Sans catégorie';
  };

  const getStockBadge = (product) => {
    if (!product.is_out_of_stock) {
      return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">✓ Disponible</span>;
    }
    
    if (product.stock_status === '2h') {
      return <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">⏱ Rupture 2h</span>;
    } else if (product.stock_status === 'today') {
      return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">📅 Rupture journée</span>;
    } else {
      return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">⛔ Indisponible</span>;
    }
  };

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Promo</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                {product.imageUrl ? (
                  <img 
                    src={product.imageUrl} 
                    alt={product.name}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </td>
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                {product.description && (
                  <div className="text-xs text-gray-500 truncate max-w-xs">{product.description}</div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-700">{getCategoryName(product.category)}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm font-semibold text-gray-900">{product.price.toFixed(2)}€</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button onClick={() => onStockClick(product.id)} className="focus:outline-none">
                  {getStockBadge(product)}
                </button>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {product.isPromo ? (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">🏷 Promo</span>
                ) : (
                  <span className="text-xs text-gray-400">-</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex gap-2 justify-end">
                  <Button size="sm" variant="outline" onClick={() => onEdit(product)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onDuplicate(product)}>
                    <Package className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onDelete(product.id)} className="text-red-600 border-red-300 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};