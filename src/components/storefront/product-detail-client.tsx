"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronDown, ChevronRight, Minus, Plus, Loader2, MessageSquare, CheckCircle, ShieldCheck, Truck, RefreshCw, Heart, Share2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/storefront/cart-provider";
import { ProductCard } from "@/components/storefront/product-card";
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import { sanitizeHtml, formatCurrency, parseProductDescription } from "@/lib/utils";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

// Reusable Accordion Item
function AccordionItem({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className="border-b border-[rgba(0,0,0,0.06)] py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left focus:outline-none cursor-pointer group"
      >
        <span className="text-sm font-semibold uppercase tracking-wider text-[#1A1A1A] group-hover:text-accent transition-colors">{title}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4 text-[#6B6B6B] group-hover:text-[#1A1A1A] transition-colors" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-4 pb-2 text-sm text-[#6B6B6B] leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ProductDetailClient({ 
  productData, 
  relatedProducts,
  reviews = []
}: { 
  productData: any; 
  relatedProducts: any[];
  reviews?: any[];
}) {
  const { addItem } = useCart();
  const { user, profile } = useAuth();
  const { addToast } = useToast();
  const supabase = React.useMemo(() => createClient(), []);

  const parsed = React.useMemo(() => {
    return parseProductDescription(productData.description);
  }, [productData.description]);

  const [activeImageIndex, setActiveImageIndex] = React.useState(0);
  const [detailImages, setDetailImages] = React.useState<string[]>(productData.images || []);

  React.useEffect(() => {
    setDetailImages(productData.images || []);
  }, [productData.images]);

  const fallbackPlaceholder = "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80";

  const [selectedColor, setSelectedColor] = React.useState(productData.colors[0]?.name || "Default");
  const [selectedSize, setSelectedSize] = React.useState(productData.sizes[0] || "Default");
  const [quantity, setQuantity] = React.useState(1);
  const [sizeError, setSizeError] = React.useState(false);

  // Mobile sticky CTA: show when main CTA scrolls out of view
  const ctaRef = React.useRef<HTMLButtonElement>(null);
  const [showStickyCta, setShowStickyCta] = React.useState(false);

  React.useEffect(() => {
    const node = ctaRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyCta(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const [isWishlisted, setIsWishlisted] = React.useState(false);
  const [wishlistLoading, setWishlistLoading] = React.useState(false);

  React.useEffect(() => {
    if (user?.id && productData.id) {
      const userId = user.id;
      async function checkWishlist() {
        const { data } = await supabase
          .from("wishlist")
          .select("id")
          .eq("user_id", userId)
          .eq("product_id", productData.id)
          .maybeSingle();
        setIsWishlisted(!!data);
      }
      checkWishlist();
    } else if (productData.id) {
      // Guest local storage check
      try {
        const stored = localStorage.getItem("nanweb_guest_wishlist");
        const list = stored ? JSON.parse(stored) : [];
        setIsWishlisted(list.includes(productData.id));
      } catch (e) {
        console.error(e);
      }
    }
  }, [user, productData.id, supabase]);

  const toggleWishlist = async () => {
    if (!user) {
      // Guest Toggle logic using LocalStorage
      try {
        const stored = localStorage.getItem("nanweb_guest_wishlist");
        let list: string[] = stored ? JSON.parse(stored) : [];
        if (list.includes(productData.id)) {
          list = list.filter(id => id !== productData.id);
          setIsWishlisted(false);
          addToast({ title: "Removed from Wishlist", type: "success" });
        } else {
          list.push(productData.id);
          setIsWishlisted(true);
          addToast({ 
            title: "Added to Wishlist", 
            description: "Sign in to sync your wishlist across devices.", 
            type: "success" 
          });
        }
        localStorage.setItem("nanweb_guest_wishlist", JSON.stringify(list));
      } catch (err) {
        console.error(err);
      }
      return;
    }

    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        const { error } = await supabase
          .from("wishlist")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", productData.id);

        if (error) throw error;
        setIsWishlisted(false);
        addToast({ title: "Removed from Wishlist", type: "success" });
      } else {
        const { error } = await supabase
          .from("wishlist")
          .insert([{ user_id: user.id, product_id: productData.id }]);

        if (error) throw error;
        setIsWishlisted(true);
        addToast({ title: "Added to Wishlist", type: "success" });
      }
    } catch (err: any) {
      console.error(err);
      addToast({ title: "Error", description: err.message, type: "error" });
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: productData.title,
      text: productData.description || `Check out ${productData.title}`,
      url: window.location.href,
    };

    if (typeof window !== "undefined" && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        console.log("Error sharing:", err);
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      addToast({
        title: "Link Copied",
        description: "Product link copied to clipboard.",
        type: "success",
      });
    } catch (err) {
      addToast({
        title: "Copy Failed",
        description: "Could not copy link to clipboard.",
        type: "error",
      });
    }
  };

  // Hover Zoom States
  const [zoomStyle, setZoomStyle] = React.useState<React.CSSProperties>({ display: "none" });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      display: "block",
      backgroundImage: `url(${productData.images[activeImageIndex]})`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundSize: "220%",
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: "none" });
  };

  // Add to Cart
  const handleAddToCart = () => {
    if (productData.track_inventory && productData.stock_quantity <= 0) {
      addToast({ title: "Out of Stock", description: "This item is currently out of stock.", type: "error" });
      return;
    }

    // Inline size validation
    if (productData.sizes && productData.sizes.length > 0 && !selectedSize) {
      setSizeError(true);
      addToast({ title: "Please select a size", type: "error" });
      return;
    }
    
    const activePrice = productData.salePrice || productData.price;
    addItem({
      id: productData.id + "-" + selectedColor + "-" + selectedSize,
      title: productData.title,
      price: activePrice,
      quantity,
      image: productData.images[0],
      variant: `${selectedColor} / ${selectedSize}`,
    });

    addToast({
      title: "Added to Cart",
      description: `${productData.title} (${selectedColor} / ${selectedSize}) has been added to your shopping cart.`,
      type: "success"
    });
  };

  // Enforced stock limit increments
  const handleIncrement = () => {
    if (productData.track_inventory && quantity >= productData.stock_quantity) {
      addToast({
        title: "Stock Limit Reached",
        description: `Only ${productData.stock_quantity} items are available.`,
        type: "error"
      });
      return;
    }
    setQuantity(prev => prev + 1);
  };

  // Review Form States
  const [reviewRating, setReviewRating] = React.useState(5);
  const [reviewTitle, setReviewTitle] = React.useState("");
  const [reviewBody, setReviewBody] = React.useState("");
  const [submittingReview, setSubmittingReview] = React.useState(false);
  const [localReviews, setLocalReviews] = React.useState<any[]>(reviews);
  const [deletingReviewId, setDeletingReviewId] = React.useState<string | null>(null);
  const [deletingReview, setDeletingReview] = React.useState(false);

  React.useEffect(() => {
    setLocalReviews(reviews);
  }, [reviews]);


  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      addToast({ title: "Sign In Required", description: "Please sign in to submit a review.", type: "error" });
      return;
    }
    if (!reviewBody.trim()) return;

    setSubmittingReview(true);
    try {
      const { data, error } = await supabase
        .from("reviews")
        .insert([{
          product_id: productData.id,
          user_id: user.id,
          rating: reviewRating,
          title: reviewTitle.trim() || null,
          body: reviewBody.trim(),
          is_verified: true
        }])
        .select(`
          id,
          rating,
          title,
          body,
          is_verified,
          created_at
        `)
        .single();

      if (error) throw error;

      addToast({ title: "Review Submitted", description: "Thank you! Your review has been added.", type: "success" });
      
      const newRev = {
        id: data.id,
        rating: data.rating,
        title: data.title,
        body: data.body,
        is_verified: data.is_verified,
        created_at: data.created_at,
        user_id: user.id,
        full_name: profile?.full_name || "Verified Customer",
        avatar_url: profile?.avatar_url || null
      };

      setLocalReviews(prev => [newRev, ...prev]);
      setReviewTitle("");
      setReviewBody("");
    } catch (err: any) {
      console.error("Review submission failed:", err);
      addToast({ title: "Submission Failed", description: err.message || "Could not save review.", type: "error" });
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!deletingReviewId) return;
    setDeletingReview(true);
    try {
      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", deletingReviewId);

      if (error) throw error;
      
      addToast({ title: "Review deleted", description: "Your review has been removed.", type: "success" });
      setLocalReviews(prev => prev.filter(r => r.id !== deletingReviewId));
    } catch (err: any) {
      console.error(err);
      addToast({ title: "Delete failed", description: err.message, type: "error" });
    } finally {
      setDeletingReview(false);
      setDeletingReviewId(null);
    }
  };

  const totalReviews = localReviews.length;
  const currentAvgRating = React.useMemo(() => {
    if (localReviews.length === 0) return 5.0;
    const sum = localReviews.reduce((acc, r) => acc + r.rating, 0);
    return Number((sum / localReviews.length).toFixed(1));
  }, [localReviews]);

  const ratingDistribution = [0, 0, 0, 0, 0];
  localReviews.forEach(r => {
    const starIdx = 5 - r.rating;
    if (starIdx >= 0 && starIdx < 5) ratingDistribution[starIdx]++;
  });

  const isOutOfStock = productData.track_inventory && productData.stock_quantity <= 0;

  return (
    <div className="mx-auto max-w-[1440px] px-6 lg:px-16 py-12">
      {/* Breadcrumbs */}
      <nav className="mb-10 flex items-center text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
        <Link href="/" className="hover:text-[#1A1A1A] transition-colors">Home</Link>
        <ChevronRight className="mx-2 h-3 w-3 text-[#C4C4C4]" />
        <Link href="/products" className="hover:text-[#1A1A1A] transition-colors">Products</Link>
        <ChevronRight className="mx-2 h-3 w-3 text-[#C4C4C4]" />
        <span className="text-[#6B6B6B] truncate max-w-[180px]">{productData.title}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
        {/* Left: Image Gallery */}
        <div className="w-full lg:w-1/2 flex flex-col-reverse md:flex-row gap-5 h-auto md:h-[600px] lg:h-[650px]">
          {/* Thumbnails strip */}
          <div className="flex md:flex-col gap-3.5 overflow-x-auto md:overflow-y-auto md:w-20 flex-shrink-0 scrollbar-hide py-1">
            {detailImages.map((img: string, i: number) => (
              <button
                key={i}
                onClick={() => setActiveImageIndex(i)}
                className={`relative aspect-[3/4] w-16 md:w-full overflow-hidden rounded-lg border-2 transition-all cursor-pointer flex-shrink-0 bg-[#F5F5F0] ${
                  activeImageIndex === i ? "border-[#1A1A1A]" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <img 
                  src={img || fallbackPlaceholder} 
                  alt={`Thumbnail ${i}`} 
                  onError={() => {
                    setDetailImages(prev => {
                      const copy = [...prev];
                      copy[i] = fallbackPlaceholder;
                      return copy;
                    });
                  }}
                  className="w-full h-full object-cover" 
                />
              </button>
            ))}
          </div>

          {/* Main image with hover zoom */}
          <div 
            className="relative flex-1 rounded-2xl overflow-hidden bg-[#F5F5F0] border border-[rgba(0,0,0,0.06)] shadow-sm cursor-zoom-in group aspect-[3/4] md:aspect-auto"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <img
                  src={detailImages[activeImageIndex] || fallbackPlaceholder}
                  alt={productData.title}
                  onError={() => {
                    setDetailImages(prev => {
                      const copy = [...prev];
                      copy[activeImageIndex] = fallbackPlaceholder;
                      return copy;
                    });
                  }}
                  className="w-full h-full object-cover object-center"
                />
              </motion.div>
            </AnimatePresence>

            {/* Hover Magnifying Glass Overlay */}
            <div 
              style={zoomStyle}
              className="absolute inset-0 pointer-events-none border border-[rgba(0,0,0,0.04)] z-20 shadow-inner transition-opacity duration-150"
            />
          </div>
        </div>

        {/* Right: Product Info details */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#1A1A1A] leading-tight mb-3">
                {productData.title}
              </h1>
              
              <div className="flex items-center space-x-4">
                {productData.salePrice ? (
                  <>
                    <p className="text-2xl font-bold text-accent tracking-tight">{formatCurrency(productData.salePrice)}</p>
                    <p className="text-sm text-[#9CA3AF] line-through">{formatCurrency(productData.price)}</p>
                    <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-accent">
                      -{Math.round(((productData.price - productData.salePrice) / productData.price) * 100)}%
                    </span>
                  </>
                ) : (
                  <p className="text-2xl font-bold text-[#1A1A1A] tracking-tight">{formatCurrency(productData.price)}</p>
                )}
                
                {totalReviews > 0 && (
                  <div className="flex items-center space-x-1.5 text-xs text-[#6B6B6B] border-l border-[rgba(0,0,0,0.08)] pl-4">
                    <div className="flex text-amber-400 gap-0.5">
                      {[1,2,3,4,5].map(star => (
                        <Star key={star} className={`h-3.5 w-3.5 ${star <= Math.floor(currentAvgRating) ? 'fill-current' : 'text-gray-200'}`} />
                      ))}
                    </div>
                    <span className="font-bold text-[#1A1A1A] ml-1">
                      {currentAvgRating}
                    </span>
                    <span className="text-[#9CA3AF]">
                      ({totalReviews} {totalReviews === 1 ? "Review" : "Reviews"})
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div 
              className="text-[#6B6B6B] text-sm leading-relaxed border-t pt-6" 
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(parsed.html || productData.description) }}
            />

            {/* Key Highlights */}
            <div className="pb-6 border-b border-[rgba(0,0,0,0.06)] pt-4 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6B6B6B]">Key Highlights</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 text-xs text-[#6B6B6B]">
                {(parsed.highlights.length > 0 ? parsed.highlights : [
                  "Premium Craftsmanship & Detailing",
                  "Sustainably Sourced Luxury Fabric",
                  "Tailored Fit for Versatile Styling",
                  "Limited Run & Exclusive Edition"
                ]).map((highlight, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#1A1A1A] flex-shrink-0" />
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Color swatch selectors */}
            {productData.colors && productData.colors.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B6B6B]">Color: {selectedColor}</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {productData.colors.map((color: any) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`h-9 w-9 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer ${
                        selectedColor === color.name ? "border-[#1A1A1A] scale-105" : "border-transparent hover:border-gray-300"
                      }`}
                      aria-label={`Select ${color.name}`}
                    >
                      <span className="block h-7 w-7 rounded-full shadow-sm" style={{ backgroundColor: color.hex || '#ccc', border: color.name.toLowerCase() === 'white' ? '1px solid rgba(0,0,0,0.1)' : 'none' }} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size select swatch */}
            {productData.sizes && productData.sizes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B6B6B]">Size: {selectedSize || "Select"}</span>
                  <button className="text-[10px] font-bold text-[#9CA3AF] hover:text-[#1A1A1A] underline uppercase tracking-wider cursor-pointer">Size Guide</button>
                </div>
                <div className={`flex flex-wrap gap-2.5 rounded-lg p-1 -m-1 transition-all ${
                  sizeError ? "ring-2 ring-red-400 ring-offset-1 animate-[shake_0.3s_ease-in-out]" : ""
                }`}>
                  {productData.sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => { setSelectedSize(size); setSizeError(false); }}
                      className={`h-11 min-w-[2.75rem] px-4 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        selectedSize === size
                          ? "border-[#1A1A1A] bg-[#1A1A1A] text-white shadow-sm"
                          : "border-[rgba(0,0,0,0.08)] bg-white text-[#6B6B6B] hover:border-[#1A1A1A] hover:text-[#1A1A1A]"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {sizeError && (
                  <p className="text-[11px] text-red-500 font-medium mt-1.5">Please select a size to continue</p>
                )}
              </div>
            )}

            {/* Quantity selector & Add to Cart CTA */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="flex items-center border border-[rgba(0,0,0,0.08)] rounded-lg h-12 w-full sm:w-28 bg-[#FAFAFA]">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-2.5 text-[#9CA3AF] hover:text-[#1A1A1A] transition-colors h-full flex items-center justify-center cursor-pointer"
                  disabled={isOutOfStock}
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="flex-1 text-center font-bold text-xs text-[#1A1A1A]">{quantity}</span>
                <button
                  onClick={handleIncrement}
                  className="px-2.5 text-[#9CA3AF] hover:text-[#1A1A1A] transition-colors h-full flex items-center justify-center cursor-pointer"
                  disabled={isOutOfStock}
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              
              <Button
                ref={ctaRef}
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                size="lg"
                className={`flex-1 h-12 text-xs font-bold uppercase tracking-wider shadow-md transition-all shimmer-btn ${
                  isOutOfStock ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isOutOfStock ? "Out of Stock" : `Add to Cart — ${formatCurrency((productData.salePrice || productData.price) * quantity)}`}
              </Button>

              <div className="flex gap-2">
                {/* Wishlist Button */}
                <button
                  onClick={toggleWishlist}
                  disabled={wishlistLoading}
                  className={`h-12 w-12 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                    isWishlisted 
                      ? "border-red-500 bg-red-50 text-red-500 hover:bg-red-100" 
                      : "border-[rgba(0,0,0,0.08)] bg-white text-[#6B6B6B] hover:border-[#1A1A1A] hover:text-[#1A1A1A]"
                  }`}
                  aria-label="Toggle Wishlist"
                >
                  <Heart className={`h-4.5 w-4.5 ${isWishlisted ? "fill-current" : ""}`} />
                </button>

                {/* Share Button */}
                <button
                  onClick={handleShare}
                  className="h-12 w-12 rounded-lg border border-[rgba(0,0,0,0.08)] bg-white text-[#6B6B6B] hover:border-[#1A1A1A] hover:text-[#1A1A1A] flex items-center justify-center transition-all cursor-pointer"
                  aria-label="Share Product"
                >
                  <Share2 className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Accordion Specs & Policies */}
          <div className="mt-10 border-t border-[rgba(0,0,0,0.06)] pt-2">
            <AccordionItem title="Specifications" defaultOpen>
              <table className="w-full text-left text-xs border border-[rgba(0,0,0,0.04)] rounded-lg overflow-hidden bg-[#FAFAFA] shadow-sm">
                <tbody className="divide-y divide-[rgba(0,0,0,0.04)] text-[#6B6B6B]">
                  {Object.entries(
                    Object.keys(parsed.specifications).length > 0 ? parsed.specifications : {
                      "Composition": "100% Certified Organic Cotton",
                      "Weight": "Mid-weight (200 GSM)",
                      "Origin": "Ethically Tailored in Portugal",
                      "Care": "Cold wash with like colors, air dry"
                    }
                  ).map(([key, val]) => (
                    <tr key={key}>
                      <td className="px-4 py-2.5 font-semibold text-[#1A1A1A] w-1/3">{key}</td>
                      <td className="px-4 py-2.5">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </AccordionItem>
            
            <AccordionItem title="Delivery & Returns">
              <div className="space-y-3 text-xs leading-relaxed text-[#6B6B6B]">
                <div className="flex gap-2.5 items-start">
                  <Truck className="w-4 h-4 text-[#1A1A1A] flex-shrink-0" />
                  <p>Complimentary standard shipping on all orders above ₹3,000. Delivered in 3-5 business days.</p>
                </div>
                <div className="flex gap-2.5 items-start">
                  <RefreshCw className="w-4 h-4 text-[#1A1A1A] flex-shrink-0" />
                  <p>Prepaid shipping labels provided for all exchanges and returns initiated within 30 days of shipment.</p>
                </div>
              </div>
            </AccordionItem>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="mt-28 border-t border-[rgba(0,0,0,0.06)] pt-16">
        <p className="text-caption text-center text-[#9CA3AF] mb-2">Opinions</p>
        <h2 className="text-section text-center mb-12 text-[#1A1A1A]">Product Reviews</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start max-w-5xl mx-auto mb-16">
          {/* Rating breakdowns */}
          <div className="lg:col-span-4 space-y-4">
            <div className="text-center bg-white p-6 rounded-2xl border border-[rgba(0,0,0,0.06)] shadow-sm">
              <p className="text-5xl font-serif font-extrabold text-[#1A1A1A]">{currentAvgRating || "5.0"}</p>
              <div className="flex text-amber-400 justify-center my-3 gap-0.5">
                {[1,2,3,4,5].map(star => (
                  <Star key={star} className={`h-4.5 w-4.5 ${star <= Math.floor(currentAvgRating || 5) ? 'fill-current' : 'text-gray-200'}`} />
                ))}
              </div>
              <p className="text-[10px] text-[#9CA3AF] font-semibold uppercase tracking-wider">
                Based on {totalReviews} {totalReviews === 1 ? "Review" : "Reviews"}
              </p>
            </div>

            {/* Distribution bars */}
            <div className="space-y-3 bg-white p-6 rounded-2xl border border-[rgba(0,0,0,0.06)] shadow-sm">
              {[5, 4, 3, 2, 1].map((stars, idx) => {
                const count = ratingDistribution[idx];
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center text-[11px] text-[#6B6B6B]">
                    <span className="w-12 font-medium">{stars} Stars</span>
                    <div className="flex-1 h-1.5 bg-[#F5F5F0] rounded-full mx-3 overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${percentage}%` }} />
                    </div>
                    <span className="w-6 text-right font-bold text-[#1A1A1A]">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Review write form */}
          <div className="lg:col-span-8 bg-white border border-[rgba(0,0,0,0.06)] rounded-2xl p-8 shadow-sm">
            <h3 className="font-serif text-lg font-semibold text-[#1A1A1A] mb-6">Write a Review</h3>
            {user ? (
              <form onSubmit={handleReviewSubmit} className="space-y-5">
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B]">Select Rating:</span>
                  <div className="flex text-amber-400 gap-0.5">
                    {[1,2,3,4,5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="cursor-pointer focus:outline-none"
                      >
                        <Star className={`w-5.5 h-5.5 transition-colors ${star <= reviewRating ? 'fill-current' : 'text-gray-200 hover:text-amber-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <input
                    type="text"
                    placeholder="Review Title (optional)"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    className="w-full rounded-lg border border-[rgba(0,0,0,0.08)] bg-white px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] placeholder-[#C4C4C4] outline-none focus:border-[#1A1A1A] transition-colors"
                  />
                  <textarea
                    placeholder="Tell us what you think of this product..."
                    value={reviewBody}
                    onChange={(e) => setReviewBody(e.target.value)}
                    rows={4}
                    required
                    className="w-full rounded-lg border border-[rgba(0,0,0,0.08)] bg-white px-4 py-3 text-sm text-[#1A1A1A] placeholder-[#C4C4C4] outline-none focus:border-[#1A1A1A] resize-none transition-colors"
                  />
                </div>

                <Button type="submit" disabled={submittingReview} className="h-11 px-6 cursor-pointer shimmer-btn">
                  {submittingReview ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "SUBMIT REVIEW"}
                </Button>
              </form>
            ) : (
              <div className="text-center py-8 border border-dashed border-[rgba(0,0,0,0.08)] rounded-xl">
                <p className="text-xs font-medium text-[#6B6B6B] mb-4">Please sign in to write a review for this product.</p>
                <Link href="/account">
                  <Button variant="outline" className="h-10 cursor-pointer font-bold text-xs uppercase tracking-wider">Sign In</Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Cards lists */}
        <div className="max-w-3xl mx-auto space-y-6">
          {localReviews.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-[rgba(0,0,0,0.06)] shadow-sm text-[#6B6B6B]">
              <MessageSquare className="w-8 h-8 mx-auto text-gray-300 mb-3.5" />
              <p className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">No reviews yet</p>
              <p className="text-xs text-[#9CA3AF] mt-1">Be the first to share your thoughts on this product!</p>
            </div>
          ) : (
            localReviews.map((rev) => (
              <div key={rev.id} className="bg-white border border-[rgba(0,0,0,0.06)] rounded-2xl p-6 md:p-8 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex text-amber-400 mb-1.5 gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-current' : 'text-gray-200'}`} />
                      ))}
                    </div>
                    {rev.title && <h4 className="font-serif text-base font-bold text-[#1A1A1A]">{rev.title}</h4>}
                  </div>
                  <div className="text-right flex flex-col items-end gap-2 text-xs">
                    <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">{new Date(rev.created_at).toLocaleDateString()}</span>
                    {user && rev.user_id === user.id && (
                      <button
                        onClick={() => setDeletingReviewId(rev.id)}
                        className="text-[10px] font-bold text-red-650 hover:text-red-700 hover:underline uppercase tracking-wider cursor-pointer mt-1"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-sm text-[#6B6B6B] leading-relaxed">{rev.body}</p>

                <div className="flex items-center space-x-2 border-t border-[rgba(0,0,0,0.04)] pt-4 mt-2">
                  <div className="h-6 w-6 rounded-full bg-accent text-white flex items-center justify-center text-[10px] font-bold">
                    {(rev.full_name?.[0] || "U").toUpperCase()}
                  </div>
                  <span className="text-xs font-bold text-[#1A1A1A]">{rev.full_name}</span>
                  {rev.is_verified && (
                    <span className="inline-flex items-center text-[9px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-wider border border-green-100 gap-0.5">
                      <CheckCircle className="w-3 h-3 text-green-700" />
                      Verified
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="mt-32 border-t border-[rgba(0,0,0,0.06)] pt-16">
          <p className="text-caption text-center text-[#9CA3AF] mb-2">Suggestions</p>
          <h2 className="text-section text-center font-bold tracking-tight mb-12">You Might Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {relatedProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      )}

      {/* Review Self Deletion Modal */}
      <ConfirmationModal
        isOpen={deletingReviewId !== null}
        onClose={() => setDeletingReviewId(null)}
        onConfirm={handleDeleteReview}
        title="Remove Review"
        message="Are you sure you want to delete your review? This will permanently remove it from the product rating statistics."
        confirmLabel="Remove"
        isLoading={deletingReview}
        variant="danger"
      />

      {/* Mobile Sticky Add to Cart CTA */}
      <AnimatePresence>
        {showStickyCta && !isOutOfStock && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-md border-t border-[rgba(0,0,0,0.08)] px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
          >
            <div className="flex items-center gap-3 max-w-lg mx-auto">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#1A1A1A] truncate">{productData.title}</p>
                <p className="text-xs font-bold text-accent">{formatCurrency((productData.salePrice || productData.price) * quantity)}</p>
              </div>
              <Button
                onClick={handleAddToCart}
                size="lg"
                className="h-11 px-6 text-xs font-bold uppercase tracking-wider shadow-md shimmer-btn whitespace-nowrap"
              >
                Add to Cart
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
