import { router } from "expo-router";

import FloatingTabBar, {
  type AppTab,
  type FloatingTabItem,
} from "@/components/FloatingTabBar";

const tabs: {
  title: AppTab;
  route: "/(tabs)" | "/(tabs)/search" | "/(tabs)/restaurants" | "/(tabs)/cart" | "/(tabs)/orders" | "/(tabs)/profile";
  icon: FloatingTabItem["icon"];
}[] = [
  { title: "Home", route: "/(tabs)", icon: "home-outline" },
  { title: "Search", route: "/(tabs)/search", icon: "search-outline" },
  {
    title: "Restaurants",
    route: "/(tabs)/restaurants",
    icon: "restaurant-outline",
  },
  { title: "Cart", route: "/(tabs)/cart", icon: "cart-outline" },
  { title: "Orders", route: "/(tabs)/orders", icon: "receipt-outline" },
  { title: "Profile", route: "/(tabs)/profile", icon: "person-outline" },
];

export default function CategoryFloatingTabs({
  activeTab,
}: {
  activeTab: AppTab;
}) {
  const items: FloatingTabItem[] = tabs.map((tab) => ({
    key: tab.title,
    title: tab.title,
    icon: tab.icon,
    focused: activeTab === tab.title,
    onPress: () => router.push(tab.route),
  }));

  return <FloatingTabBar items={items} />;
}
