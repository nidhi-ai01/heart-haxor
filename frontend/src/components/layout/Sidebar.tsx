'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, LogOut, User, Heart } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '@/context/AuthContext';

const Sidebar = () => {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const links = [
        { href: '/', label: 'Characters', icon: Home },
    ];

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 -translate-x-full transition-transform sm:translate-x-0 border-r border-purple-200/30 dark:border-purple-900/40 bg-gradient-to-b from-purple-50 to-blue-50 dark:from-slate-900 dark:to-slate-950">
            <div className="flex h-full flex-col px-4 py-6">
                <Link href="/" className="flex items-center gap-3 px-2 mb-8">
                    <div className="relative w-10 h-10 flex items-center justify-center">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-300 dark:from-violet-500 to-violet-400 dark:to-purple-600 rounded-full opacity-30 blur-lg" />
                        <Heart className="w-6 h-6 text-violet-600 dark:text-violet-400 fill-violet-600 dark:fill-violet-400 relative z-10" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-violet-600 dark:from-violet-400 to-purple-600 dark:to-violet-300 bg-clip-text text-transparent tracking-tight">Heart Haxor</span>
                </Link>

                <div className="space-y-2 mb-8">
                    <p className="px-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3">Navigation</p>
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.label}
                                href={link.href}
                                className={clsx(
                                    "flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group font-medium",
                                    isActive
                                        ? "bg-gradient-to-r from-violet-400 to-purple-500 text-white shadow-lg shadow-purple-200 dark:shadow-purple-900/50"
                                        : "text-gray-700 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-white/50 dark:hover:bg-purple-900/30"
                                )}
                            >
                                <Icon className={clsx("w-5 h-5 transition-colors", isActive ? "text-white" : "text-gray-500 dark:text-gray-500 group-hover:text-violet-600 dark:group-hover:text-violet-400")} />
                                <span className="ms-3 text-sm">{link.label}</span>
                            </Link>
                        );
                    })}
                </div>

                <div className="mt-auto space-y-4">
                    {user && (
                        <div className="rounded-2xl bg-gradient-to-br from-white/60 to-purple-100/60 dark:from-slate-800/60 dark:to-purple-900/30 p-4 border border-purple-200/50 dark:border-purple-800/50 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 dark:from-violet-500 dark:to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
                                    <User className="text-white w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">{user.name || 'User'}</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{user.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full py-2 text-xs font-bold text-white bg-gradient-to-r from-red-400 to-pink-500 hover:from-red-500 hover:to-pink-600 dark:from-red-500 dark:to-pink-600 dark:hover:from-red-600 dark:hover:to-pink-700 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </div>
                    )}
                    <div className="rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-purple-900/40 dark:to-slate-800/40 p-4 border border-purple-200/60 dark:border-purple-800/50 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 dark:from-violet-500 dark:to-purple-600 flex items-center justify-center">
                                <span className="text-white text-xs font-bold">✨</span>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-violet-900 dark:text-violet-300">Go Premium</p>
                                <p className="text-[10px] text-gray-700 dark:text-gray-400">Unlock more features</p>
                            </div>
                        </div>
                        <button className="w-full py-2 text-xs font-bold text-white bg-gradient-to-r from-violet-400 to-purple-500 dark:from-violet-500 dark:to-purple-600 rounded-xl hover:from-violet-500 hover:to-purple-600 dark:hover:from-violet-600 dark:hover:to-purple-700 transition-all shadow-md hover:shadow-lg">
                            Upgrade
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
