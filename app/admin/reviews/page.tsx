"use client";

import React, { useState, useEffect } from "react";
import { Star, Search, MessageSquare, Trash2, MessageCircleReply, Clock, ChevronRight, X } from "lucide-react";
import { fetchAllReviews, updateReviewReply, deleteReview, Review } from "@/lib/api/reviews";
import { formatPrice } from "@/lib/utils";
import { Loader } from "@/components/ui/Loader";
import { useToast } from "@/context/ToastContext";
import { Modal } from "@/components/ui/Modal";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const loadReviews = async () => {
    try {
      const data = await fetchAllReviews();
      setReviews(data);
    } catch (err) {
      addToast("Failed to load reviews", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReview) return;
    
    setIsSubmitting(true);
    try {
      await updateReviewReply(selectedReview.id, replyText);
      addToast("Reply sent successfully", "success");
      setSelectedReview(null);
      setReplyText("");
      loadReviews();
    } catch (err) {
      addToast("Failed to send reply", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review? This action cannot be undone.")) return;
    
    try {
      await deleteReview(id);
      addToast("Review deleted", "success");
      loadReviews();
    } catch (err) {
      addToast("Failed to delete review", "error");
    }
  };

  const filteredReviews = reviews.filter(r => 
    r.userName.toLowerCase().includes(search.toLowerCase()) || 
    r.comment.toLowerCase().includes(search.toLowerCase()) ||
    r.product?.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="h-[60vh] flex items-center justify-center"><Loader size="lg" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-semibold">Review Management</h1>
          <p className="text-foreground/50 text-sm mt-1">Manage and respond to customer feedback.</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
          <input
            type="text"
            placeholder="Search reviews..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-secondary rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-rose outline-none"
          />
        </div>
      </div>

      <div className="bg-white border border-secondary rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-primary/10 border-b border-secondary">
              <tr>
                <th className="px-6 py-4 font-semibold text-foreground/70">Customer</th>
                <th className="px-6 py-4 font-semibold text-foreground/70">Rating</th>
                <th className="px-6 py-4 font-semibold text-foreground/70">Product</th>
                <th className="px-6 py-4 font-semibold text-foreground/70">Comment</th>
                <th className="px-6 py-4 font-semibold text-foreground/70">Status</th>
                <th className="px-6 py-4 font-semibold text-foreground/70 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary">
              {filteredReviews.length > 0 ? (
                filteredReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-primary/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{review.userName}</span>
                        <span className="text-xs text-foreground/40">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex text-rose">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "fill-current" : "text-secondary fill-current"}`} />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-foreground/70 line-clamp-1">{review.product?.name || "Unknown Product"}</span>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="line-clamp-2 text-foreground/60 italic">"{review.comment}"</p>
                    </td>
                    <td className="px-6 py-4">
                      {review.adminReply ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Replied
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => {
                          setSelectedReview(review);
                          setReplyText(review.adminReply || "");
                        }}
                        className="p-2 text-foreground/60 hover:text-rose hover:bg-rose/10 rounded-lg transition-colors"
                        title="Reply"
                      >
                        <MessageCircleReply className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(review.id)}
                        className="p-2 text-foreground/60 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-foreground/40 italic">
                    {search ? "No reviews match your search." : "No customer reviews yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reply Modal */}
      <Modal
        isOpen={!!selectedReview}
        onClose={() => setSelectedReview(null)}
        title="Respond to Review"
        className="max-w-2xl"
      >
        {selectedReview && (
          <form onSubmit={handleReply} className="space-y-6 py-4">
            <div className="bg-primary/10 p-5 rounded-xl border border-primary/20">
              <div className="flex justify-between items-start mb-3">
                <span className="font-serif font-bold text-lg">{selectedReview.userName}</span>
                <div className="flex text-rose">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < selectedReview.rating ? "fill-current" : "text-rose/20 fill-current"}`} />
                  ))}
                </div>
              </div>
              <p className="text-foreground/70 italic text-sm leading-relaxed">
                "{selectedReview.comment}"
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-2">
                Your Response
              </label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Ex: Thank you so much for your kind words, Priya! We're thrilled you loved the quality..."
                className="w-full bg-white border border-secondary rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-rose outline-none transition-all h-32 resize-none"
                required
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedReview(null)}
                className="px-6 py-2.5 rounded-lg text-sm font-medium text-foreground/60 hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-foreground text-white px-8 py-2.5 rounded-lg text-sm font-medium hover:bg-rose transition-all shadow-md disabled:bg-foreground/50"
              >
                {isSubmitting ? <Loader size="sm" /> : "Send Response"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
