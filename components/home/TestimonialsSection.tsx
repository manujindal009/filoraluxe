import React from "react";
import { Star } from "lucide-react";
import { testimonials } from "@/lib/data/testimonials";

export function TestimonialsSection() {
  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-3xl md:text-4xl font-serif font-semibold text-center text-foreground mb-16">
          Loved by Our Customers
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id} 
              className="bg-primary/20 rounded-2xl p-8 flex flex-col justify-between border border-primary/40 relative"
            >
              <div className="absolute -top-4 right-8 text-6xl text-rose/20 font-serif leading-none">
                "
              </div>
              <div>
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < testimonial.rating ? "fill-rose text-rose" : "text-foreground/20"}`} 
                    />
                  ))}
                </div>
                <p className="text-foreground/80 leading-relaxed italic text-balance mb-8">
                  "{testimonial.content}"
                </p>
              </div>
              
              <div>
                <p className="font-serif font-semibold text-foreground text-lg">{testimonial.name}</p>
                <p className="text-sm text-foreground/50">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
