import React, { useState, useEffect } from 'react';
import { promotionsAPI } from '../services/promotionsAPI';
import { Sparkles } from 'lucide-react';

const PromotionBanner = () => {
  const [promotions, setPromotions] = useState([]);
  const [currentPromo, setCurrentPromo] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPromotions = async () => {
      try {
        const banners = await promotionsAPI.getBanners();
        setPromotions(banners);
      } catch (error) {
        console.error('Error loading promotion banners:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPromotions();
  }, []);

  useEffect(() => {
    if (promotions.length > 1) {
      const interval = setInterval(() => {
        setCurrentPromo((prev) => (prev + 1) % promotions.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [promotions.length]);

  if (loading || promotions.length === 0) {
    return null;
  }

  return (
    <section className="px-4 relative z-20 mb-8">
      <div className="bg-white dark:bg-[#1a1a1a] rounded-[32px] shadow-2xl overflow-hidden">
        <div className="relative h-48">
          {promotions.map((promo, idx) => (
            <div
              key={promo.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                idx === currentPromo ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {promo.banner_image ? (
                <img
                  src={promo.banner_image}
                  alt={promo.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div 
                  className="w-full h-full"
                  style={{
                    background: `linear-gradient(135deg, ${promo.badge_color || '#FF6B35'} 0%, ${adjustColor(promo.badge_color || '#FF6B35', -20)} 100%)`
                  }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end">
                <div className="p-6 text-white w-full">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-[#FFD54F]" />
                    <span className="text-xs font-bold text-[#FFD54F] uppercase tracking-wide">
                      Promotion
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-1">{promo.name}</h3>
                  <p className="text-sm text-white/90">{promo.banner_text || promo.description}</p>
                  {promo.discount_value && (
                    <div className="mt-3 inline-block">
                      <span 
                        className="px-4 py-2 rounded-full font-black text-lg text-white shadow-lg"
                        style={{ backgroundColor: promo.badge_color || '#FF6B35' }}
                      >
                        {promo.badge_text || `-${promo.discount_value}${promo.discount_type === 'percentage' ? '%' : '€'}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {promotions.length > 1 && (
          <div className="flex justify-center space-x-2 py-3 bg-white dark:bg-[#1a1a1a]">
            {promotions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPromo(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentPromo ? 'bg-[#C62828] w-8' : 'bg-gray-300 dark:bg-gray-600 w-2'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// Helper function to darken color
function adjustColor(color, amount) {
  const clamp = (val) => Math.min(255, Math.max(0, val));
  const num = parseInt(color.replace('#', ''), 16);
  const r = clamp((num >> 16) + amount);
  const g = clamp(((num >> 8) & 0x00FF) + amount);
  const b = clamp((num & 0x0000FF) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export default PromotionBanner;
