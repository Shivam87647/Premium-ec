"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, ChevronDown, X, Loader2, Tag, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/storefront/product-card";
import { Modal } from "@/components/ui/modal";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/components/storefront/cart-provider";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";

// Fallback static data if Supabase is empty
const dummyProducts = Array.from({ length: 12 }).map((_, i) => ({
  id: `prod-${i}`,
  title: `Premium Product ${i + 1}`,
  slug: `premium-product-${i + 1}`,
  price: 1500 + i * 500,
  primaryImage: `https://images.unsplash.com/photo-${1500000000000 + i}?auto=format&fit=crop&w=800&q=80`,
  secondaryImage: `https://images.unsplash.com/photo-${1500000000001 + i}?auto=format&fit=crop&w=800&q=80`,
}));

const sortOptions = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Newest", value: "newest" },
];

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem } = useCart();
  const { addToast } = useToast();

  const [isFilterOpen, setIsFilterOpen] = React.useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = React.useState(false);
  const [isSortOpen, setIsSortOpen] = React.useState(false);
  const [quickViewId, setQuickViewId] = React.useState<string | null>(null);

  // Filter States
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([]);
  const [priceRange, setPriceRange] = React.useState<number>(50000); // Max limit
  const [selectedColor, setSelectedColor] = React.useState<string | null>(null);
  const [selectedSize, setSelectedSize] = React.useState<string | null>(null);
  const [activeSort, setActiveSort] = React.useState("featured");

  // Pagination & Loading States
  const [products, setProducts] = React.useState<any[]>([]);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  
  const itemsPerPage = 8;
  const supabase = React.useMemo(() => createClient(), []);

  // Sync URL Params on mount
  React.useEffect(() => {
    const categoryParam = searchParams.get("category");
    const sortParam = searchParams.get("sort");
    const priceParam = searchParams.get("price_max");
    const colorParam = searchParams.get("color");
    const sizeParam = searchParams.get("size");

    if (categoryParam) setSelectedCategories(categoryParam.split(","));
    if (sortParam) setActiveSort(sortParam);
    if (priceParam) setPriceRange(Number(priceParam));
    if (colorParam) setSelectedColor(colorParam);
    if (sizeParam) setSelectedSize(sizeParam);
  }, [searchParams]);

  // Update URL Query Params on Filter Change
  const updateQueryParams = React.useCallback((
    categories: string[],
    sort: string,
    maxPrice: number,
    color: string | null,
    size: string | null
  ) => {
    const params = new URLSearchParams();
    if (categories.length > 0) params.set("category", categories.join(","));
    if (sort !== "featured") params.set("sort", sort);
    if (maxPrice < 50000) params.set("price_max", maxPrice.toString());
    if (color) params.set("color", color);
    if (size) params.set("size", size);

    router.replace(`/products?${params.toString()}`, { scroll: false });
  }, [router]);

  const renderFilterControls = () => (
    <>
      {/* Category Checkboxes */}
      <div className="space-y-4">
        <h3 className="font-serif text-base font-bold text-[#1A1A1A]">Category</h3>
        <div className="space-y-3">
          {["Men", "Women", "Accessories"].map((cat) => (
            <label key={cat} className="flex items-center space-x-3 cursor-pointer select-none group">
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat.toLowerCase())}
                onChange={() => handleCategoryToggle(cat.toLowerCase())}
                className="rounded border-[rgba(0,0,0,0.12)] text-[#1A1A1A] focus:ring-[#1A1A1A] w-4 h-4 cursor-pointer"
              />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B] group-hover:text-[#1A1A1A] transition-colors">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price range slider */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-serif text-base font-bold text-[#1A1A1A]">Max Price</h3>
          <span className="text-[10px] font-bold bg-[#F5F5F0] border border-[rgba(0,0,0,0.04)] px-2 py-0.5 rounded text-accent">
            {formatCurrency(priceRange)}
          </span>
        </div>
        <input
          type="range"
          min="500"
          max="50000"
          step="500"
          value={priceRange}
          onChange={(e) => {
            setPriceRange(Number(e.target.value));
            updateQueryParams(selectedCategories, activeSort, Number(e.target.value), selectedColor, selectedSize);
          }}
          className="w-full h-1 bg-[#E5E7EB] rounded-lg appearance-none cursor-pointer accent-accent"
        />
      </div>

      {/* Color swatches */}
      <div className="space-y-4">
        <h3 className="font-serif text-base font-bold text-[#1A1A1A]">Color</h3>
        <div className="flex flex-wrap gap-2.5">
          {[
            { name: "black", hex: "#000000" },
            { name: "white", hex: "#FFFFFF" },
            { name: "blue", hex: "#2563EB" },
            { name: "green", hex: "#16A34A" },
            { name: "red", hex: "#DC2626" },
          ].map((color) => (
            <button
              key={color.name}
              onClick={() => {
                const nextColor = selectedColor === color.name ? null : color.name;
                setSelectedColor(nextColor);
                updateQueryParams(selectedCategories, activeSort, priceRange, nextColor, selectedSize);
              }}
              className={`h-7 w-7 rounded-full border transition-all flex items-center justify-center cursor-pointer ${
                selectedColor === color.name 
                  ? "border-[#1A1A1A] ring-2 ring-offset-2 ring-accent scale-105" 
                  : "border-black/10 hover:border-black/30"
              }`}
              style={{ backgroundColor: color.hex, border: color.name === "white" ? "1px solid rgba(0,0,0,0.12)" : "none" }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Size swatches */}
      <div className="space-y-4">
        <h3 className="font-serif text-base font-bold text-[#1A1A1A]">Size</h3>
        <div className="flex flex-wrap gap-2">
          {["XS", "S", "M", "L", "XL"].map((size) => {
            const isSelected = selectedSize === size.toLowerCase();
            return (
              <button
                key={size}
                onClick={() => {
                  const nextSize = selectedSize === size.toLowerCase() ? null : size.toLowerCase();
                  setSelectedSize(nextSize);
                  updateQueryParams(selectedCategories, activeSort, priceRange, selectedColor, nextSize);
                }}
                className={`h-9 w-9 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-sm"
                    : "bg-white text-[#6B6B6B] border-[rgba(0,0,0,0.08)] hover:border-[#1A1A1A] hover:text-[#1A1A1A]"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Clear filters trigger */}
      <button
        onClick={handleClearFilters}
        className="w-full py-2.5 bg-[#FAFAFA] border border-[rgba(0,0,0,0.06)] text-[10px] font-bold uppercase tracking-widest text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#F5F5F0] rounded-lg cursor-pointer transition-all mt-4"
      >
        Clear All Filters
      </button>
    </>
  );

  // Fetch Products Handler
  const fetchProducts = React.useCallback(async (pageNum: number, isAppend: boolean) => {
    if (pageNum === 1) setIsLoading(true);
    else setLoadingMore(true);

    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http')) {
        setProducts(dummyProducts);
        setIsLoading(false);
        setLoadingMore(false);
        return;
      }

      let query = supabase.from("products").select("*, product_images(image_url, sort_order)").eq("status", "active");

      // Apply Filters
      if (selectedCategories.length > 0) {
        const { data: catRows } = await supabase
          .from("categories")
          .select("id")
          .in("slug", selectedCategories);

        if (catRows && catRows.length > 0) {
          const catIds = catRows.map(r => r.id);
          const { data: subCatRows } = await supabase
            .from("categories")
            .select("id")
            .in("parent_id", catIds);

          const allCatIds = [...catIds];
          if (subCatRows && subCatRows.length > 0) {
            allCatIds.push(...subCatRows.map(r => r.id));
          }

          query = query.in("category_id", allCatIds);
        } else {
          query = query.in("category_id", ["00000000-0000-0000-0000-000000000000"]);
        }
      }

      query = query.lte("price", priceRange);

      if (selectedColor) {
        query = query.contains("tags", [selectedColor.toLowerCase()]);
      }

      if (selectedSize) {
        query = query.contains("tags", [selectedSize.toLowerCase()]);
      }

      // Apply Sorting
      if (activeSort === "price_asc") query = query.order("price", { ascending: true });
      else if (activeSort === "price_desc") query = query.order("price", { ascending: false });
      else if (activeSort === "newest") query = query.order("created_at", { ascending: false });
      else query = query.order("created_at", { ascending: false }); // default

      // Paginate
      const from = (pageNum - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      const { data, error } = await query.range(from, to);

      if (error) throw error;

      const mapped = (data || []).map((prod: any) => {
        const sorted = prod.product_images?.sort((a: any, b: any) => a.sort_order - b.sort_order) || [];
        return {
          id: prod.id,
          title: prod.title,
          slug: prod.slug,
          price: Number(prod.price),
          salePrice: prod.sale_price ? Number(prod.sale_price) : undefined,
          primaryImage: sorted[0]?.image_url || prod.og_image_url || dummyProducts[0].primaryImage,
          secondaryImage: sorted[1]?.image_url || undefined,
          badge: prod.sale_price ? "Sale" : undefined,
        };
      });

      if (isAppend) {
        setProducts((prev) => [...prev, ...mapped]);
      } else {
        setProducts(mapped);
      }

      // Set has more flag
      setHasMore(mapped.length === itemsPerPage);

    } catch (err) {
      console.error("Supabase fetch error:", err);
      if (!isAppend) setProducts(dummyProducts);
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  }, [supabase, selectedCategories, priceRange, selectedColor, selectedSize, activeSort]);

  // Trigger Fetch on State Change
  React.useEffect(() => {
    setPage(1);
    fetchProducts(1, false);
  }, [selectedCategories, priceRange, selectedColor, selectedSize, activeSort, fetchProducts]);

  // Handle Loading More Pages
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage, true);
  };

  const handleCategoryToggle = (category: string) => {
    const nextCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];

    setSelectedCategories(nextCategories);
    updateQueryParams(nextCategories, activeSort, priceRange, selectedColor, selectedSize);
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setPriceRange(50000);
    setSelectedColor(null);
    setSelectedSize(null);
    updateQueryParams([], activeSort, 50000, null, null);
  };

  const handleQuickAddClick = (product: any) => {
    addItem({
      id: product.id + "-default",
      title: product.title,
      price: product.price,
      quantity: 1,
      image: product.primaryImage,
      variant: "Default",
    });
    addToast({
      title: "Added to Cart",
      description: `${product.title} has been added to your shopping cart.`,
      type: "success",
    });
  };

  const selectedProduct = products.find(p => p.id === quickViewId);

  return (
    <div className="mx-auto max-w-[1440px] px-6 lg:px-16 py-12">
      {/* Header */}
      <div className="mb-16 text-center space-y-3">
        <p className="text-caption text-[#9CA3AF]">Collections</p>
        <h1 className="text-section text-4xl md:text-5xl text-[#1A1A1A]">Catalog</h1>
        <p className="text-[#6B6B6B] text-sm max-w-xl mx-auto leading-relaxed">
          Crafted essentials built for comfort, minimalism, and lifelong endurance.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[rgba(0,0,0,0.06)] pb-6 mb-8 gap-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            className="flex items-center space-x-2 cursor-pointer h-10 px-4 rounded-lg text-xs tracking-wider font-semibold border-[rgba(0,0,0,0.08)]"
            onClick={() => {
              if (typeof window !== "undefined" && window.innerWidth < 768) {
                setIsMobileFilterOpen(true);
              } else {
                setIsFilterOpen(!isFilterOpen);
              }
            }}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>FILTERS</span>
          </Button>
          <span className="text-xs text-[#9CA3AF] font-semibold tracking-wide">
            {products.length} {products.length === 1 ? "Product" : "Products"}
          </span>
        </div>

        {/* Sort Select */}
        <div className="relative">
          <Button
            variant="ghost"
            className="flex items-center space-x-1 text-[#1A1A1A] font-semibold text-xs tracking-wider cursor-pointer"
            onClick={() => setIsSortOpen(!isSortOpen)}
          >
            <span>SORT BY: {sortOptions.find(o => o.value === activeSort)?.label.toUpperCase()}</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
          <AnimatePresence>
            {isSortOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-[rgba(0,0,0,0.06)] bg-white shadow-lg z-30 overflow-hidden py-1.5"
              >
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`block w-full px-4 py-2.5 text-left text-xs uppercase tracking-wider font-semibold cursor-pointer ${
                      activeSort === option.value 
                        ? "bg-[#F5F5F0] text-accent" 
                        : "text-[#6B6B6B] hover:bg-[#FAFAFA] hover:text-[#1A1A1A]"
                    }`}
                    onClick={() => {
                      setActiveSort(option.value);
                      updateQueryParams(selectedCategories, option.value, priceRange, selectedColor, selectedSize);
                      setIsSortOpen(false);
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-10 items-start">
        {/* Filters Sidebar */}
        <AnimatePresence mode="wait">
          {isFilterOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0, marginRight: 0 }}
              animate={{ width: 260, opacity: 1, marginRight: 40 }}
              exit={{ width: 0, opacity: 0, marginRight: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="hidden md:flex flex-col w-[260px] flex-shrink-0 bg-white p-6 rounded-2xl border border-[rgba(0,0,0,0.06)] shadow-sm space-y-8 overflow-hidden"
            >
              {renderFilterControls()}
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Product Grid Panel */}
        <div className="flex-1 w-full">
          {/* Active Filter Chips */}
          {(selectedCategories.length > 0 || priceRange < 50000 || selectedColor || selectedSize) && (
            <div className="flex flex-wrap gap-2.5 mb-6 items-center">
              <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mr-1">Active:</span>
              <AnimatePresence>
                {selectedCategories.map((cat) => (
                  <motion.span
                    key={cat}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[rgba(0,0,0,0.06)] rounded-full text-[10px] font-semibold text-[#1A1A1A] uppercase tracking-wider shadow-sm"
                  >
                    <span>{cat}</span>
                    <button onClick={() => handleCategoryToggle(cat)} className="cursor-pointer text-[#9CA3AF] hover:text-[#1A1A1A]">
                      <X className="w-3 h-3" />
                    </button>
                  </motion.span>
                ))}
                {priceRange < 50000 && (
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[rgba(0,0,0,0.06)] rounded-full text-[10px] font-semibold text-[#1A1A1A] uppercase tracking-wider shadow-sm"
                  >
                    <span>&lt; {formatCurrency(priceRange)}</span>
                    <button
                      onClick={() => {
                        setPriceRange(50000);
                        updateQueryParams(selectedCategories, activeSort, 50000, selectedColor, selectedSize);
                      }}
                      className="cursor-pointer text-[#9CA3AF] hover:text-[#1A1A1A]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.span>
                )}
                {selectedColor && (
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[rgba(0,0,0,0.06)] rounded-full text-[10px] font-semibold text-[#1A1A1A] uppercase tracking-wider shadow-sm"
                  >
                    <span>Color: {selectedColor}</span>
                    <button
                      onClick={() => {
                        setSelectedColor(null);
                        updateQueryParams(selectedCategories, activeSort, priceRange, null, selectedSize);
                      }}
                      className="cursor-pointer text-[#9CA3AF] hover:text-[#1A1A1A]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.span>
                )}
                {selectedSize && (
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[rgba(0,0,0,0.06)] rounded-full text-[10px] font-semibold text-[#1A1A1A] uppercase tracking-wider shadow-sm"
                  >
                    <span>Size: {selectedSize}</span>
                    <button
                      onClick={() => {
                        setSelectedSize(null);
                        updateQueryParams(selectedCategories, activeSort, priceRange, selectedColor, null);
                      }}
                      className="cursor-pointer text-[#9CA3AF] hover:text-[#1A1A1A]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="h-8 w-8 animate-spin text-accent mb-4" />
              <p className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">Loading catalog...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-2xl border border-[rgba(0,0,0,0.06)] p-8 shadow-sm">
              <Tag className="w-10 h-10 mx-auto text-[#C4C4C4] mb-4" />
              <h3 className="font-serif text-lg font-semibold text-[#1A1A1A] mb-2">No Products Found</h3>
              <p className="text-[#6B6B6B] text-sm max-w-sm mx-auto mb-6">
                No active products match the selected criteria. Try resetting filters.
              </p>
              <Button onClick={handleClearFilters} variant="outline" className="text-xs uppercase tracking-wider h-11 px-6">
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="space-y-12">
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    {...product}
                    onQuickAdd={(id) => setQuickViewId(id)}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="flex justify-center pt-8">
                  <Button
                    variant="outline"
                    className="px-10 h-12 border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white cursor-pointer font-bold text-xs uppercase tracking-widest transition-all rounded-lg"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        LOADING...
                      </span>
                    ) : (
                      "LOAD MORE PRODUCTS"
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Modal */}
      <Modal
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        title="Filters"
        size="sm"
      >
        <div className="space-y-8 py-4">
          {renderFilterControls()}
        </div>
      </Modal>

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
                  <p className="text-caption text-[#9CA3AF] mb-1">Product Details</p>
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
                <Button
                  className="w-full h-12 text-xs font-bold uppercase tracking-wider shimmer-btn"
                  onClick={() => {
                    handleQuickAddClick(selectedProduct);
                    setQuickViewId(null);
                  }}
                >
                  <ShoppingCart className="w-3.5 h-3.5 mr-2" />
                  Add to Cart
                </Button>
                <Link href={`/products/${selectedProduct.slug}`} className="block">
                  <Button variant="outline" className="w-full h-12 text-xs font-bold uppercase tracking-wider border-[rgba(0,0,0,0.08)] hover:bg-[#F5F5F0] transition-colors">
                    View Full Details
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <React.Suspense
        fallback={
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-accent mb-4" />
            <p className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">Loading catalog...</p>
          </div>
        }
      >
        <ProductsContent />
      </React.Suspense>
    </div>
  );
}
