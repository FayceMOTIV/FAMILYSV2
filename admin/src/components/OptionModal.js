import React, { useState, useEffect, useRef } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { X, Plus, Trash2, Upload } from 'lucide-react';
import { NestedSubOptionsEditor } from './NestedSubOptionsEditor';
import { optionsAPI, choiceLibraryAPI, uploadAPI } from '../services/api';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

// ============================================
// COMPOSANT AUTOCOMPLETE POUR LES CHOIX
// ============================================
const ChoiceNameAutocomplete = ({ 
  value, 
  onChange, 
  onSelectFromLibrary, 
  choiceLibrary,
  placeholder = "Tapez pour rechercher..."
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // Fermer si clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    onChange(inputValue);
    
    if (inputValue.length > 0) {
      const filtered = choiceLibrary.filter(item => 
        item.name.toLowerCase().includes(inputValue.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 6));
      setShowSuggestions(true);
    } else {
      setSuggestions(choiceLibrary.slice(0, 6));
      setShowSuggestions(true);
    }
    setHighlightedIndex(-1);
  };

  const handleFocus = () => {
    const currentValue = value || '';
    if (currentValue.length === 0) {
      setSuggestions(choiceLibrary.slice(0, 6));
    } else {
      const filtered = choiceLibrary.filter(item => 
        item.name.toLowerCase().includes(currentValue.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 6));
    }
    setShowSuggestions(true);
  };

  const handleSelectSuggestion = (item) => {
    onSelectFromLibrary(item);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          e.preventDefault();
          handleSelectSuggestion(suggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
      default:
        break;
    }
  };

  const getEmojiForName = (name) => {
    const lowerName = (name || '').toLowerCase();
    const emojis = {
      'coca': '🥤', 'cola': '🥤', 'pepsi': '🥤', 'soda': '🥤',
      'fanta': '🍊', 'orange': '🍊', 'orangina': '🍊',
      'sprite': '🍋', 'citron': '🍋',
      'ice tea': '🍑', 'thé': '🍵', 'tea': '🍵',
      'eau': '💧', 'water': '💧', 'perrier': '💧', 'evian': '💧',
      'frite': '🍟', 'frites': '🍟',
      'potato': '🥔', 'potatoes': '🥔',
      'salade': '🥗', 'salad': '🥗',
      'onion': '🧅', 'oignon': '🧅',
      'nugget': '🍗', 'poulet': '🍗',
      'ketchup': '🍅', 'tomate': '🍅',
      'mayo': '🥚', 'mayonnaise': '🥚',
      'bbq': '🔥', 'barbecue': '🔥',
      'piment': '🌶️', 'algérien': '🌶️', 'samurai': '⚔️', 'samourai': '⚔️',
      'andalou': '🇪🇸',
      'biggy': '⭐', 'special': '⭐',
      'burger': '🍔', 'menu': '🍔🍟🥤',
    };
    
    for (const [key, emoji] of Object.entries(emojis)) {
      if (lowerName.includes(key)) return emoji;
    }
    return '🍽️';
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', flex: 1 }}>
      <div style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full px-3 py-2 border rounded-lg pr-10"
          autoComplete="off"
        />
        {choiceLibrary.length > 0 && (
          <span 
            style={{ 
              position: 'absolute', 
              right: 10, 
              top: '50%', 
              transform: 'translateY(-50%)',
              fontSize: 14,
              opacity: 0.5
            }}
            title={`${choiceLibrary.length} éléments dans la bibliothèque`}
          >
            📚
          </span>
        )}
      </div>

      {/* Dropdown suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: 4,
          backgroundColor: '#FFF',
          border: '1px solid #E2E8F0',
          borderRadius: 12,
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          zIndex: 1000,
          maxHeight: 280,
          overflowY: 'auto',
        }}>
          <div style={{
            padding: '8px 12px',
            fontSize: 11,
            fontWeight: 600,
            color: '#64748B',
            backgroundColor: '#F8FAFC',
            borderBottom: '1px solid #E2E8F0',
            borderRadius: '12px 12px 0 0',
          }}>
            📚 Bibliothèque • ↑↓ naviguer • Entrée sélectionner
          </div>
          {suggestions.map((item, index) => (
            <div
              key={item.id || index}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px 12px',
                cursor: 'pointer',
                gap: 10,
                backgroundColor: index === highlightedIndex ? '#EEF2FF' : 'transparent',
                transition: 'background-color 0.1s',
              }}
              onClick={() => handleSelectSuggestion(item)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              {/* Image ou emoji */}
              {item.image_url ? (
                <img 
                  src={item.image_url.startsWith('/') ? `${API_URL}${item.image_url}` : item.image_url}
                  alt={item.name}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    objectFit: 'cover',
                    border: '1px solid #E2E8F0',
                  }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  backgroundColor: '#F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                }}>
                  {getEmojiForName(item.name)}
                </div>
              )}
              
              {/* Infos */}
              <div style={{ flex: 1 }}>
                <span style={{ 
                  fontSize: 14, 
                  fontWeight: 500, 
                  color: '#1E293B',
                  display: 'block',
                }}>
                  {item.name}
                </span>
                {item.default_price > 0 && (
                  <span style={{ 
                    fontSize: 12, 
                    color: '#10B981', 
                    fontWeight: 600 
                  }}>
                    +{item.default_price.toFixed(2)}€
                  </span>
                )}
              </div>
              
              {/* Indicateur sélection */}
              {index === highlightedIndex && (
                <span style={{
                  fontSize: 10,
                  color: '#6366F1',
                  backgroundColor: '#EEF2FF',
                  padding: '4px 8px',
                  borderRadius: 6,
                  fontWeight: 600,
                }}>
                  ↵
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Message si pas de résultat */}
      {showSuggestions && value && suggestions.length === 0 && choiceLibrary.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: 4,
          backgroundColor: '#FFF',
          border: '1px solid #E2E8F0',
          borderRadius: 12,
          padding: '12px 16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          zIndex: 1000,
        }}>
          <span style={{ fontSize: 13, color: '#64748B' }}>
            ✨ "{value}" - Nouveau choix (pas dans la bibliothèque)
          </span>
        </div>
      )}
    </div>
  );
};

