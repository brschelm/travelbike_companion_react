import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { StravaAPI } from '../services/stravaApi';
import { StravaToken, StravaActivity, CategorizedActivity } from '../types';
import { categorizeActivity } from '../utils/activityUtils';

interface StravaContextType {
  isConnected: boolean;
  activities: StravaActivity[];
  categorizedActivities: CategorizedActivity[];
  cyclingActivities: StravaActivity[];
  runningActivities: StravaActivity[];
  otherActivities: StravaActivity[];
  connectToStrava: () => void;
  disconnectFromStrava: () => void;
  refreshActivities: () => Promise<void>;
  refreshCyclingActivities: () => Promise<void>;
  refreshRunningActivities: () => Promise<void>;
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

  // Kategoryzuj aktywności automatycznie
  const categorizedActivities = useMemo(() => {
    return activities.map(activity => categorizeActivity(activity));
  }, [activities]);

  // Filtruj aktywności według typu
  const cyclingActivities = useMemo(() => {
    return activities.filter(activity => 
      activity.type === 'Ride' || 
      activity.type === 'VirtualRide' || 
      activity.type === 'EBikeRide'
    );
  }, [activities]);

  const runningActivities = useMemo(() => {
    return activities.filter(activity => 
      activity.type === 'Run' || 
      activity.type === 'VirtualRun' || 
      activity.type === 'TrailRun'
    );
  }, [activities]);

  const otherActivities = useMemo(() => {
    return activities.filter(activity => 
      activity.type !== 'Ride' && 
      activity.type !== 'VirtualRide' && 
      activity.type !== 'EBikeRide' &&
      activity.type !== 'Run' && 
      activity.type !== 'VirtualRun' && 
      activity.type !== 'TrailRun'
    );
  }, [activities]);

  const refreshActivities = useCallback(async () => {
    if (!isConnected) return;
    
    setLoading(true);
    try {
      const tokenData = localStorage.getItem('strava_token');
      if (tokenData) {
        const token: StravaToken = JSON.parse(tokenData);
        const activitiesData = await stravaApi.getActivities(token.access_token, 200);
        setActivities(activitiesData);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  }, [isConnected, stravaApi]);

  // NOWA METODA: Pobierz tylko aktywności rowerowe
  const refreshCyclingActivities = useCallback(async () => {
    if (!isConnected) return;
    
    setLoading(true);
    try {
      const tokenData = localStorage.getItem('strava_token');
      if (tokenData) {
        const token: StravaToken = JSON.parse(tokenData);
        const cyclingData = await stravaApi.getCyclingActivities(token.access_token, 200);
        
        // Aktualizuj główną listę aktywności
        setActivities(prev => {
          const nonCycling = prev.filter(activity => 
            activity.type !== 'Ride' && 
            activity.type !== 'VirtualRide' && 
            activity.type !== 'EBikeRide'
          );
          return [...cyclingData, ...nonCycling];
        });
      }
    } catch (error) {
      console.error('Error fetching cycling activities:', error);
    } finally {
      setLoading(false);
    }
  }, [isConnected, stravaApi]);

  // NOWA METODA: Pobierz tylko aktywności biegowe
  const refreshRunningActivities = useCallback(async () => {
    if (!isConnected) return;
    
    setLoading(true);
    try {
      const tokenData = localStorage.getItem('strava_token');
      if (tokenData) {
        const token: StravaToken = JSON.parse(tokenData);
        const runningData = await stravaApi.getRunningActivities(token.access_token, 200);
        
        // Aktualizuj główną listę aktywności
        setActivities(prev => {
          const nonRunning = prev.filter(activity => 
            activity.type !== 'Run' && 
            activity.type !== 'VirtualRun' && 
            activity.type !== 'TrailRun'
          );
          return [...runningData, ...nonRunning];
        });
      }
    } catch (error) {
      console.error('Error fetching running activities:', error);
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
    categorizedActivities,
    cyclingActivities,
    runningActivities,
    otherActivities,
    connectToStrava,
    disconnectFromStrava,
    refreshActivities,
    refreshCyclingActivities,
    refreshRunningActivities,
    loading
  };

  return (
    <StravaContext.Provider value={value}>
      {children}
    </StravaContext.Provider>
  );
};
