import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { Input, Label, Select } from '../components/Input';
import { Save, Clock, Store, Palette, CreditCard, Percent } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://resto-admin-11.preview.emergentagent.com';

export const Settings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/admin/settings`);
      setSettings(response.data);
    } catch (error) {
      console.error('Error loading settings:', error);
      // Set default settings if none exist
      setSettings({
        name: "Family's Bourg-en-Bresse",
        email: 'contact@familys.app',
        phone: '04 74 XX XX XX',
        address: '123 Avenue de la Gare, 01000 Bourg-en-Bresse',
        primary_color: '#C62828',
        secondary_color: '#FFD54F',
        order_cutoff_minutes: 20,
        preparation_time_minutes: 15,
        enable_delivery: true,
        enable_takeaway: true,
        enable_onsite: true,
        enable_reservations: true,
        loyalty_percentage: 5.0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${API_URL}/api/v1/admin/settings`, settings);
      alert('✅ Paramètres enregistrés avec succès !');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('❌ Erreur lors de l\'enregistrement des paramètres');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Header title="⚙️ Paramètres" subtitle="Configuration du restaurant" />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="⚙️ Paramètres" subtitle="Configuration du restaurant" />
      
      <div className="p-6 space-y-6">
        {/* Informations du restaurant */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardTitle className="flex items-center gap-2">
              <Store className="w-5 h-5" />
              Informations du restaurant
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nom du restaurant *</Label>
                <Input
                  id="name"
                  value={settings.name || ''}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  placeholder="Ex: Family's Bourg-en-Bresse"
                />
              </div>
              <div>
                <Label htmlFor="phone">Téléphone *</Label>
                <Input
                  id="phone"
                  value={settings.phone || ''}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  placeholder="Ex: 04 74 XX XX XX"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email || ''}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  placeholder="Ex: contact@familys.app"
                />
              </div>
              <div>
                <Label htmlFor="address">Adresse *</Label>
                <Input
                  id="address"
                  value={settings.address || ''}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  placeholder="Ex: 123 Avenue de la Gare, 01000"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Paramètres de commande */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Gestion des commandes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Temps de préparation */}
              <div>
                <Label htmlFor="preparation_time">
                  ⏱️ Temps de préparation (créneaux)
                </Label>
                <Select
                  id="preparation_time"
                  value={settings.preparation_time_minutes || 15}
                  onChange={(e) => setSettings({ 
                    ...settings, 
                    preparation_time_minutes: parseInt(e.target.value) 
                  })}
                >
                  <option value="5">5 minutes</option>
                  <option value="10">10 minutes</option>
                  <option value="15">15 minutes</option>
                  <option value="20">20 minutes</option>
                  <option value="25">25 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">1 heure</option>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  📋 Les clients pourront choisir des créneaux de récupération espacés de ce temps
                </p>
              </div>

              {/* Délai de commande */}
              <div>
                <Label htmlFor="cutoff_time">
                  🚫 Délai minimum de commande
                </Label>
                <Select
                  id="cutoff_time"
                  value={settings.order_cutoff_minutes || 20}
                  onChange={(e) => setSettings({ 
                    ...settings, 
                    order_cutoff_minutes: parseInt(e.target.value) 
                  })}
                >
                  <option value="10">10 minutes</option>
                  <option value="15">15 minutes</option>
                  <option value="20">20 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">1 heure</option>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  ⏰ Temps minimum avant qu'une commande puisse être récupérée
                </p>
              </div>
            </div>

            {/* Types de commande activés */}
            <div>
              <Label>Types de commande activés</Label>
              <div className="grid grid-cols-3 gap-4 mt-2">
                <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={settings.enable_takeaway}
                    onChange={(e) => setSettings({ ...settings, enable_takeaway: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">🎒 À emporter</span>
                </label>
                <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={settings.enable_delivery}
                    onChange={(e) => setSettings({ ...settings, enable_delivery: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">🚚 Livraison</span>
                </label>
                <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={settings.enable_onsite}
                    onChange={(e) => setSettings({ ...settings, enable_onsite: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">🍽️ Sur place</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Programme de fidélité */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
            <CardTitle className="flex items-center gap-2">
              <Percent className="w-5 h-5" />
              Programme de fidélité
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="loyalty">💰 Pourcentage de cashback</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="loyalty"
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={settings.loyalty_percentage || 5}
                  onChange={(e) => setSettings({ 
                    ...settings, 
                    loyalty_percentage: parseFloat(e.target.value) 
                  })}
                  className="w-32"
                />
                <span className="text-gray-600">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                🎁 Pourcentage du montant de chaque commande crédité sur la carte de fidélité du client
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Personnalisation */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50">
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Personnalisation de l'application
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primary_color">🎨 Couleur principale</Label>
                <div className="flex items-center gap-2">
                  <input
                    id="primary_color"
                    type="color"
                    value={settings.primary_color || '#C62828'}
                    onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                    className="w-16 h-10 rounded cursor-pointer"
                  />
                  <Input
                    value={settings.primary_color || '#C62828'}
                    onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                    placeholder="#C62828"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="secondary_color">🎨 Couleur secondaire</Label>
                <div className="flex items-center gap-2">
                  <input
                    id="secondary_color"
                    type="color"
                    value={settings.secondary_color || '#FFD54F'}
                    onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                    className="w-16 h-10 rounded cursor-pointer"
                  />
                  <Input
                    value={settings.secondary_color || '#FFD54F'}
                    onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                    placeholder="#FFD54F"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bouton Enregistrer */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 text-lg font-bold"
          >
            <Save className="w-5 h-5 mr-2" />
            {saving ? 'Enregistrement...' : 'Enregistrer les paramètres'}
          </Button>
        </div>
      </div>
    </div>
  );
};
