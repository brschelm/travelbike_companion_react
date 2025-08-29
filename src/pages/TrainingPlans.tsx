import React, { useState, useMemo } from 'react';
import { useStrava } from '../contexts/StravaContext';
import { useGoals } from '../contexts/GoalsContext';
import { motion } from 'framer-motion';
import { AcademicCapIcon, TrophyIcon, FireIcon, TruckIcon, UserIcon } from '@heroicons/react/24/outline';
import { calculateCategoryStats } from '../utils/activityUtils';
import { ACTIVITY_CATEGORIES } from '../types';

const TrainingPlans: React.FC = () => {
  const { categorizedActivities, isConnected } = useStrava();
  const { goals, addGoal, deleteGoal, markAsAchieved } = useGoals();
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: '',
    value: 0,
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const stats = useMemo(() => {
    if (!categorizedActivities.length) return null;

    const activitiesWithDates = categorizedActivities.map(activity => {
      const avg_speed = activity.moving_time > 0 ? (activity.distance / 1000) / (activity.moving_time / 3600) : 0;
      

      
      return {
        ...activity,
        start_date: new Date(activity.start_date),
        distance_km: activity.distance / 1000,
        moving_time_hours: activity.moving_time / 3600,
        avg_speed: avg_speed
      };
    });

    const totalDistance = activitiesWithDates.reduce((sum, activity) => sum + activity.distance_km, 0);
    const avgDistancePerActivity = totalDistance / categorizedActivities.length;
    const avgSpeed = activitiesWithDates.reduce((sum, activity) => sum + activity.avg_speed, 0) / categorizedActivities.length;
    const longestActivity = Math.max(...activitiesWithDates.map(activity => activity.distance_km));

    // Weekly average
    const weeklyDistance = activitiesWithDates.reduce((acc: any[], activity) => {
      const weekKey = `${activity.start_date.getFullYear()}-W${Math.ceil((activity.start_date.getDate() + new Date(activity.start_date.getFullYear(), activity.start_date.getMonth(), 1).getDay()) / 7)}`;
      
      const existingWeek = acc.find(item => item.week === weekKey);
      if (existingWeek) {
        existingWeek.distance += activity.distance_km;
      } else {
        acc.push({ week: weekKey, distance: activity.distance_km });
      }
      return acc;
    }, []);

    const avgWeeklyDistance = weeklyDistance.reduce((sum, week) => sum + week.distance, 0) / Math.max(weeklyDistance.length, 1);

    // Statystyki kategorii
    const categoryStats = {
      cycling: calculateCategoryStats(categorizedActivities, ACTIVITY_CATEGORIES.CYCLING),
      running: calculateCategoryStats(categorizedActivities, ACTIVITY_CATEGORIES.RUNNING),
      other: calculateCategoryStats(categorizedActivities, ACTIVITY_CATEGORIES.OTHER)
    };

    return {
      totalDistance,
      avgDistancePerActivity,
      avgSpeed,
      longestActivity,
      avgWeeklyDistance,
      categoryStats
    };
  }, [categorizedActivities]);

  const handleSubmitGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGoal.name && newGoal.value > 0) {
      addGoal({
        name: newGoal.name,
        title: newGoal.name,
        description: `Cel: ${newGoal.name}`,
        target: newGoal.value,
        unit: 'km',
        type: 'distance',
        deadline: newGoal.endDate
      });
      setNewGoal({
        name: '',
        value: 0,
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
      setShowGoalForm(false);
    }
  };

  if (!isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
          <AcademicCapIcon className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Brak połączenia ze Strava</h3>
          <p className="text-yellow-700">Połącz się ze Strava, aby zobaczyć plany treningowe.</p>
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
          <AcademicCapIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-blue-800 mb-2">Brak danych</h3>
          <p className="text-blue-700">Nie masz jeszcze żadnych aktywności. Dodaj aktywności ze Strava, aby zobaczyć plany treningowe.</p>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Plany Treningowe</h1>
        <p className="text-lg text-gray-600">Ustaw cele i otrzymuj spersonalizowane rekomendacje treningowe</p>
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
              <p className="text-sm text-gray-600">Statystyki rowerowe</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Aktywności:</span>
                             <span className="font-semibold">{stats.categoryStats?.cycling?.count || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Dystans:</span>
                             <span className="font-semibold">{(stats.categoryStats?.cycling?.totalDistance || 0).toFixed(1)} km</span>
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
              <p className="text-sm text-gray-600">Statystyki biegowe</p>
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
                {stats.categoryStats?.running?.averageSpeed > 0 
                  ? (60 / (stats.categoryStats?.running?.averageSpeed || 1)).toFixed(1)
                  : '0.0'
                }
              </span>
            </div>
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
              <span className="text-gray-600">Aktywności:</span>
                             <span className="font-semibold">{stats.categoryStats?.other?.count || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Dystans:</span>
                             <span className="font-semibold">{(stats.categoryStats?.other?.totalDistance || 0).toFixed(1)} km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Prędkość:</span>
                             <span className="font-semibold">{(stats.categoryStats?.other?.averageSpeed || 0).toFixed(1)} km/h</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Current Stats Overview */}
      {stats && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Twoje aktualne statystyki</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Łączny dystans</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalDistance.toFixed(1)} km</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Średni dystans/aktywność</p>
              <p className="text-2xl font-bold text-green-600">{stats.avgDistancePerActivity.toFixed(1)} km</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Średnia prędkość</p>
              <p className="text-2xl font-bold text-purple-600">{stats.avgSpeed.toFixed(1)} km/h</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600">Najdłuższa aktywność</p>
              <p className="text-2xl font-bold text-orange-600">{stats.longestActivity.toFixed(1)} km</p>
            </div>
          </div>
        </div>
      )}

      {/* Training Recommendations */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Sugestie planów treningowych</h3>
            <div className="space-y-4">
              {/* Cycling recommendations */}
              {(stats.categoryStats?.cycling?.count || 0) > 0 && (
                <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <h4 className="font-medium text-blue-800 mb-2">🚴‍♂️ Rekomendacje rowerowe:</h4>
                  {(stats.categoryStats?.cycling?.averageSpeed || 0) < 15 ? (
                    <p className="text-sm text-blue-700">
                      Popraw średnią prędkość do <strong>15 km/h</strong> na dystansie 10-20 km.
                    </p>
                  ) : (stats.categoryStats?.cycling?.averageSpeed || 0) < 20 ? (
                    <p className="text-sm text-blue-700">
                      Celuj w <strong>20 km/h</strong> na dłuższych dystansach!
                    </p>
                  ) : (
                    <p className="text-sm text-blue-700">
                                              Świetna prędkość! Utrzymuj {(stats.categoryStats?.cycling?.averageSpeed || 0).toFixed(1)} km/h.
                    </p>
                  )}
                </div>
              )}

              {/* Running recommendations */}
              {(stats.categoryStats?.running?.count || 0) > 0 && (
                <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                  <h4 className="font-medium text-green-800 mb-2">🏃‍♂️ Rekomendacje biegowe:</h4>
                  {(stats.categoryStats?.running?.averageSpeed || 0) < 8 ? (
                    <p className="text-sm text-green-700">
                      Popraw średnią prędkość do <strong>8 km/h</strong> na dystansie 5-10 km.
                      <br />
                      <span className="text-xs text-green-600">
                        Celuj w tempo: <strong>{(60/8).toFixed(1)} min/km</strong>
                      </span>
                    </p>
                  ) : (stats.categoryStats?.running?.averageSpeed || 0) < 10 ? (
                    <p className="text-sm text-green-700">
                      Celuj w <strong>10 km/h</strong> na dłuższych dystansach!
                      <br />
                      <span className="text-xs text-green-600">
                        Celuj w tempo: <strong>{(60/10).toFixed(1)} min/km</strong>
                      </span>
                    </p>
                  ) : (
                    <p className="text-sm text-green-700">
                                              Świetna prędkość! Utrzymuj {(stats.categoryStats?.running?.averageSpeed || 0).toFixed(1)} km/h.
                      <br />
                      <span className="text-xs text-green-600">
                                                  Twoje tempo: <strong>{(60/(stats.categoryStats?.running?.averageSpeed || 1)).toFixed(1)} min/km</strong>
                      </span>
                    </p>
                  )}
                </div>
              )}

              {/* Training zones recommendation */}
              {(stats.categoryStats?.running?.count || 0) > 0 && (
                <div className="p-3 bg-indigo-50 rounded-lg border-l-4 border-indigo-400">
                  <h4 className="font-medium text-indigo-800 mb-2">💓 Strefy treningowe:</h4>
                  <p className="text-sm text-indigo-700">
                    Sprawdź czy Twoje treningi biegowe były w strefie 2 (60-70% max HR) 
                    na stronie "Strefy treningowe" - to klucz do poprawy wydolności!
                  </p>
                </div>
              )}

              {/* General distance recommendations */}
              {stats?.longestActivity < 50 ? (
                <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                  <p className="text-sm text-yellow-800">
                    🎯 <strong>Cel dystansu:</strong> Twoja najdłuższa aktywność to {stats?.longestActivity?.toFixed(1) || 0} km. 
                    Spróbuj osiągnąć <strong>50 km</strong> w jednej aktywności!
                  </p>
                </div>
              ) : stats?.longestActivity < 75 ? (
                <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                  <p className="text-sm text-green-800">
                    🚀 <strong>Cel dystansu:</strong> Świetnie! Spróbuj osiągnąć <strong>75 km</strong> w jednej aktywności!
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                  <p className="text-sm text-purple-800">
                    🏆 <strong>Cel dystansu:</strong> Niesamowicie! Spróbuj osiągnąć <strong>100 km</strong> w jednej aktywności!
                  </p>
                </div>
              )}

              {/* Weekly recommendations */}
              {stats?.avgWeeklyDistance < 30 ? (
                <div className="p-3 bg-indigo-50 rounded-lg border-l-4 border-indigo-400">
                  <p className="text-sm text-indigo-800">
                    📈 <strong>Cel tygodniowy:</strong> Zwiększ swoją tygodniową aktywność do <strong>30 km</strong>.
                  </p>
                </div>
              ) : stats?.avgWeeklyDistance < 50 ? (
                <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <p className="text-sm text-blue-800">
                    💪 <strong>Cel tygodniowy:</strong> Jesteś na dobrej drodze! Spróbuj osiągnąć <strong>50 km</strong> tygodniowo.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                  <p className="text-sm text-green-800">
                    🎉 <strong>Cel tygodniowy:</strong> Twoje tygodniowe treningi są imponujące! Utrzymuj to tempo.
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Analiza treningowa</h3>
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Średni tygodniowy dystans:</strong> {stats?.avgWeeklyDistance?.toFixed(1) || 0} km
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Liczba aktywnych tygodni:</strong> {categorizedActivities.length > 0 ? Math.ceil(categorizedActivities.length / 3) : 0}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Trend aktywności:</strong> {stats?.avgWeeklyDistance > 25 ? '↗️ Rosnący' : '→ Stabilny'}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Dominująca aktywność:</strong> {
                    (stats.categoryStats?.cycling?.count || 0) > (stats.categoryStats?.running?.count || 0) && (stats.categoryStats?.cycling?.count || 0) > (stats.categoryStats?.other?.count || 0)
                      ? '🚴‍♂️ Rower'
                      : (stats.categoryStats?.running?.count || 0) > (stats.categoryStats?.other?.count || 0)
                      ? '🏃‍♂️ Bieg'
                      : '🔥 Inne'
                  }
                </p>
              </div>
              {(stats.categoryStats?.running?.count || 0) > 0 && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Średnie tempo biegu:</strong> {
                      (stats.categoryStats?.running?.averageSpeed || 0) > 0 
                        ? `${(60/(stats.categoryStats?.running?.averageSpeed || 1)).toFixed(1)} min/km`
                        : 'Brak danych'
                    }
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Goal Setting */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">🎯 Ustaw swoje cele treningowe</h3>
          <button
            onClick={() => setShowGoalForm(!showGoalForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            {showGoalForm ? 'Anuluj' : 'Dodaj cel'}
          </button>
        </div>

        {showGoalForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            onSubmit={handleSubmitGoal}
            className="mb-6 p-4 bg-gray-50 rounded-lg"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nazwa celu
                </label>
                <input
                  type="text"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                  placeholder="np. 100km w miesiąc"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wartość celu
                </label>
                <input
                  type="number"
                  value={newGoal.value}
                  onChange={(e) => setNewGoal({ ...newGoal, value: parseFloat(e.target.value) })}
                  placeholder="100"
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data zakończenia
                </label>
                <input
                  type="date"
                  value={newGoal.endDate}
                  onChange={(e) => setNewGoal({ ...newGoal, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
            <div className="mt-4">
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                Zapisz cel
              </button>
            </div>
          </motion.form>
        )}

        {/* Current Goals */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">Twoje aktywne cele:</h4>
          {goals.length > 0 ? (
            <div className="space-y-3">
              {goals.map((goal) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h5 className="font-medium text-gray-900">{goal.name}</h5>
                    <p className="text-sm text-gray-600">
                      Cel: {goal.value || goal.target} km do {goal.endDate ? new Date(goal.endDate).toLocaleDateString('pl-PL') : 'brak daty'}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    {!goal.achieved && (
                      <button
                        onClick={() => markAsAchieved(goal.id)}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors duration-200"
                      >
                        Osiągnięty
                      </button>
                    )}
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors duration-200"
                    >
                      Usuń
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <AcademicCapIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>Brak ustawionych celów. Ustaw swój pierwszy cel powyżej!</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TrainingPlans;
