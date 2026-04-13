"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { formatPrice } from "@/lib/utils";
import { Loader } from "@/components/ui/Loader";
import { validateCoupon } from "@/lib/api/coupons";
import { placeOrder } from "@/lib/api/orders";
import { useAuth } from "@/context/AuthContext";
import { Tag, LogIn, Gift, User, CreditCard, Smartphone, Info } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

// Constants for delivery logic
const TRICITY_CITIES = ["CHANDIGARH", "MOHALI", "PANCHKULA", "ZIRAKPUR", "KHARAR"];
const UPI_ID = "anshumasingh394@oksbi";
const GIFT_WRAP_FEE = 50;
const SUPPORT_EMAIL = "filoraluxe@yahoo.com";
export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { addToast } = useToast();
  const router = useRouter();
  const { user } = useAuth();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [activeCoupon, setActiveCoupon] = useState<any>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "IN",
    isGift: false,
    giftMessage: "",
    recipientName: "",
    isForSomeoneElse: false,
    recipientPhone: "",
    paymentMethod: "razorpay" as "razorpay" | "cod",
  });

  React.useEffect(() => {
    // If guest tries to checkout, show the modal
    if (!user) {
      setShowAuthModal(true);
    } else {
      // Auto-populate form data from user profile if not already filled
      const names = user.name ? user.name.split(" ") : ["", ""];
      setFormData(prev => ({
        ...prev,
        firstName: prev.firstName || names[0] || "",
        lastName: prev.lastName || names.slice(1).join(" ") || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || ""
      }));
    }
  }, [user]);

  const handleLoginRedirect = () => {
    router.push(`/auth/login?redirect=/checkout`);
  };

  // 1. Calculate Delivery
  const isTricity = TRICITY_CITIES.includes(formData.city.toUpperCase().trim());
  let deliveryCharge = 0;
  if (isTricity) {
    deliveryCharge = total > 499 ? 0 : 50;
  } else {
    deliveryCharge = total > 799 ? 0 : 80;
  }

  // 2. Calculate Discount
  const discount = activeCoupon ? (total * (activeCoupon.discountPercentage / 100)) : 0;
  const discountedSubtotal = total - discount;

  // 3. Calculate GST (5%) on discounted subtotal
  const gstAmount = discountedSubtotal * 0.05;

  // 4. Gift Wrap Charge
  const giftWrapCharge = formData.isGift ? GIFT_WRAP_FEE : 0;

  const grandTotal = discountedSubtotal + deliveryCharge + gstAmount + giftWrapCharge;

  // 3. Pincode Autofill Logic
  const fetchPostalData = async (pincode: string) => {
    if (pincode.length !== 6) return;
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await res.json();
      if (data[0].Status === "Success") {
        const postOffice = data[0].PostOffice[0];
        setFormData(prev => ({
          ...prev,
          city: postOffice.District,
          state: postOffice.State
        }));
      }
    } catch (err) {
      console.error("Postal API failed:", err);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setIsValidatingCoupon(true);
    setCouponError("");
    
    try {
      const res = await validateCoupon(couponCode);
      if (res.isValid && res.coupon) {
        setActiveCoupon(res.coupon);
        setCouponCode("");
        addToast(`Coupon applied! ${res.coupon.discountPercentage}% off.`, "success");
      } else {
        setCouponError(res.message || "Invalid coupon");
        setActiveCoupon(null);
      }
    } catch {
      setCouponError("Failed to validate coupon");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setActiveCoupon(null);
    setCouponError("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRazorpayPayment = async () => {
    if (!user) return;

    try {
      // 1. Create Razorpay Order on server
      const orderRes = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: grandTotal }),
      });
      const orderData = await orderRes.json();

      if (orderData.error) throw new Error(orderData.error);

      // 2. Setup Razorpay Options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Filora Luxe",
        description: "Premium Crochet Payment",
        order_id: orderData.id,
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone,
        },
        theme: { color: "#E11D48" }, // Rose color
        handler: async function (response: any) {
          try {
            setIsVerifyingPayment(true);
            
            // 3. Verify Payment on server (This creates the order in DB and sends email)
            if (!user?.id) {
              console.error("[RazorpayVerify] CRITICAL: User context lost during payment callback!");
              addToast("Your session has expired. Please log in again to save your order.", "error");
              return;
            }

            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderDetails: {
                  userId: user.id,
                  items,
                  shippingDetails: {
                    name: `${formData.firstName} ${formData.lastName}`.trim(),
                    email: formData.email,
                    phone: formData.phone,
                    street: formData.address,
                    city: formData.city,
                    state: formData.state,
                    zipCode: formData.zipCode,
                    country: formData.country,
                  },
                  total,
                  options: {
                    deliveryCharge,
                    gstAmount,
                    gift_wrap_charge: giftWrapCharge,
                    isGift: formData.isGift,
                    giftMessage: formData.giftMessage,
                    recipientName: formData.recipientName,
                    isForSomeoneElse: formData.isForSomeoneElse,
                    recipientPhone: formData.recipientPhone,
                    couponDetails: activeCoupon ? {
                      code: activeCoupon.code,
                      discountAmount: discount,
                      finalAmount: grandTotal,
                      ownerName: activeCoupon.ownerName
                    } : undefined
                  }
                }
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              clearCart();
              addToast("Payment successful! Order confirmed.", "success");
              router.push("/checkout/success");
            } else {
              throw new Error(verifyData.error || "Verification failed");
            }
          } catch (err: any) {
            console.error("Verification error:", err);
            addToast(err.message || "Payment verification failed. Please contact support.", "error");
          } finally {
            setIsVerifyingPayment(false);
          }
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
            addToast("Payment cancelled", "error");
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error("Razorpay error:", error);
      addToast(error.message || "Failed to initiate payment", "error");
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      addToast("Your cart is empty", "error");
      return;
    }

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    console.log(`[CheckoutSubmit] User: ${user?.id}, Items: ${items.length}, Method: ${formData.paymentMethod}`);
    setIsProcessing(true);

    if (formData.paymentMethod === "razorpay") {
      await handleRazorpayPayment();
    } else if (formData.paymentMethod === "cod") {
      // Reusing logic for COD if needed
      try {
        const shippingDetails = {
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          phone: formData.phone,
          street: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        };

        const response = await fetch("/api/orders/cod", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            items,
            shippingDetails,
            total,
            options: {
              deliveryCharge,
              gstAmount,
              gift_wrap_charge: giftWrapCharge,
              isGift: formData.isGift,
              giftMessage: formData.giftMessage,
              recipientName: formData.recipientName,
              isForSomeoneElse: formData.isForSomeoneElse,
              recipientPhone: formData.recipientPhone,
              couponDetails: activeCoupon ? {
                code: activeCoupon.code,
                discountAmount: discount,
                finalAmount: grandTotal,
                ownerName: activeCoupon.ownerName
              } : undefined
            }
          })
        });

        const data = await response.json();

        if (data.success) {
          clearCart();
          addToast("Order placed successfully (COD)!", "success");
          router.push("/checkout/success");
        } else {
          throw new Error(data.error || "Checkout failed");
        }
      } catch (error: any) {
        addToast(error.message || "Checkout failed", "error");
        setIsProcessing(false);
      }
    }
  };

  // Redirect if cart is empty
  React.useEffect(() => {
    if (items.length === 0 && !isProcessing) {
      router.push("/cart");
    }
  }, [items.length, isProcessing, router]);

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <h1 className="text-3xl font-serif font-semibold text-foreground border-b border-secondary/50 pb-6 mb-8">
        Checkout
      </h1>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Checkout Form */}
        <div className="w-full lg:w-2/3">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Contact Info */}
            <div className="bg-primary/10 p-6 rounded-xl border border-primary/30">
              <h2 className="text-xl font-serif font-medium mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-foreground/80 mb-1">Phone Number</label>
                  <input
                    required
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full border border-secondary rounded-md px-4 py-2 bg-white text-sm focus:ring-1 focus:ring-rose focus:border-rose outline-none"
                    placeholder="+91 98888 12345"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground/80 mb-1">Email Address</label>
                  <input
                    required
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full border border-secondary rounded-md px-4 py-2 bg-white text-sm focus:ring-1 focus:ring-rose focus:border-rose outline-none"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="bg-primary/10 p-6 rounded-xl border border-primary/30">
              <h2 className="text-xl font-serif font-medium mb-4">Shipping Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-foreground/80 mb-1">First Name</label>
                  <input
                    required
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full border border-secondary rounded-md px-4 py-2 bg-white text-sm focus:ring-1 focus:ring-rose focus:border-rose outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-foreground/80 mb-1">Last Name</label>
                  <input
                    required
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full border border-secondary rounded-md px-4 py-2 bg-white text-sm focus:ring-1 focus:ring-rose focus:border-rose outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-foreground/80 mb-1">Address</label>
                  <input
                    required
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full border border-secondary rounded-md px-4 py-2 bg-white text-sm focus:ring-1 focus:ring-rose focus:border-rose outline-none"
                    placeholder="123 Main St"
                  />
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-foreground/80 mb-1">City</label>
                  <input
                    required
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full border border-secondary rounded-md px-4 py-2 bg-white text-sm focus:ring-1 focus:ring-rose focus:border-rose outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium text-foreground/80 mb-1">ZIP / Postal Code</label>
                  <input
                    required
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => {
                      handleInputChange(e);
                      if (e.target.value.length === 6) fetchPostalData(e.target.value);
                    }}
                    className="w-full border border-secondary rounded-md px-4 py-2 bg-white text-sm focus:ring-1 focus:ring-rose focus:border-rose outline-none"
                    placeholder="110001"
                  />
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-foreground/80 mb-1">State</label>
                  <input
                    required
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full border border-secondary rounded-md px-4 py-2 bg-white text-sm focus:ring-1 focus:ring-rose focus:border-rose outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="country" className="block text-sm font-medium text-foreground/80 mb-1">Country</label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full border border-secondary rounded-md px-4 py-2 bg-white text-sm focus:ring-1 focus:ring-rose focus:border-rose outline-none"
                  >
                    <option value="IN">India</option>
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="UK">United Kingdom</option>
                    <option value="AU">Australia</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Gifting & Options */}
            <div className="bg-primary/5 p-6 rounded-xl border border-primary/20 space-y-4">
              <h2 className="text-xl font-serif font-medium flex items-center gap-2">
                <Gift className="w-5 h-5 text-rose" />
                Order Options
              </h2>
              
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.isGift} 
                    onChange={(e) => setFormData(p => ({...p, isGift: e.target.checked}))}
                    className="w-4 h-4 accent-rose"
                  />
                  <span className="text-sm font-medium">This is a gift</span>
                </label>
                
                {formData.isGift && (
                  <div className="pl-7 space-y-3">
                    <input 
                      type="text" 
                      placeholder="Recipient Name"
                      value={formData.recipientName}
                      onChange={(e) => setFormData(p => ({...p, recipientName: e.target.value}))}
                      className="w-full border border-secondary rounded-md px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-rose"
                    />
                    <textarea 
                      placeholder="Add a gift message..."
                      value={formData.giftMessage}
                      onChange={(e) => setFormData(p => ({...p, giftMessage: e.target.value}))}
                      className="w-full border border-secondary rounded-md px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-rose h-20 resize-none"
                    />
                  </div>
                )}

                <label className="flex items-center gap-3 cursor-pointer pt-2 border-t border-primary/10">
                  <input 
                    type="checkbox" 
                    checked={formData.isForSomeoneElse} 
                    onChange={(e) => setFormData(p => ({...p, isForSomeoneElse: e.target.checked}))}
                    className="w-4 h-4 accent-rose"
                  />
                  <span className="text-sm font-medium">Order for someone else (Different shipping contact)</span>
                </label>

                {formData.isForSomeoneElse && (
                  <div className="pl-7 space-y-3">
                    <input 
                      type="tel" 
                      placeholder="Recipient Phone Number"
                      value={formData.recipientPhone}
                      onChange={(e) => setFormData(p => ({...p, recipientPhone: e.target.value}))}
                      className="w-full border border-secondary rounded-md px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-rose"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="bg-primary/10 p-6 rounded-xl border border-primary/30">
              <h2 className="text-xl font-serif font-medium mb-4">Payment Method</h2>
              <div className="space-y-3">
                {/* Razorpay Option */}
                <label className={`p-4 border rounded-md flex items-center justify-between cursor-pointer transition-all ${formData.paymentMethod === 'razorpay' ? 'border-rose bg-white ring-1 ring-rose' : 'border-secondary bg-white/50'}`}>
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="razorpay"
                      checked={formData.paymentMethod === 'razorpay'}
                      onChange={() => setFormData(p => ({...p, paymentMethod: 'razorpay'}))}
                      className="text-rose focus:ring-rose accent-rose" 
                    />
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">Pay Securely (Cards, UPI, Netbanking)</span>
                      <span className="text-xs text-foreground/60">Secure payment powered by Razorpay</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-foreground/40">
                    <CreditCard className="w-5 h-5" />
                    <Smartphone className="w-5 h-5" />
                  </div>
                </label>

                {/* COD Option */}
                <label className={`p-4 border rounded-md flex items-center justify-between cursor-pointer transition-all ${formData.paymentMethod === 'cod' ? 'border-rose bg-white ring-1 ring-rose' : 'border-secondary bg-white/50'}`}>
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={() => setFormData(p => ({...p, paymentMethod: 'cod'}))}
                      className="text-rose focus:ring-rose accent-rose" 
                    />
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">Cash on Delivery (COD)</span>
                      <span className="text-xs text-foreground/60">Pay when your order arrives</span>
                    </div>
                  </div>
                  <User className="w-5 h-5 text-foreground/40" />
                </label>
              </div>
              <p className="mt-4 text-[10px] text-foreground/40 flex items-center gap-1">
                <Info className="w-3 h-3" />
                Online payments are encrypted and processed by Razorpay. We do not store your card details.
              </p>
            </div>

            <button
              type="submit"
              disabled={isProcessing || isVerifyingPayment}
              className="w-full bg-foreground text-white py-4 rounded-md font-medium hover:bg-rose transition-all flex justify-center items-center h-14 disabled:bg-foreground/70"
            >
              {isVerifyingPayment ? (
                <div className="flex items-center gap-2">
                  <Loader size="sm" />
                  <span>Verifying Payment with Bank...</span>
                </div>
              ) : isProcessing ? (
                <Loader size="sm" />
              ) : (
                `Pay ${formatPrice(grandTotal)}`
              )}
            </button>
          </form>
        </div>

        {/* Order Summary Sidebar */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white border text-foreground/90 border-secondary rounded-xl p-6 sticky top-24">
            <h2 className="text-xl font-serif font-semibold mb-6">In your bag</h2>
            
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-16 h-20 bg-secondary rounded-md flex-shrink-0 overflow-hidden">
                    <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col justify-center flex-1">
                    <p className="text-sm font-medium line-clamp-1">{item.product.name}</p>
                    <p className="text-xs text-foreground/60 mb-2">Qty: {item.quantity}</p>
                    <p className="text-sm font-medium">{formatPrice(item.product.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon Section */}
            <div className="mb-6 pt-6 border-t border-secondary">
              {!activeCoupon ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                      <input 
                        type="text" 
                        placeholder="Discount code" 
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="w-full pl-9 pr-4 py-2 border border-secondary rounded-md text-sm focus:outline-none focus:border-rose focus:ring-1 focus:ring-rose uppercase"
                      />
                    </div>
                    <button 
                      type="button" 
                      onClick={handleApplyCoupon}
                      disabled={isValidatingCoupon || !couponCode}
                      className="bg-foreground text-white px-4 rounded-md text-sm font-medium hover:bg-rose transition-colors disabled:opacity-50"
                    >
                      {isValidatingCoupon ? <Loader size="sm" /> : "Apply"}
                    </button>
                  </div>
                  {couponError && <p className="text-xs text-rose">{couponError}</p>}
                </div>
              ) : (
                <div className="bg-sage/10 border border-sage/30 rounded-md p-3 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-sage" />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-sage">{activeCoupon.code}</span>
                      <span className="text-xs text-foreground/60">{activeCoupon.discountPercentage}% off your order</span>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={handleRemoveCoupon}
                    className="text-xs font-medium text-rose hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            <div className="border-t border-secondary pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-foreground/70">Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-foreground/70">Shipping</span>
                <span>{deliveryCharge === 0 ? "Free" : formatPrice(deliveryCharge)}</span>
              </div>
              {activeCoupon && (
                <div className="flex justify-between text-sm text-sage font-medium">
                  <span>Discount ({activeCoupon.code})</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-1.5">
                  <span className="text-foreground/70">GST (5%)</span>
                  <span title="Goods and Services Tax as per Indian regulation" className="cursor-help flex items-center">
                    <Info className="w-3 h-3 text-foreground/30" />
                  </span>
                </div>
                <span>{formatPrice(gstAmount)}</span>
              </div>
              {formData.isGift && (
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/70">Gift Wrap</span>
                  <span>{formatPrice(GIFT_WRAP_FEE)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-serif font-semibold pt-3 border-t border-secondary">
                <span>Total</span>
                <span>{formatPrice(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Guard Modal */}
      <Modal
        isOpen={showAuthModal}
        onClose={() => {
          if (!user) router.push("/cart");
          else setShowAuthModal(false);
        }}
        title="Sign In Required"
        className="max-w-md"
      >
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-rose/10 rounded-full flex items-center justify-center mx-auto mb-6 text-rose">
            <LogIn className="w-8 h-8" />
          </div>
          <p className="text-foreground/80 mb-8 leading-relaxed">
            Please sign in to your account to complete your purchase and track your orders. It only takes a moment!
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleLoginRedirect}
              className="w-full bg-foreground text-white py-3 rounded-md font-medium hover:bg-rose transition-colors"
            >
              Sign In Now
            </button>
            <button
              onClick={() => router.push("/cart")}
              className="w-full text-foreground/60 text-sm hover:underline"
            >
              Return to Cart
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
