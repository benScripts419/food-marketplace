import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

type CateringRequest = {
  id: string;
  user_id: string | null;
  name: string;
  phone: string;
  email: string | null;
  event_type: string;
  event_date: string | null;
  guests: number;
  location: string | null;
  details: string | null;
  status: string;
  created_at: string;
};

type AdminNotification = {
  id: string;
  request_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  email_status: "pending" | "sending" | "sent" | "failed";
  email_sent_at: string | null;
  email_error: string | null;
  created_at: string;
};

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatDate(value: string | null): string {
  if (!value) return "Not specified";
  const date = new Date(`${value.slice(0, 10)}T12:00:00Z`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const adminEmail = Deno.env.get("ADMIN_NOTIFICATION_EMAIL");
  const fromEmail = Deno.env.get("CATERING_FROM_EMAIL");

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing Supabase service environment variables.");
    return jsonResponse({ error: "Notification service is not configured." }, 500);
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  let requestId = "";
  try {
    const body = await req.json();
    requestId = typeof body?.requestId === "string" ? body.requestId.trim() : "";
  } catch {
    return jsonResponse({ error: "Invalid request body." }, 400);
  }

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) {
    return jsonResponse({ error: "A valid catering request ID is required." }, 400);
  }

  const { data: cateringRequest, error: requestError } = await supabaseAdmin
    .from("catering_requests")
    .select("id, user_id, name, phone, email, event_type, event_date, guests, location, details, status, created_at")
    .eq("id", requestId)
    .maybeSingle();

  if (requestError) {
    console.error("Catering request lookup failed:", requestError);
    return jsonResponse({ error: "Could not load catering request." }, 500);
  }

  if (!cateringRequest) {
    return jsonResponse({ error: "Catering request was not found." }, 404);
  }

  const request = cateringRequest as CateringRequest;
  const defaultTitle = "New BestPoint Catering request";
  const defaultMessage = `${request.name} submitted a ${request.event_type} catering request for ${request.guests} guests.`;

  let { data: notification, error: notificationError } = await supabaseAdmin
    .from("admin_notifications")
    .select("id, request_id, type, title, message, is_read, email_status, email_sent_at, email_error, created_at")
    .eq("request_id", requestId)
    .maybeSingle();

  if (notificationError) {
    console.error("Admin notification lookup failed:", notificationError);
    return jsonResponse({ error: "Could not load admin notification." }, 500);
  }

  // Defensive fallback in case the request trigger wasn't installed.
  if (!notification) {
    const { data: insertedNotification, error: insertNotificationError } =
      await supabaseAdmin
        .from("admin_notifications")
        .insert({
          request_id: requestId,
          type: "catering_request",
          title: defaultTitle,
          message: defaultMessage,
          email_status: "pending",
        })
        .select("id, request_id, type, title, message, is_read, email_status, email_sent_at, email_error, created_at")
        .single();

    if (insertNotificationError) {
      // A concurrent trigger/function may have inserted it; try reading it again.
      const retry = await supabaseAdmin
        .from("admin_notifications")
        .select("id, request_id, type, title, message, is_read, email_status, email_sent_at, email_error, created_at")
        .eq("request_id", requestId)
        .maybeSingle();

      if (retry.error || !retry.data) {
        console.error("Could not create admin notification:", insertNotificationError);
        return jsonResponse({ error: "Could not create admin notification." }, 500);
      }
      notification = retry.data as AdminNotification;
    } else {
      notification = insertedNotification as AdminNotification;
    }
  }

  const currentNotification = notification as AdminNotification;

  if (currentNotification.email_status === "sent") {
    return jsonResponse({ ok: true, emailSent: true, alreadySent: true });
  }

  const missingConfig = [
    !resendApiKey ? "RESEND_API_KEY" : null,
    !adminEmail ? "ADMIN_NOTIFICATION_EMAIL" : null,
    !fromEmail ? "CATERING_FROM_EMAIL" : null,
  ].filter(Boolean);

  if (missingConfig.length > 0) {
    const message = `Email not configured: ${missingConfig.join(", ")}`;
    await supabaseAdmin
      .from("admin_notifications")
      .update({ email_status: "failed", email_error: message })
      .eq("id", currentNotification.id);
    console.error(message);
    return jsonResponse({ ok: false, emailSent: false, error: message }, 500);
  }

  // Claim pending/failed notifications to avoid sending duplicate emails.
  const { data: claimed, error: claimError } = await supabaseAdmin
    .from("admin_notifications")
    .update({ email_status: "sending", email_error: null })
    .eq("id", currentNotification.id)
    .in("email_status", ["pending", "failed"])
    .select("id")
    .maybeSingle();

  if (claimError) {
    console.error("Could not claim email notification:", claimError);
    return jsonResponse({ error: "Could not prepare the email notification." }, 500);
  }

  if (!claimed) {
    const { data: latest } = await supabaseAdmin
      .from("admin_notifications")
      .select("email_status")
      .eq("id", currentNotification.id)
      .maybeSingle();

    return jsonResponse({
      ok: latest?.email_status === "sent",
      emailSent: latest?.email_status === "sent",
      skipped: true,
      status: latest?.email_status ?? "unknown",
    });
  }

  try {
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#171717">
        <div style="background:#b91f24;color:#fff;padding:20px 24px;border-radius:12px 12px 0 0">
          <h1 style="margin:0;font-size:22px">New BestPoint Catering request</h1>
          <p style="margin:8px 0 0">A new request has been saved in AkroBite.</p>
        </div>
        <div style="border:1px solid #e5e5e5;border-top:0;padding:22px 24px;border-radius:0 0 12px 12px">
          <h2 style="font-size:17px;margin:0 0 14px">Customer and event details</h2>
          <p><strong>Name:</strong> ${escapeHtml(request.name)}</p>
          <p><strong>Phone:</strong> ${escapeHtml(request.phone)}</p>
          <p><strong>Email:</strong> ${escapeHtml(request.email || "Not provided")}</p>
          <p><strong>Event:</strong> ${escapeHtml(request.event_type)}</p>
          <p><strong>Event date:</strong> ${escapeHtml(formatDate(request.event_date))}</p>
          <p><strong>Guests:</strong> ${escapeHtml(request.guests)}</p>
          <p><strong>Location:</strong> ${escapeHtml(request.location || "Not provided")}</p>
          <p><strong>Additional details:</strong><br/>${escapeHtml(request.details || "None provided").replaceAll("\n", "<br/>")}</p>
          <p style="color:#737373;font-size:12px;margin-top:24px">Request ID: ${escapeHtml(request.id)}</p>
        </div>
      </div>`;

    const text = [
      "New BestPoint Catering request",
      `Name: ${request.name}`,
      `Phone: ${request.phone}`,
      `Email: ${request.email || "Not provided"}`,
      `Event: ${request.event_type}`,
      `Event date: ${formatDate(request.event_date)}`,
      `Guests: ${request.guests}`,
      `Location: ${request.location || "Not provided"}`,
      `Additional details: ${request.details || "None provided"}`,
      `Request ID: ${request.id}`,
    ].join("\n");

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [adminEmail],
        subject: `New catering request: ${request.event_type} — ${request.name}`,
        html,
        text,
        ...(request.email ? { reply_to: request.email } : {}),
      }),
    });

    const resendResult = await resendResponse.json().catch(() => ({}));
    if (!resendResponse.ok) {
      throw new Error(
        typeof resendResult?.message === "string"
          ? resendResult.message
          : `Email provider returned HTTP ${resendResponse.status}`,
      );
    }

    const { error: sentUpdateError } = await supabaseAdmin
      .from("admin_notifications")
      .update({
        email_status: "sent",
        email_sent_at: new Date().toISOString(),
        email_error: null,
      })
      .eq("id", currentNotification.id);

    if (sentUpdateError) {
      console.error("Email sent but notification status update failed:", sentUpdateError);
      return jsonResponse({ ok: true, emailSent: true, statusUpdateFailed: true });
    }

    console.log("Catering admin email sent", { requestId, notificationId: currentNotification.id });
    return jsonResponse({ ok: true, emailSent: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Email sending failed.";
    console.error("Catering admin email failed:", message);

    const { error: updateError } = await supabaseAdmin
      .from("admin_notifications")
      .update({ email_status: "failed", email_error: message.slice(0, 1000) })
      .eq("id", currentNotification.id);

    if (updateError) console.error("Could not record email failure:", updateError);

    return jsonResponse({ ok: false, emailSent: false, error: message }, 502);
  }
});
