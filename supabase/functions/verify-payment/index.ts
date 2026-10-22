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
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  try {
    // --------------------------------------------------
    // Environment variables
    // --------------------------------------------------

    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return jsonResponse({ error: "Missing authorization header." }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");

    if (
      !supabaseUrl ||
      !supabaseAnonKey ||
      !serviceRoleKey ||
      !paystackSecretKey
    ) {
      return jsonResponse(
        {
          error: "Required environment variables are missing.",
        },
        500,
      );
    }

    // --------------------------------------------------
    // Authenticate the user
    // --------------------------------------------------

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const {
      data: { user },
      error: userError,
    } = await supabaseUser.auth.getUser();

    if (userError || !user) {
      return jsonResponse({ error: "Unauthorized." }, 401);
    }

    // --------------------------------------------------
    // Read request
    // --------------------------------------------------

    const body = await req.json();

    const { reference, orderId } = body;

    if (typeof reference !== "string" || typeof orderId !== "string") {
      return jsonResponse(
        {
          error: "Reference and orderId are required.",
        },
        400,
      );
    }

    // --------------------------------------------------
    // Admin client
    // --------------------------------------------------

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // --------------------------------------------------
    // Get the order
    // --------------------------------------------------

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select(
        `
          id,
          user_id,
          total,
          payment_status,
          payment_reference
        `,
      )
      .eq("id", orderId)
      .eq("user_id", user.id)
      .single();

    if (orderError || !order) {
      return jsonResponse({ error: "Order not found." }, 404);
    }

    // --------------------------------------------------
    // Already paid?
    // --------------------------------------------------

    // This makes the endpoint safe to call more than once.
    if (
      order.payment_status === "paid" &&
      order.payment_reference === reference
    ) {
      return jsonResponse({
        paid: true,
        orderId,
        reference,
      });
    }

    // --------------------------------------------------
    // Make sure reference belongs to this order
    // --------------------------------------------------

    if (order.payment_reference !== reference) {
      return jsonResponse(
        {
          error: "Payment reference does not match the order.",
        },
        400,
      );
    }

    // --------------------------------------------------
    // Verify transaction with Paystack
    // --------------------------------------------------

    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(
        reference,
      )}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok) {
      console.error("Paystack verification failed:", paystackData);

      return jsonResponse(
        {
          error: paystackData?.message ?? "Unable to verify payment.",
        },
        502,
      );
    }

    const transaction = paystackData?.data;

    if (!transaction) {
      return jsonResponse({
        paid: false,
        message: "Payment transaction was not found.",
      });
    }

    // --------------------------------------------------
    // Validate Paystack reference
    // --------------------------------------------------

    if (transaction.reference !== reference) {
      return jsonResponse(
        {
          paid: false,
          message: "Paystack reference does not match.",
        },
        400,
      );
    }

    // --------------------------------------------------
    // Validate currency
    // --------------------------------------------------

    if (transaction.currency !== "GHS") {
      return jsonResponse(
        {
          paid: false,
          message: "Payment currency is invalid.",
        },
        400,
      );
    }

    // --------------------------------------------------
    // Validate amount
    // --------------------------------------------------

    // Paystack returns the amount in pesewas.
    const expectedAmount = Math.round(Number(order.total) * 100);

    const paidAmount = Number(transaction.amount);

    if (!Number.isFinite(paidAmount) || paidAmount !== expectedAmount) {
      console.error("Payment amount mismatch:", {
        expectedAmount,
        paidAmount,
        orderId,
        reference,
      });

      return jsonResponse(
        {
          paid: false,
          message: "Payment amount does not match the order.",
        },
        400,
      );
    }

    // --------------------------------------------------
    // Validate payment status
    // --------------------------------------------------

    if (transaction.status !== "success") {
      return jsonResponse({
        paid: false,
        message:
          transaction.gateway_response ?? "Payment has not been completed.",
      });
    }

    // --------------------------------------------------
    // Update payment record
    // --------------------------------------------------

    const { data: updatedPayment, error: paymentUpdateError } =
      await supabaseAdmin
        .from("payments")
        .update({
          status: "success",
          channel: transaction.channel ?? null,
          gateway_response: transaction.gateway_response ?? null,
          paid_at: transaction.paid_at ?? new Date().toISOString(),
          raw_response: paystackData,
          updated_at: new Date().toISOString(),
        })
        .eq("reference", reference)
        .eq("order_id", orderId)
        .select("id")
        .maybeSingle();

    if (paymentUpdateError || !updatedPayment) {
      console.error("Payment update error:", paymentUpdateError);

      return jsonResponse(
        {
          error:
            "Payment was verified, but the payment record could not be updated.",
        },
        500,
      );
    }

    // --------------------------------------------------
    // Update order
    // --------------------------------------------------

    const { data: updatedOrder, error: orderUpdateError } = await supabaseAdmin
      .from("orders")
      .update({
        payment_status: "paid",
        status: "confirmed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle();

    if (orderUpdateError || !updatedOrder) {
      console.error("Order update error:", orderUpdateError);

      return jsonResponse(
        {
          error: "Payment succeeded, but the order could not be updated.",
        },
        500,
      );
    }

    // --------------------------------------------------
    // Success
    // --------------------------------------------------

    return jsonResponse({
      paid: true,
      orderId,
      reference,
    });
  } catch (error) {
    console.error("Verify payment error:", error);

    return jsonResponse(
      {
        error:
          error instanceof Error ? error.message : "Unexpected server error.",
      },
      500,
    );
  }
});
