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

async function list() {
  const { data: orders } = await supabase.from('orders').select('*');
  console.log(`TOTAL ORDERS IN DB: ${orders?.length || 0}`);
  orders?.forEach(o => {
    console.log(`ID: ${o.id}, UserID: ${o.user_id}, Name: ${o.shipping_address?.name}, Email: ${o.shipping_address?.email}, Status: ${o.status}`);
  });
}

list();
