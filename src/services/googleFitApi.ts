import { google } from 'googleapis';

export interface GoogleFitActivity {
  id: string;
  name: string;
  distance: number; // w metrach
  duration: number; // w milisekundach
  startTime: string;
  endTime: string;
  activityType: string;
  calories?: number;
  steps?: number;
  heartRate?: number[];
  location?: {
    latitude: number;
    longitude: number;
  }[];
}

export interface GoogleFitToken {
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  expiry_date: number;
}

class GoogleFitApi {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private scopes: string[];

  constructor() {
    this.clientId = process.env.REACT_APP_GOOGLE_FIT_CLIENT_ID || '';
    this.clientSecret = process.env.REACT_APP_GOOGLE_FIT_CLIENT_SECRET || '';
    this.redirectUri = process.env.REACT_APP_GOOGLE_FIT_REDIRECT_URI || 'http://localhost:3000/google-fit-callback';
    this.scopes = [
      'https://www.googleapis.com/auth/fitness.activity.read',
      'https://www.googleapis.com/auth/fitness.body.read',
      'https://www.googleapis.com/auth/fitness.location.read',
      'https://www.googleapis.com/auth/fitness.heart_rate.read'
    ];
  }

  // Generuj URL do autoryzacji Google Fit
  getAuthUrl(): string {
    const oauth2Client = new google.auth.OAuth2(
      this.clientId,
      this.clientSecret,
      this.redirectUri
    );

    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: this.scopes,
      prompt: 'consent'
    });
  }

  // Pobierz token po autoryzacji
  async getToken(code: string): Promise<GoogleFitToken> {
    const oauth2Client = new google.auth.OAuth2(
      this.clientId,
      this.clientSecret,
      this.redirectUri
    );

    try {
      const { tokens } = await oauth2Client.getToken(code);
      
      if (!tokens.access_token) {
        throw new Error('Brak access token');
      }

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || '',
        scope: tokens.scope || '',
        token_type: tokens.token_type || 'Bearer',
        expiry_date: tokens.expiry_date || 0
      };
    } catch (error) {
      console.error('Błąd podczas pobierania tokenu Google Fit:', error);
      throw error;
    }
  }

  // Pobierz aktywności z Google Fit
  async getActivities(accessToken: string, startTime: Date, endTime: Date): Promise<GoogleFitActivity[]> {
    const oauth2Client = new google.auth.OAuth2(
      this.clientId,
      this.clientSecret,
      this.redirectUri
    );

    oauth2Client.setCredentials({
      access_token: accessToken
    });

    const fitness = google.fitness({ version: 'v1', auth: oauth2Client });

    try {
      // Pobierz aktywności z ostatnich 4 miesięcy
      const response = await fitness.users.dataSources.datasets.get({
        userId: 'me',
        dataSourceId: 'derived:com.google.activity.summary:com.google.android.gms:aggregated',
        datasetId: `${startTime.getTime() * 1000000}-${endTime.getTime() * 1000000}`
      });

      const activities: GoogleFitActivity[] = [];
      
      if (response.data.point) {
        for (const point of response.data.point) {
          if (point.value && point.value[0] && point.value[0].intVal) {
            const activityType = this.mapActivityType(point.value[0].intVal);
            
            if (activityType) {
              activities.push({
                id: point.startTimeNanos || '',
                name: activityType,
                distance: point.value[1]?.fpVal || 0,
                duration: (point.endTimeNanos ? parseInt(point.endTimeNanos) : 0) - 
                         (point.startTimeNanos ? parseInt(point.startTimeNanos) : 0),
                startTime: point.startTimeNanos || '',
                endTime: point.endTimeNanos || '',
                activityType: activityType,
                calories: point.value[2]?.fpVal || 0
              });
            }
          }
        }
      }

      return activities;
    } catch (error) {
      console.error('Błąd podczas pobierania aktywności Google Fit:', error);
      throw error;
    }
  }

  // Mapuj typy aktywności Google Fit na nasze typy
  private mapActivityType(googleFitType: number): string | null {
    const activityTypes: { [key: number]: string } = {
      1: 'Running',
      2: 'Cycling',
      3: 'Walking',
      4: 'Swimming',
      5: 'Hiking',
      6: 'Yoga',
      7: 'Weight Training',
      8: 'Elliptical',
      9: 'Rowing',
      10: 'CrossFit'
    };

    return activityTypes[googleFitType] || null;
  }

  // Odśwież token
  async refreshToken(refreshToken: string): Promise<GoogleFitToken> {
    const oauth2Client = new google.auth.OAuth2(
      this.clientId,
      this.clientSecret,
      this.redirectUri
    );

    try {
      oauth2Client.setCredentials({
        refresh_token: refreshToken
      });

      const { credentials } = await oauth2Client.refreshAccessToken();
      
      return {
        access_token: credentials.access_token || '',
        refresh_token: credentials.refresh_token || refreshToken,
        scope: credentials.scope || '',
        token_type: credentials.token_type || 'Bearer',
        expiry_date: credentials.expiry_date || 0
      };
    } catch (error) {
      console.error('Błąd podczas odświeżania tokenu Google Fit:', error);
      throw error;
    }
  }
}

export default GoogleFitApi;
