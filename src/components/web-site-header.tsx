import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { Pressable, Text, View } from "react-native";

const links = [
  { label: "Home", path: "/(tabs)" as const },
  { label: "Restaurants", path: "/restaurants" as const },
  { label: "Search", path: "/search" as const },
  { label: "Orders", path: "/orders" as const },
];

export default function WebSiteHeader() {
  const pathname = usePathname();

  if (
    pathname === "/" ||
    pathname === "/onboarding" ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password"
  ) {
    return null;
  }

  return (
    <View className="absolute left-0 right-0 top-0 z-50 border-b border-[#eee7dd] bg-[#fffdf9]">
      <View className="mx-auto w-full max-w-[1280px] flex-row items-center justify-between px-5 py-4 lg:px-12">
        <Pressable
          onPress={() => router.replace("/(tabs)")}
          className="flex-row items-center"
        >
          <View className="h-9 w-9 items-center justify-center rounded-full bg-primary">
            <Ionicons name="restaurant" size={17} color="#FFFFFF" />
          </View>
          <Text className="ml-2.5 text-base font-bold tracking-wide text-text">
            AkroBite
          </Text>
        </Pressable>

        <View className="hidden flex-row items-center gap-7 sm:flex">
          {links.map((link) => {
            const active =
              pathname === link.path || pathname.startsWith(`${link.path}/`);

            return (
              <Pressable
                key={link.label}
                onPress={() => router.push(link.path)}
                className="py-2"
              >
                <Text
                  className={`text-sm font-semibold ${active ? "text-primary" : "text-textSecondary"}`}
                >
                  {link.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => router.push("/restaurants")}
            className="h-10 w-10 items-center justify-center rounded-full bg-[#f4eee5]"
            accessibilityLabel="Open restaurants"
          >
            <Ionicons name="restaurant-outline" size={19} color="#171717" />
          </Pressable>
          <Pressable
            onPress={() => router.push("/cart")}
            className="h-10 w-10 items-center justify-center rounded-full bg-[#f4eee5]"
            accessibilityLabel="Open cart"
          >
            <Ionicons name="cart-outline" size={19} color="#171717" />
          </Pressable>
          <Pressable
            onPress={() => router.push("/login")}
            className="hidden h-10 flex-row items-center justify-center rounded-lg bg-primary px-4 sm:flex"
          >
            <Text className="text-sm font-bold text-white">Sign in</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
