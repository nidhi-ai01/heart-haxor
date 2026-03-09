"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { User, Calendar, Heart, ArrowRight } from "lucide-react";

export default function DetailsPage() {
  const router = useRouter();
  const { user, updateUserDetails } = useAuth();
  const { showSuccess, showError } = useToast();

  const [name, setName] = useState(user?.name || "");
  const [age, setAge] = useState(user?.age?.toString() || "");
  const [gender, setGender] = useState(user?.gender || "");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ name: "", age: "", gender: "" });

  const validateForm = () => {
    const newErrors = { name: "", age: "", gender: "" };
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = "Please enter your name";
      isValid = false;
    }

    if (!age || parseInt(age) < 13 || parseInt(age) > 120) {
      newErrors.age = "Please enter a valid age (13-120)";
      isValid = false;
    }

    if (!gender) {
      newErrors.gender = "Please select a gender";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showError("Please fix the errors above");
      return;
    }

    setLoading(true);

    try {
      updateUserDetails({
        email: user?.email || "",
        name: name.trim(),
        age: parseInt(age),
        gender,
      });

      showSuccess("Profile updated successfully!");

      setTimeout(() => {
        router.push("/characters");
      }, 800);
    } catch (err) {
      showError("Failed to save details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-slate-900 dark:via-purple-950 dark:to-slate-950 flex items-center justify-center p-4 overflow-hidden relative transition-colors duration-300">
      {/* Decorative blurred shapes */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-float opacity-30"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl animate-float opacity-30" style={{ animationDelay: "2s" }}></div>

      {/* Main content */}
      <Card className="w-full max-w-md animate-page-slide-in relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-300 to-violet-400 rounded-full opacity-20 blur-xl animate-soft-glow" />
            <Heart className="relative w-12 h-12 text-violet-600 dark:text-violet-400 fill-current drop-shadow-lg" />
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <p className="text-xs tracking-widest text-purple-600 dark:text-purple-400 uppercase mb-2 font-semibold">
            Step 3
          </p>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
            Let's Get to Know You
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Tell us a bit about yourself so we can tailor your experience
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Field */}
          <Input
            type="text"
            label="What's your name?"
            placeholder="John Doe"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErrors({ ...errors, name: "" });
            }}
            error={errors.name}
            leftIcon={<User className="w-5 h-5" />}
            required
          />

          {/* Age Field */}
          <Input
            type="number"
            label="How old are you?"
            placeholder="18"
            value={age}
            onChange={(e) => {
              setAge(e.target.value);
              setErrors({ ...errors, age: "" });
            }}
            error={errors.age}
            leftIcon={<Calendar className="w-5 h-5" />}
            min="13"
            max="120"
            required
          />

          {/* Gender Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              How do you identify?
            </label>
            <div className="relative">
              <select
                value={gender}
                onChange={(e) => {
                  setGender(e.target.value);
                  setErrors({ ...errors, gender: "" });
                }}
                className={`w-full pl-12 pr-4 py-3 bg-white/70 dark:bg-slate-800/70 text-gray-800 dark:text-gray-100 rounded-xl border-2 transition-all duration-300 focus:outline-none font-medium appearance-none cursor-pointer ${
                  errors.gender
                    ? "border-red-400 dark:border-red-500"
                    : "border-purple-200 dark:border-purple-700/50 focus:border-violet-400 dark:focus:border-violet-500"
                }`}
                required
              >
                <option value="">Select your gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
              <Heart className="absolute left-4 top-3 h-5 w-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
              {/* Chevron icon for select */}
              <svg className="absolute right-4 top-3 h-5 w-5 text-gray-400 dark:text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
            {errors.gender && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-2 flex items-center gap-1">
                <span>✕</span> {errors.gender}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            fullWidth
            size="lg"
            loading={loading}
            className="flex items-center justify-center gap-2 mt-8"
          >
            {loading ? "Setting Up..." : "Continue to Characters"}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </Button>
        </form>

        {/* Footer message */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700/50 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            💜 This helps us personalize your experience
          </p>
        </div>
      </Card>
    </div>
  );
}
