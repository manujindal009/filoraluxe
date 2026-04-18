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

// Category CRUD
export async function createCategory(cat: Omit<Category, 'id'>) {
  const { data, error } = await supabase
    .from("categories")
    .insert([{
      name: cat.name,
      slug: cat.slug || cat.name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, ""),
      description: cat.description,
      display_order: cat.displayOrder || 0
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCategory(id: string, cat: Partial<Category>) {
  const { data, error } = await supabase
    .from("categories")
    .update({
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      display_order: cat.displayOrder
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCategory(id: string) {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}

// Subcategory CRUD
export async function createSubcategory(sub: Omit<Subcategory, 'id'>) {
  const { data, error } = await supabase
    .from("subcategories")
    .insert([{
      category_id: sub.categoryId,
      name: sub.name,
      slug: sub.slug || sub.name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, ""),
      description: sub.description,
      display_order: sub.displayOrder || 0
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSubcategory(id: string, sub: Partial<Subcategory>) {
  const { data, error } = await supabase
    .from("subcategories")
    .update({
      name: sub.name,
      slug: sub.slug,
      description: sub.description,
      display_order: sub.displayOrder
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSubcategory(id: string) {
  const { error } = await supabase.from("subcategories").delete().eq("id", id);
  if (error) throw error;
}
