import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import GoogleFitApi, { GoogleFitToken } from '../services/googleFitApi';

const GoogleFitCallback: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleGoogleFitCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');

        if (error) {
          setStatus('error');
          setErrorMessage('Użytkownik anulował autoryzację Google Fit');
          return;
        }

        if (!code) {
          setStatus('error');
          setErrorMessage('Brak kodu autoryzacji z Google Fit');
          return;
        }

        // Pobierz token z Google Fit
        const googleFitApi = new GoogleFitApi();
        const token: GoogleFitToken = await googleFitApi.getToken(code);

        // Zapisz token w localStorage
        localStorage.setItem('googleFitToken', JSON.stringify(token));

        // Pokaż sukces
        setStatus('success');

        // Przekieruj po 2 sekundach
        setTimeout(() => {
          navigate('/');
        }, 2000);

      } catch (error) {
        console.error('Błąd podczas autoryzacji Google Fit:', error);
        setStatus('error');
        setErrorMessage('Wystąpił błąd podczas łączenia z Google Fit. Spróbuj ponownie.');
      }
    };

    handleGoogleFitCallback();
  }, [navigate]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <ClockIcon className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Łączenie z Google Fit...</h2>
            <p className="text-gray-600">Proszę czekać, trwa autoryzacja</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Połączono z Google Fit! 🎉</h2>
            <p className="text-gray-600 mb-4">
              Twoje dane aktywności zostały pomyślnie połączone z Google Fit.
            </p>
            <p className="text-sm text-gray-500">
              Przekierowywanie na stronę główną...
            </p>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Błąd połączenia</h2>
            <p className="text-gray-600 mb-4">{errorMessage}</p>
            <button
              onClick={() => navigate('/import-routes')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Spróbuj ponownie
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gray-50 flex items-center justify-center p-4"
    >
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        {renderContent()}
      </div>
    </motion.div>
  );
};

export default GoogleFitCallback;
