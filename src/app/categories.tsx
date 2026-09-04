import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

import { getAllMenuItems } from "@/data/restaurantMenus";

const categoryEmojis: Record<string, string> = {
  Pizza: "🍕",
  Burgers: "🍔",
  Chicken: "🍗",
  Local: "🍲",
  Drinks: "🥤",
  African: "🍛",
  "Fast Food": "🍟",
  Desserts: "🍰",
  Grills: "🔥",
  Seafood: "🦐",
  Rice: "🍚",
  Pasta: "🍝",
  Sandwiches: "🥪",
};

const categoryDescriptions: Record<string, string> = {
  Pizza: "Cheesy pizzas and more",
  Burgers: "Juicy burgers and fries",
  Chicken: "Crispy and grilled chicken",
  Local: "Delicious Ghanaian meals",
  Drinks: "Refreshing drinks",
  African: "African dishes",
  "Fast Food": "Quick and tasty meals",
  Desserts: "Sweet treats and desserts",
  Grills: "Freshly grilled meals",
  Seafood: "Fresh and delicious seafood",
  Rice: "Rice dishes and local favorites",
  Pasta: "Delicious pasta dishes",
  Sandwiches: "Fresh sandwiches and wraps",
};

export default function CategoriesScreen() {
  /*
   * Get all menu items from all restaurants.
   *
   * This means the categories are generated from your
   * actual restaurant menus instead of being hard-coded.
   */
  const allMenuItems = getAllMenuItems();

  /*
   * Extract unique categories from the restaurant menus.
   *
   * Example:
   *
   * Kwayisibea:
   *   Local
   *   African
   *   Chicken
   *
   * Concept:
   *   Pizza
   *   Fast Food
   *
   * Result:
   *   Local
   *   African
   *   Chicken
   *   Pizza
   *   Fast Food
   */
  const categories = Array.from(
    new Set(
      allMenuItems
        .map((item) => item.category)
        .filter(Boolean)
        .map((category) => category.trim()),
    ),
  ).sort();

  return (
    <View className="flex-1 bg-white">
      {/* HEADER */}
      <View className="px-5 pb-4 pt-14">
        <View className="flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-surface"
          >
            <Ionicons name="arrow-back" size={22} color="#171717" />
          </Pressable>

          <View>
            <Text className="text-2xl font-bold text-text">Categories</Text>

            <Text className="mt-1 text-sm text-textSecondary">
              What are you craving today?
            </Text>
          </View>
        </View>
      </View>

      {/* CATEGORY LIST */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 110,
        }}
      >
        {categories.length > 0 ? (
          <View className="flex-row flex-wrap justify-between">
            {categories.map((category) => {
              /*
               * Count how many foods belong to this category.
               */
              const itemCount = allMenuItems.filter(
                (item) =>
                  item.category.trim().toLowerCase() === category.toLowerCase(),
              ).length;

              const emoji = categoryEmojis[category] ?? "🍽️";

              const description =
                categoryDescriptions[category] ??
                `Explore delicious ${category.toLowerCase()} dishes`;

              return (
                <Pressable
                  key={category}
                  onPress={() =>
                    router.push({
                      pathname: "/category/[category]",
                      params: {
                        category,
                      },
                    })
                  }
                  className="mb-4 w-[48%] rounded-2xl border border-border bg-white p-4"
                >
                  {/* CATEGORY ICON */}
                  <View className="h-20 w-20 items-center justify-center rounded-full bg-surface">
                    <Text className="text-5xl">{emoji}</Text>
                  </View>

                  {/* CATEGORY NAME */}
                  <Text className="mt-4 text-base font-bold text-text">
                    {category}
                  </Text>

                  {/* DESCRIPTION */}
                  <Text
                    className="mt-1 text-xs leading-5 text-textSecondary"
                    numberOfLines={2}
                  >
                    {description}
                  </Text>

                  {/* ITEM COUNT */}
                  <Text className="mt-2 text-xs text-textSecondary">
                    {itemCount} {itemCount === 1 ? "item" : "items"}
                  </Text>

                  {/* EXPLORE */}
                  <View className="mt-4 flex-row items-center">
                    <Text className="text-xs font-semibold text-primary">
                      Explore
                    </Text>

                    <Ionicons
                      name="arrow-forward"
                      size={14}
                      color="#E53935"
                      style={{
                        marginLeft: 4,
                      }}
                    />
                  </View>
                </Pressable>
              );
            })}
          </View>
        ) : (
          /* NO CATEGORIES */
          <View className="items-center justify-center py-20">
            <View className="h-20 w-20 items-center justify-center rounded-full bg-surface">
              <Ionicons name="restaurant-outline" size={38} color="#737373" />
            </View>

            <Text className="mt-5 text-lg font-bold text-text">
              No categories available
            </Text>

            <Text className="mt-2 px-8 text-center text-sm leading-5 text-textSecondary">
              Restaurant menus haven't been added yet.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* BOTTOM NAVIGATION */}
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
