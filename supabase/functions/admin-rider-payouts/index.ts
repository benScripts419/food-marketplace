
import { createClient } from "npm:@supabase/supabase-js@2";

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

type MobileMoneyProvider = keyof typeof providerBankCodes;

type RequestBody = {
  action?: string;
  riderId?: string;
  provider?: string;
  accountName?: string;
  phoneNumber?: string;
};

function jsonResponse(
  body: Record<string, unknown>,
  status = 200,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function normalizeGhanaPhoneNumber(value: string): string {
  let phone = value.trim().replace(/[\s()-]/g, "");

  if (phone.startsWith("+233")) {
    phone = `0${phone.slice(4)}`;
  } else if (phone.startsWith("233")) {
    phone = `0${phone.slice(3)}`;
  }

  return phone;
}

function isValidGhanaPhoneNumber(phone: string): boolean {
  return /^0\d{9}$/.test(phone);
}

function isMobileMoneyProvider(
  value: string,
): value is MobileMoneyProvider {
  return value in providerBankCodes;
}

async function createPaystackRecipient(input: {
  accountName: string;
  phoneNumber: string;
  provider: MobileMoneyProvider;
  riderId: string;
  secretKey: string;
}): Promise<string> {
  const response = await fetch(
    "https://api.paystack.co/transferrecipient",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + input.secretKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "mobile_money",
        name: input.accountName,
        account_number: input.phoneNumber,
        bank_code: providerBankCodes[input.provider],
        currency: "GHS",
        description: `AkroBite rider payout - ${input.riderId}`,
        metadata: {
          rider_id: input.riderId,
          application: "AkroBite",
        },
      }),
    },
  );

  const result = await response.json().catch(() => null);

  if (
    !response.ok ||
    !result?.status ||
    !result?.data?.recipient_code
  ) {
    throw new Error(
      result?.message ||
        "Paystack could not create the rider's transfer recipient.",
    );
  }

  return result.data.recipient_code as string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse(
      { error: "Method not allowed." },
      405,
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");

    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      throw new Error("Supabase environment variables are not configured.");
    }

    const authorization = req.headers.get("Authorization");

    if (!authorization) {
      return jsonResponse(
        { error: "Authentication is required." },
        401,
      );
    }

    // Verify the currently authenticated user.
    const userClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: {
            Authorization: authorization,
          },
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );

    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser();

    if (authError || !user) {
      return jsonResponse(
        { error: "Your session is invalid or has expired. Please sign in again." },
        401,
      );
    }

    // Use the service-role client only after verifying the caller.
    const adminClient = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );

    // Only administrators may list or configure rider payout accounts.
    const { data: callerProfile, error: profileError } =
      await adminClient
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

    if (profileError) {
      throw new Error("Could not verify administrator permissions.");
    }

    if (callerProfile?.role !== "admin") {
      return jsonResponse(
        { error: "You are not authorized to manage rider payout accounts." },
        403,
      );
    }

    const input = (await req.json()) as RequestBody;

    // ----------------------------------------------------
    // ACTION: LIST RIDERS AND THEIR PAYOUT ACCOUNTS
    // ----------------------------------------------------
    if (input.action === "list") {
      const [ridersResult, accountsResult] = await Promise.all([
        adminClient
          .from("profiles")
          .select("id, full_name, phone")
          .eq("role", "rider")
          .order("full_name", { ascending: true }),

        adminClient
          .from("rider_payout_accounts")
          .select("rider_id, provider, account_name, phone_number"),
      ]);

      if (ridersResult.error) {
        throw new Error(
          `Could not load riders: ${ridersResult.error.message}`,
        );
      }

      if (accountsResult.error) {
        throw new Error(
          `Could not load payout accounts: ${accountsResult.error.message}`,
        );
      }

      return jsonResponse({
        riders: ridersResult.data ?? [],
        accounts: accountsResult.data ?? [],
      });
    }

    // ----------------------------------------------------
    // ACTION: SAVE OR UPDATE A RIDER'S PAYOUT ACCOUNT
    // ----------------------------------------------------
    if (input.action === "save") {
      const riderId = input.riderId?.trim();
      const providerValue = input.provider?.trim().toLowerCase();
      const accountName = input.accountName?.trim();
      const rawPhoneNumber = input.phoneNumber?.trim();

      if (!riderId || !providerValue || !accountName || !rawPhoneNumber) {
        return jsonResponse(
          { error: "Rider, provider, account name, and phone number are required." },
          400,
        );
      }

      if (!isMobileMoneyProvider(providerValue)) {
        return jsonResponse(
          { error: "Unsupported mobile money provider." },
          400,
        );
      }

      if (accountName.length < 2 || accountName.length > 100) {
        return jsonResponse(
          { error: "Enter a valid mobile money account name." },
          400,
        );
      }

      const phoneNumber = normalizeGhanaPhoneNumber(rawPhoneNumber);

      if (!isValidGhanaPhoneNumber(phoneNumber)) {
        return jsonResponse(
          { error: "Enter a valid Ghanaian mobile number, for example 0241234567." },
          400,
        );
      }

      // Confirm that the selected profile is actually a rider.
      const { data: rider, error: riderError } = await adminClient
        .from("profiles")
        .select("id, full_name, role")
        .eq("id", riderId)
        .maybeSingle();

      if (riderError) {
        throw new Error("Could not verify the selected rider.");
      }

      if (!rider || rider.role !== "rider") {
        return jsonResponse(
          { error: "The selected rider does not exist or is not registered as a rider." },
          404,
        );
      }

      // Check whether this rider already has a payout account.
      const { data: existingAccount, error: existingError } =
        await adminClient
          .from("rider_payout_accounts")
          .select(
            "rider_id, provider, account_name, phone_number, recipient_code",
          )
          .eq("rider_id", riderId)
          .maybeSingle();

      if (existingError) {
        throw new Error(
          `Could not check the existing payout account: ${existingError.message}`,
        );
      }

      const sameAccount =
        existingAccount?.provider === providerValue &&
        existingAccount?.account_name === accountName &&
        existingAccount?.phone_number === phoneNumber &&
        Boolean(existingAccount?.recipient_code?.trim());

      // Avoid creating a new recipient when nothing has changed.
      if (sameAccount) {
        return jsonResponse({
          saved: true,
          riderId,
          provider: providerValue,
          phoneLastFour: phoneNumber.slice(-4),
          unchanged: true,
        });
      }

      if (!paystackSecretKey) {
        throw new Error(
          "PAYSTACK_SECRET_KEY is not configured in Supabase secrets.",
        );
      }

      // Create a Paystack recipient using THIS rider's details.
      // Never reuse another rider's recipient code.
      const recipientCode = await createPaystackRecipient({
        accountName,
        phoneNumber,
        provider: providerValue,
        riderId,
        secretKey: paystackSecretKey,
      });

      // Save the recipient against the selected rider's UUID.
      const { error: saveError } = await adminClient
        .from("rider_payout_accounts")
        .upsert(
          {
            rider_id: riderId,
            provider: providerValue,
            account_name: accountName,
            phone_number: phoneNumber,
            recipient_code: recipientCode,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "rider_id",
          },
        );

      if (saveError) {
        throw new Error(
          `Paystack recipient was created, but the payout account could not be saved: ${saveError.message}`,
        );
      }

      return jsonResponse({
        saved: true,
        riderId,
        provider: providerValue,
        phoneLastFour: phoneNumber.slice(-4),
      });
    }

    return jsonResponse(
      { error: "Invalid action. Use 'list' or 'save'." },
      400,
    );
  } catch (error) {
    console.error("admin-rider-payouts error:", error);

    return jsonResponse(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while managing rider payouts.",
      },
      500,
    );
  }
});


