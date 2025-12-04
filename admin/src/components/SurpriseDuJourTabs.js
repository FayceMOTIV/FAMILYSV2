import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Sliders, Tag, Zap, Settings, Package } from 'lucide-react';

const tabs = [
  { name: 'Dashboard', path: '/surprise-du-jour', icon: LayoutDashboard, exact: true },
  { name: 'Probabilités', path: '/surprise-du-jour/probabilities', icon: Sliders },
  { name: 'Récompenses', path: '/surprise-du-jour/rewards', icon: Tag },
  { name: 'Anti-triche', path: '/surprise-du-jour/anti-cheat', icon: Zap },
  { name: 'Paramètres', path: '/surprise-du-jour/settings', icon: Settings },
  { name: 'Test', path: '/surprise-du-jour/test', icon: Package },
];

export const SurpriseDuJourTabs = () => {
  const location = useLocation();

  return (
    <div className="bg-white border-b border-gray-200 mb-6">
      <div className="flex space-x-1 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.exact 
            ? location.pathname === tab.path
            : location.pathname.startsWith(tab.path);
          
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              end={tab.exact}
              className={`
                flex items-center space-x-2 px-6 py-4 border-b-2 transition-all whitespace-nowrap
                ${isActive 
                  ? 'border-primary text-primary font-semibold bg-primary/5' 
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span>{tab.name}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};
