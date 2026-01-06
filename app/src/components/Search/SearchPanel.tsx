import { AutocompleteInput } from '../Search/AutocompleteInput';
import { GlassButton, Card } from '../UI/Glassmorphism';
import { Plus, ArrowUpDown, Calendar, X } from 'lucide-react';
import type { GeoPoint } from '../../services/api';
import { useTripStore } from '../../store/useTripStore';

interface SearchPanelProps {
    startLabel: string;
    endLabel: string;
    onStartSelect: (pt: GeoPoint | null, label: string) => void;
    onEndSelect: (pt: GeoPoint | null, label: string) => void;
    onSwap: () => void;
    onSearch: () => void;
    isSwapping: boolean;
    isLoading: boolean;
}

export function SearchPanel({ 
    startLabel, endLabel, onStartSelect, onEndSelect, onSwap, onSearch, isSwapping, isLoading 
}: SearchPanelProps) {
    const { waypoints, addWaypoint, removeWaypoint, updateWaypoint, selectedDate, setSelectedDate } = useTripStore();

    return (
        <Card className="p-4 space-y-4 w-full md:w-[400px] animate-in slide-in-from-left-4 duration-500">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">
                    Planifier le trajet
                </h2>
            </div>

            <div className="space-y-2 relative">
                <div className="flex flex-col gap-2 relative">
                    {/* Timeline Line - Simple Dashed */}
                    <div className="absolute left-[1.65rem] top-8 bottom-8 w-px border-l-2 border-dashed border-slate-700/50 pointer-events-none" />

                    <div className={`transition-transform duration-300 ${isSwapping ? 'translate-y-[calc(100%+0.5rem)]' : ''}`}>
                        <div className="relative flex items-center gap-3">
                             <div className="w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] z-10 shrink-0 border-2 border-slate-900" />
                             <AutocompleteInput
                                label=""
                                placeholder="Départ (ex: Paris)"
                                onSelect={onStartSelect}
                                initialValue={startLabel}
                                className="flex-1"
                            />
                        </div>
                    </div>

                    {waypoints.map((wp, index) => (
                        <div key={wp.id} className="relative flex items-center gap-3 animate-in fade-in slide-in-from-left-2 pl-0.5 group">
                             <div className="w-3 h-3 ml-[0.35rem] rounded-full bg-slate-600 z-10 shrink-0 border-2 border-slate-900" />
                             <div className="flex-1 flex gap-2">
                                <AutocompleteInput
                                    label=""
                                    placeholder={`Étape ${index + 1}`}
                                    onSelect={(pt, label) => updateWaypoint(wp.id, pt, label)}
                                    initialValue={wp.label}
                                    className="flex-1"
                                />
                                <button onClick={() => removeWaypoint(wp.id)} className="p-3 hover:bg-white/10 rounded-xl text-slate-500 hover:text-red-400 transition-colors self-end mb-0.5">
                                    <X size={18} />
                                </button>
                             </div>
                        </div>
                    ))}

                    <div className="pl-8 pt-1 pb-1 relative z-20">
                        <button 
                            onClick={addWaypoint}
                            className="text-xs font-bold text-slate-400 hover:text-blue-400 flex items-center gap-2 transition-all hover:translate-x-1 py-2"
                        >
                            <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-600 group-hover:border-blue-500 flex items-center justify-center">
                                <Plus size={12} />
                            </div>
                            Ajouter une étape
                        </button>
                    </div>

                    <div className={`transition-transform duration-300 ${isSwapping ? '-translate-y-[calc(100%+2rem)]' : ''}`}>
                        <div className="relative flex items-center gap-3">
                             <div className="w-4 h-4 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] z-10 shrink-0 border-2 border-slate-900" />
                             <AutocompleteInput
                                label=""
                                placeholder="Destination (ex: Marseille)"
                                onSelect={onEndSelect}
                                initialValue={endLabel}
                                className="flex-1"
                            />
                        </div>
                    </div>

                    {/* Swap Button - Fixed Position relative to top inputs */}
                    <button 
                        onClick={onSwap}
                        className="absolute right-4 top-[3.25rem] z-30 p-2 bg-slate-800 border border-slate-600 rounded-full text-slate-400 hover:text-white hover:border-white/50 transition-all hover:scale-110 shadow-lg"
                        style={{ marginTop: '-12px' }}
                    >
                        <ArrowUpDown size={14} />
                    </button>
                </div>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-xl border border-white/10 flex gap-3 items-center">
                <Calendar size={16} className="text-slate-300" />
                <input 
                    type="datetime-local" 
                    className="bg-transparent text-sm text-white font-medium focus:outline-none w-full [color-scheme:dark]"
                    onChange={(e) => setSelectedDate(e.target.value ? new Date(e.target.value) : null)}
                    value={selectedDate ? new Date(selectedDate.getTime() - (selectedDate.getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : ''}
                />
            </div>

            <GlassButton 
                onClick={onSearch} 
                disabled={isLoading || !startLabel || !endLabel}
                className="w-full py-4 text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500"
            >
                {isLoading ? 'Calcul...' : 'Voir les conditions'}
            </GlassButton>
        </Card>
    );
}
