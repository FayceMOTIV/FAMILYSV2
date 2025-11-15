import React, { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, Tag } from 'lucide-react';
import { Card, CardContent } from './Card';
import { Button } from './Button';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://chefs-control.preview.emergentagent.com';

/**
 * Modal pour gérer l'image et le badge d'un produit
 */
export const ProductVisualModal = ({ product, isOpen, onClose, onSave }) => {
  const [imageUrl, setImageUrl] = useState(product?.image_url || '');
  const [badge, setBadge] = useState(product?.badge || '');
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  useEffect(() => {
    if (product) {
      setImageUrl(product.image_url || '');
      setBadge(product.badge || '');
    }
  }, [product]);

  const badges = [
    { value: '', label: 'Aucun badge', color: 'bg-gray-200' },
    { value: 'bestseller', label: '⭐ Best Seller', color: 'bg-yellow-400' },
    { value: 'nouveau', label: '✨ Nouveau', color: 'bg-blue-500' },
    { value: 'promo', label: '🔥 Promo', color: 'bg-red-500' },
    { value: 'cashback_booste', label: '⚡ Cashback x2', color: 'bg-gradient-to-r from-amber-500 to-yellow-500' }
  ];

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image');
      return;
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('L\'image est trop volumineuse (max 5MB)');
      return;
    }

    setUploading(true);
    setUploadedFile(file);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API_URL}/api/v1/admin/upload/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.url) {
        setImageUrl(response.data.url);
      }
    } catch (error) {
      console.error('Erreur upload:', error);
      alert('Erreur lors de l\'upload de l\'image');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      await axios.put(`${API_URL}/api/v1/admin/products/${product.id}`, {
        image_url: imageUrl,
        badge: badge || null
      });

      onSave({ ...product, image_url: imageUrl, badge: badge || null });
      onClose();
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Image & Badge - {product?.name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <CardContent className="p-6 space-y-6">
          {/* Upload d'image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <ImageIcon className="w-4 h-4 inline mr-2" />
              Image du produit
            </label>
            
            {/* Preview */}
            <div className="mb-4">
              {imageUrl ? (
                <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setImageUrl('')}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>

            {/* Input URL */}
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3"
            />

            {/* Upload button */}
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-50 border-2 border-blue-200 border-dashed rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
              >
                <Upload className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-600">
                  {uploading ? 'Upload en cours...' : 'Uploader une image'}
                </span>
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Formats acceptés : JPG, PNG, WebP (max 5MB)
            </p>
          </div>

          {/* Sélection du badge */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Tag className="w-4 h-4 inline mr-2" />
              Badge du produit
            </label>
            <div className="grid grid-cols-2 gap-3">
              {badges.map((b) => (
                <button
                  key={b.value}
                  onClick={() => setBadge(b.value)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    badge === b.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`${b.color} text-white px-3 py-1 rounded-full text-sm font-bold mb-2`}>
                    {b.label}
                  </div>
                  <p className="text-xs text-gray-600">{b.value || 'Aucun'}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1"
              disabled={uploading}
            >
              Enregistrer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
