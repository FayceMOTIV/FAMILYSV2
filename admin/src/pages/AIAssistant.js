import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { Input, Label } from '../components/Input';
import { aiAPI } from '../services/api';
import { Sparkles, BarChart3, MessageCircle, Tag } from 'lucide-react';

export const AIAssistant = () => {
  const [loading, setLoading] = useState(false);
  const [marketingText, setMarketingText] = useState('');
  const [salesAnalysis, setSalesAnalysis] = useState(null);
  const [chatQuestion, setChatQuestion] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [promoSuggestion, setPromoSuggestion] = useState(null);

  const handleGenerateMarketing = async (type) => {
    setLoading(true);
    try {
      const response = await aiAPI.generateMarketing({ type });
      setMarketingText(response.data.generated_text);
    } catch (error) {
      alert('Erreur : ' + (error.response?.data?.detail || 'Erreur IA'));
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeSales = async () => {
    setLoading(true);
    try {
      const response = await aiAPI.analyzeSales();
      setSalesAnalysis(response.data);
    } catch (error) {
      alert('Erreur : ' + (error.response?.data?.detail || 'Erreur IA'));
    } finally {
      setLoading(false);
    }
  };

  const handleChat = async () => {
    if (!chatQuestion.trim()) return;
    setLoading(true);
    try {
      const response = await aiAPI.chat(chatQuestion);
      setChatResponse(response.data.response);
    } catch (error) {
      alert('Erreur : ' + (error.response?.data?.detail || 'Erreur IA'));
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestPromo = async () => {
    setLoading(true);
    try {
      const response = await aiAPI.suggestPromo();
      setPromoSuggestion(response.data.suggestion);
    } catch (error) {
      alert('Erreur : ' + (error.response?.data?.detail || 'Erreur IA'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header title="Assistant IA" />
      <div className="p-8">
        {/* Marketing AI */}
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
                  <Button onClick={() => handleGenerateMarketing('social_post')} disabled={loading}>
                    Post Social
                  </Button>
                  <Button onClick={() => handleGenerateMarketing('product_description')} disabled={loading}>
                    Description Produit
                  </Button>
                  <Button onClick={() => handleGenerateMarketing('promo_text')} disabled={loading} className="col-span-2">
                    Texte Promo
                  </Button>
                </div>
                {marketingText && (
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{marketingText}</p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="mt-3"
                      onClick={() => navigator.clipboard.writeText(marketingText)}
                    >
                      Copier
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
                Analyser les ventes
              </Button>
              {salesAnalysis && (
                <div className="space-y-3">
                  {salesAnalysis.ai_analysis?.insights && (
                    <div>
                      <h4 className="font-bold text-sm mb-2">Insights :</h4>
                      <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                        {salesAnalysis.ai_analysis.insights.map((insight, i) => (
                          <li key={i}>• {insight}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {salesAnalysis.ai_analysis?.recommendations && (
                    <div>
                      <h4 className="font-bold text-sm mb-2">Recommandations :</h4>
                      <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                        {salesAnalysis.ai_analysis.recommendations.map((rec, i) => (
                          <li key={i}>✓ {rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chat & Promo Suggestion */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                <span>Chat IA</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Posez une question</Label>
                  <Input
                    value={chatQuestion}
                    onChange={(e) => setChatQuestion(e.target.value)}
                    placeholder="Ex: Quel est le CA d'hier ?"
                    onKeyPress={(e) => e.key === 'Enter' && handleChat()}
                  />
                </div>
                <Button onClick={handleChat} disabled={loading || !chatQuestion.trim()}>
                  Envoyer
                </Button>
                {chatResponse && (
                  <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                    <p className="text-sm text-gray-800 dark:text-gray-200">{chatResponse}</p>
                  </div>
                )}
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
                Générer une suggestion
              </Button>
              {promoSuggestion && (
                <div className="bg-gold/10 p-4 rounded-lg border border-gold/30">
                  <h4 className="font-bold mb-2">{promoSuggestion.title || 'Promo suggérée'}</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{promoSuggestion.description || JSON.stringify(promoSuggestion)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
