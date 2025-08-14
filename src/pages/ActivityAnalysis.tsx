import React, { useState, useMemo } from 'react';
import { useStrava } from '../contexts/StravaContext';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { CalendarIcon, MapIcon, ClockIcon } from '@heroicons/react/24/outline';

const POLISH_MONTHS: { [key: string]: string } = {
  'January': 'Styczeń',
  'February': 'Luty',
  'March': 'Marzec',
  'April': 'Kwiecień',
  'May': 'Maj',
  'June': 'Czerwiec',
  'July': 'Lipiec',
  'August': 'Sierpień',
  'September': 'Wrzesień',
  'October': 'Październik',
  'November': 'Listopad',
  'December': 'Grudzień'
};

const ActivityAnalysis: React.FC = () => {
  const { activities, isConnected } = useStrava();
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  const processedData = useMemo(() => {
    if (!activities.length) return { monthlyData: [], dailyData: [], availableMonths: [] };

    const activitiesWithDates = activities.map(activity => ({
      ...activity,
      start_date: new Date(activity.start_date),
      distance_km: activity.distance / 1000,
      moving_time_hours: activity.moving_time / 3600,
      avg_speed: (activity.distance / 1000) / (activity.moving_time / 3600)
    }));

    // Group by month
    const monthlyData = activitiesWithDates.reduce((acc: any[], activity) => {
      const monthKey = `${POLISH_MONTHS[activity.start_date.toLocaleDateString('en-US', { month: 'long' })]} ${activity.start_date.getFullYear()}`;
      
      const existingMonth = acc.find(item => item.month === monthKey);
      if (existingMonth) {
        existingMonth.totalDistance += activity.distance_km;
        existingMonth.totalTime += activity.moving_time_hours;
        existingMonth.rideCount += 1;
        existingMonth.avgSpeed = existingMonth.totalDistance / existingMonth.totalTime;
      } else {
        acc.push({
          month: monthKey,
          totalDistance: activity.distance_km,
          totalTime: activity.moving_time_hours,
          rideCount: 1,
          avgSpeed: activity.avg_speed
        });
      }
      return acc;
    }, []);

    // Daily data for selected month
    const dailyData = selectedMonth ? activitiesWithDates
      .filter(activity => {
        const monthKey = `${POLISH_MONTHS[activity.start_date.toLocaleDateString('en-US', { month: 'long' })]} ${activity.start_date.getFullYear()}`;
        return monthKey === selectedMonth;
      })
      .reduce((acc: any[], activity) => {
        const dateKey = activity.start_date.toLocaleDateString('pl-PL');
        const existingDate = acc.find(item => item.date === dateKey);
        if (existingDate) {
          existingDate.distance += activity.distance_km;
          existingDate.time += activity.moving_time_hours;
        } else {
          acc.push({
            date: dateKey,
            distance: activity.distance_km,
            time: activity.moving_time_hours
          });
        }
        return acc;
      }, []) : [];

    const availableMonths = monthlyData.map(item => item.month).sort().reverse();

    return { monthlyData, dailyData, availableMonths };
  }, [activities, selectedMonth]);

  if (!isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
          <CalendarIcon className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Brak połączenia ze Strava</h3>
          <p className="text-yellow-700">Połącz się ze Strava w sekcji "Import tras", aby zobaczyć analizę aktywności.</p>
        </div>
      </motion.div>
    );
  }

  if (!activities.length) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
          <MapIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-blue-800 mb-2">Brak danych do analizy</h3>
          <p className="text-blue-700">Połącz się ze Strava i poczekaj na załadowanie aktywności.</p>
        </div>
      </motion.div>
    );
  }

  const { monthlyData, dailyData, availableMonths } = processedData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Analiza aktywności</h1>
        <p className="text-lg text-gray-600">Analizuj swoje treningi rowerowe i śledź postępy</p>
      </div>

      {/* Month Selector */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Wybierz miesiąc do analizy
        </label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Pokaż wszystkie miesiące</option>
          {availableMonths.map(month => (
            <option key={month} value={month}>{month}</option>
          ))}
        </select>
        {selectedMonth && (
          <button
            onClick={() => setSelectedMonth('')}
            className="mt-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
          >
            Pokaż wszystkie miesiące
          </button>
        )}
      </div>

      {/* Monthly Overview Chart */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          {selectedMonth ? `Przegląd dzienny - ${selectedMonth}` : 'Przegląd miesięczny'}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={selectedMonth ? dailyData : monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={selectedMonth ? "date" : "month"} />
            <YAxis />
            <Tooltip />
            <Bar 
              dataKey={selectedMonth ? "distance" : "totalDistance"} 
              fill="#3B82F6" 
              name="Dystans (km)" 
            />
          </BarChart>
        </ResponsiveContainer>
        {selectedMonth ? (
          <p className="text-sm text-gray-500 mt-2 text-center">
            Pokazano dane dzienne z {selectedMonth}
          </p>
        ) : (
          <p className="text-sm text-gray-500 mt-2 text-center">
            Pokazano dane miesięczne ze wszystkich miesięcy
          </p>
        )}
      </div>

      {/* Daily Activity Chart */}
      {selectedMonth && dailyData.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Dzienna aktywność - {selectedMonth}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="distance" stroke="#10B981" strokeWidth={2} name="Dystans (km)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Statistics Cards */}
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
              <p className="text-sm font-medium text-gray-600">
                {selectedMonth ? `Dystans - ${selectedMonth}` : 'Łączny dystans'}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {selectedMonth 
                  ? dailyData.reduce((sum, day) => sum + day.distance, 0).toFixed(1)
                  : monthlyData.reduce((sum, month) => sum + month.totalDistance, 0).toFixed(1)
                } km
              </p>
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
              <p className="text-sm font-medium text-gray-600">
                {selectedMonth ? `Czas - ${selectedMonth}` : 'Łączny czas'}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {selectedMonth 
                  ? dailyData.reduce((sum, day) => sum + day.time, 0).toFixed(1)
                  : monthlyData.reduce((sum, month) => sum + month.totalTime, 0).toFixed(1)
                } h
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                {selectedMonth ? `Średnia prędkość - ${selectedMonth}` : 'Średnia prędkość'}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {selectedMonth 
                  ? (dailyData.reduce((sum, day) => sum + day.distance, 0) / 
                     dailyData.reduce((sum, day) => sum + day.time, 0)).toFixed(1)
                  : (monthlyData.reduce((sum, month) => sum + month.totalDistance, 0) / 
                     monthlyData.reduce((sum, month) => sum + month.totalTime, 0)).toFixed(1)
                } km/h
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                {selectedMonth ? `Przejazdy - ${selectedMonth}` : 'Liczba przejazdów'}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {selectedMonth 
                  ? dailyData.length
                  : monthlyData.reduce((sum, month) => sum + month.rideCount, 0)
                }
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ActivityAnalysis;
