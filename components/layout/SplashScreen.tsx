"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function SplashScreen() {
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check if user has visited in this session using sessionStorage
    const hasVisited = sessionStorage.getItem("hasVisited");
    
    if (!hasVisited) {
      setShow(true);
      sessionStorage.setItem("hasVisited", "true");
      
      // Fallback safety: ensure splash screen hides after 4 seconds max
      const timer = setTimeout(() => {
        setShow(false);
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  // Hydration safety: only render on the client
  if (!mounted) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="splash-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
        >
          {/* Split Background - Curtain Reveal */}
          <motion.div 
            initial={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.8, ease: [0.77, 0, 0.175, 1] }}
            className="absolute inset-y-0 left-0 w-1/2 bg-white"
          />
          <motion.div 
            initial={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.8, ease: [0.77, 0, 0.175, 1] }}
            className="absolute inset-y-0 right-0 w-1/2 bg-white"
          />

          {/* Floating background elements for texture */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  opacity: 0, 
                  x: (i * 20) + "%", 
                  y: "110%" 
                }}
                animate={{ 
                  opacity: [0, 0.15, 0],
                  y: "-10%" 
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  delay: i * 0.7,
                  ease: "linear"
                }}
                className="absolute w-32 h-32 md:w-48 md:h-48 rounded-full border border-rose/10 flex items-center justify-center p-8"
              >
                <div className="w-full h-full border border-rose/5 rounded-full animate-pulse" />
              </motion.div>
            ))}
          </div>

          {/* Cinematic Logo Container */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0, filter: "blur(10px)" }}
            animate={{ 
              scale: [0.7, 1.1, 1],
              opacity: 1,
              filter: "blur(0px)"
            }}
            exit={{ scale: 1.4, opacity: 0, filter: "blur(20px)" }}
            transition={{ 
              duration: 1.8,
              ease: "easeOut"
            }}
            onAnimationComplete={() => {
              // Trigger the curtain reveal once logo entry is complete
              setTimeout(() => setShow(false), 200);
            }}
            className="relative z-10 w-64 h-64 md:w-80 md:h-80 flex items-center justify-center p-8"
          >
            {/* Logo Image */}
            <div className="relative w-full h-full">
              <img 
                src="/logo.png" 
                alt="Filora Luxe & Co." 
                className="w-full h-full object-contain filter drop-shadow-2xl relative z-10"
                onError={() => setShow(false)}
              />
              
              {/* Shimmer Effect */}
              <motion.div 
                className="absolute inset-0 z-20 pointer-events-none overflow-hidden mix-blend-overlay"
                initial={{ x: "-100%", opacity: 0 }}
                animate={{ x: "200%", opacity: [0, 1, 0] }}
                transition={{ 
                  duration: 1.2, 
                  delay: 1.0, 
                  ease: "easeInOut"
                }}
              >
                <div className="w-full h-full bg-gradient-to-r from-transparent via-white/80 to-transparent skew-x-12" />
              </motion.div>
            </div>
            
            {/* Background Glow */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.2, opacity: [0, 0.4, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-rose/10 blur-3xl rounded-full"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
