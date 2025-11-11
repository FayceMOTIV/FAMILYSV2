import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Star, Award, Clock } from 'lucide-react';
import { products, promotions, categories } from '../mockData';
import { Button } from '../components/ui/button';
import { useApp } from '../context/AppContext';

const Home = () => {
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useApp();
  const [currentPromo, setCurrentPromo] = React.useState(0);

  const bestSellers = products.filter(p => p.tags.includes('best-seller')).slice(0, 4);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPromo((prev) => (prev + 1) % promotions.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleProductClick = (product) => {
    navigate(`/product/${product.slug}`);
  };

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#C62828] via-[#8B0000] to-[#C62828] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-16 relative z-10">
          <div className="text-center space-y-6">
            <div className="inline-block">
              <div className="flex items-center space-x-2 bg-[#FFD54F] text-[#121212] px-4 py-2 rounded-full font-semibold text-sm animate-bounce">
                <Award className="w-4 h-4" />
                <span>Meilleur Fast-Food de Bourg-en-Bresse</span>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Savourez l'Excellence
              <br />
              <span className="text-[#FFD54F]">chez Family's</span>
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Des burgers gourmands, des tacos généreux et des desserts maison qui raviront toute la famille
            </p>
            <Button
              onClick={() => navigate('/menu')}
              className="bg-[#FFD54F] hover:bg-[#FFC107] text-[#121212] px-8 py-6 rounded-2xl text-lg font-bold shadow-2xl transition-all duration-300 transform hover:scale-110"
            >
              Commander maintenant
              <ChevronRight className="w-6 h-6 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Promotions Carousel */}
      <section className="max-w-7xl mx-auto px-4 -mt-16 relative z-20">
        <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl overflow-hidden">
          <div className="relative h-64 md:h-80">
            {promotions.map((promo, idx) => (
              <div
                key={promo.id}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  idx === currentPromo ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img
                  src={promo.imageUrl}
                  alt={promo.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
                  <div className="p-8 text-white">
                    <h3 className="text-3xl font-bold mb-2">{promo.title}</h3>
                    <p className="text-lg text-white/90">{promo.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center space-x-2 py-4">
            {promotions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPromo(idx)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  idx === currentPromo ? 'bg-[#C62828] w-8' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Nos Catégories</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => navigate(`/menu?category=${cat.id}`)}
              className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-2 border-transparent hover:border-[#C62828] dark:hover:border-[#FFD54F]"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#C62828] to-[#8B0000] rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl text-white font-bold">{cat.name[0]}</span>
                </div>
                <h3 className="font-bold text-gray-800 dark:text-white">{cat.name}</h3>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center">
            <Star className="w-8 h-8 mr-3 text-[#FFD54F] fill-[#FFD54F]" />
            Nos Best-Sellers
          </h2>
          <Button
            onClick={() => navigate('/menu')}
            variant="outline"
            className="border-[#C62828] text-[#C62828] dark:border-[#FFD54F] dark:text-[#FFD54F] hover:bg-[#C62828] hover:text-white dark:hover:bg-[#FFD54F] dark:hover:text-[#121212]"
          >
            Voir tout
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.map((product) => (
            <div
              key={product.id}
              onClick={() => handleProductClick(product)}
              className="bg-white dark:bg-[#1a1a1a] rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer group"
            >
              <div className="relative overflow-hidden">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-[#FFD54F] text-[#121212] px-3 py-1 rounded-full text-xs font-bold">
                    Best-Seller
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(product.id);
                  }}
                  className="absolute top-3 right-3 w-10 h-10 bg-white/90 dark:bg-black/60 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-5 h-5 ${
                      isFavorite(product.id)
                        ? 'fill-[#C62828] text-[#C62828]'
                        : 'text-gray-600 dark:text-gray-300'
                    }`}
                  />
                </button>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-2">{product.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-[#C62828] dark:text-[#FFD54F]">
                    {product.basePrice.toFixed(2)}€
                  </span>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProductClick(product);
                    }}
                    size="sm"
                    className="bg-[#C62828] hover:bg-[#8B0000] text-white rounded-full"
                  >
                    Ajouter
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Loyalty Banner */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-[#FFD54F] to-[#FFC107] rounded-3xl p-8 md:p-12 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-[#121212] mb-6 md:mb-0">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">Carte de Fidélité</h2>
              <p className="text-lg mb-4">
                1 menu offert tous les 10 commandes !
              </p>
              <p className="text-sm opacity-80">
                Commandez, collectez des tampons et profitez de récompenses exclusives
              </p>
            </div>
            <Button
              onClick={() => navigate('/loyalty')}
              className="bg-[#C62828] hover:bg-[#8B0000] text-white px-8 py-6 rounded-2xl text-lg font-bold shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <Award className="w-6 h-6 mr-2" />
              Voir ma carte
            </Button>
          </div>
        </div>
      </section>

      {/* Opening Hours */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
            <Clock className="w-6 h-6 mr-3 text-[#C62828] dark:text-[#FFD54F]" />
            Horaires d'ouverture
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Lundi - Jeudi</span>
                <span className="text-gray-600 dark:text-gray-400">11:00 - 22:00</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Vendredi - Samedi</span>
                <span className="text-gray-600 dark:text-gray-400">11:00 - 23:00</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Dimanche</span>
                <span className="text-gray-600 dark:text-gray-400">18:00 - 22:00</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#C62828] to-[#8B0000] rounded-2xl p-6 text-white">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">Ouvert</div>
                <div className="text-lg opacity-90">Commandez maintenant</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
