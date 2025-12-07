import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { Input, Label, Select, Textarea } from '../components/Input';
import { Save, Clock, Store, Palette, CreditCard, Percent, Share2, Calendar, Link as LinkIcon, X, Lock, Smartphone, Image, Upload, Sparkles } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

const DAYS = [
  { key: 'monday', label: 'Lundi' },
  { key: 'tuesday', label: 'Mardi' },
  { key: 'wednesday', label: 'Mercredi' },
  { key: 'thursday', label: 'Jeudi' },
  { key: 'friday', label: 'Vendredi' },
  { key: 'saturday', label: 'Samedi' },
  { key: 'sunday', label: 'Dimanche' }
];

export const Settings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/fb/settings`);
      setSettings({
        ...(response.data.settings || response.data),
        social_media: response.data.social_media || {},
        service_links: response.data.service_links || {},
        opening_hours: response.data.opening_hours || {},
        order_hours: response.data.order_hours || {},
        home_hero_image: response.data.hero_image_url || response.data.home_hero_image || '',
        home_tagline: response.data.home_tagline || ''
      });
    } catch (error) {
      console.error('Error loading settings:', error);
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
        loyalty_percentage: 5.0,
        social_media: {},
        service_links: {},
        opening_hours: {},
        order_hours: {},
        home_hero_image: '',
        home_tagline: 'Prêt à te régaler ?'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const dataToSave = { ...settings, hero_image_url: settings.home_hero_image || settings.hero_image_url };
      await axios.put(`${API_URL}/api/v1/fb/settings`, dataToSave);

      alert('✅ Paramètres enregistrés avec succès !');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('❌ Erreur lors de l\'enregistrement des paramètres');
    } finally {
      setSaving(false);
    }
  };

  const updateSocialMedia = (platform, value) => {
    setSettings({
      ...settings,
      social_media: {
        ...settings.social_media,
        [platform]: value
      }
    });
  };

  const updateServiceLinks = (service, value) => {
    setSettings({
      ...settings,
      service_links: {
        ...settings.service_links,
        [service]: value
      }
    });
  };

  const updateHours = (day, type, field, value) => {
    const hoursField = type === 'opening' ? 'opening_hours' : 'order_hours';
    setSettings({
      ...settings,
      [hoursField]: {
        ...settings[hoursField],
        [day]: {
          ...settings[hoursField][day],
          [field]: value
        }
      }
    });
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

        {/* Page d'accueil de l'app */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              📱 Page d'accueil de l'application
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Image Hero */}
            <div>
              <Label className="mb-2 block">🖼️ Image de fond (Header)</Label>
              <p className="text-xs text-gray-500 mb-3">
                Cette image s'affiche en haut de la page d'accueil avec un dégradé. Format recommandé : <strong>1200x600px</strong>, JPG (max 300Ko).
              </p>
              
              <div className="flex gap-4 items-start">
                {/* Preview de l'image */}
                <div className="w-48 h-32 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center relative">
                  {settings.home_hero_image ? (
                    <>
                      <img 
                        src={settings.home_hero_image.startsWith('/') ? `${API_URL}${settings.home_hero_image}` : settings.home_hero_image}
                        alt="Hero"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setSettings({ ...settings, home_hero_image: '' })}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <div className="text-center text-gray-400">
                      <Image className="w-8 h-8 mx-auto mb-1" />
                      <span className="text-xs">Aucune image</span>
                    </div>
                  )}
                </div>
                
                {/* Upload */}
                <div className="flex-1">
                  <div className="flex gap-2 mb-2">
                    <label className="flex-1 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const formData = new FormData();
                            formData.append('file', file);
                            try {
                              const res = await axios.post(`${API_URL}/api/v1/fb/upload/branding`, formData, {
                                headers: { 'Content-Type': 'multipart/form-data' }
                              });
                              setSettings({ ...settings, home_hero_image: res.data.url, hero_image_url: res.data.url });
                            } catch (err) {
                              alert('Erreur upload image');
                            }
                          }
                        }}
                      />
                      <div className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors">
                        <Upload className="w-4 h-4" />
                        <span className="text-sm font-medium">Uploader une image</span>
                      </div>
                    </label>
                  </div>
                  <p className="text-xs text-gray-400">ou coller une URL :</p>
                  <Input
                    value={settings.home_hero_image || ''}
                    onChange={(e) => setSettings({ ...settings, home_hero_image: e.target.value })}
                    placeholder="https://exemple.com/image.jpg"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Phrase d'accroche */}
            <div>
              <Label htmlFor="home_tagline">✨ Phrase d'accroche</Label>
              <p className="text-xs text-gray-500 mb-2">
                Cette phrase s'affiche sous le message de salutation "Bonjour [Prénom] !"
              </p>
              <Input
                id="home_tagline"
                value={settings.home_tagline || ''}
                onChange={(e) => setSettings({ ...settings, home_tagline: e.target.value })}
                placeholder="Ex: Prêt à te régaler ? 🍔"
                maxLength={100}
              />
              <p className="text-xs text-gray-400 mt-1 text-right">
                {(settings.home_tagline || '').length}/100 caractères
              </p>
            </div>

            {/* Preview */}
            <div className="border rounded-xl overflow-hidden bg-gray-900">
              <div className="relative h-40">
                {settings.home_hero_image ? (
                  <img 
                    src={settings.home_hero_image.startsWith('/') ? `${API_URL}${settings.home_hero_image}` : settings.home_hero_image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-amber-400 to-red-500 flex items-center justify-center">
                    <span className="text-6xl">🍔</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-amber-50" />
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <p className="text-xl font-bold text-white drop-shadow-lg">Bonjour John ! ☀️</p>
                  <p className="text-sm text-gray-800 mt-1 bg-white/70 rounded-full px-3 py-1 inline-block">
                    {settings.home_tagline || 'Prêt à te régaler ?'}
                  </p>
                </div>
              </div>
              <div className="bg-amber-50 px-4 py-2 text-center">
                <span className="text-xs text-gray-500">👆 Aperçu de la page d'accueil</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assistant IA */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              🤖 Assistant IA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="openai_api_key">🔑 Clé API OpenAI</Label>
              <p className="text-xs text-gray-500 mb-2">
                Nécessaire pour utiliser l'assistant IA (analyse des ventes, suggestions promos, chat).
                Obtenez votre clé sur <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">platform.openai.com</a>
              </p>
              <div className="relative">
                <Input
                  id="openai_api_key"
                  type="password"
                  value={settings.openai_api_key || ''}
                  onChange={(e) => setSettings({ ...settings, openai_api_key: e.target.value })}
                  placeholder="sk-..."
                  className="font-mono"
                />
              </div>
              {settings.openai_api_key && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  ✅ Clé configurée ({settings.openai_api_key.slice(0, 7)}...{settings.openai_api_key.slice(-4)})
                </p>
              )}
            </div>

            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <p className="text-sm font-medium text-indigo-800 mb-2">💡 Fonctionnalités IA disponibles :</p>
              <ul className="text-xs text-indigo-700 space-y-1">
                <li>• <strong>Chat IA</strong> - Posez des questions sur votre activité</li>
                <li>• <strong>Analyse des ventes</strong> - Insights et recommandations automatiques</li>
                <li>• <strong>Suggestions promos</strong> - L'IA propose des promotions optimales</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Horaires */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Horaires du restaurant
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-3">🏪 Horaires d'ouverture (affichés dans l'app)</h3>
              <p className="text-xs text-gray-500 mb-3">Vous pouvez définir 2 plages horaires par jour (ex: 11h-14h et 18h-23h)</p>
              <div className="space-y-3">
                {DAYS.map(day => (
                  <div key={day.key} className="border rounded-lg p-3 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <label className="font-bold text-sm">{day.label}</label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={settings.opening_hours[day.key]?.closed || false}
                          onChange={(e) => {
                            const newHours = {...settings.opening_hours};
                            newHours[day.key] = { ...newHours[day.key], closed: e.target.checked };
                            setSettings({...settings, opening_hours: newHours});
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-red-600 font-medium">Fermé</span>
                      </label>
                    </div>
                    {!settings.opening_hours[day.key]?.closed && (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            type="time"
                            placeholder="Ouverture matin"
                            value={settings.opening_hours[day.key]?.open1 || ''}
                            onChange={(e) => {
                              const newHours = {...settings.opening_hours};
                              newHours[day.key] = { ...newHours[day.key], open1: e.target.value };
                              setSettings({...settings, opening_hours: newHours});
                            }}
                          />
                          <Input
                            type="time"
                            placeholder="Fermeture matin"
                            value={settings.opening_hours[day.key]?.close1 || ''}
                            onChange={(e) => {
                              const newHours = {...settings.opening_hours};
                              newHours[day.key] = { ...newHours[day.key], close1: e.target.value };
                              setSettings({...settings, opening_hours: newHours});
                            }}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            type="time"
                            placeholder="Ouverture soir (optionnel)"
                            value={settings.opening_hours[day.key]?.open2 || ''}
                            onChange={(e) => {
                              const newHours = {...settings.opening_hours};
                              newHours[day.key] = { ...newHours[day.key], open2: e.target.value };
                              setSettings({...settings, opening_hours: newHours});
                            }}
                          />
                          <Input
                            type="time"
                            placeholder="Fermeture soir (optionnel)"
                            value={settings.opening_hours[day.key]?.close2 || ''}
                            onChange={(e) => {
                              const newHours = {...settings.opening_hours};
                              newHours[day.key] = { ...newHours[day.key], close2: e.target.value };
                              setSettings({...settings, opening_hours: newHours});
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold text-lg mb-3">📱 Horaires de commande (différents si nécessaire)</h3>
              <p className="text-sm text-gray-600 mb-3">Les clients ne pourront commander que pendant ces horaires (2 plages possibles)</p>
              <div className="space-y-3">
                {DAYS.map(day => (
                  <div key={day.key} className="border rounded-lg p-3 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <label className="font-bold text-sm">{day.label}</label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={settings.order_hours[day.key]?.disabled || false}
                          onChange={(e) => {
                            const newHours = {...settings.order_hours};
                            newHours[day.key] = { ...newHours[day.key], disabled: e.target.checked };
                            setSettings({...settings, order_hours: newHours});
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-red-600 font-medium">Désactivé</span>
                      </label>
                    </div>
                    {!settings.order_hours[day.key]?.disabled && (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            type="time"
                            placeholder="Début 1"
                            value={settings.order_hours[day.key]?.start1 || ''}
                            onChange={(e) => {
                              const newHours = {...settings.order_hours};
                              newHours[day.key] = { ...newHours[day.key], start1: e.target.value };
                              setSettings({...settings, order_hours: newHours});
                            }}
                          />
                          <Input
                            type="time"
                            placeholder="Fin 1"
                            value={settings.order_hours[day.key]?.end1 || ''}
                            onChange={(e) => {
                              const newHours = {...settings.order_hours};
                              newHours[day.key] = { ...newHours[day.key], end1: e.target.value };
                              setSettings({...settings, order_hours: newHours});
                            }}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            type="time"
                            placeholder="Début 2 (optionnel)"
                            value={settings.order_hours[day.key]?.start2 || ''}
                            onChange={(e) => {
                              const newHours = {...settings.order_hours};
                              newHours[day.key] = { ...newHours[day.key], start2: e.target.value };
                              setSettings({...settings, order_hours: newHours});
                            }}
                          />
                          <Input
                            type="time"
                            placeholder="Fin 2 (optionnel)"
                            value={settings.order_hours[day.key]?.end2 || ''}
                            onChange={(e) => {
                              const newHours = {...settings.order_hours};
                              newHours[day.key] = { ...newHours[day.key], end2: e.target.value };
                              setSettings({...settings, order_hours: newHours});
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Réseaux sociaux */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Réseaux sociaux
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">Ces liens apparaîtront sous forme d'icônes cliquables dans l'application mobile</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="facebook">🔵 Facebook</Label>
                <Input
                  id="facebook"
                  value={settings.social_media?.facebook || ''}
                  onChange={(e) => updateSocialMedia('facebook', e.target.value)}
                  placeholder="https://facebook.com/familysbourg"
                />
              </div>
              <div>
                <Label htmlFor="instagram">📷 Instagram</Label>
                <Input
                  id="instagram"
                  value={settings.social_media?.instagram || ''}
                  onChange={(e) => updateSocialMedia('instagram', e.target.value)}
                  placeholder="https://instagram.com/familysbourg"
                />
              </div>
              <div>
                <Label htmlFor="twitter">🐦 Twitter / X</Label>
                <Input
                  id="twitter"
                  value={settings.social_media?.twitter || ''}
                  onChange={(e) => updateSocialMedia('twitter', e.target.value)}
                  placeholder="https://twitter.com/familysbourg"
                />
              </div>
              <div>
                <Label htmlFor="tiktok">🎵 TikTok</Label>
                <Input
                  id="tiktok"
                  value={settings.social_media?.tiktok || ''}
                  onChange={(e) => updateSocialMedia('tiktok', e.target.value)}
                  placeholder="https://tiktok.com/@familysbourg"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liens services */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50">
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5" />
              Liens des services externes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">Gérez les liens de vos services de paiement et autres intégrations</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stripe">💳 Stripe</Label>
                <Input
                  id="stripe"
                  value={settings.service_links?.stripe || ''}
                  onChange={(e) => updateServiceLinks('stripe', e.target.value)}
                  placeholder="Dashboard Stripe URL"
                />
              </div>
              <div>
                <Label htmlFor="paypal">🅿️ PayPal</Label>
                <Input
                  id="paypal"
                  value={settings.service_links?.paypal || ''}
                  onChange={(e) => updateServiceLinks('paypal', e.target.value)}
                  placeholder="Dashboard PayPal URL"
                />
              </div>
              <div>
                <Label htmlFor="analytics">📊 Analytics</Label>
                <Input
                  id="analytics"
                  value={settings.service_links?.analytics || ''}
                  onChange={(e) => updateServiceLinks('analytics', e.target.value)}
                  placeholder="Google Analytics URL"
                />
              </div>
              <div>
                <Label htmlFor="delivery">🚚 Service de livraison</Label>
                <Input
                  id="delivery"
                  value={settings.service_links?.delivery || ''}
                  onChange={(e) => updateServiceLinks('delivery', e.target.value)}
                  placeholder="URL du service de livraison"
                />
              </div>
              <div>
                <Label htmlFor="apple_pay">🍎 Apple Pay</Label>
                <Input
                  id="apple_pay"
                  value={settings.service_links?.apple_pay || ''}
                  onChange={(e) => updateServiceLinks('apple_pay', e.target.value)}
                  placeholder="Lien Apple Pay"
                />
              </div>
              <div>
                <Label htmlFor="google_pay">🟢 Google Pay</Label>
                <Input
                  id="google_pay"
                  value={settings.service_links?.google_pay || ''}
                  onChange={(e) => updateServiceLinks('google_pay', e.target.value)}
                  placeholder="Lien Google Pay"
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
              <div>
                <Label htmlFor="preparation_time">⏱️ Temps de préparation (créneaux)</Label>
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

              <div>
                <Label htmlFor="cutoff_time">🚫 Délai minimum de commande</Label>
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

            <div>
              <Label>Types de commande activés</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
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

            {/* Options cashback supplémentaires */}
            <div className="border-t pt-4 mt-4">
              <Label className="mb-3 block">Options de calcul du cashback</Label>
              
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.loyalty_exclude_promos_from_calculation || false}
                    onChange={(e) => setSettings({
                      ...settings,
                      loyalty_exclude_promos_from_calculation: e.target.checked
                    })}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Ne pas prendre en compte les promos dans le calcul</p>
                    <p className="text-xs text-gray-500">
                      Si activé, le cashback sera calculé sur le montant AVANT application des promotions
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.auto_badges_enabled || false}
                    onChange={(e) => setSettings({
                      ...settings,
                      auto_badges_enabled: e.target.checked
                    })}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium text-gray-900">🤖 Laisser l'IA gérer les badges produits</p>
                    <p className="text-xs text-gray-500">
                      L'IA décidera automatiquement quels produits afficher avec des badges (Best Seller, Nouveau, etc.)
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Codes PIN Modes */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              🔐 Codes PIN des Modes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="mb-6 pb-6 border-b">
                <Label htmlFor="admin_pin">🔑 Code PIN Admin (Accès Back Office)</Label>
                <Input
                  id="admin_pin"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{4}"
                  maxLength="4"
                  value={settings.admin_pin || ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    if (value.length <= 4) {
                      setSettings({ ...settings, admin_pin: value });
                    }
                  }}
                  placeholder="••••"
                  className="text-center text-2xl tracking-widest font-bold max-w-xs"
                />
                <p className="text-xs text-gray-500 mt-1">Code principal pour accéder au back office complet</p>
              </div>
            <p className="text-sm text-gray-600 mb-4">
              Définissez des codes PIN à 4 chiffres pour sécuriser l'accès aux différents modes du back-office
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pin_orders_mode">🍽️ Mode Commande</Label>
                <Input
                  id="pin_orders_mode"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{4}"
                  maxLength="4"
                  value={settings.pin_orders_mode || ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    if (value.length <= 4) {
                      setSettings({ ...settings, pin_orders_mode: value });
                    }
                  }}
                  placeholder="••••"
                  className="text-center text-2xl tracking-widest font-bold"
                />
                <p className="text-xs text-gray-500 mt-1">Accès : Dashboard, Pause, Rupture</p>
              </div>
              <div>
                <Label htmlFor="pin_delivery_mode">🚚 Mode Livraison</Label>
                <Input
                  id="pin_delivery_mode"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{4}"
                  maxLength="4"
                  value={settings.pin_delivery_mode || ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    if (value.length <= 4) {
                      setSettings({ ...settings, pin_delivery_mode: value });
                    }
                  }}
                  placeholder="••••"
                  className="text-center text-2xl tracking-widest font-bold"
                />
                <p className="text-xs text-gray-500 mt-1">Accès : Gestion des livraisons</p>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-4">
              <p className="text-sm text-yellow-800">
                ⚠️ Notez ces codes en lieu sûr. Le personnel aura besoin de ces codes pour accéder aux modes.
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
        <div className="flex justify-end sticky bottom-4">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 text-lg font-bold shadow-lg"
          >
            <Save className="w-5 h-5 mr-2" />
            {saving ? 'Enregistrement...' : 'Enregistrer les paramètres'}
          </Button>
        </div>
      </div>
    </div>
  );
};
