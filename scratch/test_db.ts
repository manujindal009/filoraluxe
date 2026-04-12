import { supabase } from "../lib/supabaseClient";

async function testFetch() {
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      categories (slug, name),
      subcategories (slug, name)
    `)
    .limit(1);

  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Sample Data:", JSON.stringify(data?.[0], null, 2));
  }
}

testFetch();
