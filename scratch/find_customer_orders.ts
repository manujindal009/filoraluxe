import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAdminKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(supabaseUrl, supabaseAdminKey);

async function findData() {
  const email = "anshumasingh964@gmail.com";
  console.log(`--- Investigating data for: ${email} ---`);

  // 1. Find Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, name, email')
    .eq('email', email)
    .single();
  
  console.log("Profile Found:", profile);

  // 2. Find Orders by shipping email
  const { data: ordersByEmail } = await supabase
    .from('orders')
    .select('id, user_id, status, created_at, shipping_address')
    .or(`shipping_address->>email.eq.${email}`);

  console.log(`Orders found with shipping email ${email}:`, ordersByEmail?.length || 0);
  ordersByEmail?.forEach(o => {
    console.log(`Order ID: ${o.id}, Linked UserID: ${o.user_id}, Created At: ${o.created_at}`);
  });

  if (profile && ordersByEmail) {
    const mismatch = ordersByEmail.some(o => o.user_id !== profile.id);
    if (mismatch) {
      console.warn("CRITICAL: Some orders are NOT linked to the profile ID!");
    } else {
      console.log("SUCCESS: All orders are correctly linked to the profile ID.");
    }
  }
}

findData();
