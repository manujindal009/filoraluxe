import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

async function debug() {
  console.log("--- DEBUGGING ORDERS ---");
  const { data: orders, error } = await supabaseAdmin.from("orders").select("id, user_id, total, status").limit(5);
  
  if (error) {
    console.error("Error fetching orders:", error);
    return;
  }
  
  if (!orders || orders.length === 0) {
    console.log("No orders found in database.");
    return;
  }

  console.log(`Found ${orders.length} orders:`);
  for (const order of orders) {
    console.log(`Order ID: ${order.id}, User ID: ${order.user_id}, Total: ${order.total}`);
    
    // Check if the user_id exists in profiles
    if (order.user_id) {
      const { data: profile } = await supabaseAdmin.from("profiles").select("id, email, name").eq("id", order.user_id).single();
      if (profile) {
        console.log(`  -> Linked to Profile: ${profile.name} (${profile.email})`);
      } else {
        console.log(`  -> WARNING: user_id ${order.user_id} NOT FOUND in profiles table!`);
      }
    } else {
      console.log(`  -> WARNING: user_id is NULL!`);
    }
  }
}

debug();
