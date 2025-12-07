import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/Card';
import { Lock, AlertCircle } from 'lucide-react';

export const Login = () => {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin');
    }
    inputRefs[0].current?.focus();
  }, [isAuthenticated, navigate]);

  const handleChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;
    
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError('');

    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    if (index === 3 && value) {
      handleLogin(newPin.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 4);
    if (/^\d{1,4}$/.test(pastedData)) {
      const newPin = pastedData.split('').concat(['', '', '', '']).slice(0, 4);
      setPin(newPin);
      if (pastedData.length === 4) {
        handleLogin(pastedData);
      }
    }
  };

  const handleLogin = async (fullPin) => {
    setLoading(true);
    setError('');

    const result = await login(fullPin);

    if (result.success) {
      navigate('/admin');
    } else {
      setError(result.error);
      setPin(['', '', '', '']);
      inputRefs[0].current?.focus();
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-black text-gray-800 mb-1">Le Family's</h1>
          <p className="text-gray-500">Accès Back Office</p>
        </div>

        <p className="text-center text-gray-600 mb-6">Entrez votre code PIN</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="flex justify-center gap-3 mb-8">
          {pin.map((digit, index) => (
            <input
              key={index}
              ref={inputRefs[index]}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              disabled={loading}
              className={`w-14 h-16 text-center text-2xl font-bold rounded-xl border-2 transition-all duration-200 outline-none ${error ? 'border-red-300 bg-red-50' : 'border-gray-200'} ${digit ? 'border-red-500 bg-red-50' : ''} focus:border-red-500 focus:ring-4 focus:ring-red-100 disabled:opacity-50`}
            />
          ))}
        </div>

        {loading && (
          <div className="text-center text-gray-500">
            <div className="animate-spin w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            Vérification...
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-8">
          PIN par défaut: 1234
        </p>
      </Card>
    </div>
  );
};
