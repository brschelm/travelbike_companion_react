import React, { useMemo } from 'react';
import { useStrava } from '../contexts/StravaContext';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { ChartBarIcon, CalendarIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

const ProgressAnalysis: React.FC = () => {
  const { activities, isConnected } = useStrava();

  const progressData = useMemo(() => {
    if (!activities.length) return null;

    const activitiesWithDates = activities.map(activity => ({
      ...activity,
      start_date: new Date(activity.start_date),
      distance_km: activity.distance / 1000,
      moving_time_hours: activity.moving_time / 3600,
      avg_speed: (activity.distance / 1000) / (activity.moving_time / 3600)
    }));

    // Sort by date
    activitiesWithDates.sort((a, b) => a.start_date.getTime() - b.start_date.getTime());

    // Calculate cumulative progress
    let cumulativeDistance = 0;
    let cumulativeTime = 0;
    
    const progressData = activitiesWithDates.map((activity, index) => {
      cumulativeDistance += activity.distance_km;
      cumulativeTime += activity.moving_time_hours;
      
      return {
        date: activity.start_date.toLocaleDateString('pl-PL'),
        distance: activity.distance_km,
        cumulativeDistance,
        time: activity.moving_time_hours,
        cumulativeTime,
        avgSpeed: activity.avg_speed,
        rideNumber: index + 1
      };
    });

    // Monthly progress
    const monthlyProgress = activitiesWithDates.reduce((acc: any[], activity) => {
      const monthKey = `${activity.start_date.getFullYear()}-${activity.start_date.getMonth() + 1}`;
      const monthName = activity.start_date.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });
      
      const existingMonth = acc.find(item => item.month === monthKey);
      if (existingMonth) {
        existingMonth.totalDistance += activity.distance_km;
        existingMonth.totalTime += activity.moving_time_hours;
        existingMonth.rideCount += 1;
        existingMonth.avgSpeed = existingMonth.totalDistance / existingMonth.totalTime;
      } else {
        acc.push({
          month: monthKey,
          monthName,
          totalDistance: activity.distance_km,
          totalTime: activity.moving_time_hours,
          rideCount: 1,
          avgSpeed: activity.avg_speed
        });
      }
      return acc;
    }, []);

    // Calculate improvement trends
    const improvementTrends = {
      distanceImprovement: progressData.length > 1 ? 
        ((progressData[progressData.length - 1].avgSpeed - progressData[0].avgSpeed) / progressData[0].avgSpeed * 100).toFixed(1) : 0,
      consistencyScore: progressData.length > 0 ? 
        (progressData.filter((_, index) => index > 0 && progressData[index].distance >= progressData[index - 1].distance * 0.8).length / (progressData.length - 1) * 100).toFixed(1) : 0
    };

    return {
      progressData,
      monthlyProgress: monthlyProgress.sort((a, b) => a.month.localeCompare(b.month)),
      improvementTrends
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
          <ChartBarIcon className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Brak połączenia ze Strava</h3>
          <p className="text-yellow-700">Połącz się ze Strava, aby zobaczyć analizę postępów.</p>
        </div>
      </motion.div>
    );
  }

  if (!progressData) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
          <ChartBarIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-blue-800 mb-2">Brak danych</h3>
          <p className="text-blue-700">Brak aktywności do analizy postępów.</p>
        </div>
      </motion.div>
    );
  }

  const { progressData: data, monthlyProgress, improvementTrends } = progressData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Analiza postępów</h1>
        <p className="text-lg text-gray-600">Śledź swój rozwój i postępy w treningach rowerowych</p>
      </div>

      {/* Progress Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ChartBarIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Łączny postęp</p>
              <p className="text-2xl font-bold text-gray-900">{data[data.length - 1]?.cumulativeDistance.toFixed(1)} km</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <AcademicCapIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Poprawa prędkości</p>
              <p className="text-2xl font-bold text-gray-900">{improvementTrends.distanceImprovement}%</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <ChartBarIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Konsystencja</p>
              <p className="text-2xl font-bold text-gray-900">{improvementTrends.consistencyScore}%</p>
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
              <p className="text-sm font-medium text-gray-600">Liczba treningów</p>
              <p className="text-2xl font-bold text-gray-900">{data.length}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Cumulative Progress Chart */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Kumulatywny postęp dystansu</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="rideNumber" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="cumulativeDistance" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} name="Dystans (km)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Progress Comparison */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Porównanie miesięczne</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyProgress}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="monthName" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="totalDistance" fill="#10B981" name="Dystans (km)" />
            <Bar dataKey="rideCount" fill="#8B5CF6" name="Liczba przejazdów" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Individual Ride Progress */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Postęp pojedynczych przejazdów</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="rideNumber" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="distance" stroke="#EF4444" strokeWidth={2} name="Dystans (km)" />
            <Line type="monotone" dataKey="avgSpeed" stroke="#8B5CF6" strokeWidth={2} name="Prędkość (km/h)" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Progress Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Analiza trendów</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-gray-700">Trend dystansu</span>
              <span className={`font-semibold ${data[data.length - 1]?.distance > data[0]?.distance ? 'text-green-600' : 'text-red-600'}`}>
                {data[data.length - 1]?.distance > data[0]?.distance ? '↗️ Rosnący' : '↘️ Spadający'}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-gray-700">Trend prędkości</span>
              <span className={`font-semibold ${data[data.length - 1]?.avgSpeed > data[0]?.avgSpeed ? 'text-green-600' : 'text-red-600'}`}>
                {data[data.length - 1]?.avgSpeed > data[0]?.avgSpeed ? '↗️ Rosnący' : '↘️ Spadający'}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="text-gray-700">Regularność</span>
              <span className="font-semibold text-purple-600">
                {improvementTrends.consistencyScore}% regularnych treningów
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Rekomendacje</h3>
          <div className="space-y-3">
            {improvementTrends.distanceImprovement > 0 ? (
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  🎉 Świetnie! Twoja prędkość rośnie o {improvementTrends.distanceImprovement}%. Kontynuuj w tym tempie!
                </p>
              </div>
            ) : (
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  💪 Skup się na poprawie prędkości. Spróbuj interwałów treningowych.
                </p>
              </div>
            )}
            
            {improvementTrends.consistencyScore > 70 ? (
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  🚴‍♂️ Doskonała regularność! Utrzymuj tę rutynę treningową.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  📅 Staraj się trenować regularnie. Ustal stałe dni treningowe.
                </p>
              </div>
            )}

            <div className="p-3 bg-indigo-50 rounded-lg">
              <p className="text-sm text-indigo-800">
                🔄 Następny cel: {Math.round(data[data.length - 1]?.distance * 1.1)} km w jednym przejeździe
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProgressAnalysis;
