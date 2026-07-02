"use client";

import * as React from "react";
import { motion } from "framer-motion";

export default function TermsOfServicePage() {
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
              Legal
            </p>
            <h1 className="text-hero text-[#1A1A1A]">
              Terms of Service
            </h1>
            <p className="text-[10px] text-[#9CA3AF] mt-4 font-bold uppercase tracking-wider">
              Last Updated: June 2026
            </p>
          </div>

          <div className="prose prose-neutral max-w-none text-[#6B6B6B] space-y-8 text-sm leading-relaxed">
            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-[#1A1A1A]">1. Scope of Agreement</h2>
              <p>
                By visiting our site and/or purchasing products from us, you engage in our "Service" and agree to be bound by the following terms and conditions, including those additional policies referenced herein or available via hyperlink.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-[#1A1A1A]">2. Product Descriptions & Pricing</h2>
              <p>
                Prices for our products are subject to change without notice. We reserve the right at any time to modify or discontinue any product. We make every effort to display as accurately as possible the colors, descriptions, and images of our products.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-[#1A1A1A]">3. Order Limitations & Refusals</h2>
              <p>
                We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household, or per order. This includes orders placed by or under the same customer account, the same credit card, and/or orders that use the same billing/shipping address.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-[#1A1A1A]">4. Governing Law</h2>
              <p>
                These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of the State of New York, USA, without regard to conflict of law principles.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
