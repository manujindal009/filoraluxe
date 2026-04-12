"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/context/ToastContext";
import { Loader } from "@/components/ui/Loader";
import { Eye, EyeOff, Check, X, ShieldCheck } from "lucide-react";
import { 
  calculatePasswordStrength, 
  isStrictPassword 
} from "@/lib/utils/validation";

export default function ResetPasswordPage() {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
    
    if (!isStrictPassword(formData.password)) {
      addToast("Password doesn't meet safety requirements", "error");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      addToast("Passwords do not match", "error");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      });

      if (error) throw error;
      
      addToast("Password updated successfully!", "success");
      router.push("/auth/login");
    } catch (error: any) {
      console.error("Reset error:", error.message);
      addToast(error.message || "Failed to reset password", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-20 flex justify-center items-center flex-1 min-h-[70vh]">
      <div className="w-full max-w-md bg-white p-8 rounded-xl border border-secondary shadow-lg">
        <div className="w-12 h-12 bg-rose/10 rounded-full flex items-center justify-center mb-6 text-rose">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-serif font-semibold mb-2">Reset Password</h1>
        <p className="text-foreground/60 mb-8 text-sm">
          Set a strong, new password for your account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <label className="block text-sm font-medium text-foreground/80 mb-1">New Password</label>
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
              <div className="mt-3">
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
                <div className="grid grid-cols-2 gap-x-1 gap-y-1.5 mt-2">
                  <RuleItem met={passwordStrength.checks.length} label="8+ Characters" />
                  <RuleItem met={passwordStrength.checks.upper} label="Uppercase" />
                  <RuleItem met={passwordStrength.checks.lower} label="Lowercase" />
                  <RuleItem met={passwordStrength.checks.number} label="Number" />
                  <RuleItem met={passwordStrength.checks.special} label="Special Char" />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1">Confirm New Password</label>
            <input
              required
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full border border-secondary rounded-md px-4 py-2 bg-white focus:ring-1 focus:ring-rose focus:border-rose outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-foreground text-white py-3 rounded-md font-medium hover:bg-rose transition-colors flex justify-center items-center disabled:opacity-70 shadow-sm"
          >
            {isSubmitting ? <Loader size="sm" variant="white" /> : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

function RuleItem({ met, label }: { met: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-1.5 text-[10px] font-semibold transition-colors ${met ? "text-green-600" : "text-foreground/30"}`}>
      {met ? <Check size={10} strokeWidth={3} /> : <X size={10} strokeWidth={3} />}
      {label}
    </div>
  );
}
