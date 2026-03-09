'use client';

import { useTheme } from '@/context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export const ThemeToggle: React.FC<{ 
    className?: string; 
    variant?: 'header' | 'card' 
}> = ({ className = '', variant = 'header' }) => {
    const { isDark, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`
                transition-all duration-300 ease-out
                transform hover:scale-110
                focus:outline-none focus:ring-2 focus:ring-offset-2
                dark:focus:ring-offset-slate-900
                ${className}
                ${variant === 'header' 
                    ? 'p-2.5 rounded-full hover:bg-purple-100/60 dark:hover:bg-purple-900/40 text-gray-700 dark:text-violet-300 focus:ring-violet-400/50 dark:focus:ring-violet-600/50' 
                    : 'p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 focus:ring-gray-400 dark:focus:ring-gray-500'
                }
            `}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Light Mode' : 'Dark Mode'}
        >
            {isDark ? (
                <Sun className="w-5 h-5 transition-transform duration-300 -rotate-180" />
            ) : (
                <Moon className="w-5 h-5 transition-transform duration-300 rotate-0" />
            )}
        </button>
    );
};
