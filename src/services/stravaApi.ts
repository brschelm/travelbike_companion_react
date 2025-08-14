import { StravaToken, StravaActivity } from '../types';

export class StravaAPI {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private baseUrl: string;
  private tokenUrl: string;

  constructor() {
    // Hardcoded values for Docker compatibility
    // Updated for production deployment - using primary domain
    this.clientId = '164470';
    this.clientSecret = '93fca6adc86e9d6b93be27d6499551465ffb33e6';
    this.redirectUri = 'https://travelbike-companion-react.vercel.app/strava-callback';
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
      const response = await fetch(`${this.baseUrl}/athlete/activities?per_page=${perPage}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching activities:', error);
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
