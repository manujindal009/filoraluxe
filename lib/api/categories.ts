import { supabase } from "@/lib/supabaseClient";
import { Category, Subcategory } from "@/types";

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select(`
      *,
      subcategories (*)
    `)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("[fetchCategories] Error:", error.message);
    throw new Error(`Failed to fetch categories: ${error.message}`);
  }

  return (data ?? []).map(cat => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description || "",
    image: "", // We can assign images later or fetch from a field if added
    displayOrder: cat.display_order,
    subcategories: (cat.subcategories ?? []).map((sub: any) => ({
      id: sub.id,
      categoryId: sub.category_id,
      name: sub.name,
      slug: sub.slug,
      description: sub.description,
      displayOrder: sub.display_order,
    })).sort((a: any, b: any) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)),
  }));
}

export async function fetchSubcategories(categoryId?: string): Promise<Subcategory[]> {
  let query = supabase.from("subcategories").select("*");
  
  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data, error } = await query.order("display_order", { ascending: true });

  if (error) {
    console.error("[fetchSubcategories] Error:", error.message);
    throw new Error(`Failed to fetch subcategories: ${error.message}`);
  }

  return (data ?? []).map(sub => ({
    id: sub.id,
    categoryId: sub.category_id,
    name: sub.name,
    slug: sub.slug,
    description: sub.description,
    displayOrder: sub.display_order,
  }));
}
