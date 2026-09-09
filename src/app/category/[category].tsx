import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

import { getAllMenuItems } from "@/data/restaurantMenus";
import { restaurants } from "@/data/restaurants";

const categoryAliases: Record<string, string[]> = {
  pizza: ["pizza", "pizzas"],
  burgers: ["burger", "burgers"],
  chicken: ["chicken", "poultry"],
  local: ["local", "local corner", "ghanaian food"],
  drinks: ["drink", "drinks", "beverages"],
  african: ["african", "african food"],
  "fast food": ["fast food", "fast-food"],
  desserts: ["dessert", "desserts"],
};

const categoryEmojis: Record<string, string> = {
  Pizza: "🍕",
  Burgers: "🍔",
  Chicken: "🍗",
  Local: "🍲",
  Drinks: "🥤",
  African: "🍛",
  "Fast Food": "🍟",
  Desserts: "🍰",
};

export default function CategoryItemsScreen() {
  const { category } = useLocalSearchParams<{
    category?: string;
  }>();

  const selectedCategory = Array.isArray(category) ? category[0] : category;

  const allMenuItems = getAllMenuItems();

  const filteredItems = selectedCategory
    ? allMenuItems.filter((item) => {
        const selected = selectedCategory.trim().toLowerCase();
        const itemCategory = item.category?.trim().toLowerCase();

        const aliases = categoryAliases[selected] ?? [selected];

        return aliases.includes(itemCategory ?? "");
      })
    : [];

  const emoji = categoryEmojis[selectedCategory ?? ""] ?? "🍽️";

  return (
    <View className="flex-1 bg-white">
      {/* HEADER */}
      <View className="px-5 pb-4 pt-14">
        <View className="flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-surface"
          >
            <Ionicons name="arrow-back" size={22} color="#171717" />
          </Pressable>

          <View className="ml-3 flex-1">
            <Text className="text-2xl font-bold text-text">
              {selectedCategory || "Category"}
            </Text>

            <Text className="mt-1 text-sm text-textSecondary">
              {filteredItems.length}{" "}
              {filteredItems.length === 1 ? "item" : "items"} available
            </Text>
          </View>
        </View>
      </View>

      {/* FOOD LIST */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 140,
        }}
      >
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => {
            const restaurant = restaurants.find(
              (restaurant) => restaurant.id === item.restaurantId,
            );

            return (
              <View
                key={`${item.restaurantId}-${item.id}`}
                className="mb-4 overflow-hidden rounded-2xl border border-border bg-white"
              >
                {/* IMAGE */}
                <View className="h-40 w-full items-center justify-center bg-surface">
                  <Text className="text-6xl">{emoji}</Text>
                </View>

                {/* INFORMATION */}
                <View className="p-4">
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1 pr-3">
                      <Text
                        className="text-base font-bold text-text"
                        numberOfLines={2}
                      >
                        {item.name}
                      </Text>

                      {!!item.description && (
                        <Text
                          className="mt-1 text-xs leading-5 text-textSecondary"
                          numberOfLines={2}
                        >
                          {item.description}
                        </Text>
                      )}
                    </View>

                    <Text className="text-base font-bold text-primary">
                      GH₵{Number(item.price).toFixed(2)}
                    </Text>
                  </View>

                  {/* RESTAURANT */}
                  <View className="mt-4 flex-row items-center">
                    <Ionicons
                      name="restaurant-outline"
                      size={15}
                      color="#737373"
                    />

                    <Text className="ml-2 text-xs font-semibold text-text">
                      {restaurant?.name ?? "Restaurant"}
                    </Text>

                    {restaurant?.rating && (
                      <View className="ml-auto flex-row items-center">
                        <Ionicons name="star" size={13} color="#F59E0B" />

                        <Text className="ml-1 text-xs font-semibold text-text">
                          {restaurant.rating}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* VIEW ITEM */}
                  <Pressable
                    onPress={() =>
                      router.push({
                        pathname: "/restaurant/[id]",
                        params: {
                          id: item.restaurantId,
                          itemId: item.id,
                        },
                      })
                    }
                    className="mt-4 flex-row items-center self-start"
                  >
                    <Text className="text-xs font-bold text-primary">
                      View item
                    </Text>

                    <Ionicons
                      name="arrow-forward"
                      size={14}
                      color="#E53935"
                      style={{ marginLeft: 4 }}
                    />
                  </Pressable>
                </View>
              </View>
            );
          })
        ) : (
          <View className="items-center justify-center py-20">
            <View className="h-20 w-20 items-center justify-center rounded-full bg-surface">
              <Ionicons name="restaurant-outline" size={38} color="#737373" />
            </View>

            <Text className="mt-5 text-lg font-bold text-text">
              No items found
            </Text>

            <Text className="mt-2 px-8 text-center text-sm leading-5 text-textSecondary">
              There are currently no {selectedCategory || "food"} items
              available.
            </Text>

            <Pressable
              onPress={() => router.back()}
              className="mt-5 rounded-xl bg-primary px-6 py-3"
            >
              <Text className="font-bold text-white">Browse Categories</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      <BottomNavigation />
    </View>
  );
}

function BottomNavigation() {
  return (
    <View className="absolute bottom-0 left-0 right-0 flex-row border-t border-border bg-white px-4 pb-7 pt-3">
      <NavItem
        icon="home-outline"
        label="Home"
        onPress={() => router.push("/")}
      />

      <NavItem
        icon="search-outline"
        label="Search"
        onPress={() => router.push("/search")}
      />

      <NavItem
        icon="receipt-outline"
        label="Orders"
        onPress={() => router.push("/orders")}
      />

      <NavItem
        icon="cart-outline"
        label="Cart"
        onPress={() => router.push("/cart")}
      />

      <NavItem
        icon="person-outline"
        label="Profile"
        onPress={() => router.push("/profile")}
      />
    </View>
  );
}

function NavItem({
  icon,
  label,
  active = false,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} className="flex-1 items-center justify-center">
      <Ionicons name={icon} size={21} color={active ? "#E53935" : "#737373"} />

      <Text
        className={`mt-1 text-[10px] ${
          active ? "font-bold text-primary" : "text-textSecondary"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
