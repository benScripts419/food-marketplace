import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";

import RestaurantCard, {
  type Restaurant,
} from "@/components/restaurant/RestaurantCard";
import { useFavorites } from "@/context/FavoritesContext";
import { mapRestaurantRow, type RestaurantRow } from "@/lib/restaurantMapper";
import { supabase } from "@/lib/supabase";

export default function FavoritesScreen() {
  const { favoriteRestaurantIds, favoritesLoaded } = useFavorites();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadRestaurants() {
        setLoading(true);
        setLoadError(null);

        const { data, error } = await supabase
          .from("restaurants")
          .select("id, name, description, image_url, cuisine, category")
          .order("name");

        if (!active) return;

        if (error) {
          console.error("Failed to load restaurants for favorites:", error);
          setLoadError("Could not load your favorite restaurants.");
          setRestaurants([]);
        } else {
          setRestaurants(
            ((data ?? []) as RestaurantRow[]).map(mapRestaurantRow),
          );
        }
        setLoading(false);
      }

      void loadRestaurants();
      return () => {
        active = false;
      };
    }, []),
  );

  const favorites = useMemo(() => {
    const favoriteIds = new Set(favoriteRestaurantIds);
    return restaurants.filter((restaurant) => favoriteIds.has(restaurant.id));
  }, [favoriteRestaurantIds, restaurants]);

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center px-5 pb-4 pt-14">
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          className="h-10 w-10 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={23} color="#171717" />
        </Pressable>
        <Text className="ml-3 text-2xl font-bold text-text">Favorites</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 110,
        }}
      >
        <View className="w-full max-w-[900px] self-center">
          {loading || !favoritesLoaded ? (
            <View className="items-center py-16">
              <ActivityIndicator size="large" color="#E53935" />
              <Text className="mt-3 text-sm text-textSecondary">
                Loading favorites...
              </Text>
            </View>
          ) : loadError ? (
            <View className="items-center py-16">
              <Ionicons
                name="alert-circle-outline"
                size={44}
                color="#E53935"
              />
              <Text className="mt-3 text-center text-sm text-textSecondary">
                {loadError}
              </Text>
            </View>
          ) : favorites.length === 0 ? (
            <View className="items-center px-8 py-16">
              <Ionicons name="heart-outline" size={52} color="#E53935" />
              <Text className="mt-4 text-lg font-bold text-text">
                No favorites yet
              </Text>
              <Text className="mt-2 text-center text-sm leading-5 text-textSecondary">
                Tap the heart on a restaurant to save it here for next time.
              </Text>
              <Pressable
                onPress={() => router.push("/restaurants")}
                className="mt-5 rounded-xl bg-primary px-6 py-3"
              >
                <Text className="font-bold text-white">Browse restaurants</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <Text className="mb-3 text-sm text-textSecondary">
                {favorites.length}{" "}
                {favorites.length === 1 ? "restaurant" : "restaurants"} saved
              </Text>
              {favorites.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  onPress={() => router.push(`/restaurant/${restaurant.id}`)}
                />
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
