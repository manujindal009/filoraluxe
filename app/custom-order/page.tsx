"use client";

import React, { useState } from "react";
import { Upload, MessageSquare, Info } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { Loader } from "@/components/ui/Loader";
import { submitCustomOrderRequest } from "@/lib/api/custom-orders";

export default function CustomOrderPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    description: "",
    budget: "",
    timeline: "",
    imageFile: null as File | null,
    imageUrl: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, imageFile: e.target.files![0] }));
    }
  };

  const openWhatsApp = () => {
    const message = `Hello Filora Luxe! I'm interested in a custom piece.\n\nName: ${formData.name}\nDescription: ${formData.description}\nBudget: ${formData.budget}\nTimeline: ${formData.timeline}\n\nI'm having trouble uploading my reference image, here it is:`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/919888812872?text=${encoded}`, "_blank");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let uploadedUrl = "";
      if (formData.imageFile) {
        try {
          const { uploadFile } = await import("@/lib/api/storage");
          uploadedUrl = await uploadFile(formData.imageFile, "custom-order-images");
        } catch (uploadErr) {
          console.error("Upload failed, showing fallback:", uploadErr);
          addToast("Image upload failed. You can send it via WhatsApp instead.", "warning");
          // We continue anyway, they can send via WhatsApp
        }
      }

      await submitCustomOrderRequest({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        description: formData.description,
        budget: formData.budget,
        timeline: formData.timeline,
        image_url: uploadedUrl || null
      });
      
      addToast("Request submitted successfully! We'll be in touch soon.", "success");
      setFormData({
        name: "",
        email: "",
        phone: "",
        description: "",
        budget: "",
        timeline: "",
        imageFile: null,
        imageUrl: ""
      });
    } catch (error) {
      console.error("Submission failed:", error);
      addToast("Failed to submit request. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
      <div className="max-w-3xl mx-auto flex flex-col items-center mb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-serif font-semibold text-foreground mb-6 text-balance">
          Request a Custom Piece
        </h1>
        <p className="text-foreground/70 text-lg max-w-2xl text-balance">
          Have something unique in mind? Describe your vision, and we'll handcraft it exclusively for you. Custom orders typically take 1-2 weeks to complete.
        </p>
      </div>

      <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-12">
        <div className="w-full md:w-1/3 space-y-8">
          <div className="bg-primary/20 p-6 rounded-xl border border-primary/50">
            <h3 className="font-serif font-semibold text-lg mb-3">How it works</h3>
            <ol className="space-y-4 text-sm text-foreground/80 list-decimal pl-4">
              <li className="pl-2">Submit your request with details and reference images.</li>
              <li className="pl-2">We'll review and email you a precise quote and timeline within 48 hours.</li>
              <li className="pl-2">Once approved, a 50% deposit is required to begin production.</li>
              <li className="pl-2">We'll send updates as we craft your piece.</li>
              <li className="pl-2">Final payment is due before shipping.</li>
            </ol>
          </div>

          <div className="bg-secondary/30 p-4 rounded-xl flex items-start gap-4">
            <div className="p-2 bg-white rounded-full flex-shrink-0">
              <Info className="w-5 h-5 text-foreground/60" />
            </div>
            <p className="text-xs text-foreground/60 leading-relaxed">
              Minimum budget for custom pieces is ₹100. Complex garments like intricate sweeps or large afghans may require a minimum of ₹4000.
            </p>
          </div>
        </div>

        <div className="w-full md:w-2/3 bg-white p-6 md:p-8 rounded-xl border border-secondary shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Full Name</label>
                <input
                  required
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border border-secondary rounded-md px-4 py-2 bg-white focus:ring-1 focus:ring-rose focus:border-rose outline-none transition-colors"
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Email</label>
                <input
                  required
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border border-secondary rounded-md px-4 py-2 bg-white focus:ring-1 focus:ring-rose focus:border-rose outline-none transition-colors"
                  placeholder="jane@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Phone Number</label>
                <input
                  required
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full border border-secondary rounded-md px-4 py-2 bg-white focus:ring-1 focus:ring-rose focus:border-rose outline-none transition-colors"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1 flex items-center justify-between">
                <span>Description of your piece</span>
                <span className="text-xs text-foreground/40 font-normal">In as much detail as possible</span>
              </label>
              <textarea
                required
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={6}
                className="w-full border border-secondary rounded-md px-4 py-3 bg-white focus:ring-1 focus:ring-rose focus:border-rose outline-none transition-colors resize-none"
                placeholder="I would like a thick winter blanket in a chevron pattern. Colors: Sage green, cream, and a soft yellow. Approximate size: 60x80 inches..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Estimated Budget</label>
                <select
                  required
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  className="w-full border border-secondary rounded-md px-4 py-2 bg-white focus:ring-1 focus:ring-rose focus:border-rose outline-none transition-colors"
                >
                  <option value="" disabled>Select a range</option>
                  <option value="150-300">₹100 - ₹300</option>
                  <option value="300-500">₹300 - ₹700</option>
                  <option value="500-1000">₹700 - ₹1,000</option>
                  <option value="1000+">₹1,000+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Desired Timeline</label>
                <select
                  required
                  name="timeline"
                  value={formData.timeline}
                  onChange={handleInputChange}
                  className="w-full border border-secondary rounded-md px-4 py-2 bg-white focus:ring-1 focus:ring-rose focus:border-rose outline-none transition-colors"
                >
                  <option value="" disabled>Select deadline</option>
                  <option value="flexible">Flexible (No rush)</option>
                  <option value="1-month">Within 1 month</option>
                  <option value="2-months">Within 2 months</option>
                  <option value="specific">Specific date (Add to description)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-2">Reference Images</label>
              <div className="relative border border-dashed border-secondary rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-secondary/10 transition-colors bg-white">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-3">
                  <Upload className="w-5 h-5 text-foreground/60" />
                </div>
                <p className="text-sm font-medium text-foreground/80">
                  {formData.imageFile ? formData.imageFile.name : "Click to upload or drag and drop"}
                </p>
                <p className="text-xs text-foreground/50 mt-1">PNG, JPG or PDF (MAX. 5MB)</p>
              </div>
              
              <div className="mt-4 p-4 bg-primary/10 rounded-lg flex items-center justify-between">
                <p className="text-xs text-foreground/70">Having trouble uploading?</p>
                <button 
                  type="button" 
                  onClick={openWhatsApp}
                  className="text-xs font-semibold text-rose hover:underline flex items-center gap-1"
                >
                  <MessageSquare className="w-3 h-3" />
                  Send via WhatsApp
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-foreground text-white py-4 rounded-md font-medium hover:bg-rose transition-colors flex justify-center items-center h-14 disabled:bg-foreground/70"
            >
              {isSubmitting ? <Loader size="sm" /> : (
                <span className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Submit Request
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
