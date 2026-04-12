const { createClient } = require("@supabase/supabase-js");
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) env[key.trim()] = value.trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  console.log("--- ORDERS TABLE COLUMNS ---");
  const { data: cols } = await supabase.rpc('get_column_info', { table_name: 'orders' });
  console.log(cols);
  
  console.log("--- RLS POLICIES ---");
  const { data: policies } = await supabase.rpc('get_policies', { table_name: 'orders' });
  console.log(policies);
}

// Note: I might not have get_column_info RPC, using a generic query
async function checkFallback() {
  const { data: orders } = await supabase.from('orders').select('*').limit(1);
  if (orders && orders.length > 0) {
    console.log("Sample Order keys:", Object.keys(orders[0]));
  }
}

checkFallback();
