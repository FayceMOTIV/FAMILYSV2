# Family's Admin Backoffice 💼

## Architecture

- **Framework**: React 18 + Vite
- **Routing**: React Router 6
- **State Management**: Zustand
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **API Client**: Axios

## Structure

```
admin-web/
├── src/
│   ├── components/
│   │   └── Layout.jsx       # Layout avec sidebar
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Products.jsx
│   │   ├── Categories.jsx
│   │   ├── Orders.jsx
│   │   ├── Customers.jsx
│   │   ├── Promotions.jsx
│   │   ├── AIMarketing.jsx
│   │   ├── Settings.jsx
│   │   └── Login.jsx
│   ├── services/
│   │   └── api.js           # API client & services
│   ├── stores/
│   │   └── authStore.js
│   ├── App.jsx
│   └── main.jsx
└── index.html
```

## Backend API

**Base URL**: `https://react-reborn.preview.emergentagent.com/api/v1/admin`

### Available Endpoints

- **Auth**: `/admin/auth/login`
- **Dashboard**: `/admin/dashboard/stats`
- **Products**: `/admin/products` (CRUD)
- **Categories**: `/admin/categories` (CRUD)
- **Orders**: `/admin/orders` (GET, update status, payment)
- **Customers**: `/admin/customers`
- **Promotions V2**: `/admin/promotions` (CRUD + simulate + analytics)
- **AI Marketing**: `/admin/ai-marketing/campaigns`

## Commands

```bash
# Install dependencies
npm install

# Development
npm run dev

# Build
npm run build

# Preview production build
npm run preview
```

## Features to Develop

- [ ] Dashboard avec stats temps réel
- [ ] CRUD Produits (avec options/variants)
- [ ] CRUD Catégories (avec réordonnancement)
- [ ] Gestion commandes (status, paiement, historique)
- [ ] Liste clients + détails
- [ ] CRUD Promotions V2 (15 types)
- [ ] Simulateur de promotions
- [ ] IA Marketing (validation de campagnes)
- [ ] Paramètres restaurant
- [ ] Analytics & graphiques

## Authentication

**Default credentials**:
- Email: `admin@familys.app`
- Password: `Admin@123456`

## Color Scheme

- **Primary**: #C62828 (Rouge Family's)
- **Secondary**: #FFD54F (Or)

## Notes

- Architecture **100% neuve** sans dépendances à l'ancien frontend
- Toutes les pages sont fonctionnelles mais vides
- API client configuré et connecté au backend FastAPI
- Zustand pour state management (léger et simple)
- TailwindCSS pour styling rapide et moderne
