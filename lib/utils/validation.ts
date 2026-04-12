/**
 * Production-ready validation utilities for Filora Luxe Auth
 */

/**
 * Validates email format
 */
export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
};

/**
 * Validates Indian phone number format
 * Matches: 10 digits, starts with 6-9
 */
export const validatePhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\D/g, "");
  return /^[6-9]\d{9}$/.test(cleanPhone);
};

/**
 * Password complexity rules:
 * - Minimum 8 characters
 * - At least 1 uppercase
 * - At least 1 lowercase
 * - At least 1 number
 * - At least 1 special character
 */
export interface PasswordStrength {
  score: number; // 0 to 4
  label: "Weak" | "Fair" | "Medium" | "Strong";
  checks: {
    length: boolean;
    upper: boolean;
    lower: boolean;
    number: boolean;
    special: boolean;
  };
}

export const calculatePasswordStrength = (password: string): PasswordStrength => {
  const checks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length - 1; // 0 to 4
  const finalScore = Math.max(0, score);
  
  const labels: PasswordStrength["label"][] = ["Weak", "Fair", "Medium", "Strong"];
  
  return {
    score: finalScore,
    label: labels[finalScore] || "Weak",
    checks,
  };
};

/**
 * Checks if password strictly meets all production requirements
 */
export const isStrictPassword = (password: string): boolean => {
  const { checks } = calculatePasswordStrength(password);
  return Object.values(checks).every(Boolean);
};
