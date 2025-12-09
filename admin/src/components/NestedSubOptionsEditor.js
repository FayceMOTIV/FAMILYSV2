import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight, Upload, X } from 'lucide-react';
import { Button } from './Button';

/**
 * Composant récursif pour gérer les sous-options imbriquées
 * Permet de créer une structure comme:
 * - Choix "MENU"
 *   └─ Sous-option "Taille Menu"
 *      ├─ Choix "MENU L"
 *      │  └─ Sous-option "Boisson L"
 *      │     └─ Choix "Coca 33cl", "Fanta 33cl"
 *      └─ Choix "MENU XL"
 *         └─ Sous-option "Boisson XL"
 *            └─ Choix "Coca 50cl", "Fanta 50cl"
 */

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

// ============================================
// COMPOSANT AUTOCOMPLETE POUR LES CHOIX
// ============================================
const ChoiceNameAutocomplete = ({ 
  value, 
  onChange, 
  onSelectFromLibrary, 
  choiceLibrary = [],
  placeholder = "Tapez pour rechercher..."
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef(null);

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
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full px-3 py-2 border rounded-lg text-sm pr-8"
          autoComplete="off"
        />
        {choiceLibrary.length > 0 && (
          <span 
            style={{ 
              position: 'absolute', 
              right: 8, 
              top: '50%', 
              transform: 'translateY(-50%)',
              fontSize: 12,
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
          borderRadius: 10,
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          zIndex: 1000,
          maxHeight: 240,
          overflowY: 'auto',
        }}>
          <div style={{
            padding: '6px 10px',
            fontSize: 10,
            fontWeight: 600,
            color: '#64748B',
            backgroundColor: '#F8FAFC',
            borderBottom: '1px solid #E2E8F0',
            borderRadius: '10px 10px 0 0',
          }}>
            📚 Bibliothèque • ↑↓ naviguer • Entrée sélectionner
          </div>
          {suggestions.map((item, index) => (
            <div
              key={item.id || index}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 10px',
                cursor: 'pointer',
                gap: 8,
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
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    objectFit: 'cover',
                    border: '1px solid #E2E8F0',
                  }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  backgroundColor: '#F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                }}>
                  {getEmojiForName(item.name)}
                </div>
              )}
              
              {/* Infos */}
              <div style={{ flex: 1 }}>
                <span style={{ 
                  fontSize: 13, 
                  fontWeight: 500, 
                  color: '#1E293B',
                  display: 'block',
                }}>
                  {item.name}
                </span>
                {item.default_price > 0 && (
                  <span style={{ 
                    fontSize: 11, 
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
                  fontSize: 9,
                  color: '#6366F1',
                  backgroundColor: '#EEF2FF',
                  padding: '3px 6px',
                  borderRadius: 4,
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
          borderRadius: 10,
          padding: '10px 12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          zIndex: 1000,
        }}>
          <span style={{ fontSize: 12, color: '#64748B' }}>
            ✨ "{value}" - Nouveau choix
          </span>
        </div>
      )}
    </div>
  );
};

// ============================================
// Composant pour un choix de sous-option (avec possibilité d'avoir ses propres sous-options)
// ============================================
const SubOptionChoiceEditor = ({ choice, onChange, onDelete, depth = 0, choiceLibrary = [] }) => {
  const [expanded, setExpanded] = useState(false);
  const [uploading, setUploading] = useState(false);

  const hasSubOptions = choice.sub_options && choice.sub_options.length > 0;
  const depthColors = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];
  const borderColor = depthColors[depth % depthColors.length];

  const handleAddSubOption = () => {
    const newSubOption = {
      id: `sub_${Date.now()}`,
      name: '',
      type: 'single',
      is_required: false,
      choices: [{ id: `choice_${Date.now()}`, name: '', price: 0, image_url: '', sub_options: [] }]
    };
    onChange({
      ...choice,
      sub_options: [...(choice.sub_options || []), newSubOption]
    });
    setExpanded(true);
  };

  const handleSubOptionChange = (index, updatedSubOption) => {
    const newSubOptions = [...(choice.sub_options || [])];
    newSubOptions[index] = updatedSubOption;
    onChange({ ...choice, sub_options: newSubOptions });
  };

  const handleSubOptionDelete = (index) => {
    const newSubOptions = (choice.sub_options || []).filter((_, i) => i !== index);
    onChange({ ...choice, sub_options: newSubOptions });
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Image trop grande (max 5MB)');
      return;
    }
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${API_URL}/api/v1/admin/upload/image`, {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        onChange({ ...choice, image_url: data.url });
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  // Sélection depuis l'autocomplétion - remplit nom, prix et image
  const handleSelectFromAutocomplete = (libraryItem) => {
    onChange({
      ...choice,
      name: libraryItem.name,
      price: libraryItem.default_price || 0,
      image_url: libraryItem.image_url || ''
    });
  };

  return (
    <div className="border rounded-lg p-3 bg-white mb-2" style={{ borderLeftWidth: 4, borderLeftColor: borderColor }}>
      <div className="flex items-start gap-2">
        {/* Expand button si a des sous-options */}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-gray-400 hover:text-gray-600"
        >
          {hasSubOptions ? (
            expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
          ) : (
            <div className="w-4 h-4" />
          )}
        </button>

        {/* Image miniature si présente */}
        {choice.image_url && (
          <div className="relative flex-shrink-0 mt-1">
            <img
              src={choice.image_url.startsWith('/') ? `${API_URL}${choice.image_url}` : choice.image_url}
              alt={choice.name}
              className="w-10 h-10 object-cover rounded border"
            />
            <button
              type="button"
              onClick={() => onChange({ ...choice, image_url: '' })}
              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        <div className="flex-1 space-y-2">
          {/* Ligne principale: nom avec autocomplete + prix */}
          <div className="flex gap-2">
            <ChoiceNameAutocomplete
              value={choice.name}
              onChange={(value) => onChange({ ...choice, name: value })}
              onSelectFromLibrary={handleSelectFromAutocomplete}
              choiceLibrary={choiceLibrary}
              placeholder="Tapez pour rechercher..."
            />
            <input
              type="number"
              step="0.01"
              min="0"
              value={choice.price || 0}
              onChange={(e) => onChange({ ...choice, price: parseFloat(e.target.value) || 0 })}
              className="w-20 px-3 py-2 border rounded-lg text-sm"
              placeholder="Prix"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddSubOption}
              title="Ajouter une sous-option conditionnelle"
            >
              <Plus className="w-3 h-3" />
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={onDelete}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>

          {/* Image upload - seulement si pas d'image */}
          {!choice.image_url && (
            <div className="flex items-center gap-2">
              <label className="flex items-center px-3 py-1.5 border border-dashed rounded cursor-pointer hover:bg-gray-50 text-xs">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files[0])}
                  className="hidden"
                  disabled={uploading}
                />
                {uploading ? '⏳' : <Upload className="w-3 h-3 mr-1" />}
                {uploading ? 'Upload...' : '📷 Image'}
              </label>
              
              {hasSubOptions && (
                <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                  {choice.sub_options.length} sous-option{choice.sub_options.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}

          {/* Badge sous-options si image présente */}
          {choice.image_url && hasSubOptions && (
            <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded inline-block">
              {choice.sub_options.length} sous-option{choice.sub_options.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Sous-options imbriquées */}
      {expanded && hasSubOptions && (
        <div className="mt-3 ml-6 space-y-3">
          {choice.sub_options.map((subOption, index) => (
            <SubOptionEditor
              key={subOption.id || index}
              subOption={subOption}
              onChange={(updated) => handleSubOptionChange(index, updated)}
              onDelete={() => handleSubOptionDelete(index)}
              depth={depth + 1}
              choiceLibrary={choiceLibrary}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================
// Composant pour une sous-option (contient plusieurs choix)
// ============================================
const SubOptionEditor = ({ subOption, onChange, onDelete, depth = 0, choiceLibrary = [] }) => {
  const [expanded, setExpanded] = useState(true);
  const bgColor = depth === 0 ? 'bg-purple-50' : depth === 1 ? 'bg-pink-50' : depth === 2 ? 'bg-amber-50' : 'bg-emerald-50';

  const handleAddChoice = () => {
    const newChoice = {
      id: `choice_${Date.now()}`,
      name: '',
      price: 0,
      image_url: '',
      sub_options: []
    };
    onChange({
      ...subOption,
      choices: [...(subOption.choices || []), newChoice]
    });
  };

  const handleChoiceChange = (index, updatedChoice) => {
    const newChoices = [...(subOption.choices || [])];
    newChoices[index] = updatedChoice;
    onChange({ ...subOption, choices: newChoices });
  };

  const handleChoiceDelete = (index) => {
    if (subOption.choices.length > 1) {
      const newChoices = subOption.choices.filter((_, i) => i !== index);
      onChange({ ...subOption, choices: newChoices });
    }
  };

  return (
    <div className={`${bgColor} rounded-lg p-3 border`}>
      {/* Header de la sous-option */}
      <div className="flex items-center gap-2 mb-2">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-gray-500"
        >
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        
        <input
          type="text"
          value={subOption.name}
          onChange={(e) => onChange({ ...subOption, name: e.target.value })}
          className="flex-1 px-3 py-1.5 border rounded text-sm font-medium"
          placeholder="Nom de la sous-option (ex: Boisson, Accompagnement)"
        />
        
        <select
          value={subOption.type}
          onChange={(e) => onChange({ ...subOption, type: e.target.value })}
          className="px-2 py-1.5 border rounded text-xs"
        >
          <option value="single">Unique</option>
          <option value="multiple">Multiple</option>
        </select>
        
        <label className="flex items-center text-xs">
          <input
            type="checkbox"
            checked={subOption.is_required}
            onChange={(e) => onChange({ ...subOption, is_required: e.target.checked })}
            className="mr-1"
          />
          Obligatoire
        </label>
        
        <Button type="button" variant="danger" size="sm" onClick={onDelete}>
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>

      {/* Choix de la sous-option */}
      {expanded && (
        <div className="ml-4 space-y-2">
          {(subOption.choices || []).map((choice, index) => (
            <SubOptionChoiceEditor
              key={choice.id || index}
              choice={choice}
              onChange={(updated) => handleChoiceChange(index, updated)}
              onDelete={() => handleChoiceDelete(index)}
              depth={depth}
              choiceLibrary={choiceLibrary}
            />
          ))}
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddChoice}
            className="w-full"
          >
            <Plus className="w-3 h-3 mr-1" />
            Ajouter un choix
          </Button>
        </div>
      )}
    </div>
  );
};

// ============================================
// Composant principal exporté - utilisé dans OptionModal pour un choix principal
// ============================================
export const NestedSubOptionsEditor = ({ choice, onChange, choiceLibrary = [] }) => {
  const [showSubOptions, setShowSubOptions] = useState(
    choice.sub_options && choice.sub_options.length > 0
  );

  const handleAddSubOption = () => {
    const newSubOption = {
      id: `sub_${Date.now()}`,
      name: '',
      type: 'single',
      is_required: false,
      choices: [{ id: `choice_${Date.now()}`, name: '', price: 0, image_url: '', sub_options: [] }]
    };
    onChange({
      ...choice,
      sub_options: [...(choice.sub_options || []), newSubOption]
    });
    setShowSubOptions(true);
  };

  const handleSubOptionChange = (index, updatedSubOption) => {
    const newSubOptions = [...(choice.sub_options || [])];
    newSubOptions[index] = updatedSubOption;
    onChange({ ...choice, sub_options: newSubOptions });
  };

  const handleSubOptionDelete = (index) => {
    const newSubOptions = (choice.sub_options || []).filter((_, i) => i !== index);
    onChange({ ...choice, sub_options: newSubOptions });
    if (newSubOptions.length === 0) setShowSubOptions(false);
  };

  const hasSubOptions = choice.sub_options && choice.sub_options.length > 0;

  return (
    <div className="mt-2">
      {/* Bouton pour ajouter des sous-options conditionnelles */}
      {!hasSubOptions && (
        <button
          type="button"
          onClick={handleAddSubOption}
          className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1"
        >
          <Plus className="w-3 h-3" />
          Ajouter des sous-options conditionnelles
        </button>
      )}

      {/* Liste des sous-options */}
      {hasSubOptions && (
        <div className="space-y-2 mt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-purple-700">
              ↳ Sous-options si "{choice.name}" est sélectionné:
            </span>
            <button
              type="button"
              onClick={() => setShowSubOptions(!showSubOptions)}
              className="text-xs text-gray-500"
            >
              {showSubOptions ? 'Masquer' : 'Afficher'}
            </button>
          </div>

          {showSubOptions && (
            <div className="space-y-2">
              {choice.sub_options.map((subOption, index) => (
                <SubOptionEditor
                  key={subOption.id || index}
                  subOption={subOption}
                  onChange={(updated) => handleSubOptionChange(index, updated)}
                  onDelete={() => handleSubOptionDelete(index)}
                  depth={0}
                  choiceLibrary={choiceLibrary}
                />
              ))}
              
              <button
                type="button"
                onClick={handleAddSubOption}
                className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1 ml-4"
              >
                <Plus className="w-3 h-3" />
                Ajouter une autre sous-option
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NestedSubOptionsEditor;
