-- Seed Categories
INSERT INTO categories (id, name, slug, description, image_url, sort_order) VALUES
('550e8400-e29b-41d4-a716-446655440011', 'Men', 'men', 'Crafted wardrobe staples for men.', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80', 0),
('550e8400-e29b-41d4-a716-446655440012', 'Women', 'women', 'Minimalist pieces and silhouettes for women.', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80', 1),
('550e8400-e29b-41d4-a716-446655440013', 'Accessories', 'accessories', 'Everyday carry items, leather wallets, and watches.', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80', 2)
ON CONFLICT (slug) DO UPDATE SET image_url = EXCLUDED.image_url;

-- Seed Products
INSERT INTO products (id, title, slug, description, price, sale_price, sku, stock_quantity, track_inventory, status, category_id, tags, og_image_url) VALUES
(
    '550e8400-e29b-41d4-a716-446655440021',
    'Essential Organic Cotton T-Shirt',
    'essential-t-shirt',
    'Our signature t-shirt, crafted from 100% GOTS-certified organic cotton. High neck detail, relaxed fit.',
    2500,
    1999,
    'TSH-ORG-WHT',
    50,
    true,
    'active',
    '550e8400-e29b-41d4-a716-446655440011',
    ARRAY['men', 't-shirt', 'white', 'black', 's', 'm', 'l', 'xl'],
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80'
),
(
    '550e8400-e29b-41d4-a716-446655440022',
    'Everyday Denim Jacket',
    'denim-jacket',
    'Classic denim jacket crafted from heavyweight raw Japanese selvedge denim. Perfect for layering.',
    8500,
    NULL,
    'JAC-DNM-BLU',
    25,
    true,
    'active',
    '550e8400-e29b-41d4-a716-446655440011',
    ARRAY['men', 'jacket', 'blue', 's', 'm', 'l'],
    'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=1200&q=80'
),
(
    '550e8400-e29b-41d4-a716-446655440023',
    'Classic Leather Sneakers',
    'leather-sneakers',
    'Italian calfskin leather sneakers with custom margom rubber cup soles. Completely handcrafted in Italy.',
    12500,
    NULL,
    'SNK-LTH-WHT',
    15,
    true,
    'active',
    '550e8400-e29b-41d4-a716-446655440011',
    ARRAY['men', 'sneakers', 'white', '8', '9', '10', '11'],
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80'
),
(
    '550e8400-e29b-41d4-a716-446655440024',
    'Minimalist Watch',
    'minimalist-watch',
    'Timeless face design, scratch-resistant sapphire crystal glass, and a black Italian leather strap.',
    18500,
    NULL,
    'WTC-MNM-SLV',
    8,
    true,
    'active',
    '550e8400-e29b-41d4-a716-446655440013',
    ARRAY['accessories', 'watch', 'silver', 'one size'],
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80'
)
ON CONFLICT (slug) DO NOTHING;

-- Seed Images
INSERT INTO product_images (product_id, image_url, sort_order) VALUES
('550e8400-e29b-41d4-a716-446655440021', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80', 0),
('550e8400-e29b-41d4-a716-446655440022', 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=1200&q=80', 0),
('550e8400-e29b-41d4-a716-446655440023', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80', 0),
('550e8400-e29b-41d4-a716-446655440024', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80', 0)
ON CONFLICT DO NOTHING;

-- Seed Options
INSERT INTO product_options (id, product_id, name, sort_order) VALUES
('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440021', 'Color', 0),
('550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440021', 'Size', 1),
('550e8400-e29b-41d4-a716-446655440033', '550e8400-e29b-41d4-a716-446655440022', 'Color', 0),
('550e8400-e29b-41d4-a716-446655440034', '550e8400-e29b-41d4-a716-446655440022', 'Size', 1),
('550e8400-e29b-41d4-a716-446655440035', '550e8400-e29b-41d4-a716-446655440023', 'Color', 0),
('550e8400-e29b-41d4-a716-446655440036', '550e8400-e29b-41d4-a716-446655440023', 'Size', 1),
('550e8400-e29b-41d4-a716-446655440037', '550e8400-e29b-41d4-a716-446655440024', 'Color', 0),
('550e8400-e29b-41d4-a716-446655440038', '550e8400-e29b-41d4-a716-446655440024', 'Size', 1)
ON CONFLICT DO NOTHING;

-- Seed Option Values
INSERT INTO product_option_values (option_id, value, sort_order) VALUES
('550e8400-e29b-41d4-a716-446655440031', 'White', 0),
('550e8400-e29b-41d4-a716-446655440031', 'Black', 1),
('550e8400-e29b-41d4-a716-446655440032', 'S', 0),
('550e8400-e29b-41d4-a716-446655440032', 'M', 1),
('550e8400-e29b-41d4-a716-446655440032', 'L', 2),
('550e8400-e29b-41d4-a716-446655440032', 'XL', 3),
('550e8400-e29b-41d4-a716-446655440033', 'Blue', 0),
('550e8400-e29b-41d4-a716-446655440034', 'S', 0),
('550e8400-e29b-41d4-a716-446655440034', 'M', 1),
('550e8400-e29b-41d4-a716-446655440034', 'L', 2),
('550e8400-e29b-41d4-a716-446655440035', 'White', 0),
('550e8400-e29b-41d4-a716-446655440036', '8', 0),
('550e8400-e29b-41d4-a716-446655440036', '9', 1),
('550e8400-e29b-41d4-a716-446655440036', '10', 2),
('550e8400-e29b-41d4-a716-446655440036', '11', 3),
('550e8400-e29b-41d4-a716-446655440037', 'Silver', 0),
('550e8400-e29b-41d4-a716-446655440038', 'One Size', 0)
ON CONFLICT DO NOTHING;

-- Seed Site Settings
INSERT INTO site_settings (site_name, tagline, contact_email, contact_phone, business_address, currency_code, currency_symbol, tax_rate, tax_inclusive, announcement_bar_active, announcement_bar_text, announcement_bar_color) VALUES
('PREMIUM.', 'Elevating everyday essentials.', 'support@premium.com', '+91-99999-99999', '123 Minimalism St, New Delhi, India', 'INR', '₹', 18.00, false, true, 'COMPLIMENTARY STANDARD SHIPPING ON ORDERS OVER ₹3,000', '#111827')
ON CONFLICT DO NOTHING;

-- Seed Hero Slides
INSERT INTO hero_slides (image_url, heading, subheading, cta_text, cta_link, sort_order, is_active) VALUES
('https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1600&q=80', 'THE ESSENTIAL TEE', 'Crafted from 100% GOTS-certified Organic Cotton.', 'SHOP NOW', '/products', 1, true),
('https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1600&q=80', 'CLASSIC SNEAKERS', 'Minimalist full-grain calfskin leather.', 'EXPLORE COLLECTION', '/products', 2, true)
ON CONFLICT DO NOTHING;
