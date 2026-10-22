import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type OrderRow = {
  id: string;
  user_id: string | null;
  customer_id: string | null;
  restaurant: string | null;
  total: number;
  payment_status: string;
  payment_reference: string | null;
  status: string;
  rider_id: string | null;
  customer_email: string | null;
  refund_status: string | null;
  cancellation_reason: string | null;
};

type ChannelResult = {
  status: "sent" | "failed" | "not_configured" | "no_recipient";
  detail?: string;
};

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

async function sendEmail(
  apiKey: string | undefined,
  sender: string | undefined,
  recipient: string | null,
  customerName: string,
  order: OrderRow,
  refundMessage: string,
): Promise<ChannelResult> {
  if (!recipient) return { status: "no_recipient" };
  if (!apiKey || !sender) {
    return {
      status: "not_configured",
      detail: "Set RESEND_API_KEY and RESEND_FROM_EMAIL.",
    };
  }

  const orderCode = order.id.slice(0, 8).toUpperCase();
  const amount = `GH₵${Number(order.total).toFixed(2)}`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: sender,
      to: [recipient],
      subject: `AkroBite order #${orderCode} is unavailable`,
      text: [
        `Hi ${customerName},`,
        "",
        `We’re sorry, but your AkroBite order #${orderCode}${order.restaurant ? ` from ${order.restaurant}` : ""} is currently unavailable.`,
        `Order total: ${amount}.`,
        refundMessage,
      ].join("\n"),
      html: `<p>Hi ${escapeHtml(customerName)},</p><p>We’re sorry, but your AkroBite order <strong>#${orderCode}</strong>${order.restaurant ? ` from ${escapeHtml(order.restaurant)}` : ""} is currently unavailable.</p><p>Order total: <strong>${amount}</strong>.</p><p>${escapeHtml(refundMessage)}</p>`,
    }),
  });

  if (!response.ok) {
    const responseText = await response.text();
    console.error("Resend order-unavailable email failed:", responseText);
    return { status: "failed", detail: "Email provider rejected the message." };
  }

  return { status: "sent" };
}

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
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");

    if (!authorization || !supabaseUrl || !anonKey || !serviceRoleKey) {
      return jsonResponse({ error: "Order service is not configured." }, 500);
    }
    if (!paystackSecretKey) {
      return jsonResponse({ error: "Paystack refunds are not configured." }, 500);
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
    });
    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser();
    if (authError || !user) return jsonResponse({ error: "Unauthorized." }, 401);

    const admin = createClient(supabaseUrl, serviceRoleKey);
    const { data: adminProfile, error: adminProfileError } = await admin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (adminProfileError) {
      console.error("Admin role lookup failed:", adminProfileError);
      return jsonResponse({ error: "Unable to verify admin access." }, 500);
    }
    if (adminProfile?.role !== "admin") {
      return jsonResponse({ error: "Admins only." }, 403);
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ error: "Invalid request body." }, 400);
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return jsonResponse({ error: "Invalid request body." }, 400);
    }
    const orderId = (body as Record<string, unknown>).order_id;
    if (typeof orderId !== "string" || !orderId) {
      return jsonResponse({ error: "Order ID is required." }, 400);
    }

    const { data: order, error: orderError } = await admin
      .from("orders")
      .select(
        "id, user_id, customer_id, restaurant, total, payment_status, payment_reference, status, rider_id, customer_email, refund_status, cancellation_reason",
      )
      .eq("id", orderId)
      .maybeSingle();
    if (orderError) {
      console.error("Loading unavailable order failed:", orderError);
      return jsonResponse({ error: "Unable to load this order." }, 500);
    }
    if (!order) return jsonResponse({ error: "Order not found." }, 404);

    const orderRow = order as OrderRow;
    if (
      orderRow.cancellation_reason === "unavailable" ||
      orderRow.refund_status
    ) {
      return jsonResponse(
        {
          error: `This order has already entered refund processing (${orderRow.refund_status ?? "status unavailable"}).`,
        },
        409,
      );
    }

    if (
      orderRow.payment_status !== "paid" ||
      !orderRow.payment_reference ||
      orderRow.rider_id ||
      !["pending", "confirmed", "preparing", "ready"].includes(
        orderRow.status,
      )
    ) {
      return jsonResponse(
        {
          error:
            "Only paid orders that have not been assigned to a rider can be marked unavailable.",
        },
        409,
      );
    }

    const { data: claimedOrder, error: claimError } = await admin
      .from("orders")
      .update({
        status: "cancelled",
        cancellation_reason: "unavailable",
        refund_status: "processing",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .eq("payment_status", "paid")
      .is("refund_status", null)
      .is("rider_id", null)
      .in("status", ["pending", "confirmed", "preparing", "ready"])
      .select("id")
      .maybeSingle();
    if (claimError) {
      console.error("Claiming unavailable order failed:", claimError);
      return jsonResponse(
        { error: "Could not safely start the cancellation and refund." },
        500,
      );
    }
    if (!claimedOrder) {
      return jsonResponse(
        { error: "This order changed and can no longer be marked unavailable." },
        409,
      );
    }

    const { error: expireOffersError } = await admin
      .from("order_assignments")
      .update({ status: "expired" })
      .eq("order_id", orderId)
      .eq("status", "offered");
    if (expireOffersError) {
      console.error("Expiring driver offers for unavailable order failed:", expireOffersError);
    }

    let refundStatus = "unknown";
    let refundReference: string | null = null;
    let refundAccepted = false;
    let refundErrorMessage: string | null = null;

    try {
      const refundResponse = await fetch("https://api.paystack.co/refund", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transaction: orderRow.payment_reference,
          customer_note: `Order #${orderRow.id.slice(0, 8)} is unavailable.`,
          merchant_note: `Admin marked order #${orderRow.id} unavailable.`,
        }),
      });
      const refundPayload: unknown = await refundResponse.json();
      const payload =
        refundPayload && typeof refundPayload === "object"
          ? (refundPayload as Record<string, unknown>)
          : {};
      const refundData =
        payload.data && typeof payload.data === "object"
          ? (payload.data as Record<string, unknown>)
          : {};

      if (!refundResponse.ok || payload.status !== true) {
        refundStatus = "failed";
        refundErrorMessage =
          typeof payload.message === "string"
            ? payload.message
            : "Paystack did not accept the refund request.";
      } else {
        refundAccepted = true;
        refundStatus =
          refundData.status === "processed" ? "processed" : "pending";
        refundReference =
          typeof refundData.refund_reference === "string"
            ? refundData.refund_reference
            : null;
      }
    } catch (error) {
      console.error("Paystack refund request outcome is unknown:", error);
      refundErrorMessage =
        "We could not confirm whether Paystack accepted the request. Contact support before retrying.";
    }

    const refundMessage = refundAccepted
      ? "A full refund has been initiated to your original payment method. Processing time depends on your payment provider."
      : "We could not confirm that the automatic refund was accepted. AkroBite support will follow up.";

    const { error: refundRecordError } = await admin
      .from("orders")
      .update({
        refund_status: refundStatus,
        refund_reference: refundReference,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .eq("cancellation_reason", "unavailable");
    if (refundRecordError) {
      console.error("Saving refund status to order failed:", refundRecordError);
    }

    if (refundAccepted) {
      const { error: paymentUpdateError } = await admin
        .from("payments")
        .update({
          status: refundStatus === "processed" ? "refunded" : "refund_pending",
          updated_at: new Date().toISOString(),
        })
        .eq("reference", orderRow.payment_reference);
      if (paymentUpdateError) {
        console.error("Saving refund status to payment failed:", paymentUpdateError);
      }
    }

    let customerName = "AkroBite customer";
    if (orderRow.customer_id) {
      const { data: customer, error: customerError } = await admin
        .from("profiles")
        .select("full_name")
        .eq("id", orderRow.customer_id)
        .maybeSingle();
      if (customerError) {
        console.error("Loading unavailable-order customer failed:", customerError);
      } else if (customer) {
        customerName = customer.full_name || customerName;
      }
    }

    const email = await sendEmail(
      Deno.env.get("RESEND_API_KEY"),
      Deno.env.get("RESEND_FROM_EMAIL"),
      orderRow.customer_email,
      customerName,
      orderRow,
      refundMessage,
    ).catch((error: unknown) => {
      console.error("Order-unavailable email delivery threw:", error);
      return { status: "failed", detail: "Email delivery failed." } as const;
    });

    if (refundErrorMessage) {
      console.error("Order cancellation has a refund issue:", refundErrorMessage);
    }

    return jsonResponse({
      success: true,
      order_id: orderId,
      refund_status: refundStatus,
      refund_error: refundErrorMessage,
      notifications: { email },
      warning: refundRecordError
        ? "Refund was requested but its status could not be saved to the order."
        : null,
    });
  } catch (error) {
    console.error("Marking order unavailable failed:", error);
    return jsonResponse(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to mark the order unavailable.",
      },
      500,
    );
  }
});
