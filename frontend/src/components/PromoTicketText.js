import React from 'react';
import { Sparkles, Tag } from 'lucide-react';

/**
 * Component to display promotion ticket text on order confirmation/receipt
 * Shows applied promotions with their custom ticket text
 */
const PromoTicketText = ({ appliedPromotions = [] }) => {
  if (!appliedPromotions || appliedPromotions.length === 0) {
    return null;
  }

  const promosWithTicketText = appliedPromotions.filter(p => p.ticket_text);

  if (promosWithTicketText.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-2 border-yellow-200 dark:border-yellow-700 rounded-2xl p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Tag className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        <span className="font-bold text-amber-800 dark:text-amber-200">
          Promotion{promosWithTicketText.length > 1 ? 's' : ''} appliquée{promosWithTicketText.length > 1 ? 's' : ''}
        </span>
      </div>
      <div className="space-y-2">
        {promosWithTicketText.map((promo, idx) => (
          <div key={idx} className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-1 flex-shrink-0" />
            <p className="text-sm text-amber-900 dark:text-amber-100 font-medium">
              {promo.ticket_text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PromoTicketText;
