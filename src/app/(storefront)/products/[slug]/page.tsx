import { ProductDetailClient } from "@/components/storefront/product-detail-client";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export const revalidate = 60;

const fallbackProducts: Record<string, any> = {
  "essential-t-shirt": {
    id: "prod-1",
    title: "Essential Organic Cotton T-Shirt",
    price: 35.0,
    rating: 4.8,
    reviewsCount: 124,
    description: "Our signature t-shirt, crafted from 100% GOTS-certified organic cotton.",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1200&q=80",
    ],
    colors: [{ name: "White", hex: "#FFFFFF" }, { name: "Black", hex: "#000000" }],
    sizes: ["S", "M", "L", "XL"],
    stock_quantity: 50,
  },
  "denim-jacket": {
    id: "prod-2",
    title: "Everyday Denim Jacket",
    price: 125.0,
    rating: 4.5,
    reviewsCount: 89,
    description: "A classic denim jacket that never goes out of style.",
    images: [
      "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=1200&q=80",
    ],
    colors: [{ name: "Blue", hex: "#1E3A8A" }],
    sizes: ["S", "M", "L"],
    stock_quantity: 25,
  },
  "leather-sneakers": {
    id: "prod-3",
    title: "Classic Leather Sneakers",
    price: 150.0,
    rating: 4.9,
    reviewsCount: 210,
    description: "Minimalist leather sneakers for everyday wear.",
    images: [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80",
    ],
    colors: [{ name: "White", hex: "#FFFFFF" }],
    sizes: ["8", "9", "10", "11"],
    stock_quantity: 15,
  },
  "minimalist-watch": {
    id: "prod-4",
    title: "Minimalist Watch",
    price: 195.0,
    rating: 4.7,
    reviewsCount: 56,
    description: "Elegant and timeless minimalist watch.",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
    ],
    colors: [{ name: "Silver", hex: "#C0C0C0" }],
    sizes: ["One Size"],
    stock_quantity: 8,
  }
};

const fallbackRelated = [
  {
    id: "prod-2",
    title: "Everyday Denim Jacket",
    slug: "denim-jacket",
    price: 125.0,
    primaryImage: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "prod-3",
    title: "Classic Leather Sneakers",
    slug: "leather-sneakers",
    price: 150.0,
    primaryImage: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "prod-4",
    title: "Minimalist Watch",
    slug: "minimalist-watch",
    price: 195.0,
    primaryImage: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
  },
];

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  
  let productData = fallbackProducts[slug] || { 
    ...fallbackProducts["essential-t-shirt"], 
    title: `Premium Product (${slug})` 
  };
  
  let relatedProducts = fallbackRelated;
  let fetchedReviews: any[] = [];

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http')) {
      const supabase = await createClient();

      // 1. Fetch Product
      const { data: product } = await supabase
        .from('products')
        .select(`
          *,
          product_images (image_url, sort_order)
        `)
        .eq('slug', slug)
        .eq('status', 'active')
        .single();

      if (product) {
        // 2. Fetch Options & Option Values
        const { data: optionsData } = await supabase
          .from('product_options')
          .select(`
            *,
            product_option_values(*)
          `)
          .eq('product_id', product.id)
          .order('sort_order', { ascending: true });

        // Map colors & sizes
        const colorOpt = optionsData?.find(o => o.name.toLowerCase() === "color");
        const sizeOpt = optionsData?.find(o => o.name.toLowerCase() === "size");

        const colors = colorOpt?.product_option_values?.map((v: any) => ({
          name: v.value,
          hex: v.value.toLowerCase() === "white" ? "#FFFFFF" : 
               v.value.toLowerCase() === "black" ? "#000000" :
               v.value.toLowerCase() === "blue" ? "#2563EB" :
               v.value.toLowerCase() === "green" ? "#16A34A" :
               v.value.toLowerCase() === "red" ? "#DC2626" : "#CCCCCC"
        })) || [{ name: "Default", hex: "#000000" }];

        const sizes = sizeOpt?.product_option_values?.map((v: any) => v.value) || ["One Size"];

        // 3. Fetch Reviews & Profiles (manual client-side join)
        const { data: reviewsData } = await supabase
          .from('reviews')
          .select('id, rating, title, body, is_verified, created_at, user_id')
          .eq('product_id', product.id)
          .order('created_at', { ascending: false });

        if (reviewsData && reviewsData.length > 0) {
          const userIds = reviewsData.map((r: any) => r.user_id).filter(Boolean);
          let profilesData: any[] = [];
          if (userIds.length > 0) {
            const { data: profs } = await supabase
              .from('profiles')
              .select('id, full_name, avatar_url')
              .in('id', userIds);
            profilesData = profs || [];
          }
          fetchedReviews = reviewsData.map((r: any) => {
            const prof = profilesData.find((p: any) => p.id === r.user_id);
            return {
              id: r.id,
              rating: r.rating,
              title: r.title,
              body: r.body,
              is_verified: r.is_verified,
              created_at: r.created_at,
              user_id: r.user_id,
              full_name: prof?.full_name || "Verified Customer",
              avatar_url: prof?.avatar_url || null
            };
          });
        } else {
          fetchedReviews = [];
        }

        const avgRating = fetchedReviews.length > 0
          ? fetchedReviews.reduce((sum, r) => sum + r.rating, 0) / fetchedReviews.length
          : 5.0;

        const images = product.product_images && product.product_images.length > 0
          ? product.product_images.sort((a: any, b: any) => a.sort_order - b.sort_order).map((img: any) => img.image_url) 
          : [product.og_image_url || fallbackProducts["essential-t-shirt"].images[0]];
        
        productData = {
          id: product.id,
          title: product.title,
          price: Number(product.price),
          rating: Number(avgRating.toFixed(1)),
          reviewsCount: fetchedReviews.length,
          description: product.description || "Premium product.",
          images: images,
          colors: colors,
          sizes: sizes,
          stock_quantity: product.stock_quantity || 0,
          track_inventory: product.track_inventory,
        };

        // 4. Fetch Related Products
        const { data: related } = await supabase
          .from('products')
          .select('*')
          .eq('category_id', product.category_id)
          .neq('id', product.id)
          .limit(3);

        if (related && related.length > 0) {
          relatedProducts = related.map(p => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            price: Number(p.price),
            primaryImage: p.og_image_url || fallbackRelated[0].primaryImage,
          }));
        }
      }
    }
  } catch (err) {
    console.error("Failed to fetch PDP data:", err);
  }

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": productData.title,
    "image": productData.images,
    "description": productData.description.replace(/<[^>]*>/g, ""),
    "sku": productData.sku || `SKU-${productData.id}`,
    "offers": {
      "@type": "Offer",
      "url": `https://premium-storefront.vercel.app/products/${slug}`,
      "priceCurrency": "INR",
      "price": productData.price,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": productData.stock_quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    "aggregateRating": productData.reviewsCount > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": productData.rating,
      "reviewCount": productData.reviewsCount
    } : undefined
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ProductDetailClient 
        productData={productData} 
        relatedProducts={relatedProducts}
        reviews={fetchedReviews}
      />
    </>
  );
}
