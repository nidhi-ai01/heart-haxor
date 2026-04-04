"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Skeleton from "@/components/ui/Skeleton";
import { Users, Briefcase, Heart, ChevronRight } from "lucide-react";
import clsx from "clsx";
import { motion } from "framer-motion";

export default function RoleSelect() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const { showSuccess, showError } = useToast();
  const [isAdult, setIsAdult] = useState(false);
  const [selected, setSelected] = useState<string>("");

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    setIsAdult(Boolean(user.isAdult));
  }, [user, isLoading, router]);

  const finish = () => {
    if (!selected) {
      showError("Please select a role to continue.");
      return;
    }

    localStorage.setItem("selectedRole", selected);
    localStorage.setItem("role", selected);
    showSuccess("Role selected. Taking you to characters...");
    setTimeout(() => router.push("/characters"), 500);
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-4xl">
          <div className="space-y-4">
            <Skeleton className="h-6 w-32 rounded-full" />
            <Skeleton className="h-12 w-2/3" />
            <Skeleton className="h-28 w-full rounded-[1.75rem]" />
            <Skeleton className="h-28 w-full rounded-[1.75rem]" />
          </div>
        </Card>
      </main>
    );
  }

  const roleCards = [
    {
      id: "friend",
      name: "Friend",
      description: "Someone to talk to, share thoughts, and feel understood.",
      icon: Users,
    },
    {
      id: "mentor",
      name: "Mentor",
      description: "Clear-headed guidance for growth, goals, and better decision-making.",
      icon: Briefcase,
    },
    {
      id: "partner",
      name: "Partner",
      description: "A more intimate emotional companion for adults looking for closeness.",
      icon: Heart,
      restricted: !isAdult,
    },
  ];

  return (
    <main className="app-shell min-h-[calc(100vh-2rem)] p-4 sm:p-6 flex items-center justify-center">
      <div className="w-full max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-10">
            <p className="app-eyebrow text-blue-600 dark:text-blue-400">Role Setup</p>
            <h1 className="mt-4 text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
              Choose the tone of your companion
            </h1>
            <p className="mt-3 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              This choice shapes how Heart Haxor speaks, supports, and frames conversations. 
              {isAdult ? " You have full access." : " Some options are restricted based on your profile age."}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {roleCards.map((role, idx) => {
              const Icon = role.icon;
              const isSelected = selected === role.id;
              const isDisabled = Boolean(role.restricted);

              return (
                <motion.div
                  key={role.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                >
                  <button
                    type="button"
                    onClick={() => !isDisabled && setSelected(role.id)}
                    disabled={isDisabled}
                    className={clsx(
                      "w-full text-left p-6 rounded-[2rem] border-2 transition-all duration-300 relative overflow-hidden group min-h-[220px] flex flex-col items-center text-center",
                      isDisabled
                        ? "cursor-not-allowed opacity-60 bg-slate-50 border-slate-200 dark:bg-white/5 dark:border-white/5"
                        : isSelected
                        ? "border-blue-500 bg-blue-50/50 shadow-[0_0_30px_rgba(59,130,246,0.2)] dark:border-blue-400 dark:bg-blue-900/20"
                        : "border-transparent bg-white hover:-translate-y-2 hover:shadow-[0_0_25px_rgba(59,130,246,0.15)] hover:border-blue-200 dark:bg-white/5 dark:hover:border-blue-400/30"
                    )}
                  >
                    {/* Subtle glow background for selected state */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none" />
                    )}

                    <div
                      className={clsx(
                        "w-16 h-16 rounded-2xl flex items-center justify-center transition-transform duration-300 mb-4",
                        isDisabled
                          ? "bg-slate-200 text-slate-400 dark:bg-white/10 dark:text-slate-500"
                          : isSelected
                          ? "bg-blue-600 text-white scale-110 shadow-lg shadow-blue-500/30"
                          : "bg-slate-100 text-slate-700 group-hover:scale-110 group-hover:bg-blue-100 group-hover:text-blue-600 dark:bg-white/10 dark:text-slate-300 dark:group-hover:bg-blue-900/40 dark:group-hover:text-blue-300"
                      )}
                    >
                      <Icon className="w-8 h-8" />
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                      {role.name}
                    </h3>

                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                      {role.description}
                    </p>

                    {isDisabled && (
                      <div className="mt-auto">
                        <Badge variant="warning" size="sm" className="whitespace-nowrap">
                          Available for 18+ users
                        </Badge>
                      </div>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>

          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10 flex justify-center"
            >
              <Button onClick={finish} size="lg" className="px-8 shadow-lg shadow-blue-500/25">
                Continue
                <ChevronRight className="h-5 w-5 ml-2" />
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
