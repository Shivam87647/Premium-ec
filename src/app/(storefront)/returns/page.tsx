"use client";

import * as React from "react";
import { motion } from "framer-motion";

export default function ReturnsPolicyPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen text-[#1A1A1A] py-16 md:py-24">
      <div className="mx-auto max-w-[800px] px-6 lg:px-16">
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="space-y-8"
        >
          <div className="border-b border-[rgba(0,0,0,0.06)] pb-8">
            <p className="text-caption text-[#9CA3AF] mb-2">
              Exchange & Refund
            </p>
            <h1 className="text-hero text-[#1A1A1A]">
              Returns & Exchanges
            </h1>
            <p className="text-[10px] text-[#9CA3AF] mt-4 font-bold uppercase tracking-wider">
              Last Updated: June 2026
            </p>
          </div>

          <div className="prose prose-neutral max-w-none text-[#6B6B6B] space-y-8 text-sm leading-relaxed">
            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-[#1A1A1A]">1. Return Eligibility</h2>
              <p>
                We accept returns of unworn, unwashed, and undamaged items within 30 days of the delivery date. Items must be in their original packaging with all labels and security tags fully intact.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-[#1A1A1A]">2. Refund Process</h2>
              <p>
                Once we receive your package and verify the condition of the items, we will issue a full refund to your original payment method (minus any non-refundable express shipping charges). Please allow up to 7-10 business days for the credit to reflect on your statement.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-[#1A1A1A]">3. Exchanges</h2>
              <p>
                We offer free size exchanges on domestic orders. If you wish to exchange an item for a different color or style, we recommend returning the item for a store credit or refund and placing a new order.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-[#1A1A1A]">4. Damaged or Faulty Items</h2>
              <p>
                If you receive an item that is defective or damaged during shipment, please contact us immediately at support@premium.com with photo evidence within 48 hours of receipt. We will arrange a priority replacement or full refund.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
