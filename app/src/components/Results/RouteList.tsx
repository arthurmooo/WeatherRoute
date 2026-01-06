import { ChevronDown, ChevronUp, Navigation } from 'lucide-react';
import { GlassButton, Card } from '../UI/Glassmorphism';
import { useTripStore } from '../../store/useTripStore';
import { useState } from 'react';

interface RouteListProps {
    onNavigate: () => void;
    showNavigation: boolean;
}

export function RouteList({ onNavigate, showNavigation }: RouteListProps) {
    const { routes, selectRoute, selectedRouteIndex } = useTripStore();
    const [showAlternatives, setShowAlternatives] = useState(false);
    
    const formatDuration = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.round((seconds % 3600) / 60);
        return `${h}h${m.toString().padStart(2, '0')}`;
    };

    if (routes.length === 0) return null;

    const selectedRoute = routes[selectedRouteIndex];

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {selectedRoute && (routes.length <= 1 || !showAlternatives) && (
                <div className="grid grid-cols-2 gap-3">
                    <Card className="p-3 flex flex-col items-center justify-center bg-slate-800/60 border-white/10">
                        <p className="text-[10px] text-slate-300 font-bold uppercase mb-1">Distance</p>
                        <p className="text-xl font-black text-white">{(selectedRoute.summary.distance / 1000).toFixed(0)} <span className="text-xs text-slate-400">km</span></p>
                    </Card>
                    <Card className="p-3 flex flex-col items-center justify-center bg-slate-800/60 border-white/10">
                        <p className="text-[10px] text-slate-300 font-bold uppercase mb-1">Durée</p>
                        <p className="text-xl font-black text-white">{formatDuration(selectedRoute.summary.duration)}</p>
                    </Card>
                </div>
            )}

            {routes.length > 1 && (
                <div className="space-y-2">
                    <button
                        onClick={() => setShowAlternatives(!showAlternatives)}
                        className="w-full flex items-center justify-between p-2 text-xs text-slate-300 font-bold uppercase hover:bg-white/10 rounded-lg transition-colors bg-white/5"
                    >
                        <span>Itinéraires ({routes.length})</span>
                        {showAlternatives ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {showAlternatives && (
                        <div className="grid grid-cols-1 gap-2">
                            {routes.map((r, i) => (
                                <button
                                    key={i}
                                    onClick={() => selectRoute(i)}
                                    className={`p-3 rounded-xl border transition-all text-left group w-full relative overflow-hidden
                                        ${selectedRouteIndex === i
                                            ? 'bg-blue-600/20 border-blue-500/50 shadow-lg'
                                            : 'bg-slate-800/40 border-white/5 hover:bg-slate-800/60'
                                        }`}
                                >
                                    <div className="flex justify-between items-center mb-1 relative z-10">
                                        <span className={`font-bold text-sm ${selectedRouteIndex === i ? 'text-white' : 'text-slate-200'}`}>
                                            Option {i + 1}
                                        </span>
                                        {selectedRouteIndex === i && <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />}
                                    </div>
                                    <div className="flex gap-4 text-xs relative z-10">
                                        <span className={`font-medium ${selectedRouteIndex === i ? 'text-blue-200' : 'text-slate-300'}`}>
                                            {formatDuration(r.summary.duration)}
                                        </span>
                                        <span className="opacity-30 text-white">|</span>
                                        <span className={selectedRouteIndex === i ? 'text-blue-200' : 'text-slate-300'}>
                                            {(r.summary.distance / 1000).toFixed(0)} km
                                        </span>
                                    </div>
                                    {selectedRouteIndex === i && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-transparent" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {showNavigation && (
                <GlassButton
                    onClick={onNavigate}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-900/20 group"
                >
                    <Navigation size={18} className="group-hover:translate-x-1 transition-transform" />
                    <span>Ouvrir GPS</span>
                </GlassButton>
            )}
        </div>
    );
}
