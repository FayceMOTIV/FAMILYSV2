import React, { useState } from 'react';
import { Upload, X, Loader } from 'lucide-react';
import { uploadAPI } from '../services/api';

export const ImageUpload = ({ currentImage, onImageChange, label = "Image", folder = "images" }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage || null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Vérifier que c'est une image
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image');
      return;
    }

    // Preview local
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload vers Firebase Storage
    setUploading(true);
    try {
      const response = await uploadAPI.image(file, folder);
      const imageUrl = response.data.url;
      onImageChange(imageUrl);
      setPreview(imageUrl);
      alert('✅ Image uploadée!');
    } catch (error) {
      console.error('Erreur upload:', error);
      alert('Erreur lors de l\'upload de l\'image');
      setPreview(currentImage);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onImageChange('');
  };

  // Sync preview with currentImage prop
  React.useEffect(() => {
    setPreview(currentImage || null);
  }, [currentImage]);

  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
      
      {preview ? (
        <div className="relative">
          <img 
            src={preview} 
            alt="Preview" 
            className="w-full h-48 object-cover rounded-lg border-2 border-gray-300"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="image-upload"
            disabled={uploading}
          />
          <label htmlFor="image-upload" className="cursor-pointer">
            {uploading ? (
              <div className="flex flex-col items-center">
                <Loader className="w-12 h-12 text-primary animate-spin mb-2" />
                <p className="text-sm text-gray-600">Upload en cours...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="w-12 h-12 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-1">Cliquez pour uploader une image</p>
                <p className="text-xs text-gray-400">PNG, JPG, WEBP jusqu'à 10MB</p>
              </div>
            )}
          </label>
        </div>
      )}

      {/* URL manuelle (optionnel) */}
      <div className="mt-3">
        <input
          type="text"
          value={typeof preview === 'string' && !preview.startsWith('data:') ? preview : ''}
          onChange={(e) => {
            setPreview(e.target.value);
            onImageChange(e.target.value);
          }}
          placeholder="Ou collez une URL d'image..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>
    </div>
  );
};
