import { getFunctionErrorMessage } from "@/lib/paystack";
import { supabase } from "@/lib/supabase";

export type MobileMoneyProvider = "mtn" | "telecel" | "at";

export async function saveRiderPayoutMethod(input: {
  provider: MobileMoneyProvider;
  accountName: string;
  phoneNumber: string;
}) {
  const { data, error } = await supabase.functions.invoke(
    "setup-rider-payout",
    { body: input },
  );

  if (error) {
    throw new Error(await getFunctionErrorMessage(error));
  }
  if (!data?.saved) {
    throw new Error(data?.error ?? "Payout method was not saved.");
  }

  return data as {
    saved: true;
    provider: MobileMoneyProvider;
    phoneLastFour: string;
  };
}

export async function completeRiderDelivery(orderId: string) {
  const { data, error } = await supabase.functions.invoke(
    "complete-rider-delivery",
    { body: { orderId } },
  );

  if (error) {
    throw new Error(await getFunctionErrorMessage(error));
  }
  if (!data || typeof data.amount !== "number" || typeof data.status !== "string") {
    throw new Error(data?.error ?? "Delivery payout details were not returned.");
  }

  return data as {
    orderId: string;
    amount: number;
    status: string;
    transferReference: string;
    alreadyProcessed?: boolean;
  };
}

export async function markArrivedAtPickup(orderId: string) {
  const { data, error } = await supabase.functions.invoke("arrive-at-pickup", {
    body: { orderId },
  });

  if (error) {
    throw new Error(await getFunctionErrorMessage(error));
  }
  if (data?.error) {
    throw new Error(data.error);
  }

  return data as {
    orderId: string;
    status: string;
    alreadyProcessed?: boolean;
    payouts?: { restaurantId: string; status: string }[];
  };
}

export async function markPickedUp(orderId: string) {
  const { error } = await supabase.rpc("mark_picked_up", {
    p_order_id: orderId,
  });

  if (error) {
    throw new Error(error.message);
  }
}