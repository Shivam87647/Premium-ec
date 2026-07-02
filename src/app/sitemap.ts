import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://premium-storefront.vercel.app";

  // Static routes
  const staticRoutes = [
    "",
    "/products",
    "/about",
    "/contact",
    "/faq",
    "/shipping",
    "/returns",
    "/privacy",
    "/terms",
    "/cart",
    "/account",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  let dynamicRoutes: MetadataRoute.Sitemap = [];

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith("http")) {
      const supabase = await createClient();

      // Fetch categories
      const { data: categories } = await supabase
        .from("categories")
        .select("slug");

      if (categories) {
        categories.forEach((cat) => {
          dynamicRoutes.push({
            url: `${baseUrl}/products?category=${cat.slug}`,
            lastModified: new Date(),
            changeFrequency: "weekly" as const,
            priority: 0.7,
          });
        });
      }

      // Fetch products
      const { data: products } = await supabase
        .from("products")
        .select("slug, updated_at")
        .eq("status", "active");

      if (products) {
        products.forEach((prod) => {
          dynamicRoutes.push({
            url: `${baseUrl}/products/${prod.slug}`,
            lastModified: new Date(prod.updated_at || Date.now()),
            changeFrequency: "daily" as const,
            priority: 0.9,
          });
        });
      }
    }
  } catch (err) {
    console.error("Failed to compile sitemap directories:", err);
  }

  return [...staticRoutes, ...dynamicRoutes];
}
