import { supabase } from "@/lib/supabaseClient";
import { Coupon } from "@/types";

export interface CouponValidationResult {
  isValid: boolean;
  message?: string;
  coupon?: Coupon;
}

export async function validateCoupon(code: string): Promise<CouponValidationResult> {
  if (!code) {
    return { isValid: false, message: "Coupon code is required" };
  }

  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .single();

  if (error || !data) {
    return { isValid: false, message: "Invalid coupon code" };
  }

  // Map DB structure to internal type
  const coupon: Coupon = {
    id: data.id,
    code: data.code,
    discountPercentage: data.discount_percentage,
    ownerName: data.owner_name,
    expiryDate: data.expiry_date,
    maxUsage: data.max_usage,
    usedCount: data.used_count,
    createdAt: data.created_at
  };

  // Check Expiry Date
  const now = new Date();
  const expiry = new Date(coupon.expiryDate);
  if (now > expiry) {
    return { isValid: false, message: "This coupon has expired" };
  }

  // Check Usage Limit
  if (coupon.usedCount >= coupon.maxUsage) {
    return { isValid: false, message: "This coupon has reached its usage limit" };
  }

  return { isValid: true, coupon };
}

export async function fetchAllCoupons(): Promise<Coupon[]> {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Failed to fetch coupons:", error);
    return [];
  }

  return data.map(c => ({
    id: c.id,
    code: c.code,
    discountPercentage: c.discount_percentage,
    ownerName: c.owner_name,
    expiryDate: c.expiry_date,
    maxUsage: c.max_usage,
    usedCount: c.used_count,
    createdAt: c.created_at
  }));
}

export async function createCoupon(payload: Omit<Coupon, 'id' | 'usedCount' | 'createdAt'>): Promise<Coupon> {
  const { data, error } = await supabase
    .from('coupons')
    .insert([{
      code: payload.code.toUpperCase(),
      discount_percentage: payload.discountPercentage,
      owner_name: payload.ownerName,
      expiry_date: payload.expiryDate,
      max_usage: payload.maxUsage
    }])
    .select()
    .single();

  if (error) throw error;
  
  return {
    id: data.id,
    code: data.code,
    discountPercentage: data.discount_percentage,
    ownerName: data.owner_name,
    expiryDate: data.expiry_date,
    maxUsage: data.max_usage,
    usedCount: data.used_count,
    createdAt: data.created_at
  };
}

export async function deleteCoupon(id: string): Promise<void> {
  const { error } = await supabase
    .from('coupons')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
}
