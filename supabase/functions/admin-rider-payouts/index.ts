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

    if (!authorization || !supabaseUrl || !anonKey || !serviceRoleKey) {
      return jsonResponse({ error: "Admin rider payout service is not configured." }, 500);
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
    });
    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser();
    if (authError || !user) {
      return jsonResponse({ error: "Unauthorized." }, 401);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);
    const { data: callerProfile, error: callerError } = await admin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (callerError) {
      console.error("Admin role lookup failed:", callerError);
      return jsonResponse({ error: "Unable to verify admin access." }, 500);
    }
    if (callerProfile?.role !== "admin") {
      return jsonResponse({ error: "Admins only." }, 403);
    }

    const body: unknown = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return jsonResponse({ error: "Invalid request." }, 400);
    }

    const input = body as Record<string, unknown>;
    if (input.action === "list") {
      const { data: riders, error: ridersError } = await admin
        .from("profiles")
        .select("id, full_name, phone")
        .eq("role", "rider")
        .order("full_name");
      if (ridersError) {
        console.error("Loading rider profiles failed:", ridersError);
        return jsonResponse({ error: "Unable to load rider profiles." }, 500);
      }

      const riderIds = (riders ?? []).map((rider) => rider.id);
      const { data: accounts, error: accountsError } =
        riderIds.length > 0
          ? await admin
              .from("rider_payout_accounts")
              .select("rider_id, provider, account_name, phone_number")
              .in("rider_id", riderIds)
          : { data: [], error: null };
      if (accountsError) {
        console.error("Loading rider payout account status failed:", accountsError);
        return jsonResponse({ error: "Unable to load rider payout details." }, 500);
      }

      return jsonResponse({
        riders: riders ?? [],
        accounts: accounts ?? [],
      });
    }

    if (input.action !== "save") {
      return jsonResponse({ error: "Unsupported action." }, 400);
    }

    const { riderId, provider, accountName, phoneNumber } = input;
    if (
      typeof riderId !== "string" ||
      typeof provider !== "string" ||
      !Object.hasOwn(providerBankCodes, provider) ||
      typeof accountName !== "string" ||
      !accountName.trim() ||
      typeof phoneNumber !== "string"
    ) {
      return jsonResponse(
        { error: "Select a rider and enter a valid network, wallet name, and phone number." },
        400,
      );
    }

    const { data: rider, error: riderError } = await admin
      .from("profiles")
      .select("id")
      .eq("id", riderId)
      .eq("role", "rider")
      .maybeSingle();
    if (riderError) {
      console.error("Rider lookup failed:", riderError);
      return jsonResponse({ error: "Unable to verify rider profile." }, 500);
    }
    if (!rider) {
      return jsonResponse({ error: "Selected profile is not a registered rider." }, 404);
    }

    const normalizedPhone = phoneNumber.replace(/\D/g, "");
    const localPhone = normalizedPhone.startsWith("233")
      ? `0${normalizedPhone.slice(3)}`
      : normalizedPhone;
    if (!/^0\d{9}$/.test(localPhone)) {
      return jsonResponse({ error: "Enter a valid Ghanaian Mobile Money number." }, 400);
    }

    const paystackSecret = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecret) {
      return jsonResponse({ error: "Paystack recipient setup is not configured." }, 500);
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
    if (
      !paystackResponse.ok ||
      !paystackData.status ||
      typeof paystackData.data?.recipient_code !== "string"
    ) {
      console.error("Paystack rider recipient setup failed:", paystackData);
      return jsonResponse(
        { error: paystackData.message ?? "Could not verify this Mobile Money account." },
        502,
      );
    }

    const { error: saveError } = await admin
      .from("rider_payout_accounts")
      .upsert(
        {
          rider_id: riderId,
          provider: providerKey,
          account_name: accountName.trim(),
          phone_number: localPhone,
          recipient_code: paystackData.data.recipient_code,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "rider_id" },
      );
    if (saveError) {
      console.error("Saving admin-managed rider payout account failed:", saveError);
      return jsonResponse(
        { error: "Paystack accepted the account, but saving it failed. Please retry." },
        500,
      );
    }

    return jsonResponse({
      saved: true,
      riderId,
      provider: providerKey,
      phoneLastFour: localPhone.slice(-4),
    });
  } catch (error) {
    console.error("Admin rider payout request failed:", error);
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Unexpected server error." },
      500,
    );
  }
});
