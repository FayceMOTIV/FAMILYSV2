import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { OptionModal } from '../components/OptionModal';
import { Plus, Edit, Trash2, Copy } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://react-native-reboot.preview.emergentagent.com';

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
    setEditingOption(option);
    setShowModal(true);
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

  const handleDuplicateOption = async (option) => {
    if (!window.confirm(`Dupliquer l'option "${option.name}" ?`)) return;
    
    try {
      const duplicatedOption = {
        ...option,
        name: `${option.name} (copie)`,
      };
      
      // Remove the id so backend creates a new one
      delete duplicatedOption.id;
      
      await axios.post(`${API_URL}/api/v1/admin/options`, duplicatedOption);
      await loadOptions();
      alert('✅ Option dupliquée avec succès !');
    } catch (error) {
      console.error('Erreur duplication:', error);
      alert('Erreur lors de la duplication');
    }
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
              <Plus className="w-16 h-16 mx-auto text-gray-400 mb-4" />
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
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleOpenModal(option)}
                        className="p-2 hover:bg-white rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDuplicateOption(option)}
                        className="p-2 hover:bg-white rounded-lg transition-colors"
                        title="Dupliquer"
                      >
                        <Copy className="w-4 h-4 text-green-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteOption(option.id)}
                        className="p-2 hover:bg-white rounded-lg transition-colors"
                        title="Supprimer"
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
                  
                  {option.internal_comment && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                      <p className="text-xs font-semibold text-yellow-800 mb-1">📝 Commentaire interne</p>
                      <p className="text-sm text-yellow-700">{option.internal_comment}</p>
                    </div>
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
      <OptionModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingOption(null);
        }}
        option={editingOption}
        onSuccess={loadOptions}
      />
    </div>
  );
};
