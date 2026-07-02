"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ProductCard } from "@/components/storefront/product-card";
import { Loader2, Search } from "lucide-react";
import { motion } from "framer-motion";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  
  const [products, setProducts] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const supabase = React.useMemo(() => createClient(), []);

  React.useEffect(() => {
    async function performSearch() {
      setIsLoading(true);
      setError("");

      try {
        if (!query.trim()) {
          setProducts([]);
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("products")
          .select(`
            *,
            product_images(image_url, sort_order)
          `)
          .eq("status", "active")
          .or(`title.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`);

        if (error) throw error;

        const mappedProducts = (data || []).map((prod: any) => {
          const sortedImgs = prod.product_images?.sort((a: any, b: any) => a.sort_order - b.sort_order) || [];
          return {
            id: prod.id,
            title: prod.title,
            slug: prod.slug,
            price: Number(prod.price),
            salePrice: prod.sale_price ? Number(prod.sale_price) : undefined,
            primaryImage: sortedImgs[0]?.image_url || prod.og_image_url || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80",
            secondaryImage: sortedImgs[1]?.image_url || undefined,
            badge: prod.sale_price ? "Sale" : undefined,
          };
        });

        setProducts(mappedProducts);
      } catch (err: any) {
        console.error("Search API Error:", err);
        setError(err.message || "Failed to execute search");
      } finally {
        setIsLoading(false);
      }
    }

    performSearch();
  }, [query, supabase]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-accent mb-4" />
        <p className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">Searching catalog...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-24">
        <p className="text-red-500 font-medium mb-2">An error occurred</p>
        <p className="text-secondary-foreground text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-12">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
          {products.length} {products.length === 1 ? "result" : "results"} found for &ldquo;<span className="text-[#1A1A1A] font-bold">{query}</span>&rdquo;
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-[rgba(0,0,0,0.06)] p-8 shadow-sm">
          <Search className="w-10 h-10 mx-auto text-[#E5E7EB] mb-4" />
          <h3 className="font-serif text-lg font-semibold text-[#1A1A1A] mb-2">No products found</h3>
          <p className="text-[#6B6B6B] text-sm max-w-sm mx-auto leading-relaxed">
            We couldn't find any matches for your query. Try checking your spelling or using more general search terms.
          </p>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </motion.div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="bg-[#FAFAFA] min-h-screen text-[#1A1A1A] py-16 md:py-24">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-16">
        <div className="border-b border-[rgba(0,0,0,0.06)] pb-8 mb-12">
          <p className="text-caption text-[#9CA3AF] mb-1">Catalog lookup</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-[#1A1A1A]">
            Search Results
          </h1>
        </div>

        <React.Suspense 
          fallback={
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-accent mb-4" />
              <p className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">Loading search results...</p>
            </div>
          }
        >
          <SearchResults />
        </React.Suspense>
      </div>
    </div>
  );
}
