"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("number") || "ORD-260629-UNKNOWN";
  
  const supabase = React.useMemo(() => createClient(), []);
  const [isCancelled, setIsCancelled] = React.useState(false);

  // Check if order is already cancelled
  React.useEffect(() => {
    async function checkOrderStatus() {
      try {
        const { data } = await supabase
          .from("orders")
          .select("fulfillment_status")
          .eq("order_number", orderNumber)
          .maybeSingle();
        if (data && data.fulfillment_status === "cancelled") {
          setIsCancelled(true);
        }
      } catch (e) {
        console.error(e);
      }
    }
    if (orderNumber && orderNumber !== "ORD-260629-UNKNOWN") {
      checkOrderStatus();
    }
  }, [orderNumber, supabase]);

  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center">
      {/* Animated Icon Wrapper */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
        className={`mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border mb-8 shadow-sm ${
          isCancelled
            ? "bg-red-50 border-red-100 text-red-700"
            : "bg-green-50 border-green-100 text-green-700"
        }`}
      >
        {isCancelled ? (
          <XCircle className="h-10 w-10 text-red-650" />
        ) : (
          <svg
            className="h-10 w-10 text-green-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2.5"
          >
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="font-serif text-3xl font-bold text-[#1A1A1A] mb-4"
      >
        {isCancelled ? "Order Cancelled" : "Order Confirmed"}
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="space-y-6"
      >
        <p className="text-sm font-semibold uppercase tracking-wider text-[#6B6B6B]">
          Reference:{" "}
          <span className="font-serif text-base font-extrabold text-[#1A1A1A] lowercase">{orderNumber}</span>
        </p>
        <p className="text-[#6B6B6B] text-sm leading-relaxed max-w-md mx-auto mb-10">
          {isCancelled
            ? "Your order cancellation request has been processed. The billing amount will be refunded to your original payment source."
            : "Your payment has been verified. We have dispatched a confirmation receipt containing tracking credentials to your email address."}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <Link href="/products" className="inline-block">
            <Button size="lg" className="h-12 px-8 w-full sm:w-auto cursor-pointer uppercase tracking-wider text-xs font-bold shadow-sm shimmer-btn">
              Continue Shopping
            </Button>
          </Link>
          <Link href="/account?tab=orders" className="inline-block">
            <Button variant="outline" size="lg" className="h-12 px-8 w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider text-xs font-bold">
              <span>Track Details</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <div className="bg-[#FAFAFA] min-h-screen text-[#1A1A1A] flex items-center justify-center">
      <React.Suspense
        fallback={
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-[#1A1A1A] mb-4" />
            <p className="text-secondary-foreground text-sm">Loading details...</p>
          </div>
        }
      >
        <ConfirmationContent />
      </React.Suspense>
    </div>
  );
}
