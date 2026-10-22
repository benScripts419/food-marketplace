import { createClient } from "npm:@supabase/supabase-js@2";
import { verifyDispatchSender } from "../_shared/whatsappDispatch.ts";

type WhatsAppMessage = {
  from?: string;
  type?: string;
  button?: { payload?: string };
  interactive?: { button_reply?: { id?: string } };
};

type WhatsAppWebhookBody = {
  entry?: {
    changes?: {
      value?: { messages?: WhatsAppMessage[] };
    }[];
  }[];
};

const encoder = new TextEncoder();

async function generateSignature(secret: string, body: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  const hex = Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return `sha256=${hex}`;
}

function signaturesMatch(received: string, expected: string) {
  let mismatch = received.length ^ expected.length;
  for (let index = 0; index < Math.max(received.length, expected.length); index++) {
    mismatch |=
      (received.charCodeAt(index) || 0) ^ (expected.charCodeAt(index) || 0);
  }
  return mismatch === 0;
}

async function sendText(
  phoneNumberId: string,
  token: string,
  to: string,
  text: string,
) {
  const response = await fetch(
    `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: text },
      }),
    },
  );
  if (!response.ok) {
    console.error("Sending WhatsApp offer response failed:", await response.text());
  }
}


Deno.serve(async (req) => {
  const verifyToken = Deno.env.get("WHATSAPP_VERIFY_TOKEN");
  if (req.method === "GET") {
    const url = new URL(req.url);
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");
    if (!verifyToken) {
      return new Response("Webhook verification is not configured.", {
        status: 500,
      });
    }
    if (mode === "subscribe" && token === verifyToken && challenge) {
      return new Response(challenge);
    }
    return new Response("Forbidden", { status: 403 });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed.", { status: 405 });
  }

  const appSecret = Deno.env.get("WHATSAPP_APP_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
  const whatsappToken = Deno.env.get("WHATSAPP_TOKEN");
  if (!appSecret || !supabaseUrl || !serviceRoleKey || !phoneNumberId || !whatsappToken) {
    console.error("WhatsApp webhook environment is incomplete.");
    return new Response("Webhook is not configured.", { status: 500 });
  }

  const rawBody = await req.text();
  const receivedSignature = req.headers.get("x-hub-signature-256");
  const expectedSignature = await generateSignature(appSecret, rawBody);
  if (
    !receivedSignature ||
    !signaturesMatch(receivedSignature, expectedSignature)
  ) {
    return new Response("Invalid signature.", { status: 401 });
  }

  let body: WhatsAppWebhookBody;
  try {
    body = JSON.parse(rawBody) as WhatsAppWebhookBody;
  } catch (error) {
    console.error("Invalid WhatsApp webhook JSON:", error);
    return new Response("Invalid payload.", { status: 400 });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey);
  const messages =
    body.entry?.flatMap(
      (entry) =>
        entry.changes?.flatMap(
          (change) => change.value?.messages ?? [],
        ) ?? [],
    ) ?? [];

  for (const message of messages) {
    const payload =
      message.type === "button"
        ? message.button?.payload
        : message.type === "interactive"
          ? message.interactive?.button_reply?.id
          : undefined;
    const from = message.from;
    if (!payload || !from) continue;

    const separator = payload.indexOf(":");
    if (separator < 0) continue;
    const action = payload.slice(0, separator);
    const assignmentId = payload.slice(separator + 1);
    if (
      !["accept", "decline"].includes(action) ||
      !/^[0-9a-f-]{36}$/i.test(assignmentId)
    ) {
      continue;
    }

    try {
      await verifyDispatchSender(phoneNumberId, whatsappToken);
    } catch (error) {
      console.error("WhatsApp response sender verification failed:", error);
      continue;
    }

    const { data: outcome, error } = await admin.rpc(
      "respond_to_driver_order_offer",
      {
        p_assignment_id: assignmentId,
        p_driver_phone: from,
        p_response: action,
      },
    );
    if (error) {
      console.error("Driver response could not be recorded:", error);
      continue;
    }

    const messageText =
      outcome === "accepted"
        ? "Order accepted. You may now proceed to the pickup location."
        : outcome === "declined"
          ? "Order declined. It will return to dispatch for another driver."
          : "This delivery offer is no longer available.";
    await sendText(phoneNumberId, whatsappToken, from, messageText);
  }

  return new Response("OK");
});
