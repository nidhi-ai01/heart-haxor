"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Grid2x2, Grid3x3, MessageCircle, ArrowLeft, Settings } from "lucide-react";
import clsx from "clsx";
import Button from "@/components/ui/Button";
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

  // Check authentication and get selected role
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    const role = localStorage.getItem("selectedRole");
    if (!role) {
      router.push("/role-select");
      return;
    }

    setSelectedRole(role);
  }, [user, authLoading, router]);

  // Fetch characters
  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('accessToken');
        
        const headers: HeadersInit = {
          'Content-Type': 'application/json'
        };
        
        // If authenticated, fetch all characters and then get customizations
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
          
          // Fetch default characters first
          const charsRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/characters`,
            { headers }
          );

          if (!charsRes.ok) {
            throw new Error("Failed to fetch characters");
          }

          const charsData = await charsRes.json();

          // Try to fetch user customizations
          try {
            const customRes = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/chatbot-settings`,
              { headers }
            );

            if (customRes.ok) {
              const customizations = await customRes.json();

              const customMap = new Map();
              customizations.forEach((custom: any) => {
                customMap.set(custom.characterId, custom);
              });

              const mergedData = charsData.map((char: any) => {
                const custom = customMap.get(char.id);

                return {
                  ...char,
                  name: custom?.customName || char.name,
                  imageUrl: custom?.customImageUrl || char.imageUrl,
                  isCustomized: !!(custom?.customName || custom?.customImageUrl)
                };
              });

              setCharacters(mergedData);
              
            } else {
              setCharacters(charsData);
            }
          } catch (customErr) {
            console.warn("Could not fetch customizations, using defaults");
            setCharacters(charsData);
          }
        } else {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/characters`
          );
          const data = await res.json();
          setCharacters(data);
        }
      } catch (error) {
        console.error("Error fetching characters:", error);
        setError(error instanceof Error ? error.message : "Failed to load characters");
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters();
  }, []);

  // Filter characters by role
  useEffect(() => {
    const filtered = characters.filter(
      (char) => char.role.toLowerCase() === selectedRole.toLowerCase()
    );
    setFilteredCharacters(filtered);
  }, [characters, selectedRole]);

  const handleCharacterSelect = (characterId: string) => {
    const character = characters.find(c => c.id === characterId);
    if (character) {
      // Use display name (already has custom name merged in from API)
      const displayName = character.name;
      showSuccess(`Starting chat with ${displayName}...`);
      setTimeout(() => {
        router.push(`/chat/${characterId}`);
      }, 600);
    }
  };

  const handleBackToRole = () => {
    router.push("/role-select");
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-amber-50 via-blue-50 to-purple-100 dark:from-slate-900 dark:via-purple-950 dark:to-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500 dark:border-violet-400"></div>
          <p className="text-violet-600 dark:text-violet-400 font-medium">
            Loading your companions...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-amber-50 via-blue-50 to-purple-100 dark:from-slate-900 dark:via-purple-950 dark:to-slate-950 p-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">
            ⚠️ Error Loading Characters
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            variant="primary"
            size="lg"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-blue-50 to-purple-100 dark:from-slate-900 dark:via-purple-950 dark:to-slate-950 transition-colors duration-300">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-b border-white/40 dark:border-slate-700/40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToRole}
                className="p-2 hover:bg-purple-100/60 dark:hover:bg-purple-900/40 rounded-full transition-colors duration-300 text-gray-700 dark:text-gray-300"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Choose Your Companion
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2 capitalize">
                  {selectedRole} Mode • {filteredCharacters.length} character
                  {filteredCharacters.length !== 1 ? "s" : ""} available
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={clsx(
                  "p-2 rounded-lg transition-all duration-300",
                  viewMode === "grid"
                    ? "bg-violet-400 dark:bg-violet-500 text-white shadow-lg"
                    : "hover:bg-purple-100/60 dark:hover:bg-purple-900/40 text-gray-700 dark:text-gray-300"
                )}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={clsx(
                  "p-2 rounded-lg transition-all duration-300",
                  viewMode === "list"
                    ? "bg-violet-400 dark:bg-violet-500 text-white shadow-lg"
                    : "hover:bg-purple-100/60 dark:hover:bg-purple-900/40 text-gray-700 dark:text-gray-300"
                )}
              >
                <Grid2x2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Characters Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {filteredCharacters.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">
              No characters available 💭
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              No companions found for this mode. Try another role.
            </p>
            <Button
              onClick={handleBackToRole}
              variant="primary"
              size="lg"
            >
              Choose Another Mode
            </Button>
          </div>
        ) : (
          <div
            className={clsx(
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            )}
          >
            {filteredCharacters.map((character) => (
              <div
                key={character.id}
                onClick={() => handleCharacterSelect(character.id)}
                className={clsx(
                  "group cursor-pointer transition-all duration-300 transform hover:scale-105",
                  viewMode === "grid"
                    ? "bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-purple-300/50 dark:hover:shadow-purple-900/50 border border-white/60 dark:border-slate-700/50"
                    : "bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-2xl hover:shadow-purple-300/50 dark:hover:shadow-purple-900/50 border border-white/60 dark:border-slate-700/50 flex items-center gap-6"
                )}
              >
                {/* Character Image */}
                <div
                  className={clsx(
                    viewMode === "grid" ? "w-full h-64 relative overflow-hidden" : "w-24 h-24 flex-shrink-0 relative"
                  )}
                >
                  <img
                    src={
                      character.imageUrl.startsWith("http") ||
                      character.imageUrl.startsWith("/")
                        ? character.imageUrl
                        : `/characters/${character.imageUrl}`
                    }
                    alt={character.name}
                    className={clsx(
                      "w-full h-full object-cover transition-transform duration-500 group-hover:scale-110",
                      viewMode === "grid" ? "rounded-t-2xl" : "rounded-xl"
                    )}
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://placehold.co/400x400/f3e8ff/6d28d9?text=" +
                        character.name[0];
                    }}
                  />
                  {/* Overlay */}
                  {viewMode === "grid" && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}

                  {/* Settings Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCustomizingCharacterId(character.id);
                    }}
                    className="absolute top-2 right-2 p-2 bg-black/40 hover:bg-black/60 text-white rounded-lg backdrop-blur-sm transition-all duration-200 transform hover:scale-110 z-20"
                    title="Customize character"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>

                {/* Character Info */}
                <div className={viewMode === "grid" ? "p-4" : "flex-1"}>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {character.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {character.description}
                  </p>

                  {viewMode === "list" && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                      {character.backstory}
                    </p>
                  )}

                  {/* Role Badge */}
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={clsx(
                        "inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize",
                        character.role === "friend"
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                          : character.role === "mentor"
                          ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                          : "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300"
                      )}
                    >
                      {character.role}
                    </span>

                    {/* Chat Button - Using Button Component */}
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCharacterSelect(character.id);
                      }}
                      variant="primary"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Chat
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Character Customization Modal */}
      {customizingCharacterId && (
        <CharacterCustomizationModal
          isOpen={Boolean(customizingCharacterId)}
          characterId={customizingCharacterId}
          characterName={characters.find(c => c.id === customizingCharacterId)?.name || "Character"}
          characterImage={characters.find(c => c.id === customizingCharacterId)?.imageUrl || ""}
          onClose={() => setCustomizingCharacterId(null)}
        />
      )}
    </div>
  );
}
}