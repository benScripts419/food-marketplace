import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type AppTab =
  "Home" | "Search" | "Restaurants" | "Cart" | "Orders" | "Profile";

export type FloatingTabItem = {
  key: string;
  title: AppTab;
  icon: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  onPress: () => void;
};

export const BAR_HEIGHT = 64;
const SIDE_MARGIN = 16;
export const BOTTOM_MARGIN = 14;
const MAX_WIDTH = 640;
const ACTIVE = "#E53935";
const INACTIVE = "#737373";

export default function FloatingTabBar({
  items,
}: {
  items: FloatingTabItem[];
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: "center",
        paddingHorizontal: SIDE_MARGIN,
        paddingBottom: BOTTOM_MARGIN + insets.bottom,
        backgroundColor: "transparent",
      }}
    >
      <View
        style={{
          width: "100%",
          maxWidth: MAX_WIDTH,
          height: BAR_HEIGHT,
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 8,
          borderRadius: BAR_HEIGHT / 2,
          backgroundColor: "#FFFFFF",
          borderWidth: 1,
          borderColor: "#E5E5E5",
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.12,
          shadowRadius: 14,
          elevation: 10,
        }}
      >
        {items.map((item) => {
          const color = item.focused ? ACTIVE : INACTIVE;
          return (
            <Pressable
              key={item.key}
              onPress={item.onPress}
              accessibilityRole="button"
              accessibilityState={{ selected: item.focused }}
              accessibilityLabel={item.title}
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
              }}
            >
              <Ionicons name={item.icon} size={22} color={color} />
              <Text
                numberOfLines={1}
                style={{
                  color,
                  fontSize: 10,
                  marginTop: 2,
                  fontWeight: item.focused ? "700" : "500",
                }}
              >
                {item.title}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
