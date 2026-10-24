import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View, Image } from "react-native";

import { useWebAuth } from "@/context/WebAuthContext";

const tabs = [
  { label: "Home", path: "/(tabs)" as const, href: "/" },
  { label: "Search", path: "/(tabs)/search" as const, href: "/search" },
  {
    label: "Restaurants",
    path: "/(tabs)/restaurants" as const,
    href: "/restaurants",
  },
  { label: "Cart", path: "/(tabs)/cart" as const, href: "/cart" },
  { label: "Orders", path: "/(tabs)/orders" as const, href: "/orders" },
  { label: "Profile", path: "/(tabs)/profile" as const, href: "/profile" },
];

export default function WebSiteHeader() {
  const pathname = usePathname();
  const { user, displayName, loading } = useWebAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = (
    path: (typeof tabs)[number]["path"] | "/login" | "/signup",
  ) => {
    setMenuOpen(false);
    router.push(path);
  };

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  const renderTabs = (mobile = false) =>
    tabs.map((tab) => {
      const active = isActive(tab.href);

      return (
        <Pressable
          key={tab.label}
          onPress={() => navigate(tab.path)}
          accessibilityRole="link"
          accessibilityState={{ selected: active }}
          className={
            mobile
              ? `w-full flex-row items-center rounded-xl px-4 py-3 ${
                  active ? "bg-red-50" : ""
                }`
              : "px-3 py-2"
          }
        >
          <Text
            className={`text-sm font-semibold ${
              active ? "text-primary" : "text-textSecondary"
            }`}
          >
            {tab.label}
          </Text>

          {mobile && active && (
            <View className="ml-auto">
              <Ionicons name="checkmark-circle" size={18} color="#E53935" />
            </View>
          )}

          {!mobile && active && (
            <View className="mx-3 mt-1 h-0.5 rounded-full bg-primary" />
          )}
        </Pressable>
      );
    });

  const renderAuthActions = (mobile = false) => {
    if (loading) return null;

    if (user) {
      return (
        <Pressable
          onPress={() => navigate("/(tabs)/profile")}
          accessibilityRole="link"
          accessibilityLabel="Open your profile"
          className={`h-10 items-center justify-center rounded-xl border border-primary px-4 ${
            mobile ? "w-full" : ""
          }`}
        >
          <Text className="text-sm font-bold text-primary" numberOfLines={1}>
            {mobile
              ? `My Profile${displayName ? ` · ${displayName}` : ""}`
              : displayName || "Profile"}
          </Text>
        </Pressable>
      );
    }

    return (
      <>
        <Pressable
          onPress={() => navigate("/login")}
          accessibilityRole="link"
          className={`h-10 items-center justify-center rounded-xl border border-primary px-4 ${
            mobile ? "flex-1" : ""
          }`}
        >
          <Text className="text-sm font-bold text-primary">Sign in</Text>
        </Pressable>

        <Pressable
          onPress={() => navigate("/signup")}
          accessibilityRole="link"
          className={`h-10 items-center justify-center rounded-xl bg-primary px-4 ${
            mobile ? "flex-1" : ""
          }`}
        >
          <Text className="text-sm font-bold text-white">Sign up</Text>
        </Pressable>
      </>
    );
  };

  return (
    <View className="z-50 w-full border-b border-border bg-white">
      <View className="mx-auto w-full max-w-[1280px] px-4 py-3 sm:px-6 lg:px-10">
        {/* Desktop header */}
        <View className="hidden flex-row items-center justify-between md:flex">
          <Pressable
            onPress={() => router.replace("/(tabs)")}
            accessibilityRole="link"
            accessibilityLabel="AkroBite home"
          >
            <Image
              source={require("../../assets/images/akrobite-logo.png")}
              resizeMode="contain"
              style={{
                width: 150,
                height: 48,
                flexGrow: 0,
                flexShrink: 0,
              }}
            />
          </Pressable>

          <View className="flex-row items-center">{renderTabs()}</View>

          <View className="flex-row items-center gap-2">
            {renderAuthActions()}
          </View>
        </View>

        {/* Mobile header */}
        <View className="md:hidden">
          <View className="min-h-11 flex-row items-center justify-between gap-3">
            <Pressable
              onPress={() => {
                setMenuOpen(false);
                router.replace("/(tabs)");
              }}
              accessibilityRole="link"
              accessibilityLabel="AkroBite home"
            >
              <Image
                source={require("../../assets/images/akrobite-logo.png")}
                resizeMode="contain"
                style={{
                  width: 120,
                  height: 40,
                  flexGrow: 0,
                  flexShrink: 0,
                }}
              />
            </Pressable>

            <View className="flex-1" />

            <Pressable
              onPress={() => setMenuOpen((previous) => !previous)}
              accessibilityRole="button"
              accessibilityLabel={
                menuOpen ? "Close navigation menu" : "Open navigation menu"
              }
              accessibilityState={{ expanded: menuOpen }}
              className="h-11 w-11 items-center justify-center rounded-xl border border-border"
            >
              <Ionicons
                name={menuOpen ? "close" : "menu"}
                size={26}
                color="#171717"
              />
            </Pressable>
          </View>

          {/* Expandable mobile navigation */}
          {menuOpen && (
            <View className="mt-3 rounded-2xl border border-border bg-white p-3">
              <Text className="mb-2 px-4 pt-2 text-xs font-bold uppercase tracking-widest text-textSecondary">
                Navigation
              </Text>

              <View className="gap-1">{renderTabs(true)}</View>

              {!loading && (
                <View className="mt-3 flex-row gap-2 border-t border-border pt-3">
                  {renderAuthActions(true)}
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
