"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, CreditCard, ShieldCheck, Ticket, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/components/storefront/cart-provider";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/components/providers/auth-provider";
import Script from "next/script";
import { formatCurrency } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const steps = ["Shipping", "Payment", "Review"];

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const { addToast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const toastFired = React.useRef(false);

  const supabase = React.useMemo(() => createClient(), []);

  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = React.useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = React.useState<string>("");

  // Coupon State
  const [couponCode, setCouponCode] = React.useState("");
  const [appliedCoupon, setAppliedCoupon] = React.useState<any>(null);
  const [couponError, setCouponError] = React.useState<string | null>(null);

  // New Account Signup State
  const [signupPassword, setSignupPassword] = React.useState("");

  // Payment Methods State
  const [supportedPaymentMethods, setSupportedPaymentMethods] = React.useState<string[]>(["Cash", "Razorpay", "UPI", "Net Banking"]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState<string>("Razorpay");

  // Form State
  const [formData, setFormData] = React.useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "IN",
  });

  // Redirect if not authenticated (prevent duplicate toasts via ref)
  React.useEffect(() => {
    if (!authLoading && !user && !toastFired.current) {
      toastFired.current = true;
      addToast({
        title: "Authentication Required",
        description: "Please sign in to proceed with your checkout.",
        type: "info"
      });
      router.push("/account?redirect=/checkout");
    }
  }, [user, authLoading, router, addToast]);

  // Load Saved Addresses
  React.useEffect(() => {
    if (user) {
      async function fetchAddresses() {
        if (!user) return;
        try {
          const { data } = await supabase
            .from("addresses")
            .select("*")
            .eq("user_id", user.id);
          
          if (data && data.length > 0) {
            setSavedAddresses(data);
            const def = data.find((a: any) => a.is_default) || data[0];
            setSelectedAddressId(def.id);
            
            const [firstName = "", ...lastNames] = (def.full_name || "").split(" ");
            const lastName = lastNames.join(" ");
            
            setFormData({
              email: user.email || "",
              firstName,
              lastName,
              address: def.address_line1 + (def.address_line2 ? `, ${def.address_line2}` : ""),
              city: def.city,
              state: def.state || "",
              zip: def.zip || "",
              country: def.country || "IN",
            });
          } else {
            setFormData(prev => ({ ...prev, email: user.email || "" }));
          }
        } catch (e) {
          console.error("Failed to load user addresses:", e);
        }
      }
      fetchAddresses();
    }
  }, [user, supabase]);

  // Load Enabled Payment Methods from settings
  React.useEffect(() => {
    async function fetchSiteSettings() {
      try {
        const { data } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();
        if (data) {
          let paymentMethods = data.payment_methods;
          if (!paymentMethods) {
            const local = localStorage.getItem("site_payment_methods");
            paymentMethods = local ? JSON.parse(local) : ["Cash", "Razorpay", "UPI", "Net Banking"];
          }
          if (paymentMethods && paymentMethods.length > 0) {
            setSupportedPaymentMethods(paymentMethods);
            if (paymentMethods.includes("Razorpay")) {
              setSelectedPaymentMethod("Razorpay");
            } else {
              setSelectedPaymentMethod(paymentMethods[0]);
            }
          }
        }
      } catch (e) {
        console.error("Failed to load payment options:", e);
      }
    }
    fetchSiteSettings();
  }, [supabase]);

  // Persist Coupon code through navigation
  React.useEffect(() => {
    try {
      const stored = sessionStorage.getItem("applied_checkout_coupon");
      if (stored) {
        setAppliedCoupon(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load stored checkout coupon:", e);
    }
  }, []);

  React.useEffect(() => {
    try {
      if (appliedCoupon) {
        sessionStorage.setItem("applied_checkout_coupon", JSON.stringify(appliedCoupon));
      } else {
        sessionStorage.removeItem("applied_checkout_coupon");
      }
    } catch (e) {
      console.error(e);
    }
  }, [appliedCoupon]);

  // Handle Saved Address Selection
  const handleAddressSelect = (id: string) => {
    setSelectedAddressId(id);
    const addr = savedAddresses.find((a: any) => a.id === id);
    if (addr) {
      const [firstName = "", ...lastNames] = (addr.full_name || "").split(" ");
      const lastName = lastNames.join(" ");
      setFormData({
        email: user?.email || "",
        firstName,
        lastName,
        address: addr.address_line1 + (addr.address_line2 ? `, ${addr.address_line2}` : ""),
        city: addr.city,
        state: addr.state || "",
        zip: addr.zip || "",
        country: addr.country || "IN",
      });
    }
  };

  // Validate Promo Coupon
  const handleApplyCoupon = async () => {
    setCouponError(null);
    if (!couponCode.trim()) return;
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", couponCode.trim().toUpperCase())
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        setCouponError("Invalid coupon code.");
        return;
      }

      const now = new Date();
      if (data.valid_from && new Date(data.valid_from) > now) {
        setCouponError("Coupon is not active yet.");
        return;
      }
      if (data.valid_to && new Date(data.valid_to) < now) {
        setCouponError("Coupon has expired.");
        return;
      }

      if (data.usage_limit && data.times_used >= data.usage_limit) {
        setCouponError("Coupon usage limit has been reached.");
        return;
      }

      if (data.min_order_amount && subtotal < Number(data.min_order_amount)) {
        setCouponError(`Minimum spend of ${formatCurrency(Number(data.min_order_amount))} required.`);
        return;
      }

      setAppliedCoupon(data);
      addToast({ title: "Coupon Applied", description: `Promo code ${data.code} applied successfully!`, type: "success" });
    } catch (err: any) {
      console.error(err);
      setCouponError("Failed to validate coupon.");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError(null);
  };

  // Calculations
  const discount = appliedCoupon 
    ? (appliedCoupon.type === "percentage" 
        ? (subtotal * Number(appliedCoupon.value)) / 100 
        : Number(appliedCoupon.value))
    : 0;

  const taxableAmount = Math.max(0, subtotal - discount);
  const shippingCost = subtotal > 3000 ? 0 : 150;
  const taxRate = 0.18; // 18% GST
  const tax = taxableAmount * taxRate;
  const total = taxableAmount + shippingCost + tax;

  if (authLoading || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] py-24 bg-[#FAFAFA]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1A1A1A] mb-4" />
        <p className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">Verifying session...</p>
      </div>
    );
  }

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === 0) {
      const emailChanged = user && formData.email && formData.email.toLowerCase() !== user.email?.toLowerCase();
      if (emailChanged) {
        if (!signupPassword) {
          addToast({
            title: "Password Required",
            description: "Please enter a password to register your new account.",
            type: "error"
          });
          return;
        }
        const hasCapital = /[A-Z]/.test(signupPassword);
        const hasLowercase = /[a-z]/.test(signupPassword);
        const hasNumber = /[0-9]/.test(signupPassword);
        if (signupPassword.length < 6 || !hasCapital || !hasLowercase || !hasNumber) {
          addToast({
            title: "Weak Password",
            description: "Password must be at least 6 characters and contain at least one capital letter, one lowercase letter, and one number.",
            type: "error"
          });
          return;
        }
      }
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePlaceOrder = async () => {
    try {
      setIsProcessing(true);

      let activeUserId = user?.id || null;
      const emailChanged = user && formData.email && formData.email.toLowerCase() !== user.email?.toLowerCase();
      
      if (emailChanged) {
        if (!signupPassword) {
          addToast({
            title: "Password Required",
            description: "Please enter a password to register your new account.",
            type: "error"
          });
          setIsProcessing(false);
          return;
        }
        const hasCapital = /[A-Z]/.test(signupPassword);
        const hasLowercase = /[a-z]/.test(signupPassword);
        const hasNumber = /[0-9]/.test(signupPassword);
        if (signupPassword.length < 6 || !hasCapital || !hasLowercase || !hasNumber) {
          addToast({
            title: "Weak Password",
            description: "Password must be at least 6 characters and contain at least one capital letter, one lowercase letter, and one number.",
            type: "error"
          });
          setIsProcessing(false);
          return;
        }

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: signupPassword,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              full_name: `${formData.firstName} ${formData.lastName}`,
            }
          }
        });

        if (signUpError) {
          addToast({ title: "Registration failed", description: signUpError.message, type: "error" });
          setIsProcessing(false);
          return;
        }

        if (signUpData.user) {
          activeUserId = signUpData.user.id;
          localStorage.setItem("current_user_password", signupPassword);
          addToast({ title: "Account registered successfully!", type: "success" });
        }
      }

      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          currency: "INR",
          items,
          shippingInfo: formData,
          couponCode: appliedCoupon?.code || null,
          discountAmount: discount,
          paymentMethod: selectedPaymentMethod,
          userId: activeUserId
        }),
      });

      const orderData = await res.json();

      if (!res.ok) {
        throw new Error(orderData.error || "Failed to create order");
      }

      // Check if selected payment method is not Razorpay, OR if it's Mock mode order
      const isCash = selectedPaymentMethod === "Cash";
      const isMock = orderData.id.startsWith("order_mock_");

      if (isCash || isMock) {
        addToast({ 
          title: isCash ? "Order Submitting..." : "Mock Checkout: Connecting...", 
          description: isCash ? "Registering Cash on Delivery order." : "Simulating order validation.", 
          type: "success" 
        });
        
        setTimeout(async () => {
          try {
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: orderData.id,
                razorpay_payment_id: isCash ? `pay_cash_${Math.random().toString(36).substring(2, 15)}` : `pay_mock_${Math.random().toString(36).substring(2, 15)}`,
                razorpay_signature: isCash ? "cash_on_delivery" : "mock_signature_bypass",
                order_number: orderData.order_number
              }),
            });
            
            const verifyData = await verifyRes.json();
            
            if (verifyRes.ok) {
              addToast({ title: isCash ? "Order placed successfully!" : "Payment verified successfully!", type: "success" });
              clearCart();
              setAppliedCoupon(null);
              sessionStorage.removeItem("applied_checkout_coupon");
              router.push(`/order-confirmation?number=${verifyData.order_number || orderData.order_number || ""}`);
            } else {
              addToast({ title: verifyData.error || "Verification failed", type: "error" });
            }
          } catch (err) {
            addToast({ title: "Failed to verify order registration", type: "error" });
          } finally {
            setIsProcessing(false);
          }
        }, 1500);
        return;
      }

      // Real Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_PUBLISHABLE_KEY,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "PREMIUM.",
        description: "Transaction Purchase",
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                order_number: orderData.order_number
              }),
            });
            
            const verifyData = await verifyRes.json();
            
            if (verifyRes.ok) {
              addToast({ title: "Payment successful! Order placed.", type: "success" });
              clearCart();
              setAppliedCoupon(null);
              sessionStorage.removeItem("applied_checkout_coupon");
              router.push(`/order-confirmation?number=${verifyData.order_number || orderData.order_number || ""}`);
            } else {
              addToast({ title: verifyData.error || "Payment verification failed", type: "error" });
            }
          } catch (err) {
            addToast({ title: "Payment verification failed", type: "error" });
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
        },
        theme: {
          color: "#1A1A1A",
        },
      };

      const rzp1 = new window.Razorpay(options);
      
      rzp1.on("payment.failed", function (response: any) {
        addToast({ title: "Payment failed or cancelled.", type: "error" });
      });
      
      rzp1.open();
      setIsProcessing(false);

    } catch (error: any) {
      console.error(error);
      addToast({ title: error.message || "Failed to process checkout", type: "error" });
      setIsProcessing(false);
    }
  };

  if (items.length === 0 && currentStep === 0) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <h1 className="font-serif text-3xl mb-4 text-[#1A1A1A]">Checkout</h1>
        <p className="text-[#6B6B6B] text-sm mb-8 leading-relaxed">Your shopping bag is empty. Please add items before proceeding to checkout.</p>
        <Link href="/products">
          <Button className="h-12 px-6 uppercase tracking-wider text-xs font-bold shadow-sm shimmer-btn">Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="mx-auto max-w-[1440px] px-6 lg:px-16 py-12">
        <div className="mb-12 text-center space-y-2">
          <p className="text-caption text-[#9CA3AF]">Checkout sequence</p>
          <h1 className="font-serif text-4xl text-[#1A1A1A]">Secure Checkout</h1>
        </div>

        {/* Step Indicator */}
        <div className="relative mb-16 max-w-xl mx-auto">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[#F5F5F0] -translate-y-1/2 rounded-full" />
          <motion.div
            className="absolute top-1/2 left-0 h-0.5 bg-[#1A1A1A] -translate-y-1/2 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          />
          <div className="relative flex justify-between">
            {steps.map((step, index) => {
              const isCompleted = index < currentStep;
              const isActive = index === currentStep;
              return (
                <div key={step} className="flex flex-col items-center">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full border transition-all duration-300 bg-white ${
                      isCompleted || isActive
                        ? "border-[#1A1A1A] text-[#1A1A1A]"
                        : "border-[rgba(0,0,0,0.08)] text-[#9CA3AF]"
                    }`}
                  >
                    {isCompleted ? <Check className="h-3.5 w-3.5" /> : <span className="text-xs font-bold">{index + 1}</span>}
                  </div>
                  <span
                    className={`mt-2.5 text-[9px] font-bold uppercase tracking-widest ${
                      isActive ? "text-[#1A1A1A]" : "text-[#9CA3AF]"
                    }`}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Main Content Area */}
          <div className="w-full lg:w-3/5">
            <div className="bg-white rounded-2xl border border-[rgba(0,0,0,0.06)] p-6 md:p-8 shadow-sm">
              <AnimatePresence mode="wait">
                {currentStep === 0 && (
                  <motion.form
                    key="shipping"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleNext}
                    className="space-y-8"
                  >
                    <div>
                      {savedAddresses.length > 0 && (
                        <div className="mb-6 bg-[#FAFAFA] border border-[rgba(0,0,0,0.06)] p-4 rounded-xl space-y-2">
                          <label className="block text-[9px] font-bold text-[#6B6B6B] uppercase tracking-widest">Deliver to a Saved Address</label>
                          <select
                            value={selectedAddressId}
                            onChange={(e) => handleAddressSelect(e.target.value)}
                            className="w-full rounded-lg border border-[rgba(0,0,0,0.08)] bg-white px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#1A1A1A] outline-none h-10"
                          >
                            {savedAddresses.map((a: any) => (
                              <option key={a.id} value={a.id}>
                                {a.full_name} — {a.address_line1}, {a.city} {a.is_default ? "(Default)" : ""}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      <h2 className="text-base font-bold text-[#1A1A1A] uppercase tracking-wider mb-6">Contact Information</h2>
                      <div className="space-y-4">
                        <Input 
                          label="Email address" 
                          type="email" 
                          required 
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                        {user && formData.email && formData.email.toLowerCase() !== user.email?.toLowerCase() && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="space-y-2 pt-2"
                          >
                            <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">
                              You entered a different email address. Set a password to register it as a new account:
                            </p>
                            <Input
                              label="New Account Password"
                              type="password"
                              required
                              value={signupPassword}
                              onChange={(e) => setSignupPassword(e.target.value)}
                            />
                            {/* Live password strength checklist */}
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1">
                              {[
                                { label: "6+ characters", met: signupPassword.length >= 6 },
                                { label: "Uppercase letter", met: /[A-Z]/.test(signupPassword) },
                                { label: "Lowercase letter", met: /[a-z]/.test(signupPassword) },
                                { label: "A number", met: /[0-9]/.test(signupPassword) },
                              ].map((rule) => (
                                <div key={rule.label} className="flex items-center gap-1.5">
                                  <span className={`text-[11px] transition-colors ${rule.met ? "text-green-600" : "text-[#C4C4C4]"}`}>
                                    {rule.met ? "✓" : "○"}
                                  </span>
                                  <span className={`text-[10px] font-medium transition-colors ${rule.met ? "text-green-700" : "text-[#9CA3AF]"}`}>
                                    {rule.label}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h2 className="text-base font-bold text-[#1A1A1A] uppercase tracking-wider mb-6">Shipping Address</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input 
                          label="First name" 
                          required 
                          value={formData.firstName}
                          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        />
                        <Input 
                          label="Last name" 
                          required 
                          value={formData.lastName}
                          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        />
                        <div className="md:col-span-2">
                          <Input 
                            label="Address" 
                            required 
                            value={formData.address}
                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                          />
                        </div>
                        <Input 
                          label="City" 
                          required 
                          value={formData.city}
                          onChange={(e) => setFormData({...formData, city: e.target.value})}
                        />
                        <Input 
                          label="State / Province" 
                          required 
                          value={formData.state}
                          onChange={(e) => setFormData({...formData, state: e.target.value})}
                        />
                        <Input 
                          label="ZIP / Postal Code" 
                          required 
                          value={formData.zip}
                          onChange={(e) => setFormData({...formData, zip: e.target.value})}
                        />
                        <Input 
                          label="Country" 
                          required 
                          value={formData.country}
                          onChange={(e) => setFormData({...formData, country: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <h2 className="text-base font-bold text-[#1A1A1A] uppercase tracking-wider mb-6">Shipping Method</h2>
                      <div className="space-y-3">
                        <label className="flex items-center justify-between rounded-xl border border-[#1A1A1A] bg-[#FAFAFA] p-4 cursor-pointer">
                          <div className="flex items-center space-x-3">
                            <input type="radio" name="shipping" className="h-4 w-4 text-[#1A1A1A] focus:ring-[#1A1A1A]" defaultChecked />
                            <div>
                              <p className="font-bold text-xs uppercase tracking-wider text-[#1A1A1A]">Standard Shipping</p>
                              <p className="text-xs text-[#9CA3AF] mt-0.5">3-5 business days</p>
                            </div>
                          </div>
                          <span className="font-bold text-sm text-[#1A1A1A]">
                            {shippingCost === 0 ? "Free" : formatCurrency(shippingCost)}
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end pt-6 border-t border-[rgba(0,0,0,0.06)]">
                      <Button type="submit" size="lg" className="px-10 h-12 text-xs font-bold uppercase tracking-wider shimmer-btn">Continue to Payment</Button>
                    </div>
                  </motion.form>
                )}

                {currentStep === 1 && (
                  <motion.form
                    key="payment"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleNext}
                    className="space-y-8"
                  >
                    <div>
                      <h2 className="text-base font-bold text-[#1A1A1A] uppercase tracking-wider mb-2">Payment</h2>
                      <p className="text-xs text-[#9CA3AF] mb-6">Choose from the available secure options configured by the brand:</p>
                      
                      <div className="rounded-xl border border-[rgba(0,0,0,0.08)] divide-y divide-[rgba(0,0,0,0.06)] overflow-hidden bg-white">
                        {supportedPaymentMethods.map((method) => {
                          const isSelected = selectedPaymentMethod === method;
                          return (
                            <label key={method} className="p-4 flex items-center justify-between hover:bg-[#FAFAFA] cursor-pointer transition-colors select-none">
                              <div className="flex items-center space-x-3">
                                <input 
                                  type="radio" 
                                  name="payment_method" 
                                  value={method}
                                  checked={isSelected}
                                  onChange={() => setSelectedPaymentMethod(method)}
                                  className="h-4 w-4 text-[#1A1A1A] focus:ring-[#1A1A1A]" 
                                />
                                <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                                  {method === "Cash" ? "Cash on Delivery (COD)" : `Pay via ${method}`}
                                </span>
                              </div>
                              {method === "Razorpay" && <ShieldCheck className="h-5 w-5 text-green-700" />}
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex justify-between pt-6 border-t border-[rgba(0,0,0,0.06)]">
                      <Button type="button" variant="ghost" onClick={() => setCurrentStep(0)} className="text-xs tracking-wider uppercase">Back</Button>
                      <Button type="submit" size="lg" className="px-10 h-12 text-xs font-bold uppercase tracking-wider shimmer-btn">Review Order</Button>
                    </div>
                  </motion.form>
                )}

                {currentStep === 2 && (
                  <motion.div
                    key="review"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                  >
                    <div>
                      <h2 className="text-base font-bold text-[#1A1A1A] uppercase tracking-wider mb-6">Order Review</h2>
                      
                      <div className="rounded-xl border border-[rgba(0,0,0,0.08)] divide-y divide-[rgba(0,0,0,0.06)] overflow-hidden">
                        <div className="p-4 flex justify-between items-center bg-[#FAFAFA]">
                          <div>
                            <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-1">Contact</p>
                            <p className="font-semibold text-xs text-[#1A1A1A]">{formData.email}</p>
                          </div>
                          <button className="text-xs font-bold text-accent hover:underline uppercase tracking-wider" onClick={() => setCurrentStep(0)}>Edit</button>
                        </div>
                        <div className="p-4 flex justify-between items-center bg-[#FAFAFA]">
                          <div>
                            <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-1">Ship to</p>
                            <p className="font-semibold text-xs text-[#1A1A1A]">{formData.address}, {formData.city}, {formData.state} {formData.zip}, {formData.country}</p>
                          </div>
                          <button className="text-xs font-bold text-accent hover:underline uppercase tracking-wider" onClick={() => setCurrentStep(0)}>Edit</button>
                        </div>
                        <div className="p-4 flex justify-between items-center bg-[#FAFAFA]">
                          <div>
                            <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-1">Payment</p>
                            <p className="font-semibold text-xs text-[#1A1A1A]">
                              {selectedPaymentMethod === "Cash" ? "Cash on Delivery (COD)" : `${selectedPaymentMethod} Checkout`}
                            </p>
                          </div>
                          <button className="text-xs font-bold text-accent hover:underline uppercase tracking-wider" onClick={() => setCurrentStep(1)}>Edit</button>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between pt-6 border-t border-[rgba(0,0,0,0.06)] items-center">
                      <Button type="button" variant="ghost" onClick={() => setCurrentStep(1)} className="text-xs tracking-wider uppercase">Back</Button>
                      <Button size="lg" className="px-10 h-12 text-xs font-bold uppercase tracking-wider shimmer-btn" onClick={handlePlaceOrder} disabled={isProcessing}>
                        {isProcessing ? "Processing..." : "Place Order"}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="w-full lg:w-2/5 lg:sticky lg:top-24 z-10">
            <div className="bg-white rounded-2xl border border-[rgba(0,0,0,0.06)] p-6 lg:p-8 shadow-sm space-y-6">
              <h2 className="font-serif text-lg font-bold border-b border-[rgba(0,0,0,0.06)] pb-4 text-[#1A1A1A]">Bag Items</h2>
              
              <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2 scrollbar-hide">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="relative h-16 w-14 flex-shrink-0 rounded-lg border border-[rgba(0,0,0,0.06)] overflow-hidden bg-[#F5F5F0]">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#1A1A1A] text-[9px] font-bold text-white">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col justify-center min-w-0">
                      <p className="text-xs font-semibold text-[#1A1A1A] truncate">{item.title}</p>
                      <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wider font-bold mt-0.5">{item.variant}</p>
                    </div>
                    <div className="flex items-center justify-end flex-shrink-0">
                      <p className="text-xs font-bold text-[#1A1A1A]">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Promo Code Coupon Input */}
              <div className="border-t border-[rgba(0,0,0,0.06)] pt-6 space-y-3">
                <h3 className="font-serif text-sm font-bold text-[#1A1A1A]">Promo Code</h3>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-[#F5F5F0] border border-[rgba(0,0,0,0.06)] px-3.5 py-2.5 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <Ticket className="w-4 h-4 text-green-700 font-bold" />
                      <div>
                        <p className="text-xs font-bold text-green-700 uppercase tracking-wider">{appliedCoupon.code}</p>
                        <p className="text-[10px] text-[#9CA3AF] mt-0.5 font-bold uppercase tracking-wider">
                          {appliedCoupon.type === "percentage" ? `${appliedCoupon.value}% Off` : `${formatCurrency(Number(appliedCoupon.value))} Off`}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={handleRemoveCoupon} 
                      className="p-1 hover:bg-gray-200 rounded-full transition-colors cursor-pointer text-[#9CA3AF] hover:text-[#1A1A1A] inline-flex items-center justify-center"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="ENTER CODE"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 rounded-xl border border-[rgba(0,0,0,0.08)] bg-white px-3 py-2 text-xs uppercase tracking-wider text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:border-[#1A1A1A] outline-none h-10"
                    />
                    <button 
                      type="button" 
                      onClick={handleApplyCoupon}
                      className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl border border-[#1A1A1A] bg-white text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-all cursor-pointer h-10"
                    >
                      Apply
                    </button>
                  </div>
                )}
                {couponError && (
                  <p className="text-[10px] font-semibold text-red-600 mt-1">{couponError}</p>
                )}
              </div>

              <div className="border-t border-[rgba(0,0,0,0.06)] pt-6 space-y-3.5">
                <div className="flex justify-between text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">
                  <span>Subtotal</span>
                  <span className="text-[#1A1A1A]">{formatCurrency(subtotal)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-xs font-semibold text-green-700 uppercase tracking-wider">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">
                  <span>Shipping</span>
                  <span className="text-[#1A1A1A]">{shippingCost === 0 ? "Free" : formatCurrency(shippingCost)}</span>
                </div>
                <div className="flex justify-between text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">
                  <span>Estimated GST (18%)</span>
                  <span className="text-[#1A1A1A]">{formatCurrency(tax)}</span>
                </div>
              </div>
              
              <div className="border-t border-[rgba(0,0,0,0.06)] mt-6 pt-6 flex justify-between items-center font-serif text-lg font-bold text-[#1A1A1A]">
                <span>Total Amount</span>
                <span className="text-xl">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
