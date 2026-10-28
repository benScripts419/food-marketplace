import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import AdminGate from "@/components/admin/AdminGate";
import OrdersManagement from "@/components/admin/OrdersManagement";
import RestaurantCallTable from "@/components/admin/RestaurantCallTable";
import RiderContacts, {
  type RiderContact,
} from "@/components/admin/RiderContacts";
import RiderPayoutAccounts from "@/components/admin/RiderPayoutAccounts";
import { supabase } from "@/lib/supabase";

type AdminTab = "orders" | "restaurants" | "riders" | "catering" | "settings";

type CateringRequest = {
  id: string;
  user_id: string | null;
  name: string;
  phone: string;
  email: string | null;
  event_type: string;
  event_date: string | null;
  guests: number;
  location: string | null;
  details: string | null;
  status: string;
  created_at: string;
};

type AdminNotification = {
  id: string;
  request_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  email_status: "pending" | "sending" | "sent" | "failed";
  email_sent_at: string | null;
  email_error: string | null;
  created_at: string;
};

const tabs: {
  id: AdminTab;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { id: "orders", label: "Orders", icon: "receipt-outline" },
  { id: "restaurants", label: "Restaurants", icon: "restaurant-outline" },
  { id: "riders", label: "Riders", icon: "bicycle-outline" },
  { id: "catering", label: "Catering", icon: "calendar-outline" },
  { id: "settings", label: "Settings", icon: "settings-outline" },
];

const CATERING_STATUSES = [
  { value: "contacted", label: "Mark contacted" },
  { value: "quoted", label: "Mark quoted" },
  { value: "confirmed", label: "Confirm booking" },
  { value: "declined", label: "Decline" },
  { value: "completed", label: "Mark completed" },
] as const;

