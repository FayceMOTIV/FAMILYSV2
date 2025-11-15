import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://chefs-control.preview.emergentagent.com';

const AIMarketingTemp = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  // Charger les campagnes pending
  const loadCampaigns = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/v1/admin/ai-marketing/campaigns/all?status=pending`);
      setCampaigns(response.data.campaigns || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur chargement campagnes');
      console.error('Error loading campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  // Générer de nouvelles campagnes
  const generateCampaigns = async () => {
    setLoading(true);
    setError(null);
    try {
      await axios.post(`${BACKEND_URL}/api/v1/admin/ai-marketing/campaigns/generate`, {
        force_regenerate: false
      });
      await loadCampaigns();
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur génération campagnes');
      console.error('Error generating campaigns:', err);
      setLoading(false);
    }
  };

  // Valider ou refuser une campagne
  const handleAction = async (campaignId, accepted) => {
    setActionLoading(prev => ({ ...prev, [campaignId]: true }));
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/admin/ai-marketing/campaigns/${campaignId}/validate`,
        { accepted, notes: accepted ? 'Validé via page temp' : 'Refusé via page temp' },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        }
      );
      
      if (response.data.success) {
        alert(accepted 
          ? `✅ Campagne validée ! Promo créée en brouillon (ID: ${response.data.promotion_id})`
          : '❌ Campagne refusée'
        );
        await loadCampaigns(); // Recharger la liste
      }
    } catch (err) {
      alert('Erreur: ' + (err.response?.data?.detail || err.message));
      console.error('Error validating campaign:', err);
    } finally {
      setActionLoading(prev => ({ ...prev, [campaignId]: false }));
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  if (loading && campaigns.length === 0) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1>⏳ Chargement des campagnes IA...</h1>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>🤖 IA Marketing - Campagnes Proposées (Page Test)</h1>
        <div>
          <button 
            onClick={generateCampaigns}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              marginRight: '10px'
            }}
          >
            {loading ? '⏳ Génération...' : '⚡ Générer Nouvelles Campagnes'}
          </button>
          <button 
            onClick={loadCampaigns}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            🔄 Rafraîchir
          </button>
        </div>
      </div>

      {error && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#ffebee', 
          color: '#c62828', 
          borderRadius: '5px',
          marginBottom: '20px',
          border: '1px solid #ef5350'
        }}>
          <strong>⚠️ Erreur:</strong> {error}
        </div>
      )}

      {campaigns.length === 0 && !loading && (
        <div style={{ 
          padding: '40px', 
          textAlign: 'center', 
          backgroundColor: '#f5f5f5',
          borderRadius: '10px',
          border: '2px dashed #ccc'
        }}>
          <h2>📭 Aucune campagne en attente</h2>
          <p>Cliquez sur "Générer Nouvelles Campagnes" pour créer des propositions IA.</p>
        </div>
      )}

      {campaigns.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            backgroundColor: 'white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                <th style={thStyle}>Nom Campagne</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Ciblage</th>
                <th style={thStyle}>Période</th>
                <th style={thStyle}>Impact Estimé</th>
                <th style={thStyle}>Message IA</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign, idx) => {
                const isLoading = actionLoading[campaign.id];
                const promoType = campaign.promo_type_v2 || campaign.type || 'N/A';
                const products = campaign.product_ids?.length || 0;
                const categories = campaign.category_ids?.length || 0;
                const ciblage = products > 0 ? `${products} produit(s)` : 
                                categories > 0 ? `${categories} catégorie(s)` : 
                                'Tous';
                
                const impact = campaign.impact_estimate || {};
                const impactText = `${impact.ca_increase || 'N/A'} | ${impact.difficulty || 'N/A'} | ${impact.duration || 'N/A'}`;
                
                const periode = `${campaign.start_date || 'N/A'} → ${campaign.end_date || 'N/A'}`;
                const horaires = campaign.start_time && campaign.end_time 
                  ? ` | ${campaign.start_time}-${campaign.end_time}`
                  : '';
                const jours = campaign.days_active?.length > 0
                  ? ` | ${campaign.days_active.join(', ')}`
                  : '';

                return (
                  <tr key={campaign.id} style={{ 
                    borderBottom: '1px solid #eee',
                    backgroundColor: idx % 2 === 0 ? 'white' : '#fafafa'
                  }}>
                    <td style={tdStyle}>
                      <strong>{campaign.name}</strong>
                      {campaign.badge_text && (
                        <div style={{
                          display: 'inline-block',
                          marginLeft: '8px',
                          padding: '2px 8px',
                          backgroundColor: campaign.badge_color || '#FF6B35',
                          color: 'white',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 'bold'
                        }}>
                          {campaign.badge_text}
                        </div>
                      )}
                    </td>
                    <td style={tdStyle}>
                      <code style={{
                        backgroundColor: '#e3f2fd',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        color: '#1565c0'
                      }}>
                        {promoType}
                      </code>
                    </td>
                    <td style={tdStyle}>{ciblage}</td>
                    <td style={tdStyle}>
                      <div style={{ fontSize: '13px' }}>
                        {periode}
                        {horaires && <div style={{ color: '#666', fontSize: '12px' }}>{horaires}</div>}
                        {jours && <div style={{ color: '#666', fontSize: '12px' }}>{jours}</div>}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontSize: '12px', lineHeight: '1.5' }}>
                        <div><strong>CA:</strong> {impact.ca_increase || 'N/A'}</div>
                        <div><strong>Diff:</strong> {impact.difficulty || 'N/A'}</div>
                        <div><strong>Durée:</strong> {impact.duration || 'N/A'}</div>
                        {impact.target_customers && (
                          <div><strong>Cibles:</strong> {impact.target_customers}</div>
                        )}
                      </div>
                    </td>
                    <td style={{ ...tdStyle, maxWidth: '300px' }}>
                      <div style={{ 
                        fontSize: '13px', 
                        lineHeight: '1.4',
                        color: '#333'
                      }}>
                        {campaign.message}
                      </div>
                      {campaign.source_promo_analysis && (
                        <div style={{
                          marginTop: '8px',
                          padding: '6px',
                          backgroundColor: '#fff3e0',
                          borderLeft: '3px solid #ff9800',
                          fontSize: '11px',
                          color: '#666'
                        }}>
                          <strong>📊 Analyse:</strong> {campaign.source_promo_analysis}
                        </div>
                      )}
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                        <button
                          onClick={() => handleAction(campaign.id, true)}
                          disabled={isLoading}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: isLoading ? '#ccc' : '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            fontSize: '13px',
                            fontWeight: 'bold'
                          }}
                        >
                          {isLoading ? '⏳' : '✅ Valider'}
                        </button>
                        <button
                          onClick={() => handleAction(campaign.id, false)}
                          disabled={isLoading}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: isLoading ? '#ccc' : '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            fontSize: '13px',
                            fontWeight: 'bold'
                          }}
                        >
                          {isLoading ? '⏳' : '❌ Refuser'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ 
        marginTop: '30px', 
        padding: '15px', 
        backgroundColor: '#e3f2fd',
        borderRadius: '8px',
        border: '1px solid #90caf9'
      }}>
        <h3 style={{ marginTop: 0 }}>ℹ️ Info</h3>
        <ul style={{ fontSize: '14px', lineHeight: '1.8', color: '#333' }}>
          <li><strong>Campagnes affichées:</strong> {campaigns.length}</li>
          <li><strong>Status:</strong> Pending (en attente de validation)</li>
          <li><strong>✅ Valider:</strong> Crée automatiquement une promo V2 en brouillon dans le moteur</li>
          <li><strong>❌ Refuser:</strong> Marque la campagne comme refusée (pas de promo créée)</li>
          <li><strong>Fallback actif:</strong> Si OpenAI indisponible, génération intelligente basée sur données</li>
        </ul>
      </div>
    </div>
  );
};

const thStyle = {
  padding: '12px',
  textAlign: 'left',
  fontWeight: 'bold',
  fontSize: '14px',
  color: '#333'
};

const tdStyle = {
  padding: '12px',
  fontSize: '13px',
  verticalAlign: 'top'
};

export default AIMarketingTemp;
