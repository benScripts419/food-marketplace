import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";

import {
  loadAdminRiderPayouts,
  type AdminRiderPayoutAccount,
} from "@/lib/adminRiderPayout";
import { getFunctionErrorMessage } from "@/lib/paystack";
import { supabase } from "@/lib/supabase";

type Kind = "rider" | "restaurant";

type PayoutItem = {
  key: string;
  kind: Kind;
  id: string;
  orderId: string;
  payeeName: string;
  amount: number;
  status: string;
  note: string | null;
  createdAt: string | null;
  payTo: string | null;
};

// Statuses where money has NOT been sent, so the admin can act.
// Set this to true when you switch the PAYOUT_MODE secret to "automatic"
// (after Paystack upgrades the account). While false, nothing is sent
// automatically and the Retry button is hidden.
const AUTOMATIC_PAYOUTS = false;

const NEEDS_ACTION = ["failed", "needs_account", "reversed", "manual"];
const DONE = ["success", "paid"];

function errorText(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Unknown error";
}

function formatMoney(value: number) {
  return `GH₵${value.toFixed(2)}`;
}

function statusLabel(status: string): string {
  switch (status) {
    case "needs_account":
      return "needs a Mobile Money account";
    case "processing":
      return "sending";
    case "queued":
      return "sent, waiting for confirmation";
    case "success":
    case "paid":
      return "paid";
    case "manual":
      return "waiting for you to pay";
    case "failed":
      return "not sent";
    case "reversed":
      return "reversed";
    case "cancelled":
      return "cancelled";
    default:
      return status;
  }
}

const providerNames: Record<string, string> = {
  mtn: "MTN MoMo",
  telecel: "Telecel Cash",
  at: "AT Money",
};

function describeAccount(
  provider: string,
  accountName: string,
  phone: string,
): string {
  return `${providerNames[provider] ?? provider} · ${accountName} · ${phone}`;
}

