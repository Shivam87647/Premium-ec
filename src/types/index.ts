// ============================================================
// Core TypeScript interfaces for the nanweb e-commerce platform
// ============================================================

// --- User & Profile ---

export type UserRole = "customer" | "admin";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

// --- Product ---

export type ProductStatus = "draft" | "active";

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  price: number;
  sale_price: number | null;
  sale_start: string | null;
  sale_end: string | null;
  sku: string | null;
  stock_quantity: number;
  track_inventory: boolean;
  allow_backorders: boolean;
  status: ProductStatus;
  meta_title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  // Joined relations (optional)
  category?: Category;
  images?: ProductImage[];
  options?: ProductOption[];
  variants?: ProductVariant[];
  reviews?: Review[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
  alt_text: string | null;
}

export interface ProductOption {
  id: string;
  product_id: string;
  name: string;
  sort_order: number;
  values?: ProductOptionValue[];
}

export interface ProductOptionValue {
  id: string;
  option_id: string;
  value: string;
  sort_order: number;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string | null;
  price: number | null;
  stock_quantity: number;
  option_values: { option_name: string; value: string }[] | null;
  created_at: string;
}

// --- Category ---

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  sort_order: number;
  created_at: string;
}

// --- Order ---

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type FulfillmentStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface AddressData {
  full_name: string;
  phone?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  zip?: string;
  country: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  email: string;
  shipping_address: AddressData;
  billing_address: AddressData;
  shipping_method: string | null;
  shipping_cost: number;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
  coupon_code: string | null;
  payment_status: PaymentStatus;
  fulfillment_status: FulfillmentStatus;
  razorpay_payment_id: string | null;
  tracking_number: string | null;
  tracking_carrier: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  items?: OrderItem[];
  timeline?: OrderTimelineEntry[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  title: string;
  variant_info: Record<string, string> | null;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface OrderTimelineEntry {
  id: string;
  order_id: string;
  status: string;
  note: string | null;
  created_by: string | null;
  created_at: string;
}

// --- Review ---

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  is_verified: boolean;
  created_at: string;
  // Joined
  profile?: Pick<Profile, "full_name" | "avatar_url">;
}

// --- Address ---

export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string | null;
  zip: string | null;
  country: string;
  is_default: boolean;
  created_at: string;
}

// --- Coupon ---

export type CouponType = "percentage" | "fixed";

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  min_order_amount: number | null;
  usage_limit: number | null;
  per_customer_limit: number | null;
  times_used: number;
  valid_from: string | null;
  valid_to: string | null;
  applicable_products: string[] | null;
  applicable_categories: string[] | null;
  is_active: boolean;
  created_at: string;
}

// --- Site Settings ---

export interface SiteSettings {
  id: string;
  site_name: string;
  tagline: string | null;
  logo_url: string | null;
  logo_inverted_url: string | null;
  favicon_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  business_address: string | null;
  currency_code: string;
  currency_symbol: string;
  tax_rate: number;
  tax_inclusive: boolean;
  announcement_bar_active: boolean;
  announcement_bar_text: string | null;
  announcement_bar_link: string | null;
  announcement_bar_color: string | null;
  social_instagram: string | null;
  social_facebook: string | null;
  social_twitter: string | null;
  social_tiktok: string | null;
  social_youtube: string | null;
  updated_at: string;
}

// --- SEO ---

export interface SeoSettings {
  id: string;
  meta_title_template: string;
  default_meta_description: string | null;
  og_default_image_url: string | null;
  ga_tracking_id: string | null;
  fb_pixel_id: string | null;
  search_console_meta: string | null;
  robots_txt: string | null;
  updated_at: string;
}

export interface PageSeo {
  id: string;
  page_slug: string;
  meta_title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
}

// --- Hero Slides ---

export interface HeroSlide {
  id: string;
  image_url: string;
  heading: string | null;
  subheading: string | null;
  cta_text: string | null;
  cta_link: string | null;
  sort_order: number;
  is_active: boolean;
}

// --- Wishlist ---

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

// --- Subscriber ---

export interface Subscriber {
  id: string;
  email: string;
  created_at: string;
}

// --- Media ---

export interface MediaItem {
  id: string;
  url: string;
  filename: string;
  size: number | null;
  mime_type: string | null;
  uploaded_by: string | null;
  created_at: string;
}

// --- Cart (Client-side) ---

export interface CartItem {
  id: string;
  product_id: string;
  variant_id?: string;
  title: string;
  slug: string;
  image: string;
  price: number;
  variant_info?: Record<string, string>;
  quantity: number;
}
