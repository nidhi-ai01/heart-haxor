'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
    isDark: boolean;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isDark, setIsDark] = useState<boolean>(() => {
        // Initialize from sessionStorage (session-only, not persistent across browser restarts)
        if (typeof window !== 'undefined') {
            const savedTheme = sessionStorage.getItem('heart-haxor-theme');
            if (savedTheme === 'dark') return true;
            if (savedTheme === 'light') return false;
            // Fallback to system preference
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    });

    // Apply theme to document root
    useEffect(() => {
        const root = document.documentElement;
        
        if (isDark) {
            root.classList.add('dark');
            document.body.style.colorScheme = 'dark';
        } else {
            root.classList.remove('dark');
            document.body.style.colorScheme = 'light';
        }
        
        // Persist preference to sessionStorage (clears on browser/tab close)
        sessionStorage.setItem('heart-haxor-theme', isDark ? 'dark' : 'light');
    }, [isDark]);

    const toggleTheme = () => {
        setIsDark(prev => !prev);
    };

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
