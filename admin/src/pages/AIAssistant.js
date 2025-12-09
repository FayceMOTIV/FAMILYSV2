import React, { useState, useRef, useEffect } from 'react';
import { Header } from '../components/Header';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { Input, Label } from '../components/Input';
import { aiAPI } from '../services/api';
import { Sparkles, BarChart3, MessageCircle, Tag, Copy, CheckCircle, AlertCircle, Send, Trash2 } from 'lucide-react';

export const AIAssistant = () => {
  const [loading, setLoading] = useState(false);
  const [marketingText, setMarketingText] = useState('');
  const [marketingType, setMarketingType] = useState('');
  const [salesAnalysis, setSalesAnalysis] = useState(null);
  const [chatQuestion, setChatQuestion] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: "Bonjour ! Je suis l'assistant IA de Le Family's. Comment puis-je vous aider aujourd'hui ? 🍔" }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const [promoSuggestion, setPromoSuggestion] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleGenerateMarketing = async (type) => {
    setLoading(true);
    setError('');
    setMarketingText('');
    try {
      const response = await aiAPI.generateMarketing({ type });
      setMarketingText(response.data.content || response.data.generated_text || '');
      setMarketingType(type);
    } catch (error) {
      const errMsg = error.response?.data?.detail || error.message || 'Erreur IA';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeSales = async () => {
    setLoading(true);
    setError('');
    setSalesAnalysis(null);
    try {
      const response = await aiAPI.analyzeSales();
      setSalesAnalysis(response.data);
    } catch (error) {
      const errMsg = error.response?.data?.detail || error.message || 'Erreur IA';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleChat = async () => {
    if (!chatQuestion.trim()) return;
    const userMessage = chatQuestion.trim();
    setChatQuestion('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatLoading(true);
    try {
      const response = await aiAPI.chat(userMessage);
      const aiResponse = response.data.response || "Désolé, je n'ai pas pu répondre.";
      setChatMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      const errMsg = error.response?.data?.detail || error.message || 'Erreur IA';
      setChatMessages(prev => [...prev, { role: 'assistant', content: '❌ Erreur: ' + errMsg }]);
    } finally {
      setChatLoading(false);
    }
  };

  const clearChat = () => {
    setChatMessages([
      { role: 'assistant', content: "Bonjour ! Je suis l'assistant IA de Le Family's. Comment puis-je vous aider aujourd'hui ? 🍔" }
    ]);
  };

  const handleSuggestPromo = async () => {
    setLoading(true);
    setError('');
    setPromoSuggestion(null);
    try {
      const response = await aiAPI.suggestPromo();
      setPromoSuggestion(response.data);
    } catch (error) {
      const errMsg = error.response?.data?.detail || error.message || 'Erreur IA';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getMarketingLabel = (type) => {
    const labels = { 'social_post': '📱 Post Social', 'product_description': '📝 Description Produit', 'promo_text': '🎁 Texte Promo' };
    return labels[type] || type;
  };

  return (
    <div>
      <Header title="Assistant IA" />
      <div className="p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-red-700 font-medium">Erreur</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span>Génération Marketing</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={() => handleGenerateMarketing('social_post')} disabled={loading} variant={marketingType === 'social_post' ? 'primary' : 'outline'}>
                    {loading && marketingType === 'social_post' ? '⏳...' : '📱 Post Social'}
                  </Button>
                  <Button onClick={() => handleGenerateMarketing('product_description')} disabled={loading} variant={marketingType === 'product_description' ? 'primary' : 'outline'}>
                    {loading && marketingType === 'product_description' ? '⏳...' : '📝 Description'}
                  </Button>
                  <Button onClick={() => handleGenerateMarketing('promo_text')} disabled={loading} className="col-span-2" variant={marketingType === 'promo_text' ? 'primary' : 'outline'}>
                    {loading && marketingType === 'promo_text' ? '⏳...' : '🎁 Texte Promo'}
                  </Button>
                </div>
                {marketingText && (
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200">
                    <span className="text-xs font-medium text-primary">{getMarketingLabel(marketingType)}</span>
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap mt-2">{marketingText}</p>
                    <Button size="sm" variant="outline" className="mt-3" onClick={() => copyToClipboard(marketingText)}>
                      {copied ? <><CheckCircle className="w-4 h-4 mr-1" /> Copié</> : <><Copy className="w-4 h-4 mr-1" /> Copier</>}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                <span>Analyse Ventes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={handleAnalyzeSales} disabled={loading} className="w-full mb-4">
                {loading ? '⏳ Analyse...' : '📊 Analyser les ventes'}
              </Button>
              {salesAnalysis && (
                <div className="space-y-4">
                  {salesAnalysis.stats && (
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="bg-green-50 p-3 rounded-lg text-center">
                        <p className="text-lg font-bold text-green-600">{salesAnalysis.stats.total_revenue?.toFixed(2) || 0}€</p>
                        <p className="text-xs text-gray-600">CA Total</p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg text-center">
                        <p className="text-lg font-bold text-blue-600">{salesAnalysis.stats.order_count || 0}</p>
                        <p className="text-xs text-gray-600">Commandes</p>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg text-center">
                        <p className="text-lg font-bold text-purple-600">{salesAnalysis.stats.average_order?.toFixed(2) || 0}€</p>
                        <p className="text-xs text-gray-600">Panier Moyen</p>
                      </div>
                    </div>
                  )}
                  {salesAnalysis.stats?.top_products?.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-bold text-sm mb-2">🏆 Top Produits :</h4>
                      {salesAnalysis.stats.top_products.map((prod, i) => (
                        <div key={i} className="flex justify-between text-sm bg-gray-50 p-2 rounded mb-1">
                          <span>{i + 1}. {prod.name}</span>
                          <span className="font-medium">{prod.count}x</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {salesAnalysis.analysis && (
                    <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                      <h4 className="font-bold text-sm mb-2 flex items-center"><Sparkles className="w-4 h-4 mr-1 text-primary" />Analyse IA :</h4>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{salesAnalysis.analysis}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="flex flex-col h-[500px]">
            <CardHeader className="flex-shrink-0">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  <span>Chat IA</span>
                </CardTitle>
                <Button size="sm" variant="outline" onClick={clearChat}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-white rounded-br-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-md'}`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-2xl rounded-bl-md">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="flex-shrink-0 flex space-x-2">
                <Input value={chatQuestion} onChange={(e) => setChatQuestion(e.target.value)} placeholder="Posez votre question..." onKeyPress={(e) => e.key === 'Enter' && !chatLoading && handleChat()} className="flex-1" disabled={chatLoading} />
                <Button onClick={handleChat} disabled={chatLoading || !chatQuestion.trim()}><Send className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Tag className="w-5 h-5 text-primary" />
                <span>Suggestion Promo IA</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={handleSuggestPromo} disabled={loading} className="w-full mb-4">
                {loading ? '⏳ Analyse...' : '🎯 Générer une suggestion'}
              </Button>
              {promoSuggestion && (
                <div className="space-y-4">
                  {promoSuggestion.low_sellers?.length > 0 && (
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <h4 className="font-bold text-sm mb-1 text-orange-700">📉 Produits à booster :</h4>
                      <p className="text-sm text-orange-600">{promoSuggestion.low_sellers.join(', ')}</p>
                    </div>
                  )}
                  {promoSuggestion.suggestion && (
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-bold text-sm mb-2 text-green-700 flex items-center"><Sparkles className="w-4 h-4 mr-1" />Suggestion IA :</h4>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{promoSuggestion.suggestion}</p>
                      <Button size="sm" variant="outline" className="mt-3" onClick={() => copyToClipboard(promoSuggestion.suggestion)}>
                        <Copy className="w-4 h-4 mr-1" /> Copier
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
