import { useState } from 'react';
import { MapView } from './components/Map/MapView';
import { api } from './services/api';
import type { GeoPoint } from './services/api';
import { useTripStore } from './store/useTripStore';
import { AutocompleteInput } from './components/Search/AutocompleteInput';
import { CloudRain, Wind, Sun, Navigation } from 'lucide-react';

function App() {
  const { setRoute, setLoading, setPoints, isLoading, error, setError, route } = useTripStore();

  const [startPoint, setStartPointLocal] = useState<GeoPoint | null>(null);
  const [endPoint, setEndPointLocal] = useState<GeoPoint | null>(null);

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

  return (
    <div className="flex h-screen w-screen bg-slate-900 text-white overflow-hidden font-sans">
      {/* Sidebar / Overlay */}
      <div className="absolute top-0 left-0 z-10 p-6 w-96 max-h-screen overflow-y-auto pointer-events-none">
        <div className="bg-slate-800/80 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/10 pointer-events-auto space-y-6">
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

          <div className="space-y-4">
            <AutocompleteInput
              label="Point de départ"
              placeholder="Ex: Paris, Lille..."
              onSelect={setStartPointLocal}
            />

            <AutocompleteInput
              label="Point d'arrivée"
              placeholder="Ex: Lyon, Marseille..."
              onSelect={setEndPointLocal}
            />

            <button
              onClick={handleSearch}
              disabled={isLoading || !startPoint || !endPoint}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:bg-slate-700 disabled:text-slate-500 rounded-2xl font-bold transition-all shadow-[0_8px_30px_rgb(37,99,235,0.3)] active:scale-95 flex items-center justify-center gap-3"
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
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
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
