"use client";

import React from "react";
import { MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export function WhatsAppButton() {
  const pathname = usePathname();
  // Don't show WhatsApp button on admin pages or checkout to minimize distractions
  const shouldHide = pathname.startsWith("/admin") || pathname.startsWith("/checkout");

  if (shouldHide) return null;

  const phoneNumber = "919888812872"; // +91 98888 12872
  const message = "Hi Filora Luxe! I'm interested in your crochet products 🧶";
  const waUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <AnimatePresence>
      <motion.a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center group"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute right-full mr-4 bg-white text-foreground px-3 py-1.5 rounded-md text-sm font-medium shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Message us
        </span>
      </motion.a>
    </AnimatePresence>
  );
}
