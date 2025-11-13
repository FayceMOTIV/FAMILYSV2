import React, { useState, useEffect } from 'react';
import { promotionsAPI } from '../services/promotionsAPI';

const PromoBadge = ({ productId, categoryId, className = '' }) => {
  const [promo, setPromo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPromotion = async () => {
      try {
        const response = await promotionsAPI.getActive();
        const allPromos = response.promotions || [];
        
        // Find the first applicable promotion with a badge
        const applicablePromo = allPromos.find(p => {
          // Check if promotion has a badge
          if (!p.badge_text) return false;
          
          // Check if product is eligible
          const productMatch = p.eligible_products?.includes(productId);
          const categoryMatch = p.eligible_categories?.includes(categoryId);
          
          // Check time/date restrictions
          const now = new Date();
          const today = now.toISOString().split('T')[0];
          const currentTime = now.toTimeString().split(' ')[0].substring(0, 5); // HH:MM
          const currentDay = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][now.getDay()];
          
          // Date check
          if (p.start_date > today || p.end_date < today) return false;
          
          // Time check (for Happy Hour type promotions)
          if (p.start_time && p.end_time) {
            if (currentTime < p.start_time || currentTime > p.end_time) return false;
          }
          
          // Day check
          if (p.days_active && p.days_active.length > 0) {
            if (!p.days_active.includes(currentDay)) return false;
          }
          
          return productMatch || categoryMatch;
        });
        
        setPromo(applicablePromo);
      } catch (error) {
        console.error('Error loading promotion badge:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPromotion();
  }, [productId, categoryId]);

  if (loading || !promo) {
    return null;
  }

  return (
    <div className={`absolute top-2 left-2 z-10 ${className}`}>
      <span 
        className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg animate-pulse"
        style={{ backgroundColor: promo.badge_color || '#FF6B35' }}
      >
        {promo.badge_text}
      </span>
    </div>
  );
};

export default PromoBadge;
