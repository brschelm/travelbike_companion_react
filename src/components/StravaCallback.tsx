import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StravaAPI } from '../services/stravaApi';
import { StravaToken } from '../types';

const StravaCallback: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const stravaApi = new StravaAPI();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');

        if (error) {
          setError('Authorization was denied');
          setStatus('error');
          return;
        }

        if (!code) {
          setError('No authorization code received');
          setStatus('error');
          return;
        }

        // Exchange code for token
        const tokenData: StravaToken = await stravaApi.getToken(code);
        
        // Store token in localStorage
        localStorage.setItem('strava_token', JSON.stringify(tokenData));
        
        setStatus('success');
        
        // Force page reload to update StravaContext
        window.location.href = '/';

      } catch (err) {
        console.error('Error handling Strava callback:', err);
        setError('Failed to complete authorization');
        setStatus('error');
      }
    };

    handleCallback();
  }, [navigate]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Łączenie ze Strava...</h2>
          <p className="text-gray-600">Proszę czekać, trwa autoryzacja</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Błąd autoryzacji</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Wróć do aplikacji
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Pomyślnie połączono!</h2>
        <p className="text-gray-600 mb-4">Twoje konto Strava zostało połączone z aplikacją</p>
        <p className="text-sm text-gray-500">Przekierowywanie...</p>
      </div>
    </div>
  );
};

export default StravaCallback;

