"use client";

import * as React from "react";
import { ShieldAlert, CheckCircle, ExternalLink, Calendar } from "lucide-react";
import { motion } from "framer-motion";

const DIAGNOSTICS = [
  {
    title: "Double Auth Check Toasts",
    filename: "Screenshot 2026-06-29 at 11.53.46 PM.png",
    description: "During StrictMode remounts, the storefront checkout page triggered multiple duplicate 'Authentication Required' toasts concurrently.",
    solution: "Added a `toastFired` tracking ref wrapper around the session authentication hook to prevent duplicate mounts from firing overlapping toast signals.",
    status: "RESOLVED",
    date: "June 29, 2026",
  },
  {
    title: "Product Form Metadata Leak",
    filename: "Screenshot 2026-07-01 at 4.24.10 PM.png",
    description: "Database comment-level highlights and specifications metadata (serialized HTML comments) leaked as raw text into the description textarea in the editor modal.",
    solution: "Created HTML sanitizer utilities to strip `<!--DATA:{...}-->` comment strings before inserting description content into the editor inputs.",
    status: "RESOLVED",
    date: "July 1, 2026",
  },
  {
    title: "Media Library Render Bottlenecks",
    filename: "Screenshot 2026-07-01 at 4.25.33 PM.png",
    description: "Large, high-resolution lifestyle product photos caused significant latency and layout shift during media page render.",
    solution: "Optimized the media items mapping to include standard `loading='lazy'` and `decoding='async'` image attributes, preventing fetch blocking.",
    status: "RESOLVED",
    date: "July 1, 2026",
  },
  {
    title: "Reviews PostgREST Joins Crash",
    filename: "Screenshot 2026-07-01 at 4.26.04 PM.png",
    description: "Absence of database foreign key constraints between `reviews` and `profiles` triggered PostgREST schema cache relationship lookup errors on PDP loading.",
    solution: "Refactored review fetches to query data sequentially and resolve authors client-side in React memory, bypassing join constraints.",
    status: "RESOLVED",
    date: "July 1, 2026",
  },
  {
    title: "Checkout Order Placement Failure",
    filename: "Screenshot 2026-07-01 at 4.33.16 PM.png",
    description: "Order insertion failed due to unauthenticated / guest RLS violations when PostgREST attempted `select().single()` on the inserted guest checkout row.",
    solution: "Restructured the API endpoint to generate order UUIDs and numbers server-side, inserting details directly without triggering SELECT restrictions.",
    status: "RESOLVED",
    date: "July 1, 2026",
  },
  {
    title: "Coupon Validity Dates and Limits",
    filename: "Screenshot 2026-07-01 at 4.37.24 PM.png",
    description: "Admin panel lacked inputs to configure customer-specific usage caps and validity timeframes for discount coupon campaigns.",
    solution: "Appended datetime-local and integer limit controls to the coupons manager modal, and linked validation hooks dynamically during storefront checkout validation.",
    status: "RESOLVED",
    date: "July 1, 2026",
  },
  {
    title: "Reviews Moderation Crash",
    filename: "Screenshot 2026-07-01 at 4.39.51 PM.png",
    description: "Admin review management module crashed on load due to schema caching conflicts during the user profile relation join.",
    solution: "Implemented client-side join resolving matching profiles, mirroring the PDP reviews resolution logic.",
    status: "RESOLVED",
    date: "July 1, 2026",
  },
  {
    title: "Empty Accessories Catalog Watch Filters",
    filename: "Screenshot 2026-07-01 at 4.41.26 PM.png",
    description: "Accessories category view failed to list premium items (like watches) because catalog prices exceeded the hardcoded ₹10,000 slider filter defaults.",
    solution: "Expanded the storefront catalog default filtering limits to ₹50,000 across price swatches, slider properties, and active selection chips.",
    status: "RESOLVED",
    date: "July 1, 2026",
  },
];

export default function AdminErrorsPage() {
  const [activeFile, setActiveFile] = React.useState<string | null>(DIAGNOSTICS[0].filename);
  const activeDiag = DIAGNOSTICS.find((d) => d.filename === activeFile) || DIAGNOSTICS[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-[#1A1A1A]">System Diagnostics & Errors</h1>
        <p className="text-xs text-[#9CA3AF] mt-1">Review resolution history and inspect screenshots corresponding to fixed workspace bugs</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Diagnostics List */}
        <div className="lg:col-span-5 space-y-3.5">
          {DIAGNOSTICS.map((diag) => {
            const isActive = diag.filename === activeFile;
            return (
              <button
                key={diag.filename}
                onClick={() => setActiveFile(diag.filename)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-start space-x-3.5 cursor-pointer hover:shadow-md ${
                  isActive
                    ? "bg-[#1A1A1A] border-[#1A1A1A] text-white shadow-sm"
                    : "bg-white border-[rgba(0,0,0,0.06)] text-[#6B6B6B] hover:bg-[#FAFAFA]"
                }`}
              >
                <div className="mt-0.5">
                  {diag.status === "RESOLVED" ? (
                    <CheckCircle className={`w-4 h-4 ${isActive ? "text-green-400" : "text-green-600"}`} />
                  ) : (
                    <ShieldAlert className={`w-4 h-4 ${isActive ? "text-amber-400" : "text-amber-600"}`} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold uppercase tracking-wider ${isActive ? "text-white" : "text-[#1A1A1A]"}`}>
                    {diag.title}
                  </p>
                  <p className={`text-[10px] truncate mt-1 ${isActive ? "text-[#9CA3AF]" : "text-[#9CA3AF]"}`}>
                    {diag.filename}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Side: Detailed Diagnostics Previewer */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-[rgba(0,0,0,0.06)] rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[rgba(0,0,0,0.06)] pb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">{activeDiag.title}</h3>
                <div className="flex items-center space-x-3.5 mt-1.5 text-[10px] text-[#9CA3AF] uppercase font-bold tracking-wider">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {activeDiag.date}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-200">
                    {activeDiag.status}
                  </span>
                </div>
              </div>
              <a
                href={`/errorsimg/${activeDiag.filename}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-accent hover:underline"
              >
                <span>View Fullscreen</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1.5">Problem Description</h4>
                <p className="text-xs text-[#6B6B6B] leading-relaxed">{activeDiag.description}</p>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1.5">Engineering Solution</h4>
                <p className="text-xs text-[#6B6B6B] leading-relaxed">{activeDiag.solution}</p>
              </div>
            </div>

            {/* Live Image Box */}
            <div className="border border-[rgba(0,0,0,0.08)] rounded-xl overflow-hidden bg-[#FAFAFA] aspect-video relative flex items-center justify-center">
              <img
                src={`/errorsimg/${activeDiag.filename}`}
                alt={activeDiag.title}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
