import { AdminProductsClient } from "@/components/admin/products-client";
import { createClient } from "@/lib/supabase/server";

export default async function AdminProductsPage() {
  let products: any[] = [];

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http')) {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        products = data;
      }
    }
  } catch (error) {
    console.error("Error fetching admin products:", error);
  }

  // If Supabase isn't connected or empty, we could provide fallback data, 
  // but for the admin panel, it's better to show the true empty state.
  
  return <AdminProductsClient initialProducts={products} />;
}
