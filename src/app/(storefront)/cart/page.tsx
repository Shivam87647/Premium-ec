"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/components/storefront/cart-provider";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import { Plus, Minus, Trash2, Tag, Loader2, ArrowRight, ShoppingBag } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function CartPage() {
  const router = useRouter();
  const { items, subtotal, updateQuantity, removeItem } = useCart();
  const { addToast } = useToast();

  const [couponCode, setCouponCode] = React.useState("");
  const [couponLoading, setCouponLoading] = React.useState(false);
  const [appliedCoupon, setAppliedCoupon] = React.useState<any>(null);

  const supabase = React.useMemo(() => createClient(), []);

  // Shipping, Tax, and Discount Calculations
  const shippingCost = subtotal > 3000 ? 0 : 150;
  const taxRate = 0.18;
  
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === "percentage") {
      discountAmount = (subtotal * appliedCoupon.value) / 100;
    } else {
      discountAmount = appliedCoupon.value;
    }
  }

  const subtotalAfterDiscount = Math.max(0, subtotal - discountAmount);
  const tax = subtotalAfterDiscount * taxRate;
  const total = subtotalAfterDiscount + shippingCost + tax;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", couponCode.trim().toUpperCase())
        .eq("is_active", true)
        .single();

      if (error || !data) {
        addToast({
          title: "Invalid Coupon",
          description: "The coupon code you entered is invalid or expired.",
          type: "error",
        });
        setAppliedCoupon(null);
      } else {
        const now = new Date().toISOString();
        const validFrom = data.valid_from;
        const validTo = data.valid_to;

        if ((validFrom && now < validFrom) || (validTo && now > validTo)) {
          addToast({
            title: "Coupon Expired",
            description: "This coupon code has expired.",
            type: "error",
          });
          setAppliedCoupon(null);
        }
        else if (data.min_order_amount && subtotal < data.min_order_amount) {
          addToast({
            title: "Minimum Amount Not Met",
            description: `This coupon requires a minimum spend of ${formatCurrency(data.min_order_amount)}.`,
            type: "error",
          });
          setAppliedCoupon(null);
        } else {
          setAppliedCoupon(data);
          addToast({
            title: "Coupon Applied",
            description: `Discount of ${
              data.type === "percentage" ? `${data.value}%` : formatCurrency(data.value)
            } applied successfully.`,
            type: "success",
          });
        }
      }
    } catch (err) {
      console.error("Coupon validation error:", err);
      addToast({
        title: "Coupon Error",
        description: "An error occurred while validating the coupon.",
        type: "error",
      });
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    addToast({
      title: "Coupon Removed",
      description: "Coupon code has been removed.",
      type: "success",
    });
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-[1440px] px-6 lg:px-16 py-24 text-center">
        <div className="max-w-md mx-auto space-y-6">
          <div className="w-20 h-20 bg-[#F5F5F0] rounded-2xl flex items-center justify-center mx-auto">
            <ShoppingBag className="w-10 h-10 text-[#C4C4C4]" />
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#1A1A1A]">Your bag is empty</h1>
          <p className="text-[#6B6B6B] text-sm leading-relaxed max-w-sm mx-auto">
            Before you checkout, you must add some items to your shopping bag. Explore our collections for inspiration.
          </p>
          <Link href="/products" className="inline-block pt-2">
            <Button size="lg" className="h-12 px-8 uppercase tracking-widest text-xs font-bold shimmer-btn">
              Start Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAFA] min-h-screen text-[#1A1A1A] py-12 md:py-16">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-16">
        <div className="mb-12">
          <p className="text-caption text-[#9CA3AF] mb-1">Shopping Details</p>
          <h1 className="font-serif text-4xl font-bold tracking-tight text-[#1A1A1A]">Shopping Bag</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-2xl border border-[rgba(0,0,0,0.06)] shadow-sm overflow-hidden">
              <div className="p-6 md:p-8 space-y-6 divide-y divide-[rgba(0,0,0,0.06)]">
                <AnimatePresence initial={false}>
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0, height: 0, padding: 0 }}
                      className="flex gap-4 md:gap-6 py-6 first:pt-0 last:pb-0 items-center"
                    >
                      <div className="relative h-24 w-20 flex-shrink-0 rounded-xl overflow-hidden bg-[#F5F5F0] border border-[rgba(0,0,0,0.04)]">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/products/${item.id.split("-")[0]}`}
                          className="hover:text-accent font-serif text-base font-semibold text-[#1A1A1A] transition-colors truncate block"
                        >
                          {item.title}
                        </Link>
                        <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wider font-bold mt-1">
                          {item.variant || "Default Variant"}
                        </p>
                        
                        <div className="flex items-center rounded-lg border border-[rgba(0,0,0,0.08)] bg-[#FAFAFA] w-fit mt-4">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="px-2.5 py-1.5 text-[#9CA3AF] hover:text-[#1A1A1A] transition-colors cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-semibold w-8 text-center text-[#1A1A1A]">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="px-2.5 py-1.5 text-[#9CA3AF] hover:text-[#1A1A1A] transition-colors cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="text-right space-y-2 flex-shrink-0">
                        <p className="font-bold text-sm text-[#1A1A1A]">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                        <p className="text-[10px] text-[#9CA3AF]">
                          {formatCurrency(item.price)} each
                        </p>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-[#9CA3AF] hover:text-destructive p-1 cursor-pointer transition-colors block ml-auto"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Promo Code Input */}
            <div className="bg-white rounded-2xl border border-[rgba(0,0,0,0.06)] p-6 md:p-8 shadow-sm">
              <h2 className="font-serif text-lg font-semibold mb-4 text-[#1A1A1A]">Promotional Privileges</h2>
              
              {!appliedCoupon ? (
                <form onSubmit={handleApplyCoupon} className="flex gap-4 items-end">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="ENTER CODE (E.G. SPRING10)"
                      className="w-full rounded-lg border border-[rgba(0,0,0,0.08)] bg-white px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] placeholder-[#C4C4C4] outline-none focus:border-[#1A1A1A] transition-colors"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={couponLoading || !couponCode.trim()}
                    className="h-11 px-6 cursor-pointer text-xs tracking-wider uppercase font-bold shadow-sm shimmer-btn"
                  >
                    {couponLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Apply"
                    )}
                  </Button>
                </form>
              ) : (
                <div className="flex items-center justify-between bg-green-50 border border-green-100 rounded-lg p-4">
                  <div className="flex items-center space-x-3 text-green-850">
                    <Tag className="w-4 h-4 text-green-700" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {appliedCoupon.code} applied (
                      {appliedCoupon.type === "percentage"
                        ? `${appliedCoupon.value}% Off`
                        : `${formatCurrency(appliedCoupon.value)} Off`}
                      )
                    </span>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-xs text-red-500 hover:text-red-700 cursor-pointer font-bold uppercase tracking-wider"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl border border-[rgba(0,0,0,0.06)] p-6 md:p-8 shadow-sm space-y-6">
              <h2 className="font-serif text-xl font-bold border-b border-[rgba(0,0,0,0.06)] pb-4 text-[#1A1A1A]">Order Summary</h2>

              <div className="space-y-4">
                <div className="flex justify-between text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">
                  <span>Bag Subtotal</span>
                  <span className="text-[#1A1A1A]">{formatCurrency(subtotal)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-xs font-semibold text-green-700 uppercase tracking-wider">
                    <span>Discount</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">
                  <span>Shipping</span>
                  <span className="text-[#1A1A1A]">
                    {shippingCost === 0 ? "Free" : formatCurrency(shippingCost)}
                  </span>
                </div>

                <div className="flex justify-between text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">
                  <span>Estimated Tax (18% GST)</span>
                  <span className="text-[#1A1A1A]">{formatCurrency(tax)}</span>
                </div>

                <div className="border-t border-[rgba(0,0,0,0.06)] pt-4 flex justify-between items-center font-serif text-lg font-bold text-[#1A1A1A]">
                  <span>Grand Total</span>
                  <span className="text-xl">{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Shimmering CTA Button */}
              <button
                onClick={() => router.push("/checkout")}
                className="relative overflow-hidden w-full h-12 rounded-lg bg-[#1A1A1A] hover:bg-black text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer shadow-md group transition-all shimmer-btn"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <p className="text-center text-[10px] text-[#9CA3AF] leading-relaxed">
                Shipping rates and custom declarations are validated during the checkout sequence.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
