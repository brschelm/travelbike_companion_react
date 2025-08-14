import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapIcon,
  ChartBarIcon,
  CogIcon,
  AcademicCapIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Import tras', href: '/import-routes', icon: CloudArrowUpIcon },
  { name: 'Analiza aktywności', href: '/activity-analysis', icon: ChartBarIcon },
  { name: 'Statystyki', href: '/statistics', icon: ChartBarIcon },
  { name: 'Analiza postępów', href: '/progress-analysis', icon: ChartBarIcon },
  { name: 'Plany Treningowe', href: '/training-plans', icon: AcademicCapIcon },
  { name: 'Ustawienia', href: '/settings', icon: CogIcon },
];

const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <motion.div
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className="w-64 bg-white shadow-lg border-r border-gray-200 min-h-screen"
    >
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Menu</h2>
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </motion.div>
  );
};

export default Sidebar;
