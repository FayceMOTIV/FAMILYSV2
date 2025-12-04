/**
 * Paramètres - Surprise du Jour
 * Page 5/6 du module
 */
import React, { useState } from 'react';
import { SurpriseDuJourTabs } from '../components/SurpriseDuJourTabs';

const SurpriseDuJourSettings = () => {
  const [settings, setSettings] = useState({
    module_active: true,
    reset_time: '00:00',
    reward_expiration_days: 7,
    jackpot_limit_hours: 12,
    notification_jackpot_message: '🎉 Quelqu\'un vient de gagner un Menu offert ! Tourne la roue maintenant 🎰',
    notification_win_message: '🎁 Bravo ! Vous avez gagné {{reward}} !',
    allow_multiple_devices: false,
    require_device_id: true,
    log_ip_addresses: true
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // TODO: Appeler l'API pour sauvegarder les paramètres
    console.log('Sauvegarde des paramètres:', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🎰 Surprise du Jour
        </h1>
        <p className="text-gray-600">
          Gestion du module de jeu quotidien
        </p>
      </div>

      {/* Tabs Navigation */}
      <SurpriseDuJourTabs />

      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          ⚙️ Paramètres
        </h2>
        <p className="text-sm text-gray-600">
          Configuration générale du module Surprise du Jour
        </p>
      </div>

      {/* Success Message */}
      {saved && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
          ✅ Paramètres sauvegardés avec succès
        </div>
      )}

      <div className="space-y-6">
        {/* Module Activation */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">🎮 Activation du Module</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Module Surprise du Jour</p>
              <p className="text-sm text-gray-600">Activer ou désactiver le jeu pour tous les utilisateurs</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.module_active}
                onChange={(e) => setSettings({...settings, module_active: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Timing */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">⏰ Configuration Temporelle</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Heure de réinitialisation quotidienne</label>
              <input
                type="time"
                value={settings.reset_time}
                onChange={(e) => setSettings({...settings, reset_time: e.target.value})}
                className="border rounded px-3 py-2 w-48"
              />
              <p className="text-sm text-gray-600 mt-1">Par défaut: Minuit (00:00)</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Durée de validité des récompenses (jours)</label>
              <input
                type="number"
                min="1"
                max="30"
                value={settings.reward_expiration_days}
                onChange={(e) => setSettings({...settings, reward_expiration_days: parseInt(e.target.value)})}
                className="border rounded px-3 py-2 w-48"
              />
              <p className="text-sm text-gray-600 mt-1">Les récompenses expirent après ce délai</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Délai minimum entre jackpots (heures)</label>
              <input
                type="number"
                min="1"
                max="48"
                value={settings.jackpot_limit_hours}
                onChange={(e) => setSettings({...settings, jackpot_limit_hours: parseInt(e.target.value)})}
                className="border rounded px-3 py-2 w-48"
              />
              <p className="text-sm text-gray-600 mt-1">Empêche les utilisateurs d'obtenir plusieurs jackpots trop rapidement</p>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">🔔 Messages de Notifications</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Message jackpot (notification globale)</label>
              <textarea
                value={settings.notification_jackpot_message}
                onChange={(e) => setSettings({...settings, notification_jackpot_message: e.target.value})}
                className="w-full border rounded px-3 py-2"
                rows="2"
              />
              <p className="text-sm text-gray-600 mt-1">Affiché à tous quand quelqu'un gagne un jackpot</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Message victoire (notification individuelle)</label>
              <textarea
                value={settings.notification_win_message}
                onChange={(e) => setSettings({...settings, notification_win_message: e.target.value})}
                className="w-full border rounded px-3 py-2"
                rows="2"
              />
              <p className="text-sm text-gray-600 mt-1">
                Variables disponibles: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{'{{reward}}'}</code>, <code className="bg-gray-100 px-2 py-1 rounded text-xs">{'{{expiration}}'}</code>
              </p>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">🔒 Sécurité et Anti-Triche</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Autoriser plusieurs appareils</p>
                <p className="text-sm text-gray-600">Permettre à un utilisateur de jouer depuis différents appareils</p>
              </div>
              <input
                type="checkbox"
                checked={settings.allow_multiple_devices}
                onChange={(e) => setSettings({...settings, allow_multiple_devices: e.target.checked})}
                className="h-5 w-5"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Exiger l'ID d'appareil</p>
                <p className="text-sm text-gray-600">Obligation de fournir un device_id pour jouer</p>
              </div>
              <input
                type="checkbox"
                checked={settings.require_device_id}
                onChange={(e) => setSettings({...settings, require_device_id: e.target.checked})}
                className="h-5 w-5"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Enregistrer les adresses IP</p>
                <p className="text-sm text-gray-600">Tracker les IPs pour détecter les abus</p>
              </div>
              <input
                type="checkbox"
                checked={settings.log_ip_addresses}
                onChange={(e) => setSettings({...settings, log_ip_addresses: e.target.checked})}
                className="h-5 w-5"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            💾 Sauvegarder les paramètres
          </button>
        </div>
      </div>
    </div>
  );
};

export default SurpriseDuJourSettings;