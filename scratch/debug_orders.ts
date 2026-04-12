
import { supabase } from "../lib/supabaseClient";

async function debugOrders() {
  console.log("--- Debugging Orders ---");
  
  // 1. Check current session
  const { data: { session } } = await supabase.auth.getSession();
  console.log("Current User ID:", session?.user?.id || "None");

  // 2. Fetch all orders (bypassing RLS if possible, but here using anon key)
  const { data: allOrders, error: allErr } = await supabase
    .from('orders')
    .select('id, user_id, total, status')
    .limit(5);
  
  console.log("Sample Orders from DB:", allOrders);
  if (allErr) console.error("Error fetching sample:", allErr);

  // 3. Try fetching with user_id filter specifically
  if (session?.user?.id) {
    const { data: userOrders, error: userErr } = await supabase
      .from('orders')
      .select('id')
      .eq('user_id', session.user.id);
    
    console.log(`Orders matching current UID (${session.user.id}):`, userOrders?.length || 0);
    if (userErr) console.error("Error fetching user orders:", userErr);
  }
}

debugOrders();
