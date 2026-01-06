import * as React from 'react';
import Map, { NavigationControl, Marker, Source, Layer } from 'react-map-gl/maplibre';
import type { MapRef, LayerProps } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useTripStore } from '../../store/useTripStore';

// CartoDB Tiles
const MAP_STYLE_LIGHT = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';
const MAP_STYLE_DARK = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

export const MapView: React.FC = () => {
    const { startPoint, endPoint, routes, selectedRouteIndex, waypoints, selectedDate } = useTripStore();
    const mapRef = React.useRef<MapRef>(null);

    // Determine if it's night time
    const isNight = React.useMemo(() => {
        const date = selectedDate || new Date();
        const hour = date.getHours();
        return hour >= 20 || hour < 7;
    }, [selectedDate]);

    const activeRoute = routes[selectedRouteIndex] || null;

    // Auto-fit bounds when active route changes
    React.useEffect(() => {
        if (activeRoute && activeRoute.bbox && mapRef.current) {
            const [minLng, minLat, maxLng, maxLat] = activeRoute.bbox;
            mapRef.current.fitBounds(
                [[minLng, minLat], [maxLng, maxLat]],
                { padding: { top: 50, bottom: 50, left: 50, right: 400 }, duration: 1000 } // Right padding for sidebar
            );
        }
    }, [activeRoute]);

    // Prepare Active Route Data (Weather Colored)
    const activeRouteGeoJSON = React.useMemo(() => {
        if (!activeRoute) return null;

        const flattenedFeatures = activeRoute.features.map(f => ({
            ...f,
            properties: {
                ...f.properties,
                weatherCode: f.properties.weather?.weatherCode ?? -1,
                isDay: f.properties.weather?.isDay ?? 1
            }
        }));

        return {
            ...activeRoute,
            features: flattenedFeatures
        };
    }, [activeRoute]);

    // Prepare Alternatives Data (Simple Gray Lines)
    const alternativesGeoJSON = React.useMemo(() => {
        if (routes.length <= 1) return null;

        const altFeatures = routes
            .filter((_, i) => i !== selectedRouteIndex)
            .flatMap(r => r.features); // Flatten all segments of all alternative routes

        return {
            type: 'FeatureCollection',
            features: altFeatures
        };
    }, [routes, selectedRouteIndex]);

    // Active Layer Style (Weather)
    const activeLayerStyle: LayerProps = {
        id: 'route-active',
        type: 'line',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
            'line-width': 6,
            'line-opacity': 0.9,
            'line-color': [
                'match',
                ['get', 'weatherCode'],
                [0, 1], ['case', ['==', ['get', 'isDay'], 1], '#F59E0B', '#312E81'], // Clear
                [2, 3], '#9CA3AF', // Clouds
                [45, 48], '#71717A', // Fog
                [51, 53, 55, 61, 63, 65, 56, 57, 66, 67, 80, 81, 82], '#3B82F6', // Rain
                [71, 73, 75, 77, 85, 86], '#E5E7EB', // Snow
                [95, 96, 99], '#7C3AED', // Thunder
                '#6366F1' // Default
            ] as any
        }
    };

    // Alternative Layer Style (Gray Dashed)
    const altLayerStyle: LayerProps = {
        id: 'route-alt',
        type: 'line',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
            'line-width': 4,
            'line-opacity': 0.4,
            'line-color': '#94A3B8',
            'line-dasharray': [2, 2]
        }
    };

    return (
        <div className="w-full h-full bg-slate-900 relative">
            <Map
                ref={mapRef}
                initialViewState={{
                    longitude: 2.3522,
                    latitude: 48.8566,
                    zoom: 5
                }}
                style={{ width: '100%', height: '100%' }}
                mapStyle={isNight ? MAP_STYLE_DARK : MAP_STYLE_LIGHT}
                attributionControl={false}
            >
                <NavigationControl position="top-right" />

                {/* Markers */}
                {startPoint && (
                    <Marker longitude={startPoint.lng} latitude={startPoint.lat}>
                        <div className="w-6 h-6 bg-blue-500 rounded-full border-4 border-white shadow-lg shadow-blue-500/50" />
                    </Marker>
                )}
                {endPoint && (
                    <Marker longitude={endPoint.lng} latitude={endPoint.lat}>
                        <div className="w-6 h-6 bg-red-500 rounded-full border-4 border-white shadow-lg shadow-red-500/50" />
                    </Marker>
                )}
                {waypoints.map((wp, i) => wp.location && (
                    <Marker key={wp.id} longitude={wp.location.lng} latitude={wp.location.lat}>
                        <div className="w-4 h-4 bg-slate-200 rounded-full border-2 border-slate-600 shadow-md flex items-center justify-center">
                            <span className="text-[8px] font-bold text-slate-800">{i + 1}</span>
                        </div>
                    </Marker>
                ))}

                {/* Routes */}
                {alternativesGeoJSON && (
                    <Source id="alternatives" type="geojson" data={alternativesGeoJSON as any}>
                        <Layer {...altLayerStyle} />
                    </Source>
                )}

                {activeRouteGeoJSON && (
                    <Source id="active-route" type="geojson" data={activeRouteGeoJSON as any}>
                        <Layer {...activeLayerStyle} />
                    </Source>
                )}
            </Map>

            {/* Legend */}
            <div className={`absolute bottom-6 right-6 backdrop-blur border p-3 rounded-lg text-xs font-medium space-y-2 shadow-xl ${
                isNight 
                    ? 'bg-slate-900/90 border-white/10 text-slate-300' 
                    : 'bg-white/90 border-slate-200 text-slate-700'
            }`}>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500" /> <span>Soleil</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-indigo-900 border border-white/20" /> <span>Nuit Claire</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-400" /> <span>Nuageux</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" /> <span>Pluie</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-violet-600" /> <span>Orage</span>
                </div>
            </div>
        </div>
    );
};
