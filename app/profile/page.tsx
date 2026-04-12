"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Package, User as UserIcon, LogOut, CheckCircle2, Clock, Truck } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { fetchUserOrders } from "@/lib/api/orders";
import { Loader } from "@/components/ui/Loader";

import { Order } from "@/types";

// Live Order state
export default function ProfilePage() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"orders" | "settings">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
      return;
    }

    if (user) {
      const loadOrders = async () => {
        try {
          const data = await fetchUserOrders(user.id);
          setOrders(data as any);
        } catch (error) {
          console.error("Failed to load orders", error);
        } finally {
          setIsLoadingOrders(false);
        }
      };
      loadOrders();
    }
  }, [user, authLoading, router]);

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const generateInvoice = (order: Order) => {
    const win = window.open("", "_blank");
    if (!win) return;

    const itemsHtml = (order.items || [])
      .map(
        (item: any) => `
        <tr>
          <td class="item-name">${item.product?.name || "Product"}</td>
          <td class="item-qty">${item.quantity || 0}</td>
          <td class="item-price">₹${((item.price_at_time || 0) * (item.quantity || 0)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
        </tr>`
      )
      .join("");

    const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
      day: "numeric", month: "long", year: "numeric"
    });

    win.document.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Invoice – ${order.id} | Filora Luxe</title>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <style>
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

          body {
            font-family: 'Inter', sans-serif;
            background: #f5f0ea;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 40px 20px;
            color: #2c2420;
          }

          .invoice-wrap {
            background: #fefaf5;
            width: 100%;
            max-width: 720px;
            border-radius: 16px;
            box-shadow: 0 8px 40px rgba(0,0,0,0.10);
            overflow: hidden;
          }

          /* Header */
          .invoice-header {
            background: linear-gradient(135deg, #2c2420 0%, #4a3728 100%);
            color: #fefaf5;
            padding: 44px 48px 36px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          .brand-logo { font-family: 'Playfair Display', serif; font-size: 30px; font-weight: 700; letter-spacing: 2px; margin-bottom: 4px; }
          .brand-tagline { font-size: 11px; letter-spacing: 1.5px; opacity: 0.75; font-weight: 300; margin-top: 2px; }
          .brand-sub { font-size: 10px; letter-spacing: 1.2px; opacity: 0.55; margin-top: 3px; font-style: italic; }
          .invoice-label { text-align: right; }
          .invoice-label h2 { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 400; letter-spacing: 4px; opacity: 0.9; }
          .invoice-label .inv-meta { margin-top: 10px; font-size: 12px; opacity: 0.7; line-height: 1.8; }
          .inv-meta span { font-weight: 600; opacity: 1; }

          /* Divider */
          .gold-divider { height: 2px; background: linear-gradient(to right, transparent, #c9a96e, transparent); margin: 0 48px; }

          /* Body */
          .invoice-body { padding: 40px 48px; }

          /* Status badge */
          .status-badge {
            display: inline-block;
            padding: 4px 14px;
            border-radius: 99px;
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 1px;
            text-transform: uppercase;
            background: #e8f5e9;
            color: #2e7d32;
            margin-bottom: 32px;
          }

          /* Table */
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          thead tr { border-bottom: 2px solid #e8ddd0; }
          thead th {
            font-family: 'Inter', sans-serif;
            font-size: 10px;
            font-weight: 600;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            color: #9c7d5e;
            padding: 10px 0 14px;
          }
          thead th:nth-child(2) { text-align: center; }
          thead th:last-child { text-align: right; }

          tbody tr { border-bottom: 1px solid #f0e8de; }
          td { padding: 14px 0; font-size: 14px; color: #2c2420; vertical-align: middle; }
          .item-name { font-weight: 400; width: 60%; }
          .item-qty { text-align: center; color: #7a6252; font-size: 13px; }
          .item-price { text-align: right; font-weight: 500; }

          /* Total */
          .total-section {
            margin-top: 20px;
            border-top: 2px solid #2c2420;
            padding-top: 16px;
            display: flex;
            justify-content: flex-end;
          }
          .total-box { width: 280px; }
          .total-row-line {
            display: flex;
            justify-content: space-between;
            font-size: 13px;
            color: #7a6252;
            padding: 4px 0;
          }
          .grand-total {
            display: flex;
            justify-content: space-between;
            font-size: 18px;
            font-weight: 700;
            font-family: 'Playfair Display', serif;
            color: #2c2420;
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid #e8ddd0;
          }

          /* Thank you note */
          .thankyou {
            margin-top: 40px;
            padding: 24px 32px;
            background: #f5ede2;
            border-radius: 10px;
            text-align: center;
          }
          .thankyou p { font-family: 'Playfair Display', serif; font-style: italic; font-size: 16px; color: #4a3728; margin-bottom: 8px; }
          .thankyou .contact { font-size: 12px; color: #9c7d5e; line-height: 1.9; margin-top: 4px; }

          /* Footer */
          .invoice-footer {
            padding: 24px 48px;
            border-top: 1px solid #e8ddd0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #fdf6ee;
          }
          .invoice-footer p { font-size: 11px; color: #b09080; }

          /* Buttons */
          .btn-group { display: flex; gap: 12px; justify-content: center; padding: 32px 48px 40px; }
          .btn {
            padding: 12px 28px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            font-family: 'Inter', sans-serif;
            cursor: pointer;
            border: none;
            transition: all 0.2s;
            letter-spacing: 0.3px;
          }
          .btn-print { background: #2c2420; color: #fefaf5; }
          .btn-print:hover { background: #4a3728; }
          .btn-pdf { background: #fefaf5; color: #2c2420; border: 1.5px solid #c9a96e; }
          .btn-pdf:hover { background: #f5ede2; }

          @media print {
            body { background: white; padding: 0; }
            .invoice-wrap { box-shadow: none; border-radius: 0; }
            .btn-group { display: none; }
            .gold-divider { background: #c9a96e; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-wrap" id="invoice-content">
          <!-- Header -->
          <div class="invoice-header">
            <div>
              <div class="brand-logo">Filora Luxe</div>
              <div class="brand-tagline">HANDCRAFTED WITH ❤️ IN INDIA</div>
              <div class="brand-sub">A brand by Anshuma</div>
            </div>
            <div class="invoice-label">
              <h2>INVOICE</h2>
              <div class="inv-meta">
                <div>Order: <span>${order.id}</span></div>
                <div>Date: <span>${orderDate}</span></div>
                <div>Status: <span>${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span></div>
              </div>
            </div>
          </div>

          <div class="gold-divider"></div>

          <!-- Body -->
          <div class="invoice-body">
            <!-- Items Table -->
            <table>
              <thead>
                <tr>
                  <th style="text-align:left;">Product</th>
                  <th>Qty</th>
                  <th style="text-align:right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <!-- Total -->
            <div class="total-section">
              <div class="total-box">
                <div class="total-row-line">
                  <span>Subtotal</span>
                  <span>₹${order.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
                <div class="total-row-line">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div class="grand-total">
                  <span>Total</span>
                  <span>₹${(order.finalAmount || order.total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            <!-- Thank you -->
            <div class="thankyou">
              <p>"Thank you for shopping with Filora Luxe"</p>
              <div class="contact">
                📧 filoraluxe@yahoo.com &nbsp;|&nbsp; 📱 +91 98888 12872<br/>
                Every piece is handcrafted with love, just for you.
              </div>
            </div>
          </div>

          <div class="gold-divider"></div>

          <!-- Footer -->
          <div class="invoice-footer">
            <p>© ${new Date().getFullYear()} Filora Luxe. All rights reserved.</p>
            <p>filoraluxe@yahoo.com</p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="btn-group" id="action-btns">
          <button class="btn btn-print" onclick="window.print()">🖨️ Print Invoice</button>
          <button class="btn btn-pdf" id="download-pdf-btn">⬇️ Download PDF</button>
        </div>

        <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
        <script>
          document.getElementById('download-pdf-btn').addEventListener('click', function() {
            const btn = document.getElementById('action-btns');
            btn.style.display = 'none';

            const element = document.getElementById('invoice-content');
            const opt = {
              margin: 0,
              filename: 'invoice-${order.id}.pdf',
              image: { type: 'jpeg', quality: 0.98 },
              html2canvas: { scale: 2, useCORS: true, backgroundColor: '#fefaf5' },
              jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            html2pdf().set(opt).from(element).save().then(function() {
              btn.style.display = 'flex';
            });
          });
        </script>
      </body>
      </html>
    `);
    win.document.close();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing': return <Clock className="w-5 h-5 text-amber-500" />;
      case 'shipped': return <Truck className="w-5 h-5 text-blue-500" />;
      case 'delivered': return <CheckCircle2 className="w-5 h-5 text-sage" />;
      default: return <Package className="w-5 h-5 text-foreground/50" />;
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 lg:max-w-6xl">
      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        {/* Sidebar */}
        <div className="w-full md:w-1/4">
          <div className="bg-primary/10 rounded-2xl p-6 border border-primary/30 top-24 sticky">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-foreground text-white flex items-center justify-center font-serif text-xl">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div>
                <h2 className="font-serif font-semibold text-lg">{user?.name || "User"}</h2>
                <p className="text-xs text-foreground/60">{user?.email || ""}</p>
              </div>
            </div>

            <nav className="space-y-2 mb-8">
              <button
                onClick={() => setActiveTab("orders")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "orders" ? "bg-white text-rose shadow-sm" : "text-foreground/70 hover:bg-white/50"
                }`}
              >
                <Package className="w-4 h-4" />
                Orders & Tracking
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "settings" ? "bg-white text-rose shadow-sm" : "text-foreground/70 hover:bg-white/50"
                }`}
              >
                <UserIcon className="w-4 h-4" />
                Account Settings
              </button>
            </nav>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-rose hover:bg-rose/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="w-full md:w-3/4">


          {activeTab === "orders" ? (
            <div>
              <h1 className="text-3xl font-serif font-semibold mb-8">Your Orders</h1>
              
              <div className="space-y-8">
                {isLoadingOrders ? (
                  <div className="py-20 flex justify-center">
                    <Loader size="md" />
                  </div>
                ) : orders.length > 0 ? (
                  orders.map((order) => (
                    <div key={order.id} className="bg-white border text-foreground/90 border-secondary rounded-xl overflow-hidden">
                      <div className="bg-primary/20 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-secondary">
                        <div className="flex gap-8">
                          <div>
                            <p className="text-xs uppercase tracking-wider text-foreground/60 font-medium mb-1">Order Placed</p>
                            <p className="text-sm font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wider text-foreground/60 font-medium mb-1">Total</p>
                            <p className="text-sm font-medium">{formatPrice(order.finalAmount || order.total)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs uppercase tracking-wider text-foreground/60 font-medium mb-1">Order Number</p>
                          <p className="text-sm font-medium">{order.id}</p>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="flex items-center gap-3 mb-6 bg-white border border-secondary p-4 rounded-lg inline-flex">
                          {getStatusIcon(order.status)}
                          <span className="font-medium capitalize text-sm">{order.status}</span>
                        </div>

                        {order.items && order.items.length > 0 && (
                          <div className="space-y-4 max-w-2xl">
                            {order.items.map((item: any, i: number) => (
                              <div key={i} className="flex justify-between items-center py-2">
                                <span className="text-sm text-foreground/80">{item.quantity} × {item.product?.name || "Product"}</span>
                                <span className="text-sm font-medium text-foreground/80">{formatPrice(item.price_at_time * item.quantity)}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="mt-8 pt-6 border-t border-secondary">
                          <button
                            onClick={() => generateInvoice(order)}
                            className="text-rose font-medium text-sm hover:underline flex items-center gap-1"
                          >
                            View Invoice
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white border border-secondary rounded-2xl p-12 text-center">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Package className="w-8 h-8 text-rose" />
                    </div>
                    <h3 className="text-xl font-serif font-semibold mb-2">No orders found</h3>
                    <p className="text-foreground/60 mb-8 max-w-sm mx-auto">
                      You haven't placed any orders yet. Start shopping to see your beautiful handcrafted items here!
                    </p>
                    <button 
                      onClick={() => router.push("/shop")}
                      className="bg-foreground text-white px-8 py-3 rounded-full font-medium hover:bg-rose transition-all shadow-lg hover:shadow-rose/20"
                    >
                      Explore Collection
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-3xl font-serif font-semibold mb-8">Account Settings</h1>
              <div className="bg-white border border-secondary p-6 rounded-xl space-y-6 max-w-2xl">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-foreground/60 mb-2">Name</label>
                  <p className="font-medium">{user?.name}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-foreground/60 mb-2">Email</label>
                  <p className="font-medium">{user?.email}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-foreground/60 mb-2">Password</label>
                  <p className="font-medium text-foreground/50">••••••••</p>
                </div>
                <div className="pt-4 border-t border-secondary">
                  <button className="bg-foreground text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-rose transition-colors">
                    Edit Details
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
