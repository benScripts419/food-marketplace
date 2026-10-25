import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { useCart } from "@/context/CartContext";
import { verifyPaystackPayment } from "@/lib/paystack";
import { supabase } from "@/lib/supabase";

// Paystack sends the customer back here after they pay on the web:
//   /payment-complete?reference=AKROBITE-<order id>-<time>&trxref=...
// The order id is inside the payment reference, so nothing else is needed.

const REFERENCE_PATTERN = /^AKROBITE-([0-9a-fA-F-]{36})-\d+$/;

const CHECK_ATTEMPTS = 4;
const WAIT_BETWEEN_ATTEMPTS_MS = 2500;

const first = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function PaymentCompleteScreen() {
  const params = useLocalSearchParams<{
    reference?: string | string[];
    trxref?: string | string[];
  }>();

  const { clearCart, refreshOrders } = useCart();

  const reference = first(params.reference) ?? first(params.trxref) ?? "";
  const orderId = REFERENCE_PATTERN.exec(reference)?.[1] ?? null;

  const [message, setMessage] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const started = useRef(false);

  const check = async () => {
    if (!orderId) {
      setChecking(false);
      setMessage(
        "We couldn't find your payment details. If you paid, open My Orders to see your order.",
      );
      return;
    }

    setChecking(true);
    setMessage(null);

    // The bank can take a moment to confirm, so try a few times.
    let lastError = "";

    for (let attempt = 1; attempt <= CHECK_ATTEMPTS; attempt++) {
      try {
        const result = await verifyPaystackPayment(reference, orderId);

        if (result.paid) {
          // Paying for food finishes the cart. A delivery request has no cart.
          const { data: order } = await supabase
            .from("orders")
            .select("order_type")
            .eq("id", orderId)
            .maybeSingle();

          if (order?.order_type !== "delivery") {
            clearCart();
          }

          await refreshOrders();

          router.replace({
            pathname: "/orders/[id]",
            params: { id: orderId },
          });
          return;
        }
      } catch (error) {
        lastError =
          error instanceof Error
            ? error.message
            : "Could not check the payment.";
      }

      if (attempt < CHECK_ATTEMPTS) {
        await wait(WAIT_BETWEEN_ATTEMPTS_MS);
      }
    }

    setChecking(false);
    setMessage(
      lastError ||
        "Paystack has not confirmed this payment yet. If you completed it, wait a moment and try again.",
    );
  };

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <View className="w-full max-w-[480px] items-center">
        {checking ? (
          <>
            <ActivityIndicator size="large" color="#E53935" />
            <Text className="mt-4 text-center text-base font-semibold text-text">
              Confirming your payment...
            </Text>
            <Text className="mt-2 text-center text-sm text-textSecondary">
              Please don't close this page.
            </Text>
          </>
        ) : (
          <>
            <Text className="text-center text-lg font-bold text-text">
              Payment not confirmed yet
            </Text>

            {message ? (
              <Text className="mt-2 text-center text-sm leading-5 text-textSecondary">
                {message}
              </Text>
            ) : null}

            {orderId ? (
              <Pressable
                onPress={() => void check()}
                className="mt-6 w-full items-center rounded-xl bg-primary py-4"
              >
                <Text className="font-bold text-white">Check again</Text>
              </Pressable>
            ) : null}

            <Pressable
              onPress={() => router.replace("/(tabs)/orders")}
              className="mt-3 w-full items-center rounded-xl border border-primary bg-white py-4"
            >
              <Text className="font-bold text-primary">View my orders</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}
