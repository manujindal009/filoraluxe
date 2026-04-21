import { Resend } from 'resend';

// Lazy initialization to prevent build-time crashes when env vars are missing
let resend: Resend | null = null;
const getResend = () => {
  if (!resend) {
    const key = process.env.RESEND_API_KEY || 're_dummy_key_for_build';
    resend = new Resend(key);
  }
  return resend;
};

interface OrderConfirmationEmailProps {
  orderId: string;
  customerName: string;
  items: any[];
  total: number;
  address: string;
  paymentMethod?: string;
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  giftWrap: number;
}

export async function sendOrderConfirmationEmail({
  orderId,
  customerName,
  items,
  total,
  address,
  customerEmail,
  paymentMethod = 'razorpay',
  subtotal,
  shipping,
  tax,
  discount,
  giftWrap,
}: OrderConfirmationEmailProps & { customerEmail: string }) {
  const isCOD = paymentMethod.toLowerCase() === 'cod';
  const paymentStatusText = isCOD ? "Cash on Delivery" : "Paid ✅";
  const paymentStatusColor = isCOD ? "#f59e0b" : "#10b981"; // Amber for COD, Green for Paid
  
  // Color configuration: Red for COD, Green for Paid
  const totalAmountColor = isCOD ? "#E11D48" : "#10b981";

  // Safety: Ensure all numeric values are valid numbers to prevent toLocaleString() crashes
  const sSubtotal = Number(subtotal) || 0;
  const sShipping = Number(shipping) || 0;
  const sTax = Number(tax) || 0;
  const sDiscount = Number(discount) || 0;
  const sGiftWrap = Number(giftWrap) || 0;
  const sTotal = Number(total) || 0;

  try {
    const { data, error } = await getResend().emails.send({
      from: 'Filora Luxe <orders@filoraluxe.in>',
      to: [customerEmail],
      subject: `Order Confirmed - #${orderId} | Filora Luxe`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            @media only screen and (max-width: 600px) {
              .content { padding: 20px !important; }
              .header h1 { font-size: 28px !important; }
            }
          </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #ffffff; font-family: 'Times New Roman', serif; color: #1a1a1a; -webkit-font-smoothing: antialiased;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 40px auto; border: 1px solid #f3f4f6;">
            <!-- Header Section -->
            <tr>
              <td align="center" style="padding: 40px 20px 20px 20px; border-bottom: 1px solid #f3f4f6;">
                <h1 style="margin: 0; font-size: 36px; font-weight: 500; letter-spacing: 2px; color: #E11D48; text-transform: uppercase;">Filora Luxe</h1>
                <p style="margin: 8px 0 0 0; font-size: 14px; letter-spacing: 4px; color: #6b7280; font-style: italic;">A Brand by Anshuma</p>
              </td>
            </tr>

            <!-- Content Section -->
            <tr>
              <td class="content" style="padding: 40px;">
                <div style="margin-bottom: 30px;">
                  <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 500;">Your Order is Confirmed</h2>
                  <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #4b5563;">
                    Hi ${customerName}, <br/><br/>
                    Thank you for choosing Filora Luxe. Our artisans have received your order, and we are now carefully crafting your handmade pieces.
                  </p>
                </div>

                <!-- Order Meta -->
                <table width="100%" style="margin-bottom: 30px; background-color: #fafafa; border-radius: 4px;">
                  <tr>
                    <td style="padding: 20px;">
                      <p style="margin: 0 0 4px 0; font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px;">Order ID</p>
                      <p style="margin: 0; font-size: 16px; font-weight: 500;">#${orderId}</p>
                    </td>
                    <td style="padding: 20px; text-align: right;">
                      <p style="margin: 0 0 4px 0; font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px;">Payment Status</p>
                      <p style="margin: 0; font-size: 16px; font-weight: 500; color: ${paymentStatusColor};">${paymentStatusText}</p>
                    </td>
                  </tr>
                </table>

                <!-- Items Table -->
                <table width="100%" style="border-collapse: collapse; margin-bottom: 30px;">
                  <thead>
                    <tr style="border-bottom: 2px solid #1a1a1a;">
                      <th align="left" style="padding-bottom: 12px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Product</th>
                      <th align="center" style="padding-bottom: 12px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Qty</th>
                      <th align="right" style="padding-bottom: 12px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${items.map(item => `
                      <tr style="border-bottom: 1px solid #f3f4f6;">
                        <td style="padding: 16px 0; font-size: 14px;">${item.product.name}</td>
                        <td align="center" style="padding: 16px 0; font-size: 14px;">${item.quantity}</td>
                        <td align="right" style="padding: 16px 0; font-size: 14px;">₹${(item.product.price * item.quantity).toLocaleString()}</td>
                      </tr>
                    `).join('')}
                    
                    <!-- Price Breakdown -->
                    <tr>
                      <td colspan="2" align="right" style="padding: 20px 10px 5px 0; font-size: 14px; color: #6b7280;">Subtotal</td>
                      <td align="right" style="padding: 20px 0 5px 0; font-size: 14px;">₹${sSubtotal.toLocaleString()}</td>
                    </tr>
                    ${sDiscount > 0 ? `
                    <tr>
                      <td colspan="2" align="right" style="padding: 5px 10px 5px 0; font-size: 14px; color: #10b981;">Discount</td>
                      <td align="right" style="padding: 5px 0 5px 0; font-size: 14px; color: #10b981;">-₹${sDiscount.toLocaleString()}</td>
                    </tr>
                    ` : ''}
                    <tr>
                      <td colspan="2" align="right" style="padding: 5px 10px 5px 0; font-size: 14px; color: #6b7280;">Shipping</td>
                      <td align="right" style="padding: 5px 0 5px 0; font-size: 14px;">${sShipping === 0 ? 'FREE' : `₹${sShipping.toLocaleString()}`}</td>
                    </tr>
                    <tr>
                      <td colspan="2" align="right" style="padding: 5px 10px 5px 0; font-size: 14px; color: #6b7280;">GST (5%)</td>
                      <td align="right" style="padding: 5px 0 5px 0; font-size: 14px;">₹${sTax.toLocaleString()}</td>
                    </tr>
                    ${sGiftWrap > 0 ? `
                    <tr>
                      <td colspan="2" align="right" style="padding: 5px 10px 5px 0; font-size: 14px; color: #6b7280;">Gift Wrap</td>
                      <td align="right" style="padding: 5px 0 5px 0; font-size: 14px;">₹${sGiftWrap.toLocaleString()}</td>
                    </tr>
                    ` : ''}
                    
                    <!-- Grand Total -->
                    <tr>
                      <td colspan="2" align="right" style="padding: 15px 10px 0 0; font-size: 16px; font-weight: 500;">${isCOD ? 'Total Amount to Pay' : 'Total Paid'}</td>
                      <td align="right" style="padding: 15px 0 0 0; font-size: 20px; font-weight: 600; color: ${totalAmountColor};">₹${sTotal.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>

                <!-- Delivery Address -->
                <div style="padding: 25px; border: 1px solid #f3f4f6; border-radius: 4px;">
                  <h3 style="margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #1a1a1a;">Delivery Address</h3>
                  <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #4b5563;">
                    ${address}
                  </p>
                </div>
              </td>
            </tr>

            <!-- Footer Section -->
            <tr>
              <td align="center" style="padding: 40px 20px; background-color: #fafafa; border-top: 1px solid #f3f4f6;">
                <p style="margin: 0 0 16px 0; font-size: 14px; color: #4b5563;">Follow our journey on Instagram</p>
                <a href="https://instagram.com/filora.luxe" style="text-decoration: none; color: #E11D48; font-weight: 600; font-size: 16px;">@filora.luxe</a>
                
                <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #eee; width: 80%;">
                  <p style="margin: 0; font-size: 12px; color: #9ca3af; line-height: 1.6;">
                    Questions about your order? <br/>
                    Reply to this email or contact us at <a href="mailto:filoraluxe@yahoo.com" style="color: #6b7280;">filoraluxe@yahoo.com</a>
                  </p>
                  <p style="margin: 16px 0 0 0; font-size: 10px; color: #d1d5db; text-transform: uppercase; letter-spacing: 1px;">
                    © 2026 Filora Luxe. All Rights Reserved.
                  </p>
                </div>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("Resend Email Error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Resend unexpected error:", err);
    return { success: false, error: err };
  }
}

export async function sendPasswordResetEmail(email: string, name: string, resetLink: string) {
  try {
    const { data, error } = await getResend().emails.send({
      from: 'Filora Luxe <orders@filoraluxe.in>',
      to: [email],
      subject: 'Reset your password - Filora Luxe',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #ffffff; font-family: 'Times New Roman', serif; color: #1a1a1a;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 40px auto; border: 1px solid #f3f4f6;">
            <tr>
              <td align="center" style="padding: 40px 20px; border-bottom: 1px solid #f3f4f6;">
                <h1 style="margin: 0; font-size: 32px; font-weight: 500; letter-spacing: 2px; color: #E11D48; text-transform: uppercase;">Filora Luxe</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px;">
                <h2 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 500;">Password Reset Request</h2>
                <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #4b5563;">
                  Hi ${name}, <br/><br/>
                  We received a request to reset the password for your Filora Luxe account. Click the button below to set a new password:
                </p>
                
                <div style="text-align: center; margin: 40px 0;">
                  <a href="${resetLink}" style="background-color: #1a1a1a; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 4px; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Reset Password</a>
                </div>

                <p style="margin: 30px 0 0 0; font-size: 14px; line-height: 1.6; color: #9ca3af;">
                  If you didn't request a password reset, you can safely ignore this email. This link will expire in 24 hours.
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding: 30px 20px; background-color: #fafafa; border-top: 1px solid #f3f4f6;">
                <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                  © 2026 Filora Luxe. Handcrafted with ❤️ in India.
                </p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    });

    if (error) {
      console.error("Resend Reset Email Error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Resend reset unexpected error:", err);
    return { success: false, error: err };
  }
}

export async function sendAdminNewOrderNotification(order: any) {
  const adminEmail = 'filoraluxe@yahoo.com';
  
  try {
    const { data, error } = await getResend().emails.send({
      from: 'Filora Luxe <orders@filoraluxe.in>',
      to: [adminEmail],
      subject: `🚨 New Order Received: #${order.id}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; }
            .header { background: #E11D48; color: white; padding: 15px; text-align: center; border-radius: 4px 4px 0 0; }
            .content { padding: 20px; border: 1px solid #eee; border-top: none; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #666; font-size: 12px; text-transform: uppercase; }
            .value { font-size: 16px; font-weight: 500; }
            .items { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .items th { text-align: left; border-bottom: 2px solid #333; padding: 10px 0; font-size: 12px; }
            .items td { padding: 10px 0; border-bottom: 1px solid #eee; font-size: 14px; }
            .total-row { font-weight: bold; font-size: 18px; color: #E11D48; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin:0;">New Order Alert!</h2>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Order ID</div>
                <div class="value">#${order.id}</div>
              </div>
              <div class="field">
                <div class="label">Customer</div>
                <div class="value">${order.shippingAddress.name} (${order.shippingAddress.email || 'No Email'})</div>
              </div>
              <div class="field">
                <div class="label">Phone</div>
                <div class="value">${order.shippingAddress.phone || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="label">Payment Method</div>
                <div class="value" style="text-transform: uppercase;">${order.paymentMethod}</div>
              </div>
              
              <table class="items">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${order.items.map((item: any) => `
                    <tr>
                      <td>${item.product.name}</td>
                      <td>${item.quantity}</td>
                      <td>₹${(item.price_at_time * item.quantity).toLocaleString()}</td>
                    </tr>
                  `).join('')}
                  <tr>
                    <td colspan="2" align="right" style="padding-top: 15px;">Total Amount:</td>
                    <td align="right" class="total-row" style="padding-top: 15px;">₹${(order.finalAmount || order.total).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>

              <div style="margin-top: 30px; text-align: center;">
                <a href="https://filoraluxe.in/admin/orders" style="background: #1a1a1a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">View Order in Dashboard</a>
              </div>
            </div>
            <div class="footer">
              © 2026 Filora Luxe Admin Notifications
            </div>
          </div>
        </body>
        </html>
      `
    });
    
    if (error) console.error("Admin Notification Error:", error);
    return { success: !error, data };
  } catch (err) {
    console.error("Admin Notification Catch:", err);
    return { success: false, error: err };
  }
}

export async function sendAdminCancellationNotification(orderId: string, customerName: string, reason?: string) {
  const adminEmail = 'filoraluxe@yahoo.com';
  
  try {
    const { data, error } = await getResend().emails.send({
      from: 'Filora Luxe <orders@filoraluxe.in>',
      to: [adminEmail],
      subject: `⚠️ Order Cancelled: #${orderId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; }
            .header { background: #333; color: white; padding: 15px; text-align: center; border-radius: 4px 4px 0 0; }
            .content { padding: 20px; border: 1px solid #eee; border-top: none; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #666; font-size: 12px; text-transform: uppercase; }
            .value { font-size: 16px; font-weight: 500; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin:0;">Order Cancellation Alert</h2>
            </div>
            <div class="content">
              <p>The following order has been cancelled:</p>
              <div class="field">
                <div class="label">Order ID</div>
                <div class="value">#${orderId}</div>
              </div>
              <div class="field">
                <div class="label">Customer Name</div>
                <div class="value">${customerName}</div>
              </div>
              ${reason ? `
              <div class="field">
                <div class="label">Reason</div>
                <div class="value">${reason}</div>
              </div>
              ` : ''}
              
              <div style="margin-top: 30px; text-align: center;">
                <a href="https://filoraluxe.in/admin/orders" style="background: #1a1a1a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Check Admin Panel</a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    });
    
    if (error) console.error("Admin Cancellation Notify Error:", error);
    return { success: !error, data };
  } catch (err) {
    console.error("Admin Cancellation Notify Catch:", err);
    return { success: false, error: err };
  }
}
