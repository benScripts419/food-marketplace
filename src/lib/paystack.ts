
import { FunctionsHttpError } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";
import type { DeliveryLocation } from "@/lib/deliveryLocation";

export type PaystackCartItem = {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  restaurantId: string;
  restaurantName: string;
};

export type FreeItemSelection = {
  itemId: string;
  restaurantId: string;
};

export type InitializePaystackPaymentInput = {
  cartItems: PaystackCartItem[];
  deliveryOption: "standard" | "express";
  freeItemSelections?: FreeItemSelection[];
  deliveryLocation: DeliveryLocation;
  customer: {
    name: string;
    phone: string;
    altPhone?: string;
  };
};

export type InitializePaystackPaymentResult = {
  orderId: string;
  reference: string;
  total: number;
  currency: "GHS";
  authorization_url: string;
  access_code: string;
};

export async function getFunctionErrorMessage(
  error: Error
): Promise<string> {
  if (!(error instanceof FunctionsHttpError)) {
    return error.message;
  }

  try {
    const responseBody: unknown = await error.context.clone().json();

    if (responseBody && typeof responseBody === "object") {
      if (
        "error" in responseBody &&
        typeof responseBody.error === "string"
      ) {
        return responseBody.error;
      }

      if (
        "message" in responseBody &&
        typeof responseBody.message === "string"
      ) {
        return responseBody.message;
      }
    }
  } catch {
    return error.message;
  }

  return error.message;
}

export async function initializePaystackPayment(
  input: InitializePaystackPaymentInput
): Promise<InitializePaystackPaymentResult> {
  const { data, error } = await supabase.functions.invoke(
    "initialize-payment",
    {
      body: input,
    }
  );

  if (error) {
    throw new Error(await getFunctionErrorMessage(error));
  }

  if (!data?.authorization_url) {
    throw new Error(
      data?.error ?? "Paystack checkout URL was not returned."
    );
  }

  if (
    typeof data.orderId !== "string" ||
    typeof data.reference !== "string"
  ) {
    throw new Error(
      "Payment initialization returned an invalid order ID or reference."
    );
  }

  if (typeof data.total !== "number" || !Number.isFinite(data.total)) {
    throw new Error(
      "The server did not return a valid order total. Please try again."
    );
  }

  if (data.currency !== "GHS") {
    throw new Error(
      "The payment currency returned by the server is invalid."
    );
  }

  if (
    typeof data.authorization_url !== "string" ||
    !data.authorization_url.startsWith("https://")
  ) {
    throw new Error("Paystack returned an invalid checkout URL.");
  }

  return {
    orderId: data.orderId,
    reference: data.reference,
    total: data.total,
    currency: "GHS",
    authorization_url: data.authorization_url,
    access_code:
      typeof data.access_code === "string" ? data.access_code : "",
  };
}

export async function verifyPaystackPayment(
  reference: string,
  orderId: string
): Promise<{
  paid: true;
  orderId: string;
  reference: string;
}> {
  const { data, error } = await supabase.functions.invoke(
    "verify-payment",
    {
      body: {
        reference,
        orderId,
      },
    }
  );

  if (error) {
    throw new Error(await getFunctionErrorMessage(error));
  }

  if (!data?.paid) {
    throw new Error(
      data?.message ?? "Payment has not been confirmed."
    );
  }

  return {
    paid: true,
    orderId:
      typeof data.orderId === "string" ? data.orderId : orderId,
    reference:
      typeof data.reference === "string" ? data.reference : reference,
  };
}
