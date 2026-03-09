"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Skeleton from "@/components/ui/Skeleton";
import LogoutConfirmModal from "@/components/LogoutConfirmModal";
import { LogOut, Users, Briefcase, Heart } from "lucide-react";
import clsx from "clsx";

export default function RoleSelect() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const { showSuccess, showError } = useToast();

  const [age, setAge] = useState<number>(0);
  const [selected, setSelected] = useState<string>("");
  const [ageInput, setAgeInput] = useState<string>("");
  const [showAgeUpdate, setShowAgeUpdate] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (user.age) {
      setAge(user.age);
      setAgeInput(user.age.toString());
    }
  }, [user, isLoading, router]);

  const updateAge = () => {
    const newAge = Number(ageInput);
    if (newAge >= 13 && newAge <= 120) {
      setAge(newAge);
      setShowAgeUpdate(false);
      showSuccess("Age updated successfully!");
    } else {
      showError("Please enter a valid age (13-120)");
    }
  };

  const finish = () => {
    if (!selected) {
      showError("Please select a role to continue");
      return;
    }

    localStorage.setItem("selectedRole", selected);
    localStorage.setItem("role", selected);
    showSuccess("Role selected! Taking you to characters...");
    setTimeout(() => router.push("/characters"), 800);
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    showSuccess("Logged out successfully!");
    router.push('/');
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  if (isLoading) {
    return (
      <main className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-4">
        <Card className="w-full max-w-[500px]">
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-12 w-full rounded-full" />
          </div>
        </Card>
      </main>
    );
  }

  const roleCards = [
    {
      id: "friend",
      name: "Friend",
      description: "Someone who listens and supports you",
      icon: Users,
    },
    {
      id: "mentor",
      name: "Mentor",
      description: "An experienced guide for personal growth",
      icon: Briefcase,
    },
    {
      id: "partner",
      name: "Partner",
      description: "A romantic, emotional companion (18+)",
      icon: Heart,
      restricted: age < 18,
    },
  ];

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-4">
      {/* Logout Button - Top Right */}
      <button
        onClick={handleLogoutClick}
        className="absolute top-6 right-6 p-3 hover:bg-red-100/60 dark:hover:bg-red-900/40 rounded-full transition-colors duration-300 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:scale-110 active:scale-95"
        title="Logout"
        aria-label="Logout"
      >
        <LogOut className="w-6 h-6" />
      </button>

      <Card className="w-full max-w-2xl animate-page-slide-in">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-sm tracking-widest text-gray-500 dark:text-gray-400 uppercase mb-2 font-semibold">
            Step 2
          </p>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Hey buddy 💜
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            How should <span className="font-semibold text-indigo-600 dark:text-indigo-400">Heart Haxor</span> be with you?
          </p>
        </div>

        {/* Age Info */}
        {age > 0 && (
          <div className="mb-8 flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800/50">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Age: {age}</span>
            <button
              onClick={() => setShowAgeUpdate(!showAgeUpdate)}
              className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
              Edit
            </button>
          </div>
        )}

        {/* Age Update Form */}
        {showAgeUpdate && (
          <div className="mb-8 p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg border border-indigo-200 dark:border-indigo-800/50 space-y-3">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block">Update your age:</label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={ageInput}
                onChange={(e) => setAgeInput(e.target.value)}
                min="13"
                max="120"
                placeholder="25"
                className="flex-1"
              />
              <Button variant="secondary" onClick={updateAge} size="md">
                Save
              </Button>
            </div>
          </div>
        )}

        {/* Role Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {roleCards.map((role) => {
            const Icon = role.icon;
            const isSelected = selected === role.id;
            const isDisabled = role.restricted;

            return (
              <button
                key={role.id}
                onClick={() => !isDisabled && setSelected(role.id)}
                disabled={isDisabled}
                className={clsx(
                  'p-5 rounded-xl border-2 transition-all duration-300 text-left group',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  !isDisabled && 'cursor-pointer hover:scale-105',
                  isSelected
                    ? 'bg-gradient-to-br from-violet-400 to-purple-500 dark:from-violet-600 dark:to-purple-700 border-violet-300 dark:border-violet-700 text-white shadow-lg dark:shadow-purple-900/50'
                    : 'bg-white/70 dark:bg-slate-800/70 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:border-violet-300 dark:hover:border-violet-700'
                )}
              >
                <Icon className={clsx('w-8 h-8 mb-3', isSelected ? 'text-white' : 'text-indigo-600 dark:text-indigo-400')} />
                <h3 className="font-bold text-lg mb-1">{role.name}</h3>
                <p className={clsx('text-sm leading-relaxed', isSelected ? 'text-white/90' : 'text-gray-600 dark:text-gray-400')}>
                  {role.description}
                </p>
                {isDisabled && (
                  <Badge variant="error" size="sm" className="mt-3 inline-block">
                    18+ only
                  </Badge>
                )}
              </button>
            );
          })}
        </div>

        {/* Finish Button */}
        <Button
          onClick={finish}
          variant="primary"
          fullWidth
          size="lg"
          className="animate-bounce-in"
        >
          Continue to Characters
        </Button>
      </Card>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
      />
    </main>
  );
}
