// Strava API Types
export interface StravaToken {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  expires_in: number;
}



export interface StravaActivity {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  type: string;
  start_date: string;
  start_date_local: string;
  average_speed: number;
  max_speed: number;
  average_cadence?: number;
  average_watts?: number;
  max_watts?: number;
  weighted_average_watts?: number;
  kilojoules?: number;
  average_heartrate?: number;
  max_heartrate?: number;
  elev_high?: number;
  elev_low?: number;
  start_latlng?: [number, number];
  end_latlng?: [number, number];
  map?: {
    summary_polyline: string;
  };
}

// Activity Type Constants
export const ACTIVITY_TYPES = {
  RIDE: 'Ride',
  RUN: 'Run',
  WALK: 'Walk',
  SWIM: 'Swim',
  HIKE: 'Hike',
  YOGA: 'Yoga',
  WORKOUT: 'Workout',
  ALPINE_SKI: 'AlpineSki',
  BACKCOUNTRY_SKI: 'BackcountrySki',
  CANOEING: 'Canoeing',
  CROSSFIT: 'Crossfit',
  ELLIPTICAL: 'Elliptical',
  GOLF: 'Golf',
  HANDCYCLE: 'Handcycle',
  ICE_SKATE: 'IceSkate',
  INLINE_SKATE: 'InlineSkate',
  KAYAKING: 'Kayaking',
  KETTLEBELL: 'Kettlebell',
  NORDIC_SKI: 'NordicSki',
  ROCK_CLIMBING: 'RockClimbing',
  ROLLER_SKI: 'RollerSki',
  ROWING: 'Rowing',
  SNOWBOARD: 'Snowboard',
  SNOWSHOE: 'Snowshoe',
  STAIR_STEPPER: 'StairStepper',
  STANDUP_PADDLING: 'StandUpPaddling',
  SURFING: 'Surfing',
  VELOMOBILE: 'Velomobile',
  WEIGHT_TRAINING: 'WeightTraining',
  WHEELCHAIR: 'Wheelchair'
} as const;

export type ActivityType = typeof ACTIVITY_TYPES[keyof typeof ACTIVITY_TYPES];

// Activity Category
export const ACTIVITY_CATEGORIES = {
  CYCLING: 'cycling',
  RUNNING: 'running',
  OTHER: 'other'
} as const;

export type ActivityCategory = typeof ACTIVITY_CATEGORIES[keyof typeof ACTIVITY_CATEGORIES];

// Extended Activity with category
export interface CategorizedActivity extends StravaActivity {
  category: ActivityCategory;
  isCycling: boolean;
  isRunning: boolean;
}

export interface StravaAthlete {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  city: string;
  state: string;
  country: string;
  profile: string;
  follower_count: number;
  friend_count: number;
  weight: number;
}

// Goals Types
export interface Goal {
  id: string;
  name: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  type: 'distance' | 'time' | 'activities' | 'elevation';
  deadline?: string;
  endDate?: string;
  value?: number;
  achieved: boolean;
  createdAt: string;
}

export interface GoalFormData {
  name: string;
  title: string;
  description: string;
  target: number;
  unit: string;
  type: 'distance' | 'time' | 'activities' | 'elevation';
  deadline?: string;
}

// Statistics Types
export interface MonthlyStats {
  month: string;
  distance: number;
  time: number;
  activities: number;
  elevation: number;
}

export interface DailyStats {
  date: string;
  distance: number;
  time: number;
  activities: number;
  elevation: number;
}

// GPX Types
export interface GPXRoute {
  name: string;
  distance: number;
  elevation: number;
  points: [number, number][];
  timestamp: string;
}

// App Settings
export interface AppSettings {
  stravaClientId: string;
  stravaClientSecret: string;
  stravaRedirectUri: string;
  units: 'metric' | 'imperial';
  theme: 'light' | 'dark';
  language: 'pl' | 'en';
}

// Training Zones Types
export interface HeartRateZones {
  zone1: { min: number; max: number; name: string; description: string };
  zone2: { min: number; max: number; name: string; description: string };
  zone3: { min: number; max: number; name: string; description: string };
  zone4: { min: number; max: number; name: string; description: string };
  zone5: { min: number; max: number; name: string; description: string };
}

export interface TrainingZoneAnalysis {
  totalTime: number;
  zone1Time: number;
  zone2Time: number;
  zone3Time: number;
  zone4Time: number;
  zone5Time: number;
  zone2Percentage: number;
  recommendations: string[];
}

export interface UserProfile {
  age: number;
  maxHeartRate?: number;
  restingHeartRate?: number;
  lactateThreshold?: number;
}

