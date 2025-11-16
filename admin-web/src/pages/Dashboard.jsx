import { Package, ShoppingCart, Users, TrendingUp } from 'lucide-react'

const Dashboard = () => {
  const stats = [
    { icon: Package, label: 'Produits', value: '0', color: 'bg-blue-500' },
    { icon: ShoppingCart, label: 'Commandes', value: '0', color: 'bg-green-500' },
    { icon: Users, label: 'Clients', value: '0', color: 'bg-purple-500' },
    { icon: TrendingUp, label: 'CA du jour', value: '0€', color: 'bg-orange-500' },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">📊 Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Bienvenue dans le backoffice</h2>
        <p className="text-gray-600 mb-4">
          Nouvelle architecture propre et professionnelle pour gérer Family's.
        </p>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">
            ✅ React + Vite + Tailwind<br />
            ✅ Zustand pour l'état global<br />
            ✅ Axios pour l'API<br />
            ✅ React Router pour la navigation<br />
            ✅ Connecté au backend FastAPI existant
          </p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
