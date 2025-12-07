import React from 'react';
import { NavLink } from 'react-router-dom';

export const SurpriseDuJourTabs = () => {
  const tabs = [
    { path: '/surprise-du-jour', label: 'Dashboard', icon: '📊' },
    { path: '/surprise-du-jour/configuration', label: 'Configuration', icon: '⚙️' },
    { path: '/surprise-du-jour/rewards', label: 'Récompenses', icon: '🏆' }
  ];

  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="flex space-x-4">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            end={tab.path === '/surprise-du-jour'}
            className={({ isActive }) =>
              `px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`
            }
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default SurpriseDuJourTabs;
