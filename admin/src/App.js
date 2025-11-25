/* Build timestamp: 1731689999 */
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
import { OrdersMode } from './pages/OrdersMode';
import { DeliveryMode } from './pages/DeliveryMode';
import { ReservationMode } from './pages/ReservationMode';
import { ModeLogin } from './pages/ModeLogin';
// import { ChoiceLibrary } from './pages/ChoiceLibrary';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/kiosk" element={<OrdersKiosk />} />
          
          {/* Modes spéciaux avec PIN */}
          <Route path="/orders-mode-login" element={<ModeLogin mode="orders" />} />
          <Route path="/orders-mode" element={<OrdersMode />} />
          <Route path="/delivery-mode-login" element={<ModeLogin mode="delivery" />} />
          <Route path="/delivery-mode" element={<DeliveryMode />} />
          <Route path="/reservation-mode-login" element={<ModeLogin mode="reservation" />} />
          <Route path="/reservation-mode" element={<ReservationMode />} />
          <Route path="/" element={<Layout />}>
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
