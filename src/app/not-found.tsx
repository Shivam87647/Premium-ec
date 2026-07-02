"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="bg-[#FAFAFA] min-h-screen text-[#1A1A1A] flex items-center justify-center py-24 px-6">
      <div className="text-center max-w-md w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="space-y-4"
        >
          <h1 className="font-serif text-8xl md:text-9xl font-extrabold tracking-widest text-[#1A1A1A]/10">
            404
          </h1>
          <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Page Not Found
          </h2>
          <p className="text-[#6B6B6B] text-sm leading-relaxed max-w-sm mx-auto">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-6 py-3 text-sm font-semibold hover:bg-gray-50 cursor-pointer shadow-sm text-foreground transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <Link href="/">
            <Button className="w-full sm:w-auto h-12 px-6 flex items-center gap-2 cursor-pointer">
              <Home className="w-4 h-4" />
              Return Home
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
