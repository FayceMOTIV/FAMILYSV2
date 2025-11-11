import React from 'react';
import { Award, Star, Gift, TrendingUp, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

const MobileLoyalty = () => {
  const { user, loyaltyStamps, login } = useApp();
  const navigate = useNavigate();
  const totalStamps = 10;
  const progress = (loyaltyStamps / totalStamps) * 100;

  const handleLogin = () => {
    login();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#FAFAFA] dark:bg-[#121212]">
        <div className="max-w-md w-full bg-white dark:bg-[#1a1a1a] rounded-[32px] p-8 shadow-2xl text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-[#FFD54F] to-[#FFC107] rounded-full flex items-center justify-center mx-auto mb-6">
            <Award className="w-12 h-12 text-[#121212]" />
          </div>
          <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-4">
            Carte de Fidélité
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Connectez-vous pour accéder à votre carte et profiter de récompenses
          </p>
          <Button
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-[#C62828] to-[#8B0000] text-white py-7 rounded-full text-lg font-bold active:scale-95"
          >
            Se connecter
          </Button>
        </div>
      </div>
    );
  }

  const rewards = [
    { stamps: 5, title: 'Réduc 10%', description: 'Sur ta prochaine commande', icon: '🎫', unlocked: loyaltyStamps >= 5 },
    { stamps: 10, title: 'Menu offert', description: "Menu Family's gratuit", icon: '🍔', unlocked: loyaltyStamps >= 10 },
    { stamps: 20, title: 'Dessert offert', description: 'Dessert au choix', icon: '🍰', unlocked: loyaltyStamps >= 20 },
    { stamps: 30, title: 'Menu King offert', description: 'Notre signature', icon: '👑', unlocked: loyaltyStamps >= 30 }
  ];

  return (
    <div className="bg-[#FAFAFA] dark:bg-[#121212] min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#FFD54F] to-[#FFC107] pt-8 pb-8 px-4">
        <div className="text-center text-[#121212]">
          <Award className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-black mb-2">Ma Carte Fidélité</h1>
          <p className="text-lg font-semibold">
            Collecte des tampons et débloque des récompenses
          </p>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Loyalty Card */}
        <div className="bg-gradient-to-br from-[#C62828] via-[#8B0000] to-[#C62828] rounded-[32px] p-6 shadow-2xl text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-sm opacity-90 mb-1">Membre</div>
                <div className="text-2xl font-black">{user.name}</div>
              </div>
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center p-1">
                <img 
                  src="https://customer-assets.emergentagent.com/job_foodie-hub-21/artifacts/ybj62fs7_logo%20family%27s%20ok%20%21.png" 
                  alt="Family's"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-bold">Progression</span>
                <span className="text-3xl font-black">{loyaltyStamps} / {totalStamps}</span>
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#FFD54F] rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-sm opacity-90 mt-2 text-center">
                {totalStamps - loyaltyStamps > 0
                  ? `🎯 Plus que ${totalStamps - loyaltyStamps} commande${totalStamps - loyaltyStamps > 1 ? 's' : ''} !`
                  : '🎉 Félicitations ! Récompense débloquée !'}
              </div>
            </div>

            {/* Stamps Grid */}
            <div className="grid grid-cols-5 gap-2">
              {[...Array(totalStamps)].map((_, idx) => (
                <div
                  key={idx}
                  className={`aspect-square rounded-2xl border-2 border-dashed transition-all duration-300 flex items-center justify-center ${
                    idx < loyaltyStamps
                      ? 'bg-[#FFD54F] border-[#FFD54F] scale-105'
                      : 'bg-white/10 border-white/30'
                  }`}
                >
                  {idx < loyaltyStamps ? (
                    <Star className="w-5 h-5 text-[#121212] fill-[#121212]" />
                  ) : (
                    <span className="text-white/50 text-sm font-bold">{idx + 1}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* How it Works */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-[32px] p-6 shadow-lg">
          <h2 className="text-xl font-black text-gray-800 dark:text-white mb-5 flex items-center">
            <TrendingUp className="w-6 h-6 mr-3 text-[#C62828] dark:text-[#FFD54F]" />
            Comment ça marche ?
          </h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-[#C62828] dark:bg-[#FFD54F] rounded-full flex items-center justify-center text-white dark:text-[#121212] font-black flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-bold text-gray-800 dark:text-white mb-1">Commande</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Chaque commande > 8€ = 1 tampon
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-[#C62828] dark:bg-[#FFD54F] rounded-full flex items-center justify-center text-white dark:text-[#121212] font-black flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-bold text-gray-800 dark:text-white mb-1">Collecte</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Accumule 10 tampons sur ta carte
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-[#C62828] dark:bg-[#FFD54F] rounded-full flex items-center justify-center text-white dark:text-[#121212] font-black flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-bold text-gray-800 dark:text-white mb-1">Profite</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Menu gratuit jusqu'à 12€ offert !
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Rewards */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-[32px] p-6 shadow-lg">
          <h2 className="text-xl font-black text-gray-800 dark:text-white mb-5 flex items-center">
            <Gift className="w-6 h-6 mr-3 text-[#C62828] dark:text-[#FFD54F]" />
            Récompenses
          </h2>
          <div className="space-y-3">
            {rewards.map((reward, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-3xl transition-all duration-300 ${
                  reward.unlocked
                    ? 'bg-gradient-to-br from-[#C62828] to-[#8B0000] text-white'
                    : 'bg-gray-50 dark:bg-[#2a2a2a] text-gray-400 dark:text-gray-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="text-3xl">{reward.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold">{reward.title}</h3>
                      <p className={`text-sm ${reward.unlocked ? 'text-white/90' : ''}`}>
                        {reward.description}
                      </p>
                    </div>
                  </div>
                  <div className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                    reward.unlocked ? 'bg-[#FFD54F] text-[#121212]' : 'bg-gray-200 dark:bg-gray-700'
                  }`}>
                    {reward.stamps}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-[#C62828] to-[#8B0000] rounded-[32px] p-6 text-white text-center shadow-xl">
          <h2 className="text-xl font-black mb-3">
            Prêt à gagner plus ?
          </h2>
          <p className="mb-5 opacity-90">
            Commande maintenant et gagne ton prochain tampon
          </p>
          <Button
            onClick={() => navigate('/menu')}
            className="w-full bg-[#FFD54F] hover:bg-[#FFC107] text-[#121212] py-7 rounded-full text-lg font-black shadow-lg active:scale-95"
          >
            Commander
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>

      {/* Spacing for bottom nav */}
      <div className="h-8"></div>
    </div>
  );
};

export default MobileLoyalty;
