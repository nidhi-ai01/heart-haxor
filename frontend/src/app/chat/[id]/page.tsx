"use client";

import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import socket from "@/lib/socket";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Send, Mic, ArrowLeft, LogOut } from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import LogoutConfirmModal from "@/components/LogoutConfirmModal";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    createdAt: string;
}

interface Character {
    id: string;
    name: string;
    role: string;
    imageUrl: string;
    description: string;
}

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
    // Unwrap params using React.use()
    const { id: characterId } = use(params);

    const getPersonalityGreeting = () => {
  const userName = localStorage.getItem("name") || "buddy";

  if (characterId === "mentor") {
    return `Welcome back, ${userName}. What are we improving today?`;
  }
  if (characterId === "partner") {
    return `Hey ${userName} ❤️ I’ve been waiting for you. How are you feeling?`;
  }

  return `Hey ${userName}! What’s happening today?`;
};


    const router = useRouter();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { logout, user } = useAuth();
    const { showSuccess } = useToast();

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [character, setCharacter] = useState<Character | null>(null);
    const [customName, setCustomName] = useState<string>("");
    const [characterError, setCharacterError] = useState(false);
    const userId = user?.id || "user-1"; // Use authenticated user ID
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [isTyping, setIsTyping] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    };

    const handleConfirmLogout = () => {
        setShowLogoutModal(false);
        logout();
        router.push('/');
    };

    const handleCancelLogout = () => {
        setShowLogoutModal(false);
    };

    // Fetch character details with customization support
    useEffect(() => {
        const fetchCharacter = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                
                // Try to fetch customized character data if authenticated
                if (token) {
                    try {
                        const res = await fetch(`http://localhost:3001/api/chatbot-settings/${characterId}`, {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        });
                        
                        if (res.ok) {
                            const data = await res.json();
                            setCharacter(data);
                            // Store the custom name to use in chat
                            setCustomName(data.name);
                            setCharacterError(false);
                            return;
                        }
                    } catch (err) {
                        console.warn("Could not fetch customized character data, falling back to default");
                    }
                }
                
                // Fallback: Fetch default character data
                const res = await fetch(`http://localhost:3001/api/characters/${characterId}`);
                if (res.ok) {
                    const data = await res.json();
                    setCharacter(data);
                    setCustomName(data.name); // Store the default name
                    setCharacterError(false);
                } else {
                    setCharacter(null);
                    setCharacterError(true);
                    console.error("Character not found:", characterId);
                }
            } catch (err) {
                setCharacter(null);
                setCharacterError(true);
                console.error("Error fetching character:", err);
            }
        };
        
        if (characterId) {
            fetchCharacter();
        }
    }, [characterId]);

    // Load chat history from API (for persistence across sessions)
    useEffect(() => {
        const loadChatHistory = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token || !characterId || !userId) {
                    console.warn("Missing token, characterId, or userId");
                    return;
                }

                // Fetch or create chat with character
                const res = await fetch(`http://localhost:3001/api/chats/${characterId}/with-character`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.data.messages) {
                        // Load historical messages from database
                        setMessages(data.data.messages);
                        console.log(`Loaded ${data.data.messages.length} historical messages`);
                    }
                } else {
                    console.warn("Failed to load chat history from API");
                }
            } catch (err) {
                console.warn("Error loading chat history:", err);
                // Don't throw error, socket connection will handle it
            }
        };

        if (userId && characterId) {
            loadChatHistory();
        }
    }, [userId, characterId]);

    // Socket connection and event listeners
    useEffect(() => {
        function onConnect() {
            setIsConnected(true);
            console.log("Connected to socket");
            // Join chat room
            socket.emit("join_chat", { userId, characterId });
        }

        function onDisconnect() {
            setIsConnected(false);
            console.log("Disconnected from socket");
        }

        function onChatHistory(history: Message[]) {
            setMessages(history);
            scrollToBottom();
        }

        function onReceiveMessage(message: Message) {
            setMessages((prev) => [...prev, message]);
            setIsTyping(false);
            scrollToBottom();
        }

        function onTyping() {
            setIsTyping(true);
        }

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("chat_history", onChatHistory);
        socket.on("receive_message", onReceiveMessage);
        socket.on("typing", onTyping);

        // Initial join if already connected
        if (socket.connected) {
            onConnect();
        }

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("chat_history", onChatHistory);
            socket.off("receive_message", onReceiveMessage);
            socket.off("typing", onTyping);
        };
    }, [characterId, userId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const sendMessage = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim()) return;

        const optimisticMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input,
            createdAt: new Date().toISOString()
        };

        // Optimistic update
        setMessages((prev) => [...prev, optimisticMessage]);

        socket.emit("send_message", {
            userId,
            characterId,
            content: input,
            customName: customName, // Pass custom character name to backend
        });

        setInput("");
        scrollToBottom();
    };

    if (characterError) {
        return (
            <div className="flex h-screen items-center justify-center bg-gradient-to-br from-amber-50 via-blue-50 to-purple-100 dark:from-slate-900 dark:via-purple-950 dark:to-slate-950 p-4">
                <div className="text-center max-w-md">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                        💔 Character Not Found
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        This character doesn't exist or may have been removed. Please go back and choose another companion.
                    </p>
                    <button
                        onClick={() => router.back()}
                        className="bg-gradient-to-r from-violet-400 dark:from-violet-500 to-purple-500 dark:to-purple-600 hover:from-violet-500 dark:hover:from-violet-600 hover:to-purple-600 dark:hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
                    >
                        Back to Characters
                    </button>
                </div>
            </div>
        );
    }

    if (!character) {
        return (
            <div className="flex h-screen items-center justify-center bg-gradient-to-br from-amber-50 via-blue-50 to-purple-100 dark:from-slate-900 dark:via-purple-950 dark:to-slate-950">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500 dark:border-violet-400"></div>
                    <p className="text-violet-600 dark:text-violet-400 font-medium">Loading your companion...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-2rem)] bg-gradient-to-br from-amber-50 via-blue-50 to-purple-100 dark:from-slate-900 dark:via-purple-950 dark:to-slate-950 text-gray-800 dark:text-gray-100 rounded-2xl overflow-hidden shadow-lg relative transition-colors duration-300">
            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes softGlow {
                    0%, 100% { box-shadow: 0 0 15px rgba(109, 40, 217, 0.3); }
                    50% { box-shadow: 0 0 25px rgba(109, 40, 217, 0.5); }
                }
                @keyframes softGlowDark {
                    0%, 100% { box-shadow: 0 0 15px rgba(109, 40, 217, 0.5); }
                    50% { box-shadow: 0 0 25px rgba(109, 40, 217, 0.7); }
                }
                @keyframes gentleBounce {
                    0%, 100% { opacity: 0.6; }
                    50% { opacity: 1; }
                }
                .message-bubble {
                    animation: fadeInUp 0.4s ease-out forwards;
                }
                .character-glow {
                    animation: softGlow 3s ease-in-out infinite;
                }
                :root.dark .character-glow {
                    animation: softGlowDark 3s ease-in-out infinite;
                }
                @media (prefers-reduced-motion: reduce) {
                    .message-bubble, .character-glow { animation: none; }
                }
            `}</style>

            {/* Chat Header - Character Presence Card */}
            <div className="flex items-center justify-between p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border-b border-white/40 dark:border-slate-700/40 z-10 sticky top-0 rounded-t-2xl shadow-sm transition-colors duration-300">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-purple-100/60 dark:hover:bg-purple-900/40 rounded-full transition-colors duration-300 text-gray-700 dark:text-gray-300"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="relative">
                        <div className="character-glow">
                            <img
                                src={character.imageUrl.startsWith("http") || character.imageUrl.startsWith("/") ? character.imageUrl : `/characters/${character.imageUrl}`}
                                alt={character.name}
                                className="w-12 h-12 rounded-full object-cover border-2 border-violet-300 dark:border-violet-500"
                                onError={(e) => { e.currentTarget.src = "https://placehold.co/100x100/f3e8ff/6d28d9?text=" + character.name[0]; }}
                            />
                        </div>
                        <span className={clsx(
                            "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white/80 dark:border-slate-800 transition-colors duration-300",
                            isConnected ? "bg-emerald-400" : "bg-amber-400"
                        )}></span>
                    </div>
                    <div>
                        <h2 className="font-bold text-lg leading-tight text-gray-800 dark:text-gray-100">{character.name}</h2>
                        <p className={clsx(
                            "text-xs font-medium flex items-center gap-1 transition-colors duration-300",
                            isTyping ? "text-violet-600 dark:text-violet-400" : "text-gray-600 dark:text-gray-400"
                        )}>
                            <span className={isConnected ? "inline-block w-2 h-2 rounded-full bg-emerald-400" : ""}></span>
                            {isTyping ? "✨ Composing..." : "Listening..."}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleLogoutClick}
                    className="p-2 hover:bg-red-100/60 dark:hover:bg-red-900/40 rounded-full transition-colors duration-300 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                    title="Logout"
                >
                    <LogOut className="w-5 h-5" />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 pt-6 pb-28 space-y-4 scrollbar-thin scrollbar-thumb-purple-300/40 dark:scrollbar-thumb-purple-700/40 scrollbar-track-transparent">
                {messages.length === 0 && (
                    <div className="flex h-full items-center justify-center text-center">
                        <div className="max-w-sm">
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Start a conversation 💜</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Say hello to {character.name} and let the magic begin...</p>
                        </div>
                    </div>
                )}
                {messages.map((msg, idx) => {
                    const isUser = msg.role === "user";
                    return (
                        <div
                            key={msg.id}
                            className={clsx(
                                "flex w-full message-bubble",
                                isUser ? "justify-end" : "justify-start"
                            )}
                            style={{
                                animationDelay: `${idx * 50}ms`
                            }}
                        >
                            <div
                                className={clsx(
                                    "max-w-[75%] px-5 py-3 rounded-2xl text-sm md:text-base leading-relaxed break-words",
                                    isUser
                                        ? "bg-gradient-to-br from-violet-400 dark:from-violet-600 to-purple-500 dark:to-purple-700 text-white rounded-tr-none shadow-md shadow-purple-200/50 dark:shadow-purple-900/50"
                                        : "bg-white/70 dark:bg-slate-800/60 backdrop-blur-sm text-gray-800 dark:text-gray-100 rounded-tl-none border border-white/60 dark:border-slate-700/50 shadow-sm shadow-purple-100/30 dark:shadow-purple-900/20"
                                )}
                            >
                                {msg.content}
                            </div>
                        </div>
                    );
                })}
                {isTyping && (
                    <div className="flex w-full justify-start message-bubble">
                        <div className="bg-white/70 dark:bg-slate-800/60 backdrop-blur-sm px-5 py-3 rounded-2xl rounded-tl-none border border-white/60 dark:border-slate-700/50 shadow-sm">
                            <div className="flex gap-1.5">
                                <span className="w-2 h-2 bg-violet-400 dark:bg-violet-500 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></span>
                                <span className="w-2 h-2 bg-violet-400 dark:bg-violet-500 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></span>
                                <span className="w-2 h-2 bg-violet-400 dark:bg-violet-500 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="absolute bottom-0 w-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-t border-white/40 dark:border-slate-700/40 p-4 rounded-b-2xl transition-colors duration-300">
                <form onSubmit={sendMessage} className="flex gap-3 items-center max-w-4xl mx-auto">
                    <Button
                        type="button"
                        variant="ghost"
                        size="md"
                        className="flex-shrink-0 text-violet-500 dark:text-violet-400"
                        title="Voice input (coming soon)"
                    >
                        <Mic className="w-5 h-5" />
                    </Button>
                    <Input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={`Share your thoughts with ${character.name}...`}
                        className="flex-1"
                    />
                    <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        disabled={!input.trim() || !isConnected}
                        className="flex-shrink-0"
                    >
                        <Send className="w-5 h-5" />
                    </Button>
                </form>
            </div>

            {/* Logout Confirmation Modal */}
            <LogoutConfirmModal
                isOpen={showLogoutModal}
                onConfirm={handleConfirmLogout}
                onCancel={handleCancelLogout}
            />
        </div>
    );
}
