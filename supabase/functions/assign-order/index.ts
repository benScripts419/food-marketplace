
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...cors,
      "Content-Type": "application/json",
    },
  });

type DispatchOrder = {
  id: string;
  total: number | null;
  restaurant: string | null;
  customer_address: string | null;
  payment_status: string | null;
  status: string;
  rider_id: string | null;
  rider_payout_fee: number | null;
  admin_confirmed_at: string | null;
};

type DispatchDriver = {
  id: string;
  name: string;
  phone: string | null;
  is_active: boolean;
};

const normalizePhone = (phone: string): string => {
  const digits = phone.replace(/\D/g, "");

  return digits.length === 10 && digits.startsWith("0")
    ? `233${digits.slice(1)}`
    : digits;
};

const isValidPhone = (phone: string): boolean =>
  /^\d{8,15}$/.test(phone);

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed." }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get(
    "SUPABASE_SERVICE_ROLE_KEY",
  );

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    console.error("Missing Supabase environment variables.");

    return json(
      { error: "Dispatch service is not configured." },
      500,
    );
  }

  const authorization = req.headers.get("Authorization");

  if (!authorization) {
    return json({ error: "Not signed in." }, 401);
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: {
      headers: { Authorization: authorization },
    },
  });

  const {
    data: { user },
    error: authError,
  } = await userClient.auth.getUser();

  if (authError || !user) {
    return json({ error: "Not signed in." }, 401);
  }

  const admin = createClient(
    supabaseUrl,
    serviceRoleKey,
  );

  // Only administrators can register riders or create offers.
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Admin profile lookup failed:", profileError);

    return json(
      { error: "Unable to verify admin access." },
      500,
    );
  }

  if (profile?.role !== "admin") {
    return json({ error: "Forbidden." }, 403);
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }

  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body)
  ) {
    return json({ error: "Invalid request body." }, 400);
  }

  const input = body as Record<string, unknown>;

  // Register or update a rider.
  if (input.action === "register_driver") {
    const { name, phone } = input;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof phone !== "string" ||
      !phone.trim()
    ) {
      return json(
        {
          error:
            "Driver name and WhatsApp number are required.",
        },
        400,
      );
    }

    const normalizedPhone = normalizePhone(phone);

    if (!isValidPhone(normalizedPhone)) {
      return json(
        {
          error:
            "Enter a valid WhatsApp number with country code.",
        },
        400,
      );
    }

    const {
      data: existingDrivers,
      error: existingDriversError,
    } = await admin
      .from("drivers")
      .select("id, phone");

    if (existingDriversError) {
      console.error(
        "Checking registered riders failed:",
        existingDriversError,
      );

      return json(
        { error: "Unable to check registered riders." },
        500,
      );
    }

    const existingDriver = (existingDrivers ?? []).find(
      (driver) =>
        normalizePhone(driver.phone ?? "") === normalizedPhone,
    );

    const driverWrite = existingDriver
      ? await admin
          .from("drivers")
          .update({
            name: name.trim(),
            phone: normalizedPhone,
            is_active: true,
          })
          .eq("id", existingDriver.id)
          .select("id, name, phone, is_active")
          .single()
      : await admin
          .from("drivers")
          .insert({
            name: name.trim(),
            phone: normalizedPhone,
            is_active: true,
          })
          .select("id, name, phone, is_active")
          .single();

    if (driverWrite.error || !driverWrite.data) {
      console.error("Saving rider failed:", driverWrite.error);

      return json(
        { error: "Unable to save rider." },
        500,
      );
    }

    return json({ driver: driverWrite.data });
  }

  // Validate the delivery offer request.
  const orderId = input.order_id;
  const driverId = input.driver_id;

  if (
    typeof orderId !== "string" ||
    !orderId.trim() ||
    typeof driverId !== "string" ||
    !driverId.trim()
  ) {
    return json(
      { error: "Order and rider are required." },
      400,
    );
  }

  // Fetch order and rider in parallel.
  const [
    { data: orderData, error: orderError },
    { data: driverData, error: driverError },
  ] = await Promise.all([
    admin
      .from("orders")
      .select(
        "id, total, restaurant, customer_address, payment_status, status, rider_id, rider_payout_fee, admin_confirmed_at",
      )
      .eq("id", orderId)
      .maybeSingle(),

    admin
      .from("drivers")
      .select("id, name, phone, is_active")
      .eq("id", driverId)
      .maybeSingle(),
  ]);

  if (orderError || driverError) {
    console.error("Dispatch lookup failed:", {
      orderError,
      driverError,
    });

    return json(
      { error: "Unable to load order or rider." },
      500,
    );
  }

  if (!orderData || !driverData) {
    return json(
      { error: "Order or rider not found." },
      404,
    );
  }

  // Explicit local types prevent property-access errors when
  // the generated Supabase database types are incomplete.
  const order = orderData as unknown as DispatchOrder;
  const driver = driverData as unknown as DispatchDriver;

  // Preserve the existing order eligibility rules.
   if (
    order.payment_status !== "paid" ||
    !["pending", "confirmed", "preparing", "ready"].includes(
      order.status,
    ) ||
    order.rider_id ||
    !order.admin_confirmed_at
  ) {
    return json(
      {
        error:
          "Only paid, confirmed, unassigned orders can be offered.",
      },
      409,
    );
  }

  if (!driver.is_active) {
    return json(
      { error: "The selected rider is inactive." },
      400,
    );
  }

  const driverPhone = normalizePhone(driver.phone ?? "");

  if (!isValidPhone(driverPhone)) {
    return json(
      {
        error:
          "The rider does not have a valid WhatsApp phone number.",
      },
      400,
    );
  }

  // Create the offer through the existing database RPC.
  const {
    data: assignmentId,
    error: offerError,
  } = await admin.rpc("create_driver_order_offer", {
    p_order_id: orderId,
    p_driver_id: driverId,
  });

  if (offerError || typeof assignmentId !== "string") {
    console.error(
      "Creating rider offer failed:",
      offerError,
    );

    return json(
      {
        error:
          offerError?.message ??
          "Unable to create the delivery offer.",
      },
      409,
    );
  }


    // rider_payout_fee already holds the rider's 80% share.
  const payout = Number(order.rider_payout_fee ?? 0);

  // The link carries the offer id, so the rider's app can accept or decline it.
  const riderOfferUrl =
    `akrobite://rider/order/${encodeURIComponent(orderId)}?assignmentId=${encodeURIComponent(assignmentId)}`;

  const message = [
    `Hello ${driver.name},`,
    "",
    "You have a new delivery offer from Akrobite.",
    "",
    `Order ID: ${orderId}`,
    `Restaurant: ${order.restaurant ?? "Not specified"}`,
    `Delivery address: ${order.customer_address ?? "View order details in the app"}`,
    `Your delivery payout share: GH₵${payout.toFixed(2)}`,
    "",
    "Open the Rider app to review this delivery:",
    riderOfferUrl,
    "",
    "Please review the order and accept or decline it in the app.",
    "",
    "Thank you,",
    "Akrobite",
  ].join("\n");

  // Generate a WhatsApp draft URL; this does not send automatically.
  const whatsappUrl =
    `https://wa.me/${driverPhone}?text=${encodeURIComponent(message)}`;

  return json({
    success: true,
    assignment_id: assignmentId,
    order_id: orderId,
    driver_id: driverId,
    whatsapp_url: whatsappUrl,
    message,
  });
});