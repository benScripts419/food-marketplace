import { getFunctionErrorMessage } from "@/lib/paystack";
import { supabase } from "@/lib/supabase";
import type { MobileMoneyProvider } from "@/lib/riderPayout";

export type AdminRiderPayoutProfile = {
  id: string;
  full_name: string | null;
  phone: string | null;
};

export type AdminRiderPayoutAccount = {
  rider_id: string;
  provider: MobileMoneyProvider;
  account_name: string;
  phone_number: string;
};

async function invokeAdminPayouts(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke(
    "admin-rider-payouts",
    { body },
  );
  if (error) {
    throw new Error(await getFunctionErrorMessage(error));
  }
  if (data?.error) {
    throw new Error(data.error);
  }
  return data;
}

export async function loadAdminRiderPayouts() {
  const data = await invokeAdminPayouts({ action: "list" });
  return data as {
    riders: AdminRiderPayoutProfile[];
    accounts: AdminRiderPayoutAccount[];
  };
}

export async function saveAdminRiderPayout(input: {
  riderId: string;
  provider: MobileMoneyProvider;
  accountName: string;
  phoneNumber: string;
}) {
  const data = await invokeAdminPayouts({ action: "save", ...input });
  if (!data?.saved) {
    throw new Error("Rider payout details were not saved.");
  }
  return data as {
    saved: true;
    riderId: string;
    provider: MobileMoneyProvider;
    phoneLastFour: string;
  };
}
