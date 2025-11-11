import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { categoriesAPI } from '../services/api';
import { FolderOpen, Plus, Edit2, Trash2 } from 'lucide-react';

export const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr ?')) return;
    try {
      await categoriesAPI.delete(id);
      loadCategories();
    } catch (error) {
      alert('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div>
        <Header title="Catégories" />
        <div className="p-8"><p>Chargement...</p></div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Catégories" />
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">{categories.length} catégories</h3>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card key={category.id}>
              {category.image ? (
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-32 object-cover rounded-lg mb-4"
                />
              ) : (
                <div className="w-full h-32 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                  <FolderOpen className="w-12 h-12 text-gray-400" />
                </div>
              )}
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-lg">{category.name}</h4>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(category.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <span className={`inline-block mt-2 text-xs px-2 py-1 rounded ${category.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                {category.is_active ? 'Active' : 'Inactive'}
              </span>
            </Card>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucune catégorie</p>
          </div>
        )}
      </div>
    </div>
  );
};
