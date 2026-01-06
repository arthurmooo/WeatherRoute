import { useState } from 'react';
import { MapView } from './components/Map/MapView';
import { api } from './services/api';
import type { GeoPoint } from './services/api';
import { useTripStore } from './store/useTripStore';
import { SearchPanel } from './components/Search/SearchPanel';
import { OptimizerPanel } from './components/Optimizer/OptimizerPanel';
import { RouteList } from './components/Results/RouteList';
import { CloudRain, Wind, Sun } from 'lucide-react';

interface DepartureOption {
  time: string;
  score: number;
  label: string;
}

function App() {
  const {
    setRoutes, setLoading, setPoints, isLoading, error, setError, routes, 
    swapPoints, selectedDate, waypoints
  } = useTripStore();

  const [startPoint, setStartPointLocal] = useState<GeoPoint | null>(null);
  const [startLabel, setStartLabel] = useState<string>('');

  const [endPoint, setEndPointLocal] = useState<GeoPoint | null>(null);
  const [endLabel, setEndLabel] = useState<string>('');

  const [isSwapping, setIsSwapping] = useState(false);

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

      let fetchedRoutes;
      if (selectedDate) {
        fetchedRoutes = await api.getRouteWithDepartureTime(startPoint, endPoint, selectedDate, validWaypoints);
      } else {
        fetchedRoutes = await api.getRoute(startPoint, endPoint, validWaypoints);
      }

      setRoutes(fetchedRoutes);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Erreur lors du calcul de l'itinéraire");
    } finally {
      setLoading(false);
    }
  };

  const handleOptimize = async (startHour: number, endHour: number) => {
    if (!startPoint || !endPoint) {
      setError("Veuillez sélectionner un départ et une arrivée");
      return;
    }

    setIsOptimizing(true);
    setError(null);
    setDepartureOptions([]);

    try {
      const validWaypoints = getValidWaypoints();
      const options = await api.getOptimalDeparture(startPoint, endPoint, startHour, endHour, validWaypoints);
      setDepartureOptions(options);

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
      const fetchedRoutes = await api.getRouteWithDepartureTime(
        startPoint,
        endPoint,
        new Date(option.time),
        validWaypoints
      );
      setRoutes(fetchedRoutes);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Erreur lors du calcul de l'itinéraire");
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    setIsSwapping(true);

    const tempPoint = startPoint;
    setStartPointLocal(endPoint);
    setEndPointLocal(tempPoint);

    const tempLabel = startLabel;
    setStartLabel(endLabel);
    setEndLabel(tempLabel);

    swapPoints();

    setTimeout(() => setIsSwapping(false), 300);
  };

  const handleNavigate = () => {
    if (!startPoint || !endPoint) return;

    const origin = `${startPoint.lat},${startPoint.lng}`;
    const destination = `${endPoint.lat},${endPoint.lng}`;

    const waypointsStr = getValidWaypoints()
      .map(wp => `${wp.lat},${wp.lng}`)
      .join('|');

    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
    if (waypointsStr) {
      url += `&waypoints=${waypointsStr}`;
    }

    window.open(url, '_blank');
  };

  return (
    <div className="flex h-screen w-screen bg-slate-900 text-white overflow-hidden font-sans relative">
      
      <div className="absolute inset-0 z-0">
        <MapView />
      </div>

      <div className="absolute top-0 left-0 z-10 w-full md:w-[450px] h-full pointer-events-none flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 scrollbar-hide pointer-events-auto">
          <div className="space-y-4">
            
            <div className="pl-2 mb-6">
              <h1 className="text-3xl font-black bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent leading-tight drop-shadow-sm">
                Météo Trajet
              </h1>
              <p className="text-[10px] text-blue-200 uppercase font-bold tracking-widest opacity-80">
                Planifiez. Partez. Roulez.
              </p>
            </div>

            <SearchPanel 
              startLabel={startLabel}
              endLabel={endLabel}
              onStartSelect={(pt, label) => { setStartPointLocal(pt); setStartLabel(label); }}
              onEndSelect={(pt, label) => { setEndPointLocal(pt); setEndLabel(label); }}
              onSwap={handleSwap}
              onSearch={handleSearch}
              isSwapping={isSwapping}
              isLoading={isLoading}
            />

            {error && (
              <div className="p-4 bg-red-500/20 backdrop-blur border border-red-500/30 rounded-2xl text-red-200 text-sm animate-in fade-in slide-in-from-top-2 flex items-start gap-3 shadow-lg">
                <div className="mt-0.5 min-w-[16px]">⚠️</div>
                {error}
              </div>
            )}

            <OptimizerPanel 
              onOptimize={handleOptimize}
              isOptimizing={isOptimizing}
              hasPoints={!!startPoint && !!endPoint}
            />

             {departureOptions.length > 0 && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  {departureOptions.map((option, idx) => (
                    <button
                      key={option.time}
                      onClick={() => handleSelectDeparture(option)}
                      className={`w-full p-3 rounded-xl border transition-all flex items-center justify-between backdrop-blur-md ${
                        selectedDeparture === option.time
                          ? 'bg-blue-600/40 border-blue-500/50 shadow-lg'
                          : 'bg-slate-800/60 border-white/5 hover:bg-slate-700/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {idx === 0 && <span className="text-amber-400 text-lg">★</span>}
                        <span className="font-bold text-white">{option.label}</span>
                      </div>
                      <div className={`px-2 py-1 rounded-lg text-xs font-bold ${
                        option.score >= 80 ? 'text-green-300 bg-green-500/20' :
                        option.score >= 60 ? 'text-amber-300 bg-amber-500/20' :
                        'text-red-300 bg-red-500/20'
                      }`}>
                        {option.score}%
                      </div>
                    </button>
                  ))}
                </div>
             )}

            <RouteList 
              onNavigate={handleNavigate}
              showNavigation={!!(routes.length > 0 && startPoint && endPoint)}
            />

          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden md:block pointer-events-none">
        <div className="px-6 py-3 bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-full flex items-center gap-8 shadow-2xl pointer-events-auto">
          <div className="flex items-center gap-2 text-amber-400">
            <Sun size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">Soleil</span>
          </div>
          <div className="flex items-center gap-2 text-blue-300">
            <CloudRain size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">Pluie</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Wind size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">Vent</span>
          </div>
        </div>
      </div>

    </div>
  );
}

export default App;