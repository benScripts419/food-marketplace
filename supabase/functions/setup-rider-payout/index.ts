import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const providerBankCodes = {
  mtn: "MTN",
  telecel: "VOD",
  at: "ATL",
} as const;

type Provider = keyof typeof providerBankCodes;

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  try {
    const authorization = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const paystackSecret = Deno.env.get("PAYSTACK_SECRET_KEY");

    if (!authorization || !supabaseUrl || !anonKey || !serviceRoleKey || !paystackSecret) {
      return jsonResponse({ error: "Payout setup is not configured." }, 500);
    }

    const supabaseUser = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
    });
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return jsonResponse({ error: "Unauthorized." }, 401);
    }

    const body: unknown = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return jsonResponse({ error: "Invalid payout details." }, 400);
    }
    const { provider, accountName, phoneNumber } = body as Record<string, unknown>;
    if (
      typeof provider !== "string" ||
      !(provider in providerBankCodes) ||
      typeof accountName !== "string" ||
      !accountName.trim() ||
      typeof phoneNumber !== "string"
    ) {
      return jsonResponse({ error: "Enter a valid Mobile Money provider, account name, and phone number." }, 400);
    }

    const normalizedPhone = phoneNumber.replace(/\D/g, "");
    const localPhone = normalizedPhone.startsWith("233")
      ? `0${normalizedPhone.slice(3)}`
      : normalizedPhone;
    if (!/^0\d{9}$/.test(localPhone)) {
      return jsonResponse({ error: "Enter a valid Ghanaian Mobile Money number." }, 400);
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (profileError) {
      console.error("Rider profile lookup failed:", profileError);
      return jsonResponse({ error: "Unable to verify rider account." }, 500);
    }
    if (profile?.role !== "rider") {
      return jsonResponse({ error: "Only registered riders can set up payouts." }, 403);
    }

    const providerKey = provider as Provider;
    const paystackResponse = await fetch(
      "https://api.paystack.co/transferrecipient",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "mobile_money",
          name: accountName.trim(),
          account_number: localPhone,
          bank_code: providerBankCodes[providerKey],
          currency: "GHS",
        }),
      },
    );
    const paystackData = await paystackResponse.json();
    if (!paystackResponse.ok || !paystackData.status || !paystackData.data?.recipient_code) {
      console.error("Paystack recipient creation failed:", paystackData);
      return jsonResponse(
        { error: paystackData.message ?? "Could not verify this Mobile Money account." },
        502,
      );
    }

    const { error: saveError } = await supabaseAdmin
      .from("rider_payout_accounts")
      .upsert(
        {
          rider_id: user.id,
          provider: providerKey,
          account_name: accountName.trim(),
          phone_number: localPhone,
          recipient_code: paystackData.data.recipient_code,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "rider_id" },
      );
    if (saveError) {
      console.error("Saving rider payout account failed:", saveError);
      return jsonResponse({ error: "Paystack accepted the account, but saving it failed. Please retry." }, 500);
    }

    return jsonResponse({
      saved: true,
      provider: providerKey,
      phoneLastFour: localPhone.slice(-4),
    });
  } catch (error) {
    console.error("Rider payout setup failed:", error);
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Unexpected server error." },
      500,
    );
  }
});
