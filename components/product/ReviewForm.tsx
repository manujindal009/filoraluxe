"use client";

import React, { useState } from "react";
import { Star, Send } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { submitReview } from "@/lib/api/reviews";
import { Loader } from "@/components/ui/Loader";

interface ReviewFormProps {
  productId: string;
  onSuccess?: () => void;
}

export function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      addToast("Please sign in to leave a review", "error");
      return;
    }

    if (rating === 0) {
      addToast("Please select a star rating", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitReview(productId, user.id, user.name, rating, comment);
      addToast("Thank you! Your review has been submitted.", "success");
      setRating(0);
      setComment("");
      if (onSuccess) onSuccess();
    } catch (err) {
      addToast("Failed to submit review. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-primary/10 rounded-2xl p-6 md:p-8 border border-primary/30">
      <h3 className="text-xl font-serif font-semibold mb-6">Write a Review</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-foreground/70 mb-2">
            Your Rating
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none transition-transform hover:scale-110"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hover || rating)
                      ? "fill-rose text-rose"
                      : "text-foreground/20"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-foreground/70 mb-2">
            Your Feedback
          </label>
          <textarea
            id="comment"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this handcrafted piece..."
            className="w-full bg-white border border-secondary rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-rose focus:border-rose outline-none transition-all resize-none"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-foreground text-white px-8 py-3 rounded-full font-medium hover:bg-rose transition-all flex items-center gap-2 shadow-lg hover:shadow-rose/20 disabled:bg-foreground/50 disabled:shadow-none"
        >
          {isSubmitting ? (
            <Loader size="sm" />
          ) : (
            <>
              Submit Review
              <Send className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
