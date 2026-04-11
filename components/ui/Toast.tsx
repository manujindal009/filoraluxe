"use client";

import React from "react";
import { useToast } from "@/context/ToastContext";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col space-y-3 pointer-events-none w-full max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg shadow-lg border backdrop-blur-md ${
              toast.type === "success"
                ? "bg-sage/10 border-sage/30 text-sage"
                : toast.type === "error"
                ? "bg-rose/10 border-rose/30 text-rose"
                : "bg-white/80 border-secondary text-foreground"
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {toast.type === "success" && <CheckCircle className="w-5 h-5 text-sage" />}
              {toast.type === "error" && <AlertCircle className="w-5 h-5 text-rose" />}
              {toast.type === "info" && <Info className="w-5 h-5 text-foreground/60" />}
            </div>
            
            <div className="flex-1 text-sm font-medium pr-4">
              {toast.message}
            </div>
            
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-foreground/40 hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
