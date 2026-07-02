"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "./cart-provider";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, subtotal } = useCart();

  // Prevent body scroll
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 250 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[rgba(0,0,0,0.06)]">
              <div>
                <h2 className="text-lg font-bold text-[#1A1A1A] font-serif tracking-tight">
                  Shopping Bag
                </h2>
                {items.length > 0 && (
                  <p className="text-[11px] text-[#9CA3AF] mt-0.5">
                    {items.length} {items.length === 1 ? "item" : "items"}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-[#F5F5F0] transition-colors cursor-pointer text-[#6B6B6B] hover:text-[#1A1A1A]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center space-y-5 text-center">
                  <div className="rounded-2xl bg-[#F5F5F0] p-6">
                    <ShoppingBag className="h-10 w-10 text-[#C4C4C4]" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[#1A1A1A]">Your bag is empty</h3>
                    <p className="mt-1.5 text-sm text-[#9CA3AF] max-w-[240px]">
                      Explore our collections and find something you love.
                    </p>
                  </div>
                  <Button onClick={onClose} variant="outline" className="mt-2 gap-2">
                    Continue Shopping
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ) : (
                <motion.ul
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: {
                      transition: {
                        staggerChildren: 0.05,
                      },
                    },
                  }}
                  className="space-y-5"
                >
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.li
                        key={item.id}
                        variants={{
                          hidden: { opacity: 0, y: 16 },
                          visible: { opacity: 1, y: 0 },
                        }}
                        exit={{ 
                          opacity: 0, 
                          height: 0, 
                          x: 50, 
                          marginBottom: 0,
                          transition: { duration: 0.25, ease: "easeInOut" } 
                        }}
                        className="flex gap-4"
                      >
                        {/* Image */}
                        <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-[#F5F5F0]">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover object-center"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex flex-1 flex-col justify-between min-w-0">
                          <div className="flex justify-between gap-2">
                            <div className="min-w-0">
                              <h4 className="text-[13px] font-semibold text-[#1A1A1A] truncate">
                                <Link href="#" onClick={onClose} className="hover:text-accent transition-colors">
                                  {item.title}
                                </Link>
                              </h4>
                              <p className="text-[11px] text-[#9CA3AF] mt-0.5">{item.variant}</p>
                            </div>
                            <p className="text-[13px] font-bold text-[#1A1A1A] flex-shrink-0">
                              ₹{(item.price * item.quantity).toLocaleString()}
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            {/* Quantity Selector */}
                            <div className="flex items-center rounded-lg border border-[rgba(0,0,0,0.08)] bg-[#FAFAFA]">
                              <button
                                onClick={() => updateQuantity(item.id, -1)}
                                className="px-2.5 py-1.5 text-[#9CA3AF] hover:text-[#1A1A1A] transition-colors cursor-pointer"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="px-2 text-xs font-semibold text-[#1A1A1A] min-w-[20px] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, 1)}
                                className="px-2.5 py-1.5 text-[#9CA3AF] hover:text-[#1A1A1A] transition-colors cursor-pointer"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-[11px] font-medium text-[#9CA3AF] hover:text-destructive transition-colors cursor-pointer underline underline-offset-2"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </motion.ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-[rgba(0,0,0,0.06)] bg-[#FAFAFA] px-6 py-6">
                {/* Order Summary */}
                <div className="space-y-2 mb-5">
                  <div className="flex justify-between text-sm text-[#6B6B6B]">
                    <span>Subtotal</span>
                    <span className="font-medium text-[#1A1A1A]">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-[#6B6B6B]">
                    <span>Shipping</span>
                    <span className="text-xs text-[#9CA3AF]">Calculated at checkout</span>
                  </div>
                  <div className="border-t border-[rgba(0,0,0,0.06)] pt-2 mt-2">
                    <div className="flex justify-between text-base font-bold text-[#1A1A1A]">
                      <span>Total</span>
                      <span>₹{subtotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <Button className="w-full h-12 text-sm shimmer-btn" asChild>
                    <Link href="/checkout" onClick={onClose}>
                      Proceed to Checkout
                    </Link>
                  </Button>
                  <button
                    onClick={onClose}
                    className="w-full py-2.5 text-xs font-semibold text-center text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors cursor-pointer"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
