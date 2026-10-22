import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import type { ComponentProps } from "react";
import { Platform } from "react-native";
import FloatingTabBar, {
  type FloatingTabItem,
} from "@/components/FloatingTabBar";

type BottomTabBarProps = Parameters<
  NonNullable<ComponentProps<typeof Tabs>["tabBar"]>
>[0];

const HIDDEN = ["favorites"];

function renderFloatingTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const items: FloatingTabItem[] = state.routes.flatMap((route, index) => {
    const { options } = descriptors[route.key];
    if (HIDDEN.includes(route.name) || (options as any).href === null) {
      return [];
    }

    const title = options.title ?? route.name;
    const iconName =
      route.name === "index"
        ? "home-outline"
        : route.name === "search"
          ? "search-outline"
          : route.name === "restaurants"
            ? "restaurant-outline"
            : route.name === "cart"
              ? "cart-outline"
              : route.name === "orders"
                ? "receipt-outline"
                : "person-outline";
    const focused = state.index === index;

    return [
      {
        key: route.key,
        title: title as FloatingTabItem["title"],
        icon: iconName,
        focused,
        onPress: () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name as never);
          }
        },
      },
    ];
  });

  return <FloatingTabBar items={items} />;
}

export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName="index"
      tabBar={
        Platform.OS === "web"
          ? () => null
          : (props) => renderFloatingTabBar(props)
      }
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="restaurants"
        options={{
          title: "Restaurants",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="restaurant-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen name="favorites" options={{ href: null }} />

      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
