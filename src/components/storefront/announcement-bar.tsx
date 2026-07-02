"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";

export function AnnouncementBar({
  text,
  link,
  bgColor = "#1A1A1A",
}: {
  text: string;
  link?: string;
  bgColor?: string;
}) {
  const [isVisible, setIsVisible] = React.useState(true);

  if (!isVisible || !text) return null;

  const content = (
    <div className="flex items-center justify-center py-2 px-8 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-white relative">
      <span className="flex items-center gap-1.5 justify-center">
        {text}
        {link && <ArrowRight className="w-3 h-3 text-white/70" />}
      </span>
      <button 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsVisible(false);
        }}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white cursor-pointer transition-colors duration-150"
        aria-label="Dismiss Announcement"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      style={{ backgroundColor: bgColor }}
      className="w-full relative z-50 overflow-hidden border-b border-white/5"
    >
      {link ? (
        <Link href={link} className="block w-full hover:opacity-90 transition-opacity">
          {content}
        </Link>
      ) : (
        content
      )}
    </motion.div>
  );
}
