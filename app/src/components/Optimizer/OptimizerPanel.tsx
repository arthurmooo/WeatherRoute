import { Card, GlassButton } from '../UI/Glassmorphism';
import { Sparkles, Clock, Zap, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface OptimizerPanelProps {
    onOptimize: (start: number, end: number) => void;
    isOptimizing: boolean;
    hasPoints: boolean;
}

export function OptimizerPanel({ onOptimize, isOptimizing, hasPoints }: OptimizerPanelProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [windowStart, setWindowStart] = useState(8);
    const [windowEnd, setWindowEnd] = useState(14);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="group flex items-center gap-2 px-4 py-2 bg-slate-800/90 backdrop-blur-md border border-white/20 rounded-full text-slate-200 hover:text-amber-400 hover:border-amber-500/50 transition-all shadow-lg"
            >
                <Sparkles size={16} className="text-amber-500 group-hover:animate-pulse" />
                <span className="text-sm font-medium">Optimiser le départ</span>
            </button>
        );
    }

    return (
        <Card className="p-4 w-full md:w-[320px] animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-amber-500/20 rounded-lg">
                        <Sparkles size={16} className="text-amber-400" />
                    </div>
                    <h3 className="font-bold text-slate-200">Optimiseur</h3>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white">
                    <ChevronDown size={18} />
                </button>
            </div>

            <p className="text-xs text-slate-300 mb-4 font-medium">
                Trouvez le meilleur créneau pour partir en fonction de la météo.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Début</label>
                    <div className="relative">
                        <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                        <select
                            value={windowStart}
                            onChange={(e) => setWindowStart(Number(e.target.value))}
                            className="w-full pl-9 pr-2 py-2 bg-slate-800/80 rounded-lg border border-white/20 text-white text-sm focus:outline-none focus:border-amber-500/50 appearance-none font-medium"
                        >
                            {Array.from({ length: 24 }, (_, i) => (
                                <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Fin</label>
                    <div className="relative">
                        <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                        <select
                            value={windowEnd}
                            onChange={(e) => setWindowEnd(Number(e.target.value))}
                            className="w-full pl-9 pr-2 py-2 bg-slate-800/80 rounded-lg border border-white/20 text-white text-sm focus:outline-none focus:border-amber-500/50 appearance-none font-medium"
                        >
                            {Array.from({ length: 24 }, (_, i) => (
                                <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <GlassButton
                onClick={() => onOptimize(windowStart, windowEnd)}
                disabled={isOptimizing || !hasPoints}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-amber-900/20"
            >
                {isOptimizing ? 'Analyse...' : 'Trouver le créneau'} <Zap size={16} />
            </GlassButton>
        </Card>
    );
}
