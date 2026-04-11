"use client";

import React from "react";
import Link from "next/link";
import { Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary/30 pt-16 pb-8 border-t border-primary/50 mt-auto">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1 border-r border-primary/50 pr-4">
            <Link href="/" className="flex flex-col mb-4 group">
              <span className="font-serif text-2xl font-bold tracking-tight leading-none group-hover:text-rose transition-colors">
                Filora Luxe
              </span>
              <span className="text-[10px] font-medium text-foreground/40 mt-1 tracking-[0.15em] uppercase">
                a brand by anshuma
              </span>
            </Link>
            <p className="text-sm text-foreground/70 mb-6 leading-relaxed text-balance">
              Handcrafted premium crochet pieces. Minimalist designs for a cohesive, beautiful lifestyle.
            </p>
            <div className="flex space-x-4 text-foreground/60">
              <a
                href="https://instagram.com/filora.luxe"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-rose transition-colors flex items-center gap-1.5 text-sm font-medium"
              >
                <span className="font-bold text-xs border border-current rounded px-1">IG</span>
                filora.luxe
              </a>
              <a
                href="mailto:filoraluxea@yahoo.com"
                className="hover:text-rose transition-colors flex items-center gap-1.5 text-sm font-medium"
              >
                <Mail className="w-4 h-4" />
                Email
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-1 border-r border-primary/50 pl-4 md:pl-8 pr-4">
            <h4 className="font-serif font-semibold mb-4 text-lg">Shop</h4>
            <ul className="space-y-3 text-sm text-foreground/70">
              <li><Link href="/shop" className="hover:text-rose transition-colors">All Products</Link></li>
              <li><Link href="/shop?category=bag" className="hover:text-rose transition-colors">Bags & Totes</Link></li>
              <li><Link href="/shop?category=hat" className="hover:text-rose transition-colors">Winter Hats</Link></li>
              <li><Link href="/shop?category=home" className="hover:text-rose transition-colors">Home Decor</Link></li>
              <li><Link href="/custom-order" className="hover:text-rose transition-colors">Custom Orders</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="md:col-span-1 border-r border-primary/50 pl-4 md:pl-8 pr-4">
            <h4 className="font-serif font-semibold mb-4 text-lg">Support</h4>
            <ul className="space-y-3 text-sm text-foreground/70">
              <li>
                <a href="mailto:filoraluxe@yahoo.com" className="hover:text-rose transition-colors">
                  Contact Us
                </a>
              </li>
              <li><Link href="/faq" className="hover:text-rose transition-colors">FAQs</Link></li>
              <li><Link href="/shipping" className="hover:text-rose transition-colors">Shipping & Returns</Link></li>
              <li><Link href="/care" className="hover:text-rose transition-colors">Product Care</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="md:col-span-1 pl-4 md:pl-8 pr-4">
            <h4 className="font-serif font-semibold mb-4 text-lg">Newsletter</h4>
            <p className="text-sm text-foreground/70 mb-4 text-balance">
              Subscribe to receive updates, access to exclusive deals, and more.
            </p>
            <form className="flex flex-col space-y-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full bg-white/50 border border-primary focus:border-rose focus:ring-1 focus:ring-rose rounded-md px-4 py-2 text-sm outline-none transition-all placeholder:text-foreground/40"
              />
              <button
                type="submit"
                className="bg-foreground text-white py-2 rounded-md text-sm font-medium hover:bg-rose transition-colors w-full"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-primary/50 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-foreground/50 gap-2">
          <p>© {new Date().getFullYear()} Filora Luxe. All rights reserved.</p>
          <p>
            <a href="mailto:filoraluxe@yahoo.com" className="hover:text-rose transition-colors">
              filoraluxe@yahoo.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
