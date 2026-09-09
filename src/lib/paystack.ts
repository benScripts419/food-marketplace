import { supabase } from "@/lib/supabase";

export type PaystackCartItem = {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  restaurantId: string;
  restaurantName: string;
};

export async function initializePaystackPayment(input: {
  cartItems: PaystackCartItem[];
  deliveryFee: number;
  serviceFee: number;
  deliveryOption: "standard" | "express";
}) {
  const { data, error } = await supabase.functions.invoke(
    "initialize-payment",
    { body: input },
  );

  if (error) throw new Error(error.message);
  if (!data?.authorization_url) {
    throw new Error(data?.error ?? "Paystack checkout URL was not returned.");
  }

  return data as {
    orderId: string;
    reference: string;
    authorization_url: string;
    access_code: string;
  };
}

export async function verifyPaystackPayment(
  reference: string,
  orderId: string,
) {
  const { data, error } = await supabase.functions.invoke(
    "verify-payment",
    { body: { reference, orderId } },
  );

  if (error) throw new Error(error.message);
  if (!data?.paid) {
    throw new Error(data?.message ?? "Payment has not been confirmed.");
  }

  return data as { paid: true; orderId: string; reference: string };
}
