import { StravaActivity, CategorizedActivity, ACTIVITY_TYPES, ACTIVITY_CATEGORIES, HeartRateZones, TrainingZoneAnalysis } from '../types';

// Test logowania - sprawdź czy to się wyświetla
/**
 * Kategoryzuje aktywność Strava na podstawie jej typu
 */
export function categorizeActivity(activity: StravaActivity): CategorizedActivity {
  const type = activity.type;
  
  let category: typeof ACTIVITY_CATEGORIES[keyof typeof ACTIVITY_CATEGORIES];
  let isCycling = false;
  let isRunning = false;

  // Kategoria rowerowa
  if ([
    ACTIVITY_TYPES.RIDE,
    ACTIVITY_TYPES.HANDCYCLE,
    ACTIVITY_TYPES.VELOMOBILE
  ].includes(type as any)) {
    category = ACTIVITY_CATEGORIES.CYCLING;
    isCycling = true;
  }
  // Kategoria biegowa
  else if ([
    ACTIVITY_TYPES.RUN,
    ACTIVITY_TYPES.WALK,
    ACTIVITY_TYPES.HIKE
  ].includes(type as any)) {
    category = ACTIVITY_CATEGORIES.RUNNING;
    isRunning = true;
  }
  // Inne aktywności
  else {
    category = ACTIVITY_CATEGORIES.OTHER;
  }

  return {
    ...activity,
    category,
    isCycling,
    isRunning
  };
}

/**
 * Filtruje aktywności według kategorii
 */
export function filterActivitiesByCategory(
  activities: CategorizedActivity[], 
  category: typeof ACTIVITY_CATEGORIES[keyof typeof ACTIVITY_CATEGORIES]
): CategorizedActivity[] {
  return activities.filter(activity => activity.category === category);
}

/**
 * Filtruje aktywności rowerowe
 */
export function filterCyclingActivities(activities: CategorizedActivity[]): CategorizedActivity[] {
  return activities.filter(activity => activity.isCycling);
}

/**
 * Filtruje aktywności biegowe
 */
export function filterRunningActivities(activities: CategorizedActivity[]): CategorizedActivity[] {
  return activities.filter(activity => activity.isRunning);
}

/**
 * Grupuje aktywności według kategorii
 */
export function groupActivitiesByCategory(activities: CategorizedActivity[]) {
  return activities.reduce((acc, activity) => {
    if (!acc[activity.category]) {
      acc[activity.category] = [];
    }
    acc[activity.category].push(activity);
    return acc;
  }, {} as Record<string, CategorizedActivity[]>);
}

/**
 * Oblicza statystyki dla danej kategorii aktywności
 */
export function calculateCategoryStats(activities: CategorizedActivity[], category: string) {
  console.log(`=== OBLICZANIE STATYSTYK DLA KATEGORII: ${category} ===`);
  console.log('Liczba aktywności:', activities.length);
  
  const categoryActivities = activities.filter(activity => activity.category === category);
  console.log(`Aktywności w kategorii ${category}:`, categoryActivities.length);
  
  if (categoryActivities.length === 0) {
    console.log(`Brak aktywności w kategorii ${category}`);
    return {
      count: 0,
      totalDistance: 0,
      totalTime: 0,
      totalElevation: 0,
      averageSpeed: 0
    };
  }

  // Loguj każdą aktywność w kategorii
  categoryActivities.forEach((activity, index) => {
    console.log(`Aktywność ${index + 1}:`, {
      id: activity.id,
      name: activity.name,
      type: activity.type,
      distance: activity.distance,
      moving_time: activity.moving_time,
      average_speed: activity.average_speed,
      max_speed: activity.max_speed
    });
  });

  const totalDistance = categoryActivities.reduce((sum, activity) => sum + activity.distance, 0);
  const totalTime = categoryActivities.reduce((sum, activity) => sum + activity.moving_time, 0);
  const totalElevation = categoryActivities.reduce((sum, activity) => sum + activity.total_elevation_gain, 0);
  
  // Debug: loguj wartości
  console.log('Total distance (m):', totalDistance);
  console.log('Total time (s):', totalTime);
  console.log('Total time (h):', totalTime / 3600);
  
  // Oblicz średnią prędkość w km/h
  const averageSpeed = totalTime > 0 ? (totalDistance / 1000) / (totalTime / 3600) : 0;
  console.log('Calculated average speed (km/h):', averageSpeed);

  return {
    count: categoryActivities.length,
    totalDistance: totalDistance / 1000, // w kilometrach
    totalTime: totalTime / 3600, // w godzinach
    totalElevation: totalElevation, // w metrach
    averageSpeed: averageSpeed // w km/h
  };
}

