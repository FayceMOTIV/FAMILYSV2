import React from 'react';
import { Edit2, Trash2, ArrowUp, ArrowDown, Package, Copy } from 'lucide-react';
import { Button } from './Button';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://resto-hub-54.preview.emergentagent.com';

const getImageUrl = (category) => {
  const imageUrl = category.image_url || category.image;
  if (!imageUrl) return null;
  if (imageUrl.startsWith('http')) return imageUrl;
  if (imageUrl.startsWith('/')) return `${API_URL}${imageUrl}`;
  return `${API_URL}/${imageUrl}`;
};

export const CategoriesListView = ({ categories, products, onEdit, onDelete, onReorder }) => {
  const getProductCount = (categoryId) => {
    return products.filter(p => p.category === categoryId).length;
  };

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ordre</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produits</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {categories.map((category, index) => (
            <tr 
              key={category.id} 
              onClick={() => onEdit(category)}
              className="hover:bg-blue-50 cursor-pointer transition-colors"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                {getImageUrl(category) ? (
                  <img 
                    src={getImageUrl(category)} 
                    alt={category.name}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">#{category.order || index + 1}</span>
                  <div className="flex flex-col gap-1">
                    {index > 0 && (
                      <button
                        onClick={() => onReorder(category.id, 'up')}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <ArrowUp className="w-3 h-3 text-gray-600" />
                      </button>
                    )}
                    {index < categories.length - 1 && (
                      <button
                        onClick={() => onReorder(category.id, 'down')}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <ArrowDown className="w-3 h-3 text-gray-600" />
                      </button>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">{category.name}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-500 max-w-md truncate">
                  {category.description || '-'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <Package className="w-3 h-3 mr-1" />
                  {getProductCount(category.id)} produit(s)
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                <div className="flex gap-2 justify-end">
                  <Button size="sm" variant="outline" onClick={() => onEdit(category)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onDelete(category.id)} className="text-red-600 border-red-300 hover:bg-red-50">
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