"use client";

import * as React from "react";
import { motion } from "framer-motion";

export default function AboutPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen text-[#1A1A1A]">
      {/* Hero Section */}
      <section className="relative py-24 md:py-36 border-b border-[rgba(0,0,0,0.06)] bg-white">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-16 text-center">
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-caption text-[#9CA3AF] mb-4"
          >
            Our Story
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-hero text-[#1A1A1A] mb-8"
          >
            Crafting Timeless Luxury
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="max-w-2xl mx-auto h-[400px] relative rounded-2xl overflow-hidden shadow-sm border border-[rgba(0,0,0,0.04)] bg-[#F5F5F0]"
          >
            <img 
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80" 
              alt="Design studio"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
            <motion.div 
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <p className="text-caption text-[#9CA3AF] mb-2">Vision</p>
              <h2 className="text-section text-[#1A1A1A] mb-6">
                Redefining Essential Design
              </h2>
              <p className="text-sm text-[#6B6B6B] leading-relaxed mb-6">
                PREMIUM. was founded in 2026 with a simple yet ambitious goal: to create everyday objects and apparel of unparalleled quality and minimal aesthetic. We believe that true luxury lies in simplicity, materials, and details.
              </p>
              <p className="text-sm text-[#6B6B6B] leading-relaxed">
                By bypassing traditional retail margins and focusing entirely on high-grade materials and ethical craftsmanship, we deliver premium products directly to you. Every stitch, curve, and shade is intentionally considered.
              </p>
            </motion.div>

            <motion.div 
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-6"
            >
              <div className="p-6 bg-white rounded-2xl border border-[rgba(0,0,0,0.06)] shadow-sm">
                <h3 className="font-serif text-3xl font-bold text-accent mb-2">100%</h3>
                <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold mb-2">Organic Cotton</p>
                <p className="text-xs text-[#6B6B6B] leading-relaxed">Sourced responsibly from sustainable mills.</p>
              </div>
              <div className="p-6 bg-white rounded-2xl border border-[rgba(0,0,0,0.06)] shadow-sm">
                <h3 className="font-serif text-3xl font-bold text-accent mb-2">Zero</h3>
                <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold mb-2">Markup Markups</p>
                <p className="text-xs text-[#6B6B6B] leading-relaxed">Directly from the makers to your wardrobe.</p>
              </div>
              <div className="p-6 bg-white rounded-2xl border border-[rgba(0,0,0,0.06)] shadow-sm">
                <h3 className="font-serif text-3xl font-bold text-accent mb-2">10yr</h3>
                <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold mb-2">Design Promise</p>
                <p className="text-xs text-[#6B6B6B] leading-relaxed">Constructed to last and resist seasonal shifts.</p>
              </div>
              <div className="p-6 bg-white rounded-2xl border border-[rgba(0,0,0,0.06)] shadow-sm">
                <h3 className="font-serif text-3xl font-bold text-accent mb-2">12+</h3>
                <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold mb-2">Global Artisans</p>
                <p className="text-xs text-[#6B6B6B] leading-relaxed">Collaborative studios across 4 continents.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-24 bg-white border-t border-b border-[rgba(0,0,0,0.06)]">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-16 text-center">
          <p className="text-caption text-[#9CA3AF] mb-2">Values</p>
          <h2 className="text-section text-[#1A1A1A] mb-16">Our Philosophies</h2>
          
          <motion.div 
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-12"
          >
            <motion.div variants={fadeInUp} className="space-y-4">
              <div className="w-11 h-11 rounded-full bg-[#F5F5F0] flex items-center justify-center mx-auto text-xs font-bold text-[#1A1A1A]">1</div>
              <h3 className="font-serif text-xl font-bold text-[#1A1A1A]">Radical Quality</h3>
              <p className="text-[#6B6B6B] text-xs max-w-xs mx-auto leading-relaxed">
                We select materials based on tactile strength and sensory appeal. Performance and longevity are never sacrificed for speed.
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="space-y-4">
              <div className="w-11 h-11 rounded-full bg-[#F5F5F0] flex items-center justify-center mx-auto text-xs font-bold text-[#1A1A1A]">2</div>
              <h3 className="font-serif text-xl font-bold text-[#1A1A1A]">Minimal Form</h3>
              <p className="text-[#6B6B6B] text-xs max-w-xs mx-auto leading-relaxed">
                Stripping away the unnecessary details leaves room for functionality, texture, and structure to shine.
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="space-y-4">
              <div className="w-11 h-11 rounded-full bg-[#F5F5F0] flex items-center justify-center mx-auto text-xs font-bold text-[#1A1A1A]">3</div>
              <h3 className="font-serif text-xl font-bold text-[#1A1A1A]">Quiet Impact</h3>
              <p className="text-[#6B6B6B] text-xs max-w-xs mx-auto leading-relaxed">
                We make fewer things but make them better. Ethical manufacturing processes support local communities.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
