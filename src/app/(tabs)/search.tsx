import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { restaurants } from "@/data/restaurants";
import { getAllMenuItems } from "../../data/restaurantMenus";

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");

  const menuItems = useMemo(() => {
    return getAllMenuItems();
  }, []);

  const filteredRestaurants = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return [];
    }

    return restaurants.filter((restaurant) => {
      return (
        restaurant.name.toLowerCase().includes(query) ||
        restaurant.cuisine?.toLowerCase().includes(query)
      );
    });
  }, [searchQuery]);

  const filteredFoodItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return [];
    }

    return menuItems.filter((item) => {
      const restaurant = restaurants.find(
        (restaurant) => restaurant.id === item.restaurantId,
      );

      return (
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        restaurant?.name.toLowerCase().includes(query)
      );
    });
  }, [searchQuery, menuItems]);

  const hasResults =
    filteredRestaurants.length > 0 || filteredFoodItems.length > 0;

  return (
    <View className="flex-1 bg-white">
      {/* HEADER */}
      <View className="px-5 pb-4 pt-16">
        <Text className="text-2xl font-bold text-text">Search</Text>

        <Text className="mt-1 text-sm text-textSecondary">
          Find restaurants and delicious food
        </Text>

        {/* SEARCH BAR */}
        <View className="mt-5 h-12 flex-row items-center rounded-xl bg-surface px-4">
          <Ionicons name="search-outline" size={21} color="#737373" />

          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search food or restaurants..."
            placeholderTextColor="#737373"
            className="ml-3 flex-1 text-sm text-text"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />

          {searchQuery.length > 0 && (
            <Pressable
              onPress={() => setSearchQuery("")}
              className="h-8 w-8 items-center justify-center"
            >
              <Ionicons name="close-circle" size={20} color="#737373" />
            </Pressable>
          )}
        </View>
      </View>

      {/* RESULTS */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 100,
        }}
      >
        {/* NO SEARCH */}
        {searchQuery.trim() === "" && (
          <View>
            <Text className="mb-4 text-lg font-bold text-text">
              Popular Restaurants
            </Text>

            {restaurants.map((restaurant) => (
              <RestaurantResult key={restaurant.id} restaurant={restaurant} />
            ))}
          </View>
        )}

        {/* SEARCH RESULTS */}
        {searchQuery.trim() !== "" && hasResults && (
          <View>
            {/* RESTAURANT RESULTS */}
            {filteredRestaurants.length > 0 && (
              <View>
                <Text className="mb-4 text-lg font-bold text-text">
                  Restaurants
                </Text>

                {filteredRestaurants.map((restaurant) => (
                  <RestaurantResult
                    key={restaurant.id}
                    restaurant={restaurant}
                  />
                ))}
              </View>
            )}

            {/* FOOD RESULTS */}
            {filteredFoodItems.length > 0 && (
              <View className="mt-6">
                <Text className="mb-4 text-lg font-bold text-text">Food</Text>

                {filteredFoodItems.map((item) => {
                  const restaurant = restaurants.find(
                    (restaurant) => restaurant.id === item.restaurantId,
                  );

                  return (
                    <FoodResult
                      key={`${item.restaurantId}-${item.id}`}
                      item={item}
                      restaurantName={restaurant?.name ?? "Restaurant"}
                    />
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* NO RESULTS */}
        {searchQuery.trim() !== "" && !hasResults && (
          <View className="items-center px-5 pt-16">
            <View className="h-20 w-20 items-center justify-center rounded-full bg-surface">
              <Ionicons name="search-outline" size={38} color="#737373" />
            </View>

            <Text className="mt-5 text-lg font-bold text-text">
              No results found
            </Text>

            <Text className="mt-2 text-center text-sm text-textSecondary">
              We couldn't find anything matching "{searchQuery}".
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

/* ------------------------------------------------ */
/* RESTAURANT RESULT */
/* ------------------------------------------------ */

function RestaurantResult({
  restaurant,
}: {
  restaurant: (typeof restaurants)[number];
}) {
  return (
    <Pressable
      onPress={() => router.push(`/restaurant/${restaurant.id}`)}
      className="mb-4 flex-row rounded-2xl border border-border bg-white p-3"
    >
      {/* IMAGE */}

      <View className="h-24 w-24 items-center justify-center overflow-hidden rounded-xl bg-surface">
        {restaurant.image ? (
          <Image
            source={restaurant.image}
            className="h-full w-full"
            resizeMode="cover"
          />
        ) : (
          <Ionicons name="restaurant-outline" size={32} color="#737373" />
        )}
      </View>

      {/* DETAILS */}

      <View className="ml-3 flex-1 justify-center">
        <Text className="text-base font-bold text-text" numberOfLines={1}>
          {restaurant.name}
        </Text>

        <Text className="mt-1 text-xs text-textSecondary" numberOfLines={1}>
          {restaurant.cuisine}
        </Text>

        <View className="mt-2 flex-row items-center">
          <Ionicons name="star" size={13} color="#F59E0B" />

          <Text className="ml-1 text-xs font-semibold text-text">
            {restaurant.rating}
          </Text>

          <Text className="ml-1 text-xs text-textSecondary">
            ({restaurant.reviews})
          </Text>

          <Text className="mx-2 text-xs text-border">•</Text>

          <Text className="text-xs text-textSecondary">{restaurant.time}</Text>
        </View>
      </View>

      <View className="justify-center">
        <Ionicons name="chevron-forward" size={18} color="#737373" />
      </View>
    </Pressable>
  );
}

/* ------------------------------------------------ */
/* FOOD RESULT */
/* ------------------------------------------------ */

function FoodResult({
  item,
  restaurantName,
}: {
  item: ReturnType<typeof getAllMenuItems>[number];
  restaurantName: string;
}) {
  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/food/[id]",
          params: {
            id: item.id,
            restaurantId: item.restaurantId,
            restaurantName,
          },
        })
      }
      className="mb-4 flex-row rounded-2xl border border-border bg-white p-3"
    >
      {/* FOOD IMAGE */}

      <View className="h-24 w-24 overflow-hidden rounded-xl bg-surface">
        {item.image ? (
          <Image
            source={item.image}
            className="h-full w-full"
            resizeMode="cover"
          />
        ) : (
          <View className="h-full w-full items-center justify-center">
            <Ionicons name="restaurant-outline" size={32} color="#737373" />
          </View>
        )}
      </View>

      {/* DETAILS */}

      <View className="ml-3 flex-1">
        <Text className="text-base font-bold text-text" numberOfLines={2}>
          {item.name}
        </Text>

        <Text className="mt-1 text-xs text-textSecondary" numberOfLines={1}>
          {restaurantName}
        </Text>

        {item.description && (
          <Text className="mt-1 text-xs text-textSecondary" numberOfLines={1}>
            {item.description}
          </Text>
        )}

        <Text className="mt-2 text-sm font-bold text-primary">
          GH₵{item.price.toFixed(2)}
        </Text>
      </View>

      <View className="justify-center">
        <Ionicons name="chevron-forward" size={18} color="#737373" />
      </View>
    </Pressable>
  );
}
