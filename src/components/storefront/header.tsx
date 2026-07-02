"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, Menu, X, User, LogOut, Heart, ChevronRight } from "lucide-react";
import { useCart } from "./cart-provider";
import { useAuth } from "@/components/providers/auth-provider";
import { createClient } from "@/lib/supabase/client";

const navLinks = [
  { name: "New Arrivals", href: "/products?sort=newest" },
  { name: "Best Sellers", href: "/products?sort=best-selling" },
  { name: "Men", href: "/products?category=men" },
  { name: "Women", href: "/products?category=women" },
  { name: "Accessories", href: "/products?category=accessories" },
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<any[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);

  const { scrollY } = useScroll();
  const headerHeight = useTransform(scrollY, [0, 80], [80, 60]);
  const headerBg = useTransform(
    scrollY,
    [0, 80],
    ["rgba(250, 250, 250, 0.6)", "rgba(250, 250, 250, 0.95)"]
  );
  const headerBorder = useTransform(
    scrollY,
    [0, 80],
    ["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.06)"]
  );

  const pathname = usePathname();
  const router = useRouter();
  const { itemCount, openCart } = useCart();
  const { user, profile, signOut, isLoading } = useAuth();
  const supabase = React.useMemo(() => createClient(), []);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Close menus on route change
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    setIsUserMenuOpen(false);
  }, [pathname]);

  // Focus search input when opened
  React.useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  // Debounced search
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { data } = await supabase
          .from("products")
          .select("id, title, slug, price, og_image_url")
          .eq("status", "active")
          .ilike("title", `%${value}%`)
          .limit(5);
        setSearchResults(data || []);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <>
      <motion.header
        style={{
          height: headerHeight,
          backgroundColor: headerBg,
          borderBottomColor: headerBorder,
        }}
        className="w-full relative border-b backdrop-blur-lg"
      >
        <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-6 lg:px-16">
          <div className="flex items-center gap-8">
            <button
              className="lg:hidden p-1.5 -ml-1.5 text-[#1A1A1A] cursor-pointer hover:text-[#6B6B6B] transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open Menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="font-serif text-xl font-bold tracking-tight text-[#1A1A1A] lg:text-2xl">
                PREMIUM.
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-caption-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors duration-200"
                  style={{ fontSize: '11px', letterSpacing: '0.08em' }}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right — Actions */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <button
              className="p-2.5 text-[#1A1A1A] hover:text-[#6B6B6B] transition-colors cursor-pointer rounded-full hover:bg-[#F5F5F0]"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search"
            >
              <Search className="h-[18px] w-[18px]" />
            </button>

            {/* User Account */}
            <div className="relative">
              <button
                className="p-2.5 text-[#1A1A1A] hover:text-[#6B6B6B] transition-colors cursor-pointer rounded-full hover:bg-[#F5F5F0]"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                aria-label="Account"
              >
                <User className="h-[18px] w-[18px]" />
              </button>

              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg ring-1 ring-black/5 overflow-hidden py-1.5"
                  >
                    {user ? (
                      <>
                        <div className="px-4 py-3 border-b border-[rgba(0,0,0,0.06)]">
                          <p className="text-xs font-semibold text-[#1A1A1A] truncate">
                            {profile?.full_name || "Welcome back"}
                          </p>
                          <p className="text-[11px] text-[#6B6B6B] truncate mt-0.5">
                            {user.email}
                          </p>
                        </div>
                        <Link
                          href="/account"
                          className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-[#1A1A1A] hover:bg-[#F5F5F0] transition-colors"
                        >
                          <User className="w-3.5 h-3.5 text-[#6B6B6B]" />
                          My Account
                        </Link>
                        <Link
                          href="/account?tab=orders"
                          className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-[#1A1A1A] hover:bg-[#F5F5F0] transition-colors"
                        >
                          <ShoppingBag className="w-3.5 h-3.5 text-[#6B6B6B]" />
                          Orders
                        </Link>
                        <Link
                          href="/account?tab=wishlist"
                          className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-[#1A1A1A] hover:bg-[#F5F5F0] transition-colors"
                        >
                          <Heart className="w-3.5 h-3.5 text-[#6B6B6B]" />
                          Wishlist
                        </Link>
                        <div className="border-t border-[rgba(0,0,0,0.06)] mt-1 pt-1">
                          <button
                            onClick={() => {
                              signOut();
                              setIsUserMenuOpen(false);
                            }}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-xs font-medium text-destructive hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            Sign Out
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/account"
                          className="flex items-center justify-between px-4 py-3 text-sm font-semibold text-[#1A1A1A] hover:bg-[#F5F5F0] transition-colors"
                        >
                          Sign In / Register
                          <ChevronRight className="w-3.5 h-3.5 text-[#6B6B6B]" />
                        </Link>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cart */}
            <button
              className="relative p-2.5 text-[#1A1A1A] hover:text-[#6B6B6B] transition-colors cursor-pointer rounded-full hover:bg-[#F5F5F0]"
              onClick={openCart}
              aria-label="Cart"
            >
              <ShoppingBag className="h-[18px] w-[18px]" />
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.span
                    key={itemCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 15,
                    }}
                    className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#1A1A1A] text-[9px] font-bold text-white min-w-[18px] h-[18px]"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.header>

      {/* Spacer for fixed header */}
      <div className="h-20" />

      {/* ══════ Search Overlay ══════ */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto max-w-[1440px] px-6 lg:px-16 py-8">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-6 text-[#6B6B6B]" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search for products..."
                    className="w-full pl-10 pr-10 py-4 text-2xl font-light text-[#1A1A1A] placeholder-[#C4C4C4] bg-transparent border-b-2 border-[#1A1A1A] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-[#6B6B6B] hover:text-[#1A1A1A] cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </form>

                {/* Instant Results */}
                {searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 space-y-2"
                  >
                    <p className="text-caption text-[#6B6B6B] mb-3">Results</p>
                    {searchResults.map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-[#F5F5F0] transition-colors"
                        onClick={() => setIsSearchOpen(false)}
                      >
                        <div className="w-12 h-12 rounded-md bg-[#F5F5F0] overflow-hidden flex-shrink-0">
                          {product.og_image_url && (
                            <img
                              src={product.og_image_url}
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#1A1A1A]">
                            {product.title}
                          </p>
                          <p className="text-xs text-[#6B6B6B]">
                            ₹{Number(product.price).toLocaleString()}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </motion.div>
                )}

                {isSearching && (
                  <div className="mt-6 flex items-center gap-2 text-sm text-[#6B6B6B]">
                    <div className="w-4 h-4 border-2 border-[#6B6B6B]/30 border-t-[#6B6B6B] rounded-full animate-spin" />
                    Searching...
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════ Mobile Menu Overlay ══════ */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Full-screen menu panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              className="absolute inset-y-0 left-0 w-full max-w-sm bg-white shadow-2xl flex flex-col"
            >
              {/* Close */}
              <div className="flex items-center justify-between px-6 h-16 border-b border-[rgba(0,0,0,0.06)]">
                <span className="font-serif text-lg font-bold tracking-tight">Menu</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-[#6B6B6B] hover:text-[#1A1A1A] cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Nav Links */}
              <nav className="flex-1 px-6 py-8 space-y-1">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.05, duration: 0.3 }}
                  >
                    <Link
                      href={link.href}
                      className="flex items-center justify-between py-3.5 text-lg font-medium text-[#1A1A1A] hover:text-accent transition-colors border-b border-[rgba(0,0,0,0.04)]"
                    >
                      {link.name}
                      <ChevronRight className="w-4 h-4 text-[#C4C4C4]" />
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Bottom Actions */}
              <div className="px-6 py-6 border-t border-[rgba(0,0,0,0.06)] space-y-3">
                {user ? (
                  <>
                    <Link
                      href="/account"
                      className="flex items-center gap-3 py-2 text-sm font-medium text-[#1A1A1A]"
                    >
                      <User className="w-4 h-4 text-[#6B6B6B]" />
                      My Account
                    </Link>
                    <button
                      onClick={signOut}
                      className="flex items-center gap-3 py-2 text-sm font-medium text-destructive cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    href="/account"
                    className="block w-full py-3 text-center text-sm font-semibold text-white bg-[#1A1A1A] rounded-lg"
                  >
                    Sign In / Register
                  </Link>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
