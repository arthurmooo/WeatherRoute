import { Card } from '../UI/Glassmorphism';
import { Sun, CloudRain, Droplets, CloudLightning, CloudSnow, CloudFog } from 'lucide-react';
import { useTripStore } from '../../store/useTripStore';

export function RouteStats() {
    const { routes, selectedRouteIndex } = useTripStore();
    const route = routes[selectedRouteIndex];

    if (!route) return null;

    const weatherSummary = route.features.reduce((acc, f) => {
        const code = f.properties.weather?.weatherCode || 0;
        if (code >= 95) acc.storm++;
        else if (code >= 71) acc.snow++;
        else if (code >= 51) acc.rain++;
        else if (code >= 45) acc.fog++;
        else if (code <= 1) acc.sun++;
        return acc;
    }, { sun: 0, rain: 0, storm: 0, snow: 0, fog: 0 });

    const totalSegments = route.features.length;
    const sunPercent = Math.round((weatherSummary.sun / totalSegments) * 100);
    const rainPercent = Math.round(((weatherSummary.rain + weatherSummary.storm) / totalSegments) * 100);

    return (
        <Card className="p-4 min-w-[300px] animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-3">
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Trajet</span>
                    <span className="text-2xl font-black text-white">
                        {Math.floor(route.summary.duration / 3600)}h{Math.round((route.summary.duration % 3600) / 60).toString().padStart(2, '0')}
                    </span>
                    <span className="text-sm text-slate-400">{(route.summary.distance / 1000).toFixed(0)} km</span>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1 text-amber-400 mb-1">
                            <Sun size={16} />
                            <span className="font-bold">{sunPercent}%</span>
                        </div>
                        <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400" style={{ width: `${sunPercent}%` }} />
                        </div>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1 text-blue-400 mb-1">
                            <CloudRain size={16} />
                            <span className="font-bold">{rainPercent}%</span>
                        </div>
                        <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500" style={{ width: `${rainPercent}%` }} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {weatherSummary.storm > 0 && (
                    <div className="px-2 py-1 bg-violet-500/20 text-violet-300 rounded-lg text-xs font-bold flex items-center gap-1 border border-violet-500/30">
                        <CloudLightning size={12} /> Orages
                    </div>
                )}
                {weatherSummary.snow > 0 && (
                    <div className="px-2 py-1 bg-white/10 text-white rounded-lg text-xs font-bold flex items-center gap-1 border border-white/20">
                        <CloudSnow size={12} /> Neige
                    </div>
                )}
                {weatherSummary.fog > 0 && (
                    <div className="px-2 py-1 bg-slate-500/20 text-slate-300 rounded-lg text-xs font-bold flex items-center gap-1 border border-slate-500/30">
                        <CloudFog size={12} /> Brouillard
                    </div>
                )}
                 {weatherSummary.rain > 0 && (
                    <div className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-xs font-bold flex items-center gap-1 border border-blue-500/30">
                        <Droplets size={12} /> Pluie
                    </div>
                )}
            </div>
        </Card>
    );
}
