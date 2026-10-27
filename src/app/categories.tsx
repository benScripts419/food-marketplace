import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
  type ImageSourcePropType,
} from "react-native";

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
  "Boba Tea": "Delicious bubble tea drinks",
  Matcha: "Smooth and refreshing matcha drinks",
};

// Use explicit styles for the image dimensions so they render consistently
// in React Native Web as well as Android and iOS.
function CategoryThumbnail({
  category,
  source,
}: {
  category: string;
  source: ImageSourcePropType | null;
}) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <View
      style={{
        width: 80,
        height: 80,
        borderRadius: 40,
        overflow: "hidden",
        backgroundColor: "#F2F2F2",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {source && !imageFailed ? (
        <Image
          source={source}
          resizeMode="cover"
          style={{ width: 80, height: 80 }}
          onError={(event) => {
            console.error(
              `Failed to load category image for "${category}":`,
              event.nativeEvent.error,
            );
            setImageFailed(true);
          }}
        />
      ) : (
        <Ionicons name="restaurant-outline" size={38} color="#737373" />
      )}
    </View>
  );
}

// --------------------------------------------------
// CATEGORIES SCREEN
// --------------------------------------------------

export default function CategoriesScreen() {
  const allMenuItems = getAllMenuItems();

  const categories = Array.from(
    new Set(
      allMenuItems
        .map((item) => item.category)
        .filter((category): category is string => Boolean(category?.trim()))
        .map((category) => category.trim()),
    ),
  ).sort((a, b) => a.localeCompare(b));

  return (
    <View className="flex-1 bg-white">
      {/* HEADER */}
      <View className="px-5 pb-4 pt-14">
        <View className="flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
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
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 140 }}
      >
        {categories.length > 0 ? (
          <View className="flex-row flex-wrap justify-between">
            {categories.map((category) => {
              const normalizedCategory = category.trim().toLowerCase();
              const itemCount = allMenuItems.filter(
                (item) =>
                  item.category.trim().toLowerCase() === normalizedCategory,
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
                      params: { category },
                    })
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`Explore ${category}, ${itemCount} items`}
                  className="mb-4 w-[48%] rounded-2xl border border-border bg-white p-4"
                >
                  <CategoryThumbnail
                    category={category}
                    source={categoryImage}
                  />

                  <Text className="mt-4 text-base font-bold text-text">
                    {category}
                  </Text>

                  <Text
                    className="mt-1 text-xs leading-5 text-textSecondary"
                    numberOfLines={2}
                  >
                    {description}
                  </Text>

                  <Text className="mt-2 text-xs text-textSecondary">
                    {itemCount} {itemCount === 1 ? "item" : "items"}
                  </Text>

                  <View className="mt-4 flex-row items-center">
                    <Text className="text-xs font-semibold text-primary">
                      Explore
                    </Text>
                    <Ionicons
                      name="arrow-forward"
                      size={14}
                      color="#E53935"
                      style={{ marginLeft: 4 }}
                    />
                  </View>
                </Pressable>
              );
            })}
          </View>
        ) : (
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
