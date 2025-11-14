import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input, Label, Select } from './Input';
import { ImageUpload } from './ImageUpload';
import { productsAPI, categoriesAPI } from '../services/api';
import axios from 'axios';
import { ChevronUp, ChevronDown, X, Info } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'https://admin-kitchen.preview.emergentagent.com';

export const ProductModal = ({ isOpen, onClose, product, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [options, setOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [showOptionsDetails, setShowOptionsDetails] = useState({});
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    base_price: '',
    vat_rate: '10',
    image: '',
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

  // Recharger les catégories et options à chaque ouverture du modal
  useEffect(() => {
    if (isOpen) {
      loadCategories();
      loadOptions();
    }
  }, [isOpen]);

  useEffect(() => {
    if (product) {
      const productData = {
        name: product.name || '',
        category: product.category || '',
        description: product.description || '',
        base_price: product.base_price?.toString() || '',
        vat_rate: product.vat_rate?.toString() || '10',
        image: product.image || '',
        image_url: product.image_url || product.image || '',
        tags: product.tags || [],
        option_ids: product.option_ids || [],
        is_available: product.is_available ?? true,
        is_out_of_stock: product.is_out_of_stock ?? false,
      };
      setFormData(productData);
      
      // Load selected options with their full details
      if (productData.option_ids.length > 0) {
        const selected = options.filter(opt => productData.option_ids.includes(opt.id));
        setSelectedOptions(selected.map((opt, index) => ({ ...opt, order: index })));
      }
    } else {
      setFormData({
        name: '',
        category: '',
        description: '',
        base_price: '',
        vat_rate: '10',
        image: '',
        image_url: '',
        tags: [],
        option_ids: [],
        is_available: true,
        is_out_of_stock: false,
      });
      setSelectedOptions([]);
    }
  }, [product, options]);

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

  const handleOptionToggle = (option, isChecked) => {
    if (isChecked) {
      // Add option to selected
      setSelectedOptions([...selectedOptions, { ...option, order: selectedOptions.length }]);
      setFormData({
        ...formData,
        option_ids: [...formData.option_ids, option.id]
      });
    } else {
      // Remove option
      setSelectedOptions(selectedOptions.filter(opt => opt.id !== option.id));
      setFormData({
        ...formData,
        option_ids: formData.option_ids.filter(id => id !== option.id)
      });
    }
  };

  const moveOptionUp = (index) => {
    if (index === 0) return;
    const newSelected = [...selectedOptions];
    [newSelected[index - 1], newSelected[index]] = [newSelected[index], newSelected[index - 1]];
    setSelectedOptions(newSelected);
    setFormData({
      ...formData,
      option_ids: newSelected.map(opt => opt.id)
    });
  };

  const moveOptionDown = (index) => {
    if (index === selectedOptions.length - 1) return;
    const newSelected = [...selectedOptions];
    [newSelected[index], newSelected[index + 1]] = [newSelected[index + 1], newSelected[index]];
    setSelectedOptions(newSelected);
    setFormData({
      ...formData,
      option_ids: newSelected.map(opt => opt.id)
    });
  };

  const handleAvailabilityChange = (e) => {
    const isAvailable = e.target.checked;
    setFormData({
      ...formData,
      is_available: isAvailable,
      // Si on décoche disponible, on force rupture de stock à false
      is_out_of_stock: isAvailable ? formData.is_out_of_stock : false
    });
  };

  const handleOutOfStockChange = (e) => {
    const isOutOfStock = e.target.checked;
    setFormData({
      ...formData,
      is_out_of_stock: isOutOfStock,
      // Si on coche rupture de stock, on force disponible à true
      is_available: isOutOfStock ? true : formData.is_available
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
        <div>
          <div>
            <Label htmlFor="name">Nom du produit *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
          currentImage={formData.image_url || formData.image}
          onImageChange={(url) => setFormData({ 
            ...formData, 
            image: url,
            image_url: url 
          })}
          label="Image du produit"
        />

        {/* Sélection et organisation des options */}
        <div>
          <Label>Options du produit</Label>
          <p className="text-xs text-gray-500 mb-3">
            Sélectionnez les options que le client pourra choisir pour ce produit
          </p>
          
          {/* Options sélectionnées avec ordre modifiable */}
          {selectedOptions.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">
                Options sélectionnées ({selectedOptions.length})
              </h4>
              <div className="space-y-2">
                {selectedOptions.map((option, index) => (
                  <div key={option.id} className="bg-white p-3 rounded border border-blue-300">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{option.name}</span>
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            option.is_required 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {option.is_required ? 'Obligatoire' : 'Optionnel'}
                          </span>
                        </div>
                        
                        {/* Bouton pour afficher/masquer les détails */}
                        <button
                          type="button"
                          onClick={() => setShowOptionsDetails({
                            ...showOptionsDetails,
                            [option.id]: !showOptionsDetails[option.id]
                          })}
                          className="text-xs text-blue-600 hover:text-blue-800 mt-1 flex items-center gap-1"
                        >
                          <Info className="w-3 h-3" />
                          {showOptionsDetails[option.id] ? 'Masquer' : 'Voir'} les choix ({option.choices?.length || 0})
                        </button>
                        
                        {/* Détails des choix */}
                        {showOptionsDetails[option.id] && (
                          <div className="mt-2 pl-4 border-l-2 border-blue-200">
                            {option.choices && option.choices.map((choice, idx) => (
                              <div key={idx} className="text-xs text-gray-600 py-1">
                                • {choice.name} {choice.price_modifier > 0 && `(+${choice.price_modifier.toFixed(2)}€)`}
                              </div>
                            ))}
                            {option.internal_comment && (
                              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                                <span className="font-semibold text-yellow-800">📝 Note interne :</span>
                                <span className="text-yellow-700 ml-1">{option.internal_comment}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 ml-3">
                        <button
                          type="button"
                          onClick={() => moveOptionUp(index)}
                          disabled={index === 0}
                          className="p-1 text-gray-600 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveOptionDown(index)}
                          disabled={index === selectedOptions.length - 1}
                          className="p-1 text-gray-600 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOptionToggle(option, false)}
                          className="p-1 text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Liste des options disponibles */}
          <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
            {options.map((option) => {
              const isSelected = formData.option_ids.includes(option.id);
              return (
                <label 
                  key={option.id} 
                  className={`flex items-center space-x-3 p-2 rounded cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => handleOptionToggle(option, e.target.checked)}
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
              );
            })}
          </div>
        </div>

        {/* Disponibilité avec explications */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-semibold mb-3">Disponibilité du produit</h4>
          
          <div className="space-y-3">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_available}
                onChange={handleAvailabilityChange}
                className="w-4 h-4 mt-1 text-primary rounded"
              />
              <div>
                <span className="text-sm font-semibold text-gray-700">Visible dans l'app</span>
                <p className="text-xs text-gray-500 mt-1">
                  Si coché, le produit apparaît dans l'application mobile
                </p>
              </div>
            </label>

            <label className={`flex items-start space-x-3 cursor-pointer ${
              !formData.is_available ? 'opacity-50' : ''
            }`}>
              <input
                type="checkbox"
                checked={formData.is_out_of_stock}
                onChange={handleOutOfStockChange}
                disabled={!formData.is_available}
                className="w-4 h-4 mt-1 text-primary rounded"
              />
              <div>
                <span className="text-sm font-semibold text-gray-700">Rupture de stock</span>
                <p className="text-xs text-gray-500 mt-1">
                  Si coché, affiche une bannière "Indisponible pour le moment" dans l'app
                </p>
              </div>
            </label>

            {/* Boutons rapides rupture */}
            {formData.is_out_of_stock && (
              <div className="ml-7 mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, stock_status: '2h'})}
                  className={`px-3 py-1 text-xs rounded-full font-medium border-2 transition-colors ${
                    formData.stock_status === '2h' 
                      ? 'bg-orange-100 border-orange-500 text-orange-700' 
                      : 'bg-white border-gray-300 text-gray-600 hover:border-orange-400'
                  }`}
                >
                  ⏱ Rupture 2h
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, stock_status: 'today'})}
                  className={`px-3 py-1 text-xs rounded-full font-medium border-2 transition-colors ${
                    formData.stock_status === 'today' 
                      ? 'bg-red-100 border-red-500 text-red-700' 
                      : 'bg-white border-gray-300 text-gray-600 hover:border-red-400'
                  }`}
                >
                  📅 Rupture journée
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, stock_status: 'indefinite'})}
                  className={`px-3 py-1 text-xs rounded-full font-medium border-2 transition-colors ${
                    formData.stock_status === 'indefinite' 
                      ? 'bg-gray-100 border-gray-500 text-gray-700' 
                      : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  ⛔ Rupture indéfinie
                </button>
              </div>
            )}
          </div>
          
          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
            ℹ️ <strong>Note :</strong> {
              !formData.is_available 
                ? 'Le produit est masqué de l\'application' 
                : formData.is_out_of_stock
                  ? 'Le produit est visible mais marqué comme indisponible'
                  : 'Le produit est visible et disponible à la commande'
            }
          </div>
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
