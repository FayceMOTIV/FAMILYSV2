import React from 'react';
import { Card } from './Card';

export const PromotionCalendar = ({ promotions }) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  
  const getMonthData = () => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };
  
  const getPromosForDay = (day) => {
    if (!day) return [];
    
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    return promotions.filter(promo => {
      return promo.start_date <= dateStr && promo.end_date >= dateStr;
    });
  };
  
  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  
  return (
    <Card>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">{monthNames[month]} {year}</h2>
        
        <div className="grid grid-cols-7 gap-2">
          {dayNames.map(day => (
            <div key={day} className="text-center font-bold text-gray-600 p-2">
              {day}
            </div>
          ))}
          
          {getMonthData().map((day, index) => {
            const promos = getPromosForDay(day);
            const isToday = day === today.getDate();
            
            return (
              <div
                key={index}
                className={`min-h-24 p-2 border rounded ${
                  day ? 'bg-white' : 'bg-gray-50'
                } ${
                  isToday ? 'border-primary border-2 bg-primary/5' : ''
                }`}
              >
                {day && (
                  <>
                    <div className="font-bold text-sm mb-1">{day}</div>
                    <div className="space-y-1">
                      {promos.slice(0, 3).map(promo => (
                        <div
                          key={promo.id}
                          className="text-xs p-1 rounded truncate"
                          style={{backgroundColor: promo.badge_color || '#FF6B35', color: 'white'}}
                          title={promo.name}
                        >
                          {promo.name}
                        </div>
                      ))}
                      {promos.length > 3 && (
                        <div className="text-xs text-gray-500">+{promos.length - 3}</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};