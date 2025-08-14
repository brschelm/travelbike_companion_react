import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { StravaAPI } from '../services/stravaApi';
import { StravaToken, StravaActivity } from '../types';

interface StravaContextType {
  isConnected: boolean;
  activities: StravaActivity[];
  connectToStrava: () => void;
  disconnectFromStrava: () => void;
  refreshActivities: () => Promise<void>;
  loading: boolean;
}

const StravaContext = createContext<StravaContextType | undefined>(undefined);

export const useStrava = () => {
  const context = useContext(StravaContext);
  if (context === undefined) {
    throw new Error('useStrava must be used within a StravaProvider');
  }
  return context;
};

interface StravaProviderProps {
  children: ReactNode;
}

export const StravaProvider: React.FC<StravaProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [stravaApi] = useState(() => new StravaAPI());

  const refreshActivities = useCallback(async () => {
    if (!isConnected) return;
    
    setLoading(true);
    try {
      const tokenData = localStorage.getItem('strava_token');
      if (tokenData) {
        const token: StravaToken = JSON.parse(tokenData);
        const activitiesData = await stravaApi.getActivities(token.access_token);
        setActivities(activitiesData);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  }, [isConnected, stravaApi]);

  useEffect(() => {
    // Check if user is already connected (e.g., from localStorage)
    const tokenData = localStorage.getItem('strava_token');
    if (tokenData) {
      try {
        const token: StravaToken = JSON.parse(tokenData);
        if (token.expires_at > Date.now() / 1000) {
          setIsConnected(true);
          refreshActivities();
        } else {
          localStorage.removeItem('strava_token');
        }
      } catch (error) {
        console.error('Error parsing token:', error);
        localStorage.removeItem('strava_token');
      }
    }
  }, [refreshActivities]);

  const connectToStrava = () => {
    const authUrl = stravaApi.getAuthUrl();
    window.location.href = authUrl;
  };

  const disconnectFromStrava = () => {
    localStorage.removeItem('strava_token');
    setIsConnected(false);
    setActivities([]);
  };

  const value: StravaContextType = {
    isConnected,
    activities,
    connectToStrava,
    disconnectFromStrava,
    refreshActivities,
    loading
  };

  return (
    <StravaContext.Provider value={value}>
      {children}
    </StravaContext.Provider>
  );
};
