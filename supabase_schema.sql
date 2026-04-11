-- SUPABASE DATABASE SETUP FOR FILORA LUXE
-- Paste this script directly into your Supabase SQL Editor and hit "Run"

-- 1. Create a Profiles table referencing auth.users safely
CREATE TABLE profiles (
  id uuid REFERENCES auth.users on delete cascade not null primary key,
  email text not null,
  name text,
  role text default 'user' check (role in ('user', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on Security for Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." on profiles for select using (true);
CREATE POLICY "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
CREATE POLICY "Users can update own profile." on profiles for update using (auth.uid() = id);

-- 2. Create Products table
CREATE TABLE products (
  id text primary key,
  name text not null,
  description text,
  price numeric not null,
  category text,
  images text[] default '{}',
  featured boolean default false,
  in_stock boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on Security for Products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are viewable by everyone." on products for select using (true);
CREATE POLICY "Only admins can insert products." on products for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
CREATE POLICY "Only admins can update products." on products for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
CREATE POLICY "Only admins can delete products." on products for delete using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- 3. Create Orders table
CREATE TABLE orders (
  id text primary key,
  user_id uuid references profiles(id) on delete restrict,
  total numeric not null,
  status text check (status in ('pending', 'processing', 'shipped', 'delivered')) default 'pending',
  shipping_address jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on Security for Orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own orders." on orders for select using (auth.uid() = user_id);
CREATE POLICY "Admins can view all orders." on orders for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
CREATE POLICY "Users can insert their own orders." on orders for insert with check (auth.uid() = user_id);
CREATE POLICY "Admins can update orders." on orders for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- 4. Create Order Items (mapping many-to-many items in cart)
CREATE TABLE order_items (
  id uuid default extensions.uuid_generate_v4() primary key,
  order_id text references orders(id) on delete cascade not null,
  product_id text references products(id) on delete restrict not null,
  quantity integer not null default 1,
  price_at_time numeric not null
);

-- Turn on Security for Order Items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own order items." on order_items for select using (
  exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
);
CREATE POLICY "Admins can view all order items." on order_items for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
CREATE POLICY "Users can insert order items." on order_items for insert with check (
  exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
);

-- Automatically create profile when a user registers
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'admin' -- FOR DEMO PURPOSES ONLY! WE ARE MAKING EVERYONE AN ADMIN TO TEST THE PANEL!
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- DEMO SEED: Let's insert some default items into the products table
INSERT INTO products (id, name, description, price, category, images, featured, in_stock) VALUES
('prod-1', 'Classic Beige Tote', 'A beautifully handcrafted, minimalist tote bag made from 100% natural cotton. Perfect for your daily essentials or a quick trip to the market.', 85.00, 'bag', ARRAY['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&q=80&w=800'], true, true),
('prod-2', 'Sage Green Beanie', 'Keep warm with our chunky knit beanie. Soft, itchy-free yarn ensures comfort and effortless style during the colder months.', 45.00, 'hat', ARRAY['https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&q=80&w=800'], true, true),
('prod-3', 'Textured Throw Blanket', 'Add a layer of warmth and texture to your living space. This expansive throw features an intricate chevron stitch in a natural ivory tone.', 150.00, 'home', ARRAY['https://images.unsplash.com/photo-1580828369062-cb5fbdf6f88d?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1596434440660-f1ffacfff1cd?auto=format&fit=crop&q=80&w=800'], false, true);
