"use client";

import React, { useState, useEffect } from "react";
import { Star, MessageSquare, PenLine, MessageCircleReply } from "lucide-react";
import { fetchProductReviews, Review } from "@/lib/api/reviews";
import { ReviewForm } from "./ReviewForm";
import { Loader } from "@/components/ui/Loader";


export function ReviewsSection({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const loadReviews = async () => {
    try {
      const data = await fetchProductReviews(productId);
      setReviews(data);
    } catch (err) {
      console.error("Failed to load reviews", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <div className="pt-20 mt-12 border-t border-secondary/50">
      <div className="flex flex-col md:flex-row gap-12 items-start">
        <div className="w-full md:w-1/3">
          <h2 className="text-2xl font-serif font-semibold mb-6">Customer Reviews</h2>
          <div className="flex items-center gap-4 mb-4">
            <h3 className="text-4xl font-serif font-semibold">{averageRating}</h3>
            <div className="flex flex-col">
              <div className="flex text-rose mb-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`w-4 h-4 ${star <= Math.round(Number(averageRating)) ? "fill-current" : "text-secondary fill-current"}`} 
                  />
                ))}
              </div>
              <span className="text-sm text-foreground/50">Based on {reviews.length} reviews</span>
            </div>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="group flex items-center gap-2 bg-foreground text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-rose transition-all shadow-lg hover:shadow-rose/10 mt-6"
          >
            <PenLine className="w-4 h-4 transition-transform group-hover:rotate-12" />
            {showForm ? "Cancel Review" : "Write a Review"}
          </button>
        </div>

        <div className="w-full md:w-2/3 flex flex-col gap-8">
          {showForm && (
            <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
              <ReviewForm 
                productId={productId} 
                onSuccess={() => {
                  setShowForm(false);
                  loadReviews();
                }} 
              />
            </div>
          )}

          {loading ? (
            <div className="py-12 flex justify-center">
              <Loader size="md" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 bg-secondary/20 rounded-xl">
              <MessageSquare className="w-8 h-8 text-foreground/20 mx-auto mb-3" />
              <p className="text-foreground/50 font-medium">No reviews yet.</p>
              <p className="text-sm text-foreground/40 mt-1">Be the first to share your thoughts!</p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="border-b border-secondary/50 pb-8 last:border-0 last:pb-0">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-serif font-medium">{review.userName}</h4>
                    <span className="text-xs text-foreground/40">
                      {new Date(review.createdAt).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex text-rose">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "fill-current" : "text-secondary fill-current"}`} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed text-balance">
                  {review.comment}
                </p>

                {review.adminReply && (
                  <div className="mt-6 bg-primary/20 border-l-2 border-rose p-4 rounded-r-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageCircleReply className="w-4 h-4 text-rose" />
                      <span className="text-xs font-serif font-bold uppercase tracking-wider text-rose">Admin Reply</span>
                    </div>
                    <p className="text-sm text-foreground/80 italic">
                      "{review.adminReply}"
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
