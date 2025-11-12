import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { OptionModal } from '../components/OptionModal';
import { Plus, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://resto-dashboard-21.preview.emergentagent.com';

export const Options = () => {
  const [options, setOptions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingOption, setEditingOption] = useState(null);

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/admin/options`);
      setOptions(response.data.options || []);
    } catch (error) {
      console.error('Erreur chargement options:', error);
    }
  };

  const handleOpenModal = (option = null) => {
    if (option) {
      setEditingOption(option);
      setFormData({
        name: option.name,
        description: option.description || '',
        type: option.type,
        is_required: option.is_required,
        max_choices: option.max_choices || 1,
        price: option.price,
        choices: option.choices || []
      });
    } else {
      setEditingOption(null);
      setFormData({
        name: '',
        description: '',
        type: 'single',
        is_required: false,
        max_choices: 1,
        price: 0,
        choices: []
      });
    }
    setShowModal(true);
  };

  const handleSaveOption = async () => {
    try {
      if (editingOption) {
        await axios.put(`${API_URL}/api/v1/admin/options/${editingOption.id}`, formData);
      } else {
        await axios.post(`${API_URL}/api/v1/admin/options`, formData);
      }
      await loadOptions();
      setShowModal(false);
      alert('✅ Option enregistrée!');
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleDeleteOption = async (optionId) => {
    if (!window.confirm('Supprimer cette option ?')) return;
    
    try {
      await axios.delete(`${API_URL}/api/v1/admin/options/${optionId}`);
      await loadOptions();
      alert('✅ Option supprimée!');
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleAddChoice = () => {
    if (!newChoice.name) {
      alert('Nom du choix requis');
      return;
    }
    
    setFormData({
      ...formData,
      choices: [...formData.choices, { ...newChoice, id: Date.now().toString() }]
    });
    setNewChoice({ name: '', price: 0 });
  };

  const handleRemoveChoice = (choiceId) => {
    setFormData({
      ...formData,
      choices: formData.choices.filter(c => c.id !== choiceId)
    });
  };

  return (
    <div>
      <Header 
        title="🎛️ Gestion des Options" 
        subtitle="Créez des options réutilisables pour vos produits"
      />
      
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Options disponibles ({options.length})</h2>
          <Button onClick={() => handleOpenModal()} className="flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Nouvelle option</span>
          </Button>
        </div>

        {options.length === 0 ? (
          <Card>
            <CardContent className="text-center py-20">
              <ListPlus className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-bold text-gray-600 mb-2">Aucune option</h3>
              <p className="text-gray-500 mb-4">
                Créez des options (taille, sauce, accompagnement...) pour enrichir vos produits
              </p>
              <Button onClick={() => handleOpenModal()}>
                <Plus className="w-4 h-4 mr-2" />
                Créer ma première option
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {options.map((option) => (
              <Card key={option.id} className="hover:shadow-xl transition-shadow">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg font-bold">{option.name}</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleOpenModal(option)}
                        className="p-2 hover:bg-white rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteOption(option.id)}
                        className="p-2 hover:bg-white rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {option.description && (
                    <p className="text-sm text-gray-600">{option.description}</p>
                  )}
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <span className={`px-3 py-1 rounded-full font-bold ${
                      option.type === 'single' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {option.type === 'single' ? '📌 Choix unique' : '☑️ Choix multiple'}
                    </span>
                    {option.is_required && (
                      <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 font-bold text-xs">
                        ⚠️ Obligatoire
                      </span>
                    )}
                  </div>

                  {option.type === 'multiple' && option.max_choices && (
                    <p className="text-sm text-gray-600">
                      Max: {option.max_choices} choix
                    </p>
                  )}

                  {option.price > 0 && (
                    <p className="text-sm font-bold text-green-600">
                      Prix base: +{option.price}€
                    </p>
                  )}

                  <div className="border-t pt-3 mt-3">
                    <p className="text-xs font-bold text-gray-500 mb-2">CHOIX ({option.choices?.length || 0}):</p>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {option.choices?.map((choice) => (
                        <div key={choice.id} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                          <span>{choice.name}</span>
                          {choice.price > 0 && (
                            <span className="font-bold text-green-600">+{choice.price}€</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal Création/Édition */}
      {showModal && (
        <Modal
          onClose={() => setShowModal(false)}
          title={editingOption ? '✏️ Modifier l\'option' : '➕ Nouvelle option'}
        >
          <div className="space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Nom */}
            <div>
              <Label htmlFor="name">Nom de l'option *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Taille, Sauce, Accompagnement..."
                className="mt-1"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description (optionnel)</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description de l'option..."
                className="mt-1"
              />
            </div>

            {/* Type */}
            <div>
              <Label>Type de sélection</Label>
              <div className="flex space-x-4 mt-2">
                <button
                  onClick={() => setFormData({ ...formData, type: 'single' })}
                  className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                    formData.type === 'single'
                      ? 'border-blue-600 bg-blue-50 text-blue-800'
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                >
                  <div className="text-2xl mb-2">📌</div>
                  <div className="font-bold">Choix unique</div>
                  <div className="text-xs">Le client choisit 1 seul choix</div>
                </button>
                <button
                  onClick={() => setFormData({ ...formData, type: 'multiple' })}
                  className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                    formData.type === 'multiple'
                      ? 'border-purple-600 bg-purple-50 text-purple-800'
                      : 'border-gray-300 hover:border-purple-300'
                  }`}
                >
                  <div className="text-2xl mb-2">☑️</div>
                  <div className="font-bold">Choix multiple</div>
                  <div className="text-xs">Le client peut choisir plusieurs</div>
                </button>
              </div>
            </div>

            {/* Max choix si multiple */}
            {formData.type === 'multiple' && (
              <div>
                <Label htmlFor="max_choices">Nombre maximum de choix</Label>
                <Input
                  id="max_choices"
                  type="number"
                  min="1"
                  value={formData.max_choices}
                  onChange={(e) => setFormData({ ...formData, max_choices: parseInt(e.target.value) })}
                  className="mt-1"
                />
              </div>
            )}

            {/* Obligatoire */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="is_required"
                checked={formData.is_required}
                onChange={(e) => setFormData({ ...formData, is_required: e.target.checked })}
                className="w-5 h-5"
              />
              <Label htmlFor="is_required" className="mb-0">
                ⚠️ Option obligatoire (le client doit faire un choix)
              </Label>
            </div>

            {/* Prix de base */}
            <div>
              <Label htmlFor="price">Prix de base de l'option (optionnel)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                placeholder="0.00"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Prix ajouté quel que soit le choix</p>
            </div>

            {/* Choix */}
            <div className="border-t pt-4">
              <Label className="text-lg font-bold mb-3 block">Choix disponibles</Label>
              
              {/* Liste des choix */}
              <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                {formData.choices.map((choice) => (
                  <div key={choice.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex-1">
                      <span className="font-semibold">{choice.name}</span>
                      {choice.price > 0 && (
                        <span className="ml-2 text-green-600 font-bold">+{choice.price}€</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveChoice(choice.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Ajouter un choix */}
              <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                <p className="font-bold text-sm text-blue-800">Ajouter un choix</p>
                <div className="flex space-x-3">
                  <Input
                    value={newChoice.name}
                    onChange={(e) => setNewChoice({ ...newChoice, name: e.target.value })}
                    placeholder="Nom du choix..."
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newChoice.price}
                    onChange={(e) => setNewChoice({ ...newChoice, price: parseFloat(e.target.value) || 0 })}
                    placeholder="Prix (+€)"
                    className="w-32"
                  />
                  <Button onClick={handleAddChoice} className="whitespace-nowrap">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Boutons */}
            <div className="flex space-x-3 pt-4 border-t">
              <Button onClick={handleSaveOption} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                {editingOption ? 'Mettre à jour' : 'Créer l\'option'}
              </Button>
              <Button onClick={() => setShowModal(false)} variant="outline">
                Annuler
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
