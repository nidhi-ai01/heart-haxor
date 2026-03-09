/**
 * Design Tokens - Centralized design system values
 */

export const tokens = {
  colors: {
    primary: {
      base: 'from-violet-400 to-purple-500',
      hover: 'from-violet-500 to-purple-600',
      dark: 'dark:from-violet-600 dark:to-purple-700',
    },
    secondary: {
      base: 'from-indigo-500 to-purple-600',
      hover: 'from-indigo-600 to-purple-700',
      dark: 'dark:from-indigo-600 dark:to-purple-700',
    },
    danger: {
      base: 'from-red-500 to-pink-600',
      hover: 'from-red-600 to-pink-700',
      dark: 'dark:from-red-600 dark:to-pink-700',
    },
    success: {
      base: 'from-emerald-500 to-teal-600',
      hover: 'from-emerald-600 to-teal-700',
      dark: 'dark:from-emerald-600 dark:to-teal-700',
    },
    warning: {
      base: 'from-amber-500 to-orange-600',
      hover: 'from-amber-600 to-orange-700',
      dark: 'dark:from-amber-600 dark:to-orange-700',
    },
  },
  shadows: {
    sm: 'shadow-sm shadow-purple-100/30 dark:shadow-purple-900/20',
    md: 'shadow-md shadow-purple-200/40 dark:shadow-purple-900/30',
    lg: 'shadow-lg shadow-purple-300/50 dark:shadow-purple-900/40',
    xl: 'shadow-xl shadow-purple-300/50 dark:shadow-purple-900/50',
    hover: 'shadow-2xl shadow-purple-400/60 dark:shadow-purple-800/60',
  },
  transitions: {
    fast: 'transition-all duration-200',
    normal: 'transition-all duration-300',
    smooth: 'transition-all duration-500',
  },
  radius: {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    full: 'rounded-full',
  },
};
