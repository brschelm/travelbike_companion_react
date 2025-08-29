import React, { useState, useMemo } from 'react';
import { useStrava } from '../contexts/StravaContext';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { CalendarIcon, MapIcon, ClockIcon, TruckIcon, UserIcon, FireIcon } from '@heroicons/react/24/outline';
import { formatActivityType, calculateCategoryStats, groupActivitiesByCategory } from '../utils/activityUtils';
import { ACTIVITY_CATEGORIES } from '../types';
import ActivityCategories from '../components/ActivityCategories';

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
  const { categorizedActivities, isConnected } = useStrava();
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const processedData = useMemo<{
    monthlyData: any[];
    dailyData: any[];
    availableMonths: string[];
    categoryStats: {
      cycling: ReturnType<typeof calculateCategoryStats>;
      running: ReturnType<typeof calculateCategoryStats>;
      other: ReturnType<typeof calculateCategoryStats>;
    };
    categoryBreakdown: any[];
  }>(() => {
          if (!categorizedActivities.length) return { 
        monthlyData: [], 
        dailyData: [], 
        availableMonths: [], 
        categoryStats: {
          cycling: { count: 0, totalDistance: 0, totalTime: 0, totalElevation: 0, averageSpeed: 0 },
          running: { count: 0, totalDistance: 0, totalTime: 0, totalElevation: 0, averageSpeed: 0 },
          other: { count: 0, totalDistance: 0, totalTime: 0, totalElevation: 0, averageSpeed: 0 }
        }, 
        categoryBreakdown: [] 
      };

    // Filtruj aktywności według wybranej kategorii
    let filteredActivities = categorizedActivities;
    if (selectedCategory !== 'all') {
      filteredActivities = categorizedActivities.filter(activity => activity.category === selectedCategory);
    }

    const activitiesWithDates = filteredActivities.map(activity => ({
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

    // Statystyki kategorii
    const categoryStats: {
      cycling: ReturnType<typeof calculateCategoryStats>;
      running: ReturnType<typeof calculateCategoryStats>;
      other: ReturnType<typeof calculateCategoryStats>;
    } = {
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

    return { monthlyData, dailyData, availableMonths, categoryStats, categoryBreakdown };
  }, [categorizedActivities, selectedMonth, selectedCategory]);

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Analiza aktywności</h1>
        <p className="text-lg text-gray-600">Analizuj swoje treningi rowerowe, biegi i inne aktywności</p>
      </div>



      {/* SPRAWDZENIE CZY SĄ DANE */}
      {!categorizedActivities.length ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <MapIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-blue-800 mb-2">Brak danych do analizy</h3>
          <p className="text-blue-700">Połącz się ze Strava i poczekaj na załadowanie aktywności.</p>
          <p className="text-sm text-blue-600 mt-2">Liczba aktywności: {categorizedActivities.length}</p>
        </div>
      ) : !processedData ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <MapIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-blue-800 mb-2">Brak danych do analizy</h3>
          <p className="text-blue-700">Połącz się ze Strava i poczekaj na załadowanie aktywności.</p>
        </div>
      ) : (
        <>
          {/* RESZTA KOMPONENTU */}
          {(() => {
            const { monthlyData, dailyData, availableMonths, categoryStats, categoryBreakdown } = processedData;
            return (
              <>
                {/* Category Filter */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Wybierz kategorię aktywności
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Wszystkie kategorie</option>
                    <option value={ACTIVITY_CATEGORIES.CYCLING}>Rower</option>
                    <option value={ACTIVITY_CATEGORIES.RUNNING}>Bieg</option>
                    <option value={ACTIVITY_CATEGORIES.OTHER}>Inne</option>
                  </select>
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

                {/* Category Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                  {/* Cycling Stats - pokazuj tylko gdy nie wybrano konkretnej kategorii i miesiąca */}
                {selectedCategory === 'all' && !selectedMonth && (
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
                        <span className="font-semibold">{categoryStats?.cycling?.count || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dystans:</span>
                        <span className="font-semibold">{(categoryStats?.cycling?.totalDistance || 0).toFixed(2)} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Czas:</span>
                        <span className="font-semibold">{(categoryStats?.cycling?.totalTime || 0).toFixed(2)} h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Prędkość:</span>
                        <span className="font-semibold">{(categoryStats?.cycling?.averageSpeed || 0).toFixed(2)} km/h</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                  {/* Running Stats - pokazuj tylko gdy nie wybrano konkretnej kategorii i miesiąca */}
                  {selectedCategory === 'all' && !selectedMonth && (
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
                          <span className="text-gray-600">Liczba:</span>
                          <span className="font-semibold">{categoryStats?.running?.count || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Dystans:</span>
                          <span className="font-semibold">{(categoryStats?.running?.totalDistance || 0).toFixed(1)} km</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Czas:</span>
                          <span className="font-semibold">{(categoryStats?.running?.totalTime || 0).toFixed(1)} h</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Prędkość:</span>
                          <span className="font-semibold">{(categoryStats?.running?.averageSpeed || 0).toFixed(1)} km/h</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tempo (min/km):</span>
                          <span className="font-semibold">
                            {(categoryStats?.running?.averageSpeed || 0) > 0
                              ? (60 / (categoryStats?.running?.averageSpeed || 1)).toFixed(1)
                              : '0.0'
                            }
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Other Stats - pokazuj tylko gdy nie wybrano konkretnej kategorii i miesiąca */}
                  {selectedCategory === 'all' && !selectedMonth && (
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
                          <span className="font-semibold">{categoryStats?.other?.count || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Dystans:</span>
                          <span className="font-semibold">{(categoryStats?.other?.totalDistance || 0).toFixed(1)} km</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Czas:</span>
                          <span className="font-semibold">{(categoryStats?.other?.totalTime || 0).toFixed(1)} h</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Prędkość:</span>
                          <span className="font-semibold">{(categoryStats?.other?.averageSpeed || 0).toFixed(1)} km/h</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Category Distribution Chart - pokazuj tylko gdy nie wybrano konkretnej kategorii i miesiąca */}
                {categoryBreakdown.length > 0 && selectedCategory === 'all' && !selectedMonth && (
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Rozkład aktywności według kategorii</h3>
                    <div className="flex justify-center">
                      <ResponsiveContainer width={400} height={300}>
                        <PieChart>
                          <Pie
                            data={categoryBreakdown}
                            cx={200}
                            cy={150}
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {categoryBreakdown.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    {/* Additional running insights */}
                    {(categoryStats?.running?.count || 0) > 0 && (
                      <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                        <h4 className="text-sm font-medium text-green-800 mb-2">🏃‍♂️ Dodatkowe informacje o bieganiu:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-700">
                          <div>
                            <span className="font-medium">Średnie tempo:</span> {
                              (categoryStats?.running?.averageSpeed || 0) > 0
                                ? `${(60/(categoryStats?.running?.averageSpeed || 1)).toFixed(2)} min/km`
                                : 'Brak danych'
                            }
                          </div>
                          <div>
                            <span className="font-medium">Cel tempa:</span> {
                              (categoryStats?.running?.averageSpeed || 0) > 0
                                ? `${Math.max((60/(categoryStats?.running?.averageSpeed || 1) * 0.9), 4).toFixed(2)} min/km`
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

                {/* Dynamic Activity Analysis - pokazuje analizę dla wybranej kategorii */}
                {(() => {
                  // Wybierz odpowiednie statystyki na podstawie wybranej kategorii
                  let selectedStats;
                  let categoryTitle;
                  let categoryIcon;
                  let categoryColor;
                  let showPace = false;

                  if (selectedCategory === ACTIVITY_CATEGORIES.CYCLING) {
                    selectedStats = categoryStats?.cycling;
                    categoryTitle = "🚴‍♂️ Analiza rowerowa";
                    categoryIcon = "🚴‍♂️";
                    categoryColor = "blue";
                    showPace = false;
                  } else if (selectedCategory === ACTIVITY_CATEGORIES.RUNNING) {
                    selectedStats = categoryStats?.running;
                    categoryTitle = "🏃‍♂️ Analiza biegania";
                    categoryIcon = "🏃‍♂️";
                    categoryColor = "green";
                    showPace = true;
                  } else if (selectedCategory === ACTIVITY_CATEGORIES.OTHER) {
                    selectedStats = categoryStats?.other;
                    categoryTitle = "🔥 Analiza innych aktywności";
                    categoryIcon = "🔥";
                    categoryColor = "orange";
                    showPace = false;
                  } else {
                    // Dla "all" pokazuj domyślnie bieganie (zachowuję obecne zachowanie)
                    selectedStats = categoryStats?.running;
                    categoryTitle = "🏃‍♂️ Analiza biegania";
                    categoryIcon = "🏃‍♂️";
                    categoryColor = "green";
                    showPace = true;
                  }

                  // Pokaż analizę tylko jeśli są dane dla wybranej kategorii
                  if (!selectedStats || selectedStats.count === 0) {
                    return null;
                  }

                  return (
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">{categoryTitle}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          {showPace && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Średnie tempo:</span>
                              <span className="font-semibold">
                                {selectedStats.averageSpeed > 0
                                  ? `${(60/selectedStats.averageSpeed).toFixed(2)} min/km`
                                  : 'Brak danych'
                                }
                              </span>
                            </div>
                          )}
                          {showPace && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Cel tempa:</span>
                              <span className="font-semibold">
                                {selectedStats.averageSpeed > 0
                                  ? `${Math.max((60/selectedStats.averageSpeed * 0.9), 4).toFixed(2)} min/km`
                                  : 'Ustaw cel'
                                }
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-gray-600">Prędkość:</span>
                            <span className="font-semibold">
                              {selectedStats.averageSpeed.toFixed(2)} km/h
                            </span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Liczba treningów:</span>
                            <span className="font-semibold">{selectedStats.count}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Łączny dystans:</span>
                            <span className="font-semibold">
                              {selectedStats.totalDistance.toFixed(2)} km
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Łączny czas:</span>
                            <span className="font-semibold">
                              {selectedStats.totalTime.toFixed(2)} h
                            </span>
                          </div>
                        </div>
                      </div>
                      {/* Strefy treningowe - pokazuj tylko dla biegania */}
                      {(selectedCategory === ACTIVITY_CATEGORIES.RUNNING || selectedCategory === 'all') && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Strefy treningowe:</span>
                            <a 
                              href="/training-zones" 
                              className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                            >
                              🫀 Sprawdź HR i strefy
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Monthly Overview Chart */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {selectedMonth ? `Przegląd dzienny - ${selectedMonth}` : 'Przegląd miesięczny'}
                    {selectedCategory !== 'all' && ` - ${selectedCategory === ACTIVITY_CATEGORIES.CYCLING ? 'Rower' : selectedCategory === ACTIVITY_CATEGORIES.RUNNING ? 'Bieg' : 'Inne'}`}
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
                      {selectedCategory !== 'all' && ` dla kategorii: ${selectedCategory === ACTIVITY_CATEGORIES.CYCLING ? 'Rower' : selectedCategory === ACTIVITY_CATEGORIES.RUNNING ? 'Bieg' : 'Inne'}`}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500 mt-2 text-center">
                      Pokazano dane miesięczne ze wszystkich miesięcy
                      {selectedCategory !== 'all' && ` dla kategorii: ${selectedCategory === ACTIVITY_CATEGORIES.CYCLING ? 'Rower' : selectedCategory === ACTIVITY_CATEGORIES.RUNNING ? 'Bieg' : 'Inne'}`}
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
                          {selectedCategory !== 'all' && ` (${selectedCategory === ACTIVITY_CATEGORIES.CYCLING ? 'Rower' : selectedCategory === ACTIVITY_CATEGORIES.RUNNING ? 'Bieg' : 'Inne'})`}
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {selectedMonth 
                            ? dailyData.reduce((sum, day) => sum + day.distance, 0).toFixed(2)
                            : monthlyData.reduce((sum, month) => sum + month.totalDistance, 0).toFixed(2)
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
                          {selectedCategory !== 'all' && ` (${selectedCategory === ACTIVITY_CATEGORIES.CYCLING ? 'Rower' : selectedCategory === ACTIVITY_CATEGORIES.RUNNING ? 'Bieg' : 'Inne'})`}
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {selectedMonth 
                            ? dailyData.reduce((sum, day) => sum + day.time, 0).toFixed(2)
                            : monthlyData.reduce((sum, month) => sum + month.totalTime, 0).toFixed(2)
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
                          {selectedCategory !== 'all' && ` (${selectedCategory === ACTIVITY_CATEGORIES.CYCLING ? 'Rower' : selectedCategory === ACTIVITY_CATEGORIES.RUNNING ? 'Bieg' : 'Inne'})`}
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
                          {selectedMonth ? `Aktywności - ${selectedMonth}` : 'Liczba aktywności'}
                          {selectedCategory !== 'all' && ` (${selectedCategory === ACTIVITY_CATEGORIES.CYCLING ? 'Rower' : selectedCategory === ACTIVITY_CATEGORIES.RUNNING ? 'Bieg' : 'Inne'})`}
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
              </>
            );
          })()}
        </>
      )}


    </motion.div>
  );
};

export default ActivityAnalysis;
