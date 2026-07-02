"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/storefront/product-card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import { ChevronLeft, ChevronRight, Loader2, ArrowRight, Star, ArrowUpRight, ShoppingBag } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export function HomePageClient({ 
  newArrivals,
  bestSellers,
  featuredCategories,
  heroSlides
}: { 
  newArrivals: any[];
  bestSellers: any[];
  featuredCategories: any[];
  heroSlides: any[];
}) {
  const { addToast } = useToast();
  const [quickViewId, setQuickViewId] = React.useState<string | null>(null);
  
  // Combine lists for quickview search
  const allProducts = [...newArrivals, ...bestSellers];
  const selectedProduct = allProducts.find(p => p.id === quickViewId);

  // 1. Hero Carousel State & Auto-Rotate
  const [currentSlide, setCurrentSlide] = React.useState(0);
  
  React.useEffect(() => {
    if (!heroSlides.length) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // 2. Countdown Timer State
  const [timeLeft, setTimeLeft] = React.useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  React.useEffect(() => {
    const target = new Date();
    target.setDate(target.getDate() + (7 - target.getDay()));
    target.setHours(23, 59, 59, 999);

    const updateTimer = () => {
      const difference = target.getTime() - new Date().getTime();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  // 3. Newsletter Submission State
  const [email, setEmail] = React.useState("");
  const [submittingNewsletter, setSubmittingNewsletter] = React.useState(false);
  const supabase = React.useMemo(() => createClient(), []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmittingNewsletter(true);
    try {
      const { error } = await supabase
        .from("subscribers")
        .insert([{ email: email.trim().toLowerCase() }]);

      if (error) {
        if (error.code === "23505") {
          addToast({
            title: "Already Subscribed",
            description: "You're already on our updates list.",
            type: "success"
          });
        } else {
          throw error;
        }
      } else {
        addToast({
          title: "Subscribed Successfully",
          description: "Thank you for subscribing! Check your email for your 10% coupon code.",
          type: "success"
        });
      }
      setEmail("");
    } catch (err: any) {
      console.error("Newsletter subscription error:", err);
      addToast({
        title: "Subscription Failed",
        description: err.message || "Something went wrong. Please try again.",
        type: "error"
      });
    } finally {
      setSubmittingNewsletter(false);
    }
  };

  const trustBadges = [
    { title: "Complimentary Delivery", desc: "Free standard shipping on all orders above ₹3,000" },
    { title: "Conscious Craftsmanship", desc: "100% organic fibers and certified eco-responsible leathers" },
    { title: "Secure Transactions", desc: "Fully encrypted and seamless payment processing by Razorpay" },
  ];

  const testimonials = [
    { name: "Aarav S.", role: "Verified Buyer", text: "The quality of the Organic Cotton Tee is outstanding. It feels incredibly premium and holds shape wash after wash." },
    { name: "Meera K.", role: "Verified Buyer", text: "Minimal design at its absolute finest. Shipping was fast, and the customer support is extremely polite and responsive." },
    { name: "Kabir D.", role: "Verified Buyer", text: "Classic aesthetic, perfect fit, and honest pricing. My new go-to brand for high-end everyday essentials." }
  ];

  return (
    <div className="flex flex-col bg-[#FAFAFA]">
      
      {/* Hero Carousel Section */}
      <section className="relative h-[85vh] min-h-[600px] w-full overflow-hidden bg-black">
        <AnimatePresence mode="wait">
          {heroSlides.length > 0 && (
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              className="absolute inset-0 w-full h-full"
            >
              <div className="relative w-full h-full">
                <img
                  src={heroSlides[currentSlide]?.image_url || "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=2000&q=80"}
                  alt="Slide background"
                  className="w-full h-full object-cover object-center opacity-65"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/35" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex max-w-3xl flex-col items-center text-center px-6">
                  <motion.p
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-caption text-white/80 mb-4"
                  >
                    Premium Essentials
                  </motion.p>
                  <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="text-hero text-white mb-6"
                  >
                    {heroSlides[currentSlide]?.heading || "Elevate Your Everyday"}
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 0.9, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="text-sm md:text-base text-white/80 mb-10 max-w-xl leading-relaxed"
                  >
                    {heroSlides[currentSlide]?.subheading || "Discover our new collection of premium essentials designed for the modern lifestyle."}
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                  >
                    <Link href={heroSlides[currentSlide]?.cta_link || "/products"}>
                      <Button size="lg" className="px-10 py-6 text-xs font-semibold tracking-widest uppercase rounded-md shadow-md shimmer-btn">
                        {heroSlides[currentSlide]?.cta_text || "SHOP THE COLLECTION"}
                      </Button>
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Carousel Controls */}
        {heroSlides.length > 1 && (
          <>
            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
              className="absolute left-8 top-1/2 -translate-y-1/2 p-3 rounded-full border border-white/10 bg-black/20 text-white/70 hover:text-white hover:bg-black/40 hover:border-white/30 transition-all cursor-pointer hidden md:block"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
              className="absolute right-8 top-1/2 -translate-y-1/2 p-3 rounded-full border border-white/10 bg-black/20 text-white/70 hover:text-white hover:bg-black/40 hover:border-white/30 transition-all cursor-pointer hidden md:block"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Thin Slide Progress Indicators */}
        {heroSlides.length > 1 && (
          <div className="absolute bottom-10 left-0 right-0 z-20 flex justify-center space-x-2.5">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className="group flex flex-col items-center focus:outline-none cursor-pointer py-2"
              >
                <div
                  className={`h-0.5 w-12 transition-all duration-300 ${
                    currentSlide === i ? "bg-white" : "bg-white/20 group-hover:bg-white/40"
                  }`}
                />
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Featured Categories */}
      <section className="py-24 md:py-32 px-6 lg:px-16 mx-auto w-full max-w-[1440px]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex justify-between items-end mb-12 border-b border-[rgba(0,0,0,0.06)] pb-6"
        >
          <div>
            <p className="text-caption-sm text-[#9CA3AF] mb-1">Curation</p>
            <h2 className="text-section text-[#1A1A1A]">Shop Collections</h2>
          </div>
          <Link href="/products" className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A] hover:text-accent transition-colors flex items-center gap-1.5 pb-1">
            Browse All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredCategories.map((cat, i) => (
            <motion.div
              key={cat.id || cat.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="group relative aspect-[3/4] overflow-hidden bg-[#F5F5F0] rounded-2xl border border-[rgba(0,0,0,0.04)] shadow-sm"
            >
              <img
                src={cat.image_url || cat.image || "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&w=800&q=80"}
                alt={cat.name || cat.title}
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
              <div className="absolute inset-x-6 bottom-8 flex flex-col items-center text-center">
                <h3 className="font-serif text-2xl text-white font-semibold tracking-wide mb-4">
                  {cat.name || cat.title}
                </h3>
                <Link href={`/products?category=${encodeURIComponent((cat.name || cat.title).toLowerCase())}`}>
                  <Button variant="outline" size="sm" className="bg-white/95 backdrop-blur-sm hover:bg-white text-[#1A1A1A] rounded-lg shadow-md font-semibold text-xs tracking-wider">
                    EXPLORE
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="py-24 md:py-32 px-6 lg:px-16 mx-auto w-full max-w-[1440px] border-t border-[rgba(0,0,0,0.06)]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 space-y-3"
        >
          <p className="text-caption text-[#9CA3AF]">New arrivals</p>
          <h2 className="text-section text-[#1A1A1A]">Curated Seasonal Additions</h2>
          <p className="text-[#6B6B6B] text-sm max-w-xl mx-auto leading-relaxed">
            Fresh arrivals curated for the seasonal change. Impeccable tailoring and high-grade organic fibers.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {newArrivals.map((product) => (
            <ProductCard 
              key={product.id} 
              {...product} 
              onQuickAdd={(id) => setQuickViewId(id)}
            />
          ))}
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="py-24 md:py-32 px-6 lg:px-16 mx-auto w-full max-w-[1440px] border-t border-[rgba(0,0,0,0.06)]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 space-y-3"
        >
          <p className="text-caption text-[#9CA3AF]">Most favored</p>
          <h2 className="text-section text-[#1A1A1A]">The Bestselling Classics</h2>
          <p className="text-[#6B6B6B] text-sm max-w-xl mx-auto leading-relaxed">
            Highly favored essentials backed by hundreds of reviews. Restocked due to popular demand.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {bestSellers.map((product) => (
            <ProductCard 
              key={product.id} 
              {...product} 
              onQuickAdd={(id) => setQuickViewId(id)}
            />
          ))}
        </div>
      </section>

      {/* Promotional Banner with Countdown Timer */}
      <section className="relative py-24 px-6 md:px-16 w-full bg-[#1A1A1A] text-white flex items-center justify-center overflow-hidden border-t border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-tr from-black via-zinc-950 to-zinc-900 opacity-90" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center z-10 max-w-3xl space-y-6"
        >
          <p className="text-caption text-accent font-bold">Limited Invitation</p>
          <h2 className="text-section text-white">Seasonal Flash Event</h2>
          <p className="text-white/60 text-sm max-w-xl mx-auto leading-relaxed">
            Receive custom privileges on checkouts this week. Reductions apply automatically during step verification.
          </p>

          {/* Countdown Clock */}
          <div className="flex justify-center items-center space-x-6 py-6 font-serif">
            <div className="flex flex-col items-center">
              <span className="text-4xl md:text-5xl font-bold tracking-tight">{String(timeLeft.days).padStart(2, "0")}</span>
              <span className="text-[10px] uppercase tracking-widest text-white/40 mt-2 font-semibold font-sans">Days</span>
            </div>
            <span className="text-2xl text-accent font-bold pb-4">:</span>
            <div className="flex flex-col items-center">
              <span className="text-4xl md:text-5xl font-bold tracking-tight">{String(timeLeft.hours).padStart(2, "0")}</span>
              <span className="text-[10px] uppercase tracking-widest text-white/40 mt-2 font-semibold font-sans">Hours</span>
            </div>
            <span className="text-2xl text-accent font-bold pb-4">:</span>
            <div className="flex flex-col items-center">
              <span className="text-4xl md:text-5xl font-bold tracking-tight">{String(timeLeft.minutes).padStart(2, "0")}</span>
              <span className="text-[10px] uppercase tracking-widest text-white/40 mt-2 font-semibold font-sans">Mins</span>
            </div>
            <span className="text-2xl text-accent font-bold pb-4">:</span>
            <div className="flex flex-col items-center">
              <span className="text-4xl md:text-5xl font-bold tracking-tight">{String(timeLeft.seconds).padStart(2, "0")}</span>
              <span className="text-[10px] uppercase tracking-widest text-white/40 mt-2 font-semibold font-sans">Secs</span>
            </div>
          </div>

          <div className="pt-4">
            <Link href="/products">
              <Button variant="outline" size="lg" className="bg-white border-white text-[#1A1A1A] hover:bg-[#F5F5F0] rounded-lg px-10 h-12 font-semibold text-xs tracking-wider">
                Browse Event
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Trust Badges */}
      <section className="py-20 bg-white border-b border-[rgba(0,0,0,0.06)]">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {trustBadges.map((badge, idx) => (
              <div key={idx} className="flex flex-col items-center text-center p-8 space-y-3 bg-[#FAFAFA] rounded-2xl border border-[rgba(0,0,0,0.04)] shadow-sm">
                <h3 className="font-serif text-lg font-semibold text-[#1A1A1A]">{badge.title}</h3>
                <p className="text-xs text-[#6B6B6B] max-w-xs leading-relaxed">{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 md:py-32 bg-[#FAFAFA]">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-16">
          <p className="text-caption text-center text-[#9CA3AF] mb-3">Feedbacks</p>
          <h2 className="text-section text-center mb-16 text-[#1A1A1A]">Client Experiences</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <div key={idx} className="bg-white border border-[rgba(0,0,0,0.04)] rounded-2xl p-8 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex text-amber-400 mb-5 gap-0.5">
                    {[1,2,3,4,5].map(s => <Star key={s} className="w-3.5 h-3.5 fill-current" />)}
                  </div>
                  <p className="text-[#6B6B6B] text-[14px] leading-relaxed italic mb-6">&ldquo;{t.text}&rdquo;</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1A1A1A]">{t.name}</p>
                  <p className="text-[10px] text-[#9CA3AF] font-semibold uppercase tracking-wider mt-1">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curated Lifestyle Feed */}
      <section className="py-24 md:py-32 bg-white border-t border-b border-[rgba(0,0,0,0.06)]">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-16">
          <div className="text-center mb-16">
            <p className="text-caption text-[#9CA3AF] mb-3">#PREMIUMSTYLE</p>
            <h2 className="text-section text-[#1A1A1A]">Curated Lifestyle Feed</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-5">
            <div className="relative aspect-square overflow-hidden rounded-xl bg-[#F5F5F0] border border-[rgba(0,0,0,0.04)] group">
              <img src="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=400&q=80" alt="" className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-105" />
            </div>
            <div className="relative aspect-square overflow-hidden rounded-xl bg-[#F5F5F0] border border-[rgba(0,0,0,0.04)] group">
              <img src="https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=400&q=80" alt="" className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-105" />
            </div>
            <div className="relative aspect-square overflow-hidden rounded-xl bg-[#F5F5F0] border border-[rgba(0,0,0,0.04)] group">
              <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=80" alt="" className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-105" />
            </div>
            <div className="relative aspect-square overflow-hidden rounded-xl bg-[#F5F5F0] border border-[rgba(0,0,0,0.04)] group">
              <img src="https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=400&q=80" alt="" className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-105" />
            </div>
            <div className="relative aspect-square overflow-hidden rounded-xl bg-[#F5F5F0] border border-[rgba(0,0,0,0.04)] group">
              <img src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=400&q=80" alt="" className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-105" />
            </div>
            <div className="relative aspect-square overflow-hidden rounded-xl bg-[#F5F5F0] border border-[rgba(0,0,0,0.04)] group">
              <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80" alt="" className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-105" />
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-28 px-6 lg:px-16 mx-auto w-full max-w-[1440px] text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <p className="text-caption text-[#9CA3AF] mb-3">Newsletter</p>
          <h2 className="text-section text-[#1A1A1A] mb-4">Join The Club</h2>
          <p className="text-[#6B6B6B] mb-10 text-sm max-w-md mx-auto leading-relaxed">
            Subscribe to our weekly client newsletter. Get priority alerts for restocks, sales, and seasonal additions.
          </p>
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto items-center">
            <div className="w-full flex-1">
              <Input 
                label="Email Address" 
                type="email" 
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            <Button 
              type="submit" 
              size="lg" 
              className="h-12 px-8 whitespace-nowrap w-full sm:w-auto cursor-pointer shadow-sm shimmer-btn"
              disabled={submittingNewsletter}
            >
              {submittingNewsletter ? <Loader2 className="w-4 h-4 animate-spin" /> : "Subscribe"}
            </Button>
          </form>
        </motion.div>
      </section>

      {/* Quick View Modal */}
      <Modal
        isOpen={!!quickViewId}
        onClose={() => setQuickViewId(null)}
        title="Quick View"
        size="lg"
      >
        {selectedProduct && (
          <div className="flex flex-col md:flex-row gap-8">
            <div className="relative aspect-[3/4] w-full md:w-1/2 overflow-hidden bg-[#F5F5F0] rounded-xl border border-[rgba(0,0,0,0.04)]">
              <img
                src={selectedProduct.primaryImage}
                alt={selectedProduct.title}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex w-full md:w-1/2 flex-col justify-between">
              <div className="space-y-5">
                <div>
                  <p className="text-caption text-[#9CA3AF] mb-1">Product details</p>
                  <h2 className="text-product-title text-2xl text-[#1A1A1A] font-semibold">{selectedProduct.title}</h2>
                </div>
                <p className="text-xl font-bold text-[#1A1A1A]">
                  {formatCurrency(selectedProduct.price)}
                </p>
                
                <div className="pt-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B6B] mb-2.5">Available Sizes</p>
                  <div className="flex flex-wrap gap-2.5">
                    {["S", "M", "L"].map((size) => (
                      <button
                        key={size}
                        className="h-10 w-12 rounded-lg border border-[rgba(0,0,0,0.08)] bg-white text-xs font-semibold text-[#1A1A1A] hover:border-[#1A1A1A] hover:bg-[#FAFAFA] transition-all cursor-pointer"
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="pt-8 space-y-3">
                <Link href={`/products/${selectedProduct.slug}`} className="block">
                  <Button className="w-full h-12 text-xs font-bold uppercase tracking-wider shimmer-btn">
                    View Full Details
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="w-full h-12 text-xs font-bold uppercase tracking-wider border-[rgba(0,0,0,0.08)] hover:bg-[#F5F5F0]"
                  onClick={() => setQuickViewId(null)}
                >
                  Close Preview
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
