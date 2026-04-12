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

  const { login, loginWithGoogle, user, isAdmin, resendVerification } = useAuth();
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
    <div className="container mx-auto px-4 md:px-6 py-10 md:py-20 flex justify-center items-center flex-1 min-h-[70vh]">
      <div className="w-full max-w-md bg-white p-6 md:p-8 rounded-xl border border-secondary shadow-sm">
        <h1 className="text-3xl font-serif font-semibold text-center mb-6">Welcome Back</h1>
        <p className="text-center text-foreground/60 mb-8 text-sm text-balance">
          Sign in to access your orders and request custom crochet pieces.
        </p>

        {/* OAuth Section */}
        <div className="mb-6">
          <button
            onClick={async () => {
              try {
                await loginWithGoogle();
              } catch (err: any) {
                addToast(err.message || "Google sign-in failed", "error");
              }
            }}
            className="w-full flex items-center justify-center gap-3 bg-white border border-secondary text-foreground py-3 rounded-md font-medium hover:bg-secondary/10 transition-colors shadow-sm active:scale-[0.98]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="relative flex items-center justify-center my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-secondary"></div>
            </div>
            <span className="relative px-4 text-xs uppercase tracking-widest text-foreground/30 bg-white font-bold">Or</span>
          </div>
        </div>

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
