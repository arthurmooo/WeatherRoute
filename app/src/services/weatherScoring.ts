export interface WeatherData {
    time: string;
    temperature: number;
    precipitationProb: number;
    weatherCode: number;
    cloudCover: number;
    isDay: number; // 0 or 1
}

/**
 * Calculate a weather score based on WMO weather codes.
 * Higher score = better weather (0-100 scale)
 * 
 * Rules:
 * - Clear sky: 100
 * - Rain: -40
 * - Thunderstorm: -60
 * - High precip prob (>70%): -20 additional
 */
export const calculateWeatherScore = (weather: WeatherData | null): number => {
    if (!weather) return 50; // Neutral if no data

    let score = 100;

    // Weather code penalties (WMO codes)
    const code = weather.weatherCode;
    if ([0, 1].includes(code)) {
        // Clear/Mostly clear - Best
        score -= 0;
    } else if ([2, 3].includes(code)) {
        // Partly cloudy / Overcast
        score -= 10;
    } else if ([45, 48].includes(code)) {
        // Fog
        score -= 30;
    } else if ([51, 53, 55, 56, 57].includes(code)) {
        // Drizzle
        score -= 25;
    } else if ([61, 63, 65, 66, 67].includes(code)) {
        // Rain
        score -= 40;
    } else if ([71, 73, 75, 77].includes(code)) {
        // Snow
        score -= 50;
    } else if ([80, 81, 82].includes(code)) {
        // Rain showers
        score -= 35;
    } else if ([85, 86].includes(code)) {
        // Snow showers
        score -= 45;
    } else if ([95, 96, 99].includes(code)) {
        // Thunderstorm
        score -= 60;
    }

    // Precipitation probability penalty
    if (weather.precipitationProb > 70) {
        score -= 20;
    } else if (weather.precipitationProb > 40) {
        score -= 10;
    }

    // Cloud cover penalty (minor)
    if (weather.cloudCover > 80) {
        score -= 5;
    }

    return Math.max(0, Math.min(100, score));
};
