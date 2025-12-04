/**
 * Anti-Triche - Surprise du Jour
 * Page 4/6 du module
 */
import React, { useState, useEffect } from 'react';
import { getAntiCheatLogs } from '../services/surpriseDuJour';
import { SurpriseDuJourTabs } from '../components/SurpriseDuJourTabs';

const SurpriseDuJourAntiCheat = () => {
  const [logs, setLogs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('multiple_spins');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await getAntiCheatLogs(100);
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'multiple_spins', label: '🔴 Spins multiples même jour', data: logs?.multiple_spins_same_day || [] },
    { id: 'multiple_jackpots', label: '🎰 Jackpots multiples', data: logs?.multiple_jackpots || [] },
    { id: 'suspicious_ips', label: '🌐 IPs suspectes', data: logs?.suspicious_ips || [] }
  ];

  const activeTabData = tabs.find(t => t.id === activeTab);

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
          🛡️ Anti-Triche
        </h2>
        <p className="text-sm text-gray-600">
          Détection des comportements suspects et de la triche
        </p>
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 mb-1">Spins Multiples</p>
              <p className="text-2xl font-bold text-red-700">
                {logs?.multiple_spins_same_day?.length || 0}
              </p>
            </div>
            <div className="text-3xl">🔴</div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 mb-1">Jackpots Suspects</p>
              <p className="text-2xl font-bold text-yellow-700">
                {logs?.multiple_jackpots?.length || 0}
              </p>
            </div>
            <div className="text-3xl">🎰</div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 mb-1">IPs Suspectes</p>
              <p className="text-2xl font-bold text-orange-700">
                {logs?.suspicious_ips?.length || 0}
              </p>
            </div>
            <div className="text-3xl">🌐</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b">
          <div className="flex">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-medium border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
                <span className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs">
                  {tab.data.length}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Multiple Spins */}
          {activeTab === 'multiple_spins' && (
            <div>
              {activeTabData.data.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="pb-2">User ID</th>
                      <th className="pb-2">Date</th>
                      <th className="pb-2">Nombre de spins</th>
                      <th className="pb-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeTabData.data.map((item, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="py-3">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                            {item._id.user_id.substring(0, 12)}...
                          </code>
                        </td>
                        <td className="py-3">{item._id.date}</td>
                        <td className="py-3">
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded font-bold">
                            {item.count}
                          </span>
                        </td>
                        <td className="py-3">
                          <button className="text-red-600 hover:text-red-800 text-sm">
                            🚫 Bloquer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  ✅ Aucune activité suspecte détectée
                </div>
              )}
            </div>
          )}

          {/* Multiple Jackpots */}
          {activeTab === 'multiple_jackpots' && (
            <div>
              {activeTabData.data.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="pb-2">User ID</th>
                      <th className="pb-2">Nombre de jackpots (12h)</th>
                      <th className="pb-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeTabData.data.map((item, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="py-3">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                            {item._id.substring(0, 12)}...
                          </code>
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded font-bold">
                            {item.count}
                          </span>
                        </td>
                        <td className="py-3">
                          <button className="text-yellow-600 hover:text-yellow-800 text-sm">
                            ⚠️ Surveiller
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  ✅ Aucun jackpot suspect
                </div>
              )}
            </div>
          )}

          {/* Suspicious IPs */}
          {activeTab === 'suspicious_ips' && (
            <div>
              {activeTabData.data.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="pb-2">IP Address</th>
                      <th className="pb-2">Utilisateurs uniques</th>
                      <th className="pb-2">Total spins</th>
                      <th className="pb-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeTabData.data.map((item, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="py-3">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                            {item._id}
                          </code>
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                            {item.users?.length || 0}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded font-bold">
                            {item.count}
                          </span>
                        </td>
                        <td className="py-3">
                          <button className="text-orange-600 hover:text-orange-800 text-sm">
                            🔒 Bloquer IP
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  ✅ Aucune IP suspecte
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Refresh Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={loadLogs}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          🔄 Actualiser
        </button>
      </div>
    </div>
  );
};

export default SurpriseDuJourAntiCheat;