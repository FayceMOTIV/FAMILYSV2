import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  ShoppingCart,
  Users,
  Tag,
  Sparkles,
  Settings,
  LogOut
} from 'lucide-react'
import useAuthStore from '../stores/authStore'

const Layout = ({ children }) => {
  const location = useLocation()
  const logout = useAuthStore(state => state.logout)

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Package, label: 'Produits', path: '/products' },
    { icon: FolderTree, label: 'Catégories', path: '/categories' },
    { icon: ShoppingCart, label: 'Commandes', path: '/orders' },
    { icon: Users, label: 'Clients', path: '/customers' },
    { icon: Tag, label: 'Promotions V2', path: '/promotions' },
    { icon: Sparkles, label: 'IA Marketing', path: '/ai-marketing' },
    { icon: Settings, label: 'Paramètres', path: '/settings' },
  ]

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-primary">Family's Admin</h1>
          <p className="text-sm text-gray-500">Backoffice</p>
        </div>
        
        <nav className="p-4">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  )
}

export default Layout
