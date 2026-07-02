"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/storefront/cart-provider";
import { useToast } from "@/components/ui/toast";

export interface ProductCardProps {
  id: string;
  title: string;
  slug: string;
  price: number;
  salePrice?: number;
  primaryImage: string;
  secondaryImage?: string;
  badge?: string;
  onQuickAdd?: (id: string) => void;
}

export function ProductCard({
  id,
  title,
  slug,
  price,
  salePrice,
  primaryImage,
  secondaryImage,
  badge,
  onQuickAdd,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const { addItem } = useCart();
  const { addToast } = useToast();

  const [imgSrc, setImgSrc] = React.useState(primaryImage);
  const [secImgSrc, setSecImgSrc] = React.useState(secondaryImage);

  React.useEffect(() => {
    setImgSrc(primaryImage);
  }, [primaryImage]);

  React.useEffect(() => {
    setSecImgSrc(secondaryImage);
  }, [secondaryImage]);

  const fallbackPlaceholder = "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80";

  const discount = salePrice
    ? Math.round(((price - salePrice) / price) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className="group relative flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <Link
        href={`/products/${slug}`}
        className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-[#F5F5F0]"
      >
        {/* Badge */}
        {badge && (
          <div className="absolute left-3 top-3 z-20">
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="inline-block rounded-full bg-[#1A1A1A] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white shadow-sm"
            >
              {badge === "Sale" && discount > 0 ? `-${discount}%` : badge}
            </motion.span>
          </div>
        )}

        {/* Primary Image */}
        <motion.div
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="relative h-full w-full"
        >
          <img
            src={imgSrc || fallbackPlaceholder}
            alt={title}
            onError={() => {
              setImgSrc(fallbackPlaceholder);
            }}
            className="w-full h-full object-cover object-center"
          />

          {/* Secondary Image Crossfade */}
          {secondaryImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 z-10"
            >
              <img
                src={secImgSrc || fallbackPlaceholder}
                alt={`${title} alternate`}
                onError={() => {
                  setSecImgSrc(fallbackPlaceholder);
                }}
                className="w-full h-full object-cover object-center"
              />
            </motion.div>
          )}
        </motion.div>

        {/* Quick Add Button */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{
            y: isHovered ? 0 : 16,
            opacity: isHovered ? 1 : 0,
          }}
          transition={{ duration: 0.3, delay: 0.08, ease: "easeOut" }}
          className="absolute bottom-3 left-3 right-3 z-20"
        >
          <button
            className="w-full flex items-center justify-center gap-2 py-3 bg-white/95 backdrop-blur-sm text-[#1A1A1A] rounded-lg text-xs font-semibold uppercase tracking-wider shadow-lg hover:bg-white transition-colors cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addItem({
                id,
                title,
                price: salePrice || price,
                image: primaryImage,
                quantity: 1,
                variant: "Default",
              });
              addToast({
                title: "Added to Bag",
                description: `${title} has been added to your shopping bag.`,
                type: "success",
              });
              if (onQuickAdd) onQuickAdd(id);
            }}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Quick Add
          </button>
        </motion.div>
      </Link>

      {/* Product Info */}
      <div className="mt-4 flex flex-col space-y-1.5 px-0.5">
        <Link href={`/products/${slug}`}>
          <h3 className="text-product-title text-[#1A1A1A] group-hover:text-[#6B6B6B] transition-colors duration-200 truncate">
            {title}
          </h3>
        </Link>
        <div className="flex items-center gap-2">
          {salePrice ? (
            <>
              <span className="text-sm font-semibold text-[#1A1A1A]">
                ₹{salePrice.toLocaleString()}
              </span>
              <span className="text-xs text-[#9CA3AF] line-through">
                ₹{price.toLocaleString()}
              </span>
            </>
          ) : (
            <span className="text-sm font-semibold text-[#1A1A1A]">
              ₹{price.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
