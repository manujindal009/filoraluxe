import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabaseAdmin";
import { sendOrderConfirmationEmail } from "@/lib/utils/email";

export async function POST(req: Request) {
  try {
    const { 
      userId, 
      items, 
      shippingDetails, 
      total, 
      options 
    } = await req.json();

    console.log(`[CODOrder] Initiating order for User: ${userId}`);

    if (!userId) {
      console.error(`[CODOrder] CRITICAL: Missing userId for COD order`);
      return NextResponse.json({ error: "Unauthorized: Missing User Identity" }, { status: 400 });
    }

    const newOrderId = `ORD-${Math.floor(Math.random() * 1000000)}`;
    const { couponDetails } = options;

    console.log(`[CODOrder] Creating DB Order: ${newOrderId} for User: ${userId}`);

    // 1. Insert Order into Supabase
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([{
        id: newOrderId,
        user_id: userId,
        total: total,
        status: 'pending', // Default for COD
        shipping_address: shippingDetails,
        payment_method: 'cod',
        delivery_charge: options.deliveryCharge,
        gst_amount: options.gstAmount,
        is_gift: options.isGift || false,
        gift_message: options.giftMessage || null,
        recipient_name: options.recipientName || null,
        is_for_someone_else: options.isForSomeoneElse || false,
        recipient_phone: options.recipientPhone || null,
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
      console.error(`[CODOrder] Database Error:`, orderError);
      throw orderError;
    }

    // 2. Insert Order Items
    const orderItemsPayload = items.map((item: any) => ({
      order_id: newOrderId,
      product_id: item.product.id,
      quantity: item.quantity,
      price_at_time: item.product.price
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsPayload);

    if (itemsError) {
      console.error("[CODOrder] Order items failed:", itemsError);
      // We continue since the main order is placed
    }

    // 3. Increment Coupon usage if applicable
    if (couponDetails?.code) {
      await supabase.rpc('increment_coupon_usage', { coupon_code: couponDetails.code });
    }

    const customerEmail = shippingDetails.email;
    if (!customerEmail) {
      console.warn(`[CODOrder] Order ${newOrderId} created but email is missing from shipping details.`);
    }

    // 4. Send Email Confirmation (Failsafe - don't block order success if email fails)
    try {
      if (customerEmail) {
        console.log(`[CODOrder] Attempting to send confirmation email to ${customerEmail}`);
        const emailResponse = await sendOrderConfirmationEmail({
          orderId: newOrderId,
          customerName: shippingDetails.name,
          items: items,
          total: couponDetails?.finalAmount || total,
          address: `${shippingDetails.street}, ${shippingDetails.city}, ${shippingDetails.state} - ${shippingDetails.zipCode}`,
          customerEmail: customerEmail,
          paymentMethod: 'cod'
        });

        if (emailResponse.success) {
          console.log(`[CODOrder] Email sent successfully for order ${newOrderId}`);
        } else {
          console.error(`[CODOrder] Resend returned error for order ${newOrderId}:`, emailResponse.error);
        }
      } else {
        console.warn(`[CODOrder] Skipping email for order ${newOrderId} because email address is blank.`);
      }
    } catch (emailError) {
      console.error(`[CODOrder] Unexpected exception during email sending for order ${newOrderId}:`, emailError);
    }

    return NextResponse.json({
      success: true,
      orderId: newOrderId,
      message: "COD order placed successfully."
    });

  } catch (error: any) {
    console.error("COD Order Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error during order placement" },
      { status: 500 }
    );
  }
}
