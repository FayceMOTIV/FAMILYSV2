/**
 * Outil de Test - Surprise du Jour
 * Page 6/6 du module
 */
import React, { useState } from 'react';
import { testSpin } from '../services/surpriseDuJour';
import { SurpriseDuJourTabs } from '../components/SurpriseDuJourTabs';

const REWARD_TYPES = [
  { value: null, label: 'Aléatoire', icon: '🎲' },
  { value: 'product', label: 'Produit', icon: '🍕' },
  { value: 'menu', label: 'Menu', icon: '🍽️' },
  { value: 'discount_percent', label: '% réduction', icon: '💯' },
  { value: 'discount_amount', label: 'Montant fixe', icon: '💰' },
  { value: 'cashback', label: 'Cashback', icon: '💸' },
  { value: 'badge', label: 'Badge', icon: '🏅' }
];

const SurpriseDuJourTest = () => {
  const [userId, setUserId] = useState('TEST_USER_' + Date.now());
  const [forceType, setForceType] = useState(null);
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [testHistory, setTestHistory] = useState([]);

  const handleTest = async () => {
    setTesting(true);
    setError(null);
    setResult(null);

    try {
      const response = await testSpin(userId, forceType);
      setResult(response);
      setTestHistory([{ 
        timestamp: new Date(),
        userId,
        forceType,
        result: response 
      }, ...testHistory.slice(0, 4)]);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setTesting(false);
    }
  };

  const handleNewTest = () => {
    setUserId('TEST_USER_' + Date.now());
    setResult(null);
    setError(null);
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
          🧪 Outil de Test
        </h2>
        <p className="text-sm text-gray-600">
          Simuler des spins et tester le fonctionnement du module
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">🎮 Lancer un Test</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">User ID de test</label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="TEST_USER_123"
              />
              <p className="text-xs text-gray-600 mt-1">
                ⚠️ Ne consomme pas le quota journalier
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Type de récompense</label>
              <select
                value={forceType || ''}
                onChange={(e) => setForceType(e.target.value || null)}
                className="w-full border rounded px-3 py-2"
              >
                {REWARD_TYPES.map(type => (
                  <option key={type.value || 'random'} value={type.value || ''}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-600 mt-1">
                Forcer un type spécifique ou laisser aléatoire
              </p>
            </div>

            <button
              onClick={handleTest}
              disabled={testing}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {testing ? '⏳ Test en cours...' : '🚀 Lancer le test'}
            </button>

            {result && (
              <button
                onClick={handleNewTest}
                className="w-full py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                🔄 Nouveau test
              </button>
            )}
          </div>
        </div>

        {/* Result */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">📊 Résultat</h2>
          
          {!result && !error && (
            <div className="text-center py-12 text-gray-400">
              <div className="text-6xl mb-4">🎰</div>
              <p>Lancez un test pour voir le résultat</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium">❌ Erreur</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {result.success ? (
                <>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <div className="text-5xl mb-2">🎉</div>
                    <p className="text-green-800 font-bold text-lg">
                      {result.message}
                    </p>
                  </div>

                  {result.reward && (
                    <div className="border rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium capitalize">
                          {result.reward.reward_type.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Valeur:</span>
                        <span className="font-medium">{result.reward.reward_value}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Code:</span>
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                          {result.reward.code}
                        </code>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Expire le:</span>
                        <span className="font-medium text-sm">
                          {new Date(result.reward.expires_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reward ID:</span>
                        <span className="text-xs text-gray-500 font-mono">
                          {result.reward.id}
                        </span>
                      </div>
                    </div>
                  )}

                  {result.note && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
                      ℹ️ {result.note}
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-orange-800">{result.message}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Test History */}
      {testHistory.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">📜 Historique des Tests</h2>
          <div className="space-y-2">
            {testHistory.map((test, idx) => (
              <div key={idx} className="flex items-center justify-between border-b pb-2">
                <div>
                  <span className="text-sm text-gray-600">
                    {test.timestamp.toLocaleTimeString('fr-FR')}
                  </span>
                  <span className="ml-2 text-sm">{test.userId}</span>
                </div>
                <div>
                  {test.forceType ? (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Forcé: {test.forceType}
                    </span>
                  ) : (
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                      Aléatoire
                    </span>
                  )}
                  {test.result.success && (
                    <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      ✓ {test.result.reward?.reward_type}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SurpriseDuJourTest;