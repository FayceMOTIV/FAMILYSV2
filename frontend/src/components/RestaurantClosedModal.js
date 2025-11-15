import React from 'react';
import { XCircle } from 'lucide-react';

export const RestaurantClosedModal = ({ isOpen, onClose, reason }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-scale-in">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
          
          <h2 className="text-2xl font-black text-gray-900 mb-3">
            Restaurant fermé
          </h2>
          
          <p className="text-gray-600 mb-6">
            {reason || "Désolé, nous ne prenons plus de commandes pour aujourd'hui."}
          </p>
          
          <p className="text-sm text-gray-500 mb-6">
            Nous serons ravis de vous accueillir demain !
          </p>
          
          <button
            onClick={onClose}
            className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary/90 transition-colors"
          >
            J'ai compris
          </button>
        </div>
      </div>
    </div>
  );
};
