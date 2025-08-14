import React, { useState, useMemo } from 'react';
import { useStrava } from '../contexts/StravaContext';
import { useGoals } from '../contexts/GoalsContext';
import { motion } from 'framer-motion';
import { AcademicCapIcon, TrophyIcon, FireIcon } from '@heroicons/react/24/outline';

const TrainingPlans: React.FC = () => {
  const { activities, isConnected } = useStrava();
  const { goals, addGoal, deleteGoal, markAsAchieved } = useGoals();
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: '',
    value: 0,
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

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
    const avgDistancePerRide = totalDistance / activities.length;
    const avgSpeed = activitiesWithDates.reduce((sum, activity) => sum + activity.avg_speed, 0) / activities.length;
    const longestRide = Math.max(...activitiesWithDates.map(activity => activity.distance_km));

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

    return {
      totalDistance,
      avgDistancePerRide,
      avgSpeed,
      longestRide,
      avgWeeklyDistance
    };
  }, [activities]);

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
              <p className="text-sm text-gray-600">Średni dystans/przejazd</p>
              <p className="text-2xl font-bold text-green-600">{stats.avgDistancePerRide.toFixed(1)} km</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Średnia prędkość</p>
              <p className="text-2xl font-bold text-purple-600">{stats.avgSpeed.toFixed(1)} km/h</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600">Najdłuższy przejazd</p>
              <p className="text-2xl font-bold text-orange-600">{stats.longestRide.toFixed(1)} km</p>
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
              {stats.longestRide < 50 ? (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    🎯 <strong>Cel dystansu:</strong> Twój najdłuższy przejazd to {stats.longestRide.toFixed(1)} km. 
                    Spróbuj osiągnąć <strong>50 km</strong> w jednym przejeździe!
                  </p>
                </div>
              ) : stats.longestRide < 75 ? (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    🚀 <strong>Cel dystansu:</strong> Świetnie! Spróbuj osiągnąć <strong>75 km</strong> w jednym przejeździe!
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-800">
                    🏆 <strong>Cel dystansu:</strong> Niesamowicie! Spróbuj osiągnąć <strong>100 km</strong> w jednym przejeździe!
                  </p>
                </div>
              )}

              {stats.avgWeeklyDistance < 30 ? (
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    📈 <strong>Cel tygodniowy:</strong> Zwiększ swoją tygodniową aktywność do <strong>30 km</strong>.
                  </p>
                </div>
              ) : stats.avgWeeklyDistance < 50 ? (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💪 <strong>Cel tygodniowy:</strong> Jesteś na dobrej drodze! Spróbuj osiągnąć <strong>50 km</strong> tygodniowo.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    🎉 <strong>Cel tygodniowy:</strong> Twoje tygodniowe treningi są imponujące! Utrzymuj to tempo.
                  </p>
                </div>
              )}

              {stats.avgSpeed < 15 ? (
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <p className="text-sm text-indigo-800">
                    ⚡ <strong>Cel prędkości:</strong> Popraw średnią prędkość do <strong>15 km/h</strong> na dystansie 10-20 km.
                  </p>
                </div>
              ) : stats.avgSpeed < 20 ? (
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-800">
                    🚴‍♂️ <strong>Cel prędkości:</strong> Celuj w <strong>20 km/h</strong> na dłuższych dystansach!
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    🏅 <strong>Cel prędkości:</strong> Świetna prędkość! Utrzymuj {stats.avgSpeed.toFixed(1)} km/h lub zwiększ ją jeszcze bardziej.
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
                  <strong>Średni tygodniowy dystans:</strong> {stats.avgWeeklyDistance.toFixed(1)} km
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Liczba aktywnych tygodni:</strong> {activities.length > 0 ? Math.ceil(activities.length / 3) : 0}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Trend aktywności:</strong> {stats.avgWeeklyDistance > 25 ? '↗️ Rosnący' : '→ Stabilny'}
                </p>
              </div>
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
