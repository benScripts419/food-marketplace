import { router } from "expo-router";
import { Pressable, Text, View, Image } from "react-native";

import { useWebAuth } from "@/context/WebAuthContext";

const footerLinks = [
  { label: "Home", path: "/(tabs)" as const },
  { label: "Restaurants", path: "/(tabs)/restaurants" as const },
  { label: "Search", path: "/(tabs)/search" as const },
  { label: "Orders", path: "/(tabs)/orders" as const },
  { label: "Delivery areas", path: "/location" as const },
];

export default function WebSiteFooter() {
  const { user, loading } = useWebAuth();

  return (
    <View className="w-full border-t border-border bg-white">
      <View className="mx-auto w-full max-w-[1280px] px-4 py-7 sm:px-6 sm:py-8 lg:px-12">
        {/* Responsive footer sections */}
        <View className="flex-col gap-7 md:flex-row md:flex-wrap md:justify-between md:gap-8">
          {/* Brand and description */}
          <View className="w-full max-w-[320px]">
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

            <Text className="mt-2 text-sm leading-5 text-textSecondary">
              Discover local restaurants and enjoy good food, delivered around
              Akropong.
            </Text>
          </View>

          {/* Explore links */}
          <View className="w-full md:w-auto">
            <Text className="mb-3 text-xs font-bold uppercase tracking-wide text-text">
              Explore
            </Text>

            <View className="flex-row flex-wrap gap-x-5 gap-y-3">
              {footerLinks.map((link) => (
                <Pressable
                  key={link.label}
                  onPress={() => router.push(link.path)}
                  accessibilityRole="link"
                  accessibilityLabel={link.label}
                  className="py-1"
                >
                  <Text className="text-sm text-textSecondary">
                    {link.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Account links */}
          {!loading && (
            <View className="w-full md:w-auto">
              <Text className="mb-3 text-xs font-bold uppercase tracking-wide text-text">
                Your account
              </Text>

              <View className="flex-row flex-wrap gap-x-5 gap-y-3">
                <Pressable
                  onPress={() =>
                    router.push(user ? "/(tabs)/profile" : "/login")
                  }
                  accessibilityRole="link"
                  accessibilityLabel={user ? "View your profile" : "Sign in"}
                  className="py-1"
                >
                  <Text className="text-sm text-textSecondary">
                    {user ? "View your profile" : "Sign in"}
                  </Text>
                </Pressable>

                {!user && (
                  <Pressable
                    onPress={() => router.push("/signup")}
                    accessibilityRole="link"
                    accessibilityLabel="Create account"
                    className="py-1"
                  >
                    <Text className="text-sm text-textSecondary">
                      Create account
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Copyright */}
        <View className="mt-7 border-t border-border pt-4">
          <Text className="text-xs leading-5 text-textSecondary">
            © {new Date().getFullYear()} AkroBite. All rights reserved.
          </Text>
        </View>
      </View>
    </View>
  );
}
