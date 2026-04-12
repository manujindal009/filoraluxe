"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Loader } from "@/components/ui/Loader";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorStatus, setErrorStatus] = useState<"none" | "unverified" | "error">("none");
  const [errorMessage, setErrorMessage] = useState("");

  const { login, user, isAdmin, resendVerification } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  // Redirect once the auth state actually resolves with a real user
  useEffect(() => {
    if (user) {
      if (isAdmin) {
        router.push("/admin");
      } else {
        router.push("/profile");
      }
    }
  }, [user, isAdmin, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorStatus("none");
    setErrorMessage("");
    
    try {
      await login(email, password);
      addToast(`Welcome back!`, "success");
    } catch (error: any) {
      console.error("[Login] Error:", error.message);
      
      if (error.message === "unverified") {
        setErrorStatus("unverified");
        setErrorMessage("Please verify your email address before logging in.");
      } else {
        setErrorStatus("error");
        // Friendly error messages
        const msg = error.message.toLowerCase();
        if (msg.includes("invalid login credentials")) {
          setErrorMessage("Invalid email or password.");
        } else if (msg.includes("user not found")) {
          setErrorMessage("No account found with this email.");
        } else {
          setErrorMessage(error.message || "An unexpected error occurred.");
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    try {
      await resendVerification(email);
      addToast("Verification email resent!", "success");
    } catch (err) {
      addToast("Failed to resend email", "error");
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-20 flex justify-center items-center flex-1 min-h-[70vh]">
      <div className="w-full max-w-md bg-white p-8 rounded-xl border border-secondary shadow-sm">
        <h1 className="text-3xl font-serif font-semibold text-center mb-6">Welcome Back</h1>
        <p className="text-center text-foreground/60 mb-8 text-sm text-balance">
          Sign in to access your orders and request custom crochet pieces.
        </p>

        {errorStatus !== "none" && (
          <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 border ${
            errorStatus === "unverified" 
              ? "bg-amber-50 border-amber-200 text-amber-800" 
              : "bg-red-50 border-red-200 text-red-800"
          }`}>
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-semibold">{errorStatus === "unverified" ? "Email Not Verified" : "Login Failed"}</p>
              <p className="opacity-90">{errorMessage}</p>
              {errorStatus === "unverified" && (
                <button 
                  onClick={handleResend}
                  className="mt-2 text-xs font-bold uppercase tracking-wider underline hover:no-underline"
                >
                  Resend verification link
                </button>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1">Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-secondary rounded-md px-4 py-2 bg-white focus:ring-1 focus:ring-rose focus:border-rose outline-none transition-colors"
              placeholder="your@email.com"
            />
          </div>
          
          <div className="relative">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-foreground/80">Password</label>
              <Link href="/auth/forgot-password" title="Reset your password" className="text-xs text-rose hover:underline font-medium">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                required
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-secondary rounded-md px-4 py-2 bg-white focus:ring-1 focus:ring-rose focus:border-rose outline-none transition-colors pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2 text-foreground/40 hover:text-rose transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-foreground text-white py-3 rounded-md font-medium hover:bg-rose transition-colors flex justify-center items-center mt-6 disabled:opacity-70 shadow-sm active:scale-[0.98]"
          >
            {isSubmitting ? <Loader size="sm" variant="white" /> : "Sign In"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-secondary text-center">
          <p className="text-sm text-foreground/70">
            Don't have an account?{" "}
            <Link href="/auth/register" className="text-rose font-medium hover:underline">
              Create one now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
