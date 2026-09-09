import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function WebSiteFooter() {
  return (
    <View className="border-t border-[#eee7dd] bg-[#fffdf9]">
      <View className="mx-auto w-full max-w-[1280px] flex-row flex-wrap items-center justify-between px-5 py-5 lg:px-12">
        <Text className="text-sm font-semibold text-text">AkroBite</Text>
        <View className="flex-row items-center gap-5">
          <Pressable onPress={() => router.push("/restaurants")}>
            <Text className="text-xs text-textSecondary">Restaurants</Text>
          </Pressable>
          <Pressable onPress={() => router.push("/location")}>
            <Text className="text-xs text-textSecondary">Delivery areas</Text>
          </Pressable>
          <Text className="text-xs text-textSecondary">© 2026 AkroBite</Text>
        </View>
      </View>
    </View>
  );
}
