import React from "react";
import Link from "next/link";

export function CTABanner() {
  return (
    <section className="py-24 relative overflow-hidden bg-rose text-white">
      {/* Decorative background elements */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-foreground/10 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10 text-center max-w-3xl">
        <h2 className="text-4xl md:text-5xl font-serif font-semibold mb-6 text-balance">
          Ready to experience the softness?
        </h2>
        <p className="text-white/80 text-lg mb-10 text-balance">
          Join thousands of customers who have elevated their daily routine with our timeless, handcrafted crochet collections.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link 
            href="/shop" 
            className="bg-white text-rose px-8 py-4 rounded-md font-medium hover:bg-primary transition-colors shadow-lg w-full sm:w-auto"
          >
            Explore the Shop
          </Link>
          <Link 
            href="/custom-order" 
            className="bg-transparent border border-white/50 text-white px-8 py-4 rounded-md font-medium hover:bg-white/10 transition-colors w-full sm:w-auto"
          >
            Request Custom Piece
          </Link>
        </div>
      </div>
    </section>
  );
}
