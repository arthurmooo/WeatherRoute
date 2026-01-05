import { useState } from 'react';
import { MapView } from './components/Map/MapView';
import { api } from './services/api';
import type { GeoPoint } from './services/api';
import { useTripStore } from './store/useTripStore';
import { AutocompleteInput } from './components/Search/AutocompleteInput';
import { CloudRain, Wind, Sun, Navigation, Clock, Zap, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface DepartureOption {
  time: string;
  score: number;
  label: string;
}

function App() {
  const { setRoute, setLoading, setPoints, isLoading, error, setError, route } = useTripStore();

  const [startPoint, setStartPointLocal] = useState<GeoPoint | null>(null);
  const [endPoint, setEndPointLocal] = useState<GeoPoint | null>(null);

  // Departure Optimizer State
  const [showOptimizer, setShowOptimizer] = useState(false);
  const [windowStart, setWindowStart] = useState(8);
  const [windowEnd, setWindowEnd] = useState(14);
  const [departureOptions, setDepartureOptions] = useState<DepartureOption[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [selectedDeparture, setSelectedDeparture] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!startPoint || !endPoint) {
      setError("Veuillez sélectionner un départ et une arrivée");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      setPoints(startPoint, endPoint);
      const routeData = await api.getRoute(startPoint, endPoint);
      setRoute(routeData);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Erreur lors du calcul de l'itinéraire");
    } finally {
      setLoading(false);
    }
  };

  const handleOptimize = async () => {
    if (!startPoint || !endPoint) {
      setError("Veuillez sélectionner un départ et une arrivée");
      return;
    }

    setIsOptimizing(true);
    setError(null);
    setDepartureOptions([]);

    try {
      const options = await api.getOptimalDeparture(startPoint, endPoint, windowStart, windowEnd);
      setDepartureOptions(options);

      // Auto-select the best option and calculate its route
      if (options.length > 0) {
        handleSelectDeparture(options[0]);
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Erreur lors de l'optimisation");
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleSelectDeparture = async (option: DepartureOption) => {
    if (!startPoint || !endPoint) return;

    setSelectedDeparture(option.time);
    setLoading(true);
    setError(null);

    try {
      setPoints(startPoint, endPoint);
      const routeData = await api.getRouteWithDepartureTime(
        startPoint,
        endPoint,
        new Date(option.time)
      );
      setRoute(routeData);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Erreur lors du calcul de l'itinéraire");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400 bg-green-500/20 border-green-500/30';
    if (score >= 60) return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
    if (score >= 40) return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
    return 'text-red-400 bg-red-500/20 border-red-500/30';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Bon';
    if (score >= 40) return 'Moyen';
    return 'Défavorable';
  };

  return (
    <div className="flex h-screen w-screen bg-slate-900 text-white overflow-hidden font-sans">
      {/* Sidebar / Overlay */}
      <div className="absolute top-0 left-0 z-10 w-full md:w-[480px] h-full pointer-events-none flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-hide">
          <div className="bg-slate-800/90 backdrop-blur-xl p-5 md:p-6 rounded-3xl shadow-2xl border border-white/10 pointer-events-auto space-y-6 min-h-min">
            <header className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-900/40">
                <Navigation className="text-white fill-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-black bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent leading-tight">
                  Météo Trajet
                </h1>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                  Assistant Road-Trip
                </p>
              </div>
            </header>

            <div className="space-y-4 relative z-20">
              <div className="relative z-30">
                <AutocompleteInput
                  label="Point de départ"
                  placeholder="Ex: Paris, Lille..."
                  onSelect={setStartPointLocal}
                  className="z-30"
                />
              </div>

              <div className="relative z-20">
                <AutocompleteInput
                  label="Point d'arrivée"
                  placeholder="Ex: Lyon, Marseille..."
                  onSelect={setEndPointLocal}
                  className="z-20"
                />
              </div>

              {/* Departure Optimizer Toggle */}
              <button
                onClick={() => setShowOptimizer(!showOptimizer)}
                className="w-full py-3 px-4 bg-slate-700/50 hover:bg-slate-700/70 rounded-2xl font-medium transition-all flex items-center justify-between border border-white/5 group"
              >
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg transition-colors ${showOptimizer ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-600/30 text-slate-400 group-hover:text-amber-400'}`}>
                    <Sparkles size={16} />
                  </div>
                  <span className="text-sm">Optimisateur de départ</span>
                </div>
                {showOptimizer ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
              </button>

              {/* Optimizer Panel */}
              {showOptimizer && (
                <div className="p-4 bg-slate-700/30 rounded-2xl border border-white/5 space-y-4 animate-in fade-in slide-in-from-top-2">
                  <p className="text-xs text-slate-400">
                    Définissez une plage horaire pour trouver le meilleur moment de départ.
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold uppercase">Début</label>
                      <div className="relative mt-1">
                        <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <select
                          value={windowStart}
                          onChange={(e) => setWindowStart(Number(e.target.value))}
                          className="w-full pl-9 pr-3 py-2 bg-slate-700/50 rounded-xl border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
                        >
                          {Array.from({ length: 24 }, (_, i) => (
                            <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold uppercase">Fin</label>
                      <div className="relative mt-1">
                        <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <select
                          value={windowEnd}
                          onChange={(e) => setWindowEnd(Number(e.target.value))}
                          className="w-full pl-9 pr-3 py-2 bg-slate-700/50 rounded-xl border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
                        >
                          {Array.from({ length: 24 }, (_, i) => (
                            <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleOptimize}
                    disabled={isOptimizing || !startPoint || !endPoint}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed rounded-xl font-bold text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-95 flex items-center justify-center gap-2"
                  >
                    {isOptimizing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        Analyse en cours...
                      </>
                    ) : (
                      <>
                        <Zap size={16} />
                        Trouver le meilleur créneau
                      </>
                    )}
                  </button>

                  {/* Departure Options */}
                  {departureOptions.length > 0 && (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {departureOptions.map((option, idx) => (
                        <button
                          key={option.time}
                          onClick={() => handleSelectDeparture(option)}
                          className={`w-full p-3 rounded-xl border transition-all flex items-center justify-between ${selectedDeparture === option.time
                              ? 'bg-blue-600/20 border-blue-500/50 shadow-[0_0_15px_rgba(37,99,235,0.2)]'
                              : 'bg-slate-700/30 border-white/5 hover:border-white/20'
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            {idx === 0 && (
                              <div className="p-1 bg-amber-500/20 rounded-lg">
                                <Sparkles size={12} className="text-amber-400" />
                              </div>
                            )}
                            <span className="font-bold">{option.label}</span>
                            {idx === 0 && (
                              <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-bold uppercase">
                                Top
                              </span>
                            )}
                          </div>
                          <div className={`px-2 py-1 rounded-lg border text-xs font-bold leading-none flex items-center gap-2 ${getScoreColor(option.score)}`}>
                            <span>{option.score}%</span>
                            <span className="w-1 h-1 rounded-full bg-current opacity-50" />
                            <span>{getScoreLabel(option.score)}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Standard Calculate Button - Always visible as a primary action if no optimizer results or to force recalc */}
              <button
                onClick={handleSearch}
                disabled={isLoading || !startPoint || !endPoint}
                className={`w-full py-4 rounded-2xl font-bold transition-all shadow-[0_8px_30px_rgb(37,99,235,0.3)] active:scale-95 flex items-center justify-center gap-3
                  ${showOptimizer && departureOptions.length > 0 ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-blue-600 text-white hover:bg-blue-500'}
                  disabled:opacity-50 disabled:bg-slate-800 disabled:text-slate-600 disabled:shadow-none disabled:cursor-not-allowed`}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                    Calcul de la route...
                  </>
                ) : (
                  "Calculer l'itinéraire"
                )}
              </button>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm animate-in fade-in slide-in-from-top-2 flex items-start gap-3">
                  <div className="mt-0.5 min-w-[16px]">⚠️</div>
                  {error}
                </div>
              )}
            </div>

            {/* Mini Stats (if route exists) */}
            {route && (
              <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-2">
                <div className="bg-slate-700/30 p-3 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Distance</p>
                  <p className="text-xl font-bold">{(route.summary.distance / 1000).toFixed(0)} <span className="text-xs text-slate-500">km</span></p>
                </div>
                <div className="bg-slate-700/30 p-3 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Temps</p>
                  <p className="text-xl font-bold">{(route.summary.duration / 3600).toFixed(1)} <span className="text-xs text-slate-500">h</span></p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="absolute inset-0 w-full h-full">
        <MapView />
      </div>

      {/* Weather Info (Simple bottom slide for now) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hidden md:block">
        <div className="px-6 py-3 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-full flex items-center gap-8 shadow-2xl">
          <div className="flex items-center gap-2 text-amber-400">
            <Sun size={18} />
            <span className="text-xs font-bold uppercase">Optimal</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <CloudRain size={18} />
            <span className="text-xs font-bold uppercase">Pluie</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Wind size={18} />
            <span className="text-xs font-bold uppercase">Vents</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
