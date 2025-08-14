import React, { useMemo } from 'react';
import { useStrava } from '../contexts/StravaContext';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrophyIcon, FireIcon, ClockIcon, MapIcon } from '@heroicons/react/24/outline';

const Statistics: React.FC = () => {
  const { activities, isConnected } = useStrava();

  const stats = useMemo(() => {
    if (!activities.length) return null;

    const activitiesWithDates = activities.map(activity => ({
      ...activity,
      start_date: new Date(activity.start_date),
      distance_km: activity.distance / 1000,
      moving_time_hours: activity.moving_time / 3600,
      avg_speed: (activity.distance / 1000) / (activity.moving_time / 3600)
    }));

    const totalDistance = activitiesWithDates.reduce((sum, activity) => sum + activity.distance_km, 0);
    const totalTime = activitiesWithDates.reduce((sum, activity) => sum + activity.moving_time_hours, 0);
    const avgSpeed = totalDistance / totalTime;
    const longestRide = Math.max(...activitiesWithDates.map(activity => activity.distance_km));
    const fastestRide = Math.max(...activitiesWithDates.map(activity => activity.avg_speed));

    // Weekly statistics
    const weeklyStats = activitiesWithDates.reduce((acc: any[], activity) => {
      const weekKey = `${activity.start_date.getFullYear()}-W${Math.ceil((activity.start_date.getDate() + new Date(activity.start_date.getFullYear(), activity.start_date.getMonth(), 1).getDay()) / 7)}`;
      
      const existingWeek = acc.find(item => item.week === weekKey);
      if (existingWeek) {
        existingWeek.distance += activity.distance_km;
        existingWeek.time += activity.moving_time_hours;
        existingWeek.rides += 1;
      } else {
        acc.push({
          week: weekKey,
          distance: activity.distance_km,
          time: activity.moving_time_hours,
          rides: 1
        });
      }
      return acc;
    }, []);

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
      totalRides: activities.length,
      weeklyStats: weeklyStats.sort((a, b) => a.week.localeCompare(b.week)),
      monthlyData
    };
  }, [activities]);

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
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Statystyki przejazdów</h1>
        <p className="text-lg text-gray-600">Kompleksowy przegląd Twoich osiągnięć rowerowych</p>
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
              <p className="text-sm font-medium text-gray-600">Liczba przejazdów</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRides}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Achievement Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Twoje rekordy</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-gray-700">Najdłuższy przejazd</span>
              <span className="font-semibold text-blue-600">{stats.longestRide.toFixed(1)} km</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-gray-700">Najszybszy przejazd</span>
              <span className="font-semibold text-green-600">{stats.fastestRide.toFixed(1)} km/h</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="text-gray-700">Średni dystans/przejazd</span>
              <span className="font-semibold text-purple-600">{(stats.totalDistance / stats.totalRides).toFixed(1)} km</span>
            </div>
          </div>
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
                {(stats.totalDistance / Math.max(stats.weeklyStats.length, 1)).toFixed(1)} km
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
              <span className="text-gray-700">Czas</span>
              <span className="font-semibold text-indigo-600">
                {(stats.totalTime / Math.max(stats.weeklyStats.length, 1)).toFixed(1)} h
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-pink-50 rounded-lg">
              <span className="text-gray-700">Przejazdy</span>
              <span className="font-semibold text-pink-600">
                {(stats.totalRides / Math.max(stats.weeklyStats.length, 1)).toFixed(1)}
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

      {/* Weekly Progress Chart */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Postęp tygodniowy</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats.weeklyStats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="distance" fill="#10B981" name="Dystans (km)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default Statistics;

