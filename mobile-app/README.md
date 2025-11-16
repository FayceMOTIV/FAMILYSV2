# Family's Mobile App 📱

## Architecture

- **Framework**: React Native + Expo SDK 54
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand
- **Styling**: NativeWind (Tailwind for React Native)
- **API Client**: Axios

## Structure

```
mobile-app/
├── app/                  # Expo Router pages
│   ├── (tabs)/           # Tab navigation
│   │   ├── index.jsx     # Home
│   │   ├── menu.jsx      # Menu
│   │   ├── cart.jsx      # Cart
│   │   ├── loyalty.jsx   # Loyalty/Cashback
│   │   └── profile.jsx   # Profile
│   ├── product/[id].jsx  # Product detail
│   ├── auth/             # Authentication
│   │   ├── login.jsx
│   │   └── signup.jsx
│   └── checkout.jsx      # Checkout
├── services/             # API services
│   └── api.js
├── stores/               # Zustand stores
│   ├── authStore.js
│   ├── cartStore.js
│   └── loyaltyStore.js
└── components/           # Reusable components (to create)
```

## Backend API

**Base URL**: `https://react-native-reboot.preview.emergentagent.com/api/v1`

### Available Endpoints

- **Products**: `/products`, `/products/{id}`
- **Categories**: `/categories`
- **Orders**: `/orders`, `/orders/customer/{email}`
- **Cashback**: `/cashback/settings`, `/cashback/balance/{customer_id}`, `/cashback/preview`
- **Auth**: `/auth/login`, `/auth/signup`
- **Promotions**: `/admin/promotions`

## Commands

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Run on Android
npx expo start --android

# Run on iOS (macOS only)
npx expo start --ios

# Run on Web
npx expo start --web
```

## Features to Develop

- [ ] Product listing with categories
- [ ] Product detail with options
- [ ] Cart management
- [ ] Checkout flow
- [ ] Cashback display and usage
- [ ] Authentication (login/signup)
- [ ] Order history
- [ ] Favorites
- [ ] Promotions display
- [ ] Push notifications

## Color Scheme

- **Primary**: #C62828 (Rouge Family's)
- **Secondary**: #FFD54F (Or)
- **White**: #FFFFFF

## Notes

- This is a **clean architecture** with no dependencies on the old frontend
- All screens are functional but empty - ready for development
- API client is configured and connected to the existing FastAPI backend
- State management stores are set up and ready to use
