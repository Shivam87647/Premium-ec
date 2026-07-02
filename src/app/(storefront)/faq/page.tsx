"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    category: "Orders & Shipping",
    question: "How long does shipping take?",
    answer: "Standard shipping takes 3-5 business days. Express shipping takes 1-2 business days. International shipping varies by destination, usually between 7-14 business days.",
  },
  {
    category: "Orders & Shipping",
    question: "Can I cancel or modify my order after placing it?",
    answer: "We process orders quickly, but if you contact us within 1 hour of placing your order at support@premium.com, we will do our best to accommodate modifications or cancellations.",
  },
  {
    category: "Orders & Shipping",
    question: "Do you ship internationally?",
    answer: "Yes, we ship to over 50 countries worldwide. International shipping rates and custom duties are calculated at checkout based on your delivery address.",
  },
  {
    category: "Returns & Exchanges",
    question: "What is your return policy?",
    answer: "We offer a 30-day return policy for all unworn, unwashed items in their original packaging with tags attached. Returns are free for domestic orders.",
  },
  {
    category: "Returns & Exchanges",
    question: "How do I initiate a return or exchange?",
    answer: "Visit your Account page under Order History, select the order containing the items you wish to return, and click 'Initiate Return'. You will receive a pre-paid shipping label via email.",
  },
  {
    category: "Product & Sizing",
    question: "How do I know what size to order?",
    answer: "Each product details page features a comprehensive 'Size Guide' with measurements. If you are between sizes, we generally recommend sizing up for a more relaxed fit.",
  },
  {
    category: "Product & Sizing",
    question: "Where are your products manufactured?",
    answer: "Our collections are designed in-house in New York and ethically manufactured in collaborative studios in Italy, Portugal, and Japan, ensuring premium craftsmanship and fair labor standards.",
  },
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = React.useState<string>("All");
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  const categories = ["All", ...Array.from(new Set(faqs.map((f) => f.category)))];

  const filteredFaqs = activeCategory === "All" 
    ? faqs 
    : faqs.filter((f) => f.category === activeCategory);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen text-[#1A1A1A] py-16 md:py-24">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-16">
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-24">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-caption text-[#9CA3AF] mb-4"
          >
            F.A.Q.
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-hero text-[#1A1A1A] mb-6"
          >
            Frequently Asked Questions
          </motion.h1>
          <p className="text-[#6B6B6B] text-sm leading-relaxed">
            Find answers to common inquiries regarding our ordering process, shipping methods, returns policy, and product details.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3.5 mb-16">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setActiveCategory(category);
                setOpenIndex(null);
              }}
              className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                activeCategory === category
                  ? "bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-sm"
                  : "bg-white text-[#6B6B6B] border-[rgba(0,0,0,0.06)] hover:text-[#1A1A1A] hover:bg-[#FAFAFA]"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Accordion List */}
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-[rgba(0,0,0,0.06)] p-6 md:p-10 shadow-sm divide-y divide-[rgba(0,0,0,0.06)]">
          {filteredFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index} className="py-6 first:pt-0 last:pb-0">
                <button
                  onClick={() => handleToggle(index)}
                  className="flex w-full items-center justify-between text-left font-serif text-base md:text-lg font-bold hover:text-accent cursor-pointer group text-[#1A1A1A] transition-colors"
                >
                  <span>{faq.question}</span>
                  <span className="ml-4 flex-shrink-0 text-[#9CA3AF] group-hover:text-accent transition-colors">
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </span>
                </button>
                
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0, marginTop: 0 }}
                      animate={{ height: "auto", opacity: 1, marginTop: 16 }}
                      exit={{ height: 0, opacity: 0, marginTop: 0 }}
                      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                      className="overflow-hidden text-xs md:text-sm text-[#6B6B6B] leading-relaxed font-semibold uppercase tracking-wider"
                    >
                      <p className="normal-case tracking-normal text-[#6B6B6B] font-normal leading-relaxed">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
