import { createClient } from "jsr:@supabase/supabase-js@2";

// Paystack calls this function to report what happened to transfers and
// refunds. In the dashboard, turn OFF "Verify JWT" for this function:
// Paystack has no Supabase login. The signature check below protects it.

const encoder = new TextEncoder();

async function signBody(body: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const paystackSecret = Deno.env.get("PAYSTACK_SECRET_KEY");
  if (!supabaseUrl || !serviceRoleKey || !paystackSecret) {
    console.error("Webhook is not configured.");
    return new Response("Not configured", { status: 500 });
  }

  const rawBody = await req.text();
  const received = req.headers.get("x-paystack-signature") ?? "";
  const expected = await signBody(rawBody, paystackSecret);

  if (!received || !safeEqual(received, expected)) {
    console.error("Webhook signature did not match.");
    return new Response("Invalid signature", { status: 401 });
  }

  let event: { event?: string; data?: Record<string, unknown> };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey);
  const type = event.event ?? "";
  const data = event.data ?? {};
  const now = new Date().toISOString();

  console.log("PAYSTACK WEBHOOK", type, data.reference ?? data.transaction_reference);

  try {
    // ------------------------------------------------------------------
    // Transfers (rider and restaurant payouts)
    // ------------------------------------------------------------------
    if (
      type === "transfer.success" ||
      type === "transfer.failed" ||
      type === "transfer.reversed"
    ) {
      const reference = typeof data.reference === "string" ? data.reference : "";
      if (!reference) return new Response("ok");

      const succeeded = type === "transfer.success";
      const reason = typeof data.reason === "string" ? data.reason : type;

      // rider_payouts only accepts: processing, queued, success, failed, reversed.
      const riderPatch = {
        status: succeeded
          ? "success"
          : type === "transfer.reversed"
            ? "reversed"
            : "failed",
        gateway_response: succeeded ? "Transfer successful." : reason,
        ...(succeeded ? { paid_at: now } : {}),
        raw_response: event,
        updated_at: now,
      };

      // restaurant_payouts uses: needs_account, processing, queued, paid,
      // failed, cancelled.
      const restaurantPatch = {
        status: succeeded ? "paid" : "failed",
        gateway_response: succeeded ? "Transfer successful." : reason,
        ...(succeeded ? { paid_at: now } : {}),
        raw_response: event,
        updated_at: now,
      };

      // ilike so a lower-cased reference from Paystack still matches.
      const { error: riderError } = await admin
        .from("rider_payouts")
        .update(riderPatch)
        .ilike("transfer_reference", reference);
      if (riderError) throw riderError;

      const { error: restaurantError } = await admin
        .from("restaurant_payouts")
        .update(restaurantPatch)
        .ilike("transfer_reference", reference);
      if (restaurantError) throw restaurantError;

      return new Response("ok");
    }

    // ------------------------------------------------------------------
    // Refunds (customer money back after the admin cancels)
    // ------------------------------------------------------------------
    if (
      type === "refund.processed" ||
      type === "refund.failed" ||
      type === "refund.pending" ||
      type === "refund.processing"
    ) {
      const transaction = data.transaction as
        | { reference?: string }
        | undefined;
      const paymentReference =
        (typeof data.transaction_reference === "string"
          ? data.transaction_reference
          : undefined) ?? transaction?.reference;
      if (!paymentReference) {
        console.error("Refund event without a transaction reference:", event);
        return new Response("ok");
      }

      const refundReference =
        typeof data.refund_reference === "string"
          ? data.refund_reference
          : typeof data.reference === "string"
            ? data.reference
            : null;

      const patch =
        type === "refund.processed"
          ? {
              refund_status: "refunded",
              payment_status: "refunded",
              refund_reference: refundReference,
              updated_at: now,
            }
          : type === "refund.failed"
            ? { refund_status: "failed", updated_at: now }
            : { refund_status: "processing", updated_at: now };

      const { error } = await admin
        .from("orders")
        .update(patch)
        .eq("payment_reference", paymentReference);
      if (error) throw error;
      return new Response("ok");
    }

    // Any other event is fine to ignore.
    return new Response("ok");
  } catch (error) {
    // A non-200 reply makes Paystack try again later.
    console.error("Webhook handling failed:", error);
    return new Response("Error", { status: 500 });
  }
});