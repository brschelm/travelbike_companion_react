import React, { useState, useEffect } from 'react';
import { useStrava } from '../contexts/StravaContext';
import { motion } from 'framer-motion';
import { CloudArrowUpIcon, MapIcon, ChartBarIcon, TruckIcon, UserIcon, FireIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
import { formatActivityType } from '../utils/activityUtils';
import { ACTIVITY_CATEGORIES } from '../types';
import GoogleFitApi from '../services/googleFitApi';

const ImportRoutes: React.FC = () => {
  const { isConnected, connectToStrava, categorizedActivities } = useStrava();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isGoogleFitConnected, setIsGoogleFitConnected] = useState<boolean>(false);

  const connectToGoogleFit = () => {
    const googleFitApi = new GoogleFitApi();
    const authUrl = googleFitApi.getAuthUrl();
    window.location.href = authUrl;
  };

  // Sprawdź czy użytkownik jest połączony z Google Fit
  useEffect(() => {
    const googleFitToken = localStorage.getItem('googleFitToken');
    if (googleFitToken) {
      setIsGoogleFitConnected(true);
    }
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/gpx+xml') {
      setUploadedFile(file);
    }
  };

  // Grupuj aktywności według kategorii
  const categoryCounts = {
    cycling: categorizedActivities.filter(activity => activity.category === ACTIVITY_CATEGORIES.CYCLING).length,
    running: categorizedActivities.filter(activity => activity.category === ACTIVITY_CATEGORIES.RUNNING).length,
    other: categorizedActivities.filter(activity => activity.category === ACTIVITY_CATEGORIES.OTHER).length
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Import tras</h1>
        <p className="text-lg text-gray-600">Połącz się z platformami treningowymi i importuj swoje trasy</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Strava Card */}
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ChartBarIcon className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Strava</h3>
            <p className="text-gray-600 mb-4">Połącz się ze swoim kontem Strava</p>
            
            {isConnected ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600">Połączono</span>
                </div>
                <p className="text-sm text-gray-500">
                  {categorizedActivities.length} aktywności załadowanych
                </p>
                
                {/* Category breakdown */}
                <div className="text-xs text-gray-500 space-y-1">
                  <div className="flex items-center justify-center space-x-2">
                                         <TruckIcon className="w-3 h-3 text-blue-600" />
                     <span>{categoryCounts.cycling} rowerowe</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                                         <UserIcon className="w-3 h-3 text-green-600" />
                     <span>{categoryCounts.running} biegowe</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <FireIcon className="w-3 h-3 text-orange-600" />
                    <span>{categoryCounts.other} inne</span>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={connectToStrava}
                className="w-full bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors duration-200"
              >
                Połącz ze Strava
              </button>
            )}
          </div>
        </motion.div>

        {/* Google Fit Card */}
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DevicePhoneMobileIcon className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Google Fit</h3>
            <p className="text-gray-600 mb-4">Połącz się z Google Fit</p>
            
            {isGoogleFitConnected ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600">Połączono</span>
                </div>
                <p className="text-sm text-gray-500">
                  Dane z Google Fit załadowane
                </p>
              </div>
            ) : (
              <button
                onClick={connectToGoogleFit}
                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200"
              >
                Połącz z Google Fit
              </button>
            )}
          </div>
        </motion.div>

        {/* GPX Upload Card */}
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapIcon className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Import GPX</h3>
            <p className="text-gray-600 mb-4">Załaduj pliki GPX z urządzeń</p>
            
            <label className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 cursor-pointer inline-block">
              <input
                type="file"
                accept=".gpx"
                onChange={handleFileUpload}
                className="hidden"
              />
              Wybierz plik GPX
            </label>
            
            {uploadedFile && (
              <div className="mt-3 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  Plik {uploadedFile.name} został załadowany!
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Coming Soon Card */}
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CloudArrowUpIcon className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Więcej platform</h3>
            <p className="text-gray-600 mb-4">Wkrótce więcej opcji importu</p>
            
            <div className="px-4 py-2 bg-gray-100 rounded-lg">
              <span className="text-sm text-gray-500">Wkrótce dostępne</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activities Preview */}
      {isConnected && categorizedActivities.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Ostatnie aktywności ze Strava</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categorizedActivities.slice(0, 6).map((activity, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-900">
                    {new Date(activity.start_date_local || activity.start_date).toLocaleDateString('pl-PL')}
                  </p>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    activity.category === ACTIVITY_CATEGORIES.CYCLING 
                      ? 'bg-blue-100 text-blue-800' 
                      : activity.category === ACTIVITY_CATEGORIES.RUNNING 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {formatActivityType(activity.type)}
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Dystans: {(activity.distance / 1000).toFixed(1)} km
                </p>
                <p className="text-sm text-gray-600">
                  Czas: {Math.round(activity.moving_time / 60)} min
                </p>
                <p className="text-sm text-gray-600">
                  Prędkość: {((activity.distance / 1000) / (activity.moving_time / 3600)).toFixed(1)} km/h
                </p>
                {activity.category === ACTIVITY_CATEGORIES.RUNNING && (
                  <p className="text-sm text-gray-600">
                    Tempo: {(60 / ((activity.distance / 1000) / (activity.moving_time / 3600))).toFixed(1)} min/km
                  </p>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ImportRoutes;

