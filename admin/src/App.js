import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { Orders } from './pages/Orders';
import { Categories } from './pages/Categories';
import { Settings } from './pages/Settings';
import { AIAssistant } from './pages/AIAssistant';
import { Promos } from './pages/Promos';
import { Customers } from './pages/Customers';
import { Notifications } from './pages/Notifications';
import { Reservations } from './pages/Reservations';
import { AICampaigns } from './pages/AICampaigns';
import { CampaignHistory } from './pages/CampaignHistory';
import { AIMarketingSettings } from './pages/AIMarketingSettings';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="ai" element={<AIAssistant />} />
            <Route path="ai-marketing/campaigns" element={<AICampaigns />} />
            <Route path="ai-marketing/history" element={<CampaignHistory />} />
            <Route path="ai-marketing/settings" element={<AIMarketingSettings />} />
            <Route path="products" element={<Products />} />
            <Route path="orders" element={<Orders />} />
            <Route path="categories" element={<Categories />} />
            <Route path="promos" element={<Promos />} />
            <Route path="customers" element={<Customers />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="reservations" element={<Reservations />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