// ============================================
// COMPOSANT PRINCIPAL OPTIONMODAL
// ============================================
export const OptionModal = ({ isOpen, onClose, option, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    internal_comment: '',
    type: 'single',
    is_required: false,
    allow_repeat: false,
    max_choices: '',
    choices: [{ name: '', price: 0, image_url: '', internal_comment: '' }]
  });
  
  const [loading, setLoading] = useState(false);
  const [choiceLibrary, setChoiceLibrary] = useState([]);
  const [uploadingImage, setUploadingImage] = useState({});
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadChoiceLibrary();
    }
  }, [isOpen]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadChoiceLibrary = async () => {
    try {
      const response = await choiceLibraryAPI.getAll();
      setChoiceLibrary(response.data.choices || []);
    } catch (error) {
      console.error('Error loading choice library:', error);
    }
  };

  const addChoiceToLibrary = async (choice) => {
    try {
      // Check if choice already exists in library
      const existingChoice = choiceLibrary.find(
        c => c.name.toLowerCase().trim() === choice.name.toLowerCase().trim()
      );
      
      if (existingChoice) {
        return; // Already in library, skip
      }

      await choiceLibraryAPI.create({
        name: choice.name,
        default_price: choice.price,
        image_url: choice.image_url || null,
        description: null
      });

      await loadChoiceLibrary(); // Reload library
      showToast(`"${choice.name}" ajouté à la bibliothèque`, 'info');
    } catch (error) {
      console.error('Error adding to library:', error);
    }
  };

  const handleImageUpload = async (index, file) => {
    if (!file) return;
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('L\'image est trop grande. Maximum 5 MB.');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Le fichier doit être une image.');
      return;
    }

    setUploadingImage(prev => ({ ...prev, [index]: true }));

    try {
      const response = await uploadAPI.image(file, 'options');
      const imageUrl = response.data.url;
      handleChoiceChange(index, 'image_url', imageUrl);
      showToast('Image uploadée avec succès', 'success');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Erreur lors de l\'upload de l\'image');
    } finally {
      setUploadingImage(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleRemoveImage = (index) => {
    handleChoiceChange(index, 'image_url', '');
  };

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
        choices: option.choices?.length > 0 ? option.choices : [{ name: '', price: 0, image_url: '', internal_comment: '' }]
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
        choices: [{ name: '', price: 0, image_url: '', internal_comment: '' }]
      });
    }
  }, [option, isOpen]);

  const handleAddChoice = () => {
    setFormData({
      ...formData,
      choices: [...formData.choices, { name: '', price: 0, image_url: '', internal_comment: '' }]
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

  // Nouvelle fonction pour sélectionner depuis l'autocomplétion
  const handleSelectFromAutocomplete = (index, libraryItem) => {
    const newChoices = [...formData.choices];
    newChoices[index] = {
      ...newChoices[index],
      name: libraryItem.name,
      price: libraryItem.default_price || 0,
      image_url: libraryItem.image_url || '',
    };
    setFormData({ ...formData, choices: newChoices });
    showToast(`"${libraryItem.name}" sélectionné`, 'success');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Préparer les données
      const data = {
        ...formData,
        max_choices: formData.max_choices ? parseInt(formData.max_choices) : null,
        choices: formData.choices.filter(c => c.name.trim() !== '')
      };
      
      if (option) {
        await optionsAPI.update(option.id, data);
      } else {
        await optionsAPI.create(data);
      }

      // Add all choices to library after successful save
      for (const choice of data.choices) {
        await addChoiceToLibrary(choice);
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error saving option:', error);
      alert(`Erreur: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="large">
      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[60] px-4 py-2 rounded-lg shadow-lg text-white text-sm ${
          toast.type === 'success' ? 'bg-green-500' : 
          toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
        }`}>
          {toast.message}
        </div>
      )}

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

        {/* Permettre la répétition */}
        {formData.type === 'multiple' && (
          <div className="flex items-center bg-blue-50 p-3 rounded-lg">
            <input
              type="checkbox"
              id="allow_repeat"
              checked={formData.allow_repeat}
              onChange={(e) => setFormData({...formData, allow_repeat: e.target.checked})}
              className="mr-2"
            />
            <label htmlFor="allow_repeat" className="text-sm font-medium">
              Permettre de prendre le même choix plusieurs fois (ex: Chantilly ×2)
            </label>
          </div>
        )}

        {/* Choix */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium">Choix disponibles *</label>
            {choiceLibrary.length > 0 && (
              <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                📚 {choiceLibrary.length} éléments dans la bibliothèque
              </span>
            )}
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto mb-3">
            {formData.choices.map((choice, index) => (
              <div key={index} className="border rounded-lg p-3 bg-gray-50">
                <div className="flex gap-2 mb-2 items-start">
                  {/* Image miniature si présente */}
                  {choice.image_url && (
                    <div className="relative flex-shrink-0">
                      <img 
                        src={choice.image_url.startsWith('/') ? `${API_URL}${choice.image_url}` : choice.image_url}
                        alt={choice.name}
                        className="w-12 h-12 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {/* Input avec autocomplétion */}
                  <ChoiceNameAutocomplete
                    value={choice.name}
                    onChange={(value) => handleChoiceChange(index, 'name', value)}
                    onSelectFromLibrary={(item) => handleSelectFromAutocomplete(index, item)}
                    choiceLibrary={choiceLibrary}
                    placeholder="Tapez pour rechercher dans la bibliothèque..."
                  />

                  {/* Prix */}
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={choice.price}
                    onChange={(e) => handleChoiceChange(index, 'price', e.target.value)}
                    className="w-24 px-3 py-2 border rounded-lg flex-shrink-0"
                    placeholder="Prix"
                  />

                  {/* Bouton supprimer */}
                  {formData.choices.length > 1 && (
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => handleRemoveChoice(index)}
                      className="flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Image Upload Section - seulement si pas d'image */}
                {!choice.image_url && (
                  <div className="mt-2">
                    <label className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-gray-50 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(index, e.target.files[0])}
                        className="hidden"
                        disabled={uploadingImage[index]}
                      />
                      {uploadingImage[index] ? (
                        <span className="text-sm text-gray-500">Upload en cours...</span>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="text-sm text-gray-600">📷 Image (optionnel)</span>
                        </>
                      )}
                    </label>
                  </div>
                )}

                {/* Commentaire interne */}
                <textarea
                  value={choice.internal_comment || ''}
                  onChange={(e) => handleChoiceChange(index, 'internal_comment', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg resize-none mt-2 text-sm"
                  placeholder="💬 Commentaire interne (non visible par le client)"
                  rows="1"
                />

                {/* Sous-options conditionnelles imbriquées */}
                <NestedSubOptionsEditor
                  choice={choice}
                  onChange={(updatedChoice) => {
                    const newChoices = [...formData.choices];
                    newChoices[index] = updatedChoice;
                    setFormData({ ...formData, choices: newChoices });
                  }}
                  choiceLibrary={choiceLibrary}
                />
              </div>
            ))}
          </div>

          {/* Bouton ajouter un choix */}
          <Button
            type="button"
            variant="outline"
            onClick={handleAddChoice}
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Ajouter un choix
          </Button>
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
