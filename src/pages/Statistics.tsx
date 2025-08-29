import React, { useMemo } from 'react';
import { useStrava } from '../contexts/StravaContext';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrophyIcon, FireIcon, ClockIcon, MapIcon, TruckIcon, UserIcon } from '@heroicons/react/24/outline';
import { calculateCategoryStats, groupActivitiesByCategory } from '../utils/activityUtils';
import { ACTIVITY_CATEGORIES } from '../types';

const Statistics: React.FC = () => {
  const { categorizedActivities, isConnected } = useStrava();

  const stats = useMemo(() => {
    if (!categorizedActivities.length) return null;

    const activitiesWithDates = categorizedActivities.map(activity => ({
      ...activity,
      start_date: new Date(activity.start_date),
      distance_km: activity.distance / 1000,
      moving_time_hours: activity.moving_time / 3600,
      avg_speed: (activity.distance / 1000) / (activity.moving_time / 3600)
    }));

    // Filtruj nierealistyczne prędkości (np. błędy w danych Strava)
    const realisticActivities = activitiesWithDates.filter(activity => {
      // Maksymalna realistyczna prędkość: 50 km/h dla roweru, 25 km/h dla biegu, 30 km/h dla innych
      const maxRealisticSpeed = activity.category === ACTIVITY_CATEGORIES.CYCLING ? 50 : 
                               activity.category === ACTIVITY_CATEGORIES.RUNNING ? 25 : 30;
      
      return activity.avg_speed <= maxRealisticSpeed && activity.avg_speed > 0;
    });

    // Jeśli nie ma realistycznych aktywności, użyj wszystkich
    const activitiesToUse = realisticActivities.length > 0 ? realisticActivities : activitiesWithDates;

    const totalDistance = activitiesToUse.reduce((sum, activity) => sum + activity.distance_km, 0);
    const totalTime = activitiesToUse.reduce((sum, activity) => sum + activity.moving_time_hours, 0);
    const avgSpeed = totalDistance / totalTime;
    const longestRide = Math.max(...activitiesToUse.map(activity => activity.distance_km));
    const fastestRide = Math.max(...activitiesToUse.map(activity => activity.avg_speed));

    // Statystyki kategorii
    const categoryStats = {
      cycling: calculateCategoryStats(categorizedActivities, ACTIVITY_CATEGORIES.CYCLING),
      running: calculateCategoryStats(categorizedActivities, ACTIVITY_CATEGORIES.RUNNING),
      other: calculateCategoryStats(categorizedActivities, ACTIVITY_CATEGORIES.OTHER)
    };

    // Podział na kategorie dla wykresu kołowego
         const categoryBreakdown = [
       { name: 'Rower', value: categoryStats?.cycling?.count || 0, color: '#3B82F6' },
       { name: 'Bieg', value: categoryStats?.running?.count || 0, color: '#10B981' },
       { name: 'Inne', value: categoryStats?.other?.count || 0, color: '#F59E0B' }
     ].filter(item => item.value > 0);

    // Oblicz proste średnie tygodniowe na podstawie całkowitego okresu
    // (dzielimy przez liczbę tygodni od pierwszej do ostatniej aktywności)
    const firstActivity = activitiesToUse[0];
    const lastActivity = activitiesToUse[activitiesToUse.length - 1];
    
    let totalWeeks = 1;
    if (firstActivity && lastActivity) {
      const timeDiff = lastActivity.start_date.getTime() - firstActivity.start_date.getTime();
      totalWeeks = Math.max(1, Math.ceil(timeDiff / (1000 * 60 * 60 * 24 * 7)));
    }
    
    const avgWeeklyDistance = totalWeeks > 0 ? totalDistance / totalWeeks : 0;
    const avgWeeklyTime = totalWeeks > 0 ? totalTime / totalWeeks : 0;
    const avgWeeklyActivities = totalWeeks > 0 ? activitiesToUse.length / totalWeeks : 0;

    // Monthly distribution
    const monthlyDistribution = activitiesWithDates.reduce((acc: any[], activity) => {
      const month = activity.start_date.getMonth();
      acc[month] = (acc[month] || 0) + activity.distance_km;
      return acc;
    }, new Array(12).fill(0));

    const monthNames = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 
                       'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];

    const monthlyData = monthNames.map((name, index) => ({
      month: name,
      distance: monthlyDistribution[index]
    }));

    return {
      totalDistance,
      totalTime,
      avgSpeed,
      longestRide,
      fastestRide,
      totalRides: activitiesToUse.length,
      monthlyData,
      categoryStats,
      categoryBreakdown,
      // Dodaj poprawione średnie tygodniowe
      avgWeeklyDistance,
      avgWeeklyTime,
      avgWeeklyActivities,
      // Dodaj informację o filtrowaniu
      filteredActivities: activitiesToUse.length !== activitiesWithDates.length,
      totalActivities: activitiesWithDates.length
    };
  }, [categorizedActivities]);

  if (!isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
          <TrophyIcon className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Brak połączenia ze Strava</h3>
          <p className="text-yellow-700">Połącz się ze Strava, aby zobaczyć statystyki.</p>
        </div>
      </motion.div>
    );
  }

  if (!stats) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
          <MapIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-blue-800 mb-2">Brak danych</h3>
          <p className="text-blue-700">Brak aktywności do wyświetlenia.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Statystyki aktywności</h1>
        <p className="text-lg text-gray-600">Kompleksowy przegląd Twoich osiągnięć rowerowych, biegowych i innych</p>
      </div>

      {/* Category Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cycling Stats */}
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                             <TruckIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Rower</h3>
              <p className="text-sm text-gray-600">Aktywności rowerowe</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Liczba:</span>
              <span className="font-semibold">{stats.categoryStats?.cycling?.count || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Dystans:</span>
              <span className="font-semibold">{(stats.categoryStats?.cycling?.totalDistance || 0).toFixed(1)} km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Czas:</span>
              <span className="font-semibold">{(stats.categoryStats?.cycling?.totalTime || 0).toFixed(1)} h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Prędkość:</span>
              <span className="font-semibold">{(stats.categoryStats?.cycling?.averageSpeed || 0).toFixed(1)} km/h</span>
            </div>
          </div>
        </motion.div>

        {/* Running Stats */}
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                             <UserIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Bieg</h3>
              <p className="text-sm text-gray-600">Aktywności biegowe</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Aktywności:</span>
              <span className="font-semibold">{stats.categoryStats?.running?.count || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Dystans:</span>
              <span className="font-semibold">{(stats.categoryStats?.running?.totalDistance || 0).toFixed(1)} km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Czas:</span>
              <span className="font-semibold">{(stats.categoryStats?.running?.totalTime || 0).toFixed(1)} h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Prędkość:</span>
              <span className="font-semibold">{(stats.categoryStats?.running?.averageSpeed || 0).toFixed(1)} km/h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tempo (min/km):</span>
              <span className="font-semibold">
                {(stats.categoryStats?.running?.averageSpeed || 0) > 0 
                  ? (60 / (stats.categoryStats?.running?.averageSpeed || 1)).toFixed(1)
                  : '0.0'
                }
              </span>
            </div>
            {(stats.categoryStats?.running?.count || 0) > 0 && (
              <div className="mt-3 p-2 bg-green-50 rounded-lg">
                <p className="text-xs text-green-700 text-center">
                  💡 Sprawdź czy biegałeś w strefie 2 na stronie "Strefy treningowe"
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Other Stats */}
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <FireIcon className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Inne</h3>
              <p className="text-sm text-gray-600">Pozostałe aktywności</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Liczba:</span>
              <span className="font-semibold">{stats.categoryStats?.other?.count || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Dystans:</span>
              <span className="font-semibold">{(stats.categoryStats?.other?.totalDistance || 0).toFixed(1)} km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Czas:</span>
              <span className="font-semibold">{(stats.categoryStats?.other?.totalTime || 0).toFixed(1)} h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Prędkość:</span>
              <span className="font-semibold">{(stats.categoryStats?.other?.averageSpeed || 0).toFixed(1)} km/h</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <MapIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Łączny dystans</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDistance.toFixed(1)} km</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Łączny czas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTime.toFixed(1)} h</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FireIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Średnia prędkość</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgSpeed.toFixed(1)} km/h</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrophyIcon className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Liczba aktywności</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRides}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Category Distribution Chart */}
      {stats.categoryBreakdown.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Rozkład aktywności według kategorii</h3>
          <div className="flex justify-center">
            <ResponsiveContainer width={400} height={300}>
              <PieChart>
                <Pie
                  data={stats.categoryBreakdown}
                  cx={200}
                  cy={150}
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Additional running insights */}
          {(stats.categoryStats?.running?.count || 0) > 0 && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="text-sm font-medium text-green-800 mb-2">🏃‍♂️ Dodatkowe informacje o bieganiu:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-700">
                <div>
                  <span className="font-medium">Średnie tempo:</span> {
                                       (stats.categoryStats?.running?.averageSpeed || 0) > 0
                     ? `${(60/(stats.categoryStats?.running?.averageSpeed || 1)).toFixed(1)} min/km`
                     : 'Brak danych'
                  }
                </div>
                <div>
                  <span className="font-medium">Cel tempa:</span> {
                                       (stats.categoryStats?.running?.averageSpeed || 0) > 0
                     ? `${Math.max((60/(stats.categoryStats?.running?.averageSpeed || 1) * 0.9), 4).toFixed(1)} min/km`
                     : 'Ustaw cel'
                  }
                </div>
                <div>
                  <span className="font-medium">Strefy treningowe:</span>
                  <a 
                    href="/training-zones" 
                    className="text-blue-600 hover:text-blue-800 underline ml-1"
                  >
                    Sprawdź HR
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Achievement Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Twoje rekordy</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-gray-700">Najdłuższa aktywność</span>
              <span className="font-semibold text-blue-600">{stats.longestRide.toFixed(1)} km</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-gray-700">Najszybsza aktywność</span>
              <span className="font-semibold text-green-600">{stats.fastestRide.toFixed(1)} km/h</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="text-gray-700">Średni dystans/aktywność</span>
              <span className="font-semibold text-purple-600">{(stats.totalDistance / stats.totalRides).toFixed(1)} km</span>
            </div>
          </div>
          
          {/* Informacja o filtrowaniu nierealistycznych aktywności */}
          {stats.filteredActivities && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-700 text-center">
                ⚠️ Wykluczono {stats.totalActivities - stats.totalRides} aktywności z nierealistycznymi prędkościami 
                (np. błędy w danych Strava). Pokazane statystyki są oparte na {stats.totalRides} wiarygodnych aktywnościach.
              </p>
            </div>
          )}
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Średnie tygodniowe</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
              <span className="text-gray-700">Dystans</span>
              <span className="font-semibold text-orange-600">
                {stats.avgWeeklyDistance.toFixed(1)} km
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
              <span className="text-gray-700">Czas</span>
              <span className="font-semibold text-indigo-600">
                {stats.avgWeeklyTime.toFixed(1)} h
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-pink-50 rounded-lg">
              <span className="text-gray-700">Aktywności</span>
              <span className="font-semibold text-pink-600">
                {stats.avgWeeklyActivities.toFixed(1)}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Monthly Distribution Chart */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Rozkład miesięczny aktywności</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats.monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="distance" fill="#8B5CF6" name="Dystans (km)" />
          </BarChart>
        </ResponsiveContainer>
      </div>


    </motion.div>
  );
};

export default Statistics;

