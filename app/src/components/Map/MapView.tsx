import * as React from 'react';
import Map, { NavigationControl, Marker, Source, Layer } from 'react-map-gl/maplibre';
import type { MapRef, LayerProps } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useTripStore } from '../../store/useTripStore';

// CartoDB Voyager Tiles
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';

export const MapView: React.FC = () => {
    const { startPoint, endPoint, route } = useTripStore();
    const mapRef = React.useRef<MapRef>(null);

    // Auto-fit bounds when route changes
    React.useEffect(() => {
        if (route && route.bbox && mapRef.current) {
            const [minLng, minLat, maxLng, maxLat] = route.bbox;
            mapRef.current.fitBounds(
                [[minLng, minLat], [maxLng, maxLat]],
                { padding: 50, duration: 1000 }
            );
        }
    }, [route]);

    const routeGeoJSON = React.useMemo(() => {
        if (!route) return null;

        // Transform features to flatten weatherCode for styling
        const flattenedFeatures = route.features.map(f => ({
            ...f,
            properties: {
                ...f.properties,
                weatherCode: f.properties.weather?.weatherCode ?? -1
            }
        }));

        return {
            ...route,
            features: flattenedFeatures
        };
    }, [route]);

    // Weather Color Logic (WMO Codes)
    const layerStyle: LayerProps = {
        id: 'route-line',
        type: 'line',
        paint: {
            'line-width': 6,
            'line-opacity': 0.9,
            'line-color': [
                'match',
                ['get', 'weatherCode'],
                [0, 1], '#F59E0B',
                [2, 3], '#9CA3AF',
                [45, 48], '#71717A',
                [51, 53, 55, 61, 63, 65, 56, 57, 66, 67, 80, 81, 82], '#3B82F6',
                [71, 73, 75, 77, 85, 86], '#E5E7EB',
                [95, 96, 99], '#7C3AED',
                '#6366F1'
            ] as any // Bypass strict readonly type check from MapLibre
        },
        layout: {
            'line-join': 'round',
            'line-cap': 'round'
        }
    };

    return (
        <div className="w-full h-full bg-slate-900 relative">
            <Map
                ref={mapRef}
                initialViewState={{
                    longitude: 2.3522, // Paris
                    latitude: 48.8566,
                    zoom: 5
                }}
                style={{ width: '100%', height: '100%' }}
                mapStyle={MAP_STYLE}
                attributionControl={false}
            >
                <NavigationControl position="top-right" />

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

                {routeGeoJSON && (
                    <Source id="route" type="geojson" data={routeGeoJSON as any}>
                        <Layer {...layerStyle} />
                    </Source>
                )}
            </Map>

            {/* Legend / Key */}
            <div className="absolute bottom-6 right-6 bg-slate-900/90 backdrop-blur border border-white/10 p-3 rounded-lg text-xs font-medium text-slate-300 space-y-2 shadow-xl">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500" /> <span>Soleil</span>
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
