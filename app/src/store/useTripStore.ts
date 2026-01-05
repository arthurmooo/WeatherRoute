import { create } from 'zustand';
import type { RouteData, GeoPoint } from '../services/api';

export interface TripWaypoint {
    id: string;
    location: GeoPoint | null;
    label: string;
}

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

    swapPoints: () => void;
    selectedDate: Date | null;
    setSelectedDate: (date: Date | null) => void;

    waypoints: TripWaypoint[];
    setWaypoints: (waypoints: TripWaypoint[]) => void;
    addWaypoint: () => void;
    removeWaypoint: (id: string) => void;
    updateWaypoint: (id: string, location: GeoPoint, label: string) => void;
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

    // New Actions
    swapPoints: () => set((state) => ({
        startPoint: state.endPoint,
        endPoint: state.startPoint,
        route: null
    })),
    selectedDate: null,
    setSelectedDate: (date: Date | null) => set({ selectedDate: date }),

    // Waypoints
    waypoints: [],
    setWaypoints: (waypoints) => set({ waypoints }),
    addWaypoint: () => set((state) => ({
        waypoints: [...state.waypoints, { id: crypto.randomUUID(), location: null, label: '' }]
    })),
    removeWaypoint: (id) => set((state) => ({
        waypoints: state.waypoints.filter((wp) => wp.id !== id)
    })),
    updateWaypoint: (id, location, label) => set((state) => ({
        waypoints: state.waypoints.map((wp) =>
            wp.id === id ? { ...wp, location, label } : wp
        )
    })),
}));
