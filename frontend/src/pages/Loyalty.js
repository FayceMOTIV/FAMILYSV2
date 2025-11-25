import React from 'react';
import { Award, Star, Gift, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

const Loyalty = () => {
  const { user, loyaltyStamps, login } = useApp();
  const navigate = useNavigate();
  const totalStamps = 10;
  const progress = (loyaltyStamps / totalStamps) * 100;

  const handleLogin = () => {
    // Mock login for demo
    login();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 pb-20">
        <div className="max-w-md w-full bg-white dark:bg-[#1a1a1a] rounded-3xl p-8 shadow-2xl text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-[#FFD54F] to-[#FFC107] rounded-full flex items-center justify-center mx-auto mb-6">
            <Award className="w-10 h-10 text-[#121212]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Carte de Fidélité
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Connectez-vous pour accéder à votre carte de fidélité et profiter de récompenses exclusives
          </p>
          <Button
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-[#C62828] to-[#8B0000] hover:from-[#8B0000] hover:to-[#C62828] text-white py-6 rounded-2xl font-bold"
          >
            Se connecter
          </Button>
        </div>
      </div>
    );
  }

  const rewards = [
    { stamps: 5, title: 'Réduction 10%', description: 'Sur votre prochaine commande', unlocked: loyaltyStamps >= 5 },
    { stamps: 10, title: 'Menu offert', description: "Menu Family's Classic gratuit", unlocked: loyaltyStamps >= 10 },
    { stamps: 20, title: 'Dessert gratuit', description: 'Un dessert au choix', unlocked: loyaltyStamps >= 20 },
    { stamps: 30, title: 'Menu King offert', description: 'Notre burger signature offert', unlocked: loyaltyStamps >= 30 }
  ];

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#FFD54F] to-[#FFC107] py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Award className="w-16 h-16 text-[#121212] mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-[#121212] mb-4">
            Carte de Fidélité
          </h1>
          <p className="text-xl text-[#121212]/80">
            Collectionnez des tampons et débloquez des récompenses
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Loyalty Card */}
        <div className="bg-gradient-to-br from-[#C62828] via-[#8B0000] to-[#C62828] rounded-3xl p-8 shadow-2xl text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="text-sm opacity-90 mb-1">Membre</div>
                <div className="text-2xl font-bold">{user.name}</div>
              </div>
              <div className="w-16 h-16 bg-[#FFD54F] rounded-2xl flex items-center justify-center">
                <span className="text-3xl font-bold text-[#121212]">F</span>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-semibold">Progression</span>
                <span className="text-2xl font-bold">{loyaltyStamps} / {totalStamps}</span>
              </div>
              <div className="h-4 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#FFD54F] rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-sm opacity-90 mt-2">
                {totalStamps - loyaltyStamps > 0
                  ? `Plus que ${totalStamps - loyaltyStamps} commande${totalStamps - loyaltyStamps > 1 ? 's' : ''} pour votre menu offert !`
                  : 'Félicitations ! Vous avez débloqué votre récompense !'}
              </div>
            </div>

            {/* Stamps Grid */}
            <div className="grid grid-cols-5 gap-3">
              {[...Array(totalStamps)].map((_, idx) => (
                <div
                  key={idx}
                  className={`aspect-square rounded-xl border-2 border-dashed transition-all duration-300 flex items-center justify-center ${
                    idx < loyaltyStamps
                      ? 'bg-[#FFD54F] border-[#FFD54F] scale-105'
                      : 'bg-white/10 border-white/30'
                  }`}
                >
                  {idx < loyaltyStamps ? (
                    <Star className="w-6 h-6 text-[#121212] fill-[#121212] animate-pulse" />
                  ) : (
                    <span className="text-white/50 font-bold">{idx + 1}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* How it Works */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
            <TrendingUp className="w-6 h-6 mr-3 text-[#C62828] dark:text-[#FFD54F]" />
            Comment ça marche ?
          </h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-[#C62828] dark:bg-[#FFD54F] rounded-full flex items-center justify-center text-white dark:text-[#121212] font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-bold text-gray-800 dark:text-white mb-1">Commandez</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Chaque commande supérieure à 8€ vous rapporte 1 tampon
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-[#C62828] dark:bg-[#FFD54F] rounded-full flex items-center justify-center text-white dark:text-[#121212] font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-bold text-gray-800 dark:text-white mb-1">Collectionnez</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Accumulez 10 tampons sur votre carte de fidélité
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-[#C62828] dark:bg-[#FFD54F] rounded-full flex items-center justify-center text-white dark:text-[#121212] font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-bold text-gray-800 dark:text-white mb-1">Profitez</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Obtenez un menu gratuit d'une valeur jusqu'à 12€
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Rewards */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
            <Gift className="w-6 h-6 mr-3 text-[#C62828] dark:text-[#FFD54F]" />
            Récompenses disponibles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rewards.map((reward, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                  reward.unlocked
                    ? 'bg-gradient-to-br from-[#C62828] to-[#8B0000] border-[#C62828] text-white'
                    : 'bg-gray-50 dark:bg-[#2a2a2a] border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <Gift className={`w-8 h-8 ${reward.unlocked ? 'text-[#FFD54F]' : ''}`} />
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                    reward.unlocked ? 'bg-[#FFD54F] text-[#121212]' : 'bg-gray-200 dark:bg-gray-700'
                  }`}>
                    {reward.stamps} tampons
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-1">{reward.title}</h3>
                <p className={`text-sm ${reward.unlocked ? 'text-white/90' : ''}`}>
                  {reward.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-[#C62828] to-[#8B0000] rounded-3xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">
            Prêt à gagner plus de tampons ?
          </h2>
          <p className="mb-6 opacity-90">
            Commandez maintenant et rapprochez-vous de votre prochaine récompense
          </p>
          <Button
            onClick={() => navigate('/menu')}
            className="bg-[#FFD54F] hover:bg-[#FFC107] text-[#121212] px-8 py-6 rounded-2xl font-bold shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            Commander maintenant
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Loyalty;
