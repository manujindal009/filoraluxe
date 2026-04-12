import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testQuery(userId: string) {
  console.log(`--- TESTING RLS QUERY FOR USER: ${userId} ---`);
  
  // Note: We can't easily masquerade as auth.uid() in a script using the anon key
  // without a valid JWT. This is exactly why we need to verify the JWT logic.
  
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId);
    
  if (error) {
    console.error("Query Error:", error);
  } else {
    console.log(`Query Success! Found ${data?.length} orders.`);
  }
}

// We will use the user id from the screenshot
testQuery("366551a8-32e9-487d-9db8-4e68b8bc30d6");
