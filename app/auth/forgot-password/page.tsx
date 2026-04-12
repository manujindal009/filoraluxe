"use client";

import React, { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/context/ToastContext";
import { Loader } from "@/components/ui/Loader";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { validateEmail } from "@/lib/utils/validation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      addToast("Please enter a valid email address", "error");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Supabase handles the email sending
      // The redirect URL should be the reset-password page
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;
      
      setIsSent(true);
      addToast("Reset link sent successfully!", "success");
    } catch (error: any) {
      console.error("Reset error:", error.message);
      addToast(error.message || "Failed to send reset link", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSent) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-20 flex justify-center items-center flex-1 min-h-[70vh]">
        <div className="w-full max-w-md bg-white p-8 rounded-xl border border-secondary shadow-lg text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-serif font-semibold mb-4">Email Sent</h1>
          <p className="text-foreground/70 mb-8">
            Check your inbox for a link to reset your password. If you don't see it, check your spam folder.
          </p>
          <Link 
            href="/auth/login" 
            className="flex items-center justify-center gap-2 text-rose font-medium hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-20 flex justify-center items-center flex-1 min-h-[70vh]">
      <div className="w-full max-w-md bg-white p-8 rounded-xl border border-secondary shadow-sm">
        <Link 
          href="/auth/login" 
          className="flex items-center gap-2 text-sm text-foreground/50 hover:text-rose transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to login
        </Link>
        
        <h1 className="text-3xl font-serif font-semibold mb-2">Forgot Password?</h1>
        <p className="text-foreground/60 mb-8 text-sm">
          Enter the email address associated with your account and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1">Email Address</label>
            <div className="relative">
              <input
                required
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-secondary rounded-md pl-10 pr-4 py-2 bg-white focus:ring-1 focus:ring-rose focus:border-rose outline-none transition-colors"
                placeholder="your@email.com"
              />
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-foreground/30" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-foreground text-white py-3 rounded-md font-medium hover:bg-rose transition-colors flex justify-center items-center mt-4 disabled:opacity-70 shadow-sm"
          >
            {isSubmitting ? <Loader size="sm" variant="white" /> : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
}
