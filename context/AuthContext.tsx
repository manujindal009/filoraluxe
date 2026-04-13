"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User as AppUser } from "@/types";
import { supabase } from "@/lib/supabaseClient";

interface AuthContextType {
  user: AppUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, name: string, phone: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (name: string, phone: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check active session with resilient error handling
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          // If refresh token is missing or invalid, purge the local session data
          if (error.message.includes("refresh_token") || error.message.includes("not found")) {
            console.warn("[AuthContext] Invalid session detected, signing out to reset state.");
            await supabase.auth.signOut();
          } else {
            console.error("[AuthContext] Session check error:", error.message);
          }
          setIsLoading(false);
          return;
        }

        if (session) {
          fetchUserProfile(session.user.id);
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        console.error("[AuthContext] Unexpected initialization error:", err);
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        fetchUserProfile(session.user.id);
      } else {
        // Handle cases where the session might have been revoked remotely
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // PGRST116 = row not found
      if (error && error.code === 'PGRST116') {
        console.error(
          '[AuthContext] No profile found for this user.\n' +
          'Fix: Run supabase_fix_profiles.sql in your Supabase SQL Editor.\n' +
          `User ID: ${userId}`
        );
        // Sign them out cleanly so they're not stuck in a broken state
        await supabase.auth.signOut();
        setUser(null);
        return;
      }

      if (error) {
        console.error('[AuthContext] Profile fetch error:', error.code, error.message);
        setUser(null);
        return;
      }

      setUser({
        id: data.id,
        email: data.email,
        name: data.name,
        phone: data.phone,
        role: data.role,
        createdAt: data.created_at,
      });
    } catch (err) {
      console.error('[AuthContext] Unexpected error:', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const cleanEmail = email.trim();
    const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
    
    if (error) {
      if (error.message.includes("Email not confirmed")) {
        throw new Error("unverified");
      }
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string, phone: string) => {
    const cleanEmail = email.trim();
    const cleanName = name.trim();
    const cleanPhone = phone.replace(/\D/g, "");

    const { error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: cleanName,
          phone: cleanPhone,
        }
      }
    });
    if (error) throw error;
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) throw error;
  };

  const resendVerification = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
    });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };
  
  const updateProfile = async (name: string, phone: string) => {
    if (!user) throw new Error("Not authenticated");
    
    const { error } = await supabase
      .from('profiles')
      .update({ name: name.trim(), phone: phone.replace(/\D/g, "") })
      .eq('id', user.id);
      
    if (error) throw error;
    
    // Refresh local user state
    await fetchUserProfile(user.id);
  };
  
  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, isLoading, login, loginWithGoogle, register, logout, updateProfile, updatePassword, isAdmin, resendVerification } as any}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
