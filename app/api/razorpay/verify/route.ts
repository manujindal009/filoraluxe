import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin as supabase } from "@/lib/supabaseAdmin";
import { sendOrderConfirmationEmail } from "@/lib/utils/email";

export async function POST(req: Request) {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      orderDetails // Contains userId, items, shippingDetails, total, and options
    } = await req.json();

    console.log(`[RazorpayVerify] Initiating verification for Order: ${razorpay_order_id}, User: ${orderDetails?.userId}`);

    // 1. Verify Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      console.error(`[RazorpayVerify] Signature mismatch for User: ${orderDetails?.userId}`);
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // 2. Signature is valid -> Create standard Order ID for our DB
    const newOrderId = `ORD-${Math.floor(Math.random() * 1000000)}`;
    const { userId, items, shippingDetails, total, options } = orderDetails;
    const { couponDetails } = options;

    console.log(`[RazorpayVerify] Signature Valid. Creating DB Order: ${newOrderId} for User: ${userId}`);

    if (!userId) {
      console.error(`[RazorpayVerify] CRITICAL: Missing userId for order ${newOrderId}`);
      return NextResponse.json({ error: "Unauthorized: Missing User Identity" }, { status: 400 });
    }

    // 3. Insert Order into Supabase (Using Admin Client to bypass RLS)
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([{
        id: newOrderId,
        user_id: userId,
        total: total,
        status: 'processing', // Since payment is verified
        shipping_address: shippingDetails,
        payment_method: 'razorpay',
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
        coupon_owner: couponDetails?.ownerName || null,
        // Store Razorpay detailed info as requested
        razorpay_order_id: razorpay_order_id,
        razorpay_payment_id: razorpay_payment_id,
        razorpay_signature: razorpay_signature
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    // 4. Insert Order Items
    const orderItemsPayload = items.map((item: any) => ({
      order_id: newOrderId,
      product_id: item.product.id,
      quantity: item.quantity,
      price_at_time: item.product.price
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsPayload);

    if (itemsError) console.error("Verify API: Order items failed:", itemsError);

    // 5. Increment Coupon usage if applicable
    if (couponDetails?.code) {
      await supabase.rpc('increment_coupon_usage', { coupon_code: couponDetails.code });
    }

    const customerEmail = shippingDetails.email;
    if (!customerEmail) {
      console.warn(`[RazorpayVerify] Order ${newOrderId} created but email is missing from shipping details.`);
    }

    // 6. Send Email Confirmation (Failsafe - don't block order success if email fails)
    try {
      if (customerEmail) {
        console.log(`[RazorpayVerify] Attempting to send confirmation email to ${customerEmail}`);
        const emailResponse = await sendOrderConfirmationEmail({
          orderId: newOrderId,
          customerName: shippingDetails.name,
          items: items,
          total: couponDetails?.finalAmount || total,
          address: `${shippingDetails.street}, ${shippingDetails.city}, ${shippingDetails.state} - ${shippingDetails.zipCode}`,
          customerEmail: customerEmail,
          paymentMethod: 'razorpay',
          subtotal: total,
          shipping: options.deliveryCharge,
          tax: options.gstAmount,
          discount: couponDetails?.discountAmount || 0,
          giftWrap: options.gift_wrap_charge || 0
        });

        if (emailResponse.success) {
          console.log(`[RazorpayVerify] Email sent successfully for order ${newOrderId}`);
        } else {
          console.error(`[RazorpayVerify] Resend returned error for order ${newOrderId}:`, emailResponse.error);
        }
      } else {
        console.warn(`[RazorpayVerify] Skipping email for order ${newOrderId} because email address is blank.`);
      }
    } catch (emailError) {
      console.error(`[RazorpayVerify] Unexpected exception during email sending for order ${newOrderId}:`, emailError);
    }

    return NextResponse.json({
      success: true,
      orderId: newOrderId,
      message: "Payment verified and order created successfully."
    });

  } catch (error: any) {
    console.error("Payment Verification Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error during verification" },
      { status: 500 }
    );
  }
}
