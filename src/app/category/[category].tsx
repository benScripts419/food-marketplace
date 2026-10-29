import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import SafeImage from "@/components/SafeImage";
import { getAllMenuItems } from "@/data/restaurantMenus";
import { Alert } from "@/lib/dialog";
import { goBack } from "@/lib/goBack";
import { supabase } from "@/lib/supabase";

const categoryAliases: Record<string, string[]> = {
  pizza: ["pizza", "pizzas"],
  burgers: ["burger", "burgers"],
  chicken: ["chicken", "poultry"],
  local: ["local", "local corner", "ghanaian food"],
  drinks: ["drink", "drinks", "beverages", "Tea", "Boba Tea", "Bubble Tea"],
  african: ["african", "african food"],
  "fast food": ["fast food", "fast-food", "Fast Food"],
  desserts: ["dessert", "desserts"],
};

const MAX_CONTENT_WIDTH = 1100;
const GRID_GAP = 16;
// Same background the restaurant menu uses behind these pictures.
const PHOTO_BACKGROUND = "#f3f0e7";

type Restaurant = {
  id: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  cuisine?: string | null;
  category?: string | null;
  rating?: string | null;
};

// "Roll'd Up", "rolld up" and "ROLLD-UP" all become "rolldup".
const normalizeName = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]/g, "");

export default function CategoryItemsScreen() {
  const { category } = useLocalSearchParams<{
    category?: string;
  }>();

  const selectedCategory = Array.isArray(category) ? category[0] : category;

  const { width } = useWindowDimensions();
  // One column on phones, two on tablets, three on desktops.
  const columns = width >= 900 ? 3 : width >= 600 ? 2 : 1;
  const compact = columns === 1;
  // Picture size in the phone layout grows with the screen (88px to 150px).
  const photoSize = Math.round(Math.min(150, Math.max(88, width * 0.3)));
  // Exact card width in pixels (percentages inside wrapping rows are unreliable on phones).
  const contentWidth = Math.min(width, MAX_CONTENT_WIDTH) - 40;
  const cardWidth = Math.floor(
    (contentWidth - GRID_GAP * (columns - 1)) / columns,
  );

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [restaurantSelection, setRestaurantSelection] = useState<{
    category?: string;
    restaurant: string | null;
  }>({ category: selectedCategory, restaurant: null });

  const allMenuItems = getAllMenuItems();

  // A message shown on the page, because Alert is easy to miss on the web.
  const [notice, setNotice] = useState<string | null>(null);

  const showNotice = (message: string) => {
    setNotice(message);
    setTimeout(() => setNotice(null), 4000);
  };

  // Find the restaurant row that belongs to a menu item's restaurant name.
  const findRestaurant = (name: string) => {
    const wanted = normalizeName(name);
    if (!wanted) return undefined;

    return (
      restaurants.find(
        (restaurant) => normalizeName(restaurant.name) === wanted,
      ) ??
      restaurants.find((restaurant) => {
        const known = normalizeName(restaurant.name);
        return (
          wanted.length >= 4 &&
          (known.includes(wanted) || wanted.includes(known))
        );
      })
    );
  };

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
    if (loadingRestaurants) {
      showNotice(
        "Restaurants are still loading. Please try again in a moment.",
      );
      return;
    }

    const restaurant = findRestaurant(restaurantName);

    if (!restaurant) {
      console.warn("No restaurant row matches the menu name:", restaurantName);
      showNotice(`${restaurantName} could not be found.`);
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

  // One menu item. A compact row on phones, a card with the picture on top
  // on wider screens. The picture always keeps its shape and is never cropped.
  const renderItem = (item: (typeof visibleItems)[number]) => {
    const restaurant = findRestaurant(item.restaurantName);

    const details = (
      <>
        <Text className="text-base font-bold text-text" numberOfLines={2}>
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

        <View className="mt-3 flex-row items-center">
          <Ionicons name="restaurant-outline" size={15} color="#737373" />

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

        <View className="mt-3 flex-row items-center justify-between">
          <Text className="text-base font-bold text-primary">
            GH₵{Number(item.price).toFixed(2)}
          </Text>

          <Pressable
            onPress={() => handleViewItem(item.restaurantName, item.id)}
            accessibilityRole="button"
            accessibilityLabel={`View ${item.name}`}
            className="flex-row items-center"
          >
            <Text className="text-xs font-bold text-primary">View item</Text>

            <Ionicons
              name="arrow-forward"
              size={14}
              color="#E53935"
              style={{ marginLeft: 4 }}
            />
          </Pressable>
        </View>
      </>
    );

    if (compact) {
      return (
        <Pressable
          key={`${item.restaurantName}-${item.id}`}
          onPress={() => handleViewItem(item.restaurantName, item.id)}
          accessibilityRole="button"
          accessibilityLabel={`Open ${item.name} at ${item.restaurantName}`}
          className="flex-row rounded-2xl border border-border bg-white p-3"
          style={{ width: cardWidth }}
        >
          <View
            style={{
              width: Math.min(photoSize, cardWidth * 0.38),
              aspectRatio: 1,
              flexShrink: 0,
              overflow: "hidden",
              borderRadius: 12,
            }}
          >
            <SafeImage
              source={item.image}
              label={item.name}
              aspectRatio={1}
              fit="contain"
              backgroundColor={PHOTO_BACKGROUND}
              radius={12}
            />
          </View>

          <View className="ml-3 flex-1">{details}</View>
        </Pressable>
      );
    }

    return (
      <Pressable
        key={`${item.restaurantName}-${item.id}`}
        onPress={() => handleViewItem(item.restaurantName, item.id)}
        accessibilityRole="button"
        accessibilityLabel={`Open ${item.name} at ${item.restaurantName}`}
        className="overflow-hidden rounded-2xl border border-border bg-white"
        style={{ width: cardWidth }}
      >
        <View
          style={{
            width: "100%",
            aspectRatio: 4 / 3,
            overflow: "hidden",
          }}
        >
          <SafeImage
            source={item.image}
            label={item.name}
            aspectRatio={4 / 3}
            fit="contain"
            backgroundColor={PHOTO_BACKGROUND}
          />
        </View>

        <View style={{ padding: 16 }}>{details}</View>
      </Pressable>
    );
  };

  return (
    <View className="flex-1 bg-white">
      {/* HEADER */}
      <View
        className="w-full self-center px-5 pb-4 pt-8"
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
          {notice ? (
            <Text
              accessibilityRole="alert"
              className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700"
            >
              {notice}
            </Text>
          ) : null}

          {loadingRestaurants ? (
            <View className="items-center justify-center py-20">
              <Text className="text-sm text-textSecondary">
                Loading restaurants...
              </Text>
            </View>
          ) : visibleItems.length > 0 ? (
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: GRID_GAP,
              }}
            >
              {visibleItems.map(renderItem)}
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
    </View>
  );
}
