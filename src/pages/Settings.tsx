import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CogIcon, KeyIcon, ShieldCheckIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('api');
  const [apiSettings, setApiSettings] = useState({
    stravaClientId: '',
    stravaClientSecret: '',
    huaweiAppId: '',
    huaweiAppSecret: ''
  });

  const tabs = [
    { id: 'api', name: 'Konfiguracja API', icon: KeyIcon },
    { id: 'preferences', name: 'Preferencje', icon: CogIcon },
    { id: 'about', name: 'O aplikacji', icon: InformationCircleIcon }
  ];

  const handleApiSettingsChange = (field: string, value: string) => {
    setApiSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveSettings = () => {
    // Here you would typically save to backend or localStorage
    console.log('Saving settings:', apiSettings);
    // For now, just show a success message
    alert('Ustawienia zostały zapisane!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Ustawienia</h1>
        <p className="text-lg text-gray-600">Skonfiguruj aplikację i dostosuj ją do swoich potrzeb</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* API Configuration Tab */}
          {activeTab === 'api' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Konfiguracja API</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Skonfiguruj klucze API dla różnych platform treningowych
                </p>
              </div>

              {/* Strava API Configuration */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <KeyIcon className="w-5 h-5 text-orange-600" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900">Strava API</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Client ID
                    </label>
                    <input
                      type="password"
                      value={apiSettings.stravaClientId}
                      onChange={(e) => handleApiSettingsChange('stravaClientId', e.target.value)}
                      placeholder="Wprowadź Client ID"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Client Secret
                    </label>
                    <input
                      type="password"
                      value={apiSettings.stravaClientSecret}
                      onChange={(e) => handleApiSettingsChange('stravaClientSecret', e.target.value)}
                      placeholder="Wprowadź Client Secret"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <InformationCircleIcon className="w-4 h-4 inline mr-1" />
                    Aby uzyskać klucze API, odwiedź{' '}
                    <a href="https://www.strava.com/settings/api" target="_blank" rel="noopener noreferrer" className="underline">
                      Strava API Settings
                    </a>
                  </p>
                </div>
              </div>

              {/* Huawei Health API Configuration */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <KeyIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900">Huawei Health API</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      App ID
                    </label>
                    <input
                      type="password"
                      value={apiSettings.huaweiAppId}
                      onChange={(e) => handleApiSettingsChange('huaweiAppId', e.target.value)}
                      placeholder="Wprowadź App ID"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      App Secret
                    </label>
                    <input
                      type="password"
                      value={apiSettings.huaweiAppSecret}
                      onChange={(e) => handleApiSettingsChange('huaweiAppSecret', e.target.value)}
                      placeholder="Wprowadź App Secret"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <InformationCircleIcon className="w-4 h-4 inline mr-1" />
                    Huawei Health API będzie dostępne w przyszłych wersjach aplikacji
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Zapisz ustawienia
                </button>
              </div>
            </motion.div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Preferencje aplikacji</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Dostosuj wygląd i zachowanie aplikacji
                </p>
              </div>

              <div className="space-y-6">
                {/* Theme Selection */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Motyw</h4>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input type="radio" name="theme" value="light" defaultChecked className="mr-3" />
                      <span>Jasny motyw</span>
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="theme" value="dark" className="mr-3" />
                      <span>Ciemny motyw</span>
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="theme" value="auto" className="mr-3" />
                      <span>Automatyczny (system)</span>
                    </label>
                  </div>
                </div>

                {/* Language Selection */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Język</h4>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="pl">Polski</option>
                    <option value="en">English</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>

                {/* Units Selection */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Jednostki</h4>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input type="radio" name="units" value="metric" defaultChecked className="mr-3" />
                      <span>Metryczne (km, km/h)</span>
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="units" value="imperial" className="mr-3" />
                      <span>Imperialne (mile, mph)</span>
                    </label>
                  </div>
                </div>

                {/* Notifications */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Powiadomienia</h4>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-3" />
                      <span>Przypomnienia o treningach</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-3" />
                      <span>Powiadomienia o osiągnięciu celów</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-3" />
                      <span>Wiadomości motywacyjne</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                  Zapisz preferencje
                </button>
              </div>
            </motion.div>
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <InformationCircleIcon className="w-12 h-12 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">TravelBike Companion</h3>
                <p className="text-gray-600">Wersja 1.0.0</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">O aplikacji</h4>
                <p className="text-gray-700 mb-4">
                  TravelBike Companion to nowoczesna aplikacja do analizy treningów rowerowych. 
                  Aplikacja integruje się ze Strava i innymi platformami treningowymi, 
                  oferując zaawansowane analizy, śledzenie postępów i spersonalizowane plany treningowe.
                </p>
                
                <h5 className="font-medium text-gray-900 mb-2">Funkcje:</h5>
                <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
                  <li>Integracja ze Strava API</li>
                  <li>Analiza aktywności i postępów</li>
                  <li>Interaktywne wykresy i statystyki</li>
                  <li>Ustawianie i śledzenie celów treningowych</li>
                  <li>Spersonalizowane rekomendacje</li>
                  <li>Import plików GPX</li>
                </ul>

                <h5 className="font-medium text-gray-900 mb-2">Technologie:</h5>
                <p className="text-gray-700 mb-4">
                  React, TypeScript, Tailwind CSS, Recharts, Framer Motion
                </p>

                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-500">
                    © 2025 TravelBike Companion. Wszystkie prawa zastrzeżone.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;

