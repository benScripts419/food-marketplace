import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import OrdersManagement from "@/components/admin/OrdersManagement";
import RestaurantCallTable from "@/components/admin/RestaurantCallTable";
import RiderContacts, {
  type RiderContact,
} from "@/components/admin/RiderContacts";
import RiderPayoutAccounts from "@/components/admin/RiderPayoutAccounts";
import { supabase } from "@/lib/supabase";

type AdminTab = "orders" | "restaurants" | "riders" | "settings";

const tabs: {
  id: AdminTab;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { id: "orders", label: "Orders", icon: "receipt-outline" },
  { id: "restaurants", label: "Restaurants", icon: "restaurant-outline" },
  { id: "riders", label: "Riders", icon: "bicycle-outline" },
  { id: "settings", label: "Settings", icon: "settings-outline" },
];

export default function AdminScreen() {
  const [activeTab, setActiveTab] = useState<AdminTab>("orders");
  const [riders, setRiders] = useState<RiderContact[]>([]);
  const [ridersError, setRidersError] = useState<string | null>(null);

  // Riders used to start as an empty list and were never loaded, so both the
  // Riders tab and the "assign rider" picker had nobody to show.
  // If your table isn't called "riders", change the name below.

  const loadRiders = useCallback(async () => {
    console.log("Loading riders from Supabase...");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      console.log("Authenticated user:", user?.id ?? null);
      console.log("Auth error:", authError?.message ?? null);

      const { data, error, status, statusText } = await supabase
        .from("riders")
        .select("*");

      console.log("Riders query status:", status, statusText);
      console.log("Riders query error:", error);
      console.log("Riders returned from Supabase:", data);
      console.log("Rider count:", data?.length ?? 0);

      if (error) {
        setRidersError(`Couldn't load riders: ${error.message}`);
        console.error("Could not load riders:", error);
        return;
      }

      setRidersError(null);
      setRiders((data ?? []) as RiderContact[]);
    } catch (err) {
      console.error("Unexpected error loading riders:", err);

      setRidersError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while loading riders.",
      );
    }
  }, []);

  useEffect(() => {
    void loadRiders();
  }, [loadRiders]);

  const handleRidersChanged = () => {
    void loadRiders();
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Admin header */}
      <View className="bg-white px-5 pb-5 pt-14">
        <Text className="text-2xl font-extrabold text-gray-900">
          Akrobite Admin
        </Text>
        <Text className="mt-1 text-sm text-gray-500">
          Manage your restaurant operations
        </Text>
      </View>

      {/* Tabs */}
      <View className="border-b border-gray-200 bg-white px-3">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            alignItems: "center",
            gap: 8,
            paddingVertical: 12,
          }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <Pressable
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                className={`flex-row items-center rounded-xl px-4 py-3 ${
                  isActive ? "bg-red-600" : "bg-gray-100"
                }`}
              >
                <Ionicons
                  name={tab.icon}
                  size={18}
                  color={isActive ? "#FFFFFF" : "#525252"}
                />
                <Text
                  className={`ml-2 text-sm font-bold ${
                    isActive ? "text-white" : "text-gray-700"
                  }`}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Tab content */}
      <ScrollView
        key={activeTab}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 20,
          paddingBottom: 40,
        }}
      >
        {activeTab === "orders" && (
          <View>
            <Text className="mb-4 text-xl font-bold text-gray-900">
              Order Management
            </Text>
            <OrdersManagement riders={riders} />
          </View>
        )}

        {activeTab === "restaurants" && (
          <View>
            <Text className="mb-4 text-xl font-bold text-gray-900">
              Restaurant Management
            </Text>
            <RestaurantCallTable />
          </View>
        )}

        {activeTab === "riders" && (
          <View>
            <Text className="mb-4 text-xl font-bold text-gray-900">
              Rider Management
            </Text>

            {ridersError ? (
              <View className="mb-4 rounded-xl bg-red-50 p-4">
                <Text
                  accessibilityRole="alert"
                  className="text-sm text-red-700"
                >
                  {ridersError}
                </Text>
              </View>
            ) : null}

            <RiderContacts riders={riders} onChanged={handleRidersChanged} />
            <RiderPayoutAccounts />
          </View>
        )}

        {activeTab === "settings" && (
          <View>
            <Text className="mb-4 text-xl font-bold text-gray-900">
              Admin Settings
            </Text>
            {/* Keep your existing settings sections here. */}
            <View className="rounded-2xl border border-gray-200 bg-white p-4">
              <Ionicons name="settings-outline" size={30} color="#E53935" />
              <Text className="mt-3 text-base font-bold text-gray-900">
                Settings
              </Text>
              <Text className="mt-2 text-sm leading-5 text-gray-500">
                Administrator preferences and configuration options.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
