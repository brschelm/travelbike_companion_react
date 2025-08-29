import { StravaToken, StravaActivity } from '../types';

export class StravaAPI {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private baseUrl: string;
  private tokenUrl: string;

  constructor() {
    // Używaj zmiennych środowiskowych z .env
    this.clientId = process.env.REACT_APP_STRAVA_CLIENT_ID || '164470';
    this.clientSecret = process.env.REACT_APP_STRAVA_CLIENT_SECRET || '93fca6adc86e9d6b93be27d6499551465ffb33e6';
    this.redirectUri = process.env.REACT_APP_STRAVA_REDIRECT_URI || 'http://localhost:3000/strava-callback';
    
    this.baseUrl = 'https://www.strava.com/api/v3';
    this.tokenUrl = 'https://www.strava.com/oauth/token';




  }



  getAuthUrl(): string {
    return `https://www.strava.com/oauth/authorize?client_id=${this.clientId}&response_type=code&redirect_uri=${this.redirectUri}&approval_prompt=force&scope=read,activity:read`;
  }

  async getToken(code: string): Promise<StravaToken> {
    const data = {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      code: code,
      grant_type: 'authorization_code'
    };

    try {
      const response = await fetch(this.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting token:', error);
      throw error;
    }
  }

  async getActivities(accessToken: string, perPage: number = 30): Promise<StravaActivity[]> {
    try {
      // OPTYMALIZACJA: Pobierz aktywności z ostatnich 4 miesięcy
      // Strava domyślnie sortuje od najnowszych, więc dostaniemy najnowsze aktywności
      const fourMonthsAgo = new Date();
      fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);
      const after = Math.floor(fourMonthsAgo.getTime() / 1000);
      
      // Wymuszam nowy kod - dodaję timestamp żeby cache się nie pokrywał
      const timestamp = Date.now();
      const finalUrl = `${this.baseUrl}/athlete/activities?per_page=${perPage}&after=${after}&_t=${timestamp}`;
      
      const response = await fetch(finalUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const activities = await response.json();
      
      // Filtruj aktywności - odrzuć daty z przyszłości
      const currentTime = Math.floor(Date.now() / 1000);
      const filteredActivities = activities.filter((activity: StravaActivity) => {
        const activityTime = new Date(activity.start_date).getTime() / 1000;
        return activityTime <= currentTime;
      });
      
      // Sortuj od najnowszych do najstarszych
      const sortedActivities = filteredActivities.sort((a: StravaActivity, b: StravaActivity) => {
        const dateA = new Date(a.start_date).getTime();
        const dateB = new Date(b.start_date).getTime();
        return dateB - dateA; // Od najnowszych (malejąco)
      });
      
      console.log(`Pobrano ${activities.length} aktywności, po filtrowaniu: ${filteredActivities.length}, posortowano: ${sortedActivities.length}`);
      return sortedActivities;
    } catch (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }
  }

  // NOWA METODA: Pobierz aktywności z konkretnego okresu
  async getActivitiesByDateRange(accessToken: string, startDate: Date, endDate: Date, perPage: number = 30): Promise<StravaActivity[]> {
    try {
      const after = Math.floor(startDate.getTime() / 1000);
      const before = Math.floor(endDate.getTime() / 1000);
      
      const timestamp = Date.now();
      const finalUrl = `${this.baseUrl}/athlete/activities?per_page=${perPage}&after=${after}&before=${before}&_t=${timestamp}`;
      
      const response = await fetch(finalUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const activities = await response.json();
      return activities;
    } catch (error) {
      console.error('Error fetching activities by date range:', error);
      throw error;
    }
  }

  // NOWA METODA: Pobierz tylko aktywności rowerowe
  async getCyclingActivities(accessToken: string, perPage: number = 30): Promise<StravaActivity[]> {
    try {
      const fourMonthsAgo = new Date();
      fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);
      const after = Math.floor(fourMonthsAgo.getTime() / 1000);
      
      const timestamp = Date.now();
      const finalUrl = `${this.baseUrl}/athlete/activities?per_page=${perPage}&after=${after}&activity_type=Ride&_t=${timestamp}`;
      
      const response = await fetch(finalUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const activities = await response.json();
      return activities;
    } catch (error) {
      console.error('Error fetching cycling activities:', error);
      throw error;
    }
  }

  // NOWA METODA: Pobierz tylko aktywności biegowe
  async getRunningActivities(accessToken: string, perPage: number = 30): Promise<StravaActivity[]> {
    try {
      const fourMonthsAgo = new Date();
      fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);
      const after = Math.floor(fourMonthsAgo.getTime() / 1000);
      
      const timestamp = Date.now();
      const finalUrl = `${this.baseUrl}/athlete/activities?per_page=${perPage}&after=${after}&activity_type=Run&_t=${timestamp}`;
      
      const response = await fetch(finalUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const activities = await response.json();
      return activities;
    } catch (error) {
      console.error('Error fetching running activities:', error);
      throw error;
    }
  }

  // NOWA METODA: Pobierz tylko aktywności spacerowe
  async getWalkingActivities(accessToken: string, perPage: number = 30): Promise<StravaActivity[]> {
    try {
      const fourMonthsAgo = new Date();
      fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);
      const after = Math.floor(fourMonthsAgo.getTime() / 1000);
      
      const timestamp = Date.now();
      const finalUrl = `${this.baseUrl}/athlete/activities?per_page=${perPage}&after=${after}&activity_type=Walk&_t=${timestamp}`;
      
      const response = await fetch(finalUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const activities = await response.json();
      return activities;
    } catch (error) {
      console.error('Error fetching walking activities:', error);
      throw error;
    }
  }

  // NOWA METODA: Pobierz tylko aktywności nordic walking
  async getNordicWalkingActivities(accessToken: string, perPage: number = 30): Promise<StravaActivity[]> {
    try {
      const fourMonthsAgo = new Date();
      fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);
      const after = Math.floor(fourMonthsAgo.getTime() / 1000);
      
      const timestamp = Date.now();
      const finalUrl = `${this.baseUrl}/athlete/activities?per_page=${perPage}&after=${after}&activity_type=Walk&_t=${timestamp}`;
      
      const response = await fetch(finalUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const activities = await response.json();
      return activities;
    } catch (error) {
      console.error('Error fetching nordic walking activities:', error);
      throw error;
    }
  }

  async getActivityDetails(accessToken: string, activityId: string): Promise<StravaActivity> {
    try {
      const response = await fetch(`${this.baseUrl}/activities/${activityId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching activity details:', error);
      throw error;
    }
  }
}
