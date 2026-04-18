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
import { Tag, LogIn, Gift, User, CreditCard, Smartphone, Info, Mail, Phone, MapPin, Package } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { isCODAvailable } from "@/lib/delivery";

// Constants for delivery logic
const TRICITY_CITIES = ["CHANDIGARH", "MOHALI", "PANCHKULA", "ZIRAKPUR", "KHARAR","RUPNAGAR"];
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
  const isTricity = isCODAvailable(formData.city);
  let deliveryCharge = 0;
  if (isTricity) {
    deliveryCharge = total > 499 ? 0 : 50;
  } else {
    deliveryCharge = total > 799 ? 0 : 80;
  }

  // Override if Free Shipping Coupon is applied
  if (activeCoupon?.isFreeShipping) {
    deliveryCharge = 0;
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

  // Switch payment method if COD becomes unavailable
  React.useEffect(() => {
    if (formData.paymentMethod === "cod" && !isCODAvailable(formData.city)) {
      setFormData(prev => ({ ...prev, paymentMethod: "razorpay" }));
    }
  }, [formData.city, formData.paymentMethod]);

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

  const renderOrderSummary = (isMobile = false) => (
    <div className={`bg-white border text-foreground/90 border-foreground/20 rounded-xl p-6 shadow-sm ${!isMobile ? 'sticky top-24' : ''}`}>
      <h2 className="text-xl font-serif font-semibold mb-6 flex items-center gap-2">
        <Package className="w-5 h-5 text-rose" />
        {isMobile ? "Review Your Order" : "In your bag"}
      </h2>
      
      <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4">
            <div className="w-16 h-20 bg-secondary rounded-md flex-shrink-0 overflow-hidden shadow-sm">
              <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col justify-center flex-1">
              <p className="text-sm font-medium line-clamp-1">{item.product.name}</p>
              <p className="text-xs text-foreground/60 mb-1">Qty: {item.quantity}</p>
              <p className="text-sm font-semibold">{formatPrice(item.product.price * item.quantity)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Coupon Section */}
      <div className="mb-6 pt-6 border-t border-secondary">
        {!activeCoupon ? (
          <div className="space-y-2">
            <p className="text-xs font-medium text-foreground/60 uppercase tracking-wider mb-2">Have a discount code?</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                <input 
                  type="text" 
                  placeholder="CODE" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="w-full pl-9 pr-4 py-2 border border-secondary rounded-md text-sm focus:outline-none focus:border-rose focus:ring-1 focus:ring-rose uppercase placeholder:text-foreground/20"
                />
              </div>
              <button 
                type="button" 
                onClick={handleApplyCoupon}
                disabled={isValidatingCoupon || !couponCode}
                className="bg-foreground text-white px-5 rounded-md text-sm font-medium hover:bg-rose transition-colors disabled:opacity-50"
              >
                {isValidatingCoupon ? <Loader size="sm" /> : "Apply"}
              </button>
            </div>
            {couponError && <p className="text-xs text-rose">{couponError}</p>}
          </div>
        ) : (
          <div className="bg-rose/5 border border-rose/20 rounded-lg p-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="bg-rose/10 p-1.5 rounded-full">
                <Tag className="w-3.5 h-3.5 text-rose" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-rose">{activeCoupon.code}</span>
                <span className="text-[10px] text-foreground/60">{activeCoupon.discountPercentage}% off applied</span>
              </div>
            </div>
            <button 
              type="button" 
              onClick={handleRemoveCoupon}
              className="text-xs font-semibold text-rose hover:underline px-2"
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
          <span className="font-medium text-sage">{deliveryCharge === 0 ? "FREE" : formatPrice(deliveryCharge)}</span>
        </div>
        {activeCoupon && (
          <div className="flex justify-between text-sm text-sage font-semibold">
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
        <div className="flex justify-between text-lg font-serif font-bold pt-4 border-t-2 border-primary/10">
          <span>Final Amount</span>
          <span className="text-rose">{formatPrice(grandTotal)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground border-b border-secondary pb-6 mb-10">
        Checkout
      </h1>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Main Section */}
        <div className="w-full lg:w-2/3">
          <form onSubmit={handleSubmit} className="flex flex-col">
            
            {/* Step 1: Order Review (Mobile Only - Top) */}
            <div className="lg:hidden mb-10">
              {renderOrderSummary(true)}
            </div>

            <div className="space-y-10">
              {/* Step 2: Delivery Details */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-rose text-white flex items-center justify-center font-serif font-bold text-sm">1</div>
                  <h2 className="text-2xl font-serif font-semibold">Delivery Details</h2>
                </div>

                {/* Personal Info Group */}
                <div className="bg-primary/5 p-6 rounded-2xl border border-foreground/10 space-y-6">
                  <div className="flex items-center gap-2 text-foreground/60 mb-2">
                    <User className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Personal Information</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="relative">
                      <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-widest mb-1.5 ml-1">First Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
                        <input
                          required
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="w-full border border-foreground/20 rounded-xl pl-11 pr-4 py-3 bg-white text-sm focus:ring-2 focus:ring-rose/20 focus:border-rose outline-none transition-all"
                          placeholder="Manu"
                        />
                      </div>
                    </div>
                    <div className="relative">
                      <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-widest mb-1.5 ml-1">Last Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
                        <input
                          required
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="w-full border border-foreground/20 rounded-xl pl-11 pr-4 py-3 bg-white text-sm focus:ring-2 focus:ring-rose/20 focus:border-rose outline-none transition-all"
                          placeholder="Jindal"
                        />
                      </div>
                    </div>
                    <div className="relative">
                      <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-widest mb-1.5 ml-1">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
                        <input
                          required
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full border border-foreground/20 rounded-xl pl-11 pr-4 py-3 bg-white text-sm focus:ring-2 focus:ring-rose/20 focus:border-rose outline-none transition-all placeholder:text-foreground/30"
                          placeholder="9876543210"
                        />
                      </div>
                    </div>
                    <div className="relative">
                      <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
                        <input
                          required
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full border border-foreground/20 rounded-xl pl-11 pr-4 py-3 bg-white text-sm focus:ring-2 focus:ring-rose/20 focus:border-rose outline-none transition-all placeholder:text-foreground/30"
                          placeholder="name@email.com"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping Location Group */}
                <div className="bg-primary/5 p-6 rounded-2xl border border-foreground/10 space-y-6">
                  <div className="flex items-center gap-2 text-foreground/60 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Shipping Address</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2 relative">
                      <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-widest mb-1.5 ml-1">Street Address</label>
                      <input
                        required
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full border border-foreground/20 rounded-xl px-4 py-3 bg-white text-sm focus:ring-2 focus:ring-rose/20 focus:border-rose outline-none transition-all"
                        placeholder="House No., Street Name, Area"
                      />
                    </div>
                    <div className="relative">
                      <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-widest mb-1.5 ml-1">Pincode</label>
                      <input
                        required
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={(e) => {
                          handleInputChange(e);
                          if (e.target.value.length === 6) fetchPostalData(e.target.value);
                        }}
                        className="w-full border border-foreground/30 rounded-xl px-4 py-3 bg-white text-sm focus:ring-2 focus:ring-rose/20 focus:border-rose outline-none transition-all font-mono"
                        placeholder="110001"
                      />
                    </div>
                    <div className="relative">
                      <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-widest mb-1.5 ml-1">City</label>
                      <input
                        required
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full border border-foreground/20 rounded-xl px-4 py-3 bg-white text-sm focus:ring-2 focus:ring-rose/20 focus:border-rose outline-none transition-all"
                      />
                    </div>
                    <div className="relative">
                      <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-widest mb-1.5 ml-1">State</label>
                      <input
                        required
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full border border-foreground/20 rounded-xl px-4 py-3 bg-white text-sm focus:ring-2 focus:ring-rose/20 focus:border-rose outline-none transition-all"
                      />
                    </div>
                    <div className="relative">
                      <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-widest mb-1.5 ml-1">Country</label>
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full border border-foreground/30 rounded-xl px-4 py-3 bg-white text-sm focus:ring-2 focus:ring-rose/20 focus:border-rose outline-none transition-all appearance-none"
                      >
                        <option value="IN">India</option>
                        <option value="US">United States</option>
                        <option value="UK">United Kingdom</option>
                        <option value="AU">Australia</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Gifting & Options */}
                <div className="bg-sage/5 p-6 rounded-2xl border border-sage/20 space-y-4">
                  <div className="flex items-center gap-2 text-sage mb-1">
                    <Gift className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Extra Options</span>
                  </div>
                  
                  <div className="space-y-4 pt-1">
                    <label className="flex items-center gap-4 cursor-pointer group">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${formData.isGift ? 'bg-rose border-rose shadow-sm shadow-rose/20' : 'border-foreground/30 group-hover:border-rose'}`}>
                        {formData.isGift && <div className="w-2.5 h-1.5 border-l-2 border-b-2 border-white -rotate-45 mb-0.5" />}
                      </div>
                      <input 
                        type="checkbox" 
                        checked={formData.isGift} 
                        onChange={(e) => setFormData(p => ({...p, isGift: e.target.checked}))}
                        className="hidden"
                      />
                      <span className="text-sm font-medium text-foreground/80">This is a gift (+{formatPrice(GIFT_WRAP_FEE)})</span>
                    </label>
                    
                    {formData.isGift && (
                      <div className="pl-9 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <input 
                          type="text" 
                          placeholder="Recipient Name"
                          value={formData.recipientName}
                          onChange={(e) => setFormData(p => ({...p, recipientName: e.target.value}))}
                          className="w-full border border-secondary rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-rose/20 focus:border-rose"
                        />
                        <textarea 
                          placeholder="Add a sweet gift message..."
                          value={formData.giftMessage}
                          onChange={(e) => setFormData(p => ({...p, giftMessage: e.target.value}))}
                          className="w-full border border-secondary rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-rose/20 focus:border-rose h-24 resize-none"
                        />
                      </div>
                    )}

                    <label className="flex items-center gap-4 cursor-pointer pt-2 group">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${formData.isForSomeoneElse ? 'bg-rose border-rose shadow-sm shadow-rose/20' : 'border-foreground/30 group-hover:border-rose'}`}>
                        {formData.isForSomeoneElse && <div className="w-2.5 h-1.5 border-l-2 border-b-2 border-white -rotate-45 mb-0.5" />}
                      </div>
                      <input 
                        type="checkbox" 
                        checked={formData.isForSomeoneElse} 
                        onChange={(e) => setFormData(p => ({...p, isForSomeoneElse: e.target.checked}))}
                        className="hidden"
                      />
                      <span className="text-sm font-medium text-foreground/80">Sending to someone else?</span>
                    </label>

                    {formData.isForSomeoneElse && (
                      <div className="pl-9 animate-in fade-in slide-in-from-top-2 duration-300">
                        <input 
                          type="tel" 
                          placeholder="Recipient Phone Number"
                          value={formData.recipientPhone}
                          onChange={(e) => setFormData(p => ({...p, recipientPhone: e.target.value}))}
                          className="w-full border border-secondary rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-rose/20 focus:border-rose"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Step 3: Payment Section */}
              <div className="space-y-6 pt-2 border-t border-secondary/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-rose text-white flex items-center justify-center font-serif font-bold text-sm">2</div>
                  <h2 className="text-2xl font-serif font-semibold">Payment Method</h2>
                </div>

                <div className="space-y-4">
                  {/* Razorpay Option */}
                  <label className={`p-5 border-2 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${formData.paymentMethod === 'razorpay' ? 'border-rose bg-rose/5 ring-1 ring-rose' : 'border-foreground/10 bg-white hover:border-rose/50'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.paymentMethod === 'razorpay' ? 'border-rose' : 'border-secondary'}`}>
                        {formData.paymentMethod === 'razorpay' && <div className="w-2.5 h-2.5 bg-rose rounded-full" />}
                      </div>
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="razorpay"
                        checked={formData.paymentMethod === 'razorpay'}
                        onChange={() => setFormData(p => ({...p, paymentMethod: 'razorpay'}))}
                        className="hidden" 
                      />
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">Online Payment</span>
                        <span className="text-xs text-foreground/60">Pay via UPI, Cards, Netbanking</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-foreground/30">
                      <CreditCard className="w-5 h-5" />
                      <Smartphone className="w-5 h-5" />
                    </div>
                  </label>

                  {/* COD Option */}
                  {isCODAvailable(formData.city) && (
                    <label className={`p-5 border-2 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${formData.paymentMethod === 'cod' ? 'border-rose bg-rose/5 ring-1 ring-rose' : 'border-foreground/10 bg-white hover:border-rose/50'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.paymentMethod === 'cod' ? 'border-rose' : 'border-secondary'}`}>
                          {formData.paymentMethod === 'cod' && <div className="w-2.5 h-2.5 bg-rose rounded-full" />}
                        </div>
                        <input 
                          type="radio" 
                          name="paymentMethod" 
                          value="cod"
                          checked={formData.paymentMethod === 'cod'}
                          onChange={() => setFormData(p => ({...p, paymentMethod: 'cod'}))}
                          className="hidden" 
                        />
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">Cash on Delivery (COD)</span>
                          <span className="text-xs text-foreground/60">Pay at the time of delivery</span>
                        </div>
                      </div>
                      <Package className="w-5 h-5 text-foreground/30" />
                    </label>
                  )}
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isProcessing || isVerifyingPayment}
                    className="w-full bg-foreground text-white py-5 rounded-2xl font-bold hover:bg-rose transition-all flex justify-center items-center h-16 disabled:bg-foreground/70 shadow-lg shadow-foreground/10 active:scale-[0.98]"
                  >
                    {isVerifyingPayment ? (
                      <div className="flex items-center gap-3">
                        <Loader size="sm" />
                        <span>Confirming with Bank...</span>
                      </div>
                    ) : isProcessing ? (
                      <Loader size="sm" />
                    ) : (
                      `Complete Order • ${formatPrice(grandTotal)}`
                    )}
                  </button>
                  <p className="mt-4 text-[10px] text-foreground/40 text-center flex items-center justify-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    Payments are encrypted and processed by Razorpay. Safe & Secure.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Desktop Sidebar (Hidden on mobile) */}
        <div className="hidden lg:block lg:w-1/3">
          {renderOrderSummary()}
        </div>
      </div>

      {/* Auth Guard Modal */}
      <Modal
        isOpen={showAuthModal}
        onClose={() => {
          if (!user) router.push("/cart");
          else setShowAuthModal(false);
        }}
        title="Welcome to Checkout"
        className="max-w-md"
      >
        <div className="text-center py-6">
          <div className="w-20 h-20 bg-rose/10 rounded-full flex items-center justify-center mx-auto mb-6 text-rose">
            <User className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-serif font-bold mb-3">Almost there!</h3>
          <p className="text-foreground/70 mb-8 leading-relaxed text-sm px-4">
            Please sign in to complete your checkout. This helps us track your order and store your preferences.
          </p>
          <div className="flex flex-col gap-4">
            <button
              onClick={handleLoginRedirect}
              className="w-full bg-foreground text-white py-4 rounded-xl font-bold hover:bg-rose transition-colors shadow-md transition-all active:scale-[0.98]"
            >
              Sign In to Continue
            </button>
            <button
              onClick={() => router.push("/cart")}
              className="w-full text-foreground/50 text-sm hover:underline font-medium"
            >
              Go back to bag
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
