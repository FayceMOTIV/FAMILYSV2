/* Build timestamp: 1733564200 */
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { ModeSelector } from './pages/ModeSelector';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { OrdersManagement } from './pages/OrdersManagement';
import { Categories } from './pages/Categories';
import { Settings } from './pages/Settings';
import { AIAssistant } from './pages/AIAssistant';
import { PromotionsV2 } from './pages/PromotionsV2';
import { Customers } from './pages/Customers';
import { Notifications } from './pages/Notifications';
import { AICampaigns } from './pages/AICampaigns';
import { CampaignHistory } from './pages/CampaignHistory';
import { AIMarketingSettings } from './pages/AIMarketingSettings';
import { Options } from './pages/Options';
import { MenuManagement } from './pages/MenuManagement';
import { Revenue } from './pages/Revenue';
import { TicketZ } from './pages/TicketZ';
import AIMarketingTemp from './pages/AIMarketingTemp';
import { OrdersMode } from './pages/OrdersMode';
import { DeliveryMode } from './pages/DeliveryMode';
import { ModeLogin } from './pages/ModeLogin';

// MODULE SURPRISE DU JOUR
import SurpriseDuJourDashboard from './pages/SurpriseDuJourDashboard';
import SurpriseDuJourRewards from './pages/SurpriseDuJourRewards';
import SurpriseDuJourConfiguration from './pages/SurpriseDuJourConfiguration';
import { Popups } from './pages/Popups';

// Layout protégé
const ProtectedLayout = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Layout /> : <Navigate to="/login" replace />;
};

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Sélection de mode (accueil) */}
      <Route path="/select-mode" element={<ModeSelector />} />
      
      {/* Login Admin */}
      <Route path="/login" element={isAuthenticated ? <Navigate to="/admin" replace /> : <Login />} />
      
      {/* Mode Commandes */}
      <Route path="/orders-mode-login" element={<ModeLogin mode="orders" />} />
      <Route path="/orders-mode" element={<OrdersMode />} />
      
      {/* Mode Livraison */}
      <Route path="/delivery-mode-login" element={<ModeLogin mode="delivery" />} />
      <Route path="/delivery-mode" element={<DeliveryMode />} />
      
      {/* Back Office protégé */}
      <Route path="/admin" element={<ProtectedLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="ai" element={<AIAssistant />} />
        <Route path="ai-marketing/campaigns" element={<AICampaigns />} />
        <Route path="ai-marketing/history" element={<CampaignHistory />} />
        <Route path="ai-marketing/settings" element={<AIMarketingSettings />} />
        <Route path="ai-marketing-temp" element={<AIMarketingTemp />} />
        <Route path="menu" element={<MenuManagement />} />
        <Route path="products" element={<Products />} />
        <Route path="options" element={<Options />} />
        <Route path="orders" element={<OrdersManagement />} />
        <Route path="revenue" element={<Revenue />} />
        <Route path="categories" element={<Categories />} />
        <Route path="promotions" element={<PromotionsV2 />} />
        <Route path="customers" element={<Customers />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={<Settings />} />
        <Route path="popups" element={<Popups />} />
        <Route path="ticket-z" element={<TicketZ />} />
        
        {/* SURPRISE DU JOUR */}
        <Route path="surprise-du-jour" element={<SurpriseDuJourDashboard />} />
        <Route path="surprise-du-jour/configuration" element={<SurpriseDuJourConfiguration />} />
        <Route path="surprise-du-jour/rewards" element={<SurpriseDuJourRewards />} />
      </Route>
      
      {/* Redirection par défaut */}
      <Route path="/" element={<Navigate to="/select-mode" replace />} />
      <Route path="*" element={<Navigate to="/select-mode" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/">
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
