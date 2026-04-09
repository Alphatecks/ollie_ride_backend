const { createClient } = require("@supabase/supabase-js");
const env = require("./env");

function ensureSupabaseEnv() {
  if (!env.supabase.url || !env.supabase.serviceRoleKey) {
    throw new Error(
      "Supabase configuration is missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }
}

function getSupabaseClient() {
  ensureSupabaseEnv();

  return createClient(env.supabase.url, env.supabase.serviceRoleKey, {
    auth: { persistSession: false },
  });
}

async function testSupabaseConnection() {
  ensureSupabaseEnv();

  const response = await fetch(`${env.supabase.url}/rest/v1/`, {
    method: "GET",
    headers: {
      apikey: env.supabase.serviceRoleKey,
      Authorization: `Bearer ${env.supabase.serviceRoleKey}`,
    },
  });

  if (response.status >= 500) {
    throw new Error(`Supabase API unavailable: HTTP ${response.status}`);
  }
}

module.exports = {
  getSupabaseClient,
  testSupabaseConnection,
};
