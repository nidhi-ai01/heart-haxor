/**
 * Design Tokens - Centralized design system values
 */

export const tokens = {
  colors: {
    primary: {
      base: 'from-violet-500 to-fuchsia-600',
      hover: 'from-violet-600 to-fuchsia-700',
      dark: 'dark:from-violet-600 dark:to-fuchsia-600',
    },
    secondary: {
      base: 'from-indigo-500 to-cyan-600',
      hover: 'from-indigo-600 to-cyan-700',
      dark: 'dark:from-indigo-500 dark:to-cyan-500',
    },
    danger: {
      base: 'from-rose-500 to-red-600',
      hover: 'from-rose-600 to-red-700',
      dark: 'dark:from-rose-600 dark:to-red-700',
    },
    success: {
      base: 'from-emerald-400 to-teal-500',
      hover: 'from-emerald-500 to-teal-600',
      dark: 'dark:from-emerald-500 dark:to-teal-600',
    },
    warning: {
      base: 'from-amber-400 to-orange-500',
      hover: 'from-amber-500 to-orange-600',
      dark: 'dark:from-amber-500 dark:to-orange-600',
    },
  },
  shadows: {
    sm: 'shadow-sm shadow-purple-200/20 dark:shadow-purple-900/10',
    md: 'shadow-md shadow-purple-300/30 dark:shadow-purple-900/20',
    lg: 'shadow-xl shadow-purple-400/20 dark:shadow-purple-900/30',
    xl: 'shadow-2xl shadow-purple-500/25 dark:shadow-purple-900/40',
    hover: 'shadow-2xl shadow-purple-500/40 dark:shadow-purple-700/50',
    glow: 'shadow-[0_0_15px_rgba(139,92,246,0.4)] dark:shadow-[0_0_15px_rgba(139,92,246,0.5)]',
    hoverGlow: 'hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] dark:hover:shadow-[0_0_25px_rgba(168,85,247,0.6)]',
  },
  transitions: {
    fast: 'transition-all duration-200 ease-in-out',
    normal: 'transition-all duration-300 ease-in-out',
    smooth: 'transition-all duration-500 ease-out',
  },
  radius: {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    full: 'rounded-full',
  },
};
