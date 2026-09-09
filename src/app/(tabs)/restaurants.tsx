import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { fetchRestaurants } from "@/data/supabaseRestaurants";

import RestaurantCard, {
  type Restaurant,
} from "../../components/restaurant/RestaurantCard";

const localRestaurants: Restaurant[] = [
  {
    id: "1",
    name: "Kwayisibea Hotel",
    image: require("../../../assets/images/akrobite-logo.png"),
    rating: "4.6",
    reviews: "238",
    time: "20–30 min",
    fee: "GH₵10",
    cuisine: "Local • African • Grills",
    offer: true,
  },
  {
    id: "2",
    name: "Concept",
    image: require("../../../assets/images/akrobite-logo.png"),
    rating: "4.5",
    reviews: "125",
    time: "25–35 min",
    fee: "GH₵15",
    cuisine: "Pizza • Fast Food",
    offer: false,
  },
  {
    id: "3",
    name: "Brackers Inn",
    image: require("../../../assets/images/akrobite-logo.png"),
    rating: "4.7",
    reviews: "96",
    time: "30–40 min",
    fee: "GH₵15",
    cuisine: "Sushi • Japanese",
    offer: false,
  },
  {
    id: "4",
    name: "Bloom Bakes",
    image: require("../../../assets/images/akrobite-logo.png"),
    rating: "4.3",
    reviews: "164",
    time: "30–40 min",
    fee: "GH₵12",
    cuisine: "Chicken • Grills",
    offer: false,
  },
  {
    id: "5",
    name: "Roll'd",
    image: require("../../../assets/images/akrobite-logo.png"),
    rating: "4.4",
    reviews: "210",
    time: "20–30 min",
    fee: "GH₵8",
    cuisine: "Shawarma",
    offer: true,
  },
];

const filters = ["All", "Offers", "Delivery Time", "Rating"] as const;

type RestaurantFilter = (typeof filters)[number];

export default function RestaurantsScreen() {
  const [restaurantData, setRestaurantData] =
    useState<Restaurant[]>(localRestaurants);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<RestaurantFilter>("All");

  useEffect(() => {
    let isMounted = true;

    fetchRestaurants()
      .then((remoteRestaurants) => {
        if (isMounted && remoteRestaurants.length > 0) {
          setRestaurantData(remoteRestaurants);
        }
      })
      .catch((error) => {
        if (isMounted) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Unable to load restaurants.",
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

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
            Restaurants
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
            <Text className="mb-3 text-sm text-textSecondary">
              Showing available restaurants offline.
            </Text>
          ) : (
            <Text className="mb-3 text-sm text-textSecondary">
              {visibleRestaurants.length} restaurants found
            </Text>
          )}

          {/* RESTAURANT CARDS */}
          {visibleRestaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              onPress={() => router.push(`/restaurant/${restaurant.id}`)}
            />
          ))}
        </View>
      </ScrollView>
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
