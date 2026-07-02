import { HomePageClient } from "@/components/storefront/homepage-client";
import { createClient } from "@/lib/supabase/server";

// Fallback static data if Supabase is empty or keys are missing/invalid
const dummyProducts = [
  {
    id: "1",
    title: "Essential Organic Cotton T-Shirt",
    slug: "essential-t-shirt",
    price: 35.0,
    primaryImage: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80",
    badge: "NEW",
  },
  {
    id: "2",
    title: "Everyday Denim Jacket",
    slug: "denim-jacket",
    price: 125.0,
    salePrice: 95.0,
    primaryImage: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "3",
    title: "Classic Leather Sneakers",
    slug: "leather-sneakers",
    price: 150.0,
    primaryImage: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "4",
    title: "Minimalist Watch",
    slug: "minimalist-watch",
    price: 195.0,
    primaryImage: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
  },
];

const dummyCategories = [
  { id: "men", name: "Men", image_url: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=800&q=80" },
  { id: "women", name: "Women", image_url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80" },
  { id: "accessories", name: "Accessories", image_url: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&w=800&q=80" },
];

const dummySlides = [
  {
    id: "slide-1",
    image_url: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=2000&q=80",
    heading: "Elevate Your Everyday",
    subheading: "Discover our new collection of premium essentials designed for the modern lifestyle.",
    cta_text: "SHOP NEW ARRIVALS",
    cta_link: "/products?sort=newest",
  },
  {
    id: "slide-2",
    image_url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=2000&q=80",
    heading: "The Denim Collection",
    subheading: "Timeless outer layers constructed from durable organic cotton denim.",
    cta_text: "EXPLORE DENIM",
    cta_link: "/products?category=men",
  },
  {
    id: "slide-3",
    image_url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=2000&q=80",
    heading: "Modern Minimalism",
    subheading: "Clean silhouettes and neutral tones that define a premium aesthetic.",
    cta_text: "VIEW ALL PRODUCTS",
    cta_link: "/products",
  }
];

export const revalidate = 60; // ISR - revalidate every 60 seconds

export default async function HomePage() {
  let newArrivals: any[] = dummyProducts;
  let bestSellers: any[] = dummyProducts;
  let featuredCategories: any[] = dummyCategories;
  let heroSlides: any[] = dummySlides;

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http')) {
      const supabase = await createClient();
      
      // 1. Fetch newest products (New Arrivals)
      const { data: productsData } = await supabase
        .from('products')
        .select('*, product_images(image_url, sort_order)')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(4);

      if (productsData && productsData.length > 0) {
        newArrivals = productsData.map(p => {
          const sortedImgs = p.product_images?.sort((a: any, b: any) => a.sort_order - b.sort_order) || [];
          return {
            id: p.id,
            title: p.title,
            slug: p.slug,
            price: Number(p.price),
            salePrice: p.sale_price ? Number(p.sale_price) : undefined,
            primaryImage: sortedImgs[0]?.image_url || p.og_image_url || dummyProducts[0].primaryImage,
            secondaryImage: sortedImgs[1]?.image_url || undefined,
            badge: 'NEW',
          };
        });
      }

      // 2. Fetch featured categories (root categories)
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .is('parent_id', null)
        .order('sort_order', { ascending: true })
        .limit(3);

      if (categoriesData && categoriesData.length > 0) {
        featuredCategories = categoriesData;
      }

      // 3. Fetch hero slides
      const { data: slidesData } = await supabase
        .from('hero_slides')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (slidesData && slidesData.length > 0) {
        heroSlides = slidesData;
      }

      // 4. Fetch Best Sellers (products sorted by stock count or simple order join fallback)
      const { data: bestSellersData } = await supabase
        .from('products')
        .select('*, product_images(image_url, sort_order)')
        .eq('status', 'active')
        .order('price', { ascending: false }) // Fallback order sort
        .limit(4);

      if (bestSellersData && bestSellersData.length > 0) {
        bestSellers = bestSellersData.map(p => {
          const sortedImgs = p.product_images?.sort((a: any, b: any) => a.sort_order - b.sort_order) || [];
          return {
            id: p.id,
            title: p.title,
            slug: p.slug,
            price: Number(p.price),
            salePrice: p.sale_price ? Number(p.sale_price) : undefined,
            primaryImage: sortedImgs[0]?.image_url || p.og_image_url || dummyProducts[1].primaryImage,
            secondaryImage: sortedImgs[1]?.image_url || undefined,
          };
        });
      }
    }
  } catch (error) {
    console.error("Supabase fetch error on homepage:", error);
  }

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "PREMIUM.",
    "url": "https://premium-storefront.vercel.app",
    "logo": "https://premium-storefront.vercel.app/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "email": "support@premium.com"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <HomePageClient 
        newArrivals={newArrivals} 
        bestSellers={bestSellers}
        featuredCategories={featuredCategories} 
        heroSlides={heroSlides}
      />
    </>
  );
}
