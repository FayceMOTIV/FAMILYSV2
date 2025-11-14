import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input, Label, Textarea } from './Input';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://admin-kitchen.preview.emergentagent.com';

export const ChoiceLibraryModal = ({ isOpen, onClose, choice, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    default_price: 0,
    image_url: '',
    description: ''
  });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (choice) {
      setFormData({
        name: choice.name || '',
        default_price: choice.default_price || 0,
        image_url: choice.image_url || '',
        description: choice.description || ''
      });
    } else {
      setFormData({
        name: '',
        default_price: 0,
        image_url: '',
        description: ''
      });
    }
  }, [choice, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (choice) {
        // Update existing choice
        await axios.put(`${API_URL}/api/v1/admin/choice-library/${choice.id}`, formData);
        alert('✅ Choix modifié avec succès');
      } else {
        // Create new choice
        await axios.post(`${API_URL}/api/v1/admin/choice-library`, formData);
        alert('✅ Choix créé avec succès');
      }
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error saving choice:', error);
      alert('❌ Erreur lors de l\'enregistrement du choix');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title={choice ? '✏️ Modifier le choix' : '➕ Nouveau choix'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-gray-600 mb-4">
          Créez un choix réutilisable que vous pourrez utiliser dans plusieurs options
        </p>

        {/* Nom */}
        <div>
          <Label htmlFor="name">Nom du choix *</Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="Ex: Chantilly, Ketchup, Bacon..."
            required
          />
        </div>

        {/* Prix par défaut */}
        <div>
          <Label htmlFor="default_price">Prix par défaut</Label>
          <Input
            id="default_price"
            type="number"
            step="0.01"
            min="0"
            value={formData.default_price}
            onChange={(e) => setFormData({...formData, default_price: parseFloat(e.target.value) || 0})}
            placeholder="0.00"
          />
          <p className="text-xs text-gray-500 mt-1">
            Ce prix sera utilisé par défaut, mais vous pourrez le modifier pour chaque option
          </p>
        </div>

        {/* Image URL */}
        <div>
          <Label htmlFor="image_url">URL de l'image (optionnel)</Label>
          <Input
            id="image_url"
            type="text"
            value={formData.image_url}
            onChange={(e) => setFormData({...formData, image_url: e.target.value})}
            placeholder="https://exemple.com/image.jpg"
          />
          {formData.image_url && (
            <div className="mt-2">
              <img 
                src={formData.image_url} 
                alt="Aperçu" 
                className="h-20 w-20 object-cover rounded-lg border"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect fill="%23ddd" width="80" height="80"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999">?</text></svg>';
                }}
              />
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description">Description (optionnel)</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Description du choix..."
            rows={2}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={loading}
          >
            {loading ? 'Enregistrement...' : (choice ? 'Modifier' : 'Créer')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
