import { create } from 'zustand';
import type { RouteData, GeoPoint } from '../services/api';

interface TripState {
    startPoint: GeoPoint | null;
    endPoint: GeoPoint | null;
    route: RouteData | null;
    weatherData: any[] | null;

    isLoading: boolean;
    error: string | null;

    setPoints: (start: GeoPoint, end: GeoPoint) => void;
    setRoute: (route: RouteData) => void;
    setWeather: (data: any[]) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

export const useTripStore = create<TripState>((set) => ({
    startPoint: null,
    endPoint: null,
    route: null,
    weatherData: null,
    isLoading: false,
    error: null,

    setPoints: (start, end) => set({ startPoint: start, endPoint: end }),
    setRoute: (route) => set({ route }),
    setWeather: (data) => set({ weatherData: data }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
}));
