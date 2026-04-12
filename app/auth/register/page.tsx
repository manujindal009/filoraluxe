"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Loader } from "@/components/ui/Loader";
import { Eye, EyeOff, Check, X, Mail } from "lucide-react";
import { 
  validateEmail, 
  validatePhone, 
  calculatePasswordStrength, 
  isStrictPassword 
} from "@/lib/utils/validation";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const { register, loginWithGoogle, resendVerification } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const passwordStrength = useMemo(() => 
    calculatePasswordStrength(formData.password), 
    [formData.password]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Strict Validation
    if (!formData.name.trim()) {
      addToast("Full name is required", "error");
      return;
    }

    if (!validateEmail(formData.email)) {
      addToast("Please enter a valid email address", "error");
      return;
    }

    if (!validatePhone(formData.phone)) {
      addToast("Please enter a valid 10-digit Indian phone number", "error");
      return;
    }

    if (!isStrictPassword(formData.password)) {
      addToast("Password does not meet the security requirements", "error");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      addToast("Passwords do not match", "error");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await register(formData.email, formData.password, formData.name, formData.phone);
      setVerificationSent(true);
      addToast("Account created! Please check your email and verify.", "success");
    } catch (error: any) {
      console.error("Signup error:", error);
      addToast(error.message || "Failed to create account", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    try {
      await resendVerification(formData.email);
      addToast("Verification email resent!", "success");
    } catch (err) {
      addToast("Failed to resend email", "error");
    }
  };

  if (verificationSent) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-10 md:py-20 flex justify-center items-center flex-1 min-h-[70vh]">
        <div className="w-full max-w-md bg-white p-6 md:p-8 rounded-xl border border-secondary shadow-lg text-center">
          <div className="w-16 h-16 bg-rose/10 rounded-full flex items-center justify-center mx-auto mb-6 text-rose">
            <Mail className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-serif font-semibold mb-4">Verify Your Email</h1>
          <p className="text-foreground/70 mb-8">
            We've sent a verification link to <span className="font-semibold text-foreground">{formData.email}</span>. 
            Please check your inbox (and spam folder) to activate your account.
          </p>
          <div className="space-y-4">
            <button
              onClick={handleResend}
              className="w-full bg-foreground text-white py-3 rounded-md font-medium hover:bg-rose transition-colors"
            >
              Resend Email
            </button>
            <Link 
              href="/auth/login" 
              className="block w-full py-3 rounded-md font-medium border border-secondary hover:bg-secondary/20 transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-10 md:py-20 flex justify-center items-center flex-1 min-h-[70vh]">
      <div className="w-full max-w-md bg-white p-6 md:p-8 rounded-xl border border-secondary shadow-sm">
        <h1 className="text-3xl font-serif font-semibold text-center mb-6">Create Account</h1>
        <p className="text-center text-foreground/60 mb-8 text-sm">
          Join Filora Luxe for a premium, personalized experience.
        </p>

        {/* OAuth Section */}
        <div className="mb-6">
          <button
            type="button"
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1">Full Name</label>
            <input
              required
              type="text"
              name="name"
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full border border-secondary rounded-md px-4 py-2 bg-white focus:ring-1 focus:ring-rose focus:border-rose outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1">Phone Number</label>
            <div className="relative">
              <span className="absolute left-4 top-2 text-foreground/40">+91</span>
              <input
                required
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full border border-secondary rounded-md pl-12 pr-4 py-2 bg-white focus:ring-1 focus:ring-rose focus:border-rose outline-none transition-colors"
                placeholder="9876543210"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1">Email</label>
            <input
              required
              type="email"
              name="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full border border-secondary rounded-md px-4 py-2 bg-white focus:ring-1 focus:ring-rose focus:border-rose outline-none transition-colors"
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-foreground/80 mb-1">Password</label>
            <div className="relative">
              <input
                required
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full border border-secondary rounded-md px-4 py-2 bg-white focus:ring-1 focus:ring-rose focus:border-rose outline-none transition-colors pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-foreground/40 hover:text-rose transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            {/* Strength Meter */}
            {formData.password && (
              <div className="mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-foreground/40">Strength: {passwordStrength.label}</span>
                </div>
                <div className="h-1 w-full bg-secondary rounded-full overflow-hidden flex">
                  {[...Array(4)].map((_, i) => (
                    <div 
                      key={i}
                      className={`h-full flex-1 border-r border-white last:border-0 transition-all duration-500 ${
                        i <= passwordStrength.score 
                          ? passwordStrength.score === 0 ? "bg-red-400" :
                            passwordStrength.score === 1 ? "bg-orange-400" :
                            passwordStrength.score === 2 ? "bg-yellow-400" : "bg-green-500"
                          : "bg-transparent"
                      }`}
                    />
                  ))}
                </div>
                
                {/* Rules Checklist */}
                <div className="grid grid-cols-2 gap-x-2 mt-2">
                  <RuleItem met={passwordStrength.checks.length} label="8+ Characters" />
                  <RuleItem met={passwordStrength.checks.upper} label="Uppercase" />
                  <RuleItem met={passwordStrength.checks.lower} label="Lowercase" />
                  <RuleItem met={passwordStrength.checks.number} label="Number" />
                  <RuleItem met={passwordStrength.checks.special} label="Special Char" />
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-foreground/80 mb-1">Confirm Password</label>
            <div className="relative">
              <input
                required
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full border border-secondary rounded-md px-4 py-2 bg-white focus:ring-1 focus:ring-rose focus:border-rose outline-none transition-colors pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-2.5 text-foreground/40 hover:text-rose transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-foreground text-white py-3 rounded-md font-medium hover:bg-rose transition-colors flex justify-center items-center mt-6 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm hover:shadow-md active:scale-[0.98]"
          >
            {isSubmitting ? <Loader size="sm" variant="white" /> : "Create Account"}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-secondary text-center">
          <p className="text-sm text-foreground/70">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-rose font-medium hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function RuleItem({ met, label }: { met: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors ${met ? "text-green-600" : "text-foreground/30"}`}>
      {met ? <Check size={10} strokeWidth={3} /> : <X size={10} strokeWidth={3} />}
      {label}
    </div>
  );
}
