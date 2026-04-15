"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Grid2x2, Rows3, MessageCircle, ArrowLeft, Settings, RefreshCw, Sparkles } from "lucide-react";
import clsx from "clsx";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import CharacterCustomizationModal from "@/components/CharacterCustomizationModal";

interface Character {
  id: string;
  name: string;
  role: string;
  description: string;
  backstory: string;
  imageUrl: string;
  intimacyLevel: string;
}

interface CharacterCustomization {
  characterId: string;
  customName?: string;
  customImageUrl?: string;
}

export default function CharactersPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { showSuccess } = useToast();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [filteredCharacters, setFilteredCharacters] = useState<Character[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [customizingCharacterId, setCustomizingCharacterId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login", { scroll: false });
      return;
    }

    const role = localStorage.getItem("selectedRole");
    if (!role) {
      router.push("/role-select", { scroll: false });
      return;
    }

    setSelectedRole(role);
  }, [user, authLoading, router]);


  const fetchCharacters = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const headers: HeadersInit = { "Content-Type": "application/json" };

      if (token) {
        headers.Authorization = `Bearer ${token}`;

        const charsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/characters`, { headers });
        if (!charsRes.ok) throw new Error("Failed to fetch characters");
        const charsData = await charsRes.json();

        try {
          const customRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chatbot-settings`, {
            headers,
          });

          if (customRes.ok) {
            const customizations = await customRes.json();
            const customMap = new Map();
            customizations.forEach((custom: CharacterCustomization) =>
              customMap.set(custom.characterId, custom)
            );

            setCharacters(
              charsData.map((char: Character) => {
                const custom = customMap.get(char.id);
                return {
                  ...char,
                  name: custom?.customName || char.name,
                  imageUrl: custom?.customImageUrl || char.imageUrl,
                  isCustomized: Boolean(custom?.customName || custom?.customImageUrl),
                };
              })
            );
          } else {
            setCharacters(charsData);
          }
        } catch {
          setCharacters(charsData);
        }
      } else {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/characters`);
        const data = await res.json();
        setCharacters(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load characters");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  useEffect(() => {
    setFilteredCharacters(
      characters
        .filter((char) => char.role.toLowerCase() === selectedRole.toLowerCase())
        .slice(0, 3)
    );
  }, [characters, selectedRole]);

  const handleCharacterSelect = (characterId: string) => {
    const character = characters.find((item) => item.id === characterId);
    if (!character) return;
    showSuccess(`Starting chat with ${character.name}...`);
    setTimeout(() => router.push(`/chat/${characterId}`), 300);
  };

  const handleRetry = () => window.location.reload();

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="app-panel-strong flex w-full max-w-md flex-col items-center gap-4 rounded-[2rem] px-8 py-10 text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-slate-300 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-400" />
          <div>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Loading your companions
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Pulling characters and your saved customizations.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="app-panel-strong w-full max-w-lg rounded-[2rem] p-8 text-center">
          <p className="app-eyebrow">Load error</p>
          <h2 className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            We could not load your character library
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">{error}</p>
          <Button onClick={handleRetry} className="mt-6">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-7xl flex-col gap-6">

      {/* ─── HEADER SECTION ─── */}
      <section className="app-panel-strong rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/role-select", { scroll: false })}
                className="rounded-2xl border border-slate-200 bg-white/75 p-3 text-slate-700 transition-all duration-200 hover:bg-white hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                aria-label="Go back to role selection"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <Badge
                variant={selectedRole === "mentor" ? "mentor" : selectedRole === "partner" ? "partner" : "friend"}
                size="lg"
              >
                {selectedRole || "role"}
              </Badge>
            </div>
            <h1 className="mt-5 text-4xl font-extrabold tracking-[-0.04em] text-slate-900 dark:text-slate-100 sm:text-5xl">
              Choose Your Companion
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-500 dark:text-slate-400">
              Select a companion tailored to your needs. Each character has a unique personality and conversation style.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-auto">
            <div className="rounded-2xl border border-slate-200 bg-white/75 p-1 dark:border-white/10 dark:bg-white/5">
              <button
                onClick={() => setViewMode("grid")}
                className={clsx(
                  "rounded-xl p-2.5 transition-all duration-200",
                  viewMode === "grid"
                    ? "bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900"
                    : "text-slate-600 hover:bg-white dark:text-slate-400 dark:hover:bg-white/8"
                )}
                aria-label="Switch to grid view"
              >
                <Grid2x2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={clsx(
                  "rounded-xl p-2.5 transition-all duration-200",
                  viewMode === "list"
                    ? "bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900"
                    : "text-slate-600 hover:bg-white dark:text-slate-400 dark:hover:bg-white/8"
                )}
                aria-label="Switch to list view"
              >
                <Rows3 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CARDS SECTION ─── */}
      {filteredCharacters.length === 0 ? (
        <section className="app-panel rounded-[2rem] p-10 text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            No characters available yet
          </h2>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            Try another role, or refresh after new characters are added.
          </p>
          <Button onClick={() => router.push("/role-select", { scroll: false })} className="mt-6">
            Choose another role
          </Button>
        </section>
      ) : (
        <section
          className={clsx(
            viewMode === "grid" ? "grid gap-6" : "flex flex-col gap-5"
          )}
          style={viewMode === "grid" ? { gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' } : undefined}
        >
          {filteredCharacters.map((character, index) => (
            <article
              key={character.id}
              onClick={() => handleCharacterSelect(character.id)}
              className={clsx(
                "group cursor-pointer overflow-hidden rounded-[1.5rem] transition-all duration-300",
                "bg-white/60 dark:bg-white/[0.04] backdrop-blur-xl",
                "border border-slate-200/60 dark:border-white/[0.08]",
                "shadow-[0_4px_24px_rgba(15,23,42,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.2)]",
                "hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_20px_50px_rgba(15,23,42,0.12)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)]",
                "hover:border-slate-300/80 dark:hover:border-white/[0.14]",
                viewMode === "list" && "flex flex-col sm:flex-row"
              )}
              style={{ animationDelay: `${index * 80}ms` }}
            >
              {/* ─── IMAGE ─── */}
              <div
                className={clsx(
                  "relative overflow-hidden",
                  viewMode === "grid" ? "h-64" : "h-40 w-full sm:h-auto sm:w-48 sm:shrink-0"
                )}
              >
                <img
                  src={
                    character.imageUrl.startsWith("http") || character.imageUrl.startsWith("/")
                      ? (character.imageUrl.includes('placehold') ? `https://ui-avatars.com/api/?name=${encodeURIComponent(character.name)}&background=random&size=400` : character.imageUrl)
                      : `/characters/${character.imageUrl}`
                  }
                  alt={character.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(character.name)}&background=random&size=400`;
                  }}
                />

                {/* Gradient overlay on image */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                {/* Settings button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCustomizingCharacterId(character.id);
                  }}
                  className="absolute right-3 top-3 rounded-xl bg-black/40 p-2.5 text-white/90 backdrop-blur-md transition-all duration-200 hover:bg-black/60 hover:text-white hover:scale-105"
                  title="Customize character"
                >
                  <Settings className="h-4 w-4" />
                </button>

                {/* Role badge on image */}
                <div className="absolute bottom-3 left-3">
                  <Badge
                    variant={
                      character.role === "mentor"
                        ? "mentor"
                        : character.role === "partner"
                        ? "partner"
                        : "friend"
                    }
                    size="sm"
                    className="shadow-lg backdrop-blur-sm"
                  >
                    {character.role}
                  </Badge>
                </div>
              </div>

              {/* ─── CONTENT ─── */}
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                {/* Title */}
                <h3 className="text-xl font-extrabold tracking-[-0.02em] text-slate-900 dark:text-slate-100 sm:text-2xl">
                  {character.name}
                </h3>

                {/* Description */}
                <p className="mt-2.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2">
                  {character.description}
                </p>

                {/* Backstory in list mode */}
                {viewMode === "list" && (
                  <p className="mt-3 text-sm leading-relaxed text-slate-400 dark:text-slate-500 line-clamp-2">
                    {character.backstory}
                  </p>
                )}

                {/* Divider */}
                <div className="my-4 h-px bg-slate-200/60 dark:bg-white/[0.06]" />

                {/* Footer */}
                <div className="mt-auto flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    </span>
                    <p className="text-xs font-medium tracking-wide text-slate-400 dark:text-slate-500">
                      Ready to chat
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCharacterSelect(character.id);
                    }}
                    className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98]"
                    style={{ background: 'linear-gradient(135deg, #4facfe, #00f2fe)' }}
                  >
                    <MessageCircle className="h-4 w-4" />
                    Start Chat
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      {customizingCharacterId && (
        <CharacterCustomizationModal
          isOpen={Boolean(customizingCharacterId)}
          characterId={customizingCharacterId}
          characterName={characters.find((item) => item.id === customizingCharacterId)?.name || "Character"}
          characterImage={characters.find((item) => item.id === customizingCharacterId)?.imageUrl || ""}
          onClose={() => setCustomizingCharacterId(null)}
          onSaved={() => fetchCharacters()}
        />
      )}
    </div>
  );
}
