"use client";

interface LogoutConfirmModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function LogoutConfirmModal({ isOpen, onConfirm, onCancel }: LogoutConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            {/* Modal Container */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fade-in border border-gray-200/20 dark:border-slate-700/50 transition-colors duration-300">
                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Confirm Logout
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Are you sure you want to logout? You'll need to log in again to access your chats.
                    </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-3 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors duration-200 active:scale-95"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-600 dark:from-red-600 dark:to-pink-700 text-white font-semibold rounded-lg hover:from-red-600 hover:to-pink-700 dark:hover:from-red-700 dark:hover:to-pink-800 transition-colors duration-200 active:scale-95 shadow-md"
                    >
                        Logout
                    </button>
                </div>

                {/* Added Animation Styles */}
                <style>{`
                    @keyframes fadeIn {
                        from {
                            opacity: 0;
                            transform: scale(0.95);
                        }
                        to {
                            opacity: 1;
                            transform: scale(1);
                        }
                    }
                    .animate-fade-in {
                        animation: fadeIn 0.3s ease-out;
                    }
                `}</style>
            </div>
        </div>
    );
}
