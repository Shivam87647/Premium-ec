"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Defense-in-depth: verify user is authenticated AND has admin role
async function assertAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Unauthorized: admin role required");
  return user;
}

export async function saveProduct(formData: FormData) {
  try {
    const supabase = await createClient();
    
    // Verify authenticated admin user
    await assertAdmin(supabase);


    const id = formData.get("id") as string;
    const title = formData.get("title") as string;
    const price = parseFloat(formData.get("price") as string);
    const salePrice = formData.get("sale_price") ? parseFloat(formData.get("sale_price") as string) : null;
    const sku = formData.get("sku") as string || `SKU-${Date.now()}`;
    const slug = formData.get("slug") as string || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const description = formData.get("description") as string;
    const status = formData.get("status") as string || 'active';
    const categoryId = formData.get("category_id") as string || null;
    const stockQuantity = formData.get("stock_quantity") ? parseInt(formData.get("stock_quantity") as string) : 0;
    const trackInventory = formData.get("track_inventory") === "true";
    const tagsString = formData.get("tags") as string || "";
    const tags = tagsString ? tagsString.split(",").map(t => t.trim().toLowerCase()).filter(Boolean) : [];
    const metaTitle = formData.get("meta_title") as string || null;
    const metaDescription = formData.get("meta_description") as string || null;

    const imageUrls = formData.getAll("image_urls") as string[];
    const primaryImage = imageUrls[0] || null;

    const payload = {
      title,
      slug,
      sku,
      price,
      sale_price: salePrice,
      description,
      status,
      og_image_url: primaryImage,
      category_id: categoryId,
      stock_quantity: stockQuantity,
      track_inventory: trackInventory,
      tags: tags.length > 0 ? tags : null,
      meta_title: metaTitle,
      meta_description: metaDescription,
    };

    let productData;

    if (id) {
      // Update
      const { data, error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      productData = data;
    } else {
      // Create
      const { data, error } = await supabase
        .from('products')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      productData = data;
    }

    if (productData) {
      // Delete existing product images
      await supabase
        .from('product_images')
        .delete()
        .eq('product_id', productData.id);

      // Insert new product images
      if (imageUrls.length > 0) {
        const imageInserts = imageUrls.map((url, index) => ({
          product_id: productData.id,
          image_url: url,
          sort_order: index
        }));
        await supabase.from('product_images').insert(imageInserts);
      }
    }

    revalidatePath("/admin/products");
    revalidatePath("/products");
    return { success: true, product: productData };

  } catch (err: any) {
    console.error("Supabase error:", err);
    return { error: err.message || "Failed to save product" };
  }
}

export async function deleteProduct(productId: string) {
  try {
    const supabase = await createClient();
    
    // Verify authenticated admin user
    await assertAdmin(supabase);

    const { error } = await supabase.from('products').delete().eq('id', productId);
    
    if (error) {
      return { error: error.message };
    }

    revalidatePath("/admin/products");
    revalidatePath("/products");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to delete product" };
  }
}
