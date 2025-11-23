# Family's Mobile App - Version Premium

## 🎯 Overview
Application mobile premium pour Family's Restaurant, développée avec Expo Router v3, React Native, et TailwindCSS.

## 📱 Tech Stack
- **Framework**: React Native 0.74 + Expo 51
- **Navigation**: Expo Router v3 (file-based routing)
- **Styling**: TailwindCSS v3 + Nativewind v4
- **State Management**: Zustand
- **Data Fetching**: Axios
- **UI Components**: Custom Design System
- **Icons**: Lucide React Native

## 🏗️ Architecture

```
/app/mobile-new/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation
│   │   ├── index.jsx      # Home page
│   │   ├── cart.jsx       # Shopping cart
│   │   ├── orders.jsx     # Order history
│   │   ├── profile.jsx    # User profile
│   │   └── surprise.jsx   # Surprise du Jour
│   ├── auth/              # Authentication
│   │   ├── login.jsx
│   │   └── register.jsx
│   ├── product/[id].jsx   # Product detail
│   ├── category/[name].jsx # Category products
│   ├── orders/[id].jsx    # Order detail
│   └── loyalty.jsx        # Loyalty card
├── components/            # Reusable components
│   ├── Button.jsx
│   ├── Input.jsx
│   ├── Card.jsx
│   ├── Badge.jsx
│   ├── Loader.jsx
│   ├── ProductCard.jsx
│   ├── CategoryCard.jsx
│   ├── OrderCard.jsx
│   └── SkeletonLoader.jsx
├── services/              # API services
│   ├── api.js            # Axios instance
│   ├── auth.js
│   ├── products.js
│   ├── orders.js
│   ├── loyalty.js
│   └── surprise.js
├── stores/                # Zustand stores
│   ├── authStore.js
│   └── cartStore.js
└── constants/             # App constants
    ├── api.js            # API URLs & endpoints
    └── theme.js          # Colors & styles
```

## 🎨 Design System

### Colors
- **Primary Red**: #C62828 (Family's Red)
- **Secondary Gold**: #FFD54F
- **Dark**: #1a1a1a
- **Light**: #f5f5f5

### Components
- Button (variants: primary, secondary, outline, ghost)
- Input (with label & error support)
- Card (with shadow)
- Badge (status indicators)
- Skeleton Loaders

## 🔑 Features

### ✅ Implemented

1. **Authentication**
   - Register new account
   - Login with email/password
   - JWT token management
   - Auto-login on app start

2. **Home Page**
   - Welcome banner
   - Promotional sliders
   - Category navigation
   - Featured products
   - Surprise du Jour CTA

3. **Products & Categories**
   - Browse by category
   - Product search
   - Product detail page
   - Add to cart

4. **Shopping Cart**
   - Add/remove items
   - Quantity management
   - Order total calculation
   - Checkout flow

5. **Order Management**
   - Place orders
   - Order history
   - Order tracking
   - Order details

6. **Loyalty Card**
   - Points balance
   - Tier system (Basic, Bronze, Silver, Gold)
   - Points history
   - QR code (for in-store scanning)
   - Progress to next tier

7. **Surprise du Jour**
   - Daily game
   - Win rewards (points, discounts, free products)
   - Claim rewards
   - Rewards history

8. **User Profile**
   - View profile info
   - Stats (orders, spending)
   - Logout

## 🌐 API Endpoints

Base URL: `https://api-overhaul-2.preview.emergentagent.com/api/v1`

### Auth
- POST `/auth/register` - Register new user
- POST `/auth/login` - Login
- GET `/auth/me` - Get current user

### Products
- GET `/products` - List products
- GET `/products/{id}` - Product detail
- GET `/categories` - List categories
- GET `/featured` - Featured products
- GET `/promos` - Active promotions

### Orders
- POST `/orders` - Create order
- GET `/orders` - Order history
- GET `/orders/{id}` - Order detail

### Loyalty
- GET `/loyalty` - Get loyalty card
- GET `/loyalty/history` - Points history

### Surprise du Jour
- GET `/surprise/status` - Check play status
- POST `/surprise/play` - Play the game
- POST `/surprise/claim/{id}` - Claim reward
- GET `/surprise/rewards` - Rewards history

### Profile
- GET `/profile` - Get profile
- PUT `/profile` - Update profile
- POST `/profile/change-password` - Change password

## 🔐 Authentication Flow

1. User enters credentials (email/password)
2. App sends POST to `/auth/login`
3. Backend validates and returns JWT token
4. Token stored in AsyncStorage
5. Token added to all subsequent API requests via Axios interceptor
6. On app restart, token auto-loaded from storage

## 🛒 Shopping Flow

1. Browse products by category or featured
2. Click product to view details
3. Add to cart with quantity
4. View cart and adjust quantities
5. Enter delivery address
6. Place order
7. Earn loyalty points
8. View order in history

## 🎁 Loyalty System

### Tiers
- **Basic**: 0-499 points (0% discount)
- **Bronze**: 500-1,999 points (5% discount)
- **Silver**: 2,000-4,999 points (10% discount)
- **Gold**: 5,000+ points (15% discount)

### Points
- Earn 10 points per € spent
- 100 points = 1€ discount
- Can use up to 50% of order value

## 🎲 Surprise du Jour

- Play once per day
- Win random rewards:
  - Bonus points
  - Percentage discounts
  - Free products
- Rewards expire after 7 days
- Must claim rewards to use them

## 📦 Installation & Setup

```bash
# Install dependencies
cd /app/mobile-new
yarn install

# Start development server
yarn start

# Run on specific platform
yarn android  # Android
yarn ios      # iOS
yarn web      # Web browser
```

## 🧪 Testing

### API Testing
All backend endpoints tested and working:
- ✅ Authentication
- ✅ Products & Categories
- ✅ Orders
- ✅ Loyalty
- ✅ Surprise du Jour
- ✅ Profile

### Test Credentials
```
Email: test@familys.fr
Password: test1234
```

## 🚀 Deployment

### Requirements
- Expo account
- EAS CLI installed
- Bundle ID: `com.fayce.familys.newapp`

### Build Commands
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## 📝 Notes

- Old mobile app in `/app/mobile` is deprecated
- All development should be in `/app/mobile-new`
- Backend API is stable and fully functional
- Test data includes 10 products across 4 categories
- Surprise du Jour rewards are configured and active

## 🎯 Next Steps (Future Enhancements)

1. **Push Notifications**
   - Order status updates
   - New promotions
   - Daily surprise reminder

2. **Payment Integration**
   - Credit card payments
   - Apple Pay / Google Pay

3. **Social Features**
   - Share orders
   - Invite friends
   - Referral program

4. **Advanced Features**
   - Order scheduling
   - Favorites list
   - Allergen filters
   - Multi-language support

## 💡 Development Tips

- Use `expo start --clear` to clear cache if issues occur
- Test on real devices for best performance
- Check logs with `npx react-native log-android` or `log-ios`
- API errors are logged to console
- Use React DevTools for debugging

## 🐛 Known Issues

None currently. All major features tested and working.

## 📞 Support

For issues or questions:
- Check console logs first
- Verify API connectivity
- Test with provided credentials
- Review this README for guidance
