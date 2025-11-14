import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { X, Plus, Trash2 } from 'lucide-react';

export const OptionModal = ({ isOpen, onClose, option, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    internal_comment: '',
    type: 'single',
    is_required: false,
    allow_repeat: false,
    max_choices: '',
    choices: [{ name: '', price: 0, image_url: '' }]
  });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (option) {
      setFormData({
        name: option.name || '',
        description: option.description || '',
        internal_comment: option.internal_comment || '',
        type: option.type || 'single',
        is_required: option.is_required || false,
        allow_repeat: option.allow_repeat || false,
        max_choices: option.max_choices || '',
        choices: option.choices?.length > 0 ? option.choices : [{ name: '', price: 0, image_url: '' }]
      });
    } else {
      setFormData({
        name: '',
        description: '',
        internal_comment: '',
        type: 'single',
        is_required: false,
        allow_repeat: false,
        max_choices: '',
        choices: [{ name: '', price: 0, image_url: '' }]
      });
    }
  }, [option, isOpen]);

  const handleAddChoice = () => {
    setFormData({
      ...formData,
      choices: [...formData.choices, { name: '', price: 0, image_url: '' }]
    });
  };

  const handleRemoveChoice = (index) => {
    if (formData.choices.length > 1) {
      setFormData({
        ...formData,
        choices: formData.choices.filter((_, i) => i !== index)
      });
    }
  };

  const handleChoiceChange = (index, field, value) => {
    const newChoices = [...formData.choices];
    newChoices[index] = {
      ...newChoices[index],
      [field]: field === 'price' ? parseFloat(value) || 0 : value
    };
    setFormData({ ...formData, choices: newChoices });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const API_URL = process.env.REACT_APP_BACKEND_URL || '';
      
      // Préparer les données
      const data = {
        ...formData,
        max_choices: formData.max_choices ? parseInt(formData.max_choices) : null,
        choices: formData.choices.filter(c => c.name.trim() !== '')
      };
      
      const url = option 
        ? `${API_URL}/api/v1/admin/options/${option.id}`
        : `${API_URL}/api/v1/admin/options`;
      
      const method = option ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to save option');
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error saving option:', error);
      alert(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="large">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          {option ? 'Modifier l\'option' : 'Créer une option'}
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nom */}
        <div>
          <label className="block text-sm font-medium mb-2">Nom de l'option *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Ex: Choix de sauce, Cuisson..."
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2">Description (optionnel)</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg"
            rows="2"
            placeholder="Description de l'option..."
          />
        </div>

        {/* Commentaire interne */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Commentaire interne (non visible par le client)
          </label>
          <textarea
            value={formData.internal_comment}
            onChange={(e) => setFormData({...formData, internal_comment: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg bg-yellow-50"
            rows="2"
            placeholder="Notes internes, instructions pour le personnel..."
          />
          <p className="text-xs text-gray-500 mt-1">
            ℹ️ Ce commentaire est uniquement visible dans le back office, pas dans l'application client
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium mb-2">Type de sélection *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="single">Choix unique</option>
              <option value="multiple">Choix multiples</option>
            </select>
          </div>

          {/* Max choices (si multiple) */}
          {formData.type === 'multiple' && (
            <div>
              <label className="block text-sm font-medium mb-2">Maximum de choix</label>
              <input
                type="number"
                min="1"
                value={formData.max_choices}
                onChange={(e) => setFormData({...formData, max_choices: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Illimité si vide"
              />
            </div>
          )}
        </div>

        {/* Obligatoire */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_required"
            checked={formData.is_required}
            onChange={(e) => setFormData({...formData, is_required: e.target.checked})}
            className="mr-2"
          />
          <label htmlFor="is_required" className="text-sm font-medium">
            Option obligatoire (le client doit faire un choix)
          </label>
        </div>

        {/* Choix */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium">Choix disponibles *</label>
            <Button type="button" size="sm" onClick={handleAddChoice}>
              <Plus className="w-4 h-4 mr-1" />
              Ajouter un choix
            </Button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {formData.choices.map((choice, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={choice.name}
                  onChange={(e) => handleChoiceChange(index, 'name', e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg"
                  placeholder="Nom du choix"
                  required
                />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={choice.price}
                  onChange={(e) => handleChoiceChange(index, 'price', e.target.value)}
                  className="w-24 px-3 py-2 border rounded-lg"
                  placeholder="Prix"
                />
                {formData.choices.length > 1 && (
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => handleRemoveChoice(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Annuler
          </Button>
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Enregistrement...' : option ? 'Modifier' : 'Créer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
