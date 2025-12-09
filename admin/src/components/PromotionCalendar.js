import React, { useState } from 'react';
import { Card } from './Card';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

export const PromotionCalendar = ({ promotions }) => {
  // State pour la navigation
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // month ou year
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  
  // Navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  const goToPreviousYear = () => {
    setCurrentDate(new Date(year - 1, month, 1));
  };
  
  const goToNextYear = () => {
    setCurrentDate(new Date(year + 1, month, 1));
  };
  
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
      if (!promo.is_active) return false;
      return promo.start_date <= dateStr && promo.end_date >= dateStr;
    });
  };
  
  const getPromosForMonth = (targetYear, targetMonth) => {
    const firstDay = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(targetYear, targetMonth + 1, 0).getDate();
    const lastDayStr = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    
    return promotions.filter(promo => {
      if (!promo.is_active) return false;
      return !(promo.end_date < firstDay || promo.start_date > lastDayStr);
    });
  };
  
  // Vérifier si c'est le mois actuel
  const isCurrentMonth = month === new Date().getMonth() && year === new Date().getFullYear();
  
  // Month view
  if (view === 'month') {
    const days = getMonthData(year, month);
    
    return (
      <Card>
        <div className="p-6">
          {/* Header avec navigation */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Mois précédent"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              
              <h2 className="text-xl font-bold text-gray-800 min-w-48 text-center">
                {monthNames[month]} {year}
              </h2>
              
              <button
                onClick={goToNextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Mois suivant"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            {!isCurrentMonth && (
              <button
                onClick={goToToday}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                <Calendar className="w-4 h-4" />
                Aujourd'hui
              </button>
            )}
          </div>
          
          {/* Calendrier */}
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
                  className={`min-h-24 p-2 border rounded-lg transition-all ${
                    day ? 'bg-white hover:bg-gray-50 hover:shadow-sm' : 'bg-gray-50'
                  } ${isToday ? 'border-primary border-2 bg-primary/5 shadow-md' : 'border-gray-200'}`}
                >
                  {day && (
                    <>
                      <div className={`text-sm font-bold mb-1 ${isToday ? 'text-primary' : 'text-gray-700'}`}>
                        {day}
                      </div>
                      {promos.length > 0 && (
                        <div className="space-y-1">
                          {promos.slice(0, 3).map((promo, idx) => (
                            <div
                              key={idx}
                              className="text-xs text-white px-2 py-1 rounded truncate cursor-pointer hover:opacity-90"
                              style={{ backgroundColor: promo.badge_color || '#f97316' }}
                              title={`${promo.name} - ${promo.discount_value}${promo.type?.includes('percent') || promo.type === 'conditional_discount' ? '%' : '€'}`}
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
          
          {/* Légende */}
          <div className="mt-6 pt-4 border-t flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span>Promotion active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary rounded bg-primary/10"></div>
                <span>Aujourd'hui</span>
              </div>
            </div>
            <div>
              {promotions.filter(p => p.is_active).length} promotion(s) active(s) au total
            </div>
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
          {/* Header avec navigation année */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousYear}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Année précédente"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              
              <h2 className="text-xl font-bold text-gray-800 min-w-24 text-center">
                {year}
              </h2>
              
              <button
                onClick={goToNextYear}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Année suivante"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            {year !== new Date().getFullYear() && (
              <button
                onClick={goToToday}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                <Calendar className="w-4 h-4" />
                Année actuelle
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-3 gap-6">
            {monthNames.map((monthName, monthIndex) => {
              const monthPromos = getPromosForMonth(year, monthIndex);
              const isCurrentMonthYear = monthIndex === new Date().getMonth() && year === new Date().getFullYear();
              
              return (
                <Card 
                  key={monthIndex} 
                  className={`p-4 cursor-pointer hover:shadow-lg transition-shadow ${
                    isCurrentMonthYear ? 'border-2 border-primary bg-primary/5' : 'border hover:border-gray-300'
                  }`}
                  onClick={() => {
                    setCurrentDate(new Date(year, monthIndex, 1));
                  }}
                >
                  <h3 className={`font-bold text-center mb-3 ${isCurrentMonthYear ? 'text-primary' : ''}`}>
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
                      const isTodayDay = day === new Date().getDate() && 
                                     monthIndex === new Date().getMonth() && 
                                     year === new Date().getFullYear();
                      
                      return (
                        <div
                          key={idx}
                          className={`text-xs text-center p-1 rounded ${
                            day ? (dayPromos.length > 0 ? 'bg-orange-400 text-white font-bold' : 'bg-gray-50') : ''
                          } ${isTodayDay ? 'ring-2 ring-primary' : ''}`}
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
                            className="text-xs text-white px-2 py-1 rounded truncate"
                            style={{ backgroundColor: promo.badge_color || '#f97316' }}
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
