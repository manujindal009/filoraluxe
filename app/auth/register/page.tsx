"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Loader } from "@/components/ui/Loader";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic Indian Phone Validation
    const cleanPhone = formData.phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      addToast("Please enter a valid 10-digit phone number", "error");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await register(formData.email, formData.password, formData.name, formData.phone);
      
      addToast("Account created successfully!", "success");
      router.push("/profile");
    } catch (error) {
      addToast("Failed to create account", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-20 flex justify-center items-center flex-1 min-h-[70vh]">
      <div className="w-full max-w-md bg-white p-8 rounded-xl border border-secondary shadow-sm">
        <h1 className="text-3xl font-serif font-semibold text-center mb-6">Create Account</h1>
        <p className="text-center text-foreground/60 mb-8 text-sm">
          Join us to enjoy a seamless checkout experience and track your orders.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1">Full Name</label>
            <input
              required
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full border border-secondary rounded-md px-4 py-2 bg-white focus:ring-1 focus:ring-rose focus:border-rose outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1">Phone Number</label>
            <input
              required
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full border border-secondary rounded-md px-4 py-2 bg-white focus:ring-1 focus:ring-rose focus:border-rose outline-none transition-colors"
              placeholder="+91 98888 12345"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1">Email</label>
            <input
              required
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full border border-secondary rounded-md px-4 py-2 bg-white focus:ring-1 focus:ring-rose focus:border-rose outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1">Password</label>
            <input
              required
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full border border-secondary rounded-md px-4 py-2 bg-white focus:ring-1 focus:ring-rose focus:border-rose outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-foreground text-white py-3 rounded-md font-medium hover:bg-rose transition-colors flex justify-center items-center mt-4 disabled:opacity-70"
          >
            {isSubmitting ? <Loader size="sm" /> : "Create Account"}
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
