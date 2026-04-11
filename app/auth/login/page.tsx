"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Loader } from "@/components/ui/Loader";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, user, isAdmin } = useAuth();
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
    
    try {
      await login(email, password);
      addToast(`Welcome back!`, "success");
      // ⚠️ Do NOT push here — useEffect above handles redirect once user state is ready
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Login failed. Please try again.";
      console.error("[Login] Error:", msg);
      addToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-20 flex justify-center items-center flex-1 min-h-[70vh]">
      <div className="w-full max-w-md bg-white p-8 rounded-xl border border-secondary shadow-sm">
        <h1 className="text-3xl font-serif font-semibold text-center mb-6">Welcome Back</h1>
        <p className="text-center text-foreground/60 mb-8 text-sm text-balance">
          Sign in to access your orders, track shipments, and request custom pieces.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1">Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-secondary rounded-md px-4 py-2 bg-white focus:ring-1 focus:ring-rose focus:border-rose outline-none transition-colors"
              placeholder="Email"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-foreground/80">Password</label>
              <a href="#" className="text-xs text-rose hover:underline">Forgot password?</a>
            </div>
            <input
              required
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-secondary rounded-md px-4 py-2 bg-white focus:ring-1 focus:ring-rose focus:border-rose outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-foreground text-white py-3 rounded-md font-medium hover:bg-rose transition-colors flex justify-center items-center mt-2 disabled:opacity-70"
          >
            {isSubmitting ? <Loader size="sm" /> : "Sign In"}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-secondary text-center">
          <p className="text-sm text-foreground/70">
            Don't have an account?{" "}
            <Link href="/auth/register" className="text-rose font-medium hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
