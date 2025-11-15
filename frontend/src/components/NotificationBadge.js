import React from 'react';
import { Bell } from 'lucide-react';

export const NotificationBadge = ({ count, onClick }) => {
  if (count === 0) return null;

  return (
    <button
      onClick={onClick}
      className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
    >
      <Bell className="w-6 h-6 text-gray-700" />
      {count > 0 && (
        <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  );
};
