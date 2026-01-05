import { useState } from 'react';
import { MapView } from './components/Map/MapView';
import { api } from './services/api';
import type { GeoPoint } from './services/api';
import { useTripStore } from './store/useTripStore';
import { AutocompleteInput } from './components/Search/AutocompleteInput';
import { CloudRain, Wind, Sun, Navigation, Clock, Zap, ChevronDown, ChevronUp, Sparkles, ArrowUpDown, Calendar, MapPin, Plus, X } from 'lucide-react';

interface DepartureOption {
  time: string;
  score: number;
  label: string;
}

function App() {
  const {
    setRoute, setLoading, setPoints, isLoading, error, setError, route, swapPoints, selectedDate, setSelectedDate,
    waypoints, addWaypoint, removeWaypoint, updateWaypoint
  } = useTripStore();

  const [startPoint, setStartPointLocal] = useState<GeoPoint | null>(null);
  const [startLabel, setStartLabel] = useState<string>('');

  const [endPoint, setEndPointLocal] = useState<GeoPoint | null>(null);
  const [endLabel, setEndLabel] = useState<string>('');

  const [isSwapping, setIsSwapping] = useState(false);

  // Departure Optimizer State
  const [showOptimizer, setShowOptimizer] = useState(false);
  const [windowStart, setWindowStart] = useState(8);
  const [windowEnd, setWindowEnd] = useState(14);
  const [departureOptions, setDepartureOptions] = useState<DepartureOption[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [selectedDeparture, setSelectedDeparture] = useState<string | null>(null);

  const getValidWaypoints = () => waypoints.filter(wp => wp.location !== null).map(wp => wp.location!);

  const handleSearch = async () => {
    if (!startPoint || !endPoint) {
      setError("Veuillez sélectionner un départ et une arrivée");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      setPoints(startPoint, endPoint);
      const validWaypoints = getValidWaypoints();

      let routeData;
      if (selectedDate) {
        routeData = await api.getRouteWithDepartureTime(startPoint, endPoint, selectedDate, validWaypoints);
      } else {
        routeData = await api.getRoute(startPoint, endPoint, validWaypoints);
      }

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
      const validWaypoints = getValidWaypoints();
      const options = await api.getOptimalDeparture(startPoint, endPoint, windowStart, windowEnd, validWaypoints);
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
      const validWaypoints = getValidWaypoints();
      const routeData = await api.getRouteWithDepartureTime(
        startPoint,
        endPoint,
        new Date(option.time),
        validWaypoints
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

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.round((seconds % 3600) / 60);
    return `${h}h${m.toString().padStart(2, '0')}`;
  };

  const handleSwap = () => {
    setIsSwapping(true);

    // Swap Points
    const tempPoint = startPoint;
    setStartPointLocal(endPoint);
    setEndPointLocal(tempPoint);

    // Swap Labels
    const tempLabel = startLabel;
    setStartLabel(endLabel);
    setEndLabel(tempLabel);

    swapPoints();

    setTimeout(() => setIsSwapping(false), 300);
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
              <div className="relative z-30 flex flex-col gap-2">
                {/* Inputs Container with Swap Button */}
                <div className="relative flex flex-col gap-2">
                  <AutocompleteInput
                    label="Point de départ"
                    placeholder="Ex: Paris, Lille..."
                    onSelect={(pt, label) => {
                      setStartPointLocal(pt);
                      setStartLabel(label);
                    }}
                    className={`z-50 transition-transform duration-300 ${isSwapping ? 'translate-y-12' : ''}`}
                    initialValue={startLabel}
                  />

                  {/* Waypoints List */}
                  {waypoints.map((wp, index) => (
                    <div key={wp.id} className="relative flex items-center gap-2 animate-in slide-in-from-left-2 fade-in duration-300 group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-slate-500 flex flex-col items-center">
                        <div className="w-0.5 h-full bg-slate-700 absolute -top-4 -bottom-4 -z-10" />
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-500 ring-4 ring-slate-800" />
                      </div>
                      <div className="flex-1 relative pl-6">
                        <AutocompleteInput
                          label={`Étape ${index + 1}`}
                          placeholder="Ajouter une étape..."
                          onSelect={(pt, label) => updateWaypoint(wp.id, pt, label)}
                          initialValue={wp.label}
                        />
                      </div>
                      <button
                        onClick={() => removeWaypoint(wp.id)}
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                        title="Supprimer l'étape"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}

                  {/* Add Waypoint Button */}
                  <div className="flex justify-center -my-1 relative z-40">
                    <button
                      onClick={addWaypoint}
                      className="p-1.5 bg-slate-700/50 hover:bg-blue-600/20 text-slate-400 hover:text-blue-400 rounded-full border border-dashed border-slate-600 hover:border-blue-500/50 transition-all active:scale-95 shadow-sm"
                      title="Ajouter une étape"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <AutocompleteInput
                    label="Point d'arrivée"
                    placeholder="Ex: Lyon, Marseille..."
                    onSelect={(pt, label) => {
                      setEndPointLocal(pt);
                      setEndLabel(label);
                    }}
                    className={`z-20 transition-transform duration-300 ${isSwapping ? '-translate-y-12' : ''}`}
                    initialValue={endLabel}
                  />

                  {/* Swap Button */}
                  <button
                    onClick={handleSwap}
                    className="absolute -right-12 top-1/2 -translate-y-1/2 z-40 p-2 bg-slate-700/80 backdrop-blur rounded-full border border-white/10 hover:bg-slate-600 transition-colors shadow-lg group"
                    title="Inverser départ et arrivée"
                  >
                    <ArrowUpDown size={16} className={`text-blue-400 group-hover:text-blue-300 transition-transform duration-300 ${isSwapping ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {/* Date Picker (Optional) */}
                {/* Date & Time Pickers */}
                <div className="bg-slate-700/30 p-3 rounded-xl border border-white/5 flex flex-col gap-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar size={14} className="text-slate-400" />
                    <label className="text-[10px] text-slate-500 font-bold uppercase">Date & Heure de départ (Optionnel)</label>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      className="flex-1 bg-slate-700/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 [color-scheme:dark]"
                      onChange={(e) => {
                        const dateStr = e.target.value;
                        if (!dateStr) {
                          setSelectedDate(null);
                          return;
                        }
                        const current = selectedDate || new Date();
                        const timeStr = current.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }); // Keep current time
                        const [hours, minutes] = timeStr.split(':').map(Number);
                        const newDate = new Date(dateStr);
                        newDate.setHours(hours || 0, minutes || 0);
                        setSelectedDate(newDate);
                      }}
                      value={selectedDate ? selectedDate.toLocaleDateString('en-CA') : ''}
                    />
                    <input
                      type="time"
                      className="w-24 bg-slate-700/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 [color-scheme:dark]"
                      onChange={(e) => {
                        const timeStr = e.target.value;
                        if (!timeStr) return; // Don't clear if time invalid

                        const current = selectedDate || new Date();
                        const [hours, minutes] = timeStr.split(':').map(Number);
                        const newDate = new Date(current);
                        newDate.setHours(hours, minutes);
                        setSelectedDate(newDate);
                      }}
                      value={selectedDate ? selectedDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}
                    />
                  </div>
                </div>
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
                  <p className="text-xl font-bold">{formatDuration(route.summary.duration)}</p>
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
