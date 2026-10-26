import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import CategoryFloatingTabs from "@/components/CategoryFloatingTabs";
import { getAllMenuItems } from "@/data/restaurantMenus";
import { Alert } from "@/lib/dialog";
import { goBack } from "@/lib/goBack";
import { supabase } from "@/lib/supabase";

const categoryAliases: Record<string, string[]> = {
  pizza: ["pizza", "pizzas"],
  burgers: ["burger", "burgers"],
  chicken: ["chicken", "poultry"],
  local: ["local", "local corner", "ghanaian food"],
  drinks: ["drink", "drinks", "beverages", "Tea"],
  african: ["african", "african food"],
  "fast food": ["fast food", "fast-food", "Fast Food"],
  desserts: ["dessert", "desserts"],
};

const MAX_CONTENT_WIDTH = 1100;
const GRID_GAP = 16;

type Restaurant = {
  id: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  cuisine?: string | null;
  category?: string | null;
  rating?: string | null;
};

export default function CategoryItemsScreen() {
  const { category } = useLocalSearchParams<{
    category?: string;
  }>();

  const selectedCategory = Array.isArray(category) ? category[0] : category;

  const { width } = useWindowDimensions();
  // One column on phones, two on tablets, three on desktops.
  const columns = width >= 900 ? 3 : width >= 600 ? 2 : 1;

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [restaurantSelection, setRestaurantSelection] = useState<{
    category?: string;
    restaurant: string | null;
  }>({ category: selectedCategory, restaurant: null });

  const allMenuItems = getAllMenuItems();

  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoadingRestaurants(true);

      const { data, error } = await supabase
        .from("restaurants")
        .select("id, name, description, image_url, cuisine, category");

      if (error) {
        console.error("Error fetching restaurants:", error);
        Alert.alert("Error", "Unable to load restaurants. Please try again.");
        setLoadingRestaurants(false);
        return;
      }

      setRestaurants(data ?? []);
      setLoadingRestaurants(false);
    };

    void fetchRestaurants();
  }, []);

  const filteredItems = selectedCategory
    ? allMenuItems.filter((item) => {
        const selected = selectedCategory.trim().toLowerCase();
        const itemCategory = item.category?.trim().toLowerCase();

        const aliases = categoryAliases[selected] ?? [selected];

        return aliases.includes(itemCategory ?? "");
      })
    : [];

  const restaurantOptions = Array.from(
    new Set(filteredItems.map((item) => item.restaurantName)),
  );
  const selectedRestaurant =
    restaurantSelection.category === selectedCategory
      ? restaurantSelection.restaurant
      : null;
  const visibleItems = selectedRestaurant
    ? filteredItems.filter((item) => item.restaurantName === selectedRestaurant)
    : filteredItems;

  const handleViewItem = (restaurantName: string, itemId: string) => {
    const restaurant = restaurants.find(
      (restaurant) =>
        restaurant.name.trim().toLowerCase() ===
        restaurantName.trim().toLowerCase(),
    );

    if (!restaurant) {
      Alert.alert(
        "Restaurant unavailable",
        `${restaurantName} could not be found.`,
      );
      return;
    }

    router.push({
      pathname: "/restaurant/[id]",
      params: {
        id: restaurant.id,
        itemId,
      },
    });
  };

  return (
    <View className="flex-1 bg-white">
      {/* HEADER */}
      <View
        className="w-full self-center px-5 pb-4 pt-14"
        style={{ maxWidth: MAX_CONTENT_WIDTH }}
      >
        <View className="flex-row items-center">
          <Pressable
            onPress={() => goBack("/categories")}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={12}
            className="h-10 w-10 items-center justify-center rounded-full bg-surface"
          >
            <Ionicons name="arrow-back" size={22} color="#171717" />
          </Pressable>

          <View className="ml-3 flex-1">
            <Text className="text-2xl font-bold text-text">
              {selectedCategory || "Category"}
            </Text>

            <Text className="mt-1 text-sm text-textSecondary">
              {visibleItems.length}{" "}
              {visibleItems.length === 1 ? "item" : "items"} available
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="max-h-12 flex-grow-0"
        contentContainerStyle={{
          alignItems: "center",
          paddingHorizontal: 20,
          paddingBottom: 8,
        }}
      >
        <Pressable
          onPress={() =>
            setRestaurantSelection({
              category: selectedCategory,
              restaurant: null,
            })
          }
          className={`mr-2 rounded-full px-4 py-2 ${
            selectedRestaurant === null ? "bg-primary" : "bg-surface"
          }`}
        >
          <Text
            className={`text-xs font-semibold ${
              selectedRestaurant === null ? "text-white" : "text-text"
            }`}
          >
            All restaurants
          </Text>
        </Pressable>
        {restaurantOptions.map((restaurantName) => {
          const isSelected = selectedRestaurant === restaurantName;
          return (
            <Pressable
              key={restaurantName}
              onPress={() =>
                setRestaurantSelection({
                  category: selectedCategory,
                  restaurant: restaurantName,
                })
              }
              className={`mr-2 rounded-full px-4 py-2 ${
                isSelected ? "bg-primary" : "bg-surface"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  isSelected ? "text-white" : "text-text"
                }`}
                numberOfLines={1}
              >
                {restaurantName}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* FOOD LIST */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 140,
        }}
      >
        <View
          className="w-full self-center"
          style={{ maxWidth: MAX_CONTENT_WIDTH }}
        >
          {loadingRestaurants ? (
            <View className="items-center justify-center py-20">
              <Text className="text-sm text-textSecondary">
                Loading restaurants...
              </Text>
            </View>
          ) : visibleItems.length > 0 ? (
            <View
              className="flex-row flex-wrap"
              style={{ marginHorizontal: -GRID_GAP / 2 }}
            >
              {visibleItems.map((item) => {
                const restaurant = restaurants.find(
                  (restaurant) =>
                    restaurant.name.trim().toLowerCase() ===
                    item.restaurantName.trim().toLowerCase(),
                );

                return (
                  <View
                    key={`${item.restaurantName}-${item.id}`}
                    style={{
                      width: `${100 / columns}%` as any,
                      paddingHorizontal: GRID_GAP / 2,
                    }}
                  >
                    <View
                      className="mb-4 overflow-hidden rounded-2xl border border-border bg-white"
                      style={{ flex: 1 }}
                    >
                      {/* IMAGE: keeps one shape and scales with the card */}
                      <Image
                        source={item.image}
                        className="w-full bg-surface"
                        style={{ width: "100%", aspectRatio: 16 / 10 }}
                        resizeMode="cover"
                        accessibilityLabel={item.name}
                      />

                      {/* INFORMATION */}
                      <View className="flex-1 p-4">
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

                          <Text
                            className="ml-2 flex-1 text-xs font-semibold text-text"
                            numberOfLines={1}
                          >
                            {restaurant?.name ?? item.restaurantName}
                          </Text>

                          {restaurant?.rating ? (
                            <View className="ml-2 flex-row items-center">
                              <Ionicons name="star" size={13} color="#F59E0B" />

                              <Text className="ml-1 text-xs font-semibold text-text">
                                {restaurant.rating}
                              </Text>
                            </View>
                          ) : null}
                        </View>

                        {/* VIEW ITEM */}
                        <Pressable
                          onPress={() =>
                            handleViewItem(item.restaurantName, item.id)
                          }
                          accessibilityRole="button"
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
                  </View>
                );
              })}
            </View>
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
                onPress={() => goBack("/categories")}
                className="mt-5 rounded-xl bg-primary px-6 py-3"
              >
                <Text className="font-bold text-white">Browse Categories</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>

      <CategoryFloatingTabs activeTab="Restaurants" />
    </View>
  );
}
