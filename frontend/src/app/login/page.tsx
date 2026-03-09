"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import Skeleton, { SkeletonFormField } from "@/components/ui/Skeleton";
import { Mail, Phone, Lock, Eye, EyeOff } from "lucide-react";
import clsx from "clsx";

export default function Login() {
  const router = useRouter();
  const { loginWithEmail, sendOTP, verifyOTP, error, clearError, isLoading } = useAuth();
  const { showSuccess, showError } = useToast();

  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Email login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");

  // Phone OTP state
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setEmailError("");
      clearError();

      if (!email || !password) {
        setEmailError("Please fill in all fields");
        showError("Please fill in all fields");
        return;
      }

      await loginWithEmail(email, password);
      showSuccess("Logged in successfully!");
      router.push("/role-select");
    } catch (err: any) {
      const errorMsg = err?.message || "Login failed. Please try again.";
      setEmailError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setPhoneError("");
      clearError();

      if (!phone) {
        setPhoneError("Please enter a phone number");
        showError("Please enter a phone number");
        return;
      }

      const response = await sendOTP(phone);
      setOtpMessage(response.message);
      setShowOtpInput(true);
      showSuccess("OTP sent successfully!");
    } catch (err: any) {
      const errorMsg = err?.message || "Failed to send OTP";
      setPhoneError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setPhoneError("");
      clearError();

      if (otp.length !== 6) {
        setPhoneError("Please enter a valid 6-digit code");
        showError("Please enter a valid 6-digit code");
        return;
      }

      await verifyOTP(phone, otp);
      showSuccess("Logged in successfully!");
      router.push("/role-select");
    } catch (err: any) {
      const errorMsg = err?.message || "OTP verification failed";
      setPhoneError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
        <Card className="w-[420px]">
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-full" />
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
            Welcome back 💜
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sign in to continue with <span className="font-semibold text-indigo-600 dark:text-indigo-400">Heart Haxor</span>
          </p>
        </div>

        {/* Tmethod Toggle */}
        <div className="flex gap-2 mb-8 bg-gray-100 dark:bg-slate-700 rounded-full p-1">
          <button
            onClick={() => {
              setAuthMethod("email");
              clearError();
              setShowOtpInput(false);
              setEmailError("");
              setPhoneError("");
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
              setShowOtpInput(false);
              setEmailError("");
              setPhoneError("");
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

        {/* Email Login Form */}
        {authMethod === "email" && (
          <form onSubmit={handleEmailLogin} className="space-y-5">
            <Input
              type="email"
              label="Email Address"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError("");
              }}
              error={emailError || error}
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
                  setEmailError("");
                }}
                error={emailError || error}
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
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              size="lg"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        )}

        {/* Phone OTP Form */}
        {authMethod === "phone" && (
          <form onSubmit={showOtpInput ? handleVerifyOTP : handleSendOTP} className="space-y-5">
            {!showOtpInput ? (
              <>
                <Input
                  type="tel"
                  label="Phone Number"
                  placeholder="+1234567890"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setPhoneError("");
                  }}
                  error={phoneError || error}
                  leftIcon={<Phone className="w-5 h-5" />}
                  helpText="We'll send you a 6-digit verification code"
                  required
                />

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={loading}
                  size="lg"
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                </Button>
              </>
            ) : (
              <>
                <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl border border-indigo-200 dark:border-indigo-800/50">
                  <p className="text-sm text-indigo-700 dark:text-indigo-300 font-semibold">{otpMessage}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Enter the 6-digit code sent to your phone</p>
                </div>

                <Input
                  type="text"
                  label="Verification Code"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.slice(0, 6));
                    setPhoneError("");
                  }}
                  error={phoneError || error}
                  maxLength={6}
                  inputMode="numeric"
                  required
                  className="text-center text-xl tracking-widest font-bold"
                />

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={loading}
                  disabled={otp.length !== 6}
                  size="lg"
                >
                  {loading ? "Verifying..." : "Verify & Sign In"}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  fullWidth
                  onClick={() => {
                    setShowOtpInput(false);
                    setOtp("");
                    setOtpMessage("");
                    setPhoneError("");
                  }}
                >
                  Use different phone
                </Button>
              </>
            )}
          </form>
        )}

        {/* Signup Link */}
        <p className="text-center text-gray-600 dark:text-gray-400 mt-8">
          Don't have an account?{" "}
          <button
            onClick={() => router.push("/signup")}
            className="text-indigo-600 dark:text-indigo-400 font-bold hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
          >
            Create One
          </button>
        </p>
      </Card>
    </main>
  );
}
