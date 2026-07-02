"use client";

import * as React from "react";
import { motion } from "framer-motion";

export default function PrivacyPolicyPage() {
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
              Security & Privacy
            </p>
            <h1 className="text-hero text-[#1A1A1A]">
              Privacy Policy
            </h1>
            <p className="text-[10px] text-[#9CA3AF] mt-4 font-bold uppercase tracking-wider">
              Last Updated: June 2026
            </p>
          </div>

          <div className="prose prose-neutral max-w-none text-[#6B6B6B] space-y-8 text-sm leading-relaxed">
            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-[#1A1A1A]">1. Information We Collect</h2>
              <p>
                We collect personal information that you voluntarily provide to us when you register on the website, place an order, sign up for our newsletter, or contact customer support. This may include your name, email, billing address, shipping address, and phone number.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-[#1A1A1A]">2. Payment Processing Security</h2>
              <p>
                All credit card transactions are processed securely via Razorpay. We do not store or retain any card details, CVVs, or bank credentials on our servers. Razorpay processes all payment data in compliance with PCI-DSS standards.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-[#1A1A1A]">3. How We Use Your Data</h2>
              <p>
                We use the data we collect to process transactions, deliver your orders, send order confirmations, respond to customer inquiries, and send promotional offers (if you've opted into newsletters). We never sell your personal information to third parties.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-[#1A1A1A]">4. Cookies</h2>
              <p>
                Our store uses cookies to remember items in your shopping cart, analyze site traffic, and optimize your navigation experience. You can disable cookies in your browser settings, though some storefront features may not work as intended.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
