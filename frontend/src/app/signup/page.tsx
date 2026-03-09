"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import Skeleton, { SkeletonFormField } from "@/components/ui/Skeleton";
import { Mail, Phone, Lock, User, Calendar, Eye, EyeOff } from "lucide-react";
import clsx from "clsx";

export default function Signup() {
  const router = useRouter();
  const { registerUser, error, clearError, isLoading } = useAuth();
  const { showSuccess, showError } = useToast();

  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Common fields
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Email signup state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Phone signup state
  const [phone, setPhone] = useState("");

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!name) errors.name = "Name is required";
    if (!age) errors.age = "Age is required";
    if (parseInt(age) < 13) errors.age = "You must be at least 13 years old";
    if (parseInt(age) > 120) errors.age = "Please enter a valid age";

    if (authMethod === "email") {
      if (!email) errors.email = "Email is required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Invalid email format";
      if (!password) errors.password = "Password is required";
      if (password.length < 8) errors.password = "Password must be at least 8 characters";
      if (!/[A-Z]/.test(password)) errors.password = "Password must contain an uppercase letter";
      if (!/[a-z]/.test(password)) errors.password = "Password must contain a lowercase letter";
      if (!/[0-9]/.test(password)) errors.password = "Password must contain a number";
    } else {
      if (!phone) errors.phone = "Phone number is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!validateForm()) {
        showError("Please fix the errors below");
        return;
      }

      setLoading(true);
      clearError();
      await registerUser(name, parseInt(age), email, undefined, password);
      showSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err: any) {
      const errorMsg = err?.message || "Signup failed. Please try again.";
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!validateForm()) {
        showError("Please fix the errors below");
        return;
      }

      setLoading(true);
      clearError();
      await registerUser(name, parseInt(age), undefined, phone);
      showSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err: any) {
      const errorMsg = err?.message || "Signup failed. Please try again.";
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
        <Card className="w-full max-w-[420px]">
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-full" />
            <SkeletonFormField />
            <SkeletonFormField />
            <SkeletonFormField />
            <Skeleton className="h-12 w-full rounded-full" />
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-4">
      <Card className="w-full max-w-[420px] animate-page-slide-in">
        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Join Us 🚀
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create your <span className="font-semibold text-indigo-600 dark:text-indigo-400">Heart Haxor</span> account
          </p>
        </div>

        {/* Auth Method Toggle */}
        <div className="flex gap-2 mb-8 bg-gray-100 dark:bg-slate-700 rounded-full p-1">
          <button
            onClick={() => {
              setAuthMethod("email");
              clearError();
              setFormErrors({});
            }}
            className={clsx(
              'flex-1 py-2.5 px-4 rounded-full font-semibold transition-all duration-300 flex items-center justify-center gap-2 text-sm',
              authMethod === "email"
                ? 'bg-gradient-to-r from-violet-400 to-purple-500 text-white shadow-lg'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
            )}
          >
            <Mail className="w-4 h-4" />
            Email
          </button>
          <button
            onClick={() => {
              setAuthMethod("phone");
              clearError();
              setFormErrors({});
            }}
            className={clsx(
              'flex-1 py-2.5 px-4 rounded-full font-semibold transition-all duration-300 flex items-center justify-center gap-2 text-sm',
              authMethod === "phone"
                ? 'bg-gradient-to-r from-violet-400 to-purple-500 text-white shadow-lg'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
            )}
          >
            <Phone className="w-4 h-4" />
            Phone
          </button>
        </div>

        {/* Signup Form */}
        <form onSubmit={authMethod === "email" ? handleEmailSignup : handlePhoneSignup} className="space-y-5">
          {/* Name Input */}
          <Input
            type="text"
            label="Full Name"
            placeholder="John Doe"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (formErrors.name) setFormErrors({ ...formErrors, name: "" });
            }}
            error={formErrors.name || error}
            leftIcon={<User className="w-5 h-5" />}
            required
          />

          {/* Age Input */}
          <Input
            type="number"
            label="Age"
            placeholder="25"
            value={age}
            onChange={(e) => {
              setAge(e.target.value);
              if (formErrors.age) setFormErrors({ ...formErrors, age: "" });
            }}
            error={formErrors.age}
            leftIcon={<Calendar className="w-5 h-5" />}
            min="13"
            max="120"
            required
          />

          {/* Email Signup */}
          {authMethod === "email" && (
            <>
              <Input
                type="email"
                label="Email Address"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (formErrors.email) setFormErrors({ ...formErrors, email: "" });
                }}
                error={formErrors.email || error}
                leftIcon={<Mail className="w-5 h-5" />}
                required
              />

              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  label="Password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (formErrors.password) setFormErrors({ ...formErrors, password: "" });
                  }}
                  error={formErrors.password}
                  leftIcon={<Lock className="w-5 h-5" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  }
                  helpText="Min 8 chars, 1 uppercase, 1 lowercase, 1 number"
                  required
                />
              </div>
            </>
          )}

          {/* Phone Signup */}
          {authMethod === "phone" && (
            <Input
              type="tel"
              label="Phone Number"
              placeholder="+1234567890"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (formErrors.phone) setFormErrors({ ...formErrors, phone: "" });
              }}
              error={formErrors.phone || error}
              leftIcon={<Phone className="w-5 h-5" />}
              helpText="We'll send you a verification code"
              required
            />
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            size="lg"
            className="mt-6"
          >
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        {/* Login Link */}
        <p className="text-center text-gray-600 dark:text-gray-400 mt-8">
          Already have an account?{" "}
          <button
            onClick={() => router.push("/login")}
            className="text-indigo-600 dark:text-indigo-400 font-bold hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
          >
            Sign In
          </button>
        </p>
      </Card>
    </main>
  );
}
