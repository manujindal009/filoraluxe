import { supabase } from "@/lib/supabaseClient";

export interface Review {
  id: string;
  productId: string;
  userId?: string;
  userName: string;
  rating: number;
  comment: string;
  adminReply?: string;
  adminReplyAt?: string;
  createdAt: string;
  product?: { name: string }; // For admin view context
}

export async function fetchProductReviews(productId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }

  return (data || []).map(r => ({
    id: r.id,
    productId: r.product_id,
    userName: r.user_name,
    rating: r.rating,
    comment: r.comment,
    adminReply: r.admin_reply,
    adminReplyAt: r.admin_reply_at,
    createdAt: r.created_at
  }));
}

export async function fetchAllReviews(): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select(`
      *,
      products (name)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all reviews:", error);
    return [];
  }

  return (data || []).map(r => ({
    id: r.id,
    productId: r.product_id,
    userName: r.user_name,
    rating: r.rating,
    comment: r.comment,
    adminReply: r.admin_reply,
    adminReplyAt: r.admin_reply_at,
    createdAt: r.created_at,
    product: r.products
  }));
}

export async function submitReview(
  productId: string,
  userId: string,
  userName: string,
  rating: number,
  comment: string
): Promise<Review> {
  const { data, error } = await supabase
    .from("reviews")
    .insert([
      {
        product_id: productId,
        user_id: userId,
        user_name: userName,
        rating,
        comment
      }
    ])
    .select()
    .single();

  if (error) {
    console.error("Error submitting review:", error);
    throw error;
  }

  return {
    id: data.id,
    productId: data.product_id,
    userName: data.user_name,
    rating: data.rating,
    comment: data.comment,
    createdAt: data.created_at
  };
}

export async function updateReviewReply(
  reviewId: string,
  reply: string
): Promise<void> {
  const { error } = await supabase
    .from("reviews")
    .update({
      admin_reply: reply,
      admin_reply_at: new Date().toISOString()
    })
    .eq("id", reviewId);

  if (error) throw error;
}

export async function deleteReview(reviewId: string): Promise<void> {
  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", reviewId);

  if (error) throw error;
}