/**
 * Formatuje typ aktywności na polski
 */
export function formatActivityType(type: string): string {
  const typeMap: Record<string, string> = {
    [ACTIVITY_TYPES.RIDE]: 'Jazda rowerem',
    [ACTIVITY_TYPES.RUN]: 'Bieg',
    [ACTIVITY_TYPES.WALK]: 'Spacer',
    [ACTIVITY_TYPES.HIKE]: 'Wędrówka',
    [ACTIVITY_TYPES.SWIM]: 'Pływanie',
    [ACTIVITY_TYPES.YOGA]: 'Joga',
    [ACTIVITY_TYPES.WORKOUT]: 'Trening',
    [ACTIVITY_TYPES.HANDCYCLE]: 'Rower ręczny',
    [ACTIVITY_TYPES.VELOMOBILE]: 'Velomobile',
    [ACTIVITY_TYPES.ALPINE_SKI]: 'Narciarstwo alpejskie',
    [ACTIVITY_TYPES.BACKCOUNTRY_SKI]: 'Narciarstwo backcountry',
    [ACTIVITY_TYPES.CANOEING]: 'Kajakarstwo',
    [ACTIVITY_TYPES.CROSSFIT]: 'Crossfit',
    [ACTIVITY_TYPES.ELLIPTICAL]: 'Orbitrek',
    [ACTIVITY_TYPES.GOLF]: 'Golf',
    [ACTIVITY_TYPES.ICE_SKATE]: 'Łyżwiarstwo',
    [ACTIVITY_TYPES.INLINE_SKATE]: 'Rolki',
    [ACTIVITY_TYPES.KAYAKING]: 'Kajakarstwo',
    [ACTIVITY_TYPES.KETTLEBELL]: 'Kettlebell',
    [ACTIVITY_TYPES.NORDIC_SKI]: 'Narciarstwo biegowe',
    [ACTIVITY_TYPES.ROCK_CLIMBING]: 'Wspinaczka',
    [ACTIVITY_TYPES.ROLLER_SKI]: 'Narty rolkowe',
    [ACTIVITY_TYPES.ROWING]: 'Wioślarstwo',
    [ACTIVITY_TYPES.SNOWBOARD]: 'Snowboard',
    [ACTIVITY_TYPES.SNOWSHOE]: 'Rakiety śnieżne',
    [ACTIVITY_TYPES.STAIR_STEPPER]: 'Stepper',
    [ACTIVITY_TYPES.STANDUP_PADDLING]: 'SUP',
    [ACTIVITY_TYPES.SURFING]: 'Surfing',
    [ACTIVITY_TYPES.WEIGHT_TRAINING]: 'Trening siłowy',
    [ACTIVITY_TYPES.WHEELCHAIR]: 'Wózek inwalidzki'
  };

  return typeMap[type] || type;
}

/**
 * Oblicza strefy treningowe na podstawie wieku (formuła 220 - wiek)
 */
