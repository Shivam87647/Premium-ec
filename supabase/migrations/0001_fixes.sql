-- ============================================================
-- Migration: Infrastructure, RLS, Storage & Performance Fixes
-- ============================================================

-- 1. Helper function to check if the current user is an admin without infinite recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop existing problematic profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can do everything on profiles" ON public.profiles;

-- Re-create profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can do everything on profiles" ON public.profiles USING (public.is_admin());

-- 3. Update existing policies on other tables to use is_admin() helper
DROP POLICY IF EXISTS "Admins can do everything on products" ON public.products;
DROP POLICY IF EXISTS "Admins can do everything on categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can do everything on orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can delete reviews" ON public.reviews;

CREATE POLICY "Admins can do everything on products" ON public.products USING (public.is_admin());
CREATE POLICY "Admins can do everything on categories" ON public.categories USING (public.is_admin());
CREATE POLICY "Admins can do everything on orders" ON public.orders USING (public.is_admin());
CREATE POLICY "Admins can delete reviews" ON public.reviews FOR DELETE USING (public.is_admin());

-- 4. Missing RLS policies for Subscribers, Media, Coupons, SEO settings, etc.
-- Site settings
DROP POLICY IF EXISTS "Admins can update site_settings" ON public.site_settings;
CREATE POLICY "Admins can update site_settings" ON public.site_settings USING (public.is_admin());

-- Subscribers
DROP POLICY IF EXISTS "Public can insert subscribers" ON public.subscribers;
DROP POLICY IF EXISTS "Admins can do everything on subscribers" ON public.subscribers;
CREATE POLICY "Public can insert subscribers" ON public.subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can do everything on subscribers" ON public.subscribers USING (public.is_admin());

-- Media
DROP POLICY IF EXISTS "Public can view media" ON public.media;
DROP POLICY IF EXISTS "Admins can do everything on media" ON public.media;
CREATE POLICY "Public can view media" ON public.media FOR SELECT USING (true);
CREATE POLICY "Admins can do everything on media" ON public.media USING (public.is_admin());

-- Coupons
DROP POLICY IF EXISTS "Public/authenticated can view active coupons" ON public.coupons;
DROP POLICY IF EXISTS "Admins can do everything on coupons" ON public.coupons;
CREATE POLICY "Public/authenticated can view active coupons" ON public.coupons FOR SELECT USING (true);
CREATE POLICY "Admins can do everything on coupons" ON public.coupons USING (public.is_admin());

-- SEO Settings
DROP POLICY IF EXISTS "Public can view seo_settings" ON public.seo_settings;
DROP POLICY IF EXISTS "Admins can do everything on seo_settings" ON public.seo_settings;
CREATE POLICY "Public can view seo_settings" ON public.seo_settings FOR SELECT USING (true);
CREATE POLICY "Admins can do everything on seo_settings" ON public.seo_settings USING (public.is_admin());

-- Page SEO
DROP POLICY IF EXISTS "Public can view page_seo" ON public.page_seo;
DROP POLICY IF EXISTS "Admins can do everything on page_seo" ON public.page_seo;
CREATE POLICY "Public can view page_seo" ON public.page_seo FOR SELECT USING (true);
CREATE POLICY "Admins can do everything on page_seo" ON public.page_seo USING (public.is_admin());

-- Hero slides
DROP POLICY IF EXISTS "Admins can do everything on hero_slides" ON public.hero_slides;
CREATE POLICY "Admins can do everything on hero_slides" ON public.hero_slides USING (public.is_admin());

-- Product sub-tables
DROP POLICY IF EXISTS "Admins can do everything on product_images" ON public.product_images;
DROP POLICY IF EXISTS "Admins can do everything on product_options" ON public.product_options;
DROP POLICY IF EXISTS "Admins can do everything on product_option_values" ON public.product_option_values;
DROP POLICY IF EXISTS "Admins can do everything on product_variants" ON public.product_variants;

CREATE POLICY "Admins can do everything on product_images" ON public.product_images USING (public.is_admin());
CREATE POLICY "Admins can do everything on product_options" ON public.product_options USING (public.is_admin());
CREATE POLICY "Admins can do everything on product_option_values" ON public.product_option_values USING (public.is_admin());
CREATE POLICY "Admins can do everything on product_variants" ON public.product_variants USING (public.is_admin());

