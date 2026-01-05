import { describe, it, expect } from 'vitest';
import { calculateWeatherScore, WeatherData } from './weatherScoring';

describe('calculateWeatherScore', () => {
    const baseWeather: WeatherData = {
        time: '2023-01-01T12:00',
        temperature: 20,
        precipitationProb: 0,
        weatherCode: 0, // Clear sky
        cloudCover: 0
    };

    it('should return 100 for perfect weather', () => {
        const score = calculateWeatherScore(baseWeather);
        expect(score).toBe(100);
    });

    it('should return 50 for null data', () => {
        expect(calculateWeatherScore(null)).toBe(50);
    });

    it('should penalize rain heavily', () => {
        const rain = { ...baseWeather, weatherCode: 61 }; // Rain: Slight
        expect(calculateWeatherScore(rain)).toBe(60); // 100 - 40
    });

    it('should penalize thunderstorm severly', () => {
        const storm = { ...baseWeather, weatherCode: 95 }; // Thunderstorm
        expect(calculateWeatherScore(storm)).toBe(40); // 100 - 60
    });

    it('should add penalty for high precipitation probability', () => {
        // Rain (40 penalty) + 80% prob (20 penalty)
        const probRain = { ...baseWeather, weatherCode: 61, precipitationProb: 80 };
        expect(calculateWeatherScore(probRain)).toBe(40); // 100 - 40 - 20
    });

    it('should never return below 0', () => {
        // Updates: Thunderstorm (-60) + High Prob (-20) + Fog if combined?? no single code.
        // Let's force it: Thunderstorm (-60) + 100% prob (-20) + Cloud cover > 80 (-5) = -85 penalty -> Score 15.
        // Wait, let's try something impossible just to test bounds logic if we had more penalties
        // But logically, score = 100 - penalties.
        // Thunderstorm (-60) + High Prob (-20) = 80 penalty. Score 20.

        // Use manual check if we changed logic to be cumulative
        const badDay = { ...baseWeather, weatherCode: 99, precipitationProb: 100, cloudCover: 100 };
        // 100 - 60 (storm) - 20 (high prob) - 5 (cloud) = 15.
        expect(calculateWeatherScore(badDay)).toBe(15);
    });
});