function formatDate(value: string | null | undefined): string {
  if (!value) return "Not specified";
  const parsed = new Date(`${value.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
}

function statusLabel(status: string): string {
  if (!status) return "New";
  return status.charAt(0).toUpperCase() + status.slice(1).replaceAll("_", " ");
}

function AdminContent() {
  const [activeTab, setActiveTab] = useState<AdminTab>("orders");
  const [riders, setRiders] = useState<RiderContact[]>([]);
  const [ridersError, setRidersError] = useState<string | null>(null);

  const [cateringRequests, setCateringRequests] = useState<CateringRequest[]>(
    [],
  );
  const [cateringLoading, setCateringLoading] = useState(false);
  const [cateringError, setCateringError] = useState<string | null>(null);
  const [updatingRequestId, setUpdatingRequestId] = useState<string | null>(
    null,
  );
  const [adminNotifications, setAdminNotifications] = useState<
    AdminNotification[]
  >([]);
  const [notificationsError, setNotificationsError] = useState<string | null>(
    null,
  );
  const [notificationBanner, setNotificationBanner] =
    useState<AdminNotification | null>(null);
  const [updatingNotificationId, setUpdatingNotificationId] = useState<
    string | null
  >(null);
  const [retryingEmailId, setRetryingEmailId] = useState<string | null>(null);
  const unreadNotificationCount = adminNotifications.filter(
    (item) => !item.is_read,
  ).length;

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

  const loadCateringRequests = useCallback(async () => {
    setCateringLoading(true);
    setCateringError(null);

    try {
      const { data, error } = await supabase
        .from("catering_requests")
        .select(
          "id, user_id, name, phone, email, event_type, event_date, guests, location, details, status, created_at",
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Could not load catering requests:", error);
        setCateringError(
          `Couldn't load catering requests: ${error.message}. Check the catering_requests RLS policies for admin SELECT access.`,
        );
        setCateringRequests([]);
        return;
      }

      setCateringRequests((data ?? []) as CateringRequest[]);
    } catch (err) {
      console.error("Unexpected error loading catering requests:", err);
      setCateringError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while loading catering requests.",
      );
    } finally {
      setCateringLoading(false);
    }
  }, []);

  const loadAdminNotifications = useCallback(async () => {
    setNotificationsError(null);

    const { data, error } = await supabase
      .from("admin_notifications")
      .select(
        "id, request_id, type, title, message, is_read, email_status, email_sent_at, email_error, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Could not load admin notifications:", error);
      setNotificationsError(
        `Couldn't load notifications: ${error.message}. Check the admin_notifications RLS policy and public.is_admin().`,
      );
      return;
    }

    setAdminNotifications((data ?? []) as AdminNotification[]);
  }, []);

  const markNotificationRead = useCallback(async (notificationId: string) => {
    setUpdatingNotificationId(notificationId);
    setNotificationsError(null);

    const { error } = await supabase
      .from("admin_notifications")
      .update({ is_read: true })
      .eq("id", notificationId);

    if (error) {
      console.error("Could not mark notification as read:", error);
      setNotificationsError(
        `Couldn't mark notification as read: ${error.message}`,
      );
      setUpdatingNotificationId(null);
      return;
    }

    setAdminNotifications((current) =>
      current.map((item) =>
        item.id === notificationId ? { ...item, is_read: true } : item,
      ),
    );
    setUpdatingNotificationId(null);
  }, []);

  const retryCateringEmail = useCallback(
    async (notification: AdminNotification) => {
      if (retryingEmailId || !notification.request_id) return;
      setRetryingEmailId(notification.id);
      setNotificationsError(null);

      try {
        const { data, error } = await supabase.functions.invoke(
          "notify-catering-admin",
          {
            body: { requestId: notification.request_id },
          },
        );

        if (error) throw error;
        if (data?.emailSent !== true) {
          throw new Error(
            data?.error || `Email status: ${data?.status ?? "not confirmed"}`,
          );
        }

        await loadAdminNotifications();
      } catch (error) {
        console.error("Could not retry catering email:", error);
        setNotificationsError(
          error instanceof Error
            ? `Email retry failed: ${error.message}`
            : "Email retry failed.",
        );
        await loadAdminNotifications();
      } finally {
        setRetryingEmailId(null);
      }
    },
    [loadAdminNotifications, retryingEmailId],
  );

  const updateCateringStatus = useCallback(
    async (requestId: string, status: string) => {
      setUpdatingRequestId(requestId);
      setCateringError(null);

      try {
        const { error } = await supabase
          .from("catering_requests")
          .update({ status })
          .eq("id", requestId);

        if (error) {
          console.error("Could not update catering request status:", error);
          setCateringError(
            `Couldn't update request status: ${error.message}. Check the catering_requests RLS policies for admin UPDATE access.`,
          );
          return;
        }

        setCateringRequests((current) =>
          current.map((request) =>
            request.id === requestId ? { ...request, status } : request,
          ),
        );
      } catch (err) {
        console.error("Unexpected error updating catering request:", err);
        setCateringError(
          err instanceof Error
            ? err.message
            : "An unexpected error occurred while updating the request.",
        );
      } finally {
        setUpdatingRequestId(null);
      }
    },
    [],
  );

  useEffect(() => {
    void loadRiders();
    void loadAdminNotifications();
  }, [loadRiders, loadAdminNotifications]);

  useEffect(() => {
    if (activeTab === "catering") {
      void loadCateringRequests();
      void loadAdminNotifications();
    }
  }, [activeTab, loadCateringRequests, loadAdminNotifications]);

  useEffect(() => {
    const channel = supabase
      .channel("admin-catering-notifications-live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "admin_notifications" },
        (payload) => {
          const notification = payload.new as AdminNotification;
          setAdminNotifications((current) =>
            [
              notification,
              ...current.filter((item) => item.id !== notification.id),
            ].slice(0, 50),
          );
          setNotificationBanner(notification);
          void loadCateringRequests();
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "admin_notifications" },
        (payload) => {
          const notification = payload.new as AdminNotification;
          setAdminNotifications((current) =>
            current.map((item) =>
              item.id === notification.id ? notification : item,
            ),
          );
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadCateringRequests]);

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

      {notificationBanner ? (
        <Pressable
          onPress={() => {
            setActiveTab("catering");
            setNotificationBanner(null);
            void loadCateringRequests();
            void loadAdminNotifications();
          }}
          accessibilityRole="button"
          className="mx-4 mt-3 flex-row items-start rounded-xl border border-red-200 bg-red-50 p-3"
        >
          <Ionicons name="notifications-outline" size={20} color="#B91C1C" />
          <View className="ml-2 flex-1">
            <Text className="text-sm font-bold text-red-800">
              {notificationBanner.title}
            </Text>
            <Text className="mt-1 text-xs leading-4 text-red-700">
              {notificationBanner.message}
            </Text>
            <Text className="mt-1 text-xs font-bold text-red-800">
              Open Catering requests
            </Text>
          </View>
          <Pressable
            onPress={(event) => {
              event.stopPropagation();
              setNotificationBanner(null);
            }}
            accessibilityRole="button"
            accessibilityLabel="Dismiss notification"
            className="ml-2 p-1"
          >
            <Ionicons name="close" size={18} color="#B91C1C" />
          </Pressable>
        </Pressable>
      ) : null}

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
                {tab.id === "catering" && unreadNotificationCount > 0 ? (
                  <View className="ml-2 min-w-[20px] items-center rounded-full bg-white px-1.5 py-0.5">
                    <Text className="text-[10px] font-extrabold text-red-700">
                      {unreadNotificationCount > 99
                        ? "99+"
                        : unreadNotificationCount}
                    </Text>
                  </View>
                ) : null}
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

        {activeTab === "catering" && (
          <View>
            <View className="mb-4 flex-row items-center justify-between gap-3">
              <View className="flex-1">
                <Text className="text-xl font-bold text-gray-900">
                  BestPoint Catering Requests
                </Text>
                <Text className="mt-1 text-sm text-gray-500">
                  {cateringRequests.length} request
                  {cateringRequests.length === 1 ? "" : "s"}
                </Text>
              </View>
              <Pressable
                onPress={() => void loadCateringRequests()}
                disabled={cateringLoading}
                className="flex-row items-center rounded-lg border border-gray-200 bg-white px-3 py-2"
              >
                <Ionicons name="refresh-outline" size={16} color="#525252" />
                <Text className="ml-1 text-xs font-semibold text-gray-700">
                  Refresh
                </Text>
              </Pressable>
            </View>

            <View className="mb-5">
              <View className="mb-3 flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Ionicons
                    name="notifications-outline"
                    size={19}
                    color="#B91C1C"
                  />
                  <Text className="ml-2 text-base font-bold text-gray-900">
                    Admin notifications
                  </Text>
                </View>
                <Text className="text-xs font-semibold text-gray-500">
                  {unreadNotificationCount} unread
                </Text>
              </View>

              {notificationsError ? (
                <View className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <Text className="text-sm leading-5 text-amber-800">
                    {notificationsError}
                  </Text>
                </View>
              ) : null}

              {adminNotifications.length === 0 ? (
                <View className="rounded-xl border border-gray-200 bg-white p-4">
                  <Text className="text-sm text-gray-500">
                    No admin notifications yet.
                  </Text>
                </View>
              ) : (
                adminNotifications.slice(0, 10).map((notification) => (
                  <View
                    key={notification.id}
                    className={`mb-3 rounded-xl border p-4 ${
                      notification.is_read
                        ? "border-gray-200 bg-white"
                        : "border-red-200 bg-red-50"
                    }`}
                  >
                    <View className="flex-row items-start justify-between gap-3">
                      <View className="flex-1">
                        <Text className="text-sm font-bold text-gray-900">
                          {notification.title}
                        </Text>
                        <Text className="mt-1 text-sm leading-5 text-gray-700">
                          {notification.message}
                        </Text>
                        <Text className="mt-2 text-xs text-gray-500">
                          {formatDateTime(notification.created_at)}
                        </Text>
                      </View>
                      <View
                        className={`rounded-full px-2 py-1 ${
                          notification.email_status === "sent"
                            ? "bg-green-100"
                            : notification.email_status === "failed"
                              ? "bg-red-100"
                              : "bg-gray-100"
                        }`}
                      >
                        <Text
                          className={`text-[10px] font-bold ${
                            notification.email_status === "sent"
                              ? "text-green-800"
                              : notification.email_status === "failed"
                                ? "text-red-800"
                                : "text-gray-700"
                          }`}
                        >
                          Email {notification.email_status}
                        </Text>
                      </View>
                    </View>

                    {notification.email_error ? (
                      <Text className="mt-2 text-xs leading-4 text-red-700">
                        {notification.email_error}
                      </Text>
                    ) : null}

                    <View className="mt-3 flex-row flex-wrap gap-2">
                      {!notification.is_read ? (
                        <Pressable
                          onPress={() =>
                            void markNotificationRead(notification.id)
                          }
                          disabled={updatingNotificationId === notification.id}
                          className="rounded-lg border border-gray-200 bg-white px-3 py-2"
                        >
                          <Text className="text-xs font-semibold text-gray-700">
                            {updatingNotificationId === notification.id
                              ? "Saving…"
                              : "Mark as read"}
                          </Text>
                        </Pressable>
                      ) : null}
                      {notification.email_status === "failed" ? (
                        <Pressable
                          onPress={() => void retryCateringEmail(notification)}
                          disabled={retryingEmailId === notification.id}
                          className="rounded-lg bg-red-600 px-3 py-2"
                        >
                          <Text className="text-xs font-bold text-white">
                            {retryingEmailId === notification.id
                              ? "Retrying…"
                              : "Retry email"}
                          </Text>
                        </Pressable>
                      ) : null}
                    </View>
                  </View>
                ))
              )}
            </View>

            {cateringError ? (
              <View className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4">
                <Text
                  accessibilityRole="alert"
                  className="text-sm leading-5 text-red-700"
                >
                  {cateringError}
                </Text>
              </View>
            ) : null}

            {cateringLoading && cateringRequests.length === 0 ? (
              <View className="items-center rounded-2xl border border-gray-200 bg-white py-12">
                <ActivityIndicator size="large" color="#E53935" />
                <Text className="mt-3 text-sm text-gray-500">
                  Loading catering requests…
                </Text>
              </View>
            ) : cateringRequests.length === 0 ? (
              <View className="items-center rounded-2xl border border-gray-200 bg-white px-5 py-12">
                <Ionicons name="calendar-outline" size={38} color="#737373" />
                <Text className="mt-4 text-base font-bold text-gray-900">
                  No catering requests yet
                </Text>
                <Text className="mt-2 text-center text-sm leading-5 text-gray-500">
                  Requests submitted through the BestPoint Catering form will
                  appear here when the admin has permission to read them.
                </Text>
              </View>
            ) : (
              cateringRequests.map((request) => (
                <View
                  key={request.id}
                  className="mb-4 rounded-2xl border border-gray-200 bg-white p-4"
                >
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1">
                      <Text className="text-base font-bold text-gray-900">
                        {request.name}
                      </Text>
                      <Text className="mt-1 text-sm font-semibold text-red-700">
                        {request.event_type}
                      </Text>
                    </View>
                    <View className="rounded-full bg-gray-100 px-3 py-1">
                      <Text className="text-xs font-bold text-gray-700">
                        {statusLabel(request.status)}
                      </Text>
                    </View>
                  </View>

                  <View className="mt-4 gap-2">
                    <View className="flex-row items-start">
                      <Ionicons name="call-outline" size={16} color="#737373" />
                      <Text className="ml-2 flex-1 text-sm text-gray-700">
                        {request.phone}
                      </Text>
                    </View>
                    {request.email ? (
                      <View className="flex-row items-start">
                        <Ionicons
                          name="mail-outline"
                          size={16}
                          color="#737373"
                        />
                        <Text className="ml-2 flex-1 text-sm text-gray-700">
                          {request.email}
                        </Text>
                      </View>
                    ) : null}
                    <View className="flex-row items-start">
                      <Ionicons
                        name="people-outline"
                        size={16}
                        color="#737373"
                      />
                      <Text className="ml-2 flex-1 text-sm text-gray-700">
                        {request.guests} guests
                      </Text>
                    </View>
                    <View className="flex-row items-start">
                      <Ionicons
                        name="calendar-outline"
                        size={16}
                        color="#737373"
                      />
                      <Text className="ml-2 flex-1 text-sm text-gray-700">
                        Event date: {formatDate(request.event_date)}
                      </Text>
                    </View>
                    {request.location ? (
                      <View className="flex-row items-start">
                        <Ionicons
                          name="location-outline"
                          size={16}
                          color="#737373"
                        />
                        <Text className="ml-2 flex-1 text-sm text-gray-700">
                          {request.location}
                        </Text>
                      </View>
                    ) : null}
                    {request.details ? (
                      <View className="rounded-xl bg-gray-50 p-3">
                        <Text className="text-xs font-bold text-gray-600">
                          Additional details
                        </Text>
                        <Text className="mt-1 text-sm leading-5 text-gray-700">
                          {request.details}
                        </Text>
                      </View>
                    ) : null}
                    <Text className="text-xs text-gray-400">
                      Submitted {formatDateTime(request.created_at)}
                    </Text>
                  </View>

                  <View className="mt-4 border-t border-gray-100 pt-3">
                    <Text className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                      Update request status
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                      {CATERING_STATUSES.map((status) => {
                        const isCurrent = request.status === status.value;
                        const isUpdating = updatingRequestId === request.id;
                        return (
                          <Pressable
                            key={status.value}
                            disabled={isUpdating || isCurrent}
                            onPress={() =>
                              void updateCateringStatus(
                                request.id,
                                status.value,
                              )
                            }
                            className={`rounded-lg border px-3 py-2 ${
                              isCurrent
                                ? "border-green-200 bg-green-50"
                                : "border-gray-200 bg-white"
                            } ${isUpdating || isCurrent ? "opacity-50" : ""}`}
                          >
                            <Text
                              className={`text-xs font-semibold ${
                                isCurrent ? "text-green-700" : "text-gray-700"
                              }`}
                            >
                              {isUpdating ? "Saving…" : status.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === "settings" && (
          <View>
            <Text className="mb-4 text-xl font-bold text-gray-900">
              Admin Settings
            </Text>
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

export default function AdminScreen() {
  return (
    <AdminGate>
      <AdminContent />
    </AdminGate>
  );
}
