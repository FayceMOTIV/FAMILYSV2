import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Plus, Edit2, Trash2, Image as ImageIcon, DollarSign } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://resto-admin-11.preview.emergentagent.com';

export const ChoiceLibrary = () => {
  const [choices, setChoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingChoice, setEditingChoice] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    default_price: 0,
    image_url: '',
    description: ''
  });

  useEffect(() => {
    loadChoices();
  }, []);

  const loadChoices = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/admin/choice-library`);
      setChoices(response.data.choices || []);
    } catch (error) {
      console.error('Erreur chargement choix:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingChoice) {
        await axios.put(`${API_URL}/api/v1/admin/choice-library/${editingChoice.id}`, formData);
      } else {
        await axios.post(`${API_URL}/api/v1/admin/choice-library`, formData);
      }
      await loadChoices();
      handleCloseModal();
      alert(editingChoice ? '✅ Choix modifié' : '✅ Choix créé');
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('❌ Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (choiceId) => {
    if (!window.confirm('Supprimer ce choix ?')) return;
    
    try {
      await axios.delete(`${API_URL}/api/v1/admin/choice-library/${choiceId}`);
      await loadChoices();
      alert('✅ Choix supprimé');
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('❌ Erreur lors de la suppression');
    }
  };

  const handleEdit = (choice) => {
    setEditingChoice(choice);
    setFormData({
      name: choice.name,
      default_price: choice.default_price,
      image_url: choice.image_url || '',
      description: choice.description || ''
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingChoice(null);
    setFormData({
      name: '',
      default_price: 0,
      image_url: '',
      description: ''
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="📚 Bibliothèque de Choix"
        subtitle="Gérez vos choix réutilisables pour les options"
      />

      <div className="p-6\">
        <div className="flex justify-between items-center mb-6\">
          <div>
            <h2 className="text-2xl font-bold text-gray-800\">{choices.length} choix disponibles</h2>
            <p className="text-sm text-gray-600\">Créez des choix que vous pourrez réutiliser dans vos options</p>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-2\" />
            Nouveau Choix
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8\">Chargement...</div>
        ) : choices.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12\">
              <ImageIcon className="w-16 h-16 mx-auto text-gray-400 mb-4\" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2\">Aucun choix</h3>
              <p className="text-gray-500 mb-4\">Créez votre premier choix réutilisable</p>
              <Button onClick={() => setShowModal(true)}>
                <Plus className="w-4 h-4 mr-2\" />
                Créer un choix
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4\">
            {choices.map((choice) => (
              <Card key={choice.id} className="hover:shadow-lg transition-shadow\">
                <CardContent className="p-4\">
                  {choice.image_url && (
                    <div className="mb-3 h-32 bg-gray-100 rounded-lg overflow-hidden\">
                      <img 
                        src={choice.image_url} 
                        alt={choice.name}
                        className="w-full h-full object-cover\"
                      />
                    </div>
                  )}
                  <h3 className="font-bold text-lg mb-1\">{choice.name}</h3>
                  {choice.description && (
                    <p className="text-sm text-gray-600 mb-2\">{choice.description}</p>
                  )}
                  <div className="flex items-center gap-2 mb-3\">
                    <DollarSign className="w-4 h-4 text-green-600\" />
                    <span className="font-semibold text-green-700\">
                      {choice.default_price.toFixed(2)}€
                    </span>
                    <span className="text-xs text-gray-500\">(prix par défaut)</span>
                  </div>
                  <div className="flex gap-2\">
                    <Button 
                      size=\"sm\" 
                      variant=\"outline\"
                      onClick={() => handleEdit(choice)}
                      className="flex-1\"
                    >
                      <Edit2 className="w-4 h-4 mr-1\" />
                      Modifier
                    </Button>
                    <Button 
                      size=\"sm\" 
                      variant=\"outline\"
                      onClick={() => handleDelete(choice.id)}
                      className="text-red-600 border-red-300 hover:bg-red-50\"
                    >
                      <Trash2 className="w-4 h-4\" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4\">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto\">
            <div className="p-6\">
              <h2 className="text-2xl font-bold mb-4\">
                {editingChoice ? 'Modifier le choix' : 'Nouveau choix'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4\">
                <div>
                  <label className="block text-sm font-medium mb-1\">Nom *</label>
                  <input
                    type=\"text\"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg\"
                    placeholder=\"Ex: Cheddar, Bacon, Sans oignon...\"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1\">Prix par défaut (€)</label>
                  <input
                    type=\"number\"
                    step=\"0.01\"
                    value={formData.default_price}
                    onChange={(e) => setFormData({...formData, default_price: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border rounded-lg\"
                    placeholder=\"0.00\"
                  />
                  <p className="text-xs text-gray-500 mt-1\">
                    Vous pourrez modifier ce prix dans chaque option
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1\">Image (URL)</label>
                  <input
                    type=\"url\"
                    value={formData.image_url}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg\"
                    placeholder=\"https://...\"
                  />
                  <p className="text-xs text-gray-500 mt-1\">
                    Cette image apparaîtra sur l'app mobile
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1\">Description (optionnel)</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg\"
                    rows=\"2\"
                    placeholder=\"Description courte...\"
                  />
                </div>

                <div className="flex gap-3 pt-4\">
                  <Button
                    type=\"button\"
                    variant=\"outline\"
                    onClick={handleCloseModal}
                    className="flex-1\"
                  >
                    Annuler
                  </Button>
                  <Button
                    type=\"submit\"
                    className="flex-1\"
                  >
                    {editingChoice ? 'Modifier' : 'Créer'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
