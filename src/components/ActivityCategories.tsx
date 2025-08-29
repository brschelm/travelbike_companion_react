import React, { useState } from 'react';
import { useStrava } from '../contexts/StravaContext';
import { motion } from 'framer-motion';
import { 
  TruckIcon, 
  PlayIcon, 
  ClockIcon, 
  MapPinIcon,
  CalendarIcon 
} from '@heroicons/react/24/outline';

const ActivityCategories: React.FC = () => {
  const { 
    cyclingActivities, 
    runningActivities, 
    otherActivities,
    refreshCyclingActivities,
    refreshRunningActivities,
    loading 
  } = useStrava();

  const [activeTab, setActiveTab] = useState<'cycling' | 'running' | 'other'>('running');

  const formatDistance = (distance: number) => {
    return (distance / 1000).toFixed(2);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Sprawdź czy data jest prawidłowa
      if (isNaN(date.getTime())) {
        return 'Nieprawidłowa data';
      }
      return date.toLocaleDateString('pl-PL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      return 'Błąd daty';
    }
  };

  const renderActivityCard = (activity: any, index: number) => (
    <motion.div
      key={activity.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          {activity.type === 'Ride' || activity.type === 'VirtualRide' || activity.type === 'EBikeRide' ? (
            <TruckIcon className="w-5 h-5 text-blue-600" />
          ) : activity.type === 'Run' || activity.type === 'VirtualRun' || activity.type === 'TrailRun' ? (
            <PlayIcon className="w-5 h-5 text-green-600" />
          ) : (
            <div className="w-5 h-5 bg-gray-400 rounded-full" />
          )}
          <span className="font-semibold text-gray-900">{activity.name || 'Bez nazwy'}</span>
        </div>
        <span className="text-sm text-gray-500">{formatDate(activity.start_date)}</span>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="flex items-center space-x-1">
          <MapPinIcon className="w-4 h-4 text-gray-400" />
          <span className="text-gray-700">{formatDistance(activity.distance)} km</span>
        </div>
        <div className="flex items-center space-x-1">
          <ClockIcon className="w-4 h-4 text-gray-400" />
          <span className="text-gray-700">{formatDuration(activity.moving_time)}</span>
        </div>
        <div className="flex items-center space-x-1">
          <CalendarIcon className="w-4 h-4 text-gray-400" />
          <span className="text-gray-700">{activity.total_elevation_gain}m</span>
        </div>
      </div>

      {activity.average_speed && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Średnia prędkość: {(activity.average_speed * 3.6).toFixed(1)} km/h</span>
            {activity.average_heartrate && (
              <span>Średnie tętno: {activity.average_heartrate} bpm</span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'cycling':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Aktywności rowerowe ({cyclingActivities.length})
              </h3>
              <button
                onClick={refreshCyclingActivities}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors duration-200 disabled:opacity-50"
              >
                {loading ? 'Odświeżanie...' : 'Odśwież rowerowe'}
              </button>
            </div>
            {cyclingActivities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <TruckIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p>Brak aktywności rowerowych</p>
                <p className="text-sm">Połącz się ze Strava i odśwież dane</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cyclingActivities.map((activity, index) => renderActivityCard(activity, index))}
              </div>
            )}
          </div>
        );

      case 'running':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Aktywności biegowe ({runningActivities.length})
              </h3>
              <button
                onClick={refreshRunningActivities}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors duration-200 disabled:opacity-50"
              >
                {loading ? 'Odświeżanie...' : 'Odśwież biegowe'}
              </button>
            </div>
            {runningActivities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <PlayIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p>Brak aktywności biegowych</p>
                <p className="text-sm">Połącz się ze Strava i odśwież dane</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {runningActivities.map((activity, index) => renderActivityCard(activity, index))}
              </div>
            )}
          </div>
        );

      case 'other':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Inne aktywności ({otherActivities.length})
              </h3>
            </div>
            {otherActivities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="w-12 h-12 mx-auto bg-gray-300 rounded-full mb-3" />
                <p>Brak innych aktywności</p>
                <p className="text-sm">Połącz się ze Strava i odśwież dane</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {otherActivities.map((activity, index) => renderActivityCard(activity, index))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('running')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'running'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <PlayIcon className="w-5 h-5" />
              <span>Bieganie ({runningActivities.length})</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('cycling')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'cycling'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <TruckIcon className="w-5 h-5" />
              <span>Rower ({cyclingActivities.length})</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('other')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'other'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-gray-400 rounded-full" />
              <span>Inne ({otherActivities.length})</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
};

export default ActivityCategories;
