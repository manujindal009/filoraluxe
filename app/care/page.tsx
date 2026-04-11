import React from "react";
import { Droplets, Sun, Wind, Scissors } from "lucide-react";

const tips = [
  {
    icon: Droplets,
    title: "Washing",
    color: "bg-blue-50 text-blue-500",
    points: [
      "Hand wash only in cool water (max 30°C)",
      "Use a gentle, pH-neutral detergent",
      "Never wring or twist the item",
      "Rinse thoroughly until water runs clear",
    ],
  },
  {
    icon: Sun,
    title: "Drying",
    color: "bg-amber-50 text-amber-500",
    points: [
      "Always lay flat on a clean towel to dry",
      "Reshape gently while damp",
      "Keep out of direct sunlight to prevent fading",
      "Never tumble dry or hang — it can stretch the fabric",
    ],
  },
  {
    icon: Wind,
    title: "Storage",
    color: "bg-green-50 text-green-500",
    points: [
      "Fold and store in a breathable cotton bag",
      "Avoid plastic bags — they trap moisture",
      "Keep away from direct heat and damp areas",
      "Add a cedar block to deter moths naturally",
    ],
  },
  {
    icon: Scissors,
    title: "Maintenance",
    color: "bg-rose/10 text-rose",
    points: [
      "Snip any loose threads — never pull them",
      "Use a fabric shaver on pilling areas",
      "Steam lightly to refresh shape (do not iron)",
      "Treat stains immediately with cold water",
    ],
  },
];

export default function CarePage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-16 max-w-4xl">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-serif font-semibold text-foreground mb-4">
          Product Care Guide
        </h1>
        <p className="text-foreground/60 max-w-xl mx-auto text-balance">
          Your Filora Luxe piece is crafted by hand with love. With the right care, it will stay beautiful for years to come.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {tips.map((section) => (
          <div key={section.title} className="bg-white border border-secondary rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${section.color.split(" ")[0]}`}>
                <section.icon className={`w-5 h-5 ${section.color.split(" ")[1]}`} />
              </div>
              <h2 className="font-serif font-semibold text-xl">{section.title}</h2>
            </div>
            <ul className="space-y-2">
              {section.points.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/70">
                  <span className="w-1.5 h-1.5 rounded-full bg-foreground/30 mt-2 flex-shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="bg-primary/20 border border-primary/40 rounded-xl p-8">
        <h2 className="font-serif font-semibold text-2xl mb-3">Material-Specific Notes</h2>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-foreground/70">
          <div>
            <h3 className="font-semibold text-foreground mb-1">Cotton</h3>
            <p>Machine wash cold on gentle cycle if label permits. Air dry flat. Colours may slightly lighten over time — this is natural.</p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">Wool / Merino</h3>
            <p>Hand wash only. Use wool-specific detergent. Block to shape while damp. Store folded — never hung.</p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">Acrylic Blend</h3>
            <p>Most forgiving — gentle machine wash is usually fine. Avoid high heat. Do not iron directly.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
