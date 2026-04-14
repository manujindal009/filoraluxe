-- ============================================================
-- FILORA LUXE — FULL CATEGORY + PRODUCT SCHEMA
-- Paste in Supabase SQL Editor and run
-- ============================================================

-- ──────────────────────────────────────────
-- DROP EXISTING (run only if resetting)
-- ──────────────────────────────────────────
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS subcategories CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- ──────────────────────────────────────────
-- 1. CATEGORIES
-- ──────────────────────────────────────────
CREATE TABLE categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_public_read" ON categories FOR SELECT USING (true);
CREATE POLICY "categories_admin_write" ON categories FOR ALL USING (true);

CREATE INDEX idx_categories_slug ON categories(slug);

-- ──────────────────────────────────────────
-- 2. SUBCATEGORIES
-- ──────────────────────────────────────────
CREATE TABLE subcategories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subcategories_public_read" ON subcategories FOR SELECT USING (true);
CREATE POLICY "subcategories_admin_write" ON subcategories FOR ALL USING (true);

CREATE INDEX idx_subcategories_category ON subcategories(category_id);
CREATE INDEX idx_subcategories_slug ON subcategories(slug);

-- ──────────────────────────────────────────
-- 3. PRODUCTS (extended schema)
-- ──────────────────────────────────────────
CREATE TABLE products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  subcategory_id uuid REFERENCES subcategories(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  price numeric(10,2) NOT NULL,
  compare_price numeric(10,2),           -- original price for "Sale" display
  images text[] DEFAULT '{}',
  tags text[] DEFAULT '{}',
  featured boolean DEFAULT false,
  in_stock boolean DEFAULT true,
  stock_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_public_read" ON products FOR SELECT USING (true);
CREATE POLICY "products_admin_write" ON products FOR ALL USING (true);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_subcategory ON products(subcategory_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_products_tags ON products USING GIN(tags);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ──────────────────────────────────────────
-- INSERT CATEGORIES
-- ──────────────────────────────────────────
INSERT INTO categories (id, slug, name, description, display_order) VALUES
('c1000000-0000-0000-0000-000000000001', 'toys-amigurumi',         'Toys & Amigurumi',          'Handcrafted crochet plushies, dolls, and figurines', 1),
('c1000000-0000-0000-0000-000000000002', 'accessories',             'Accessories',                 'Wearable crochet pieces for every season',           2),
('c1000000-0000-0000-0000-000000000003', 'bags-storage',            'Bags & Storage',              'Stunning handmade bags, totes, and pouches',          3),
('c1000000-0000-0000-0000-000000000004', 'home-living',             'Home & Living',               'Crochet décor to elevate your living spaces',         4),
('c1000000-0000-0000-0000-000000000005', 'gifts-decor',             'Gifts & Decor',               'Thoughtful handcrafted gifts and decorative items',   5),
('c1000000-0000-0000-0000-000000000006', 'utility-products',        'Utility Products',            'Practical everyday crochet essentials',               6),
('c1000000-0000-0000-0000-000000000007', 'custom-personalized',     'Custom & Personalized',       'Made-to-order pieces tailored just for you',          7),
('c1000000-0000-0000-0000-000000000008', 'seasonal-collection',     'Seasonal Collection',         'Limited edition festive and seasonal drops',          8),
('c1000000-0000-0000-0000-000000000009', 'art-premium',             'Art & Premium',               'Museum-quality crochet art and collector pieces',     9),
('c1000000-0000-0000-0000-000000000010', 'diy-supplies',            'DIY & Supplies',              'Everything you need to start your crochet journey',  10);


-- ──────────────────────────────────────────
-- INSERT SUBCATEGORIES
-- ──────────────────────────────────────────
INSERT INTO subcategories (id, category_id, slug, name, display_order) VALUES
-- Toys & Amigurumi
('11000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'animal-plushies',    'Animal Plushies',       1),
('11000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'cartoon-characters', 'Cartoon Characters',    2),
('11000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000001', 'human-dolls',        'Human Dolls',           3),
('11000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000001', 'mini-keychains',     'Mini Toys / Keychains', 4),
('11000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000001', 'food-plushies',      'Food Plushies',         5),
('11000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000001', 'fantasy-creatures',  'Fantasy Creatures',     6),

-- Accessories
('12000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002', 'beanies',            'Beanies',        1),
('12000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002', 'scarves',            'Scarves / Mufflers', 2),
('12000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000002', 'gloves',             'Gloves / Mittens',   3),
('12000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000002', 'ear-warmers',        'Ear Warmers',        4),
('12000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000002', 'scrunchies',         'Scrunchies',         5),
('12000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000002', 'headbands',          'Headbands',          6),
('12000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000002', 'shawls',             'Shawls',             7),

-- Bags & Storage
('13000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000003', 'tote-bags',   'Tote Bags',  1),
('13000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000003', 'sling-bags',  'Sling Bags', 2),
('13000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000003', 'backpacks',   'Backpacks',  3),
('13000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000003', 'clutches',    'Clutches',   4),
('13000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000003', 'wallets',     'Wallets',    5),
('13000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000003', 'pouches',     'Pouches',    6),

-- Home & Living
('14000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000004', 'wall-hangings',   'Wall Hangings',   1),
('14000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000004', 'plant-hangers',   'Plant Hangers',   2),
('14000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000004', 'lampshades',      'Lampshades',      3),
('14000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000004', 'cushion-covers',  'Cushion Covers',  4),
('14000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000004', 'table-runners',   'Table Runners',   5),
('14000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000004', 'doilies',         'Doilies',         6),

-- Gifts & Decor
('15000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000005', 'crochet-flowers', 'Crochet Flowers / Bouquets', 1),
('15000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000005', 'gift-keychains',  'Keychains',                  2),
('15000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000005', 'coasters',        'Coasters',                   3),
('15000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000005', 'mini-decor',      'Mini Decor Items',            4),

-- Utility Products
('16000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000006', 'dishcloths',     'Dishcloths / Scrubbers',    1),
('16000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000006', 'bottle-holders', 'Bottle Holders',            2),
('16000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000006', 'phone-pouches',  'Phone Pouches / Covers',    3),
('16000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000006', 'glass-holders',  'Glass Holders',             4),

-- Custom & Personalized
('17000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000007', 'custom-dolls',   'Custom Dolls (from photo)', 1),
('17000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000007', 'name-keychains', 'Name Keychains',            2),
('17000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000007', 'couple-gifts',   'Couple Gifts',              3),
('17000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000007', 'gift-hampers',   'Gift Hampers',              4),

-- Seasonal Collection
('18000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000008', 'christmas',  'Christmas',  1),
('18000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000008', 'diwali',     'Diwali',     2),
('18000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000008', 'valentine',  'Valentine',  3),
('18000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000008', 'halloween',  'Halloween',  4),

-- Art & Premium
('19000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000009', 'wall-art',       'Wall Art',       1),
('19000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000009', 'sculptures',     'Sculptures',     2),
('19000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000009', 'designer-pieces','Designer Pieces', 3),
('19000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000009', 'exhibition-items','Exhibition Items',4),

-- DIY & Supplies
('1a000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000010', 'diy-kits',    'DIY Kits',          1),
('1a000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000010', 'patterns-pdf','Patterns (PDF)',    2),
('1a000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000010', 'yarn-bundles','Yarn Bundles',      3),
('1a000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000010', 'crochet-tools','Crochet Tools',    4);


-- ──────────────────────────────────────────
-- INSERT SAMPLE PRODUCTS
-- ──────────────────────────────────────────

INSERT INTO products (category_id, subcategory_id, name, slug, description, price, compare_price, images, tags, featured, in_stock, stock_count) VALUES

-- ┌──────────────────────────────────────────
-- │ TOYS & AMIGURUMI — Animal Plushies
-- └──────────────────────────────────────────
('c1000000-0000-0000-0000-000000000001','11000000-0000-0000-0000-000000000001',
 'Crochet Bear Plushie', 'crochet-bear-plushie',
 'A soft, huggable teddy bear handcrafted in premium cotton. Perfect gift for kids and adults alike.',
 599.00, 799.00, ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'],
 ARRAY['bear','plushie','soft toy','baby gift'], true, true, 15),

('c1000000-0000-0000-0000-000000000001','11000000-0000-0000-0000-000000000001',
 'Crochet Bunny Plushie', 'crochet-bunny-plushie',
 'An adorable long-eared bunny in pastel colours. Great for nurseries and gifting.',
 549.00, NULL, ARRAY['https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800'],
 ARRAY['bunny','rabbit','plushie','easter'], false, true, 20),

('c1000000-0000-0000-0000-000000000001','11000000-0000-0000-0000-000000000001',
 'Crochet Elephant Plushie', 'crochet-elephant-plushie',
 'A chunky, lovable elephant in soft grey cotton yarn with embroidered details.',
 649.00, NULL, ARRAY['https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?w=800'],
 ARRAY['elephant','plushie','soft toy','nursery'], false, true, 10),

-- Cartoon Characters
('c1000000-0000-0000-0000-000000000001','11000000-0000-0000-0000-000000000002',
 'Pikachu Crochet Doll', 'pikachu-crochet-doll',
 'A faithful amigurumi Pikachu — the perfect gift for any Pokémon fan.',
 699.00, NULL, ARRAY['https://images.unsplash.com/photo-1620459317065-a49e0a4feee2?w=800'],
 ARRAY['pikachu','pokemon','cartoon','anime'], true, true, 8),

('c1000000-0000-0000-0000-000000000001','11000000-0000-0000-0000-000000000002',
 'Stitch Amigurumi', 'stitch-amigurumi',
 'Everyone''s favourite blue alien, crocheted by hand with premium acrylic yarn.',
 749.00, 899.00, ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'],
 ARRAY['stitch','disney','cartoon','amigurumi'], false, true, 5),

-- Human Dolls
('c1000000-0000-0000-0000-000000000001','11000000-0000-0000-0000-000000000003',
 'Crochet Couple Dolls', 'crochet-couple-dolls',
 'A sweet pair of customisable couple dolls — ideal anniversary or wedding gift.',
 1299.00, NULL, ARRAY['https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800'],
 ARRAY['couple','dolls','wedding gift','anniversary'], true, true, 6),

('c1000000-0000-0000-0000-000000000001','11000000-0000-0000-0000-000000000003',
 'Custom Portrait Doll', 'custom-portrait-doll',
 'Send us a photo and we''ll recreate it as a beautiful crochet doll. 100% handmade.',
 1799.00, NULL, ARRAY['https://images.unsplash.com/photo-1571772996211-2f02c9727629?w=800'],
 ARRAY['custom','portrait','doll','personalized'], true, true, 3),

-- Mini Toys / Keychains
('c1000000-0000-0000-0000-000000000001','11000000-0000-0000-0000-000000000004',
 'Mini Bear Keychain', 'mini-bear-keychain',
 'A tiny crocheted bear that clips onto your keys or bag. Too cute to resist!',
 199.00, NULL, ARRAY['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800'],
 ARRAY['keychain','bear','mini','accessory'], false, true, 40),

('c1000000-0000-0000-0000-000000000001','11000000-0000-0000-0000-000000000004',
 'Mini Strawberry Keychain', 'mini-strawberry-keychain',
 'A plump, juicy-looking crocheted strawberry keychain. The most popular design.',
 179.00, NULL, ARRAY['https://images.unsplash.com/photo-1582476369784-5ef6e4a5e1e3?w=800'],
 ARRAY['keychain','strawberry','food','mini'], true, true, 60),

-- Food Plushies
('c1000000-0000-0000-0000-000000000001','11000000-0000-0000-0000-000000000005',
 'Crochet Avocado Plushie', 'crochet-avocado-plushie',
 'A squishy avocado that makes a great desk companion or gift.',
 349.00, NULL, ARRAY['https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=800'],
 ARRAY['avocado','food','plushie','fun'], false, true, 25),

('c1000000-0000-0000-0000-000000000001','11000000-0000-0000-0000-000000000005',
 'Crochet Sushi Set', 'crochet-sushi-set',
 'A set of 4 miniature sushi pieces — nigiri, maki, and more. Display-worthy.',
 599.00, 699.00, ARRAY['https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=800'],
 ARRAY['sushi','food','plushie','set'], false, true, 12),

-- Fantasy Creatures
('c1000000-0000-0000-0000-000000000001','11000000-0000-0000-0000-000000000006',
 'Rainbow Unicorn Plushie', 'rainbow-unicorn-plushie',
 'A magical rainbow-coloured unicorn with a shimmer yarn mane. Girls love this!',
 799.00, NULL, ARRAY['https://images.unsplash.com/photo-1558349697-a456d9f47c96?w=800'],
 ARRAY['unicorn','fantasy','rainbow','plushie'], true, true, 10),

('c1000000-0000-0000-0000-000000000001','11000000-0000-0000-0000-000000000006',
 'Crochet Dragon Plushie', 'crochet-dragon-plushie',
 'A fierce yet adorable dragon with wings and embroidered scales.',
 899.00, NULL, ARRAY['https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800'],
 ARRAY['dragon','fantasy','plushie','collectible'], false, true, 7),


-- ┌──────────────────────────────────────────
-- │ ACCESSORIES
-- └──────────────────────────────────────────
('c1000000-0000-0000-0000-000000000002','12000000-0000-0000-0000-000000000001',
 'Chunky Sage Green Beanie', 'chunky-sage-green-beanie',
 'A warm, oversized beanie in soft sage green. The best winter essential.',
 449.00, 599.00, ARRAY['https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800'],
 ARRAY['beanie','winter','hat','sage'], true, true, 18),

('c1000000-0000-0000-0000-000000000002','12000000-0000-0000-0000-000000000001',
 'Cream Cable Knit Beanie', 'cream-cable-knit-beanie',
 'Classic cable-textured beanie in natural cream. Timeless and elegant.',
 399.00, NULL, ARRAY['https://images.unsplash.com/photo-1521369909029-2afed882baee?w=800'],
 ARRAY['beanie','cream','cable','winter'], false, true, 22),

('c1000000-0000-0000-0000-000000000002','12000000-0000-0000-0000-000000000002',
 'Infinity Scarf in Dusty Rose', 'infinity-scarf-dusty-rose',
 'A loop scarf that never untangles. Soft merino blend in dusty rose.',
 699.00, NULL, ARRAY['https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800'],
 ARRAY['scarf','infinity','dusty rose','winter'], false, true, 14),

('c1000000-0000-0000-0000-000000000002','12000000-0000-0000-0000-000000000002',
 'Classic Tassel Muffler', 'classic-tassel-muffler',
 'A long muffler with hand-tied tassels. Wrap it twice, wear it proud.',
 549.00, 699.00, ARRAY['https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800'],
 ARRAY['scarf','muffler','tassel','winter'], false, true, 16),

('c1000000-0000-0000-0000-000000000002','12000000-0000-0000-0000-000000000005',
 'Pastel Scrunchie Set (3-pack)', 'pastel-scrunchie-set',
 'A set of 3 handmade crochet scrunchies in pastel tones. Hair accessory goals.',
 299.00, NULL, ARRAY['https://images.unsplash.com/photo-1609803384069-19f3f5d5e9da?w=800'],
 ARRAY['scrunchie','hair','pastel','set'], true, true, 35),

('c1000000-0000-0000-0000-000000000002','12000000-0000-0000-0000-000000000006',
 'Boho Flower Headband', 'boho-flower-headband',
 'A beautiful headband with crocheted flower motifs. Perfect for festivals.',
 349.00, NULL, ARRAY['https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800'],
 ARRAY['headband','flower','boho','hair'], false, true, 20),

('c1000000-0000-0000-0000-000000000002','12000000-0000-0000-0000-000000000007',
 'Lace Triangle Shawl', 'lace-triangle-shawl',
 'A delicate lace-pattern shawl in ivory. Draped elegance for every occasion.',
 1199.00, NULL, ARRAY['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800'],
 ARRAY['shawl','lace','ivory','elegant'], false, true, 8),


-- ┌──────────────────────────────────────────
-- │ BAGS & STORAGE
-- └──────────────────────────────────────────
('c1000000-0000-0000-0000-000000000003','13000000-0000-0000-0000-000000000001',
 'Classic Beige Tote Bag', 'classic-beige-tote-bag',
 'A structured basket-weave tote in natural beige. Roomy, durable and chic.',
 899.00, 1099.00, ARRAY['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800'],
 ARRAY['tote','beige','bag','cotton'], true, true, 12),

('c1000000-0000-0000-0000-000000000003','13000000-0000-0000-0000-000000000001',
 'Open-Weave Market Bag', 'open-weave-market-bag',
 'Stretchy, eco-friendly market bag that expands to carry everything.',
 499.00, NULL, ARRAY['https://images.unsplash.com/photo-1591561954555-607968c989ab?w=800'],
 ARRAY['tote','market','eco','stretchy'], false, true, 20),

('c1000000-0000-0000-0000-000000000003','13000000-0000-0000-0000-000000000002',
 'Bohemian Sling Bag', 'bohemian-sling-bag',
 'A crossbody sling with macramé-inspired detailing. Great for casual outings.',
 749.00, NULL, ARRAY['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800'],
 ARRAY['sling','crossbody','boho','bag'], true, true, 10),

('c1000000-0000-0000-0000-000000000003','13000000-0000-0000-0000-000000000004',
 'Dusty Rose Clutch', 'dusty-rose-clutch',
 'A compact evening clutch in dusty rose. Fits your essentials in elegant style.',
 649.00, 799.00, ARRAY['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800'],
 ARRAY['clutch','rose','evening','bag'], false, true, 8),

('c1000000-0000-0000-0000-000000000003','13000000-0000-0000-0000-000000000005',
 'Mini Coin Wallet', 'mini-coin-wallet',
 'A tiny zippered wallet for coins and cards, crocheted in cotton.',
 249.00, NULL, ARRAY['https://images.unsplash.com/photo-1609803384069-19f3f5d5e9da?w=800'],
 ARRAY['wallet','coin','mini','cotton'], false, true, 30),

('c1000000-0000-0000-0000-000000000003','13000000-0000-0000-0000-000000000006',
 'Makeup Brush Pouch', 'makeup-brush-pouch',
 'A cylindrical pouch perfectly sized for brushes and pencils.',
 349.00, NULL, ARRAY['https://images.unsplash.com/photo-1582476369784-5ef6e4a5e1e3?w=800'],
 ARRAY['pouch','makeup','brush','cotton'], false, true, 15),


-- ┌──────────────────────────────────────────
-- │ HOME & LIVING
-- └──────────────────────────────────────────
('c1000000-0000-0000-0000-000000000004','14000000-0000-0000-0000-000000000001',
 'Boho Wall Hanging', 'boho-wall-hanging',
 'A large macramé-crochet wall hanging with fringe. Statement piece for any wall.',
 1499.00, 1799.00, ARRAY['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800'],
 ARRAY['wall','hanging','boho','decor'], true, true, 6),

('c1000000-0000-0000-0000-000000000004','14000000-0000-0000-0000-000000000002',
 'Plant Hanger (Single)', 'plant-hanger-single',
 'A simple yet stunning plant hanger in natural beige. Elevate your green corner.',
 399.00, NULL, ARRAY['https://images.unsplash.com/photo-1493552152660-f710f9551ea5?w=800'],
 ARRAY['plant','hanger','macrame','natural'], false, true, 18),

('c1000000-0000-0000-0000-000000000004','14000000-0000-0000-0000-000000000004',
 'Textured Cushion Cover', 'textured-cushion-cover',
 'A chunky-textured cushion cover in warm ivory. Cosy and minimal.',
 799.00, NULL, ARRAY['https://images.unsplash.com/photo-1580828369062-cb5fbdf6f88d?w=800'],
 ARRAY['cushion','cover','ivory','home'], false, true, 10),

('c1000000-0000-0000-0000-000000000004','14000000-0000-0000-0000-000000000005',
 'Bohemian Table Runner', 'bohemian-table-runner',
 'A wide loom-inspired crochet table runner. Perfect for dining tables.',
 999.00, NULL, ARRAY['https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800'],
 ARRAY['table','runner','bohemian','dining'], false, true, 7),


-- ┌──────────────────────────────────────────
-- │ GIFTS & DECOR
-- └──────────────────────────────────────────
('c1000000-0000-0000-0000-000000000005','15000000-0000-0000-0000-000000000001',
 'Crochet Rose Bouquet', 'crochet-rose-bouquet',
 '12 handcrafted crochet roses in a gift-ready bouquet. Flowers that last forever.',
 1299.00, 1599.00, ARRAY['https://images.unsplash.com/photo-1561181286-d3f8d8cd1ac1?w=800'],
 ARRAY['bouquet','rose','flowers','gift'], true, true, 8),

('c1000000-0000-0000-0000-000000000005','15000000-0000-0000-0000-000000000001',
 'Sunflower Bunch (6-pack)', 'sunflower-bunch',
 'A vibrant bunch of 6 crochet sunflowers. Brings sunshine to any room.',
 899.00, NULL, ARRAY['https://images.unsplash.com/photo-1574068468668-a05a11f871da?w=800'],
 ARRAY['sunflower','bouquet','flowers','bright'], false, true, 12),

('c1000000-0000-0000-0000-000000000005','15000000-0000-0000-0000-000000000003',
 'Coaster Set (Set of 6)', 'coaster-set-6',
 'Six round coasters in matching earthy tones. Practical and beautiful.',
 499.00, 599.00, ARRAY['https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800'],
 ARRAY['coasters','set','earthy','home'], false, true, 20),


-- ┌──────────────────────────────────────────
-- │ UTILITY PRODUCTS
-- └──────────────────────────────────────────
('c1000000-0000-0000-0000-000000000006','16000000-0000-0000-0000-000000000001',
 'Kitchen Dishcloth Set (3-pack)', 'kitchen-dishcloth-set',
 'Three absorbent cotton dishcloths in neutral tones. Eco-friendly and reusable.',
 299.00, NULL, ARRAY['https://images.unsplash.com/photo-1615398154408-8b2b1a7b4ea2?w=800'],
 ARRAY['dishcloth','kitchen','eco','cotton'], false, true, 30),

('c1000000-0000-0000-0000-000000000006','16000000-0000-0000-0000-000000000002',
 'Crochet Bottle Holder', 'crochet-bottle-holder',
 'A snug holder for your water bottle. Adjustable and stylish.',
 349.00, NULL, ARRAY['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800'],
 ARRAY['bottle','holder','water bottle','eco'], false, true, 18),

('c1000000-0000-0000-0000-000000000006','16000000-0000-0000-0000-000000000003',
 'Phone Sleeve (iPhone / Android)', 'phone-sleeve',
 'A slim crocheted sleeve that protects your phone with style and softness.',
 249.00, NULL, ARRAY['https://images.unsplash.com/photo-1609803384069-19f3f5d5e9da?w=800'],
 ARRAY['phone','sleeve','cover','protect'], false, true, 25),


-- ┌──────────────────────────────────────────
-- │ CUSTOM & PERSONALIZED
-- └──────────────────────────────────────────
('c1000000-0000-0000-0000-000000000007','17000000-0000-0000-0000-000000000001',
 'Custom Look-Alike Doll', 'custom-look-alike-doll',
 'Send a photo, get a crochet doll that looks just like you. 100% made to order.',
 1999.00, NULL, ARRAY['https://images.unsplash.com/photo-1571772996211-2f02c9727629?w=800'],
 ARRAY['custom','doll','portrait','personalized'], true, true, 4),

('c1000000-0000-0000-0000-000000000007','17000000-0000-0000-0000-000000000002',
 'Custom Name Keychain', 'custom-name-keychain',
 'Your name or initials in a cute crochet keychain. Great personalised gift.',
 299.00, NULL, ARRAY['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800'],
 ARRAY['keychain','name','custom','gifting'], false, true, 50),

('c1000000-0000-0000-0000-000000000007','17000000-0000-0000-0000-000000000003',
 'Couple Matching Keychain Set', 'couple-matching-keychain-set',
 'A matching pair of crocheted keychains for couples. Cute, lasting, personal.',
 499.00, NULL, ARRAY['https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800'],
 ARRAY['couple','keychain','matching','gifting'], true, true, 20),

('c1000000-0000-0000-0000-000000000007','17000000-0000-0000-0000-000000000004',
 'Premium Gift Hamper', 'premium-gift-hamper',
 'A curated hamper of mini crochet items — surprise someone special.',
 2499.00, 2999.00, ARRAY['https://images.unsplash.com/photo-1575985792078-0fa5f01c7e98?w=800'],
 ARRAY['hamper','gift','premium','curated'], true, true, 5),


-- ┌──────────────────────────────────────────
-- │ SEASONAL
-- └──────────────────────────────────────────
('c1000000-0000-0000-0000-000000000008','18000000-0000-0000-0000-000000000001',
 'Crochet Christmas Ornament Set', 'christmas-ornament-set',
 'Six festive ornaments — stars, stockings, trees. Hang them with love.',
 699.00, NULL, ARRAY['https://images.unsplash.com/photo-1609803384069-19f3f5d5e9da?w=800'],
 ARRAY['christmas','ornament','festive','set'], false, true, 15),

('c1000000-0000-0000-0000-000000000008','18000000-0000-0000-0000-000000000002',
 'Diwali Toran (Door Hanging)', 'diwali-toran',
 'A bright and festive crocheted toran with flowers and bells for Diwali.',
 849.00, NULL, ARRAY['https://images.unsplash.com/photo-1574068468668-a05a11f871da?w=800'],
 ARRAY['diwali','toran','festive','indian'], true, true, 10),

('c1000000-0000-0000-0000-000000000008','18000000-0000-0000-0000-000000000003',
 'Valentine Heart Plushie', 'valentine-heart-plushie',
 'A plump red crochet heart — the most heartfelt Valentine''s gift.',
 399.00, NULL, ARRAY['https://images.unsplash.com/photo-1561181286-d3f8d8cd1ac1?w=800'],
 ARRAY['valentine','heart','love','gift'], true, true, 20),


-- ┌──────────────────────────────────────────
-- │ ART & PREMIUM
-- └──────────────────────────────────────────
('c1000000-0000-0000-0000-000000000009','19000000-0000-0000-0000-000000000001',
 'Abstract Wall Art Panel', 'abstract-wall-art-panel',
 'A large-format crochet wall panel blending textures, colours, and geometry.',
 3999.00, NULL, ARRAY['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800'],
 ARRAY['wall art','abstract','premium','large'], false, true, 2),

('c1000000-0000-0000-0000-000000000009','19000000-0000-0000-0000-000000000003',
 'Designer Clutch — Signature Edition', 'designer-clutch-signature',
 'A limited-run designer clutch with hand-embroidered initials. Couture-level craft.',
 4999.00, NULL, ARRAY['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800'],
 ARRAY['designer','clutch','limited','premium'], false, true, 1),


-- ┌──────────────────────────────────────────
-- │ DIY & SUPPLIES
-- └──────────────────────────────────────────
('c1000000-0000-0000-0000-000000000010','1a000000-0000-0000-0000-000000000001',
 'Beginner Amigurumi DIY Kit', 'beginner-amigurumi-kit',
 'Includes yarn, hook, stuffing, eyes, and step-by-step pattern. Start today!',
 799.00, 999.00, ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'],
 ARRAY['diy','kit','beginner','amigurumi'], true, true, 20),

('c1000000-0000-0000-0000-000000000010','1a000000-0000-0000-0000-000000000002',
 'Bear Amigurumi PDF Pattern', 'bear-amigurumi-pdf-pattern',
 'A complete downloadable pattern for making a crochet bear. Instant download.',
 149.00, NULL, ARRAY['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800'],
 ARRAY['pdf','pattern','bear','digital'], false, true, 999),

('c1000000-0000-0000-0000-000000000010','1a000000-0000-0000-0000-000000000003',
 'Premium Cotton Yarn Bundle (5 colours)', 'premium-cotton-yarn-bundle',
 'Five 100g skeins of premium cotton yarn in a curated earthy palette.',
 999.00, 1199.00, ARRAY['https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=800'],
 ARRAY['yarn','cotton','bundle','supplies'], false, true, 14),

('c1000000-0000-0000-0000-000000000010','1a000000-0000-0000-0000-000000000004',
 'Ergonomic Crochet Hook Set (10 hooks)', 'ergonomic-hook-set',
 'A set of 10 ergonomic crochet hooks in sizes 2mm–10mm with rubber grip handles.',
 699.00, NULL, ARRAY['https://images.unsplash.com/photo-1615398154408-8b2b1a7b4ea2?w=800'],
 ARRAY['hooks','tools','ergonomic','set'], false, true, 22);


-- ──────────────────────────────────────────
-- VERIFY
-- ──────────────────────────────────────────
SELECT
  c.name AS category,
  s.name AS subcategory,
  COUNT(p.id) AS products
FROM categories c
JOIN subcategories s ON s.category_id = c.id
LEFT JOIN products p ON p.subcategory_id = s.id
GROUP BY c.name, s.name, c.display_order, s.display_order
ORDER BY c.display_order, s.display_order;
