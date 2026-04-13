import { Order, OrderItem, CartItem } from "@/types";
import { supabase } from "@/lib/supabaseClient";

export async function placeOrder(
  userId: string, 
  items: CartItem[], 
  shippingDetails: { 
    name: string; 
    email: string;
    phone: string;
    street: string; 
    city: string; 
    state: string;
    zipCode: string; 
    country: string;
  }, 
  total: number,
  options: {
    paymentMethod: 'credit_card' | 'cod' | 'upi';
    upiScreenshotUrl?: string;
    deliveryCharge: number;
    gstAmount: number;
    isGift?: boolean;
    giftMessage?: string;
    recipientName?: string;
    isForSomeoneElse?: boolean;
    recipientPhone?: string;
    utrNumber?: string;
    gift_wrap_charge?: number;
    couponDetails?: { code: string; discountAmount: number; finalAmount: number; ownerName: string };
  }
): Promise<Order> {
  const newOrderId = `ORD-${Math.floor(Math.random() * 1000000)}`;
  const { couponDetails } = options;
  
  // 1. Create the Order Row
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert([{
      id: newOrderId,
      user_id: userId,
      total: total,
      status: 'pending',
      shipping_address: shippingDetails,
      payment_method: options.paymentMethod,
      upi_screenshot_url: options.upiScreenshotUrl || null,
      delivery_charge: options.deliveryCharge,
      gst_amount: options.gstAmount,
      is_gift: options.isGift || false,
      gift_message: options.giftMessage || null,
      recipient_name: options.recipientName || null,
      is_for_someone_else: options.isForSomeoneElse || false,
      recipient_phone: options.recipientPhone || null,
      utr_number: options.utrNumber || null,
      gift_wrap_charge: options.gift_wrap_charge || 0,
      pincode: shippingDetails.zipCode,
      state: shippingDetails.state,
      coupon_code: couponDetails?.code || null,
      discount_amount: couponDetails?.discountAmount || 0,
      final_amount: couponDetails?.finalAmount || total,
      coupon_owner: couponDetails?.ownerName || null
    }])
    .select()
    .single();
  
  if (orderError) {
    console.error(`[placeOrder] DB Error for User ${userId}:`, orderError);
    throw orderError;
  }

  console.log(`[placeOrder] Successfully created Order ${newOrderId} for User ${userId}`);

  // Bump the coupon usage count if one was applied
  if (couponDetails?.code) {
    await supabase.rpc('increment_coupon_usage', { coupon_code: couponDetails.code });
  }

  // 2. Create the Order Items (many-to-many payload mapper)
  const orderItemsPayload = items.map(item => ({
    order_id: newOrderId,
    product_id: item.product.id,
    quantity: item.quantity,
    price_at_time: item.product.price
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItemsPayload);

  if (itemsError) {
    // Ideally we would roll back the order insert if this fails (or use API RPC logic)
    console.error("Order items failed to write:", itemsError);
  }

  return {
    id: orderData.id,
    userId: orderData.user_id,
    items: items.map(item => ({
      product: item.product,
      quantity: item.quantity,
      price_at_time: item.product.price
    })),
    total: orderData.total,
    status: orderData.status,
    createdAt: orderData.created_at,
    shippingAddress: orderData.shipping_address,
    paymentMethod: orderData.payment_method,
    upiScreenshotUrl: orderData.upi_screenshot_url,
    deliveryCharge: orderData.delivery_charge,
    gstAmount: orderData.gst_amount,
    isGift: orderData.is_gift,
    giftMessage: orderData.gift_message,
    recipientName: orderData.recipient_name,
    isForSomeoneElse: orderData.is_for_someone_else,
    recipientPhone: orderData.recipient_phone,
    utrNumber: orderData.utr_number,
    gift_wrap_charge: orderData.gift_wrap_charge ?? 0,
    couponCode: orderData.coupon_code,
    discountAmount: orderData.discount_amount,
    finalAmount: orderData.final_amount || (orderData.total + (orderData.delivery_charge || 0) + (orderData.gst_amount || 0) + (orderData.gift_wrap_charge || 0)),
    couponOwner: orderData.coupon_owner
  };
}

export async function fetchUserOrders(userId: string): Promise<Order[]> {
  if (!userId) {
    console.warn("[fetchUserOrders] Called with null/undefined userId. Returning empty array.");
    return [];
  }

  // Force cast userId to string and trim to be safe
  const targetId = String(userId).trim();

  console.log(`[fetchUserOrders] Executing primary query for user: ${targetId}`);

  let { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        quantity,
        price_at_time,
        product_id,
        products ( name )
      )
    `)
    .eq('user_id', targetId)
    .order('created_at', { ascending: false });

  // FALLBACK: If join fails (PGRST200) or returns error, try a simple orders fetch
  if (error) {
    console.error(`[fetchUserOrders] Primary query failed. Error: ${error.message} (Code: ${error.code})`);
    
    // Entering FALLBACK mode
    console.warn(`[fetchUserOrders] Entering SAFE FALLBACK mode for user ${targetId}...`);
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          quantity,
          price_at_time,
          product_id
        )
      `)
      .eq('user_id', targetId)
      .order('created_at', { ascending: false });
    
    if (!fallbackError && fallbackData) {
      console.log(`[fetchUserOrders] FALLBACK SUCCESS: Found ${fallbackData.length} orders safely.`);
      data = fallbackData;
      error = null; // Clear the primary error as we recovered
    } else if (fallbackError) {
      console.error(`[fetchUserOrders] FALLBACK ALSO FAILED. Error: ${fallbackError.message}`);
      error = fallbackError;
    }
  }

  if (error) {
    console.error(`[fetchUserOrders] CRITICAL: Final DB Error:`, error);
    return [];
  }

  console.log(`[fetchUserOrders] Successfully retrieved ${data?.length || 0} records.`);
  
  return (data || []).map((o: any) => ({
    id: o.id,
    userId: o.user_id,
    items: (o.order_items || []).map((oi: any) => ({
      quantity: oi.quantity,
      price_at_time: oi.price_at_time,
      product: oi.products 
    })),
    total: o.total,
    status: o.status,
    createdAt: o.created_at,
    shippingAddress: o.shipping_address,
    paymentMethod: o.payment_method,
    upiScreenshotUrl: o.upi_screenshot_url,
    deliveryCharge: o.delivery_charge,
    gstAmount: o.gst_amount,
    isGift: o.is_gift,
    giftMessage: o.gift_message,
    recipientName: o.recipient_name,
    isForSomeoneElse: o.is_for_someone_else,
    recipientPhone: o.recipient_phone,
    utrNumber: o.utr_number,
    gift_wrap_charge: o.gift_wrap_charge ?? 0,
    couponCode: o.coupon_code,
    discountAmount: o.discount_amount,
    finalAmount: o.final_amount,
    couponOwner: o.coupon_owner
  }));
}

