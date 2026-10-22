import { getFunctionErrorMessage } from "@/lib/paystack";
import { supabase } from "@/lib/supabase";
import type { DeliveryLocation } from "@/lib/deliveryLocation";

export type DeliveryPaymentInput = {
  // Which pickup the customer chose, for example "town:Akropong". The server
  // looks up the position itself.
  pickupKey: string;
  pickupAddress: string;
  restaurantName?: string;
  orderDetails?: string;
  itemCount: number;
  deliveryLocation: DeliveryLocation;
  customer: {
    name: string;
    phone: string;
  };
};

export async function initializeDeliveryPayment(input: DeliveryPaymentInput) {
  const { data, error } = await supabase.functions.invoke(
    "initialize-delivery-payment",
    { body: input },
  );

  if (error) {
    throw new Error(await getFunctionErrorMessage(error));
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  if (!data?.authorization_url) {
    throw new Error("Paystack checkout URL was not returned.");
  }

  return data as {
    orderId: string;
    reference: string;
    authorization_url: string;
    access_code: string;
    total: number;
    currency: string;
  };
}