import React from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "What materials do you use?",
    a: "We use 100% natural cotton, soft merino wool, and premium acrylic blends. All materials are ethically sourced and skin-friendly.",
  },
  {
    q: "How long does it take to make a custom order?",
    a: "Custom orders typically take 7–14 business days depending on complexity. You'll receive updates throughout the process.",
  },
  {
    q: "Do you ship internationally?",
    a: "Yes! We ship worldwide. International shipping typically takes 10–20 business days. Customs and duties may apply depending on your country.",
  },
  {
    q: "What is your return policy?",
    a: "We accept returns within 14 days of delivery for unused items in original condition. Custom orders are non-refundable. Please see our Shipping & Returns page for full details.",
  },
  {
    q: "Can I request a custom colour or size?",
    a: "Absolutely! Use our Custom Order page to describe exactly what you want — colours, size, style, and any special details.",
  },
  {
    q: "How do I care for my crochet item?",
    a: "Hand wash in cold water using mild detergent. Lay flat to dry. Avoid machine washing and direct heat. See our Product Care page for complete guidance.",
  },
  {
    q: "Do you offer gift wrapping?",
    a: "Yes! Add a note at checkout and we'll include a hand-tied ribbon wrap and a personal message card at no extra charge.",
  },
];

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-16 max-w-3xl">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-serif font-semibold text-foreground mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-foreground/60 text-balance">
          Everything you need to know about Filora Luxe. Can't find your answer?{" "}
          <a href="mailto:filoraluxea@yahoo.com" className="text-rose hover:underline">
            Email us
          </a>
          .
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <details
            key={i}
            className="group bg-white border border-secondary rounded-xl overflow-hidden"
          >
            <summary className="flex items-center justify-between gap-4 px-6 py-4 cursor-pointer list-none font-medium text-foreground hover:text-rose transition-colors">
              {faq.q}
              <ChevronDown className="w-4 h-4 flex-shrink-0 transition-transform group-open:rotate-180" />
            </summary>
            <div className="px-6 pb-5 text-sm text-foreground/70 leading-relaxed border-t border-secondary pt-4">
              {faq.a}
            </div>
          </details>
        ))}
      </div>

      <div className="mt-16 bg-primary/20 border border-primary/40 rounded-xl p-8 text-center">
        <h2 className="font-serif font-semibold text-2xl mb-2">Still have questions?</h2>
        <p className="text-foreground/60 text-sm mb-4">
          We typically respond within 24 hours.
        </p>
        <a
          href="mailto:filoraluxe@yahoo.com"
          className="inline-block bg-foreground text-white px-6 py-3 rounded-md font-medium hover:bg-rose transition-colors text-sm"
        >
          filoraluxe@yahoo.com
        </a>
      </div>
    </div>
  );
}
