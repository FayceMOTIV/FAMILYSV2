import React from 'react';
import { Card } from './Card';

export const PromotionCalendar = ({ promotions, currentDate = new Date(), view = 'month' }) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  
  const getMonthData = (targetYear, targetMonth) => {
    const firstDay = new Date(targetYear, targetMonth, 1);
    const lastDay = new Date(targetYear, targetMonth + 1, 0);
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
  
  const getPromosForDay = (targetYear, targetMonth, day) => {
    if (!day) return [];
    
    const dateStr = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    return promotions.filter(promo => {
      return promo.start_date <= dateStr && promo.end_date >= dateStr;
    });
  };
  
  const getPromosForMonth = (targetYear, targetMonth) => {
    const firstDay = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(targetYear, targetMonth + 1, 0).getDate();
    const lastDayStr = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    
    return promotions.filter(promo => {
      // Check if promo overlaps with this month
      return !(promo.end_date < firstDay || promo.start_date > lastDayStr);
    });
  };
  
  // Month view
  if (view === 'month') {
    const days = getMonthData(year, month);
    
    return (
      <Card>
        <div className="p-6">
          <div className="grid grid-cols-7 gap-2">
            {dayNames.map(day => (
              <div key={day} className="text-center font-bold text-gray-600 p-2">
                {day}
              </div>
            ))}
            
            {days.map((day, index) => {
              const promos = day ? getPromosForDay(year, month, day) : [];
              const isToday = day === new Date().getDate() && 
                             month === new Date().getMonth() && 
                             year === new Date().getFullYear();
              
              return (
                <div
                  key={index}
                  className={`min-h-24 p-2 border rounded ${
                    day ? 'bg-white hover:bg-gray-50' : 'bg-gray-50'
                  } ${isToday ? 'border-primary border-2 bg-primary/5' : ''}`}
                >
                  {day && (
                    <>
                      <div className={`text-sm font-bold mb-1 ${isToday ? 'text-primary' : ''}`}>
                        {day}
                      </div>
                      {promos.length > 0 && (
                        <div className="space-y-1">
                          {promos.slice(0, 3).map((promo, idx) => (
                            <div
                              key={idx}
                              className="text-xs bg-gradient-to-r from-orange-400 to-red-500 text-white px-2 py-1 rounded truncate"
                              title={promo.name}
                            >
                              {promo.name}
                            </div>
                          ))}
                          {promos.length > 3 && (
                            <div className="text-xs text-gray-500 font-medium">
                              +{promos.length - 3} autres
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    );
  }
  
  // Year view
  if (view === 'year') {
    return (
      <Card>
        <div className="p-6">
          <div className="grid grid-cols-3 gap-6">
            {monthNames.map((monthName, monthIndex) => {
              const monthPromos = getPromosForMonth(year, monthIndex);
              const isCurrentMonth = monthIndex === new Date().getMonth() && year === new Date().getFullYear();
              
              return (
                <Card 
                  key={monthIndex} 
                  className={`p-4 ${isCurrentMonth ? 'border-2 border-primary bg-primary/5' : 'border'}`}
                >
                  <h3 className={`font-bold text-center mb-3 ${isCurrentMonth ? 'text-primary' : ''}`}>
                    {monthName}
                  </h3>
                  
                  {/* Mini calendar */}
                  <div className="grid grid-cols-7 gap-1 mb-3">
                    {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((d, i) => (
                      <div key={i} className="text-xs text-center text-gray-500 font-medium">
                        {d}
                      </div>
                    ))}
                    
                    {getMonthData(year, monthIndex).map((day, idx) => {
                      const dayPromos = day ? getPromosForDay(year, monthIndex, day) : [];
                      const isToday = day === new Date().getDate() && 
                                     monthIndex === new Date().getMonth() && 
                                     year === new Date().getFullYear();
                      
                      return (
                        <div
                          key={idx}
                          className={`text-xs text-center p-1 rounded ${
                            day ? (dayPromos.length > 0 ? 'bg-orange-400 text-white font-bold' : 'bg-gray-50') : ''
                          } ${isToday ? 'ring-2 ring-primary' : ''}`}
                        >
                          {day || ''}
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Promo count */}
                  <div className="text-center">
                    {monthPromos.length > 0 ? (
                      <div className="text-sm">
                        <span className="font-bold text-primary">{monthPromos.length}</span>
                        <span className="text-gray-600"> promo{monthPromos.length > 1 ? 's' : ''}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Aucune promo</span>
                    )}
                    
                    {monthPromos.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {monthPromos.slice(0, 2).map((promo, idx) => (
                          <div
                            key={idx}
                            className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded truncate"
                            title={promo.name}
                          >
                            {promo.name}
                          </div>
                        ))}
                        {monthPromos.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{monthPromos.length - 2}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </Card>
    );
  }
  
  return null;
};
