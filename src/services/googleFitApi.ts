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
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: this.scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent'
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  // Pobierz token po autoryzacji
  async getToken(code: string): Promise<GoogleFitToken> {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: this.redirectUri
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        access_token: data.access_token,
        refresh_token: data.refresh_token || '',
        scope: data.scope || '',
        token_type: data.token_type || 'Bearer',
        expiry_date: Date.now() + (data.expires_in * 1000)
      };
    } catch (error) {
      console.error('Błąd podczas pobierania tokenu Google Fit:', error);
      throw error;
    }
  }

  // Pobierz aktywności z Google Fit (uproszczona wersja)
  async getActivities(accessToken: string, startTime: Date, endTime: Date): Promise<GoogleFitActivity[]> {
    try {
      // Uproszczona implementacja - w rzeczywistości wymaga Google Fit API
      // Na razie zwracamy pustą tablicę
      console.log('Google Fit API - pobieranie aktywności (uproszczone)');
      
      return [];
    } catch (error) {
      console.error('Błąd podczas pobierania aktywności Google Fit:', error);
      throw error;
    }
  }

  // Odśwież token
  async refreshToken(refreshToken: string): Promise<GoogleFitToken> {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        access_token: data.access_token,
        refresh_token: refreshToken, // zachowaj stary refresh token
        scope: data.scope || '',
        token_type: data.token_type || 'Bearer',
        expiry_date: Date.now() + (data.expires_in * 1000)
      };
    } catch (error) {
      console.error('Błąd podczas odświeżania tokenu Google Fit:', error);
      throw error;
    }
  }
}

export default GoogleFitApi;
