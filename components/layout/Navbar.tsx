"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, X, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "Custom Orders", href: "/custom-order" },
  ];

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled ? "glass py-3" : "bg-transparent py-5"
        )}
      >
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex flex-col">
            <span className="font-serif text-xl md:text-2xl font-bold tracking-tight leading-none hover:text-rose transition-colors">
              Filora Luxe
            </span>
            <span className="text-[9px] font-medium text-foreground/40 mt-0.5 tracking-[0.1em] uppercase">
              a brand by anshuma
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-rose",
                  pathname === link.href ? "text-rose" : "text-foreground/80"
                )}
              >
                {link.label}
              </Link>
            ))}
            {user?.role === 'admin' && (
              <Link
                href="/admin"
                className={cn(
                  "text-sm font-bold transition-colors hover:text-rose text-rose bg-rose/5 px-3 py-1.5 rounded-full border border-rose/20",
                  pathname.startsWith("/admin") ? "bg-rose/10" : ""
                )}
              >
                Admin
              </Link>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-5">
            <Link href={user ? "/profile" : "/auth/login"} className="text-foreground/80 hover:text-rose transition-colors">
              <User className="w-5 h-5" strokeWidth={1.5} />
            </Link>
            <Link href="/cart" className="text-foreground/80 hover:text-rose transition-colors relative group">
              <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center transition-transform group-hover:scale-110">
                  {itemCount}
                </span>
              )}
            </Link>
            <button
              className="md:hidden text-foreground/80 z-[101]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>
      </header>

      {/* Full-Screen Mobile Menu */}
      <div 
        className={cn(
          "fixed inset-0 z-[100] bg-white transition-all duration-500 ease-in-out md:hidden",
          mobileMenuOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-5 pointer-events-none"
        )}
      >
        <div className="flex flex-col items-center justify-center h-full space-y-8 px-6 text-center">
          <div className="flex flex-col items-center mb-8">
            <span className="font-serif text-3xl font-bold tracking-tight text-rose">Filora Luxe</span>
            <span className="text-xs font-medium text-foreground/40 mt-1 tracking-[0.2em] uppercase">a brand by anshuma</span>
          </div>
          
          <nav className="flex flex-col space-y-6">
            <AnimatePresence>
              {mobileMenuOpen && (
                <>
                  {navLinks.map((link, i) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                    >
                      <Link
                        href={link.href}
                        className={cn(
                          "text-2xl font-serif font-medium transition-all duration-300",
                          pathname === link.href ? "text-rose translate-x-1" : "text-foreground/80"
                        )}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}
                  {user?.role === 'admin' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + navLinks.length * 0.1, duration: 0.5 }}
                    >
                      <Link 
                        href="/admin" 
                        className="text-2xl font-serif font-medium text-rose"
                      >
                        Admin Dashboard
                      </Link>
                    </motion.div>
                  )}
                </>
              )}
            </AnimatePresence>
            
            <div className="pt-8 flex flex-col items-center space-y-6">
              <Link 
                href={user ? "/profile" : "/auth/login"} 
                className="w-48 py-3 px-6 bg-foreground text-white rounded-full font-medium transition-all active:scale-95"
              >
                {user ? "My Account" : "Sign In"}
              </Link>
              <div className="flex space-x-6 text-foreground/40 text-sm italic">
                <span>Handmade</span>
                <span className="h-4 w-px bg-foreground/10" />
                <span>Luxury</span>
                <span className="h-4 w-px bg-foreground/10" />
                <span>Crochet</span>
              </div>
            </div>
          </nav>

          <div className="absolute bottom-12 left-0 right-0 text-center">
             <p className="text-[10px] uppercase tracking-widest text-foreground/30">Based in India • Worldwide Shipping</p>
          </div>
        </div>
      </div>
    </>
  );
}
