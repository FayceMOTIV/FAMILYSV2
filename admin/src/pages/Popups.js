import React, { useState, useEffect, useRef } from 'react';
import { Header } from '../components/Header';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { Input, Label, Select } from '../components/Input';
import { Image, Plus, Trash2, Edit, Eye, EyeOff, Link as LinkIcon, RefreshCw, Upload, X } from 'lucide-react';
import { popupsAPI, uploadAPI } from '../services/api';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

// Pages disponibles dans l'app mobile
const APP_PAGES = [
  { value: '/(tabs)', label: '🏠 Accueil' },
  { value: '/(tabs)/menu', label: '🍔 Menu / Commander' },
  { value: '/(tabs)/cart', label: '🛒 Panier' },
  { value: '/(tabs)/orders', label: '📋 Mes Commandes' },
  { value: '/(tabs)/loyalty', label: '💳 Carte Fidélité' },
  { value: '/(tabs)/profile', label: '👤 Mon Profil' },
  { value: '/(tabs)/surprise', label: '🎰 Surprise du Jour' },
  { value: '/(tabs)/restaurant', label: '🏪 Le Restaurant' },
  { value: '/favorites', label: '❤️ Favoris' },
  { value: '/games', label: '🎮 Jeux' },
  { value: '/reservations', label: '📅 Réservations' },
  { value: '/about', label: 'ℹ️ À propos' },
];

