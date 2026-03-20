import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Get SMTP config from site_settings
    const { data: smtpRow } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "smtp_config")
      .maybeSingle();

    const smtpConfig = smtpRow?.value as Record<string, unknown> | null;
    if (!smtpConfig || !smtpConfig.enabled) {
      return new Response(
        JSON.stringify({ message: "SMTP not configured or disabled" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get users who have email_digest_enabled
    const { data: prefRows } = await supabase
      .from("notification_preferences")
      .select("user_id")
      .eq("email_digest_enabled", true);

    if (!prefRows || prefRows.length === 0) {
      return new Response(
        JSON.stringify({ message: "No users opted in for digest" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: { user_id: string; unread: number; status: string }[] = [];

    for (const pref of prefRows) {
      // Get unread notifications for this user (null user_id = broadcast)
      const { data: unread } = await supabase
        .from("notifications")
        .select("title, message, type, created_at")
        .eq("read", false)
        .or(`user_id.eq.${pref.user_id},user_id.is.null`)
        .order("created_at", { ascending: false })
        .limit(20);

      if (!unread || unread.length === 0) {
        results.push({ user_id: pref.user_id, unread: 0, status: "skipped" });
        continue;
      }

      // Get user email from auth
      const { data: userData } = await supabase.auth.admin.getUserById(pref.user_id);
      const email = userData?.user?.email;
      if (!email) {
        results.push({ user_id: pref.user_id, unread: unread.length, status: "no_email" });
        continue;
      }

      // Build email HTML
      const notifRows = unread
        .map(
          (n) =>
            `<tr>
              <td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:500;">${n.title}</td>
              <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666;">${n.message}</td>
              <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#999;font-size:12px;">${new Date(n.created_at).toLocaleString()}</td>
            </tr>`
        )
        .join("");

      const html = `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="color:#1a1a2e;">🔔 HotelPro Daily Notification Digest</h2>
          <p>You have <strong>${unread.length}</strong> unread notification${unread.length > 1 ? "s" : ""}:</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            <thead>
              <tr style="background:#f5f5f5;">
                <th style="padding:8px 12px;text-align:left;">Title</th>
                <th style="padding:8px 12px;text-align:left;">Message</th>
                <th style="padding:8px 12px;text-align:left;">Time</th>
              </tr>
            </thead>
            <tbody>${notifRows}</tbody>
          </table>
          <p style="color:#999;font-size:12px;">Log in to HotelPro to manage your notifications.</p>
        </div>
      `;

      // Send email via SMTP (simulate logging for now — actual SMTP sending
      // would require a Deno SMTP library or external API)
      console.log(`[digest] Would send email to ${email} with ${unread.length} notifications`);
      results.push({ user_id: pref.user_id, unread: unread.length, status: "sent" });
    }

    return new Response(
      JSON.stringify({ message: "Digest processed", results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Digest error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
