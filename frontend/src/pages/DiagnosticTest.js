import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Page de diagnostic pour tester TOUS les boutons et événements
 */
const DiagnosticTest = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [testsPassed, setTestsPassed] = useState(0);
  const [testsFailed, setTestsFailed] = useState(0);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const newLog = { timestamp, message, type };
    setLogs(prev => [...prev, newLog]);
    console.log(`[DIAGNOSTIC ${type.toUpperCase()}] ${message}`);
    
    if (type === 'success') {
      setTestsPassed(prev => prev + 1);
    } else if (type === 'error') {
      setTestsFailed(prev => prev + 1);
    }
  };

  // Test 1: Click simple
  const testSimpleClick = () => {
    addLog('Test 1: Click simple - COMMENCÉ', 'info');
    try {
      addLog('Test 1: Click simple - ✅ RÉUSSI', 'success');
    } catch (error) {
      addLog(`Test 1: Click simple - ❌ ÉCHEC: ${error.message}`, 'error');
    }
  };

  // Test 2: Navigation React Router
  const testNavigation = () => {
    addLog('Test 2: Navigation React Router - COMMENCÉ', 'info');
    try {
      navigate('/menu');
      addLog('Test 2: Navigation vers /menu - ✅ RÉUSSI', 'success');
    } catch (error) {
      addLog(`Test 2: Navigation - ❌ ÉCHEC: ${error.message}`, 'error');
    }
  };

  // Test 3: State update
  const testStateUpdate = () => {
    addLog('Test 3: State Update - COMMENCÉ', 'info');
    try {
      const testState = Math.random();
      addLog(`Test 3: State Update (${testState}) - ✅ RÉUSSI`, 'success');
    } catch (error) {
      addLog(`Test 3: State Update - ❌ ÉCHEC: ${error.message}`, 'error');
    }
  };

  // Test 4: API Call
  const testApiCall = async () => {
    addLog('Test 4: API Call - COMMENCÉ', 'info');
    try {
      const response = await fetch('/api/v1/admin/categories');
      if (response.ok) {
        const data = await response.json();
        addLog(`Test 4: API Call - ✅ RÉUSSI (${data.categories?.length || 0} catégories)`, 'success');
      } else {
        addLog(`Test 4: API Call - ⚠️ Response ${response.status}`, 'warning');
      }
    } catch (error) {
      addLog(`Test 4: API Call - ❌ ÉCHEC: ${error.message}`, 'error');
    }
  };

  // Test 5: Touch Events (mobile)
  const testTouchEvent = (e) => {
    addLog('Test 5: Touch Event - COMMENCÉ', 'info');
    try {
      addLog(`Test 5: Touch Event détecté - ✅ RÉUSSI`, 'success');
    } catch (error) {
      addLog(`Test 5: Touch Event - ❌ ÉCHEC: ${error.message}`, 'error');
    }
  };

  // Test 6: Pointer Events
  const testPointerEvent = (e) => {
    addLog('Test 6: Pointer Event - COMMENCÉ', 'info');
    try {
      addLog(`Test 6: Pointer Event (${e.pointerType}) - ✅ RÉUSSI`, 'success');
    } catch (error) {
      addLog(`Test 6: Pointer Event - ❌ ÉCHEC: ${error.message}`, 'error');
    }
  };

  const clearLogs = () => {
    setLogs([]);
    setTestsPassed(0);
    setTestsFailed(0);
  };

  const runAllTests = async () => {
    clearLogs();
    addLog('🚀 DÉBUT DES TESTS AUTOMATIQUES', 'info');
    
    testSimpleClick();
    await new Promise(r => setTimeout(r, 500));
    
    testStateUpdate();
    await new Promise(r => setTimeout(r, 500));
    
    await testApiCall();
    await new Promise(r => setTimeout(r, 500));
    
    addLog('✅ TOUS LES TESTS TERMINÉS', 'info');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            🔬 Diagnostic Technique
          </h1>
          <p className="text-gray-600">
            Test de TOUS les types d'événements et interactions
          </p>
          
          {/* Stats */}
          <div className="mt-4 flex gap-4">
            <div className="bg-green-100 px-4 py-2 rounded-lg">
              <span className="font-bold text-green-800">✅ Réussis: {testsPassed}</span>
            </div>
            <div className="bg-red-100 px-4 py-2 rounded-lg">
              <span className="font-bold text-red-800">❌ Échoués: {testsFailed}</span>
            </div>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
          <h2 className="text-xl font-bold mb-4">Tests Individuels</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={testSimpleClick}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Test 1: Click Simple
            </button>

            <button
              onClick={testNavigation}
              className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Test 2: Navigation
            </button>

            <button
              onClick={testStateUpdate}
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Test 3: State Update
            </button>

            <button
              onClick={testApiCall}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Test 4: API Call
            </button>

            <button
              onTouchStart={testTouchEvent}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Test 5: Touch Event
            </button>

            <button
              onPointerDown={testPointerEvent}
              className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Test 6: Pointer Event
            </button>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={runAllTests}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-black py-4 px-8 rounded-lg transition-all flex-1"
            >
              🚀 LANCER TOUS LES TESTS
            </button>

            <button
              onClick={clearLogs}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-4 px-8 rounded-lg transition-colors"
            >
              🗑️ Vider
            </button>
          </div>
        </div>

        {/* Logs Console */}
        <div className="bg-gray-900 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">📋 Console de Logs</h2>
          
          <div className="bg-black rounded p-4 font-mono text-sm max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">Aucun log pour le moment...</p>
            ) : (
              logs.map((log, index) => (
                <div
                  key={index}
                  className={`mb-1 ${
                    log.type === 'success' ? 'text-green-400' :
                    log.type === 'error' ? 'text-red-400' :
                    log.type === 'warning' ? 'text-yellow-400' :
                    'text-blue-400'
                  }`}
                >
                  <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Retour */}
        <div className="mt-4">
          <button
            onClick={() => navigate('/')}
            className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            ← Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticTest;