export const Popups = () => {
  const [popups, setPopups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingPopup, setEditingPopup] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const fileInputRef = useRef(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    link_url: '',
    link_type: 'none',
    is_active: true,
    display_frequency: 'once',
    start_date: '',
    end_date: '',
    priority: 0
  });

  useEffect(() => {
    loadPopups();
  }, []);

  const loadPopups = async () => {
    setLoading(true);
    try {
      const response = await popupsAPI.getAll();
      setPopups(response.data.popups || response.data || []);
    } catch (error) {
      console.error('Erreur chargement popups:', error);
      setPopups([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      image_url: '',
      link_url: '',
      link_type: 'none',
      is_active: true,
      display_frequency: 'once',
      start_date: '',
      end_date: '',
      priority: 0
    });
    setEditingPopup(null);
    setShowForm(false);
  };

  const handleEdit = (popup) => {
    setFormData({
      title: popup.title || '',
      image_url: popup.image_url || '',
      link_url: popup.link_url || '',
      link_type: popup.link_type || 'none',
      is_active: popup.is_active,
      display_frequency: popup.display_frequency || 'once',
      start_date: popup.start_date ? popup.start_date.split('T')[0] : '',
      end_date: popup.end_date ? popup.end_date.split('T')[0] : '',
      priority: popup.priority || 0
    });
    setEditingPopup(popup);
    setShowForm(true);
  };

  // Upload d'image
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('❌ Veuillez sélectionner une image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('❌ L\'image ne doit pas dépasser 5MB');
      return;
    }

    setUploading(true);
    try {
      const response = await uploadAPI.popupImage(file);

      if (response.data.success || response.data.url) {
        const imageUrl = response.data.url.startsWith('http') 
          ? response.data.url 
          : `${API_URL}${response.data.url}`;
        setFormData({ ...formData, image_url: imageUrl });
        alert('✅ Image uploadée avec succès !');
      }
    } catch (error) {
      console.error('Erreur upload:', error);
      alert('❌ Erreur lors de l\'upload de l\'image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.image_url) {
      alert('❌ Une image est requise');
      return;
    }

    setSaving(true);
    try {
      const dataToSend = {
        ...formData,
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        priority: parseInt(formData.priority) || 0
      };

      if (editingPopup) {
        await popupsAPI.update(editingPopup.id, dataToSend);
        alert('✅ Popup modifiée avec succès !');
      } else {
        await popupsAPI.create(dataToSend);
        alert('✅ Popup créée avec succès !');
      }
      
      resetForm();
      loadPopups();
    } catch (error) {
      console.error('Erreur sauvegarde popup:', error);
      alert('❌ Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (popup) => {
    try {
      await popupsAPI.toggle(popup.id, !popup.is_active);
      loadPopups();
    } catch (error) {
      console.error('Erreur toggle popup:', error);
      alert('❌ Erreur lors du changement de statut');
    }
  };

  const handleDelete = async (popup) => {
    if (!window.confirm(`Supprimer la popup "${popup.title || 'Sans titre'}" ?`)) {
      return;
    }
    
    try {
      await popupsAPI.delete(popup.id);
      alert('✅ Popup supprimée');
      loadPopups();
    } catch (error) {
      console.error('Erreur suppression popup:', error);
      alert('❌ Erreur lors de la suppression');
    }
  };

  const getFrequencyLabel = (freq) => {
    const labels = {
      'once': 'Une seule fois',
      'every_session': 'À chaque session',
      'every_day': 'Une fois par jour'
    };
    return labels[freq] || freq;
  };

  const getLinkTypeLabel = (type) => {
    const labels = {
      'none': 'Aucun lien',
      'internal': 'Page app',
      'external': 'Lien externe'
    };
    return labels[type] || type;
  };

  const getPageLabel = (url) => {
    const page = APP_PAGES.find(p => p.value === url);
    return page ? page.label : url;
  };

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_URL}${url}`;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header title="Gestion des Popups" subtitle="Gérez les popups qui s'affichent à l'ouverture de l'app" />
      
      <div className="p-6 space-y-6">
        {/* Boutons */}
        <div className="flex justify-between items-center">
          <Button onClick={loadPopups} variant="outline" className="flex items-center gap-2">
            <RefreshCw size={16} />
            Actualiser
          </Button>
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-red-600 hover:bg-red-700">
            <Plus size={16} />
            Nouvelle Popup
          </Button>
        </div>

        {/* Formulaire */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image size={20} />
                {editingPopup ? 'Modifier la Popup' : 'Créer une Popup'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Titre (optionnel)</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Ex: Offre Spéciale"
                    />
                  </div>
                  <div>
                    <Label htmlFor="priority">Priorité (0-100)</Label>
                    <Input
                      id="priority"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    />
                    <p className="text-xs text-gray-500 mt-1">Plus haut = affiché en premier</p>
                  </div>
                </div>

                {/* Section Image */}
                <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                  <Label className="text-base font-semibold mb-3 block">Image de la Popup *</Label>
                  
                  <div className="flex flex-wrap gap-3 mb-4">
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all ${
                          uploading 
                            ? 'bg-gray-300 text-gray-500 cursor-wait' 
                            : 'bg-red-600 text-white hover:bg-red-700'
                        }`}
                      >
                        <Upload size={18} />
                        {uploading ? 'Upload en cours...' : 'Uploader une image'}
                      </label>
                    </div>

                    <span className="text-gray-400 self-center">ou</span>

                    <div className="flex-1 min-w-[250px]">
                      <Input
                        value={formData.image_url}
                        onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                        placeholder="Coller une URL d'image..."
                        className="w-full"
                      />
                    </div>
                  </div>

                  {formData.image_url && (
                    <div className="relative inline-block">
                      <img 
                        src={getImageUrl(formData.image_url)} 
                        alt="Aperçu" 
                        className="max-h-56 rounded-lg shadow-md"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, image_url: ''})}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}

                  <p className="text-xs text-gray-500 mt-2">
                    Formats : JPG, PNG, GIF, WebP • Max : 5MB • Ratio recommandé : 3:4
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Type de lien */}
                  <div>
                    <Label htmlFor="link_type">Action au clic</Label>
                    <Select
                      id="link_type"
                      value={formData.link_type}
                      onChange={(e) => setFormData({...formData, link_type: e.target.value, link_url: ''})}
                    >
                      <option value="none">Fermer la popup (aucun lien)</option>
                      <option value="internal">Ouvrir une page de l'app</option>
                      <option value="external">Ouvrir un lien externe</option>
                    </Select>
                  </div>

                  {/* Page de l'app (menu déroulant) */}
                  {formData.link_type === 'internal' && (
                    <div>
                      <Label htmlFor="link_url">Page de l'app</Label>
                      <Select
                        id="link_url"
                        value={formData.link_url}
                        onChange={(e) => setFormData({...formData, link_url: e.target.value})}
                      >
                        <option value="">-- Sélectionner une page --</option>
                        {APP_PAGES.map((page) => (
                          <option key={page.value} value={page.value}>
                            {page.label}
                          </option>
                        ))}
                      </Select>
                    </div>
                  )}

                  {/* URL externe */}
                  {formData.link_type === 'external' && (
                    <div>
                      <Label htmlFor="link_url">URL externe</Label>
                      <Input
                        id="link_url"
                        value={formData.link_url}
                        onChange={(e) => setFormData({...formData, link_url: e.target.value})}
                        placeholder="https://..."
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="display_frequency">Fréquence d'affichage</Label>
                    <Select
                      id="display_frequency"
                      value={formData.display_frequency}
                      onChange={(e) => setFormData({...formData, display_frequency: e.target.value})}
                    >
                      <option value="once">Une seule fois</option>
                      <option value="every_session">À chaque ouverture</option>
                      <option value="every_day">Une fois par jour</option>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="start_date">Date de début (optionnel)</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date">Date de fin (optionnel)</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="w-4 h-4 text-red-600 rounded"
                  />
                  <Label htmlFor="is_active" className="mb-0">Popup active immédiatement</Label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={saving} className="bg-red-600 hover:bg-red-700">
                    {saving ? 'Enregistrement...' : (editingPopup ? '💾 Modifier' : '✨ Créer la Popup')}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Annuler
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Liste */}
        <Card>
          <CardHeader>
            <CardTitle>📋 Popups existantes ({popups.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Chargement...</div>
            ) : popups.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Image size={48} className="mx-auto mb-2 opacity-50" />
                <p>Aucune popup créée</p>
                <p className="text-sm">Cliquez sur "Nouvelle Popup" pour en créer une</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {popups.map((popup) => (
                  <div 
                    key={popup.id} 
                    className={`border rounded-lg overflow-hidden ${popup.is_active ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'}`}
                  >
                    <div className="h-40 bg-gray-200 relative">
                      {popup.image_url && (
                        <img 
                          src={getImageUrl(popup.image_url)} 
                          alt={popup.title || 'Popup'} 
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      )}
                      <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${popup.is_active ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                        {popup.is_active ? '🟢 Active' : '⚫ Inactive'}
                      </div>
                    </div>

                    <div className="p-3">
                      <h3 className="font-semibold text-gray-800 truncate">
                        {popup.title || 'Sans titre'}
                      </h3>
                      
                      <div className="mt-2 space-y-1 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <RefreshCw size={12} />
                          {getFrequencyLabel(popup.display_frequency)}
                        </div>
                        <div className="flex items-center gap-1">
                          <LinkIcon size={12} />
                          {popup.link_type === 'internal' ? getPageLabel(popup.link_url) : getLinkTypeLabel(popup.link_type)}
                        </div>
                      </div>

                      <div className="flex gap-2 mt-3 pt-3 border-t">
                        <button
                          onClick={() => handleToggle(popup)}
                          className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs font-medium ${popup.is_active ? 'bg-gray-200 hover:bg-gray-300' : 'bg-green-100 hover:bg-green-200 text-green-700'}`}
                        >
                          {popup.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                          {popup.is_active ? 'Désactiver' : 'Activer'}
                        </button>
                        <button
                          onClick={() => handleEdit(popup)}
                          className="flex items-center justify-center gap-1 px-3 py-1.5 rounded text-xs bg-blue-100 hover:bg-blue-200 text-blue-700"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(popup)}
                          className="flex items-center justify-center gap-1 px-3 py-1.5 rounded text-xs bg-red-100 hover:bg-red-200 text-red-700"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Popups;
