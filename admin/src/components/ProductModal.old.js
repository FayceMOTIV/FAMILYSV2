import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input, Label, Select } from './Input';
import { ImageUpload } from './ImageUpload';
import { productsAPI, categoriesAPI } from '../services/api';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://menu-master-141.preview.emergentagent.com';

export const ProductModal = ({ isOpen, onClose, product, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [options, setOptions] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category: '',
    description: '',
    base_price: '',
    vat_rate: '10',
    image_url: '',
    tags: [],
    option_ids: [],
    is_available: true,
    is_out_of_stock: false,
  });

  useEffect(() => {
    loadCategories();
    loadOptions();
  }, []);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        category: product.category || '',
        description: product.description || '',
        base_price: product.base_price?.toString() || '',
        vat_rate: product.vat_rate?.toString() || '10',
        image_url: product.image_url || '',
        tags: product.tags || [],
        option_ids: product.option_ids || [],
        is_available: product.is_available ?? true,
        is_out_of_stock: product.is_out_of_stock ?? false,
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        category: '',
        description: '',
        base_price: '',
        vat_rate: '10',
        image_url: '',
        tags: [],
        option_ids: [],
        is_available: true,
        is_out_of_stock: false,
      });
    }
  }, [product]);

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadOptions = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/admin/options`);
      setOptions(response.data.options || []);
    } catch (error) {
      console.error('Failed to load options:', error);
    }
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[éèê]/g, 'e')
      .replace(/[àâ]/g, 'a')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        base_price: parseFloat(formData.base_price),
        vat_rate: parseFloat(formData.vat_rate),
        option_groups: [],
      };

      if (product) {
        await productsAPI.update(product.id, payload);
      } else {
        await productsAPI.create(payload);
      }

      onSuccess();
      onClose();
    } catch (error) {
      alert('Erreur : ' + (error.response?.data?.detail || 'Erreur inconnue'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product ? 'Modifier le produit' : 'Nouveau produit'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nom *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleNameChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="category">Catégorie *</Label>
          <Select
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
          >
            <option value="">Sélectionner...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="description">Description *</Label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            rows="3"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="base_price">Prix TTC (€) *</Label>
            <Input
              id="base_price"
              type="number"
              step="0.01"
              min="0"
              value={formData.base_price}
              onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="vat_rate">TVA (%) *</Label>
            <Select
              id="vat_rate"
              value={formData.vat_rate}
              onChange={(e) => setFormData({ ...formData, vat_rate: e.target.value })}
              required
            >
              <option value="5.5">5.5%</option>
              <option value="10">10%</option>
              <option value="20">20%</option>
            </Select>
          </div>
        </div>

        <ImageUpload
          currentImage={formData.image_url}
          onImageChange={(url) => setFormData({ ...formData, image_url: url })}
          label="Image du produit"
        />

        {/* Sélection des options */}
        <div>
          <Label>Options du produit</Label>
          <p className="text-xs text-gray-500 mb-3">
            Sélectionnez les options que le client pourra choisir pour ce produit
          </p>
          <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
            {options.map((option) => (
              <label key={option.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.option_ids.includes(option.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({
                        ...formData,
                        option_ids: [...formData.option_ids, option.id]
                      });
                    } else {
                      setFormData({
                        ...formData,
                        option_ids: formData.option_ids.filter(id => id !== option.id)
                      });
                    }
                  }}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <span className="font-semibold text-sm">{option.name}</span>
                  <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                    option.is_required 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {option.is_required ? 'Obligatoire' : 'Optionnel'}
                  </span>
                  <span className="ml-2 text-xs text-gray-500">
                    ({option.choices?.length || 0} choix)
                  </span>
                </div>
              </label>
            ))}
          </div>
          {formData.option_ids.length > 0 && (
            <p className="text-sm text-green-600 mt-2">
              ✅ {formData.option_ids.length} option(s) sélectionnée(s)
            </p>
          )}
        </div>

        <div className="flex items-center space-x-6">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.is_available}
              onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
              className="w-4 h-4 text-primary rounded"
            />
            <span className="text-sm font-semibold text-gray-700">Disponible</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.is_out_of_stock}
              onChange={(e) => setFormData({ ...formData, is_out_of_stock: e.target.checked })}
              className="w-4 h-4 text-primary rounded"
            />
            <span className="text-sm font-semibold text-gray-700">Rupture de stock</span>
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Enregistrement...' : product ? 'Mettre à jour' : 'Créer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
