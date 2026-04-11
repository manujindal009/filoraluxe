"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User as AppUser } from "@/types";
import { supabase } from "@/lib/supabaseClient";

interface AuthContextType {
  user: AppUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, phone: string) => Promise<void>;
  logout: () => Promise<void>;
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
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const register = async (email: string, password: string, name: string, phone: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          phone: phone,
        }
      }
    });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, isAdmin }}>
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
