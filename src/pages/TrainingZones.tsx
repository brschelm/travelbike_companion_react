import React, { useState, useMemo } from 'react';
import { useStrava } from '../contexts/StravaContext';
import { motion } from 'framer-motion';
import { HeartIcon, CalculatorIcon, ChartBarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { calculateTrainingZones, analyzeTrainingZones, isZone2Training, formatTime } from '../utils/activityUtils';
import { HeartRateZones, TrainingZoneAnalysis } from '../types';

const TrainingZones: React.FC = () => {
  const { categorizedActivities, isConnected } = useStrava();
  const [age, setAge] = useState<number>(30);
  const [selectedActivity, setSelectedActivity] = useState<string>('');

  const trainingZones = useMemo(() => calculateTrainingZones(age), [age]);

  const runningActivities = useMemo(() => {
    return categorizedActivities.filter(activity => 
      activity.category === 'running' && activity.average_heartrate
    );
  }, [categorizedActivities]);

  const zoneAnalysis = useMemo(() => {
    if (!selectedActivity) return null;
    
    const activity = runningActivities.find(a => a.id.toString() === selectedActivity);
    if (!activity) return null;
    
    return analyzeTrainingZones(activity, trainingZones);
  }, [selectedActivity, runningActivities, trainingZones]);

  const zone2Activities = useMemo(() => {
    return runningActivities.filter(activity => {
      const analysis = analyzeTrainingZones(activity, trainingZones);
      return isZone2Training(analysis);
    });
  }, [runningActivities, trainingZones]);

  if (!isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
          <HeartIcon className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Brak połączenia ze Strava</h3>
          <p className="text-yellow-700">Połącz się ze Strava, aby zobaczyć analizę stref treningowych.</p>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Strefy Treningowe</h1>
        <p className="text-lg text-gray-600">Kalkulator stref HR i analiza treningów w strefie 2</p>
      </div>

      {/* Age Input */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <CalculatorIcon className="w-8 h-8 text-blue-600 mr-3" />
          <h3 className="text-xl font-semibold text-gray-900">Kalkulator stref treningowych</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Twój wiek
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(parseInt(e.target.value) || 30)}
              min="15"
              max="100"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              Maksymalne tętno: <span className="font-semibold">{220 - age}</span> uderzeń/min
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Strefa 2 - Wydolność tlenowa</h4>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-green-800">
                <span className="font-semibold">Zakres:</span> {trainingZones.zone2.min} - {trainingZones.zone2.max} uderzeń/min
              </p>
              <p className="text-xs text-green-600 mt-1">
                {trainingZones.zone2.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Training Zones Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Wszystkie strefy treningowe</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Strefa</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Zakres HR</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Nazwa</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Opis</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(trainingZones).map(([zone, data]) => {
                const zoneData = data as { min: number; max: number; name: string; description: string };
                return (
                  <tr key={zone} className={`border-b border-gray-100 ${
                    zone === 'zone2' ? 'bg-green-50' : ''
                  }`}>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {zone.toUpperCase().replace('ZONE', 'Strefa ')}
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {zoneData.min} - {zoneData.max}
                    </td>
                    <td className="py-3 px-4 text-gray-700">{zoneData.name}</td>
                    <td className="py-3 px-4 text-gray-600 text-sm">{zoneData.description}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activity Analysis */}
      {runningActivities.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Analiza aktywności biegowych</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wybierz aktywność do analizy
            </label>
            <select
              value={selectedActivity}
              onChange={(e) => setSelectedActivity(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Wybierz aktywność...</option>
              {runningActivities.map(activity => (
                <option key={activity.id} value={activity.id}>
                  {new Date(activity.start_date).toLocaleDateString('pl-PL')} - 
                  {(activity.distance / 1000).toFixed(1)} km - 
                  {activity.average_heartrate} uderzeń/min
                </option>
              ))}
            </select>
          </div>

          {zoneAnalysis && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Strefa 1</p>
                  <p className="text-lg font-bold text-blue-600">
                    {formatTime(zoneAnalysis.zone1Time)}
                  </p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Strefa 2</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatTime(zoneAnalysis.zone2Time)}
                  </p>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-600">Strefa 3</p>
                  <p className="text-lg font-bold text-yellow-600">
                    {formatTime(zoneAnalysis.zone3Time)}
                  </p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <p className="text-sm text-gray-600">Strefa 4</p>
                  <p className="text-lg font-bold text-orange-600">
                    {formatTime(zoneAnalysis.zone4Time)}
                  </p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-gray-600">Strefa 5</p>
                  <p className="text-lg font-bold text-red-600">
                    {formatTime(zoneAnalysis.zone5Time)}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Analiza strefy 2</h4>
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`w-4 h-4 rounded-full ${
                    zoneAnalysis.zone2Percentage >= 60 ? 'bg-green-500' : 'bg-yellow-500'
                  }`}></div>
                  <span className="text-sm text-gray-700">
                    Czas w strefie 2: <span className="font-semibold">{zoneAnalysis.zone2Percentage.toFixed(1)}%</span>
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {zoneAnalysis.zone2Percentage >= 60 
                    ? '🎯 To był trening w strefie 2! Idealne dla poprawy wydolności.'
                    : '⚠️ Mało czasu w strefie 2 - rozważ wolniejsze tempo.'
                  }
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Rekomendacje</h4>
                <ul className="space-y-1">
                  {zoneAnalysis.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="text-sm text-blue-800">• {rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Zone 2 Activities Summary */}
      {zone2Activities.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            🎯 Treningi w strefie 2 ({zone2Activities.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {zone2Activities.slice(0, 6).map(activity => {
              const analysis = analyzeTrainingZones(activity, trainingZones);
              return (
                <div key={activity.id} className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-green-900">
                      {new Date(activity.start_date).toLocaleDateString('pl-PL')}
                    </p>
                    <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
                      Strefa 2
                    </span>
                  </div>
                  <p className="text-sm text-green-700">
                    Dystans: {(activity.distance / 1000).toFixed(1)} km
                  </p>
                  <p className="text-sm text-green-700">
                    Czas: {formatTime(activity.moving_time)}
                  </p>
                  <p className="text-sm text-green-700">
                    Średnie HR: {activity.average_heartrate} uderzeń/min
                  </p>
                  <p className="text-sm text-green-700">
                    Strefa 2: {analysis.zone2Percentage.toFixed(1)}%
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">💡 Wskazówki treningowe</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Strefa 2 - Klucz do wydolności</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• 60-70% maksymalnego tętna</li>
              <li>• Możesz prowadzić rozmowę podczas biegu</li>
              <li>• Idealne dla długich, spokojnych treningów</li>
              <li>• Buduje bazę tlenową</li>
              <li>• 80% treningów powinno być w tej strefie</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Jak trenować w strefie 2</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Biegaj w tempie, które pozwala na rozmowę</li>
              <li>• Używaj monitora tętna</li>
              <li>• Zwiększaj stopniowo czas w tej strefie</li>
              <li>• Łącz z treningami interwałowymi</li>
              <li>• Pamiętaj o regeneracji</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TrainingZones;