-- Orders & Items & Timeline policies
DROP POLICY IF EXISTS "Users/Guests can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users/Guests can insert order_items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can do everything on order_items" ON public.order_items;
DROP POLICY IF EXISTS "Users can view own order timeline" ON public.order_timeline;
DROP POLICY IF EXISTS "Admins can do everything on order_timeline" ON public.order_timeline;

CREATE POLICY "Users/Guests can insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own orders" ON public.orders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users/Guests can insert order_items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can do everything on order_items" ON public.order_items USING (public.is_admin());
CREATE POLICY "Users can view own order timeline" ON public.order_timeline FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_timeline.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Admins can do everything on order_timeline" ON public.order_timeline USING (public.is_admin());

-- 5. Inventory stock decrement triggers
CREATE OR REPLACE FUNCTION public.decrement_stock_on_order_item()
RETURNS TRIGGER AS $$
DECLARE
  v_track_inventory BOOLEAN;
  v_stock_quantity INTEGER;
BEGIN
  -- Fetch track_inventory status for the product
  SELECT track_inventory, stock_quantity 
  INTO v_track_inventory, v_stock_quantity
  FROM public.products WHERE id = NEW.product_id;

  IF v_track_inventory = true THEN
    -- If variant is specified, decrement variant stock, otherwise product stock
    IF NEW.variant_id IS NOT NULL THEN
      UPDATE public.product_variants 
      SET stock_quantity = stock_quantity - NEW.quantity
      WHERE id = NEW.variant_id;
    ELSE
      UPDATE public.products
      SET stock_quantity = stock_quantity - NEW.quantity
      WHERE id = NEW.product_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_decrement_stock ON public.order_items;
CREATE TRIGGER trigger_decrement_stock
AFTER INSERT ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION public.decrement_stock_on_order_item();

-- 6. Coupon usage count increment triggers
CREATE OR REPLACE FUNCTION public.increment_coupon_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.coupon_code IS NOT NULL AND NEW.coupon_code <> '' THEN
    UPDATE public.coupons
    SET times_used = times_used + 1
    WHERE code = NEW.coupon_code;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_increment_coupon_usage ON public.orders;
CREATE TRIGGER trigger_increment_coupon_usage
AFTER INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.increment_coupon_usage();

-- 7. Database Performance Indexes
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.reviews(product_id);

-- 8. Storage Buckets Creation (Safe execution if extensions/tables allow)
-- In standard Supabase, bucket creation can be done via SQL or REST.
-- This insert seeds the storage.buckets table directly if run as superuser.
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('brand-assets', 'brand-assets', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('media-library', 'media-library', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;
DROP POLICY IF EXISTS "Avatar Upload Own" ON storage.objects;
DROP POLICY IF EXISTS "Avatar Update Own" ON storage.objects;
DROP POLICY IF EXISTS "Avatar Delete Own" ON storage.objects;

-- Enable public read
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id IN ('product-images', 'brand-assets', 'media-library', 'avatars'));

-- Admin manage rights
CREATE POLICY "Admin Upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id IN ('product-images', 'brand-assets', 'media-library') AND public.is_admin()
);
CREATE POLICY "Admin Update" ON storage.objects FOR UPDATE TO authenticated USING (
  bucket_id IN ('product-images', 'brand-assets', 'media-library') AND public.is_admin()
);
CREATE POLICY "Admin Delete" ON storage.objects FOR DELETE TO authenticated USING (
  bucket_id IN ('product-images', 'brand-assets', 'media-library') AND public.is_admin()
);

-- Users manage own avatar objects
CREATE POLICY "Avatar Upload Own" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text
);
CREATE POLICY "Avatar Update Own" ON storage.objects FOR UPDATE TO authenticated USING (
  bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text
);
CREATE POLICY "Avatar Delete Own" ON storage.objects FOR DELETE TO authenticated USING (
  bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 9. Contact messages table for the Contact page
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Policies for public inserts and admin reads
DROP POLICY IF EXISTS "Public can insert contact_messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can do everything on contact_messages" ON public.contact_messages;

CREATE POLICY "Public can insert contact_messages" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can do everything on contact_messages" ON public.contact_messages USING (public.is_admin());

