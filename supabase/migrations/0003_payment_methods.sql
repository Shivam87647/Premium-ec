-- Migration: Add payment_methods column to site_settings
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS payment_methods TEXT[] DEFAULT ARRAY['Cash', 'Razorpay', 'UPI', 'Net Banking']::TEXT[];
