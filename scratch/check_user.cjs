const { createClient } = require("@supabase/supabase-js");
const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) env[key.trim()] = value.trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAdminKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseAdminKey);

async function check() {
  const email = "anshumasingh964@gmail.com";
  console.log("Checking email:", email);
  
  const { data: profile } = await supabase.from('profiles').select('*').eq('email', email).single();
  console.log("Profile:", profile);
  
  const { data: orders } = await supabase.from('orders').select('*').or(`shipping_address->>email.eq.${email}`);
  console.log("Orders count:", orders?.length || 0);
  orders?.forEach(o => {
    console.log(`Order ID: ${o.id}, user_id: ${o.user_id}, created_at: ${o.created_at}`);
  });
}

check();
