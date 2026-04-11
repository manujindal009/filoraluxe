import { supabase } from "../lib/supabaseClient";

async function clearSampleData() {
  console.log("🚀 Starting data cleanup...");

  try {
    // 1. Clear Products (this might have dependencies)
    console.log("Cleaning products...");
    const { error: pErr } = await supabase.from("products").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (pErr) console.error("Error clearing products:", pErr.message);

    // 2. Clear Coupons (except WELCOME10)
    console.log("Cleaning coupons...");
    const { error: cErr } = await supabase.from("coupons").delete().neq("code", "WELCOME10");
    if (cErr) console.error("Error clearing coupons:", cErr.message);

    // 3. Clear Orders & Order Items (if tables exist)
    console.log("Cleaning orders...");
    const { error: oErr } = await supabase.from("orders").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (oErr && oErr.code !== "PGRST116") console.warn("Orders table issue:", oErr.message);

    // 4. Clear Reviews
    console.log("Cleaning reviews...");
    const { error: rErr } = await supabase.from("reviews").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (rErr && rErr.code !== "PGRST116") console.warn("Reviews table issue:", rErr.message);

    console.log("✅ Cleanup complete!");
  } catch (err) {
    console.error("Unexpected error during cleanup:", err);
  }
}

clearSampleData();
