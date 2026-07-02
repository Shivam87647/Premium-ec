"use client";

import * as React from "react";
import { motion } from "framer-motion";

export default function ShippingPolicyPage() {
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
              Deliveries
            </p>
            <h1 className="text-hero text-[#1A1A1A]">
              Shipping & Delivery
            </h1>
            <p className="text-[10px] text-[#9CA3AF] mt-4 font-bold uppercase tracking-wider">
              Last Updated: June 2026
            </p>
          </div>

          <div className="prose prose-neutral max-w-none text-[#6B6B6B] space-y-8 text-sm leading-relaxed">
            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-[#1A1A1A]">1. Dispatch Timeline</h2>
              <p>
                All orders are processed and dispatched within 24 to 48 hours of placement (excluding weekends and public holidays). You will receive a shipping confirmation email with a tracking number once your package is on its way.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-[#1A1A1A]">2. Delivery Rates & Times</h2>
              <p>
                We offer standard and express shipping options. The table below outlines estimated transit times and associated fees:
              </p>
              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left text-xs border border-[rgba(0,0,0,0.06)] rounded-xl overflow-hidden bg-white shadow-sm">
                  <thead className="bg-[#FAFAFA] border-b border-[rgba(0,0,0,0.06)] text-[#1A1A1A]">
                    <tr>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">Shipping Method</th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">Estimated Transit</th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(0,0,0,0.04)] text-[#6B6B6B]">
                    <tr>
                      <td className="px-4 py-3 font-semibold text-[#1A1A1A]">Standard Shipping</td>
                      <td className="px-4 py-3">3 to 5 business days</td>
                      <td className="px-4 py-3">₹150 (Free for orders over ₹3,000)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold text-[#1A1A1A]">Express Shipping</td>
                      <td className="px-4 py-3">1 to 2 business days</td>
                      <td className="px-4 py-3">₹350</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold text-[#1A1A1A]">International Delivery</td>
                      <td className="px-4 py-3">7 to 14 business days</td>
                      <td className="px-4 py-3">Calculated at checkout</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-[#1A1A1A]">3. Customs, Duties & Taxes</h2>
              <p>
                For international shipments, customs tariffs, duties, and handling taxes may apply depending on local laws. These fees are the sole responsibility of the customer and are collected directly by the carrier at delivery.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-[#1A1A1A]">4. Unsuccessful Deliveries</h2>
              <p>
                If a delivery fails due to an incorrect address provided by the buyer, or three unsuccessful delivery attempts, the package is returned to our warehouse. A refund is initiated minus the initial shipping fee.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
