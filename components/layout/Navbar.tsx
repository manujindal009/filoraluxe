"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, X, User } from "lucide-react";
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

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "Custom Orders", href: "/custom-order" },
  ];

  return (
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
            className="md:hidden text-foreground/80"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md shadow-lg border-t border-secondary py-4 px-4 flex flex-col space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-base font-medium py-2 border-b border-secondary/50"
            >
              {link.label}
            </Link>
          ))}
          {user?.role === 'admin' && (
            <Link href="/admin" className="text-base font-medium py-2 border-b border-secondary/50 text-rose">
              Admin Dashboard
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
