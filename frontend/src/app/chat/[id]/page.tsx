"use client";

import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import socket from "@/lib/socket";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Send, Mic, ArrowLeft, Wifi, WifiOff } from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

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
  const { id: characterId } = use(params);
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { showInfo } = useToast();

  const userId = user?.id || "user-1";

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [character, setCharacter] = useState<Character | null>(null);
  const [customName, setCustomName] = useState<string>("");
  const [characterError, setCharacterError] = useState(false);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const fetchCharacter = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        if (token) {
          try {
            const res = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/chatbot-settings/${characterId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );

            if (res.ok) {
              const data = await res.json();
              setCharacter(data);
              setCustomName(data.name);
              setCharacterError(false);
              return;
            }
          } catch {
            // Fallback below
          }
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/characters/${characterId}`);
        if (res.ok) {
          const data = await res.json();
          setCharacter(data);
          setCustomName(data.name);
          setCharacterError(false);
        } else {
          setCharacter(null);
          setCharacterError(true);
        }
      } catch {
        setCharacter(null);
        setCharacterError(true);
      }
    };

    if (characterId) {
      fetchCharacter();
    }
  }, [characterId]);

  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token || !characterId || !userId) return;

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chats/${characterId}/with-character`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data.messages) {
            setMessages(data.data.messages);
          }
          // Update character with customized data from the server
          if (data.success && data.data.character) {
            setCharacter(data.data.character);
            setCustomName(data.data.character.name);
          }
        }
      } catch {
        // Socket still covers live chat
      }
    };

    if (userId && characterId) {
      loadChatHistory();
    }
  }, [userId, characterId]);

  useEffect(() => {
    const onConnect = () => {
      setIsConnected(true);
      socket.emit("join_chat", { userId, characterId });
    };

    const onDisconnect = () => setIsConnected(false);
    const onChatHistory = (history: Message[]) => {
      setMessages(history);
      scrollToBottom();
    };
    const onReceiveMessage = (message: Message) => {
      setMessages((prev) => [...prev, message]);
      setIsTyping(false);
      scrollToBottom();
    };
    const onTyping = () => setIsTyping(true);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("chat_history", onChatHistory);
    socket.on("receive_message", onReceiveMessage);
    socket.on("typing", onTyping);

    if (socket.connected) onConnect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("chat_history", onChatHistory);
      socket.off("receive_message", onReceiveMessage);
      socket.off("typing", onTyping);
    };
  }, [characterId, userId]);

  const scrollToBottom = () => {
    // Use requestAnimationFrame to ensure DOM has updated
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
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
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    socket.emit("send_message", {
      userId,
      characterId,
      content: input,
      customName,
    });

    setInput("");
    scrollToBottom();
  };

  if (characterError) {
    return (
      <div className="flex h-[calc(100vh-2rem)] items-center justify-center p-4">
        <div className="app-panel-strong max-w-lg rounded-[2rem] p-8 text-center">
          <p className="app-eyebrow">Character unavailable</p>
          <h2 className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            We could not find this companion
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
            The character may have been removed or the link may be outdated.
          </p>
          <Button onClick={() => router.push("/characters", { scroll: false })} className="mt-6">
            Back to characters
          </Button>
        </div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="flex h-[calc(100vh-2rem)] items-center justify-center p-4">
        <div className="app-panel-strong flex w-full max-w-sm flex-col items-center gap-4 rounded-[2rem] px-8 py-10 text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-slate-300 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-400" />
          <p className="text-sm text-slate-600 dark:text-slate-400">Loading your conversation...</p>
        </div>
      </div>
    );
  }

  return (
    /* ─── OUTERMOST: lock to viewport, no page scroll ─── */
    <div className="mx-auto flex h-[calc(100vh-2rem)] w-full max-w-7xl flex-col overflow-hidden rounded-[2rem] border border-white/45 bg-white/72 shadow-[0_24px_70px_rgba(15,23,42,0.1)] backdrop-blur-2xl dark:border-white/10 dark:bg-[rgba(8,17,31,0.74)]">

      {/* ─── HEADER: fixed at top ─── */}
      <header className="shrink-0 border-b border-slate-200/70 px-4 py-4 dark:border-white/10 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/characters", { scroll: false })}
              className="rounded-2xl border border-slate-200 bg-white/70 p-3 text-slate-700 transition-colors hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div className="relative">
              <img
                src={
                  character.imageUrl.startsWith("http") || character.imageUrl.startsWith("/")
                    ? character.imageUrl
                    : `/characters/${character.imageUrl}`
                }
                alt={character.name}
                className="h-14 w-14 rounded-[1.25rem] object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://placehold.co/100x100/e2e8f0/0f172a?text=${character.name[0]}`;
                }}
              />
              <span
                className={clsx(
                  "absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white dark:border-slate-900",
                  isConnected ? "bg-emerald-500" : "bg-amber-500"
                )}
              />
            </div>

            <div>
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                {character.name}
              </h1>
              <p className="mt-1 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                {isConnected ? <Wifi className="h-4 w-4 text-emerald-500" /> : <WifiOff className="h-4 w-4 text-amber-500" />}
                {isTyping ? "Typing a reply..." : character.description}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ─── BODY: sidebar + chat, flex-1 with min-h-0 to allow inner scroll ─── */}
      <div className="flex min-h-0 flex-1">

        {/* ─── SIDEBAR: fixed within body, scrolls independently if tall ─── */}
        <aside className="hidden w-[28%] shrink-0 overflow-y-auto border-r border-slate-200/70 p-6 dark:border-white/10 lg:block">
          <div className="rounded-[1.75rem] bg-slate-950 p-6 text-white">
            <p className="app-eyebrow text-blue-200">Conversation profile</p>
            <h2 className="mt-3 text-2xl font-extrabold">{character.name}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">{character.description}</p>
            <div className="mt-6 rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-blue-200">Status</p>
              <p className="mt-2 text-sm text-slate-200">
                {isConnected ? "Connected and ready to reply." : "Reconnecting to the chat server."}
              </p>
            </div>
          </div>
        </aside>

        {/* ─── CHAT COLUMN: header-messages-input stacked vertically ─── */}
        <section className="flex min-h-0 min-w-0 flex-1 flex-col">

          {/* ─── MESSAGES: the ONLY scrollable area ─── */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto scroll-smooth px-4 py-5 sm:px-6"
          >
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <div className="max-w-md rounded-[1.75rem] border border-slate-200 bg-white/75 p-8 text-center dark:border-white/10 dark:bg-white/5">
                  <p className="app-eyebrow">New conversation</p>
                  <h3 className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                    Start with a simple hello
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
                    Your chat history, message styling, and navigation now all follow the same
                    polished theme.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => {
                  const isUser = msg.role === "user";
                  return (
                    <div key={msg.id} className={clsx("flex", isUser ? "justify-end" : "justify-start")}>
                      <div
                        className={clsx(
                          "max-w-[85%] rounded-[1.75rem] px-4 py-3 text-sm leading-7 sm:max-w-[70%]",
                          isUser
                            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                            : "border border-slate-200 bg-white/90 text-slate-800 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
                        )}
                      >
                        {msg.content}
                      </div>
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                      <div className="flex gap-2">
                        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.2s]" />
                        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.1s]" />
                        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-blue-500" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* ─── INPUT: pinned to bottom ─── */}
          <div className="shrink-0 border-t border-slate-200/70 p-4 dark:border-white/10 sm:p-5">
            <form onSubmit={sendMessage} className="flex items-center gap-3">
              <Button 
                type="button" 
                variant="ghost" 
                size="md" 
                title="Voice input coming soon"
                onClick={() => showInfo("🎤 Voice input feature is coming soon!")}
              >
                <Mic className="h-4 w-4" />
              </Button>
              <Input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Message ${character.name}...`}
                className="flex-1"
              />
              <Button type="submit" variant="secondary" size="md" disabled={!input.trim() || !isConnected}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
