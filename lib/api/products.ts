import { supabase } from "@/lib/supabaseClient";
import { Product } from "@/types";

// Single source of truth for mapping a DB row → Product type
function mapRow(p: Record<string, any>): Product {
  const images = Array.isArray(p.images) ? (p.images as string[]).filter(Boolean) : [];

  // Supabase returns joined data as objects or arrays depending on cardinality
  const getSlug = (val: any) => {
    if (!val) return "";
    if (Array.isArray(val)) return val[0]?.slug || "";
    return val.slug || "";
  };

  return {
    id: p.id as string,
    name: p.name as string,
    description: (p.description as string) || "",
    price: Number(p.price),
    comparePrice: p.compare_price ? Number(p.compare_price) : undefined,
    category: p.category_slug || getSlug(p.categories) || "", 
    subcategory: getSlug(p.subcategories) || "", 
    categoryId: p.category_id,
    subcategoryId: p.subcategory_id,
    images,
    featured: Boolean(p.featured),
    inStock: p.in_stock != null ? Boolean(p.in_stock) : true,
    stockCount: p.stock_count,
    tags: p.tags || [],
  };
}

export async function fetchProducts(): Promise<Product[]> {
  console.log("[fetchProducts] Querying Supabase products table...");

  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      categories (slug, name),
      subcategories (slug, name)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[fetchProducts] Error:", error.code, error.message, error.details);
    throw new Error(`Failed to fetch products: ${error.message}`);
  }

  console.log(`[fetchProducts] Received ${data?.length ?? 0} rows from Supabase.`);
  if (data && data.length > 0) {
    console.log("[fetchProducts] Sample row:", JSON.stringify(data[0], null, 2));
  }

  return (data ?? []).map(mapRow);
}

export async function fetchProductById(id: string): Promise<Product | null> {
  console.log(`[fetchProductById] Fetching product id=${id}`);

  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      categories (slug, name),
      subcategories (slug, name)
    `)
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      console.warn(`[fetchProductById] No product found with id=${id}`);
      return null;
    }
    console.error("[fetchProductById] Error:", error.code, error.message);
    throw new Error(`Failed to fetch product ${id}: ${error.message}`);
  }

  console.log(`[fetchProductById] Found: ${data?.name}`);
  return data ? mapRow(data) : null;
}

export async function createProduct(
  product: Omit<Product, "id">
): Promise<Product> {
  const newId = `prod-${Date.now()}`;

  const { data, error } = await supabase
    .from("products")
    .insert([
      {
        name: product.name,
        description: product.description,
        price: product.price,
        compare_price: product.comparePrice,
        category_id: product.categoryId,
        subcategory_id: product.subcategoryId,
        images: product.images,
        featured: product.featured ?? false,
        in_stock: product.inStock,
        stock_count: product.stockCount || 0,
        tags: product.tags || [],
        slug: product.name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, ""),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("[createProduct] Error:", error.message);
    throw error;
  }

  return mapRow(data);
}

export async function updateProduct(
  id: string,
  updates: Partial<Product>
): Promise<Product> {
  const payload: Record<string, any> = {};

  if (updates.name !== undefined) {
    payload.name = updates.name;
    payload.slug = updates.name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
  }
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.price !== undefined) payload.price = updates.price;
  if (updates.comparePrice !== undefined) payload.compare_price = updates.comparePrice;
  if (updates.categoryId !== undefined) payload.category_id = updates.categoryId;
  if (updates.subcategoryId !== undefined) payload.subcategory_id = updates.subcategoryId;
  if (updates.images !== undefined) payload.images = updates.images;
  if (updates.featured !== undefined) payload.featured = updates.featured;
  if (updates.inStock !== undefined) payload.in_stock = updates.inStock;
  if (updates.stockCount !== undefined) payload.stock_count = updates.stockCount;
  if (updates.tags !== undefined) payload.tags = updates.tags;

  const { data, error } = await supabase
    .from("products")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[updateProduct] Error:", error.message);
    throw error;
  }

  return mapRow(data);
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    console.error("[deleteProduct] Error:", error.message);
    throw error;
  }
}
