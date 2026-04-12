const { createClient } = require("@supabase/supabase-js");
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  const value = valueParts.join('=');
  if (key && value) env[key.trim()] = value.trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkProfiles() {
  console.log("--- PROFILES CHECK ---");
  const { data: profiles, error: pError } = await supabase.from('profiles').select('*');
  if (pError) console.error("Error fetching profiles:", pError);
  
  console.log(`\n--- ALL PROFILES IN DB (${profiles?.length || 0}) ---`);
  profiles?.forEach(p => {
    console.log(`ID: ${p.id}, Email: ${p.email}, Role: ${p.role}, Name: ${p.name}`);
  });

  const { data: authUsers, error: aError } = await supabase.auth.admin.listUsers();
  if (aError) console.error("Error fetching auth users:", aError);
  
  // Sort auth users by created_at desc
  const sortedAuth = (authUsers?.users || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  console.log(`\nTOTAL AUTH USERS: ${sortedAuth.length}`);
  sortedAuth.forEach(u => {
     const hasProfile = profiles?.some(p => p.id === u.id);
     console.log(`ID: ${u.id}, Email: ${u.email}, Provider: ${u.app_metadata.provider}, CreatedAt: ${u.created_at}, HasProfile: ${hasProfile}`);
  });
}

checkProfiles();
