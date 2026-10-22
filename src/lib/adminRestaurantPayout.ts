import { getFunctionErrorMessage } from "@/lib/paystack";
import type { MobileMoneyProvider } from "@/lib/riderPayout";
import { supabase } from "@/lib/supabase";

export type RestaurantPayoutAccount = {
  provider: MobileMoneyProvider;
  account_name: string;
  phone_number: string;
};

export async function loadRestaurantPayoutAccount(
  restaurantId: string,
): Promise<RestaurantPayoutAccount | null> {
  const { data, error } = await supabase
    .from("restaurant_payout_accounts")
    .select("provider, account_name, phone_number")
    .eq("restaurant_id", restaurantId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as RestaurantPayoutAccount | null) ?? null;
}

export async function saveRestaurantPayoutAccount(input: {
  restaurantId: string;
  provider: MobileMoneyProvider;
  accountName: string;
  phoneNumber: string;
}) {
  const { data, error } = await supabase.functions.invoke(
    "setup-restaurant-payout",
    { body: input },
  );

  if (error) {
    throw new Error(await getFunctionErrorMessage(error));
  }
  if (data?.error) {
    throw new Error(data.error);
  }
  if (!data?.saved) {
    throw new Error("The restaurant payout account was not saved.");
  }

  return data as {
    saved: true;
    restaurantId: string;
    provider: MobileMoneyProvider;
    phoneLastFour: string;
  };
}