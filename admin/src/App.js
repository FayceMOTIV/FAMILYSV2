/* Build timestamp: 1762975874 */
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';
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
import { Reservations } from './pages/Reservations';
import { AICampaigns } from './pages/AICampaigns';
import { CampaignHistory } from './pages/CampaignHistory';
import { AIMarketingSettings } from './pages/AIMarketingSettings';
import { Options } from './pages/Options';
import { MenuManagement } from './pages/MenuManagement';
import { OrdersKiosk } from './pages/OrdersKiosk';
import { Revenue } from './pages/Revenue';
import { TicketZ } from './pages/TicketZ';
import AIMarketingTemp from './pages/AIMarketingTemp';
// import { ChoiceLibrary } from './pages/ChoiceLibrary';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/admin">
        <Routes>
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/kiosk" element={<OrdersKiosk />} />
          <Route path="/admin" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="ai" element={<AIAssistant />} />
            <Route path="ai-marketing/campaigns" element={<AICampaigns />} />
            <Route path="ai-marketing/history" element={<CampaignHistory />} />
            <Route path="ai-marketing/settings" element={<AIMarketingSettings />} />
            <Route path="ai-marketing-temp" element={<AIMarketingTemp />} />
            {/* <Route path="choice-library" element={<ChoiceLibrary />} /> */}
            <Route path="menu" element={<MenuManagement />} />
            <Route path="products" element={<Products />} />
            <Route path="options" element={<Options />} />
            <Route path="orders" element={<OrdersManagement />} />
            <Route path="revenue" element={<Revenue />} />
            <Route path="categories" element={<Categories />} />
            <Route path="promotions" element={<PromotionsV2 />} />
            <Route path="customers" element={<Customers />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="reservations" element={<Reservations />} />
            <Route path="settings" element={<Settings />} />
            <Route path="ticket-z" element={<TicketZ />} />
          </Route>
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
