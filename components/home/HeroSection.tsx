"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="relative h-[90vh] min-h-[600px] flex items-center bg-primary overflow-hidden w-full">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-secondary/50 rounded-l-[100px] -z-0 opacity-50 hidden md:block"></div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10 w-full h-full">
        <div className="flex flex-col md:flex-row items-center justify-between h-full w-full gap-8">
          
          <motion.div 
            className="w-full md:w-1/2 flex flex-col justify-center text-center md:text-left h-full"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="text-rose font-medium tracking-wider uppercase text-sm mb-4">
              New Collection
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-semibold text-foreground mb-6 leading-[1.2] md:leading-[1.1] text-balance">
              Handcrafted <br className="hidden md:block"/> 
              <span className="italic font-light">elegance</span> for your <br className="hidden md:block"/> everyday.
            </h1>
            <p className="text-foreground/70 text-base md:text-xl mb-10 max-w-lg mx-auto md:mx-0 text-balance">
              Discover our premium collection of minimal, beautifully crocheted pieces designed to elevate your lifestyle.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
              <Link 
                href="/shop" 
                className="bg-foreground text-white px-8 py-4 rounded-md font-medium hover:bg-rose transition-colors w-full sm:w-auto shadow-lg"
              >
                Shop Now
              </Link>
              <Link 
                href="/custom-order" 
                className="bg-transparent text-foreground border border-foreground/20 px-8 py-4 rounded-md font-medium hover:bg-white hover:border-white transition-all w-full sm:w-auto"
              >
                Custom Order
              </Link>
            </div>
          </motion.div>

          <motion.div 
            className="w-full md:w-1/2 h-[50vh] md:h-full relative mt-8 md:mt-0"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          >
            <div className="absolute inset-0 md:inset-y-12 md:right-0 md:left-12 rounded-t-full md:rounded-l-full md:rounded-tr-none overflow-hidden mt-auto md:my-auto h-full w-full max-h-[800px] max-w-[800px] mx-auto">
              <img 
                src="https://mpewokuvkijukarwcgci.supabase.co/storage/v1/object/public/products/homepage/WhatsApp%20Image%202026-04-10%20at%2018.36.53.jpeg" 
                alt="Filora Luxe handcrafted crochet bag" 
                className="object-cover w-full h-full brightness-110"
              />
            </div>
            {/* Floating trust badge */}
            <motion.div 
              className="absolute bottom-12 left-4 md:left-0 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl flex items-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
            >
              <div className="flex -space-x-2">
                {["🌸", "🧶", "✨"].map((emoji, i) => (
                  <div key={i} className="w-9 h-9 rounded-full bg-primary border-2 border-white flex items-center justify-center text-sm">
                    {emoji}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-serif font-semibold text-foreground">100+ Happy Customers</p>
                <p className="text-xs text-foreground/50">Handcrafted with ❤️ in India</p>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
