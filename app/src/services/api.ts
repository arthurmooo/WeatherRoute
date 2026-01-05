import axios from 'axios';
import { calculateWeatherScore, type WeatherData } from './weatherScoring';

const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY;

// OpenRouteService Instance
const orsClient = axios.create({
    baseURL: 'https://api.openrouteservice.org',
});

// Open-Meteo Instance
const weatherClient = axios.create({
    baseURL: 'https://api.open-meteo.com/v1',
});

export interface GeoPoint {
    lat: number;
    lng: number;
}

export { type WeatherData };

export interface RouteSegment {
    type: 'Feature';
    properties: {
        weather: WeatherData | null;
        segmentIndex: number;
    };
    geometry: {
        type: 'LineString';
        coordinates: number[][]; // [lng, lat][]
    };
}

export interface RouteData {
    type: 'FeatureCollection';
    features: RouteSegment[];
    summary: {
        duration: number;
        distance: number;
    };
    bbox: [number, number, number, number];
}

export interface AutocompleteSuggestion {
    label: string;
    coordinates: GeoPoint;
    postcode?: string;
    city?: string;
}

export const api = {
    autocomplete: async (query: string): Promise<AutocompleteSuggestion[]> => {
        if (!query || query.length < 2) return [];
        try {
            const response = await orsClient.get('/geocode/autocomplete', {
                params: {
                    api_key: ORS_API_KEY,
                    text: query,
                    size: 5,
                },
            });

            return response.data.features.map((f: any) => ({
                label: f.properties.label,
                coordinates: {
                    lat: f.geometry.coordinates[1],
                    lng: f.geometry.coordinates[0],
                },
                postcode: f.properties.postalcode,
                city: f.properties.locality || f.properties.name,
            }));
        } catch (error) {
            console.error('Autocomplete error:', error);
            return [];
        }
    },

    geocode: async (query: string): Promise<GeoPoint> => {
        try {
            const response = await orsClient.get('/geocode/search', {
                params: {
                    api_key: ORS_API_KEY,
                    text: query,
                    size: 1,
                },
            });

            if (response.data.features.length === 0) {
                throw new Error(`Lieu non trouvé : ${query}`);
            }

            const [lng, lat] = response.data.features[0].geometry.coordinates;
            return { lat, lng };
        } catch (error) {
            console.error('Geocoding error:', error);
            throw error;
        }
    },

    getRoute: async (start: GeoPoint, end: GeoPoint, waypoints: GeoPoint[] = []): Promise<RouteData> => {
        if (!ORS_API_KEY || ORS_API_KEY.includes('YOUR_')) {
            console.warn('Missing ORS API Key');
            throw new Error('API Key Missing');
        }

        const coordinates = [
            [start.lng, start.lat],
            ...waypoints.map(p => [p.lng, p.lat]),
            [end.lng, end.lat],
        ];

        // 1. GET ROUTE (GeoJSON) from ORS
        const { data: geojson } = await orsClient.post('/v2/directions/driving-car/geojson', {
            coordinates,
        }, {
            headers: {
                Authorization: ORS_API_KEY,
            },
        });

        const mainFeature = geojson.features[0];
        const { duration, distance } = mainFeature.properties.summary;
        const allCoordinates = mainFeature.geometry.coordinates; // Array of [lng, lat]

        // 2. SEGMENTATION (Every 30 mins)
        const SEGMENT_DURATION = 1800; // 30 mins in seconds
        const segmentCount = Math.max(1, Math.ceil(duration / SEGMENT_DURATION));

        const weatherPromises: Promise<WeatherData | null>[] = [];
        const segmentsCoords: number[][][] = [];

        // Calculate start time (Now)
        const startTime = new Date();

        for (let i = 0; i < segmentCount; i++) {
            const startIdx = Math.floor((i / segmentCount) * (allCoordinates.length - 1));
            const endIdx = Math.floor(((i + 1) / segmentCount) * (allCoordinates.length - 1));

            const segmentCoordinates = allCoordinates.slice(startIdx, endIdx + 2);
            segmentsCoords.push(segmentCoordinates);

            const midIdx = Math.floor((startIdx + endIdx) / 2);
            const [midLng, midLat] = allCoordinates[midIdx];

            const timeOffsetSeconds = (duration / segmentCount) * (i + 0.5);
            const estimatedTime = new Date(startTime.getTime() + timeOffsetSeconds * 1000);
            const isoHour = estimatedTime.toISOString().slice(0, 13) + ':00';

            weatherPromises.push(api.getWeather(midLat, midLng, isoHour));
        }

        // 3. FETCH WEATHER
        const weatherResults = await Promise.all(weatherPromises);

        // 4. CONSTRUCT GEOJSON COLLECTION
        const features: RouteSegment[] = segmentsCoords.map((coords, i) => ({
            type: 'Feature',
            properties: {
                weather: weatherResults[i],
                segmentIndex: i
            },
            geometry: {
                type: 'LineString',
                coordinates: coords
            }
        }));

        return {
            type: 'FeatureCollection',
            features,
            summary: { duration, distance },
            bbox: mainFeature.bbox
        };
    },

    getWeather: async (lat: number, lng: number, timeISO: string): Promise<WeatherData | null> => {
        try {
            const response = await weatherClient.get('/forecast', {
                params: {
                    latitude: lat,
                    longitude: lng,
                    hourly: 'temperature_2m,precipitation_probability,weather_code,cloud_cover,is_day',
                    start_hour: timeISO,
                    end_hour: timeISO,
                    timezone: 'auto'
                }
            });

            const h = response.data.hourly;
            if (!h || !h.time || h.time.length === 0) return null;

            return {
                time: h.time[0],
                temperature: h.temperature_2m[0],
                precipitationProb: h.precipitation_probability[0],
                weatherCode: h.weather_code[0],
                cloudCover: h.cloud_cover[0],
                isDay: h.is_day[0]
            };
        } catch (e) {
            console.warn('Weather fetch warning:', e);
            return null;
        }
    },

    /**
     * Get route with weather for a specific departure time
     */
    getRouteWithDepartureTime: async (start: GeoPoint, end: GeoPoint, departureTime: Date, waypoints: GeoPoint[] = []): Promise<RouteData> => {
        if (!ORS_API_KEY || ORS_API_KEY.includes('YOUR_')) {
            throw new Error('API Key Missing');
        }

        const coordinates = [
            [start.lng, start.lat],
            ...waypoints.map(p => [p.lng, p.lat]),
            [end.lng, end.lat],
        ];

        const { data: geojson } = await orsClient.post('/v2/directions/driving-car/geojson', {
            coordinates,
        }, {
            headers: {
                Authorization: ORS_API_KEY,
            },
        });

        const mainFeature = geojson.features[0];
        const { duration, distance } = mainFeature.properties.summary;
        const allCoordinates = mainFeature.geometry.coordinates;

        const SEGMENT_DURATION = 1800;
        const segmentCount = Math.max(1, Math.ceil(duration / SEGMENT_DURATION));

        const weatherPromises: Promise<WeatherData | null>[] = [];
        const segmentsCoords: number[][][] = [];

        for (let i = 0; i < segmentCount; i++) {
            const startIdx = Math.floor((i / segmentCount) * (allCoordinates.length - 1));
            const endIdx = Math.floor(((i + 1) / segmentCount) * (allCoordinates.length - 1));

            const segmentCoordinates = allCoordinates.slice(startIdx, endIdx + 2);
            segmentsCoords.push(segmentCoordinates);

            const midIdx = Math.floor((startIdx + endIdx) / 2);
            const [midLng, midLat] = allCoordinates[midIdx];

            const timeOffsetSeconds = (duration / segmentCount) * (i + 0.5);
            const estimatedTime = new Date(departureTime.getTime() + timeOffsetSeconds * 1000);
            const isoHour = estimatedTime.toISOString().slice(0, 13) + ':00';

            weatherPromises.push(api.getWeather(midLat, midLng, isoHour));
        }

        const weatherResults = await Promise.all(weatherPromises);

        const features: RouteSegment[] = segmentsCoords.map((coords, i) => ({
            type: 'Feature',
            properties: {
                weather: weatherResults[i],
                segmentIndex: i
            },
            geometry: {
                type: 'LineString',
                coordinates: coords
            }
        }));

        return {
            type: 'FeatureCollection',
            features,
            summary: { duration, distance },
            bbox: mainFeature.bbox
        };
    },

    /**
     * Find the optimal departure time within a given window.
     */
    getOptimalDeparture: async (
        start: GeoPoint,
        end: GeoPoint,
        windowStartHour: number,
        windowEndHour: number,
        waypoints: GeoPoint[] = []
    ): Promise<{ time: string; score: number; label: string }[]> => {
        const now = new Date();
        const results: { time: string; score: number; label: string }[] = [];

        try {
            const coordinates = [
                [start.lng, start.lat],
                ...waypoints.map(p => [p.lng, p.lat]),
                [end.lng, end.lat],
            ];

            // Get route geometry once
            const { data: geojson } = await orsClient.post('/v2/directions/driving-car/geojson', {
                coordinates,
            }, {
                headers: {
                    Authorization: ORS_API_KEY,
                },
            });

            const mainFeature = geojson.features[0];
            const { duration } = mainFeature.properties.summary;
            const allCoordinates = mainFeature.geometry.coordinates;

            // Sample 3 points along the route for weather checks
            const samplePoints = [
                allCoordinates[0],
                allCoordinates[Math.floor(allCoordinates.length / 2)],
                allCoordinates[allCoordinates.length - 1]
            ];

            // Check each hour in the window
            for (let h = windowStartHour; h <= windowEndHour; h++) {
                const departTime = new Date(now);
                departTime.setHours(h, 0, 0, 0);

                // TODO: Uncomment for production to prevent checking past hours
                // if (departTime < now) continue;

                // Get weather at sample points for this departure time
                const weatherPromises = samplePoints.map((coord, idx) => {
                    const timeOffsetSeconds = (duration * idx) / 2; // start, mid, end
                    const estimatedTime = new Date(departTime.getTime() + timeOffsetSeconds * 1000);
                    const isoHour = estimatedTime.toISOString().slice(0, 13) + ':00';
                    return api.getWeather(coord[1], coord[0], isoHour);
                });

                const weatherData = await Promise.all(weatherPromises);
                const scores = weatherData.map(w => calculateWeatherScore(w));
                const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

                const label = departTime.toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit'
                });

                results.push({
                    time: departTime.toISOString(),
                    score: avgScore,
                    label
                });
            }

            return results.sort((a, b) => b.score - a.score);

        } catch (error) {
            console.error("Optimization failed:", error);
            throw error;
        }
    }
};
