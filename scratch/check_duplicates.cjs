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
  const email = "anshumasingh964@gmail.com";
  console.log(`--- Investigating Auth Duplicates for: ${email} ---`);

  // We check profiles first since auth.users isn't directly queryable via standard client 
  // but we have service role, let's try a direct RPC or admin call if available
  const { data: users, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    console.error("Error listing users:", error);
    return;
  }

  const matches = users.users.filter(u => u.email === email);
  console.log(`Found ${matches.length} auth user(s) with this email.`);
  matches.forEach(u => {
    console.log(`ID: ${u.id}, Created: ${u.created_at}, Provider: ${u.app_metadata.provider}`);
  });
}

check();
