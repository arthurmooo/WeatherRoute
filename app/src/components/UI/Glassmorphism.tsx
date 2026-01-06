import { type ReactNode } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface CardProps {
    children: ReactNode;
    className?: string;
}

export function Card({ children, className }: CardProps) {
    return (
        <div className={cn(
            "bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl",
            className
        )}>
            {children}
        </div>
    );
}

export function GlassButton({ children, className, onClick, disabled, variant = 'primary' }: { 
    children: ReactNode, 
    className?: string, 
    onClick?: () => void,
    disabled?: boolean,
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
}) {
    const variants = {
        primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30",
        secondary: "bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 border border-white/5",
        danger: "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20",
        ghost: "hover:bg-white/5 text-slate-400 hover:text-white"
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "px-4 py-3 rounded-xl font-medium transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
                variants[variant],
                className
            )}
        >
            {children}
        </button>
    );
}