export default function PayoutsManagement() {
  const [items, setItems] = useState<PayoutItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [workingKey, setWorkingKey] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    try {
      const [riderResult, restaurantResult] = await Promise.all([
        supabase
          .from("rider_payouts")
          .select(
            "id, order_id, rider_id, amount, status, gateway_response, created_at",
          )
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("restaurant_payouts")
          .select(
            "id, order_id, restaurant_id, amount, status, gateway_response, created_at",
          )
          .order("created_at", { ascending: false })
          .limit(50),
      ]);

      if (riderResult.error) throw riderResult.error;
      if (restaurantResult.error) throw restaurantResult.error;

      const riderRows = riderResult.data ?? [];
      const restaurantRows = restaurantResult.data ?? [];

      const riderIds = [
        ...new Set(riderRows.map((row) => String(row.rider_id))),
      ];
      const restaurantIds = [
        ...new Set(restaurantRows.map((row) => String(row.restaurant_id))),
      ];

      const [ridersResult, restaurantsResult, accountsResult] =
        await Promise.all([
          riderIds.length > 0
            ? supabase.from("riders").select("id, full_name").in("id", riderIds)
            : Promise.resolve({ data: [], error: null }),
          restaurantIds.length > 0
            ? supabase
                .from("restaurants")
                .select("id, name")
                .in("id", restaurantIds)
            : Promise.resolve({ data: [], error: null }),
          restaurantIds.length > 0
            ? supabase
                .from("restaurant_payout_accounts")
                .select("restaurant_id, provider, account_name, phone_number")
                .in("restaurant_id", restaurantIds)
            : Promise.resolve({ data: [], error: null }),
        ]);

      const riderNames = new Map(
        (ridersResult.data ?? []).map((row) => [
          String(row.id),
          (row.full_name as string | null) ?? "Rider",
        ]),
      );
      const restaurantNames = new Map(
        (restaurantsResult.data ?? []).map((row) => [
          String(row.id),
          String(row.name),
        ]),
      );
      const restaurantAccounts = new Map(
        (accountsResult.data ?? []).map((row) => [
          String(row.restaurant_id),
          describeAccount(
            String(row.provider),
            String(row.account_name),
            String(row.phone_number),
          ),
        ]),
      );

      // Rider accounts come through the admin function. If it can't be read,
      // the list still works without the "pay to" line.
      const riderAccounts = new Map<string, string>();
      try {
        const payouts = await loadAdminRiderPayouts();
        payouts.accounts.forEach((account: AdminRiderPayoutAccount) => {
          riderAccounts.set(
            account.rider_id,
            describeAccount(
              account.provider,
              account.account_name,
              account.phone_number,
            ),
          );
        });
      } catch (error) {
        console.error("Loading rider payout accounts failed:", error);
      }

      const built: PayoutItem[] = [
        ...riderRows.map((row) => ({
          key: `rider-${row.id}`,
          kind: "rider" as const,
          id: String(row.id),
          orderId: String(row.order_id),
          payeeName: riderNames.get(String(row.rider_id)) ?? "Rider",
          amount: Number(row.amount),
          status: String(row.status),
          note: (row.gateway_response as string | null) ?? null,
          createdAt: (row.created_at as string | null) ?? null,
          payTo: riderAccounts.get(String(row.rider_id)) ?? null,
        })),
        ...restaurantRows.map((row) => ({
          key: `restaurant-${row.id}`,
          kind: "restaurant" as const,
          id: String(row.id),
          orderId: String(row.order_id),
          payeeName:
            restaurantNames.get(String(row.restaurant_id)) ?? "Restaurant",
          amount: Number(row.amount),
          status: String(row.status),
          note: (row.gateway_response as string | null) ?? null,
          createdAt: (row.created_at as string | null) ?? null,
          payTo: restaurantAccounts.get(String(row.restaurant_id)) ?? null,
        })),
      ];

      const rank = (status: string) =>
        NEEDS_ACTION.includes(status) ? 0 : DONE.includes(status) ? 2 : 1;

      built.sort(
        (a, b) =>
          rank(a.status) - rank(b.status) ||
          (b.createdAt ?? "").localeCompare(a.createdAt ?? ""),
      );

      setItems(built);
    } catch (error) {
      console.error("Loading payouts failed:", error);
      setLoadError(errorText(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const retry = async (item: PayoutItem) => {
    setWorkingKey(item.key);

    try {
      const { data, error } =
        item.kind === "rider"
          ? await supabase.functions.invoke("retry-rider-payout", {
              body: { payoutId: item.id },
            })
          : await supabase.functions.invoke("arrive-at-pickup", {
              body: { orderId: item.orderId, action: "retry" },
            });

      if (error) throw new Error(await getFunctionErrorMessage(error));
      if (data?.error) throw new Error(data.error);

      await load();
      Alert.alert(
        "Retry sent",
        "Check the status in a moment. If it is still not sent, the reason is shown on the payout.",
      );
    } catch (error) {
      await load();
      Alert.alert("The transfer didn't go through", errorText(error));
    } finally {
      setWorkingKey(null);
    }
  };

  const markPaid = (item: PayoutItem) => {
    Alert.alert(
      "Mark as paid?",
      `Only do this after you have paid ${item.payeeName} ${formatMoney(item.amount)} yourself${
        item.payTo ? ` (${item.payTo})` : ""
      }. This stops any further retries.`,
      [
        { text: "Not yet", style: "cancel" },
        {
          text: "I've paid them",
          onPress: () => {
            void (async () => {
              setWorkingKey(item.key);
              const now = new Date().toISOString();

              try {
                const { data, error } =
                  item.kind === "rider"
                    ? await supabase
                        .from("rider_payouts")
                        .update({
                          status: "success",
                          gateway_response: "Paid manually by admin",
                          paid_at: now,
                          updated_at: now,
                        })
                        .eq("id", item.id)
                        .in("status", ["failed", "reversed", "manual"])
                        .select("id")
                    : await supabase
                        .from("restaurant_payouts")
                        .update({
                          status: "paid",
                          gateway_response: "Paid manually by admin",
                          paid_at: now,
                          updated_at: now,
                        })
                        .eq("id", item.id)
                        .in("status", ["failed", "needs_account", "manual"])
                        .select("id");

                if (error) throw error;
                if (!data || data.length === 0) {
                  throw new Error(
                    "The payout wasn't updated. It may have just changed, or this account isn't an admin.",
                  );
                }

                await load();
              } catch (error) {
                Alert.alert("Couldn't mark it as paid", errorText(error));
              } finally {
                setWorkingKey(null);
              }
            })();
          },
        },
      ],
    );
  };

  const attentionCount = items.filter((item) =>
    NEEDS_ACTION.includes(item.status),
  ).length;

  return (
    <View>
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="flex-1 pr-3 text-sm text-gray-600">
          {attentionCount > 0
            ? `${attentionCount} payout${attentionCount === 1 ? "" : "s"} still to pay`
            : "Every payout has been sent."}
        </Text>
        <Pressable
          onPress={() => void load()}
          disabled={loading}
          accessibilityLabel="Refresh payouts"
          className="h-9 w-9 items-center justify-center"
        >
          <Ionicons name="refresh-outline" size={20} color="#E53935" />
        </Pressable>
      </View>

      {loading ? (
        <View className="items-center py-10">
          <ActivityIndicator size="large" color="#E53935" />
        </View>
      ) : loadError ? (
        <View className="rounded-xl bg-red-50 p-4">
          <Text className="text-sm text-red-700">
            Couldn't load payouts: {loadError}. If this says permission denied,
            run admin-payouts.sql in Supabase.
          </Text>
        </View>
      ) : items.length === 0 ? (
        <View className="items-center rounded-2xl border border-gray-200 bg-white p-6">
          <Ionicons name="cash-outline" size={30} color="#E53935" />
          <Text className="mt-3 text-base font-bold text-gray-900">
            No payouts yet
          </Text>
          <Text className="mt-2 text-center text-sm text-gray-500">
            Restaurant payouts start when a rider arrives, and rider payouts
            when a delivery is completed.
          </Text>
        </View>
      ) : (
        items.map((item) => {
          const needsAction = NEEDS_ACTION.includes(item.status);
          const done = DONE.includes(item.status);
          const working = workingKey === item.key;

          return (
            <View
              key={item.key}
              className="mb-3 rounded-2xl border border-gray-200 bg-white p-4"
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-3">
                  <Text className="text-xs font-semibold uppercase text-gray-500">
                    {item.kind === "rider" ? "Rider" : "Restaurant"} · order #
                    {item.orderId.slice(0, 8).toUpperCase()}
                  </Text>
                  <Text className="mt-1 text-base font-bold text-gray-900">
                    {item.payeeName}
                  </Text>
                </View>
                <Text className="text-base font-bold text-red-600">
                  {formatMoney(item.amount)}
                </Text>
              </View>

              <Text
                className={`mt-2 text-xs font-semibold ${
                  done
                    ? "text-green-700"
                    : needsAction
                      ? "text-amber-600"
                      : "text-gray-600"
                }`}
              >
                {statusLabel(item.status)}
              </Text>

              {item.payTo ? (
                <Text className="mt-1 text-xs text-gray-600">
                  Pay to: {item.payTo}
                </Text>
              ) : null}

              {needsAction && item.note ? (
                <Text className="mt-1 text-xs text-gray-500">
                  Reason: {item.note}
                </Text>
              ) : null}

              {needsAction ? (
                working ? (
                  <ActivityIndicator className="mt-3" color="#E53935" />
                ) : (
                  <View className="mt-3 flex-row">
                    {AUTOMATIC_PAYOUTS ? (
                      <Pressable
                        onPress={() => void retry(item)}
                        className="mr-2 flex-1 items-center rounded-xl bg-red-600 py-3"
                      >
                        <Text className="text-sm font-bold text-white">
                          Retry transfer
                        </Text>
                      </Pressable>
                    ) : null}
                    <Pressable
                      onPress={() => markPaid(item)}
                      className={`flex-1 items-center rounded-xl py-3 ${
                        AUTOMATIC_PAYOUTS ? "bg-gray-100" : "bg-red-600"
                      }`}
                    >
                      <Text
                        className={`text-sm font-bold ${
                          AUTOMATIC_PAYOUTS ? "text-gray-700" : "text-white"
                        }`}
                      >
                        Mark as paid
                      </Text>
                    </Pressable>
                  </View>
                )
              ) : null}
            </View>
          );
        })
      )}
    </View>
  );
}
