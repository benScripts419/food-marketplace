import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Pressable, ScrollView, Text, View } from "react-native";

import CategoryFloatingTabs from "@/components/CategoryFloatingTabs";
import { getAllMenuItems } from "@/data/restaurantMenus";
import { getCategoryImage } from "@/lib/categoryImages";

// --------------------------------------------------
// CATEGORY DESCRIPTIONS
// --------------------------------------------------

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
  Shawarma: "Tasty shawarma and wraps",
  Sushi: "Fresh and delicious sushi",
  Bakery: "Freshly baked treats",
  Breakfast: "Delicious breakfast meals",
  Tea: "Refreshing tea and beverages",
  Boba: "Delicious bubble tea drinks",
};

// --------------------------------------------------
// CATEGORIES SCREEN
// --------------------------------------------------

export default function CategoriesScreen() {
  /**
   * Get all menu items from all restaurants.
   */
  const allMenuItems = getAllMenuItems();

  /**
   * Extract unique categories from the restaurant menus.
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
      {/* ==========================================
          HEADER
      ========================================== */}

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

      {/* ==========================================
          CATEGORY LIST
      ========================================== */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 140,
        }}
      >
        {categories.length > 0 ? (
          <View className="flex-row flex-wrap justify-between">
            {categories.map((category) => {
              // Count items belonging to this category
              const itemCount = allMenuItems.filter(
                (item) =>
                  item.category.trim().toLowerCase() === category.toLowerCase(),
              ).length;

              const categoryImage = getCategoryImage(category);

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
                  {/* ==========================================
                      CATEGORY IMAGE
                  ========================================== */}

                  <View className="h-20 w-20 overflow-hidden rounded-full bg-surface">
                    {categoryImage ? (
                      <Image
                        source={categoryImage}
                        className="h-full w-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="h-full w-full items-center justify-center">
                        <Ionicons
                          name="restaurant-outline"
                          size={38}
                          color="#737373"
                        />
                      </View>
                    )}
                  </View>

                  {/* ==========================================
                      CATEGORY NAME
                  ========================================== */}

                  <Text className="mt-4 text-base font-bold text-text">
                    {category}
                  </Text>

                  {/* ==========================================
                      DESCRIPTION
                  ========================================== */}

                  <Text
                    className="mt-1 text-xs leading-5 text-textSecondary"
                    numberOfLines={2}
                  >
                    {description}
                  </Text>

                  {/* ==========================================
                      ITEM COUNT
                  ========================================== */}

                  <Text className="mt-2 text-xs text-textSecondary">
                    {itemCount} {itemCount === 1 ? "item" : "items"}
                  </Text>

                  {/* ==========================================
                      EXPLORE
                  ========================================== */}

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
          // ==========================================
          // NO CATEGORIES
          // ==========================================

          <View className="items-center justify-center py-20">
            <View className="h-20 w-20 items-center justify-center rounded-full bg-surface">
              <Ionicons name="restaurant-outline" size={38} color="#737373" />
            </View>

            <Text className="mt-5 text-lg font-bold text-text">
              No categories available
            </Text>

            <Text className="mt-2 px-8 text-center text-sm leading-5 text-textSecondary">
              Restaurant menus haven&apos;t been added yet.
            </Text>
          </View>
        )}
      </ScrollView>

      <CategoryFloatingTabs activeTab="Home" />
    </View>
  );
}
