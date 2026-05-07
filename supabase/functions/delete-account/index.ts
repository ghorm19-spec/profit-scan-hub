// Deletes the calling user's account, scans, profile, and storage objects.
// Uses the service role to call admin.deleteUser after verifying the JWT.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "missing auth" }, 401);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
    const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(SUPABASE_URL, ANON, { global: { headers: { Authorization: auth } } });
    const { data: userRes, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userRes.user) return json({ error: "unauthorized" }, 401);
    const userId = userRes.user.id;

    const admin = createClient(SUPABASE_URL, SERVICE);

    // Remove storage objects under the user's folder
    const { data: files } = await admin.storage.from("scans").list(userId, { limit: 1000 });
    if (files?.length) {
      await admin.storage.from("scans").remove(files.map((f) => `${userId}/${f.name}`));
    }
    // Remove DB rows (RLS bypassed by service role)
    await admin.from("scans").delete().eq("user_id", userId);
    await admin.from("profiles").delete().eq("id", userId);
    // Finally, delete the auth user
    const { error: delErr } = await admin.auth.admin.deleteUser(userId);
    if (delErr) return json({ error: delErr.message }, 500);

    return json({ ok: true });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