export function calculateTrainingZones(age: number): HeartRateZones {
  const maxHR = 220 - age;
  
  return {
    zone1: {
      min: Math.round(maxHR * 0.5),
      max: Math.round(maxHR * 0.6),
      name: 'Regeneracja',
      description: 'Spokojne rozbieganie, regeneracja'
    },
    zone2: {
      min: Math.round(maxHR * 0.6),
      max: Math.round(maxHR * 0.7),
      name: 'Wydolność tlenowa',
      description: 'Podstawowe tempo, poprawa wydolności'
    },
    zone3: {
      min: Math.round(maxHR * 0.7),
      max: Math.round(maxHR * 0.8),
      name: 'Tempo maratońskie',
      description: 'Tempo maratońskie, wytrzymałość'
    },
    zone4: {
      min: Math.round(maxHR * 0.8),
      max: Math.round(maxHR * 0.9),
      name: 'Próg mleczanowy',
      description: 'Próg mleczanowy, interwały'
    },
    zone5: {
      min: Math.round(maxHR * 0.9),
      max: maxHR,
      name: 'Maksymalna intensywność',
      description: 'Maksymalna intensywność, sprinty'
    }
  };
}

/**
 * Analizuje aktywność pod kątem stref treningowych
 */
export function analyzeTrainingZones(
  activity: CategorizedActivity, 
  zones: HeartRateZones
): TrainingZoneAnalysis {
  if (!activity.average_heartrate) {
    return {
      totalTime: activity.moving_time,
      zone1Time: 0,
      zone2Time: 0,
      zone3Time: 0,
      zone4Time: 0,
      zone5Time: 0,
      zone2Percentage: 0,
      recommendations: ['Brak danych o tętnie - dodaj monitor tętna do treningów']
    };
  }

  const avgHR = activity.average_heartrate;
  const totalTime = activity.moving_time;
  
  // Uproszczona analiza - zakładamy, że cały czas spędzony w danej strefie
  // W rzeczywistości można by analizować każdą minutę osobno
  let zone1Time = 0;
  let zone2Time = 0;
  let zone3Time = 0;
  let zone4Time = 0;
  let zone5Time = 0;

  if (avgHR >= zones.zone1.min && avgHR < zones.zone1.max) {
    zone1Time = totalTime;
  } else if (avgHR >= zones.zone2.min && avgHR < zones.zone2.max) {
    zone2Time = totalTime;
  } else if (avgHR >= zones.zone3.min && avgHR < zones.zone3.max) {
    zone3Time = totalTime;
  } else if (avgHR >= zones.zone4.min && avgHR < zones.zone4.max) {
    zone4Time = totalTime;
  } else if (avgHR >= zones.zone5.min && avgHR <= zones.zone5.max) {
    zone5Time = totalTime;
  }

  const zone2Percentage = (zone2Time / totalTime) * 100;

  // Generuj rekomendacje
  const recommendations: string[] = [];
  
  if (zone2Percentage >= 80) {
    recommendations.push('🎯 Doskonale! Spędziłeś większość czasu w strefie 2 - idealne dla poprawy wydolności');
  } else if (zone2Percentage >= 50) {
    recommendations.push('👍 Dobrze! Strefa 2 dominuje w treningu - kontynuuj w tym tempie');
  } else if (zone2Percentage > 0) {
    recommendations.push('💪 Częściowo w strefie 2 - spróbuj zwiększyć czas w tej strefie');
  } else {
    recommendations.push('⚠️ Brak czasu w strefie 2 - rozważ wolniejsze tempo dla poprawy wydolności');
  }

  if (zone4Time > 0 || zone5Time > 0) {
    recommendations.push('⚡ Wysoka intensywność - pamiętaj o regeneracji między treningami');
  }

  if (zone1Time > totalTime * 0.5) {
    recommendations.push('🐌 Dużo czasu w strefie 1 - rozważ zwiększenie intensywności');
  }

  return {
    totalTime,
    zone1Time,
    zone2Time,
    zone3Time,
    zone4Time,
    zone5Time,
    zone2Percentage,
    recommendations
  };
}

/**
 * Sprawdza czy aktywność była głównie w strefie 2
 */
export function isZone2Training(analysis: TrainingZoneAnalysis): boolean {
  return analysis.zone2Percentage >= 60;
}

/**
 * Formatuje czas w sekundach na czytelny format
 */
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }
  return `${minutes}min`;
}
