import { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import type { AutocompleteSuggestion, GeoPoint } from '../../services/api';
import { Search, MapPin, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface AutocompleteInputProps {
    label: string;
    placeholder: string;
    onSelect: (point: GeoPoint) => void;
    className?: string;
}

export function AutocompleteInput({ label, placeholder, onSelect, className }: AutocompleteInputProps) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length >= 2) {
                setIsLoading(true);
                const results = await api.autocomplete(query);
                setSuggestions(results);
                setIsOpen(true);
                setIsLoading(false);
            } else {
                setSuggestions([]);
                setIsOpen(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    // Handle click outside to close dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (suggestion: AutocompleteSuggestion) => {
        setQuery(suggestion.label);
        setIsOpen(false);
        onSelect(suggestion.coordinates);
    };

    const clear = () => {
        setQuery('');
        setSuggestions([]);
        setIsOpen(false);
    };

    return (
        <div className={cn("relative w-full space-y-1", className)} ref={containerRef}>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
                {label}
            </label>
            <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition-colors">
                    <Search size={18} />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length >= 2 && setIsOpen(true)}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-10 py-3 bg-slate-700/50 rounded-xl border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
                />
                {query && (
                    <button
                        onClick={clear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {isOpen && (suggestions.length > 0 || isLoading) && (
                <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-white/10 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
                    {isLoading ? (
                        <div className="p-4 text-center text-slate-400 flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-slate-600 border-t-white rounded-full animate-spin" />
                            Recherche...
                        </div>
                    ) : (
                        <div className="max-h-64 overflow-y-auto">
                            {suggestions.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSelect(s)}
                                    className="w-full px-4 py-3 text-left hover:bg-slate-700/50 flex items-start gap-3 transition-colors border-b border-white/5 last:border-0"
                                >
                                    <div className="mt-0.5 text-blue-400">
                                        <MapPin size={16} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-white truncate">{s.label}</span>
                                        <span className="text-[10px] text-slate-400 uppercase tracking-tight">
                                            {s.postcode ? `${s.postcode} • ` : ''}{s.city || 'Lieu'}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