export async function fetchAllOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Failed to load global orders:", error);
    return [];
  }

  return data.map(o => ({
    id: o.id,
    userId: o.user_id,
    items: [], 
    total: o.total,
    status: o.status,
    createdAt: o.created_at,
    shippingAddress: o.shipping_address,
    paymentMethod: o.payment_method,
    upiScreenshotUrl: o.upi_screenshot_url,
    deliveryCharge: o.delivery_charge,
    gstAmount: o.gst_amount,
    isGift: o.is_gift,
    giftMessage: o.gift_message,
    recipientName: o.recipient_name,
    isForSomeoneElse: o.is_for_someone_else,
    recipientPhone: o.recipient_phone,
    utrNumber: o.utr_number,
    gift_wrap_charge: o.gift_wrap_charge ?? 0,
    couponCode: o.coupon_code,
    discountAmount: o.discount_amount,
    finalAmount: o.final_amount,
    couponOwner: o.coupon_owner
  }));
}

export async function updateOrderStatus(orderId: string, status: 'pending' | 'processing' | 'shipped' | 'delivered'): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    userId: data.user_id,
    items: [],
    total: data.total,
    status: data.status,
    createdAt: data.created_at,
    shippingAddress: data.shipping_address,
    paymentMethod: data.payment_method,
    upiScreenshotUrl: data.upi_screenshot_url,
    deliveryCharge: data.delivery_charge,
    gstAmount: data.gst_amount,
    isGift: data.is_gift,
    giftMessage: data.gift_message,
    recipientName: data.recipient_name,
    isForSomeoneElse: data.is_for_someone_else,
    recipientPhone: data.recipient_phone,
    utrNumber: data.utr_number,
    gift_wrap_charge: data.gift_wrap_charge ?? 0,
    couponCode: data.coupon_code,
    discountAmount: data.discount_amount,
    finalAmount: data.final_amount,
    couponOwner: data.coupon_owner
  };
}
