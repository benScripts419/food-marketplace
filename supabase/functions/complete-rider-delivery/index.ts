import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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
      return jsonResponse({ error: "Delivery payout is not configured." }, 500);
    }

    const supabaseUser = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
    });
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return jsonResponse({ error: "Unauthorized." }, 401);
    }

    const body: unknown = await req.json();
    const orderId =
      body && typeof body === "object" && "orderId" in body
        ? body.orderId
        : undefined;
    if (typeof orderId !== "string") {
      return jsonResponse({ error: "Order ID is required." }, 400);
    }

    const { data: payouts, error: completionError } = await supabaseUser.rpc(
      "complete_rider_delivery",
      { p_order_id: orderId },
    );
    if (completionError) {
      return jsonResponse({ error: completionError.message }, 400);
    }
    const payout = payouts?.[0];
    if (!payout) {
      return jsonResponse({ error: "Delivery completion returned no payout." }, 500);
    }

    if (!payout.payout_created) {
      return jsonResponse({
        orderId,
        amount: Number(payout.payout_amount),
        status: payout.payout_status,
        transferReference: payout.payout_transfer_reference,
        alreadyProcessed: true,
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    const amountInPesewas = Math.round(Number(payout.payout_amount) * 100);
    if (!Number.isSafeInteger(amountInPesewas) || amountInPesewas <= 0) {
      await supabaseAdmin
        .from("rider_payouts")
        .update({
          status: "failed",
          gateway_response: "Calculated payout amount must be greater than zero.",
          updated_at: new Date().toISOString(),
        })
        .eq("id", payout.payout_id);
      return jsonResponse({ error: "Calculated rider payout must be greater than zero." }, 400);
    }

    const transferResponse = await fetch("https://api.paystack.co/transfer", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: "balance",
        amount: amountInPesewas,
        recipient: payout.payout_recipient_code,
        reference: payout.payout_transfer_reference,
        reason: `Rider payout for order ${orderId}`,
      }),
    });
    const transferData = await transferResponse.json();
    if (!transferResponse.ok || !transferData.status || !transferData.data?.transfer_code) {
      console.error("Paystack rider transfer failed:", transferData);
      await supabaseAdmin
        .from("rider_payouts")
        .update({
          status: "failed",
          gateway_response: transferData.message ?? "Paystack transfer failed.",
          raw_response: transferData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", payout.payout_id);
      return jsonResponse(
        {
          error: transferData.message ?? "Delivery completed, but the rider transfer failed.",
          orderId,
          payoutStatus: "failed",
        },
        502,
      );
    }

    const { error: updateError } = await supabaseAdmin
      .from("rider_payouts")
      .update({
        status: "queued",
        transfer_code: transferData.data.transfer_code,
        gateway_response: transferData.message ?? null,
        raw_response: transferData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payout.payout_id);
    if (updateError) {
      console.error("Saving Paystack transfer response failed:", updateError);
      return jsonResponse({
        orderId,
        amount: Number(payout.payout_amount),
        status: "processing",
        transferReference: payout.payout_transfer_reference,
        message: "Delivery completed; transfer status is being confirmed.",
      });
    }

    return jsonResponse({
      orderId,
      amount: Number(payout.payout_amount),
      status: "queued",
      transferReference: payout.payout_transfer_reference,
    });
  } catch (error) {
    console.error("Completing delivery payout failed:", error);
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Unexpected server error." },
      500,
    );
  }
});
