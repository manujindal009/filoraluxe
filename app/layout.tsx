import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Providers } from "@/components/layout/Providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { ToastContainer } from "@/components/ui/Toast";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Filora Luxe | Premium Crochet Designs",
  description: "Handcrafted, premium crochet bags, hats, and accessories. Experience the soft, minimal, and premium quality.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased min-h-screen flex flex-col relative text-balance">
        <Providers>
          <Navbar />
          <main className="flex-1 flex flex-col pt-20">
            {children}
          </main>
          <Footer />
          <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
          <ToastContainer />
          <WhatsAppButton />
        </Providers>
      </body>
    </html>
  );
}
