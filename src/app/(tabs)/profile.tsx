import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { useIsAdmin } from "@/lib/useIsAdmin";
import { supabase } from "@/lib/supabase";

type ProfileRow = {
  full_name: string | null;
  phone: string | null;
  role: string | null;
};

type ProfileOption = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress: () => void;
};

export default function ProfileScreen() {
  const { isAdmin, loading: loadingAdmin } = useIsAdmin();
  const [name, setName] = useState("Guest");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [editingName, setEditingName] = useState("");
  const [editingPhone, setEditingPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadProfile = async (authenticatedUser?: User | null) => {
      setLoadingProfile(true);
      try {
        let user = authenticatedUser;
        if (user === undefined) {
          const {
            data: { user: currentUser },
            error: userError,
          } = await supabase.auth.getUser();
          if (userError) throw userError;
          user = currentUser;
        }
        if (!user) {
          if (mounted) {
            setUserId(null);
            setName("Guest");
            setEmail("");
            setPhone("");
            setRole(null);
          }
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("full_name, phone, role")
          .eq("id", user.id)
          .maybeSingle();

        const profileRow = profile as ProfileRow | null;
        const metadata = user.user_metadata ?? {};
        const displayName =
          profileRow?.full_name ||
          metadata.full_name ||
          metadata.name ||
          metadata.first_name ||
          user.email?.split("@")[0] ||
          "Guest";

        if (mounted) {
          setUserId(user.id);
          setName(String(displayName));
          setEmail(user.email ?? "");
          setPhone(profileRow?.phone ?? "");
          setRole(profileRow?.role ?? null);
        }
      } catch (error) {
        console.error("Failed to load account profile:", error);
        if (mounted) {
          Alert.alert(
            "Profile unavailable",
            error instanceof Error
              ? error.message
              : "Could not load your account information.",
          );
        }
      } finally {
        if (mounted) setLoadingProfile(false);
      }
    };

    void loadProfile();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void loadProfile(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const openPersonalInformation = () => {
    setEditingName(name === "Guest" ? "" : name);
    setEditingPhone(phone);
    setProfileModalVisible(true);
  };

  const savePersonalInformation = async () => {
    const normalizedName = editingName.trim();
    const normalizedPhone = editingPhone.trim();
    const phoneDigits = normalizedPhone.replace(/\D/g, "");

    if (!userId) {
      Alert.alert("Sign in required", "Log in to update your profile.");
      return;
    }
    if (!normalizedName) {
      Alert.alert(
        "Name required",
        "Enter your full name to save your profile.",
      );
      return;
    }
    if (normalizedName.length > 100 || normalizedPhone.length > 30) {
      Alert.alert(
        "Check your details",
        "Name must be at most 100 characters and phone number at most 30 characters.",
      );
      return;
    }
    if (
      normalizedPhone &&
      (!/^\+?[\d\s().-]+$/.test(normalizedPhone) ||
        phoneDigits.length < 7 ||
        phoneDigits.length > 15)
    ) {
      Alert.alert(
        "Invalid phone number",
        "Enter a valid phone number with 7 to 15 digits, including the country code when applicable.",
      );
      return;
    }

    setSavingProfile(true);
    try {
      const { data: updatedProfile, error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: normalizedName,
          phone: normalizedPhone || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select("id")
        .maybeSingle();
      if (profileError) throw profileError;
      if (!updatedProfile) {
        throw new Error(
          "Your profile record could not be found. Sign out and sign in again, then retry.",
        );
      }

      setName(normalizedName);
      setPhone(normalizedPhone);
      setProfileModalVisible(false);

      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: normalizedName },
      });
      if (authError) {
        console.error("Could not synchronize account display name:", authError);
        Alert.alert(
          "Profile saved",
          "Your name and phone number were saved, but the account display name could not be synchronized.",
        );
      }
    } catch (error) {
      console.error("Failed to save account profile:", error);
      Alert.alert(
        "Could not save profile",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const openDeviceSettings = async () => {
    try {
      await Linking.openSettings();
    } catch (error) {
      console.error("Could not open device settings:", error);
      Alert.alert(
        "Settings unavailable",
        "Open your device settings manually to manage AkroBite permissions.",
      );
    }
  };

  const performLogout = async () => {
    setLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace("/login");
    } catch (error) {
      console.error("Failed to log out:", error);
      Alert.alert(
        "Logout failed",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setLoggingOut(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout failed:", error.message);
      return;
    }

    router.replace("/login");
  };

  const options: ProfileOption[] = [
    {
      icon: "person-outline",
      title: "Personal Information",
      onPress: openPersonalInformation,
    },
    {
      icon: "location-outline",
      title: "Delivery Location",
      onPress: () => router.push("/location"),
    },
    {
      icon: "card-outline",
      title: "Payment Methods",
      onPress: () => setPaymentModalVisible(true),
    },
    {
      icon: "help-circle-outline",
      title: "Help & Support",
      onPress: () => setHelpModalVisible(true),
    },
    {
      icon: "settings-outline",
      title: "Settings",
      onPress: () => void openDeviceSettings(),
    },
  ];

  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: 120,
        }}
      >
        <View className="w-full max-w-[700px] self-center">
          <Text className="text-2xl font-bold text-text">My Profile</Text>

          <Pressable
            onPress={openPersonalInformation}
            accessibilityRole="button"
            accessibilityLabel="View and edit personal information"
            className="mt-6 flex-row items-center"
          >
            <View className="h-16 w-16 items-center justify-center rounded-full bg-primary">
              {loadingProfile ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-xl font-bold text-white">{initial}</Text>
              )}
            </View>

            <View className="ml-4 flex-1">
              <Text className="text-lg font-bold text-text" numberOfLines={1}>
                {name}
              </Text>
              {email ? (
                <Text className="text-sm text-textSecondary" numberOfLines={1}>
                  {email}
                </Text>
              ) : null}
              {phone ? (
                <Text className="mt-0.5 text-xs text-textSecondary">
                  {phone}
                </Text>
              ) : null}
            </View>
            <Ionicons name="create-outline" size={20} color="#737373" />
          </Pressable>

          <View className="mt-8">
            {options.map((item) => (
              <Pressable
                key={item.title}
                onPress={item.onPress}
                accessibilityRole="button"
                className="flex-row items-center border-b border-border py-5"
              >
                <Ionicons name={item.icon} size={22} color="#171717" />
                <Text className="ml-4 flex-1 text-sm font-medium text-text">
                  {item.title}
                </Text>
                <Ionicons name="chevron-forward" size={18} color="#737373" />
              </Pressable>
            ))}

            {!loadingProfile && role === "rider" && (
              <Pressable
                onPress={() => router.push("/rider")}
                className="mt-2 flex-row items-center border-b border-border py-5"
              >
                <View className="h-9 w-9 items-center justify-center rounded-lg bg-red-50">
                  <Ionicons name="bicycle-outline" size={21} color="#E53935" />
                </View>

                <View className="ml-4 flex-1">
                  <Text className="text-sm font-bold text-text">
                    Rider Portal
                  </Text>
                  <Text className="mt-1 text-xs text-textSecondary">
                    Access your AkroBite rider account
                  </Text>
                </View>

                <Ionicons name="chevron-forward" size={18} color="#737373" />
              </Pressable>
            )}

            {!loadingProfile &&
              !loadingAdmin &&
              isAdmin &&
              role === "admin" && (
                <Pressable
                  onPress={() => router.push("/admin")}
                  className="flex-row items-center border-b border-border py-5"
                >
                  <View className="h-9 w-9 items-center justify-center rounded-lg bg-red-50">
                    <Ionicons
                      name="speedometer-outline"
                      size={21}
                      color="#E53935"
                    />
                  </View>
                  <View className="ml-4 flex-1">
                    <Text className="text-sm font-bold text-text">
                      Admin Dashboard
                    </Text>
                    <Text className="mt-1 text-xs text-textSecondary">
                      Manage delivery dispatch and rider payouts
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#737373" />
                </Pressable>
              )}

            <Pressable
              onPress={handleLogout}
              disabled={loggingOut}
              accessibilityRole="button"
              className="flex-row items-center py-5"
            >
              {loggingOut ? (
                <ActivityIndicator color="#E53935" />
              ) : (
                <Ionicons name="log-out-outline" size={22} color="#E53935" />
              )}
              <Text className="ml-4 flex-1 text-sm font-semibold text-primary">
                {loggingOut ? "Logging out..." : "Log out"}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={profileModalVisible}
        animationType="slide"
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <KeyboardAvoidingView
          className="flex-1 bg-white"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View className="flex-row items-center border-b border-border px-5 pb-4 pt-14">
            <Pressable
              onPress={() => setProfileModalVisible(false)}
              accessibilityRole="button"
              accessibilityLabel="Close personal information"
              className="h-10 w-10 items-center justify-center"
            >
              <Ionicons name="close" size={24} color="#171717" />
            </Pressable>
            <Text className="ml-3 text-xl font-bold text-text">
              Personal Information
            </Text>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ padding: 20 }}
          >
            <Text className="mb-2 text-sm font-semibold text-text">
              Full name
            </Text>
            <TextInput
              value={editingName}
              onChangeText={setEditingName}
              placeholder="Enter your full name"
              placeholderTextColor="#737373"
              autoCapitalize="words"
              maxLength={100}
              className="mb-5 h-[52px] rounded-xl border border-border px-4 text-base text-text"
            />

            <Text className="mb-2 text-sm font-semibold text-text">
              Email address
            </Text>
            <TextInput
              value={email}
              editable={false}
              className="mb-2 rounded-xl border border-border bg-surface px-4 py-4 text-base text-textSecondary"
            />
            <Text className="mb-5 text-xs leading-5 text-textSecondary">
              Email changes are managed by your sign-in provider.
            </Text>

            <Text className="mb-2 text-sm font-semibold text-text">
              Phone number
            </Text>
            <TextInput
              value={editingPhone}
              onChangeText={setEditingPhone}
              placeholder="Enter your phone number"
              placeholderTextColor="#737373"
              keyboardType="phone-pad"
              maxLength={30}
              className="mb-6 h-[52px] rounded-xl border border-border px-4 text-base text-text"
            />

            <Pressable
              onPress={() => void savePersonalInformation()}
              disabled={savingProfile}
              className={`h-14 items-center justify-center rounded-xl bg-primary ${
                savingProfile ? "opacity-60" : ""
              }`}
            >
              {savingProfile ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="font-bold text-white">Save changes</Text>
              )}
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={paymentModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="rounded-t-3xl bg-white px-5 pb-10 pt-5">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-xl font-bold text-text">
                Payment Methods
              </Text>
              <Pressable
                onPress={() => setPaymentModalVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Close payment information"
                className="h-10 w-10 items-center justify-center"
              >
                <Ionicons name="close" size={23} color="#171717" />
              </Pressable>
            </View>
            <Ionicons
              name="shield-checkmark-outline"
              size={32}
              color="#E53935"
            />
            <Text className="mt-3 text-sm leading-6 text-textSecondary">
              Payments are securely completed through Paystack at checkout.
              AkroBite does not currently store cards or mobile-money details in
              your profile.
            </Text>
            <Pressable
              onPress={() => {
                setPaymentModalVisible(false);
                router.push("/(tabs)/orders");
              }}
              className="mt-5 h-12 items-center justify-center rounded-xl bg-primary"
            >
              <Text className="font-bold text-white">View my orders</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={helpModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setHelpModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="rounded-t-3xl bg-white px-5 pb-10 pt-5">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-xl font-bold text-text">
                Help & Support
              </Text>
              <Pressable
                onPress={() => setHelpModalVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Close help"
                className="h-10 w-10 items-center justify-center"
              >
                <Ionicons name="close" size={23} color="#171717" />
              </Pressable>
            </View>

            <Text className="text-sm font-semibold text-text">
              Need an order update?
            </Text>
            <Text className="mt-1 text-sm leading-5 text-textSecondary">
              Open an order to view its status and delivery tracking details.
            </Text>
            <Pressable
              onPress={() => {
                setHelpModalVisible(false);
                router.push("/(tabs)/orders");
              }}
              className="mt-4 h-12 items-center justify-center rounded-xl bg-primary"
            >
              <Text className="font-bold text-white">Go to my orders</Text>
            </Pressable>

            <Text className="mt-5 text-xs leading-5 text-textSecondary">
              For account access problems, sign out and sign in again using the
              same provider you used to create your account.
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}
