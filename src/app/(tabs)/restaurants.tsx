import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { supabase } from "@/lib/supabase";

import { mapRestaurantRow } from "@/lib/restaurantMapper";
import RestaurantCard, {
  type Restaurant,
} from "../../components/restaurant/RestaurantCard";

const restaurantDisplayData: Record<
  string,
  Omit<Restaurant, "id" | "name" | "cuisine" | "image">
> = {
  "Kwayisibea Hotel": {
    rating: "4.6",
    reviews: "238",
    time: "20–30 min",
    fee: "GH₵10",
    offer: true,
  },

  Concept: {
    rating: "4.5",
    reviews: "125",
    time: "25–35 min",
    fee: "GH₵15",
    offer: false,
  },

  "Brackers Inn": {
    rating: "4.5",
    reviews: "0",
    time: "20–30 min",
    fee: "GH₵0",
    offer: false,
  },

  "Bloom Bakes": {
    rating: "4.5",
    reviews: "0",
    time: "15–25 min",
    fee: "GH₵0",
    offer: false,
  },

  "Roll'd Up Shawarma": {
    rating: "4.4",
    reviews: "210",
    time: "20–30 min",
    fee: "GH₵8",
    offer: true,
  },

  "Boba Buzz": {
    rating: "4.5",
    reviews: "0",
    time: "15–25 min",
    fee: "GH₵0",
    offer: false,
  },

  "Thebloom Boba Tea": {
    rating: "4.5",
    reviews: "0",
    time: "15–25 min",
    fee: "GH₵0",
    offer: false,
  },
};

const filters = ["All", "Offers", "Delivery Time", "Rating"] as const;

type RestaurantFilter = (typeof filters)[number];

export default function RestaurantsScreen() {
  const [restaurantData, setRestaurantData] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<RestaurantFilter>("All");

  useEffect(() => {
    let isMounted = true;

    async function loadRestaurants() {
      setIsLoading(true);
      setLoadError(null);

      const { data, error } = await supabase
        .from("restaurants")
        .select("id, name, description, image_url, cuisine, category")
        .order("name");

      if (!isMounted) return;

      if (error) {
        console.error("Failed to load restaurants:", error);
        setLoadError(error.message);
        setRestaurantData([]);
        setIsLoading(false);
        return;
      }

      const mappedRestaurants = (data ?? []).map(mapRestaurantRow);

      setRestaurantData(mappedRestaurants);
      setIsLoading(false);
    }

    loadRestaurants();

    return () => {
      isMounted = false;
    };
  }, []);

  const visibleRestaurants = useMemo(() => {
    if (selectedFilter === "Offers") {
      return restaurantData.filter((restaurant) => restaurant.offer);
    }

    if (selectedFilter === "Delivery Time") {
      return [...restaurantData].sort((first, second) =>
        first.time.localeCompare(second.time, undefined, {
          numeric: true,
        }),
      );
    }

    if (selectedFilter === "Rating") {
      return [...restaurantData].sort(
        (first, second) => Number(second.rating) - Number(first.rating),
      );
    }

    return restaurantData;
  }, [restaurantData, selectedFilter]);

  return (
    <View className="flex-1 bg-white">
      {/* HEADER */}
      <View className="px-5 pt-14 sm:px-6 sm:pt-10 md:px-8 md:pt-8">
        {/* TOP ROW */}
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-surface"
          >
            <Ionicons name="arrow-back" size={21} color="#171717" />
          </Pressable>

          <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-surface">
            <Ionicons name="options-outline" size={21} color="#171717" />
          </Pressable>
        </View>

        {/* TITLE + LOCATION */}
        <View className="mt-3">
          <Text className="text-2xl font-bold text-text sm:text-[26px]">
            Restaurants & Food Joints
          </Text>

          <Pressable
            onPress={() => router.push("/location")}
            className="mt-1 flex-row items-center"
          >
            <Ionicons name="location-outline" size={14} color="#E53935" />

            <Text className="ml-1 text-sm font-medium text-text">
              Akropong, Ghana
            </Text>

            <Ionicons
              name="chevron-down"
              size={14}
              color="#737373"
              style={{ marginLeft: 4 }}
            />
          </Pressable>
        </View>
      </View>

      {/* FILTERS */}
      <View className="mt-3 w-full">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingVertical: 2,
          }}
        >
          {filters.map((filter) => {
            const isSelected = selectedFilter === filter;

            return (
              <Pressable
                key={filter}
                onPress={() => setSelectedFilter(filter)}
                className={`mr-2 h-8 items-center justify-center rounded-lg border px-4 ${
                  isSelected
                    ? "border-primary bg-primary"
                    : "border-border bg-white"
                }`}
              >
                <Text
                  className={`text-xs font-semibold sm:text-sm ${
                    isSelected ? "text-white" : "text-text"
                  }`}
                >
                  {filter}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* RESTAURANTS */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: 110,
        }}
      >
        <View className="w-full max-w-[1100px] self-center">
          {/* RESULT COUNT */}
          {isLoading ? (
            <Text className="mb-3 text-sm text-textSecondary">
              Loading restaurants...
            </Text>
          ) : loadError ? (
            <View className="mb-4 rounded-lg bg-red-50 p-3">
              <Text className="text-sm font-medium text-red-600">
                Unable to load restaurants.
              </Text>

              <Text className="mt-1 text-xs text-red-500">{loadError}</Text>
            </View>
          ) : (
            <Text className="mb-3 text-sm text-textSecondary">
              {visibleRestaurants.length} restaurants found
            </Text>
          )}

          {/* RESTAURANT CARDS */}
          {!isLoading &&
            !loadError &&
            visibleRestaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                onPress={() => router.push(`/restaurant/${restaurant.id}`)}
              />
            ))}

          {/* EMPTY STATE */}
          {!isLoading && !loadError && visibleRestaurants.length === 0 && (
            <View className="items-center py-16">
              <Ionicons name="restaurant-outline" size={48} color="#737373" />

              <Text className="mt-3 text-base font-semibold text-text">
                No restaurants found
              </Text>

              <Text className="mt-1 text-center text-sm text-textSecondary">
                Try selecting another filter.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
